import { createPublicClient, createWalletClient, http, parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { TOKEN_CONFIG, TOKEN_ABI } from './tokenConfig';

// Create public client with single reliable RPC endpoint
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org', {
    // Add retry configuration
    retryCount: 3,
    retryDelay: 1000,
    // Add timeout
    timeout: 10000,
    // Use proper headers
    fetchOptions: {
      headers: {
        'User-Agent': 'GoodCoin-MiniApp/1.0',
      },
    },
  }),
});

/**
 * Token Service for GoodCoin token operations
 */
export class TokenService {
  private tokenAddress = TOKEN_CONFIG.address;
  private tokenAbi = TOKEN_ABI;
  
  // Cache for reducing RPC calls
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds cache
  
  // Rate limiting
  private lastCallTime = 0;
  private readonly MIN_CALL_INTERVAL = 1000; // 1 second between calls
  
  // Fallback RPC endpoints
  private readonly FALLBACK_RPCS = [
    'https://mainnet.base.org',
    'https://base-mainnet.g.alchemy.com/v2/demo',
    'https://base-mainnet.public.blastapi.io',
  ];

  /**
   * Rate limiting helper
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < this.MIN_CALL_INTERVAL) {
      const waitTime = this.MIN_CALL_INTERVAL - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastCallTime = Date.now();
  }

  /**
   * Cache helper
   */
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cache data
   */
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Safe contract call with error handling and retries
   */
  private async safeContractCall<T>(
    callFn: () => Promise<T>,
    cacheKey?: string,
    fallbackValue?: T
  ): Promise<T> {
    // Check cache first
    if (cacheKey) {
      const cached = this.getCachedData(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    // Apply rate limiting
    await this.rateLimit();

    try {
      const result = await callFn();
      
      // Cache the result
      if (cacheKey) {
        this.setCachedData(cacheKey, result);
      }
      
      return result;
    } catch (error: any) {
      console.error('Contract call failed:', error);
      
      // For any RPC error, immediately return fallback value
      if (error.message?.includes('Failed to fetch') || 
          error.message?.includes('404') || 
          error.message?.includes('not found') ||
          error.message?.includes('HTTP request failed')) {
        console.log('RPC call failed, using fallback value');
        if (fallbackValue !== undefined) {
          return fallbackValue;
        }
      }
      
      // If it's a rate limit error, wait longer and retry once
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        console.log('Rate limit hit, waiting 5 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        try {
          const result = await callFn();
          if (cacheKey) {
            this.setCachedData(cacheKey, result);
          }
          return result;
        } catch (retryError) {
          console.error('Retry also failed:', retryError);
        }
      }
      
      // Return fallback value if available
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
      
      throw error;
    }
  }

  /**
   * Get token balance for a user address
   */
  async getTokenBalance(userAddress: `0x${string}`): Promise<{
    balance: string;
    formattedBalance: string;
    symbol: string;
  }> {
    const cacheKey = `balance_${userAddress}`;
    
    try {
      const result = await this.safeContractCall(
        async () => {
          const [balance, symbol] = await Promise.all([
            publicClient.readContract({
              address: this.tokenAddress,
              abi: this.tokenAbi,
              functionName: 'balanceOf',
              args: [userAddress],
            }),
            publicClient.readContract({
              address: this.tokenAddress,
              abi: this.tokenAbi,
              functionName: 'symbol',
            }),
          ]);

          const formattedBalance = formatUnits(balance, TOKEN_CONFIG.decimals);

          return {
            balance: balance.toString(),
            formattedBalance,
            symbol: symbol as string,
          };
        },
        cacheKey,
        {
          balance: '0',
          formattedBalance: '0',
          symbol: TOKEN_CONFIG.symbol,
        }
      );

      return result;
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return {
        balance: '0',
        formattedBalance: '0',
        symbol: TOKEN_CONFIG.symbol,
      };
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  }> {
    const cacheKey = 'token_info';
    
    try {
      const result = await this.safeContractCall(
        async () => {
          const [name, symbol, decimals, totalSupply] = await Promise.all([
            publicClient.readContract({
              address: this.tokenAddress,
              abi: this.tokenAbi,
              functionName: 'name',
            }),
            publicClient.readContract({
              address: this.tokenAddress,
              abi: this.tokenAbi,
              functionName: 'symbol',
            }),
            publicClient.readContract({
              address: this.tokenAddress,
              abi: this.tokenAbi,
              functionName: 'decimals',
            }),
            publicClient.readContract({
              address: this.tokenAddress,
              abi: this.tokenAbi,
              functionName: 'totalSupply',
            }),
          ]);

          return {
            name: name as string,
            symbol: symbol as string,
            decimals: Number(decimals),
            totalSupply: totalSupply.toString(),
          };
        },
        cacheKey,
        {
          name: TOKEN_CONFIG.name,
          symbol: TOKEN_CONFIG.symbol,
          decimals: TOKEN_CONFIG.decimals,
          totalSupply: '0',
        }
      );

      return result;
    } catch (error) {
      console.error('Error fetching token info:', error);
      return {
        name: TOKEN_CONFIG.name,
        symbol: TOKEN_CONFIG.symbol,
        decimals: TOKEN_CONFIG.decimals,
        totalSupply: '0',
      };
    }
  }

  /**
   * Get ETH balance for a user address
   */
  async getEthBalance(userAddress: `0x${string}`): Promise<string> {
    const cacheKey = `eth_balance_${userAddress}`;
    
    try {
      const result = await this.safeContractCall(
        async () => {
          const balance = await publicClient.getBalance({
            address: userAddress,
          });
          return formatEther(balance);
        },
        cacheKey,
        '0'
      );

      return result;
    } catch (error) {
      console.error('Error fetching ETH balance:', error);
      return '0';
    }
  }

  /**
   * Calculate token amount from ETH (simplified - in real app you'd use DEX pricing)
   */
  calculateTokenAmountFromEth(ethAmount: string, tokenPriceInEth: string = '0.001'): string {
    try {
      const eth = parseFloat(ethAmount);
      const price = parseFloat(tokenPriceInEth);
      const tokenAmount = eth / price;
      return tokenAmount.toString();
    } catch (error) {
      console.error('Error calculating token amount:', error);
      return '0';
    }
  }

  /**
   * Format token amount for display
   */
  formatTokenAmount(amount: string, decimals: number = TOKEN_CONFIG.decimals): string {
    try {
      const formatted = formatUnits(parseUnits(amount, decimals), decimals);
      return parseFloat(formatted).toFixed(4);
    } catch (error) {
      console.error('Error formatting token amount:', error);
      return '0';
    }
  }

  /**
   * Check if user has sufficient token balance
   */
  async hasSufficientBalance(
    userAddress: `0x${string}`,
    requiredAmount: string
  ): Promise<boolean> {
    try {
      const balance = await this.getTokenBalance(userAddress);
      const required = parseUnits(requiredAmount, TOKEN_CONFIG.decimals);
      const userBalance = parseUnits(balance.formattedBalance, TOKEN_CONFIG.decimals);
      
      return userBalance >= required;
    } catch (error) {
      console.error('Error checking balance:', error);
      return false;
    }
  }

  /**
   * Get token allowance for a spender
   */
  async getTokenAllowance(
    ownerAddress: `0x${string}`,
    spenderAddress: `0x${string}`
  ): Promise<string> {
    const cacheKey = `allowance_${ownerAddress}_${spenderAddress}`;
    
    try {
      const result = await this.safeContractCall(
        async () => {
          const allowance = await publicClient.readContract({
            address: this.tokenAddress,
            abi: this.tokenAbi,
            functionName: 'allowance',
            args: [ownerAddress, spenderAddress],
          });

          return formatUnits(allowance, TOKEN_CONFIG.decimals);
        },
        cacheKey,
        '0'
      );

      return result;
    } catch (error) {
      console.error('Error fetching token allowance:', error);
      return '0';
    }
  }

  /**
   * Clear cache (useful for testing or when you want fresh data)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Check if we're in offline mode (RPC unavailable)
   */
  private isOfflineMode(): boolean {
    // Simple check - if we've had multiple recent failures, assume offline
    return false; // For now, always try RPC calls
  }

  /**
   * Get offline fallback data
   */
  private getOfflineFallback(userAddress: `0x${string}`): {
    balance: string;
    formattedBalance: string;
    symbol: string;
  } {
    return {
      balance: '0',
      formattedBalance: '0',
      symbol: TOKEN_CONFIG.symbol,
    };
  }

  /**
   * Test RPC connection
   */
  async testRpcConnection(): Promise<boolean> {
    try {
      await publicClient.getBlockNumber();
      return true;
    } catch (error) {
      console.error('RPC connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const tokenService = new TokenService();
