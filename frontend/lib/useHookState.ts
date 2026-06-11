'use client';

import { useReadContracts } from 'wagmi';
import { HOOK_ADDRESS, hookAbi, CHAIN_ID } from './contracts';
import { TESTNET } from './testnet';
import { fromWad } from './format';

const FNS = ['bedrockNav', 'sedimentNav', 'epochId', 'varAcc', 'epochStart', 'epochDuration'] as const;

/** Live UnistrataHook state (refetched every 30s), falling back to the committed snapshot. */
export function useHookState() {
  const { data, isSuccess } = useReadContracts({
    contracts: FNS.map((functionName) => ({
      address: HOOK_ADDRESS,
      abi: hookAbi,
      functionName,
      chainId: CHAIN_ID,
    })),
    query: { refetchInterval: 30_000 },
  });

  const snap = TESTNET.pool;
  const fallbackSecs = snap.epochLengthH * 3600;
  if (!isSuccess || !data) {
    return { ...snap, epochStart: 0, epochDuration: fallbackSecs, secondsToSettle: fallbackSecs, live: false };
  }

  const ok = (i: number) => Boolean(data[i] && data[i].status === 'success');
  const at = (i: number) => (data[i] && data[i].status === 'success' ? (data[i].result as bigint) : undefined);
  const bedrockNav = Math.round(fromWad(at(0), snap.bedrockNav));
  const sedimentNav = Math.round(fromWad(at(1), snap.sedimentNav));
  const epoch = at(2) !== undefined ? Number(at(2)) : snap.epoch;
  const varAcc = at(3) !== undefined ? Number(at(3)) : snap.varAcc;
  const epochStart = at(4) !== undefined ? Number(at(4)) : 0;
  const epochDuration = at(5) !== undefined ? Number(at(5)) : fallbackSecs;

  // Honest "live": only when the displayed tranche/epoch reads ALL succeeded. On a partial multicall
  // failure some tiles silently show the snapshot fallback, so the badge must NOT claim live.
  const coreLive = ok(0) && ok(1) && ok(2) && ok(3);
  const navLive = ok(0) && ok(1);
  const nowSec = Math.floor(Date.now() / 1000);
  const secondsToSettle = epochStart > 0 ? Math.max(0, epochStart + epochDuration - nowSec) : fallbackSecs;

  return {
    ...snap,
    bedrockNav,
    sedimentNav,
    tvl: navLive ? bedrockNav + sedimentNav : snap.tvl, // keep TVL coherent — never a live+snapshot hybrid
    epoch,
    varAcc,
    epochStart,
    epochDuration,
    secondsToSettle,
    live: coreLive,
  };
}
