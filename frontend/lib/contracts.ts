// Live Unistrata deployment on Unichain Sepolia (1301) — see REACTIVE.md. (Permit2 redeploy, Jun 2026.)
export const HOOK_ADDRESS = '0xfc4f1c6aecad1507dd0ec4af4d72f62378c25840' as const;
export const RSC_ADDRESS = '0x3cad51414bbd94e19c47ef47fe2d65f89e467eea' as const; // UnistrataReactive on Reactive Lasna (5318007)
export const TOKEN_WETH = '0x34b4626268da509c69e4cf03b92164b048fb9f8d' as const; // tWETH, 18 dec
export const TOKEN_USDC = '0x5ffa4a8d379cb2471b1d4cdf2f5f2d3eca282dd6' as const; // tUSDC, 6 dec (numéraire)
export const CHAIN_ID = 1301 as const;

// v4 sorts by address → token0 = lower address. tWETH (0x34b4) < tUSDC (0x5ffa).
// Verified on-chain: the hook's boundKey is currency0=WETH(18), currency1=USDC(6).
export const TOKEN0 = TOKEN_WETH; // currency0 (WETH, 18 dec)
export const TOKEN1 = TOKEN_USDC; // currency1 (USDC, 6 dec)

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
