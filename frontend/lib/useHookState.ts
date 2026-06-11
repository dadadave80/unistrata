'use client';

import { useReadContracts } from 'wagmi';
import { HOOK_ADDRESS, hookAbi, CHAIN_ID } from './contracts';
import { fromWad } from './format';

const FNS = ['bedrockNav', 'sedimentNav', 'epochId', 'varAcc', 'epochStart', 'epochDuration', 'varAccAtEpochStart'] as const;

// The RSC's emergency trigger lives on the UnistrataReactive contract (Lasna), not the hook — it is a fixed
// protocol constant, displayed for context, not a fabricated stand-in for a missing live read.
const SPIKE_THRESHOLD = 4_000_000;

export type HookState = {
  bedrockNav: number;
  sedimentNav: number;
  tvl: number;
  epoch: number;
  varAcc: number; // cumulative accumulator (monotonic; never reset on-chain)
  varAccEpoch: number; // realized variance THIS epoch (varAcc − varAccAtEpochStart) — what the RSC triggers on
  epochStart: number;
  epochDuration: number;
  secondsToSettle: number;
  spikeThreshold: number;
  live: boolean;
};

// Honest "not live" state: zeros + live=false. No snapshot/fabricated values — the UI shows an explicit
// "awaiting live data" state instead of stale numbers.
const NOT_LIVE: HookState = {
  bedrockNav: 0,
  sedimentNav: 0,
  tvl: 0,
  epoch: 0,
  varAcc: 0,
  varAccEpoch: 0,
  epochStart: 0,
  epochDuration: 0,
  secondsToSettle: 0,
  spikeThreshold: SPIKE_THRESHOLD,
  live: false,
};

/**
 * Live UnistrataHook state (refetched every 30s) — live data only, no fabricated fallback. Returns
 * NOT_LIVE (zeros, live=false) until the core reads (both NAVs, epoch, varAcc) all succeed, so the UI can
 * show an honest "awaiting live data / RPC unreachable" state rather than stale numbers.
 */
export function useHookState(): HookState {
  const { data, isSuccess } = useReadContracts({
    contracts: FNS.map((functionName) => ({
      address: HOOK_ADDRESS,
      abi: hookAbi,
      functionName,
      chainId: CHAIN_ID,
    })),
    query: { refetchInterval: 30_000 },
  });

  if (!isSuccess || !data) return NOT_LIVE;

  const ok = (i: number) => Boolean(data[i] && data[i].status === 'success');
  const at = (i: number) => (ok(i) ? (data[i].result as bigint) : undefined);

  // Require ALL displayed core reads to succeed before claiming live — never a live+missing hybrid.
  if (!(ok(0) && ok(1) && ok(2) && ok(3))) return NOT_LIVE;

  const bedrockNav = Math.round(fromWad(at(0)));
  const sedimentNav = Math.round(fromWad(at(1)));
  const epoch = Number(at(2));
  const varAcc = Number(at(3));
  // Per-epoch realized variance = cumulative varAcc − the snapshot taken at epoch start. This (not raw
  // cumulative varAcc) is what the RSC's emergency trigger watches, and it resets at each settlement. If
  // the baseline read is missing, fall back to 0 (understate) rather than the cumulative value (overstate).
  const varAccEpoch = at(6) !== undefined ? Math.max(0, varAcc - Number(at(6))) : 0;
  const epochStart = at(4) !== undefined ? Number(at(4)) : 0;
  const epochDuration = at(5) !== undefined ? Number(at(5)) : 0;
  const nowSec = Math.floor(Date.now() / 1000);
  const secondsToSettle =
    epochStart > 0 && epochDuration > 0 ? Math.max(0, epochStart + epochDuration - nowSec) : 0;

  return {
    bedrockNav,
    sedimentNav,
    tvl: bedrockNav + sedimentNav,
    epoch,
    varAcc,
    varAccEpoch,
    epochStart,
    epochDuration,
    secondsToSettle,
    spikeThreshold: SPIKE_THRESHOLD,
    live: true,
  };
}
