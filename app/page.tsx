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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading Goodcoin...</p>
        </div>
      </div>
    );
  }

  return <Feed currentUserFid={currentUserFid} />;
}
