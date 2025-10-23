/**
 * User model representing a Farcaster user in the Goodcoin app
 */
export class User {
  fid: string; // Farcaster ID (unique identifier)
  username: string;
  displayName: string;
  profileImage?: string;
  balance: number; // Current Goodcoin balance
  createdAt: Date;
  updatedAt: Date;

  constructor(
    fid: string,
    username: string,
    displayName: string,
    profileImage?: string,
    initialBalance: number = 100
  ) {
    this.fid = fid;
    this.username = username;
    this.displayName = displayName;
    this.profileImage = profileImage;
    this.balance = initialBalance;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Add Goodcoins to user's balance
   */
  addBalance(amount: number): void {
    if (amount < 0) {
      throw new Error("Cannot add negative amount");
    }
    this.balance += amount;
    this.updatedAt = new Date();
  }

  /**
   * Deduct Goodcoins from user's balance
   */
  deductBalance(amount: number): boolean {
    if (amount < 0) {
      throw new Error("Cannot deduct negative amount");
    }
    if (this.balance < amount) {
      return false; // Insufficient balance
    }
    this.balance -= amount;
    this.updatedAt = new Date();
    return true;
  }

  /**
   * Check if user has sufficient balance
   */
  hasSufficientBalance(amount: number): boolean {
    return this.balance >= amount;
  }
}

