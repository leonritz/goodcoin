import { User } from '../model';

/**
 * UserController handles all user-related operations
 */
class UserController {
  private users: Map<string, User>; // fid -> User
  private readonly STORAGE_KEY = 'goodcoin_users';

  constructor() {
    this.users = new Map();
    this.loadFromStorage();
  }

  /**
   * Load users from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([fid, userData]: [string, any]) => {
          const user = new User(
            userData.fid,
            userData.username,
            userData.displayName,
            userData.profileImage,
            userData.balance
          );
          user.createdAt = new Date(userData.createdAt);
          user.updatedAt = new Date(userData.updatedAt);
          this.users.set(fid, user);
        });
      }
    } catch (error) {
      console.error('Error loading users from storage:', error);
    }
  }

  /**
   * Save users to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data: any = {};
      this.users.forEach((user, fid) => {
        data[fid] = {
          fid: user.fid,
          username: user.username,
          displayName: user.displayName,
          profileImage: user.profileImage,
          balance: user.balance,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving users to storage:', error);
    }
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
    this.saveToStorage();
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
      this.saveToStorage();
      return true;
    } else if (amount < 0) {
      const result = user.deductBalance(Math.abs(amount));
      if (result) this.saveToStorage();
      return result;
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

