'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
// import { parseEther, formatEther } from 'viem'; // Unused for now
import { tokenService } from '../lib/tokenService';
import { TOKEN_CONFIG } from '../lib/tokenConfig';

interface TokenPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (txHash: string) => void;
}

export default function TokenPurchaseModal({ isOpen, onClose, onSuccess }: TokenPurchaseModalProps) {
  const { address, isConnected } = useAccount();
  const [ethAmount, setEthAmount] = useState<string>(TOKEN_CONFIG.purchase.defaultEthAmount);
  const [tokenAmount, setTokenAmount] = useState('0');
  const [ethBalance, setEthBalance] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { writeContract: _writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const loadBalances = useCallback(async () => {
    if (!address) return;
    
    try {
      const [ethBal, tokenBal] = await Promise.all([
        tokenService.getEthBalance(address),
        tokenService.getTokenBalance(address),
      ]);
      setEthBalance(ethBal);
      setTokenBalance(tokenBal.formattedBalance);
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  }, [address]);

  // Load user balances
  useEffect(() => {
    if (address && isConnected) {
      loadBalances();
    }
  }, [address, isConnected, loadBalances]);

  // Calculate token amount when ETH amount changes
  useEffect(() => {
    if (ethAmount) {
      const calculated = tokenService.calculateTokenAmountFromEth(ethAmount);
      setTokenAmount(calculated);
    }
  }, [ethAmount]);

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && hash) {
      onSuccess?.(hash);
      onClose();
      // Reload balances
      if (address) {
        loadBalances();
      }
    }
  }, [isSuccess, hash, onSuccess, onClose, address, loadBalances]);

  const handlePurchase = async () => {
    if (!address || !isConnected) {
      setError('Please connect your wallet');
      return;
    }

    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      setError('Please enter a valid ETH amount');
      return;
    }

    if (parseFloat(ethAmount) > parseFloat(ethBalance)) {
      setError('Insufficient ETH balance');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // For now, we'll simulate a token purchase
      // In a real implementation, you'd integrate with a DEX like Uniswap
      // or create a direct purchase mechanism
      
      // This is a placeholder - you'll need to implement the actual purchase logic
      // based on your token's distribution mechanism
      
      setError('Token purchase functionality needs to be implemented with your specific token distribution mechanism');
      
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      setError('Failed to purchase tokens. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEthAmount(TOKEN_CONFIG.purchase.defaultEthAmount);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Purchase GoodCoin Tokens</h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {!isConnected ? (
            <div className="error-message">
              Please connect your wallet to purchase tokens
            </div>
          ) : (
            <>
              {/* Balance Display */}
              <div className="balance-section">
                <div className="balance-item">
                  <span className="balance-label">ETH Balance:</span>
                  <span className="balance-value">{parseFloat(ethBalance).toFixed(4)} ETH</span>
                </div>
                <div className="balance-item">
                  <span className="balance-label">GOOD Balance:</span>
                  <span className="balance-value">{parseFloat(tokenBalance).toFixed(4)} GOOD</span>
                </div>
              </div>

              {/* Purchase Form */}
              <div className="purchase-form">
                <div className="form-group">
                  <label htmlFor="ethAmount">ETH Amount</label>
                  <div className="input-group">
                    <input
                      type="number"
                      id="ethAmount"
                      value={ethAmount}
                      onChange={(e) => setEthAmount(e.target.value)}
                      min={TOKEN_CONFIG.purchase.minEthAmount}
                      max={TOKEN_CONFIG.purchase.maxEthAmount}
                      step="0.001"
                      placeholder="0.01"
                    />
                    <span className="input-suffix">ETH</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>You will receive</label>
                  <div className="token-amount-display">
                    <span className="token-amount">{parseFloat(tokenAmount).toFixed(4)}</span>
                    <span className="token-symbol">GOOD</span>
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    className="btn-secondary"
                    onClick={handleClose}
                    disabled={isLoading || isPending || isConfirming}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handlePurchase}
                    disabled={isLoading || isPending || isConfirming || !ethAmount}
                  >
                    {isLoading || isPending || isConfirming ? 'Processing...' : 'Purchase Tokens'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
