import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import type { AppKitNetwork } from '@reown/appkit/networks';

// Reown AppKit project id — set NEXT_PUBLIC_REOWN_PROJECT_ID (https://dashboard.reown.com).
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'REPLACE_WITH_REOWN_PROJECT_ID';

const rpc = process.env.NEXT_PUBLIC_UNICHAIN_RPC || 'https://sepolia.unichain.org';

// Origin chain where UnistrataHook is deployed.
export const unichainSepolia: AppKitNetwork = {
  id: 1301,
  name: 'Unichain Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [rpc] } },
  blockExplorers: { default: { name: 'Uniscan', url: 'https://sepolia.uniscan.xyz' } },
  testnet: true,
};

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [unichainSepolia];

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
