'use client';

import { sdk } from '@farcaster/miniapp-sdk';

import { useEffect, useState } from 'react';
import { userController } from '../controller';
import Feed from '../components/Feed';

export default function Home() {
  const [currentUserFid, setCurrentUserFid] = useState<string>('test_user_alice');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize on client side only
    if (typeof window !== 'undefined') {
      sdk.actions.ready();
      // TODO: In production, this will come from Farcaster miniapp context
      // For testing, use two fixed users: Alice and Bob
      let mockFid = localStorage.getItem('currentUserFid');
      
      if (!mockFid) {
        // Default to Alice on first load
        mockFid = 'test_user_alice';
        localStorage.setItem('currentUserFid', mockFid);
      }
      
      // Create both test users
      userController.getOrCreateUser('test_user_alice', 'alice', 'Alice 👩', undefined);
      userController.getOrCreateUser('test_user_bob', 'bob', 'Bob 👨', undefined);
      
      setCurrentUserFid(mockFid);
      setIsLoading(false);
    }
  }, []);

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

  return <Feed currentUserFid={currentUserFid} />;
}
