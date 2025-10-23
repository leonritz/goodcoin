import { User } from '../model';

/**
 * UserController handles all user-related operations
 */
class UserController {
  private users: Map<string, User>; // fid -> User

  constructor() {
    this.users = new Map();
  }

  /**
   * Create or get existing user (for Farcaster login)
   */
  getOrCreateUser(
    fid: string,
    username: string,
    displayName: string,
    profileImage?: string
  ): User {
    const existing = this.users.get(fid);
    if (existing) {
      return existing;
    }

    const newUser = new User(fid, username, displayName, profileImage);
    this.users.set(fid, newUser);
    return newUser;
  }

  /**
   * Get user by Farcaster ID
   */
  getUserByFid(fid: string): User | undefined {
    return this.users.get(fid);
  }

  /**
   * Update user's balance (used by TransactionController)
   */
  updateUserBalance(fid: string, amount: number): boolean {
    const user = this.users.get(fid);
    if (!user) return false;

    if (amount > 0) {
      user.addBalance(amount);
      return true;
    } else if (amount < 0) {
      return user.deductBalance(Math.abs(amount));
    }
    return true;
  }

  /**
   * Get user's current balance
   */
  getUserBalance(fid: string): number {
    const user = this.users.get(fid);
    return user ? user.balance : 0;
  }
}

// Singleton instance
export const userController = new UserController();

