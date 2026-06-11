'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { HOOK_ADDRESS, hookAbi, CHAIN_ID } from './contracts';

export type WithdrawReq = {
  id: number;
  isBedrock: boolean;
  shares: number; // share units (18 dec)
  eligibleEpoch: number;
  claimed: boolean;
  eligible: boolean; // claimable now: !claimed && epochId >= eligibleEpoch
};

const REQUESTED_EVENT = hookAbi.find((x) => x.type === 'event' && x.name === 'WithdrawRequested');
const CLAIMED_EVENT = hookAbi.find((x) => x.type === 'event' && x.name === 'WithdrawClaimed');
// The public RPC caps eth_getLogs at ~5k blocks, so scan tip-first in safe chunks (a user's requests
// are recent) instead of one big range that the RPC rejects with a 400.
const CHUNK = 4500n;
const MAX_CHUNKS = 6;

/**
 * The connected user's queued withdrawals, reconstructed from on-chain logs (WithdrawRequested minus
 * WithdrawClaimed), with current eligibility computed against `epochId`. Rescans every 20s; `refetch`
 * forces an immediate reload after a request/claim tx.
 */
export function useWithdrawRequests(user: `0x${string}` | undefined, epochId: number) {
  const client = usePublicClient({ chainId: CHAIN_ID });
  const [requests, setRequests] = useState<WithdrawReq[]>([]);

  const load = useCallback(async () => {
    if (!client || !user) { setRequests([]); return; }
    try {
      const latest = await client.getBlockNumber();
      const reqLogs: unknown[] = [];
      const claimedLogs: unknown[] = [];
      let to = latest;
      for (let i = 0; i < MAX_CHUNKS; i++) {
        const from = to > CHUNK ? to - CHUNK : 0n;
        try {
          const [r, c] = await Promise.all([
            client.getLogs({ address: HOOK_ADDRESS, event: REQUESTED_EVENT as never, args: { user } as never, fromBlock: from, toBlock: to }),
            client.getLogs({ address: HOOK_ADDRESS, event: CLAIMED_EVENT as never, args: { user } as never, fromBlock: from, toBlock: to }),
          ]);
          reqLogs.push(...r); claimedLogs.push(...c);
        } catch { /* this chunk exceeded the RPC cap — skip it, keep scanning */ }
        if (from === 0n) break;
        to = from - 1n;
      }
      const claimedIds = new Set(claimedLogs.map((l) => Number((l as { args: { id: bigint } }).args.id)));
      const reqs: WithdrawReq[] = reqLogs.map((l) => {
        const a = (l as { args: { id: bigint; isBedrock: boolean; shares: bigint; eligibleEpoch: bigint } }).args;
        const id = Number(a.id);
        const eligibleEpoch = Number(a.eligibleEpoch);
        const claimed = claimedIds.has(id);
        return {
          id,
          isBedrock: Boolean(a.isBedrock),
          shares: Number(formatUnits(a.shares, 18)),
          eligibleEpoch,
          claimed,
          eligible: !claimed && epochId >= eligibleEpoch,
        };
      }).sort((x, y) => x.id - y.id);
      setRequests(reqs);
    } catch {
      /* RPC unreachable / range rejected → keep the last known list */
    }
  }, [client, user, epochId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 20_000);
    return () => clearInterval(t);
  }, [load]);

  return { requests, refetch: load };
}
