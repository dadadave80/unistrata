export function fmtUsd(n: number, dp = 0): string {
  if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e3) return '$' + (n / 1e3).toFixed(dp) + 'K';
  return '$' + n.toFixed(dp);
}

export function shortAddr(a: string): string {
  return a.slice(0, 6) + '…' + a.slice(-4);
}

// WAD (1e18) string/bigint → number (for display $ values; precision-safe enough for the UI).
export function fromWad(v: bigint | string | undefined, fallback = 0): number {
  if (v === undefined) return fallback;
  try {
    return Number(BigInt(v)) / 1e18;
  } catch {
    return fallback;
  }
}
