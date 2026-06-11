import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { CHAIN_ID, EXPLORER } from '@/lib/contracts';

// Reown AppKit project id — set NEXT_PUBLIC_REOWN_PROJECT_ID (https://dashboard.reown.com).
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'REPLACE_WITH_REOWN_PROJECT_ID';

const rpc = process.env.NEXT_PUBLIC_UNICHAIN_RPC || 'https://sepolia.unichain.org';

// Origin chain where UnistrataHook is deployed.
export const unichainSepolia: AppKitNetwork = {
  id: CHAIN_ID,
  name: 'Unichain Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [rpc] } },
  blockExplorers: { default: { name: 'Uniscan', url: EXPLORER } },
  testnet: true,
};

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [unichainSepolia];

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
  // No transport override on purpose: Reown's default blockchain-API proxy serves both eth_call AND
  // the chunked getLogs feed (it accepts our ~5k-block ranges). A pinned Alchemy free-tier transport
  // was tried and reverted — its eth_getLogs is capped at 10 blocks, which breaks the live feed.
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
