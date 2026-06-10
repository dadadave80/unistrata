// Permit2 batch SignatureTransfer helper for the Deposit screen.
//
// The user grants a one-time allowance to the canonical, audited Permit2 (never to the hook).
// Each deposit is then a fresh EIP-712 signature naming the EXACT amounts, the hook as spender,
// a unique nonce, and a deadline — so nothing moves without an explicit, bounded, expiring sig.
import type { Address } from 'viem';

// Canonical Permit2 — same address on every chain (verified live on Unichain Sepolia / 1301).
export const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3' as const;

// EIP-712 types for ISignatureTransfer.PermitBatchTransferFrom. The signed witness carries
// `spender`; the on-chain calldata struct omits it (Permit2 derives it from msg.sender = the hook).
export const PERMIT2_BATCH_TYPES = {
  TokenPermissions: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
  PermitBatchTransferFrom: [
    { name: 'permitted', type: 'TokenPermissions[]' },
    { name: 'spender', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const;

export interface TokenPermission {
  token: Address;
  amount: bigint;
}

export interface PermitBatch {
  // The EIP-712 payload to pass to signTypedData.
  domain: { name: 'Permit2'; chainId: number; verifyingContract: Address };
  types: typeof PERMIT2_BATCH_TYPES;
  primaryType: 'PermitBatchTransferFrom';
  message: {
    permitted: TokenPermission[];
    spender: Address;
    nonce: bigint;
    deadline: bigint;
  };
  // The struct passed to depositWithPermit (no spender — derived from msg.sender on-chain).
  permitStruct: {
    permitted: TokenPermission[];
    nonce: bigint;
    deadline: bigint;
  };
}

// Permit2 uses unordered nonces (a 256-bit value indexing a bitmap). A random 256-bit nonce makes
// collision negligible and lets a user sign concurrent permits without sequencing.
export function randomNonce(): bigint {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  return n;
}

export function buildPermitBatch(opts: {
  token0: Address;
  amount0Max: bigint;
  token1: Address;
  amount1Max: bigint;
  spender: Address; // the hook
  chainId: number;
  deadlineSeconds?: number;
}): PermitBatch {
  const permitted: TokenPermission[] = [
    { token: opts.token0, amount: opts.amount0Max },
    { token: opts.token1, amount: opts.amount1Max },
  ];
  const nonce = randomNonce();
  const deadline = BigInt(Math.floor(Date.now() / 1000) + (opts.deadlineSeconds ?? 1800));
  return {
    domain: { name: 'Permit2', chainId: opts.chainId, verifyingContract: PERMIT2_ADDRESS },
    types: PERMIT2_BATCH_TYPES,
    primaryType: 'PermitBatchTransferFrom',
    message: { permitted, spender: opts.spender, nonce, deadline },
    permitStruct: { permitted, nonce, deadline },
  };
}
