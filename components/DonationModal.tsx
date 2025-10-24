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
          <h2 className="modal-title">💰 Donate Goodcoins</h2>
          <button onClick={onClose} className="modal-close-button">
            ✕
          </button>
        </div>

        {/* Success Message */}
        {showSuccess ? (
          <div className="modal-success">
            <div className="modal-success-icon">✅</div>
            <h3>Donation Successful!</h3>
            <p>You donated {amount} Goodcoins to {recipientName}</p>
          </div>
        ) : (
          <>
            {/* Recipient Info */}
            <div className="modal-recipient">
              <p className="modal-recipient-label">Donating to:</p>
              <p className="modal-recipient-name">{recipientName}</p>
            </div>

            {/* Quick Amount Buttons */}
            <div className="modal-quick-amounts">
              <p className="modal-section-label">Quick amounts:</p>
              <div className="modal-quick-amounts-grid">
                {quickAmounts.map((value) => (
                  <button
                    key={value}
                    onClick={() => handleQuickAmount(value)}
                    className={`modal-quick-amount-button ${amount === value.toString() ? 'selected' : ''}`}
                    disabled={isProcessing || value > currentUserBalance}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="modal-custom-amount">
              <p className="modal-section-label">Or enter a custom amount:</p>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="Enter amount..."
                className="modal-input"
                min="1"
                max={currentUserBalance}
                disabled={isProcessing}
              />
            </div>

            {/* Balance Display */}
            <div className="modal-balance">
              Your balance: <strong>{currentUserBalance}</strong> Goodcoins
            </div>

            {/* Error Message */}
            {error && (
              <div className="modal-error">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="modal-actions">
              <button
                onClick={onClose}
                className="modal-button modal-button-cancel"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleDonate}
                className="modal-button modal-button-donate"
                disabled={isProcessing || !amount || parseInt(amount) <= 0}
              >
                {isProcessing ? '⏳ Processing...' : '💚 Donate'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
