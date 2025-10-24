'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { purchaseController } from '../controller';
import '../styles/modal.css';

interface PurchaseModalProps {
  currentUserFid: string;
  currentUserBalance: number;
  onClose: () => void;
  onPurchaseComplete: () => void;
}

interface CoinPackage {
  coins: number;
  priceETH: string;
  priceUSDC: string;
  popular?: boolean;
  bestValue?: boolean;
}

// Treasury address - where payments go (replace with your address)
const TREASURY_ADDRESS = '0x0000000000000000000000000000000000000000'; // TODO: Replace with actual treasury address

export default function PurchaseModal({
  currentUserFid,
  currentUserBalance,
  onClose,
  onPurchaseComplete,
}: PurchaseModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [currency, setCurrency] = useState<'ETH' | 'USDC'>('ETH');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { sendTransaction } = useSendTransaction();

  const packages = purchaseController.getCoinPackages();

  const handlePurchase = async () => {
    if (!selectedPackage) {
      setError('Please select a package');
      return;
    }

    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (TREASURY_ADDRESS === '0x0000000000000000000000000000000000000000') {
      setError('Treasury address not configured. Please contact support.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const paymentAmount = currency === 'ETH' ? selectedPackage.priceETH : selectedPackage.priceUSDC;

      if (currency === 'ETH') {
        // Send ETH payment
        sendTransaction(
          {
            to: TREASURY_ADDRESS as `0x${string}`,
            value: parseEther(paymentAmount),
          },
          {
            onSuccess: async (hash) => {
              // Record the purchase in database
              const result = await purchaseController.createPurchase(
                currentUserFid,
                selectedPackage.coins,
                paymentAmount,
                currency,
                hash
              );

              if (result.success) {
                setShowSuccess(true);
                setIsProcessing(false);
                
                setTimeout(() => {
                  onPurchaseComplete();
                  onClose();
                }, 2000);
              } else {
                setError(result.message || 'Failed to record purchase');
                setIsProcessing(false);
              }
            },
            onError: (error) => {
              console.error('Transaction error:', error);
              setError('Transaction failed. Please try again.');
              setIsProcessing(false);
            },
          }
        );
      } else {
        // For USDC, we'd need token approval + transfer
        // This is a simplified version - in production you'd use a contract
        setError('USDC payments coming soon! Please use ETH for now.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      setError('Failed to process purchase. Please try again.');
      setIsProcessing(false);
    }
  };

  const getPriceDisplay = (pkg: CoinPackage) => {
    return currency === 'ETH' ? `${pkg.priceETH} ETH` : `$${pkg.priceUSDC}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Buy Goodcoins</h2>
          <button onClick={onClose} className="modal-close-button">
            <span style={{ fontSize: '1.5em', fontWeight: 'bold', lineHeight: '1' }}>×</span>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {showSuccess ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--primary-green)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'var(--primary-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: 'white',
                boxShadow: 'var(--shadow-lg)',
              }}>
                ✓
              </div>
              <h3 style={{ 
                fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', 
                marginBottom: '0.5rem',
                color: 'var(--text-primary)'
              }}>Purchase Successful!</h3>
              <p style={{ 
                fontSize: 'clamp(0.938rem, 2.5vw, 1rem)', 
                color: 'var(--text-secondary)',
                lineHeight: '1.6'
              }}>
                <strong style={{ color: 'var(--primary-green)' }}>{selectedPackage?.coins} Goodcoins</strong> added to your account
              </p>
            </div>
          ) : (
            <>
              {/* Currency Toggle */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                padding: '0.25rem',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
              }}>
                <button
                  onClick={() => setCurrency('ETH')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: 'none',
                    borderRadius: '6px',
                    background: currency === 'ETH' ? 'var(--primary-green)' : 'transparent',
                    color: currency === 'ETH' ? 'white' : 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Pay with ETH
                </button>
                <button
                  onClick={() => setCurrency('USDC')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: 'none',
                    borderRadius: '6px',
                    background: currency === 'USDC' ? 'var(--primary-green)' : 'transparent',
                    color: currency === 'USDC' ? 'white' : 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: 0.5, // Disabled for now
                  }}
                  disabled
                >
                  Pay with USDC (Soon)
                </button>
              </div>

              {/* Wallet Status */}
              {!isConnected && (
                <div style={{
                  padding: '1rem',
                  background: 'var(--warning-bg)',
                  border: '1px solid var(--warning-border)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  color: 'var(--warning-text)',
                }}>
                  ⚠️ Please connect your wallet to purchase coins
                </div>
              )}

              {/* Packages Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}>
                {packages.map((pkg) => (
                  <div
                    key={pkg.coins}
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setError('');
                    }}
                    style={{
                      position: 'relative',
                      padding: '1.5rem 1rem',
                      border: selectedPackage?.coins === pkg.coins 
                        ? '2px solid var(--primary-green)' 
                        : '1px solid var(--border-color)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: selectedPackage?.coins === pkg.coins 
                        ? 'var(--primary-green-light)' 
                        : 'var(--bg-secondary)',
                      textAlign: 'center',
                    }}
                  >
                    {pkg.popular && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--primary-green)',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}>
                        POPULAR
                      </div>
                    )}
                    {pkg.bestValue && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#f59e0b',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}>
                        BEST VALUE
                      </div>
                    )}
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: 'var(--primary-green)',
                      marginBottom: '0.5rem',
                    }}>
                      {pkg.coins}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.5rem',
                    }}>
                      Goodcoins
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}>
                      {getPriceDisplay(pkg)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Current Balance */}
              <div style={{
                padding: '1rem',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Current Balance:</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-green)', fontSize: '1.125rem' }}>
                  {currentUserBalance} Goodcoins
                </span>
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  padding: '1rem',
                  background: 'var(--error-bg)',
                  border: '1px solid var(--error-border)',
                  borderRadius: '8px',
                  color: 'var(--error-text)',
                  marginTop: '1rem',
                }}>
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!showSuccess && (
          <div className="modal-footer">
            <button
              onClick={onClose}
              className="modal-button-secondary"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              className="modal-button-primary"
              disabled={isProcessing || !selectedPackage || !isConnected}
            >
              {isProcessing ? 'Processing...' : `Buy ${selectedPackage?.coins || 0} Coins`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

