'use client';

import { useEffect, useState } from 'react';
import { purchaseController } from '../../controller';
import { Purchase } from '../../model';
import '../../styles/profile.css';

interface PurchaseListProps {
  userFid: string;
}

export default function PurchaseList({ userFid }: PurchaseListProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPurchases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userFid]);

  const loadPurchases = async () => {
    setIsLoading(true);
    const data = await purchaseController.getUserPurchases(userFid);
    setPurchases(data);
    setIsLoading(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'var(--primary-green)';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'pending':
        return '⏱';
      case 'failed':
        return '✗';
      default:
        return '•';
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
        Loading purchases...
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        color: 'var(--text-secondary)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>💰</div>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No Purchases Yet</h3>
        <p>Buy Goodcoins to support great content and creators</p>
      </div>
    );
  }

  const totalSpent = purchases
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.paymentAmount), 0);

  const totalCoins = purchases
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="transaction-list">
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          padding: '1.5rem',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Total Purchases
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-green)' }}>
            {purchases.filter(p => p.status === 'completed').length}
          </div>
        </div>
        <div style={{
          padding: '1.5rem',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Coins Purchased
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-green)' }}>
            {totalCoins.toLocaleString()}
          </div>
        </div>
        <div style={{
          padding: '1.5rem',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Total Spent (ETH)
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-green)' }}>
            {totalSpent.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Purchase History */}
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Purchase History</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            style={{
              padding: '1.25rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '200px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'var(--primary-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  color: 'white',
                  fontWeight: 700,
                }}
              >
                {getStatusIcon(purchase.status)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem',
                }}>
                  +{purchase.amount.toLocaleString()} Goodcoins
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {formatDate(purchase.createdAt)}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '0.25rem',
            }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                {purchase.paymentAmount} {purchase.paymentCurrency}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: getStatusColor(purchase.status),
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {purchase.status}
              </div>
              {purchase.transactionHash && (
                <a
                  href={`https://basescan.org/tx/${purchase.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--primary-green)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  View on Basescan ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

