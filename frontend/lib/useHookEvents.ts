'use client';

import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { HOOK_ADDRESS, hookAbi, CHAIN_ID, EXPLORER } from './contracts';

/** A row in the live on-chain event feed (also the shape EventFeed renders). */
export type FeedEvent = {
  time: string;
  kind: 'emergency' | 'reactive' | 'settle' | 'info';
  epoch: number;
  chain: string;
  tx: string;
  txUrl?: string;
  message: string;
};

// The event ABIs from the hook (used to decode getLogs results).
const EVENT_ABIS = hookAbi.filter((x) => x.type === 'event');

// The public Unichain Sepolia RPC caps eth_getLogs at ~5k blocks per call, so scan tip-first in safe
// chunks (newest events first) up to a bounded depth rather than one big range that the RPC rejects (400).
const CHUNK = 4500n;
const MAX_CHUNKS = 6; // ~27k blocks (~7.5h) of history
const MAX_EVENTS = 28;

function short(hash: string): string {
  return hash.slice(0, 8) + '…' + hash.slice(-4);
}

// Map a decoded hook log → the feed's display shape. Returns null for events we don't surface.
function toFeedEvent(log: { eventName?: string; args?: Record<string, unknown>; blockNumber?: bigint; transactionHash?: string }, baseline = 0): FeedEvent | null {
  const a = (log.args ?? {}) as Record<string, unknown>;
  const tx = log.transactionHash ? short(log.transactionHash) : '—';
  const txUrl = log.transactionHash ? `${EXPLORER}/tx/${log.transactionHash}` : undefined;
  const time = log.blockNumber !== undefined ? `blk ${log.blockNumber}` : 'recent';
  const num = (v: unknown) => (typeof v === 'bigint' ? Number(v) : Number(v ?? 0));
  const usd = (v: unknown) => '$' + Math.round(num(formatUnits((v as bigint) ?? 0n, 18))).toLocaleString();

  switch (log.eventName) {
    case 'EmergencySettled':
      return { time, kind: 'emergency', epoch: num(a.epochId), chain: 'Reactive ⇄ Unichain', tx, txUrl,
        message: `Vol circuit breaker → <span class="em">emergencySettle()</span> closed epoch ${num(a.epochId)} early (EmergencySettled)` };
    case 'EpochSettled':
      return { time, kind: 'settle', epoch: num(a.epochId), chain: 'Unichain Sepolia', tx, txUrl,
        message: `Epoch ${num(a.epochId)} settled — Bedrock ${usd(a.bedrockNav)} · Sediment ${usd(a.sedimentNav)} (<span class="fn">EpochSettled</span>)` };
    case 'UnistrataObservation': {
      // Show varAcc THIS EPOCH (cumulative − epoch baseline) so the feed counts toward the 4M trigger in
      // lockstep with the gauge — not the monotonic all-time accumulator (which dwarfs the trigger).
      const perEpoch = Math.max(0, num(a.varAcc) - baseline);
      return { time, kind: 'info', epoch: 0, chain: 'Unichain Sepolia', tx, txUrl,
        message: `New-block observation → varAcc <span class="em">${perEpoch.toLocaleString()}</span> / 4,000,000 trigger (UnistrataObservation)` };
    }
    case 'Deposit':
      return { time, kind: 'settle', epoch: 0, chain: 'Unichain Sepolia', tx, txUrl,
        message: `Deposit → ${a.isBedrock ? 'Bedrock' : 'Sediment'} ${usd(a.value)} (<span class="fn">${num(a.shares ? formatUnits(a.shares as bigint, 18) : 0).toFixed(0)} shares</span>)` };
    case 'WithdrawRequested':
      return { time, kind: 'info', epoch: num(a.eligibleEpoch), chain: 'Unichain Sepolia', tx, txUrl,
        message: `Withdraw queued from ${a.isBedrock ? 'Bedrock' : 'Sediment'} → eligible epoch ${num(a.eligibleEpoch)} (WithdrawRequested)` };
    case 'WithdrawClaimed':
      return { time, kind: 'settle', epoch: 0, chain: 'Unichain Sepolia', tx, txUrl,
        message: `Withdrawal claimed → ${usd(a.value)} paid out (<span class="fn">WithdrawClaimed</span>)` };
    default:
      return null;
  }
}

/**
 * Live UnistrataHook event feed from on-chain logs (re-scanned every 20s). `events` is always the real
 * on-chain log — never a fabricated fallback; `live` is true once a scan returns ≥1 event. Callers render
 * an honest empty state (not a stale trail) while it's empty.
 */
export function useHookEvents(): { events: FeedEvent[]; live: boolean } {
  const client = usePublicClient({ chainId: CHAIN_ID });
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;

    async function load() {
      try {
        const latest = await client!.getBlockNumber();
        // Per-epoch baseline so observation rows show varAcc THIS epoch (matches the gauge + the 4M trigger),
        // not the monotonic all-time accumulator. Falls back to 0 (shows cumulative) if the read fails.
        let baseline = 0;
        try {
          baseline = Number(await client!.readContract({ address: HOOK_ADDRESS, abi: hookAbi, functionName: 'varAccAtEpochStart' }));
        } catch { /* baseline stays 0 */ }
        const collected: { blockNumber?: bigint }[] = [];
        let to = latest;
        let emptyStreak = 0;
        for (let i = 0; i < MAX_CHUNKS && collected.length < MAX_EVENTS; i++) {
          const from = to > CHUNK ? to - CHUNK : 0n;
          try {
            const logs = await client!.getLogs({ address: HOOK_ADDRESS, events: EVENT_ABIS as never, fromBlock: from, toBlock: to });
            collected.push(...(logs as { blockNumber?: bigint }[]));
            // Stop only after a RUN of empty chunks, so a single empty gap between event clusters doesn't
            // truncate older history (recent demo events cluster near the tip, but don't assume it).
            emptyStreak = logs.length === 0 ? emptyStreak + 1 : 0;
            if (emptyStreak >= 2 && collected.length > 0) break;
          } catch {
            // RPC range/rate cap on this chunk — retry the two halves once before giving up on it, so we
            // recover its events rather than silently dropping the whole range.
            const mid = from + (to - from) / 2n;
            for (const [lo, hi] of [[mid + 1n, to], [from, mid]] as [bigint, bigint][]) {
              try {
                const logs = await client!.getLogs({ address: HOOK_ADDRESS, events: EVENT_ABIS as never, fromBlock: lo, toBlock: hi });
                collected.push(...(logs as { blockNumber?: bigint }[]));
              } catch { /* sub-chunk still failed — skip it */ }
            }
          }
          if (from === 0n) break;
          to = from - 1n;
        }
        if (cancelled) return;
        collected.sort((a, b) => Number((b.blockNumber ?? 0n) - (a.blockNumber ?? 0n))); // newest first
        const mapped = collected
          .map((l) => toFeedEvent(l as never, baseline))
          .filter((e): e is FeedEvent => e !== null)
          .slice(0, MAX_EVENTS);
        // Only surface "live" once we actually have events. An empty (but successful) scan leaves
        // events=[] so the UI shows its honest empty state — never a fabricated trail.
        if (mapped.length > 0) { setEvents(mapped); setLive(true); }
      } catch {
        // Transient failure: keep the last-good feed. We never flip live→false here, so the feed
        // doesn't flicker back to the static trail mid-demo.
      }
    }

    load();
    const t = setInterval(load, 20_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [client]);

  return { events, live };
}
