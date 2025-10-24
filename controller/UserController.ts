import { User } from '../model';

/**
 * UserController handles all user-related operations using API
 */
class UserController {
  private readonly API_BASE = '/api/users';

  /**
   * Create or get existing user (for Farcaster login)
   */
  async getOrCreateUser(
    fid: string,
    username: string,
    displayName: string,
    profileImage?: string
  ): Promise<User> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fid,
          username,
          displayName,
          profileImage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create/get user');
      }

      const userData = await response.json();
      return new User(
        userData.fid,
        userData.username,
        userData.displayName,
        userData.profileImage,
        userData.balance
      );
    } catch (error) {
      console.error('Error creating/getting user:', error);
      throw error;
    }
  }

  /**
   * Create or get user from wallet address
   */
  async getOrCreateUserFromWallet(address: string): Promise<User> {
    const fid = `wallet_${address}`;
    const username = address.slice(0, 6) + '...' + address.slice(-4);
    const displayName = username;
    
    return await this.getOrCreateUser(fid, username, displayName);
  }

  /**
   * Create or get user from Farcaster FID
   */
  async getOrCreateUserFromFarcaster(fid: string, username?: string, displayName?: string): Promise<User> {
    const finalUsername = username || `fid_${fid}`;
    const finalDisplayName = displayName || `Farcaster User ${fid}`;
    
    return await this.getOrCreateUser(fid, finalUsername, finalDisplayName);
  }

  /**
   * Get user by Farcaster ID
   */
  async getUserByFid(fid: string): Promise<User | undefined> {
    try {
      const response = await fetch(`${this.API_BASE}?fid=${fid}`);
      
      if (response.status === 404) {
        return undefined;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const userData = await response.json();
      const user = new User(
        userData.fid,
        userData.username,
        userData.displayName,
        userData.profileImage,
        userData.balance
      );
      user.createdAt = new Date(userData.createdAt);
      user.updatedAt = new Date(userData.updatedAt);
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  /**
   * Update user's balance (used by TransactionController)
   */
  async updateUserBalance(fid: string, amount: number): Promise<boolean> {
    try {
      const user = await this.getUserByFid(fid);
      if (!user) return false;

      let newBalance = user.balance;
      if (amount > 0) {
        newBalance += amount;
      } else if (amount < 0) {
        const deductAmount = Math.abs(amount);
        if (user.balance < deductAmount) {
          return false;
        }
        newBalance -= deductAmount;
      }

      const response = await fetch(this.API_BASE, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fid, balance: newBalance }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating user balance:', error);
      return false;
    }
  }

  /**
   * Get user's current balance
   */
  async getUserBalance(fid: string): Promise<number> {
    const user = await this.getUserByFid(fid);
    return user ? user.balance : 0;
  }
}

// Singleton instance
export const userController = new UserController();
