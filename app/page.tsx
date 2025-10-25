'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Feed from '../components/Feed';
import AuthModal from '../components/AuthModal';
import CompactTokenPurchase from '../components/CompactTokenPurchase';
import '../styles/token-balance.css';

export default function Home() {
  const { user, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    console.log('Home: Auth state changed:', { 
      isLoading, 
      isAuthenticated: user?.isAuthenticated,
      authMethod: user?.authMethod,
      fid: user?.fid,
      address: user?.address
    });
    
    // Show auth modal if user is not authenticated and not loading
    if (!isLoading && !user?.isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--background)',
        fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: '48px',
            height: '48px',
            border: '3px solid var(--primary-green-lighter)',
            borderTop: '3px solid var(--primary-green)',
            borderRadius: '0',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
          }}></div>
          <p style={{
            fontSize: '1.125rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>Loading Goodcoin...</p>
        </div>
      </div>
    );
  }

  if (!user?.isAuthenticated) {
    return (
      <>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--background)',
          fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace"
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: 'var(--primary-green)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '1rem'
            }}>Goodcoin</h1>
            <p style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              marginBottom: '2rem'
            }}>Connect to start spreading positivity</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="btn-primary"
            >
              Connect Wallet
            </button>
          </div>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    );
  }

      return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
          {/* Compact Token Purchase Section */}
          <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            <CompactTokenPurchase />
          </div>

          {/* Main Feed */}
          <Feed currentUserFid={user.fid || user.address || 'unknown'} />
        </div>
      );
}
