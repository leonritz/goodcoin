'use client';

import { useEffect, useState } from 'react';
import { userController } from '../controller';
import Feed from '../components/Feed';

export default function Home() {
  const [currentUserFid, setCurrentUserFid] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  if (!currentUserFid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return <Feed currentUserFid={currentUserFid} />;
}
