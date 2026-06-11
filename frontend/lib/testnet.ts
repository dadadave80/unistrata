// Verified-run reference snapshot + spike event trail (Unichain Sepolia / Reactive Lasna).
// Fallback ONLY: live reads (useHookState) + the live on-chain feed (useHookEvents) override these
// whenever the RPC is reachable. The hashes below are the real, verified emergency-settle trail on the
// fresh hook (epoch 0→1), so even the fallback links resolve to real transactions.
import { HOOK_ADDRESS, RSC_ADDRESS, TOKEN_WETH, TOKEN_USDC, txUrl, REACT_EXPLORER } from './contracts';

export type FeedEvent = {
  time: string;
  kind: 'emergency' | 'reactive' | 'settle' | 'info';
  epoch: number;
  chain: string;
  tx: string;
  txUrl?: string; // full explorer URL for the tx (so the link resolves to the real transaction)
  message: string; // may contain <span class="em|fn"> emphasis
};

export const TESTNET = {
  addresses: { hook: HOOK_ADDRESS, rsc: RSC_ADDRESS, weth: TOKEN_WETH, usdc: TOKEN_USDC },
  chains: { origin: 'Unichain Sepolia 1301', reactive: 'Reactive Lasna 5318007' },
  pool: {
    pair: 'tWETH / tUSDC',
    bedrockNav: 12000, // hook.bedrockNav() / 1e18 (verified emergency-settle reference)
    sedimentNav: 10624, // hook.sedimentNav() / 1e18 (absorbed the spike, kept fees)
    tvl: 22624,
    epoch: 1, // advanced 0→1 by the emergency settlement
    epochLengthH: 24,
    varAcc: 6_000_000, // realized-variance accumulator at the spike
    spikeThreshold: 4_000_000, // RSC emergency trigger — varAcc crossed this
    coupon: 0, // bedrockRate() — high crash variance floors the coupon at rMin
  },
  // verified spike circuit-breaker trail on the fresh hook (newest first); see REACTIVE.md. Real txns.
  events: [
    { time: 'blk 54296205', kind: 'emergency', epoch: 1, chain: 'Reactive ⇄ Unichain',
      tx: '0x006a1a…5cd3', txUrl: txUrl('0x006a1a8c805304a481ed47055c5ee93f2e9ee313e4ed17d6ff0cff48b54f5cd3'),
      message: 'Vol spike → <span class="em">emergencySettle()</span> closed epoch 0 early, rolled to epoch 1 (EmergencySettled + EpochSettled)' },
    { time: 'Lasna', kind: 'reactive', epoch: 0, chain: 'Reactive Lasna',
      tx: 'RSC 0xac81c6…', txUrl: `${REACT_EXPLORER}/address/${RSC_ADDRESS}`,
      message: 'Reactive Network <span class="fn">react()</span> fired → Callback(emergencySettle) emitted (Reactscan)' },
    { time: 'blk 54296197', kind: 'info', epoch: 0, chain: 'Unichain Sepolia',
      tx: '0xf096b8…e52d', txUrl: txUrl('0xf096b8cf17dad9f69e7ef337c7b1598e6760fa85b82609d10688f7adeae2e52d'),
      message: 'varAcc <span class="em">6,000,000</span> — well past the 4,000,000 trigger → UnistrataObservation' },
    { time: 'blk 54296194', kind: 'info', epoch: 0, chain: 'Unichain Sepolia',
      tx: '0xe241fd…ce04b', txUrl: txUrl('0xe241fde6b6fc0abc4bdf9004a5ee14e89990567f1256bf6ae2304e32003ce04b'),
      message: 'varAcc <span class="em">4,000,000</span> — first cross of the emergency trigger → UnistrataObservation' },
    { time: 'blk 54296142', kind: 'settle', epoch: 0, chain: 'Unichain Sepolia',
      tx: '0xe34f63…5eb1', txUrl: txUrl('0xe34f6331109251e9f32c4e2996a46c634b8596f52da43ec79f19cc11f9465eb1'),
      message: 'Deposit → Bedrock $12,000 (seed liquidity)' },
    { time: 'blk 54296142', kind: 'settle', epoch: 0, chain: 'Unichain Sepolia',
      tx: '0x256b1a…de2d', txUrl: txUrl('0x256b1a8d87848e2f016aabf86dc7450dcaa4e84aca6f864cfc76650f8fdbde2d'),
      message: 'Deposit → Sediment $12,000 (first-loss buffer)' },
  ] as FeedEvent[],
};

export type TestnetPool = typeof TESTNET.pool;
