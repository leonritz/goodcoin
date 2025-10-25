'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { transactionController } from '../controller';
import { walletService } from '../lib/walletService';
import { tokenTransferService } from '../lib/tokenTransferService';
import { tokenService } from '../lib/tokenService';
import { TOKEN_CONFIG } from '../lib/tokenConfig';
import '../styles/modal.css';

interface EnhancedDonationModalProps {
  postId: string;
  recipientFid: string;
  recipientName: string;
  currentUserFid: string;
  onClose: () => void;
  onDonationComplete: () => void;
}

export default function EnhancedDonationModal({
  postId,
  recipientFid,
  recipientName,
  currentUserFid,
  onClose,
  onDonationComplete,
}: EnhancedDonationModalProps) {
  const { address, isConnected } = useAccount();
  
  // State management
  // const [donationType] = useState<'token'>('token'); // Only real tokens - unused for now
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  // const [showSuccess, setShowSuccess] = useState(false); // Unused for now
  const [recipientAddress, setRecipientAddress] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  const quickAmounts = [5, 10, 25, 50, 100, 200];

  // Load recipient wallet address and user's token balance
  const loadRecipientInfo = useCallback(async () => {
    setIsLoadingBalances(true);
    try {
      // Get recipient wallet address
      const recipientAddr = await walletService.getWalletAddressForUser(recipientFid);
      setRecipientAddress(recipientAddr);
      
      // Load user's token balance if wallet is connected
      if (isConnected && address) {
        try {
          const tokenBal = await tokenService.getTokenBalance(address);
          setTokenBalance(tokenBal.formattedBalance);
        } catch (error) {
          console.error('Error loading token balance:', error);
          setTokenBalance('0');
        }
      }
    } catch (error) {
      console.error('Error loading recipient info:', error);
    } finally {
      setIsLoadingBalances(false);
    }
  }, [isConnected, address, recipientFid]);

  useEffect(() => {
    loadRecipientInfo();
  }, [loadRecipientInfo]);

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
    setError('');
  };

  const handleDonate = async () => {
    const donationAmount = parseFloat(amount);
    
    if (isNaN(donationAmount) || donationAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Handle real token donation only
      if (!isConnected || !address) {
        setError('Please connect your wallet to send GOOD tokens');
        setIsProcessing(false);
        return;
      }

      if (!recipientAddress) {
        setError('Recipient does not have a linked wallet address. Please ask them to connect their wallet.');
        setIsProcessing(false);
        return;
      }

      // Check if user has enough tokens
      const hasEnoughBalance = await tokenTransferService.checkTokenBalance(address, amount);
      if (!hasEnoughBalance.hasBalance) {
        setError(`Insufficient GOOD tokens. You have ${hasEnoughBalance.currentBalance} GOOD tokens.`);
        setIsProcessing(false);
        return;
      }

      // For now, simulate the token transfer
      // In a real implementation, this would call the token contract
      const transferResult = await tokenTransferService.transferTokens(
        address,
        recipientAddress as `0x${string}`,
        amount
      );

      if (!transferResult.success) {
        setError(transferResult.error || 'Failed to transfer tokens');
        setIsProcessing(false);
        return;
      }

      // Create transaction record
      const transactionResult = await transactionController.createDonation(
        currentUserFid,
        recipientFid,
        donationAmount,
        postId,
        'token',
        transferResult.txHash,
        address,
        recipientAddress,
        amount,
        TOKEN_CONFIG.symbol,
        undefined, // No ETH amount for token transfers
        'confirmed'
      );

      if (!transactionResult.success) {
        setError(transactionResult.message);
        setIsProcessing(false);
        return;
      }

      // Success - close modal and refresh
      onDonationComplete();
      onClose();
      
    } catch (error) {
      console.error('Error processing donation:', error);
      setError('Failed to process donation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyTokens = () => {
    const buyUrl = `https://app.uniswap.org/#/swap?chain=base&inputCurrency=ETH&outputCurrency=0x17d25b0F2Bd117af4e0282F6A82428d44605bb07`;
    window.open(buyUrl, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content enhanced-donation-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Donate GOOD Tokens</h2>
          <button onClick={onClose} className="modal-close-button">
            <span style={{ fontSize: '1.5em', fontWeight: 'bold', lineHeight: '1' }}>×</span>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
            <>
              {/* Donation Type Info */}
              <div className="donation-type-info">
                <div className="donation-type-badge">
                  <span>🪙</span>
                  <span>GOOD Token Donation</span>
                </div>
              </div>

              {/* Recipient Info */}
              <div className="donation-recipient-info">
                <p>Donating to:</p>
                <div className="donation-recipient-name">{recipientName}</div>
                {recipientAddress && (
                  <div className="donation-recipient-address">
                    Wallet: {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                  </div>
                )}
                {!recipientAddress && !isLoadingBalances && (
                  <div className="donation-recipient-warning">
                    ⚠️ Recipient doesn&apos;t have a linked wallet address
                  </div>
                )}
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
                  min="0.001"
                  step="0.001"
                  disabled={isProcessing}
                />
                
                {/* Quick Amount Buttons */}
                <div className="donation-quick-amounts">
                  {quickAmounts.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleQuickAmount(value)}
                      className="quick-amount-button"
                      disabled={isProcessing}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Balance Display */}
              <div className="donation-balance-info">
                <div className="donation-balance-text">
                  {isLoadingBalances ? (
                    'Loading token balance...'
                  ) : isConnected ? (
                    <>Your Token Balance: {parseFloat(tokenBalance).toFixed(4)} GOOD</>
                  ) : (
                    'Connect your wallet to see token balance'
                  )}
                </div>
              </div>

              {/* Token Purchase Link */}
              {isConnected && parseFloat(tokenBalance) < parseFloat(amount || '0') && (
                <div className="donation-buy-tokens">
                  <p>Insufficient GOOD tokens. Buy more tokens to complete this donation.</p>
                  <button
                    onClick={handleBuyTokens}
                    className="btn-buy-tokens"
                    disabled={isProcessing}
                  >
                    Buy GOOD Tokens
                  </button>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="donation-error">
                  {error}
                </div>
              )}
            </>
        </div>

        {/* Footer with Action Buttons */}
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
              disabled={isProcessing || !amount || parseFloat(amount) <= 0}
            >
              {isProcessing ? 'Processing...' : 'Donate GOOD Tokens'}
            </button>
        </div>
      </div>
    </div>
  );
}
