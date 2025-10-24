/**
 * Purchase model representing a coin purchase transaction
 */
export class Purchase {
  id: string;
  userFid: string;
  amount: number; // Amount of Goodcoins purchased
  paymentAmount: string; // Amount paid in ETH/USDC (as string to preserve precision)
  paymentCurrency: 'ETH' | 'USDC';
  transactionHash?: string; // Blockchain transaction hash
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;

  constructor(
    id: string,
    userFid: string,
    amount: number,
    paymentAmount: string,
    paymentCurrency: 'ETH' | 'USDC'
  ) {
    this.id = id;
    this.userFid = userFid;
    this.amount = amount;
    this.paymentAmount = paymentAmount;
    this.paymentCurrency = paymentCurrency;
    this.status = 'pending';
    this.createdAt = new Date();
  }

  isValid(): boolean {
    return (
      this.amount > 0 &&
      this.userFid.length > 0 &&
      parseFloat(this.paymentAmount) > 0
    );
  }
}

