'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useConnect } from 'wagmi';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { connectUser, isLoading } = useAuth();
  const { connectors, connect: connectWallet } = useConnect();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (method: 'farcaster' | 'wallet') => {
    setIsConnecting(true);
    setError(null);
    
    try {
      await connectUser(method);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWalletConnect = async (connectorName: string) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log('Attempting to connect wallet...');
      const connector = connectors.find(c => c.name === connectorName);
      if (connector) {
        await connectWallet({ connector });
        console.log('Wallet connection successful');
        onClose();
      } else {
        throw new Error(`${connectorName} not available`);
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
      // Handle specific error types
      if (err instanceof Error) {
        if (err.message.includes('User rejected')) {
          setError('Connection cancelled by user');
        } else if (err.message.includes('Already processing')) {
          setError('Connection already in progress');
        } else {
          setError('Connection failed. Please try again.');
        }
      } else {
        setError('Connection failed. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2 className="auth-modal-title">Connect to Goodcoin</h2>
          <button className="auth-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="auth-modal-content">
          <p className="auth-modal-description">
            Choose how you&apos;d like to connect to Goodcoin
          </p>

          {error && (
            <div className="auth-modal-error">
              {error}
            </div>
          )}

          <div className="auth-options">
            {/* Farcaster Option */}
            <button
              className="auth-option farcaster-option"
              onClick={() => handleConnect('farcaster')}
              disabled={isConnecting || isLoading}
            >
              <div className="auth-option-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="auth-option-content">
                <h3 className="auth-option-title">Farcaster</h3>
                <p className="auth-option-description">Connect with your Farcaster account</p>
              </div>
            </button>

            {/* Wallet Options */}
            <div className="wallet-options">
              <h4 className="wallet-options-title">Connect Wallet</h4>
              
              {/* Debug info - remove this later */}
              <div style={{ fontSize: '10px', color: '#666', marginBottom: '10px' }}>
                Available connectors: {connectors.map(c => `${c.name} (${c.type})`).join(', ')}
              </div>
              <div style={{ fontSize: '10px', color: '#666', marginBottom: '10px' }}>
                Filtered connectors: {connectors
                  .filter((connector, index, self) => 
                    index === self.findIndex(c => c.name === connector.name) &&
                    connector.name !== 'Injected'
                  )
                  .map(c => c.name).join(', ')}
              </div>
              
              {connectors
                .filter((connector, index, self) => 
                  // Remove duplicates by name and filter out generic "Injected" connector
                  index === self.findIndex(c => c.name === connector.name) &&
                  connector.name !== 'Injected'
                )
                .map((connector) => (
                <button
                  key={connector.name}
                  className="auth-option wallet-option"
                  onClick={() => handleWalletConnect(connector.name)}
                  disabled={isConnecting || isLoading}
                >
                  <div className="auth-option-icon">
                    {connector.name === 'MetaMask' && (
                      <svg width="24" height="24" viewBox="0 0 318.6 318.6" fill="currentColor">
                        <path d="M274.1 35.5l99.5 299.3-101.1-29.2-27.4-90.5c0 0-9.5 12.1-20.4 12.1s-20.4-12.1-20.4-12.1l-27.4 90.5-101.1 29.2L274.1 35.5z"/>
                      </svg>
                    )}
                    {connector.name === 'Coinbase Wallet' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
                      </svg>
                    )}
                    {connector.name === 'WalletConnect' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
                      </svg>
                    )}
                    {connector.name === 'Phantom' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
                      </svg>
                    )}
                    {!['MetaMask', 'Coinbase Wallet', 'WalletConnect', 'Phantom'].includes(connector.name) && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
                      </svg>
                    )}
                  </div>
                  <div className="auth-option-content">
                    <h3 className="auth-option-title">{connector.name}</h3>
                    <p className="auth-option-description">Connect with {connector.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {(isConnecting || isLoading) && (
            <div className="auth-loading">
              <div className="spinner"></div>
              <p>Connecting...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
