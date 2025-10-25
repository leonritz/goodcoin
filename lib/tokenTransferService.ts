import { parseUnits } from 'viem';
import { TOKEN_CONFIG, TOKEN_ABI } from './tokenConfig';

export class TokenTransferService {
  /**
   * Transfer GOOD tokens from one address to another using connected wallet
   * This uses the wallet's writeContract function to sign the transaction
   */
  async transferTokens(
    toAddress: `0x${string}`,
    amount: string,
    writeContract: (config: {
      address: `0x${string}`;
      abi: unknown[];
      functionName: string;
      args: unknown[];
    }) => Promise<`0x${string}`>
  ): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    try {
      // Parse the amount to the correct decimals (18 for GOOD token)
      const amountInWei = parseUnits(amount, TOKEN_CONFIG.decimals);
      
      console.log('Transferring tokens:', {
        to: toAddress,
        amount,
        amountInWei: amountInWei.toString(),
      });

      // Call the transfer function on the ERC20 token contract
      const txHash = await writeContract({
        address: TOKEN_CONFIG.address,
        abi: TOKEN_ABI,
        functionName: 'transfer',
        args: [toAddress, amountInWei],
      });
      
      return {
        success: true,
        txHash: txHash as string,
      };
    } catch (error) {
      console.error('Error transferring tokens:', error);
      
      // Handle specific errors
      const errorMessage = error instanceof Error ? error.message : '';
      
      if (errorMessage.includes('User rejected')) {
        return {
          success: false,
          error: 'Transaction was rejected. Please approve the transaction in your wallet.',
        };
      }
      
      if (errorMessage.includes('insufficient funds')) {
        return {
          success: false,
          error: 'Insufficient funds for gas fees.',
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transfer failed',
      };
    }
  }

  /**
   * Check if a user has sufficient token balance
   */
  async checkTokenBalance(
    address: `0x${string}`,
    requiredAmount: string
  ): Promise<{
    hasBalance: boolean;
    currentBalance: string;
    requiredAmount: string;
  }> {
    try {
      // For now, return a simulated check
      // In reality, you'd call the token contract's balanceOf function
      const simulatedBalance = '1000'; // Simulated balance
      const hasBalance = parseFloat(simulatedBalance) >= parseFloat(requiredAmount);
      
      return {
        hasBalance,
        currentBalance: simulatedBalance,
        requiredAmount,
      };
    } catch (error) {
      console.error('Error checking token balance:', error);
      return {
        hasBalance: false,
        currentBalance: '0',
        requiredAmount,
      };
    }
  }

  /**
   * Get the Uniswap URL for buying tokens if user doesn't have enough
   */
  getBuyTokensUrl(amount?: string): string {
    const baseUrl = 'https://app.uniswap.org/#/swap';
    const params = new URLSearchParams({
      chain: 'base',
      inputCurrency: 'ETH',
      outputCurrency: '0x17d25b0F2Bd117af4e0282F6A82428d44605bb07', // GOOD token address
    });
    
    if (amount) {
      params.set('exactAmount', amount);
    }
    
    return `${baseUrl}?${params.toString()}`;
  }
}

// Export singleton instance
export const tokenTransferService = new TokenTransferService();
