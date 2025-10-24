'use client';

import { useState } from 'react';
import { transactionController } from '../controller';
import '../styles/modal.css';

interface DonationModalProps {
  postId: string;
  recipientFid: string;
  recipientName: string;
  currentUserFid: string;
  currentUserBalance: number;
  onClose: () => void;
  onDonationComplete: () => void;
}

export default function DonationModal({
  postId,
  recipientFid,
  recipientName,
  currentUserFid,
  currentUserBalance,
  onClose,
  onDonationComplete,
}: DonationModalProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const quickAmounts = [5, 10, 25, 50, 100, 200];

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
    setError('');
  };

  const handleDonate = async () => {
    const donationAmount = parseInt(amount);
    
    if (isNaN(donationAmount) || donationAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (donationAmount > currentUserBalance) {
      setError('Insufficient balance');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await transactionController.createDonation(
        currentUserFid,
        recipientFid,
        donationAmount,
        postId
      );

      if (result.success) {
        setShowSuccess(true);
        setIsProcessing(false);
        
        // Show success message for 1.5 seconds then close
        setTimeout(() => {
          onDonationComplete();
          onClose();
        }, 1500);
      } else {
        setError(result.message);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error processing donation:', error);
      setError('Failed to process donation. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Donate Goodcoins</h2>
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
                animation: 'successPulse 1.5s ease-in-out infinite',
                fontWeight: 'bold'
              }}>
                ✓
              </div>
              <h3 style={{ 
                fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', 
                marginBottom: '0.5rem',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)'
              }}>Donation Successful!</h3>
              <p style={{ 
                fontSize: 'clamp(0.938rem, 2.5vw, 1rem)', 
                color: 'var(--text-secondary)',
                maxWidth: '90%',
                lineHeight: '1.6'
              }}>
                You donated <strong style={{ color: 'var(--primary-green)' }}>{amount} Goodcoins</strong> to <strong style={{ color: 'var(--primary-green)' }}>{recipientName}</strong>
              </p>
            </div>
          ) : (
            <>
              {/* Recipient Info */}
              <div className="donation-recipient-info">
                <p>Donating to:</p>
                <div className="donation-recipient-name">{recipientName}</div>
              </div>

              {/* Amount Input */}
              <div className="donation-amount-selector">
                <label className="donation-amount-label">Enter Amount:</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  placeholder="0"
                  className="donation-amount-input"
                  min="1"
                  max={currentUserBalance}
                  disabled={isProcessing}
                />
                
                {/* Quick Amount Buttons */}
                <div className="donation-quick-amounts">
                  {quickAmounts.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleQuickAmount(value)}
                      className="quick-amount-button"
                      disabled={isProcessing || value > currentUserBalance}
                      style={value > currentUserBalance ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Balance Display */}
              <div className="donation-balance-info">
                <div className="donation-balance-text">
                  Your Balance: {currentUserBalance} Goodcoins
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="donation-error">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with Action Buttons */}
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
              onClick={handleDonate}
              className="modal-button-primary"
              disabled={isProcessing || !amount || parseInt(amount) <= 0}
            >
              {isProcessing ? 'Processing...' : 'Donate'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
