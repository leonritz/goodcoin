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

  const handleDonate = () => {
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

    const result = transactionController.createDonation(
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
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">💰 Donate Goodcoins</h2>
          <button onClick={onClose} className="modal-close-button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {showSuccess ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem 1rem',
              animation: 'modalSlideIn 0.3s ease-out'
            }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1rem',
                animation: 'pulse 0.5s ease-in-out'
              }}>
                ✅
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: 'var(--accent-green)',
                marginBottom: '0.5rem'
              }}>
                Donation Successful!
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                You donated {amount} Goodcoins to {recipientName}
              </p>
            </div>
          ) : (
            <>
              <div className="donation-recipient-info">
                <p>Donating to</p>
                <div className="donation-recipient-name">{recipientName}</div>
              </div>

              <div className="donation-balance-info">
                <span className="donation-balance-text">
                  Your Balance: {currentUserBalance} Goodcoins
                </span>
              </div>

              {error && (
                <div className="donation-error">
                  {error}
                </div>
              )}

              <div className="donation-amount-selector">
            <label className="donation-amount-label">Amount to Donate</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              placeholder="0"
              min="1"
              max={currentUserBalance}
              className="donation-amount-input"
            />

            <div className="donation-quick-amounts">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => handleQuickAmount(quickAmount)}
                  className="quick-amount-button"
                  disabled={quickAmount > currentUserBalance}
                  style={{ 
                    opacity: quickAmount > currentUserBalance ? 0.5 : 1,
                    cursor: quickAmount > currentUserBalance ? 'not-allowed' : 'pointer'
                  }}
                >
                  {quickAmount}
                </button>
              ))}
              </div>
            </div>
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
              onClick={handleDonate}
              disabled={!amount || parseInt(amount) <= 0 || isProcessing}
              className="modal-button-primary"
            >
              {isProcessing ? '⏳ Processing...' : '🎁 Send Donation'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}



