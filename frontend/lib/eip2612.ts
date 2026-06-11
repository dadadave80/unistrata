// EIP-2612 (ERC20Permit) helpers for the Deposit and Withdraw screens.
//
// The hook no longer depends on Permit2. Approvals are now native EIP-2612 signatures on the tokens
// themselves: a deposit signs one permit per underlying leg (tWETH + tUSDC) granting the hook a
// just-in-time allowance; a withdraw signs one permit on the tranche share token (BEDR/SEDI). Nothing
// moves without an explicit, exact-amount, deadline-bounded signature, and no standing approval is left
// (the hook's try-permit-then-allowance path also makes a front-run of the signature a no-op).
import { parseSignature, type Address } from 'viem';

// EIP-712 types for ERC-2612 `permit`. Field order MUST match the on-chain PERMIT_TYPEHASH:
// keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)").
export const EIP2612_PERMIT_TYPES = {
  Permit: [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const;

export interface Eip2612Permit {
  domain: { name: string; version: '1'; chainId: number; verifyingContract: Address };
  types: typeof EIP2612_PERMIT_TYPES;
  primaryType: 'Permit';
  message: { owner: Address; spender: Address; value: bigint; nonce: bigint; deadline: bigint };
}

// A default 30-minute permit deadline from now (seconds).
export function permitDeadline(seconds = 1800): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + seconds);
}

// Build the EIP-712 payload for a single token's EIP-2612 permit.
// `tokenName` MUST equal the name the token passed to ERC20Permit(name_) — read it on-chain (name())
// rather than hardcoding, so a redeploy can't silently desync the domain and break verification.
// `version` is the OZ EIP712 default "1". `nonce` MUST be the token's current nonces(owner).
export function buildErc20Permit(opts: {
  tokenName: string;
  token: Address;
  chainId: number;
  owner: Address;
  spender: Address; // the hook
  value: bigint;
  nonce: bigint;
  deadline: bigint;
}): Eip2612Permit {
  return {
    domain: { name: opts.tokenName, version: '1', chainId: opts.chainId, verifyingContract: opts.token },
    types: EIP2612_PERMIT_TYPES,
    primaryType: 'Permit',
    message: {
      owner: opts.owner,
      spender: opts.spender,
      value: opts.value,
      nonce: opts.nonce,
      deadline: opts.deadline,
    },
  };
}

// Split a 65-byte signature into the (v, r, s) the on-chain OZ v5 `permit(...,v,r,s)` expects.
// Normalizes EIP-2098 compact sigs (yParity → 27/28) so v is always a legacy recovery id.
export function splitSig(signature: `0x${string}`): { v: number; r: `0x${string}`; s: `0x${string}` } {
  const sig = parseSignature(signature);
  const v = sig.v !== undefined ? Number(sig.v) : 27 + sig.yParity;
  return { v, r: sig.r, s: sig.s };
}
