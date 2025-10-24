'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';
import { userController } from '../controller';

export interface User {
  fid?: string;
  address?: string;
  username?: string;
  displayName?: string;
  profileImage?: string;
  isAuthenticated: boolean;
  authMethod: 'farcaster' | 'wallet' | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isConnected: boolean;
  connectUser: (method: 'farcaster' | 'wallet') => Promise<void>;
  disconnect: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect: disconnectWallet } = useDisconnect();

  // Initialize authentication
  useEffect(() => {
    initializeAuth();
  }, []);

  // Listen for auth state changes from skip authentication
  useEffect(() => {
    const handleAuthStateChange = () => {
      initializeAuth();
    };

    window.addEventListener('authStateChanged', handleAuthStateChange);
    return () => window.removeEventListener('authStateChanged', handleAuthStateChange);
  }, []);

  // Update user when wallet connection changes
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (isConnected && address) {
        // User connected via wallet - create user in controller
        const walletUser = await userController.getOrCreateUserFromWallet(address);
        setUser({
          fid: walletUser.fid,
          address,
          isAuthenticated: true,
          authMethod: 'wallet',
          username: walletUser.username,
          displayName: walletUser.displayName,
          profileImage: walletUser.profileImage,
        });
        
        // Save auth state
        localStorage.setItem('goodcoin_auth', JSON.stringify({
          method: 'wallet',
          address: address,
        }));
      } else if (!isConnected && user?.authMethod === 'wallet') {
        // User disconnected wallet
        setUser(null);
        localStorage.removeItem('goodcoin_auth');
      }
    };
    
    handleWalletConnection();
  }, [isConnected, address]);

      const initializeAuth = async () => {
        try {
          // Check for skip authentication first
          const savedAuth = localStorage.getItem('goodcoin_auth');
          if (savedAuth) {
            const authData = JSON.parse(savedAuth);
            if (authData.method === 'farcaster' && authData.fid === 'test_user_123') {
              // Skip authentication user
              console.log('Skip authentication: Creating test user');
              const testUser = await userController.getOrCreateUserFromFarcaster('test_user_123', 'test_user', 'Test User');
              setUser({
                fid: 'test_user_123',
                isAuthenticated: true,
                authMethod: 'farcaster',
                username: testUser.username,
                displayName: testUser.displayName,
                profileImage: testUser.profileImage,
              });
              setIsLoading(false);
              return;
            }
          }
          
          // Development mode: skip Farcaster SDK initialization on localhost
          const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
          
          if (isDevelopment) {
            // Development fallback: create mock Farcaster user
            console.log('Development mode: Creating mock Farcaster user');
            const mockFid = 'dev_farcaster_user_123';
            const farcasterUser = await userController.getOrCreateUserFromFarcaster(mockFid, 'dev_user', 'Dev Farcaster User');
            setUser({
              fid: mockFid,
              isAuthenticated: true,
              authMethod: 'farcaster',
              username: farcasterUser.username,
              displayName: farcasterUser.displayName,
              profileImage: farcasterUser.profileImage,
            });
            setIsLoading(false);
            return;
          }
          
          // Production mode: Initialize Farcaster SDK and try auth
          try {
            sdk.actions.ready();
            
            const response = await sdk.quickAuth.fetch('/api/auth');
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.user) {
                // Create user in controller
                const farcasterUser = await userController.getOrCreateUserFromFarcaster(data.user.fid);
                setUser({
                  fid: data.user.fid,
                  isAuthenticated: true,
                  authMethod: 'farcaster',
                  username: farcasterUser.username,
                  displayName: farcasterUser.displayName,
                  profileImage: farcasterUser.profileImage,
                });
                setIsLoading(false);
                return;
              }
            }
          } catch (error) {
            console.log('Farcaster auth not available in production:', error);
          }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Auth initialization error:', error);
      setIsLoading(false);
    }
  };

      const connectUser = async (method: 'farcaster' | 'wallet') => {
        setIsLoading(true);
        
        try {
          if (method === 'farcaster') {
            // Check if we're in development mode
            const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
            
            if (isDevelopment) {
              // Development mode: create mock Farcaster user
              console.log('Creating mock Farcaster user for development');
              const mockFid = 'dev_farcaster_user_123';
              const farcasterUser = await userController.getOrCreateUserFromFarcaster(mockFid, 'dev_user', 'Dev Farcaster User');
              const newUser: User = {
                fid: mockFid,
                isAuthenticated: true,
                authMethod: 'farcaster',
                username: farcasterUser.username,
                displayName: farcasterUser.displayName,
                profileImage: farcasterUser.profileImage,
              };
              setUser(newUser);
              localStorage.setItem('goodcoin_auth', JSON.stringify({
                method: 'farcaster',
                fid: mockFid,
              }));
            } else {
              // Production mode: Use Farcaster Quick Auth
              try {
                sdk.actions.ready();
                const response = await sdk.quickAuth.fetch('/api/auth');
                if (response.ok) {
                  const data = await response.json();
                  if (data.success && data.user) {
                    // Create user in controller
                    const farcasterUser = await userController.getOrCreateUserFromFarcaster(data.user.fid);
                    const newUser: User = {
                      fid: data.user.fid,
                      isAuthenticated: true,
                      authMethod: 'farcaster',
                      username: farcasterUser.username,
                      displayName: farcasterUser.displayName,
                      profileImage: farcasterUser.profileImage,
                    };
                    setUser(newUser);
                    localStorage.setItem('goodcoin_auth', JSON.stringify({
                      method: 'farcaster',
                      fid: data.user.fid,
                    }));
                  }
                }
              } catch (error) {
                console.error('Farcaster auth failed:', error);
                throw new Error('Farcaster authentication failed');
              }
            }
      } else if (method === 'wallet') {
        // Connect to the first available wallet connector
        const walletConnector = connectors.find(c => 
          c.name === 'MetaMask' || 
          c.name === 'WalletConnect' || 
          c.name === 'Coinbase Wallet'
        );
        
        if (walletConnector) {
          await connect({ connector: walletConnector });
        } else {
          throw new Error('No wallet connector available');
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    if (user?.authMethod === 'wallet') {
      disconnectWallet();
    }
    setUser(null);
    localStorage.removeItem('goodcoin_auth');
  };

      const refreshUser = async () => {
        if (user?.authMethod === 'farcaster') {
          try {
            // Skip refresh in development mode
            const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
            if (isDevelopment) {
              return;
            }
            
            sdk.actions.ready();
            const response = await sdk.quickAuth.fetch('/api/auth');
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.user) {
                setUser(prev => prev ? {
                  ...prev,
                  fid: data.user.fid,
                } : null);
              }
            }
          } catch (error) {
            console.error('Failed to refresh Farcaster user:', error);
          }
        }
      };

  const value: AuthContextType = {
    user,
    isLoading,
    isConnected,
    connectUser,
    disconnect,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
