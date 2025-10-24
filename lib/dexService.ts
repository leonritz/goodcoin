import { createPublicClient, http, parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { TOKEN_CONFIG } from './tokenConfig';

// Uniswap V3 Router ABI (simplified for our use case)
const UNISWAP_V3_ROUTER_ABI = [
  {
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'recipient', type: 'address' },
      { name: 'deadline', type: 'uint256' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMinimum', type: 'uint256' },
      { name: 'sqrtPriceLimitX96', type: 'uint160' },
    ],
    name: 'exactInputSingle',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'fee', type: 'uint24' },
    ],
    name: 'getPool',
    outputs: [{ name: 'pool', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Quoter ABI for getting quotes
const QUOTER_ABI = [
  {
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'sqrtPriceLimitX96', type: 'uint160' },
    ],
    name: 'quoteExactInputSingle',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

/**
 * DEX Service for token swapping functionality
 * Integrates with Uniswap V3 on Base network
 */
export class DexService {
  private routerAddress = TOKEN_CONFIG.dex.routerAddress;
  private quoterAddress = '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a' as `0x${string}`; // Uniswap V3 Quoter on Base
  private wethAddress = TOKEN_CONFIG.dex.wethAddress;

  /**
   * Get quote for swapping ETH to GOOD tokens
   */
  async getEthToTokenQuote(ethAmount: string): Promise<{
    tokenAmount: string;
    priceImpact: number;
    minimumReceived: string;
  }> {
    try {
      const amountIn = parseEther(ethAmount);
      
      // For now, we'll use a simplified calculation
      // In a real implementation, you'd call the Quoter contract
      const estimatedTokenAmount = this.estimateTokenAmount(ethAmount);
      
      // Calculate price impact (simplified)
      const priceImpact = this.calculatePriceImpact(ethAmount, estimatedTokenAmount);
      
      // Calculate minimum received (with 0.5% slippage)
      const minimumReceived = (parseFloat(estimatedTokenAmount) * 0.995).toString();

      return {
        tokenAmount: estimatedTokenAmount,
        priceImpact,
        minimumReceived,
      };
    } catch (error) {
      console.error('Error getting quote:', error);
      throw new Error('Failed to get quote');
    }
  }

  /**
   * Get quote for swapping GOOD tokens to ETH
   */
  async getTokenToEthQuote(tokenAmount: string): Promise<{
    ethAmount: string;
    priceImpact: number;
    minimumReceived: string;
  }> {
    try {
      // For now, we'll use a simplified calculation
      const estimatedEthAmount = this.estimateEthAmount(tokenAmount);
      
      // Calculate price impact (simplified)
      const priceImpact = this.calculatePriceImpact(tokenAmount, estimatedEthAmount);
      
      // Calculate minimum received (with 0.5% slippage)
      const minimumReceived = (parseFloat(estimatedEthAmount) * 0.995).toString();

      return {
        ethAmount: estimatedEthAmount,
        priceImpact,
        minimumReceived,
      };
    } catch (error) {
      console.error('Error getting quote:', error);
      throw new Error('Failed to get quote');
    }
  }

  /**
   * Check if a pool exists for the token pair
   */
  async checkPoolExists(): Promise<boolean> {
    try {
      const poolAddress = await publicClient.readContract({
        address: this.routerAddress,
        abi: UNISWAP_V3_ROUTER_ABI,
        functionName: 'getPool',
        args: [this.wethAddress, TOKEN_CONFIG.address, 3000], // 0.3% fee tier
      });

      return poolAddress !== '0x0000000000000000000000000000000000000000';
    } catch (error) {
      console.error('Error checking pool:', error);
      return false;
    }
  }

  /**
   * Get current token price in ETH
   */
  async getTokenPrice(): Promise<string> {
    try {
      // For now, return a fixed price
      // In a real implementation, you'd get this from the DEX
      return '0.001'; // 1 GOOD = 0.001 ETH
    } catch (error) {
      console.error('Error getting token price:', error);
      return '0.001';
    }
  }

  /**
   * Estimate token amount from ETH (simplified calculation)
   */
  private estimateTokenAmount(ethAmount: string): string {
    const eth = parseFloat(ethAmount);
    const tokenPrice = 0.001; // 1 GOOD = 0.001 ETH
    const tokenAmount = eth / tokenPrice;
    return tokenAmount.toString();
  }

  /**
   * Estimate ETH amount from tokens (simplified calculation)
   */
  private estimateEthAmount(tokenAmount: string): string {
    const tokens = parseFloat(tokenAmount);
    const tokenPrice = 0.001; // 1 GOOD = 0.001 ETH
    const ethAmount = tokens * tokenPrice;
    return ethAmount.toString();
  }

  /**
   * Calculate price impact (simplified)
   */
  private calculatePriceImpact(amountIn: string, amountOut: string): number {
    // Simplified price impact calculation
    // In a real implementation, you'd calculate this based on pool liquidity
    const amountInNum = parseFloat(amountIn);
    const amountOutNum = parseFloat(amountOut);
    
    if (amountInNum === 0) return 0;
    
    // Simulate price impact based on trade size
    const impact = Math.min(amountInNum * 0.01, 5); // Max 5% impact
    return impact;
  }

  /**
   * Get supported tokens for swapping
   */
  getSupportedTokens(): Array<{
    address: `0x${string}`;
    symbol: string;
    name: string;
    decimals: number;
  }> {
    return [
      {
        address: this.wethAddress,
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
      },
      {
        address: TOKEN_CONFIG.address,
        symbol: TOKEN_CONFIG.symbol,
        name: TOKEN_CONFIG.name,
        decimals: TOKEN_CONFIG.decimals,
      },
    ];
  }

  /**
   * Get swap route information
   */
  async getSwapRoute(
    tokenIn: `0x${string}`,
    tokenOut: `0x${string}`,
    amountIn: string
  ): Promise<{
    route: Array<`0x${string}`>;
    fees: Array<number>;
    estimatedGas: string;
  }> {
    try {
      // For now, return a direct route
      // In a real implementation, you'd use a routing service
      return {
        route: [tokenIn, tokenOut],
        fees: [3000], // 0.3% fee
        estimatedGas: '150000', // Estimated gas for swap
      };
    } catch (error) {
      console.error('Error getting swap route:', error);
      throw new Error('Failed to get swap route');
    }
  }
}

// Export singleton instance
export const dexService = new DexService();
