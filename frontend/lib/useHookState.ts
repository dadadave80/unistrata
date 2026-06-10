'use client';

import { useReadContracts } from 'wagmi';
import { HOOK_ADDRESS, hookAbi, CHAIN_ID } from './contracts';
import { TESTNET } from './testnet';
import { fromWad } from './format';

const FNS = ['bedrockNav', 'sedimentNav', 'epochId', 'varAcc'] as const;

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
  if (!isSuccess || !data) return { ...snap, live: false as const };

  const at = (i: number) => (data[i] && data[i].status === 'success' ? (data[i].result as bigint) : undefined);
  const bedrockNav = Math.round(fromWad(at(0), snap.bedrockNav));
  const sedimentNav = Math.round(fromWad(at(1), snap.sedimentNav));
  const epoch = at(2) !== undefined ? Number(at(2)) : snap.epoch;
  const varAcc = at(3) !== undefined ? Number(at(3)) : snap.varAcc;

  return { ...snap, bedrockNav, sedimentNav, tvl: bedrockNav + sedimentNav, epoch, varAcc, live: true as const };
}
