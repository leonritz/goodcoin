import { Purchase } from '../model';

/**
 * PurchaseController handles Goodcoin purchases
 */
class PurchaseController {
  private readonly API_BASE = '/api/purchases';

  /**
   * Get coin packages with pricing
   */
  getCoinPackages() {
    return [
      { coins: 100, priceETH: '0.001', priceUSDC: '3' },
      { coins: 250, priceETH: '0.0024', priceUSDC: '7', popular: true },
      { coins: 500, priceETH: '0.0045', priceUSDC: '13' },
      { coins: 1000, priceETH: '0.008', priceUSDC: '24', bestValue: true },
      { coins: 2500, priceETH: '0.019', priceUSDC: '55' },
      { coins: 5000, priceETH: '0.035', priceUSDC: '100' },
    ];
  }

  /**
   * Create a purchase record
   */
  async createPurchase(
    userFid: string,
    amount: number,
    paymentAmount: string,
    paymentCurrency: 'ETH' | 'USDC',
    transactionHash: string
  ): Promise<{ success: boolean; message: string; purchase?: Purchase }> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userFid,
          amount,
          paymentAmount,
          paymentCurrency,
          transactionHash,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Failed to create purchase',
        };
      }

      const purchaseData = data.purchase;
      const purchase = new Purchase(
        purchaseData.id,
        purchaseData.userFid,
        purchaseData.amount,
        purchaseData.paymentAmount,
        purchaseData.paymentCurrency
      );
      purchase.status = purchaseData.status;
      purchase.transactionHash = purchaseData.transactionHash;
      purchase.createdAt = new Date(purchaseData.createdAt);

      return {
        success: true,
        message: data.message || 'Purchase successful',
        purchase,
      };
    } catch (error) {
      console.error('Error creating purchase:', error);
      return {
        success: false,
        message: 'Failed to create purchase',
      };
    }
  }

  /**
   * Get user's purchase history
   */
  async getUserPurchases(fid: string): Promise<Purchase[]> {
    try {
      const response = await fetch(`${this.API_BASE}?userFid=${fid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch purchases');
      }

      const purchasesData = await response.json();
      return purchasesData.map((data: any) => {
        const purchase = new Purchase(
          data.id,
          data.userFid,
          data.amount,
          data.paymentAmount,
          data.paymentCurrency
        );
        purchase.status = data.status;
        purchase.transactionHash = data.transactionHash;
        purchase.createdAt = new Date(data.createdAt);
        return purchase;
      });
    } catch (error) {
      console.error('Error fetching purchases:', error);
      return [];
    }
  }

  /**
   * Get total coins purchased by user
   */
  async getTotalPurchasedByUser(fid: string): Promise<number> {
    const purchases = await this.getUserPurchases(fid);
    return purchases
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  }
}

// Singleton instance
export const purchaseController = new PurchaseController();

