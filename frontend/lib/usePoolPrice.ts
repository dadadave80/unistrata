'use client';

import { useReadContract } from 'wagmi';
import { keccak256, encodeAbiParameters, encodePacked } from 'viem';
import { TOKEN0, TOKEN1, TOKEN_WETH, HOOK_ADDRESS, CHAIN_ID } from './contracts';

// Canonical Uniswap v4 PoolManager on Unichain Sepolia (1301) — the pool the hook is bound to lives here.
const POOL_MANAGER = '0x00B036B58a818B1BC34d502D3fE730Db729e62AC' as const;
const POOLS_SLOT = 6n; // v4-core StateLibrary: `mapping(PoolId => Pool.State) _pools` storage slot
const POOL_FEE = 3000;
const POOL_TICK_SPACING = 60;

const extsloadAbi = [
  { type: 'function', name: 'extsload', stateMutability: 'view', inputs: [{ name: 'slot', type: 'bytes32' }], outputs: [{ type: 'bytes32' }] },
] as const;

// poolId = keccak256(abi.encode(PoolKey)); slot0 lives at keccak256(poolId . POOLS_SLOT) in the PoolManager.
const POOL_ID = keccak256(
  encodeAbiParameters(
    [{
      type: 'tuple',
      components: [
        { name: 'currency0', type: 'address' },
        { name: 'currency1', type: 'address' },
        { name: 'fee', type: 'uint24' },
        { name: 'tickSpacing', type: 'int24' },
        { name: 'hooks', type: 'address' },
      ],
    }],
    [{ currency0: TOKEN0, currency1: TOKEN1, fee: POOL_FEE, tickSpacing: POOL_TICK_SPACING, hooks: HOOK_ADDRESS }],
  ),
);
const SLOT0_SLOT = keccak256(encodePacked(['bytes32', 'uint256'], [POOL_ID, POOLS_SLOT]));

const WETH_IS_TOKEN0 = (TOKEN0 as string).toLowerCase() === (TOKEN_WETH as string).toLowerCase();

/**
 * Live pool price in tUSDC per tWETH, read straight from the v4 PoolManager's slot0 (sqrtPriceX96) — no
 * oracle, no hardcoded constant. Returns undefined while loading or if the read looks implausible, so
 * callers can fall back. Works for either address sort (WETH as token0 OR token1), derived from TOKEN0.
 */
export function usePoolPrice(): number | undefined {
  const { data } = useReadContract({
    address: POOL_MANAGER,
    abi: extsloadAbi,
    functionName: 'extsload',
    args: [SLOT0_SLOT],
    chainId: CHAIN_ID,
    query: { refetchInterval: 30_000 },
  });

  if (!data) return undefined;
  const sqrtPriceX96 = BigInt(data) & ((1n << 160n) - 1n); // low 160 bits of the packed slot0
  if (sqrtPriceX96 === 0n) return undefined;

  // rawPrice = (sqrtPriceX96 / 2^96)^2 = token1 per token0 (raw units). We want tUSDC per tWETH, and WETH
  // may be token0 OR token1 depending on the address sort, so handle both. Carry an extra 1e6 of integer
  // precision through the division, then divide it back out.
  const sq = sqrtPriceX96 * sqrtPriceX96;
  const Q192 = 1n << 192n;
  const scaled = WETH_IS_TOKEN0
    ? (sq * 10n ** 18n) / Q192 // USDC(token1,6) per WETH(token0,18) = rawPrice · 10^(18−6)
    : (10n ** 18n * Q192) / sq; // USDC(token0,6) per WETH(token1,18) = 10^(18−6) / rawPrice
  const price = Number(scaled) / 1e6;

  // Sanity-bound: a mis-decoded read should fall back to the caller's default, never misprice a deposit.
  if (!Number.isFinite(price) || price < 1 || price > 1e9) return undefined;
  return price;
}
