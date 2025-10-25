'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { tokenService } from '../lib/tokenService';
import { TOKEN_CONFIG } from '../lib/tokenConfig';

interface CompactTokenPurchaseProps {
  className?: string;
}

export default function CompactTokenPurchase({ className = '' }: CompactTokenPurchaseProps) {
  const { address, isConnected } = useAccount();
  const [tokenBalance, setTokenBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  const loadTokenBalance = useCallback(async () => {
    if (!address || !isConnected) return;
    
    setIsLoading(true);
    try {
      const balance = await tokenService.getTokenBalance(address);
      setTokenBalance(balance.formattedBalance);
    } catch (error) {
      console.error('Error loading token balance:', error);
      setTokenBalance('0');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    if (address && isConnected) {
      loadTokenBalance();
    }
  }, [address, isConnected, loadTokenBalance]);

  const handleBuyTokens = () => {
    const uniswapUrl = `https://app.uniswap.org/#/swap?chain=base&inputCurrency=ETH&outputCurrency=${TOKEN_CONFIG.address}`;
    window.open(uniswapUrl, '_blank');
  };

  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(4);
  };

  return (
    <div className={`compact-token-purchase ${className}`}>
      <div className="token-balance-display">
        <div className="balance-info">
          <span className="balance-label">GOOD Tokens:</span>
          <span className="balance-value">
            {isLoading ? '...' : formatBalance(tokenBalance)}
          </span>
        </div>
        {isConnected && (
          <button
            onClick={loadTokenBalance}
            className="refresh-btn"
            disabled={isLoading}
            title="Refresh balance"
          >
            {isLoading ? '⟳' : '↻'}
          </button>
        )}
      </div>
      
      <button
        onClick={handleBuyTokens}
        className="buy-tokens-btn"
        disabled={!isConnected}
      >
        {isConnected ? 'Buy GOOD Tokens' : 'Connect Wallet to Buy'}
      </button>
    </div>
  );
}
