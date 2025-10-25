/**
 * Transaction model representing a GOOD token donation between users
 * Now supports real token transactions only
 */
export class Transaction {
  id: string; // Unique transaction identifier
  fromFid: string; // Farcaster ID of the donor
  toFid: string; // Farcaster ID of the recipient
  amount: number; // Amount of GOOD tokens transferred
  postId: string; // ID of the post that received the donation
  createdAt: Date;
  
  // New fields for token integration
  transactionType: 'virtual' | 'token' | 'purchase'; // Type of transaction
  tokenAmount?: string; // Real token amount (in wei)
  tokenSymbol?: string; // Token symbol (GOOD)
  ethAmount?: string; // ETH amount for purchases
  txHash?: string; // Blockchain transaction hash
  fromAddress?: string; // User's wallet address
  toAddress?: string; // Recipient's wallet address
  status?: 'pending' | 'confirmed' | 'failed'; // Transaction status

  constructor(
    id: string,
    fromFid: string,
    toFid: string,
    amount: number,
    postId: string,
    transactionType: 'virtual' | 'token' | 'purchase' = 'virtual',
    tokenAmount?: string,
    tokenSymbol?: string,
    ethAmount?: string,
    txHash?: string,
    fromAddress?: string,
    toAddress?: string,
    status?: 'pending' | 'confirmed' | 'failed'
  ) {
    this.id = id;
    this.fromFid = fromFid;
    this.toFid = toFid;
    this.amount = amount;
    this.postId = postId;
    this.transactionType = transactionType;
    this.tokenAmount = tokenAmount;
    this.tokenSymbol = tokenSymbol;
    this.ethAmount = ethAmount;
    this.txHash = txHash;
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.status = status || 'confirmed';
    this.createdAt = new Date();
  }

  /**
   * Validate that the transaction has valid data
   */
  isValid(): boolean {
    const basicValidation = (
      this.amount > 0 &&
      this.fromFid !== this.toFid &&
      this.fromFid.length > 0 &&
      this.toFid.length > 0 &&
      this.postId.length > 0
    );

    // Additional validation for token transactions
    if (this.transactionType === 'token' || this.transactionType === 'purchase') {
      return basicValidation && 
             this.fromAddress !== undefined && 
             this.tokenAmount !== undefined &&
             this.tokenSymbol !== undefined;
    }

    return basicValidation;
  }

  /**
   * Get formatted token amount for display
   */
  getFormattedTokenAmount(): string {
    if (!this.tokenAmount || !this.tokenSymbol) {
      return `${this.amount} GOOD tokens`;
    }
    return `${this.tokenAmount} ${this.tokenSymbol}`;
  }

  /**
   * Check if this is a real token transaction
   */
  isTokenTransaction(): boolean {
    return this.transactionType === 'token' || this.transactionType === 'purchase';
  }

  /**
   * Get transaction display text
   */
  getDisplayText(): string {
    if (this.transactionType === 'purchase') {
      return `Purchased ${this.getFormattedTokenAmount()} for ${this.ethAmount} ETH`;
    } else if (this.transactionType === 'token') {
      return `Sent ${this.getFormattedTokenAmount()}`;
    } else {
      return `Sent ${this.amount} GOOD tokens`;
    }
  }
}

