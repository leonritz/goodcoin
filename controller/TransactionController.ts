import { Transaction } from '../model';

/**
 * TransactionController handles all Goodcoin donation transactions using API
 */
class TransactionController {
  private readonly API_BASE = '/api/transactions';

  /**
   * Process a donation from one user to another
   */
  async createDonation(
    fromFid: string,
    toFid: string,
    amount: number,
    postId: string,
    transactionType: 'virtual' | 'token' | 'purchase' = 'virtual',
    txHash?: string,
    fromAddress?: string,
    toAddress?: string,
    tokenAmount?: string,
    tokenSymbol?: string,
    ethAmount?: string,
    status: 'pending' | 'confirmed' | 'failed' = 'confirmed'
  ): Promise<{ success: boolean; message: string; transaction?: Transaction }> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromFid,
          toFid,
          amount,
          postId,
          transactionType,
          txHash,
          fromAddress,
          toAddress,
          tokenAmount,
          tokenSymbol,
          ethAmount,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Failed to create donation',
        };
      }

      const txData = data.transaction;
      const transaction = new Transaction(
        txData.id,
        txData.fromFid,
        txData.toFid,
        txData.amount,
        txData.postId,
        txData.transactionType,
        txData.tokenAmount,
        txData.tokenSymbol,
        txData.ethAmount,
        txData.txHash,
        txData.fromAddress,
        txData.toAddress,
        txData.status
      );
      transaction.createdAt = new Date(txData.createdAt);

      return {
        success: true,
        message: data.message || 'Donation successful',
        transaction,
      };
    } catch (error) {
      console.error('Error creating donation:', error);
      return {
        success: false,
        message: 'Failed to create donation',
      };
    }
  }

  /**
   * Get all transactions for a user (sent and received)
   */
  async getUserTransactions(fid: string): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.API_BASE}?userFid=${fid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const transactionsData = await response.json();
      return transactionsData.map((txData: any) => {
        const transaction = new Transaction(
          txData.id,
          txData.fromFid,
          txData.toFid,
          txData.amount,
          txData.postId,
          txData.transactionType,
          txData.tokenAmount,
          txData.tokenSymbol,
          txData.ethAmount,
          txData.txHash,
          txData.fromAddress,
          txData.toAddress,
          txData.status
        );
        transaction.createdAt = new Date(txData.createdAt);
        return transaction;
      });
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  }

  /**
   * Get transactions for a specific post
   */
  async getPostTransactions(postId: string): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.API_BASE}?postId=${postId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch post transactions');
      }

      const transactionsData = await response.json();
      return transactionsData.map((txData: any) => {
        const transaction = new Transaction(
          txData.id,
          txData.fromFid,
          txData.toFid,
          txData.amount,
          txData.postId,
          txData.transactionType,
          txData.tokenAmount,
          txData.tokenSymbol,
          txData.ethAmount,
          txData.txHash,
          txData.fromAddress,
          txData.toAddress,
          txData.status
        );
        transaction.createdAt = new Date(txData.createdAt);
        return transaction;
      });
    } catch (error) {
      console.error('Error fetching post transactions:', error);
      return [];
    }
  }

  /**
   * Get all donations sent by a user
   */
  async getDonationsSentByUser(fid: string): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.API_BASE}?userFid=${fid}&type=sent`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sent donations');
      }

      const transactionsData = await response.json();
      return transactionsData.map((txData: any) => {
        const transaction = new Transaction(
          txData.id,
          txData.fromFid,
          txData.toFid,
          txData.amount,
          txData.postId,
          txData.transactionType,
          txData.tokenAmount,
          txData.tokenSymbol,
          txData.ethAmount,
          txData.txHash,
          txData.fromAddress,
          txData.toAddress,
          txData.status
        );
        transaction.createdAt = new Date(txData.createdAt);
        return transaction;
      });
    } catch (error) {
      console.error('Error fetching sent donations:', error);
      return [];
    }
  }

  /**
   * Get all donations received by a user
   */
  async getDonationsReceivedByUser(fid: string): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.API_BASE}?userFid=${fid}&type=received`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch received donations');
      }

      const transactionsData = await response.json();
      return transactionsData.map((txData: any) => {
        const transaction = new Transaction(
          txData.id,
          txData.fromFid,
          txData.toFid,
          txData.amount,
          txData.postId,
          txData.transactionType,
          txData.tokenAmount,
          txData.tokenSymbol,
          txData.ethAmount,
          txData.txHash,
          txData.fromAddress,
          txData.toAddress,
          txData.status
        );
        transaction.createdAt = new Date(txData.createdAt);
        return transaction;
      });
    } catch (error) {
      console.error('Error fetching received donations:', error);
      return [];
    }
  }

  /**
   * Get total amount donated by a user
   */
  async getTotalDonatedByUser(fid: string): Promise<number> {
    const sentDonations = await this.getDonationsSentByUser(fid);
    return sentDonations.reduce((sum, tx) => sum + tx.amount, 0);
  }

  /**
   * Get total amount received by a user
   */
  async getTotalReceivedByUser(fid: string): Promise<number> {
    const receivedDonations = await this.getDonationsReceivedByUser(fid);
    return receivedDonations.reduce((sum, tx) => sum + tx.amount, 0);
  }
}

// Singleton instance
export const transactionController = new TransactionController();

