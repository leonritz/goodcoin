import { Transaction } from '../model';
import { userController } from './UserController';
import { postController } from './PostController';

/**
 * TransactionController handles all Goodcoin donation transactions
 */
class TransactionController {
  private transactions: Map<string, Transaction>; // transactionId -> Transaction
  private readonly STORAGE_KEY = 'goodcoin_transactions';

  constructor() {
    this.transactions = new Map();
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([id, txData]: [string, any]) => {
          const transaction = new Transaction(
            txData.id,
            txData.fromFid,
            txData.toFid,
            txData.amount,
            txData.postId
          );
          transaction.createdAt = new Date(txData.createdAt);
          this.transactions.set(id, transaction);
        });
      }
    } catch (error) {
      console.error('Error loading transactions from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data: any = {};
      this.transactions.forEach((tx, id) => {
        data[id] = {
          id: tx.id,
          fromFid: tx.fromFid,
          toFid: tx.toFid,
          amount: tx.amount,
          postId: tx.postId,
          createdAt: tx.createdAt.toISOString(),
        };
      });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving transactions to storage:', error);
    }
  }

  /**
   * Process a donation from one user to another
   */
  createDonation(
    fromFid: string,
    toFid: string,
    amount: number,
    postId: string
  ): { success: boolean; message: string; transaction?: Transaction } {
    // Validation
    if (amount <= 0) {
      return { success: false, message: 'Amount must be greater than 0' };
    }

    if (fromFid === toFid) {
      return { success: false, message: 'Cannot donate to yourself' };
    }

    const donor = userController.getUserByFid(fromFid);
    if (!donor) {
      return { success: false, message: 'Donor not found' };
    }

    const recipient = userController.getUserByFid(toFid);
    if (!recipient) {
      return { success: false, message: 'Recipient not found' };
    }

    const post = postController.getPostById(postId);
    if (!post) {
      return { success: false, message: 'Post not found' };
    }

    // Check if donor has sufficient balance
    if (!donor.hasSufficientBalance(amount)) {
      return { success: false, message: 'Insufficient balance' };
    }

    // Create transaction
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transaction = new Transaction(transactionId, fromFid, toFid, amount, postId);

    // Process the transaction
    const deducted = userController.updateUserBalance(fromFid, -amount);
    if (!deducted) {
      return { success: false, message: 'Failed to deduct balance' };
    }

    userController.updateUserBalance(toFid, amount);
    postController.addDonationToPost(postId, amount);

    // Save transaction
    this.transactions.set(transactionId, transaction);
    this.saveToStorage();

    return {
      success: true,
      message: 'Donation successful',
      transaction,
    };
  }

  /**
   * Get all transactions for a user (sent and received)
   */
  getUserTransactions(fid: string): Transaction[] {
    const userTransactions = Array.from(this.transactions.values()).filter(
      (tx) => tx.fromFid === fid || tx.toFid === fid
    );
    return userTransactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get transactions for a specific post
   */
  getPostTransactions(postId: string): Transaction[] {
    const postTransactions = Array.from(this.transactions.values()).filter(
      (tx) => tx.postId === postId
    );
    return postTransactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get all donations sent by a user
   */
  getDonationsSentByUser(fid: string): Transaction[] {
    const sentDonations = Array.from(this.transactions.values()).filter(
      (tx) => tx.fromFid === fid
    );
    return sentDonations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get all donations received by a user
   */
  getDonationsReceivedByUser(fid: string): Transaction[] {
    const receivedDonations = Array.from(this.transactions.values()).filter(
      (tx) => tx.toFid === fid
    );
    return receivedDonations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get total amount donated by a user
   */
  getTotalDonatedByUser(fid: string): number {
    return Array.from(this.transactions.values())
      .filter((tx) => tx.fromFid === fid)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  /**
   * Get total amount received by a user
   */
  getTotalReceivedByUser(fid: string): number {
    return Array.from(this.transactions.values())
      .filter((tx) => tx.toFid === fid)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }
}

// Singleton instance
export const transactionController = new TransactionController();

