// Live Unistrata deployment on Unichain Sepolia (1301). (EIP-2612 redeploy, Jun 2026.)
export const HOOK_ADDRESS = '0x1c92498828ef724e488877cb8df251a406611840' as const;
export const RSC_ADDRESS = '0xac81c63d936b6a751ecdd412c7c956dc70f9313e' as const; // UnistrataReactive on Reactive Lasna (5318007)
export const TOKEN_WETH = '0x7a498c34a8dc3b6502889c21218da0f8696b7bb6' as const; // tWETH, 18 dec
export const TOKEN_USDC = '0x70c598941d7ced513dc01f3775a52cf0e5b47d6e' as const; // tUSDC, 6 dec (numéraire)
export const CHAIN_ID = 1301 as const;

// Block explorers — single source of truth (used by the live feed, tx links, wallet config).
export const EXPLORER = 'https://sepolia.uniscan.xyz' as const; // Unichain Sepolia (1301)
export const REACT_EXPLORER = 'https://lasna.reactscan.net' as const; // Reactive Lasna (5318007)
export const txUrl = (hash: string) => `${EXPLORER}/tx/${hash}`;
export const addrUrl = (addr: string) => `${EXPLORER}/address/${addr}`;

// v4 sorts by address → token0 = lower address. On this deploy tUSDC (0x70c5…) < tWETH (0x7a49…),
// so the sort FLIPPED vs the prior deploy: currency0 = USDC (6 dec), currency1 = WETH (18 dec).
export const TOKEN0 = TOKEN_USDC; // currency0 (USDC, 6 dec)
export const TOKEN1 = TOKEN_WETH; // currency1 (WETH, 18 dec)

// Tranche share tokens (StratumToken, ERC20) — deployed by the hook constructor. Verified on-chain.
export const BEDROCK_TOKEN = '0x27b1a8d9e5cfced9c765ef3c05fbd500834c4c17' as const; // BEDR (senior shares)
export const SEDIMENT_TOKEN = '0xdec08761743beef3a11ebd9f8c16c26f56cf1c50' as const; // SEDI (junior shares)

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
    // EIP-2612 deposit: two ERC20Permit signatures (one per leg) grant the hook a just-in-time allowance,
    // then it deposits and mints. Reverts if the minted shares would be below minSharesOut. No Permit2.
    type: 'function', name: 'depositWithPermit', stateMutability: 'nonpayable',
    inputs: [
      { name: 'isBedrock', type: 'bool' },
      { name: 'amount0Max', type: 'uint256' },
      { name: 'amount1Max', type: 'uint256' },
      { name: 'minSharesOut', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      {
        name: 'sig0', type: 'tuple',
        components: [
          { name: 'v', type: 'uint8' },
          { name: 'r', type: 'bytes32' },
          { name: 's', type: 'bytes32' },
        ],
      },
      {
        name: 'sig1', type: 'tuple',
        components: [
          { name: 'v', type: 'uint8' },
          { name: 'r', type: 'bytes32' },
          { name: 's', type: 'bytes32' },
        ],
      },
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
    // As requestWithdraw, but authorizes the escrow with an EIP-2612 signature on the share token — one tx,
    // no standing approval.
    type: 'function', name: 'requestWithdrawWithPermit', stateMutability: 'nonpayable',
    inputs: [
      { name: 'isBedrock', type: 'bool' },
      { name: 'shares', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' },
    ],
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
  { type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'name', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  // EIP-2612 (ERC20Permit) — gasless approval via signature. nonces() is the sequential per-owner nonce
  // signed into each permit; the EIP-712 domain name is the token's name() with version "1".
  { type: 'function', name: 'nonces', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] },
  {
    type: 'function', name: 'permit', stateMutability: 'nonpayable',
    inputs: [
      { name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }, { name: 'v', type: 'uint8' }, { name: 'r', type: 'bytes32' }, { name: 's', type: 'bytes32' },
    ],
    outputs: [],
  },
  // DemoERC20 — mint is intentionally permissionless (testnet faucet).
  { type: 'function', name: 'mint', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
] as const;
