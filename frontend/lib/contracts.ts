// Live Unistrata deployment on Unichain Sepolia (1301) — see REACTIVE.md.
export const HOOK_ADDRESS = '0x721480297Fbe8fb1FD72FDab3887D87e59Dcd840' as const;
export const RSC_ADDRESS = '0x3d156B6E1568A24Cd6977c9FE29F53CF5D741d34' as const;
export const TOKEN_WETH = '0x911EcAEde6A8AE982851000C019b063A8688d9DB' as const;
export const TOKEN_USDC = '0x4C63d215C51B82A401Bb11236349d7Ef12F1B3B4' as const;
export const CHAIN_ID = 1301 as const;

// v4 sorts by address → token0 = lower address. tUSDC (0x4C63) < tWETH (0x911E).
export const TOKEN0 = TOKEN_USDC; // currency0
export const TOKEN1 = TOKEN_WETH; // currency1

// Minimal UnistrataHook ABI — the reads the UI needs + the deposit write.
export const hookAbi = [
  { type: 'function', name: 'bedrockNav', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'sedimentNav', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'epochId', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'varAcc', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'sigma2Ewma', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'bedrockRate', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  {
    type: 'function', name: 'deposit', stateMutability: 'nonpayable',
    inputs: [
      { name: 'isBedrock', type: 'bool' },
      { name: 'amount0Max', type: 'uint256' },
      { name: 'amount1Max', type: 'uint256' },
    ],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
  {
    // Permit2 path — caller signs a batch transfer; the hook pulls exact amounts, deposits, refunds the rest.
    type: 'function', name: 'depositWithPermit', stateMutability: 'nonpayable',
    inputs: [
      { name: 'isBedrock', type: 'bool' },
      {
        name: 'permit', type: 'tuple',
        components: [
          {
            name: 'permitted', type: 'tuple[]',
            components: [
              { name: 'token', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
          },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
] as const;

export const erc20Abi = [
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  // DemoERC20 — mint is intentionally permissionless (testnet faucet).
  { type: 'function', name: 'mint', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
] as const;
