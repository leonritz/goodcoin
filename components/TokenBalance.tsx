'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { tokenService } from '../lib/tokenService';
import { TOKEN_CONFIG } from '../lib/tokenConfig';

interface TokenBalanceProps {
  className?: string;
  showEthBalance?: boolean;
  showRefreshButton?: boolean;
}

export default function TokenBalance({ 
  className = '', 
  showEthBalance = true, 
  showRefreshButton = true 
}: TokenBalanceProps) {
  const { address, isConnected } = useAccount();
  const [tokenBalance, setTokenBalance] = useState('0');
  const [ethBalance, setEthBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBalances = useCallback(async (retryCount = 0) => {
    if (!address || !isConnected) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const [ethBal, tokenBal] = await Promise.all([
        tokenService.getEthBalance(address),
        tokenService.getTokenBalance(address),
      ]);
      
      setEthBalance(ethBal);
      setTokenBalance(tokenBal.formattedBalance);
      setLastUpdated(new Date());
    } catch (error: unknown) {
      console.error('Error loading balances:', error);
      
      // If it's a rate limit error and we haven't retried too many times, retry
      if ((error instanceof Error && (error.message?.includes('rate limit') || error.message?.includes('429'))) && retryCount < 2) {
        console.log(`Rate limit hit, retrying in ${(retryCount + 1) * 2} seconds...`);
        setError(`Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          loadBalances(retryCount + 1);
        }, (retryCount + 1) * 2000);
        return;
      }
      
      // Set fallback values and error message
      setEthBalance('0');
      setTokenBalance('0');
      setError('Failed to load balances. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    if (address && isConnected) {
      loadBalances();
    }
  }, [address, isConnected, loadBalances]);

  const formatBalance = (balance: string, decimals: number = 4): string => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(decimals);
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!isConnected) {
    return (
      <div className={`token-balance ${className}`}>
        <div className="balance-item">
          <span className="balance-label">Connect wallet to view balance</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`token-balance ${className}`}>
      <div className="balance-header">
        <h3>Wallet Balance</h3>
        {showRefreshButton && (
          <button 
            className="refresh-button"
            onClick={() => loadBalances()}
            disabled={isLoading}
            title="Refresh balances"
          >
            {isLoading ? '⟳' : '↻'}
          </button>
        )}
      </div>

      <div className="balance-items">
        <div className="balance-item primary">
          <div className="balance-info">
            <span className="balance-label">{TOKEN_CONFIG.symbol} Tokens</span>
            <span className="balance-value">
              {isLoading ? '...' : formatBalance(tokenBalance)}
            </span>
          </div>
          <div className="balance-symbol">{TOKEN_CONFIG.symbol}</div>
        </div>

        {showEthBalance && (
          <div className="balance-item secondary">
            <div className="balance-info">
              <span className="balance-label">ETH</span>
              <span className="balance-value">
                {isLoading ? '...' : formatBalance(ethBalance)}
              </span>
            </div>
            <div className="balance-symbol">ETH</div>
          </div>
        )}
      </div>

      {error && (
        <div className="balance-footer">
          <span className="error-message" style={{ color: '#dc3545', fontSize: '0.75rem' }}>
            {error}
          </span>
        </div>
      )}

      {lastUpdated && !error && (
        <div className="balance-footer">
          <span className="last-updated">
            Updated {formatTimeAgo(lastUpdated)}
          </span>
        </div>
      )}
    </div>
  );
}
