/**
 * Transaction model representing a Goodcoin donation between users
 */
export class Transaction {
  id: string; // Unique transaction identifier
  fromFid: string; // Farcaster ID of the donor
  toFid: string; // Farcaster ID of the recipient
  amount: number; // Amount of Goodcoins transferred
  postId: string; // ID of the post that received the donation
  createdAt: Date;

  constructor(
    id: string,
    fromFid: string,
    toFid: string,
    amount: number,
    postId: string
  ) {
    this.id = id;
    this.fromFid = fromFid;
    this.toFid = toFid;
    this.amount = amount;
    this.postId = postId;
    this.createdAt = new Date();
  }

  /**
   * Validate that the transaction has valid data
   */
  isValid(): boolean {
    return (
      this.amount > 0 &&
      this.fromFid !== this.toFid &&
      this.fromFid.length > 0 &&
      this.toFid.length > 0 &&
      this.postId.length > 0
    );
  }
}

