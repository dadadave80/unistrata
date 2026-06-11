// Verified-run reference snapshot + spike event trail (Unichain Sepolia / Reactive Lasna).
// These numbers/hashes are from a verified on-chain run of the (identical-logic) prior deploy and serve
// ONLY as a fallback: live reads (useHookState) override them whenever the RPC is reachable, so against
// the freshly redeployed hook the UI shows its true state (epoch 0 until the 04/05/06 demo is re-run).
import { HOOK_ADDRESS, RSC_ADDRESS, TOKEN_WETH, TOKEN_USDC } from './contracts';

export type FeedEvent = {
  time: string;
  kind: 'emergency' | 'reactive' | 'settle' | 'info';
  epoch: number;
  chain: string;
  tx: string;
  message: string; // may contain <span class="em|fn"> emphasis
};

export const TESTNET = {
  addresses: { hook: HOOK_ADDRESS, rsc: RSC_ADDRESS, weth: TOKEN_WETH, usdc: TOKEN_USDC },
  chains: { origin: 'Unichain Sepolia 1301', reactive: 'Reactive Lasna 5318007' },
  pool: {
    pair: 'tWETH / tUSDC',
    bedrockNav: 12000, // hook.bedrockNav() / 1e18
    sedimentNav: 13510, // hook.sedimentNav() / 1e18 (grew — Sediment kept the swap fees)
    tvl: 25510,
    epoch: 1, // advanced 0→1 by the emergency settlement
    epochLengthH: 24,
    varAcc: 6_000_000, // realized-variance accumulator
    spikeThreshold: 4_000_000, // RSC emergency trigger — varAcc crossed this
    coupon: 0, // bedrockRate() — epoch 0 had no prior variance to price from
  },
  // verified spike circuit-breaker trail (newest first); see REACTIVE.md
  events: [
    { time: 'blk 54247954', kind: 'emergency', epoch: 1, chain: 'Reactive ⇄ Unichain', tx: '0x4faab03f…d56b0',
      message: 'Vol spike → <span class="em">emergencySettle()</span> executed; epoch 0 closed early, rolled to epoch 1 (EmergencySettled + EpochSettled)' },
    { time: 'Lasna', kind: 'reactive', epoch: 0, chain: 'Reactive Lasna', tx: 'RSC 0x3d156B…',
      message: 'Reactive Network <span class="fn">react()</span> fired → Callback(emergencySettle) emitted (1 callback, Reactscan)' },
    { time: 'blk 54247942', kind: 'info', epoch: 0, chain: 'Unichain Sepolia', tx: '0xe07d6c49…',
      message: 'varAcc <span class="em">6,000,000</span> crossed the 4,000,000 emergency trigger → UnistrataObservation emitted' },
    { time: 'deploy', kind: 'reactive', epoch: 0, chain: 'Reactive Lasna', tx: '0xb6f7239e…',
      message: 'RSC subscribed → CRON heartbeat + UnistrataObservation (<span class="fn">2 Subscribe events, 0 failed</span>)' },
    { time: 'setup', kind: 'settle', epoch: 0, chain: 'Unichain Sepolia', tx: '0xb5552794…',
      message: 'Funded hook + RSC via callback proxy (both 0x1) → deposits to Bedrock + Sediment' },
  ] as FeedEvent[],
};

export type TestnetPool = typeof TESTNET.pool;
