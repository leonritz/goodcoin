// import { userController } from '../controller'; // For future use

/**
 * Service for resolving wallet addresses from user FIDs
 */
export class WalletService {
  /**
   * Get wallet address for a user by their FID
   * Returns null if no wallet address is found
   */
  async getWalletAddressForUser(fid: string): Promise<string | null> {
    try {
      // Check if the FID is already a wallet address format
      if (fid.startsWith('wallet_')) {
        // Extract the actual address from wallet_ format
        return fid.replace('wallet_', '');
      }

      // For now, we'll need to implement a way to store and retrieve
      // wallet addresses associated with Farcaster FIDs
      // This would typically involve checking a database or API
      
      // For demonstration, we'll return null and let the user enter manually
      return null;
    } catch (error) {
      console.error('Error getting wallet address for user:', error);
      return null;
    }
  }

  /**
   * Check if a user has a linked wallet address
   */
  async hasWalletAddress(fid: string): Promise<boolean> {
    const address = await this.getWalletAddressForUser(fid);
    return address !== null;
  }

  /**
   * Validate if an address is a valid Ethereum address
   */
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Format address for display (truncated)
   */
  formatAddress(address: string): string {
    if (!this.isValidAddress(address)) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

// Export singleton instance
export const walletService = new WalletService();
