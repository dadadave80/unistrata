// Live Unistrata deployment on Unichain Sepolia (1301) — see REACTIVE.md. (Permit2 redeploy, Jun 2026.)
export const HOOK_ADDRESS = '0xfc4f1c6aecad1507dd0ec4af4d72f62378c25840' as const;
export const RSC_ADDRESS = '0x3cad51414bbd94e19c47ef47fe2d65f89e467eea' as const; // UnistrataReactive on Reactive Lasna (5318007)
export const TOKEN_WETH = '0x34b4626268da509c69e4cf03b92164b048fb9f8d' as const; // tWETH, 18 dec
export const TOKEN_USDC = '0x5ffa4a8d379cb2471b1d4cdf2f5f2d3eca282dd6' as const; // tUSDC, 6 dec (numéraire)
export const CHAIN_ID = 1301 as const;

// Block explorers — single source of truth (used by the live feed, tx links, wallet config).
export const EXPLORER = 'https://sepolia.uniscan.xyz' as const; // Unichain Sepolia (1301)
export const REACT_EXPLORER = 'https://lasna.reactscan.net' as const; // Reactive Lasna (5318007)
export const txUrl = (hash: string) => `${EXPLORER}/tx/${hash}`;
export const addrUrl = (addr: string) => `${EXPLORER}/address/${addr}`;

// v4 sorts by address → token0 = lower address. tWETH (0x34b4) < tUSDC (0x5ffa).
// Verified on-chain: the hook's boundKey is currency0=WETH(18), currency1=USDC(6).
export const TOKEN0 = TOKEN_WETH; // currency0 (WETH, 18 dec)
export const TOKEN1 = TOKEN_USDC; // currency1 (USDC, 6 dec)

// Tranche share tokens (StratumToken, ERC20) — deployed by the hook constructor. Verified on-chain.
export const BEDROCK_TOKEN = '0x3848b7ab1cb7d33212d28b6cf6eac9f9d65b0b8c' as const; // beWETH (senior shares)
export const SEDIMENT_TOKEN = '0x953636fc36a204dc2bb775fa4ca0195bf748bd0a' as const; // seWETH (junior shares)

// Minimal UnistrataHook ABI — the reads the UI needs + the deposit write.
export const hookAbi = [
  { type: 'function', name: 'bedrockNav', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'sedimentNav', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'epochId', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'varAcc', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'sigma2Ewma', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'bedrockRate', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'epochStart', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'epochDuration', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint64' }] },
  { type: 'function', name: 'gracePeriod', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint64' }] },
  { type: 'function', name: 'totalAssets', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'bedrockCapacityRemaining', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'bedrock', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'sediment', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
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
  {
    // Queue an epoch-locked withdrawal of tranche shares (needs the hook approved for the share token).
    type: 'function', name: 'requestWithdraw', stateMutability: 'nonpayable',
    inputs: [{ name: 'isBedrock', type: 'bool' }, { name: 'shares', type: 'uint256' }],
    outputs: [{ name: 'id', type: 'uint256' }],
  },
  {
    // Claim a queued withdrawal once epochId >= eligibleEpoch.
    type: 'function', name: 'claim', stateMutability: 'nonpayable',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [{ name: 'value', type: 'uint256' }],
  },
  {
    // Per-user queued requests: withdrawRequests(user, index) -> (shares, eligibleEpoch, isBedrock, claimed).
    type: 'function', name: 'withdrawRequests', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }, { name: 'index', type: 'uint256' }],
    outputs: [
      { name: 'shares', type: 'uint128' },
      { name: 'eligibleEpoch', type: 'uint64' },
      { name: 'isBedrock', type: 'bool' },
      { name: 'claimed', type: 'bool' },
    ],
  },
  // --- events (consumed by the live feed via getLogs) ---
  {
    type: 'event', name: 'UnistrataObservation', inputs: [
      { name: 'blockTickDelta', type: 'int24', indexed: false },
      { name: 'varAcc', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event', name: 'Deposit', inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'isBedrock', type: 'bool', indexed: false },
      { name: 'amount0', type: 'uint256', indexed: false },
      { name: 'amount1', type: 'uint256', indexed: false },
      { name: 'value', type: 'uint256', indexed: false },
      { name: 'shares', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event', name: 'EpochSettled', inputs: [
      { name: 'epochId', type: 'uint256', indexed: true },
      { name: 'totalAssets', type: 'uint256', indexed: false },
      { name: 'bedrockNav', type: 'uint256', indexed: false },
      { name: 'sedimentNav', type: 'uint256', indexed: false },
      { name: 'realizedVar', type: 'uint256', indexed: false },
      { name: 'feesEarned', type: 'uint256', indexed: false },
      { name: 'newRate', type: 'uint256', indexed: false },
    ],
  },
  { type: 'event', name: 'EmergencySettled', inputs: [{ name: 'epochId', type: 'uint256', indexed: true }] },
  {
    type: 'event', name: 'WithdrawRequested', inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'isBedrock', type: 'bool', indexed: false },
      { name: 'shares', type: 'uint256', indexed: false },
      { name: 'eligibleEpoch', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event', name: 'WithdrawClaimed', inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
  },
] as const;

export const erc20Abi = [
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  // DemoERC20 — mint is intentionally permissionless (testnet faucet).
  { type: 'function', name: 'mint', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
] as const;
