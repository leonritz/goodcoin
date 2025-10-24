/**
 * GoodCoin Token Configuration
 * Contract deployed on Base network
 */
export const TOKEN_CONFIG = {
  // Token contract details
  address: '0x17d25b0F2Bd117af4e0282F6A82428d44605bb07' as `0x${string}`,
  symbol: 'GOOD',
  name: 'GoodCoin',
  decimals: 18,
  
  // Deployer/creator address
  deployer: '0x942E4d7638f80E45938Fc216707D6d85Eb3Bf329' as `0x${string}`,
  
  // Base network details
  chainId: 8453, // Base mainnet
  chainName: 'Base',
  
  // Token purchase configuration
  purchase: {
    // Minimum purchase amount (in ETH)
    minEthAmount: '0.001',
    // Maximum purchase amount (in ETH) - optional
    maxEthAmount: '10',
    // Default purchase amount (in ETH)
    defaultEthAmount: '0.01',
  },
  
  // DEX configuration for token swaps
  dex: {
    // Uniswap V3 on Base
    routerAddress: '0x2626664c2603336E57B271c5C0b26F421741e481' as `0x${string}`,
    // WETH address on Base
    wethAddress: '0x4200000000000000000000000000000000000006' as `0x${string}`,
  },
} as const;

// Token ABI for ERC20 functions
export const TOKEN_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
