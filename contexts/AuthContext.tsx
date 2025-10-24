'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
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
  
  // Fetch ENS name from mainnet
  const { data: ensName } = useEnsName({
    address: address,
    chainId: mainnet.id,
  });
  
  // Fetch Basename from Base
  const { data: basename } = useEnsName({
    address: address,
    chainId: base.id,
  });

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
      try {
        console.log('useEffect triggered - isConnected:', isConnected, 'address:', address);
        
        if (isConnected && address) {
          // Check if we already have this user authenticated
          if (user?.address === address && user?.authMethod === 'wallet') {
            console.log('Wallet already authenticated:', address);
            return; // Already authenticated with this wallet
          }
          
          console.log('Authenticating wallet:', address);
          
          // User connected via wallet - create user in controller
          try {
            // Try to fetch Farcaster data for this wallet address
            let farcasterData = null;
            try {
              const fcResponse = await fetch(`https://api.warpcast.com/v2/verifications?address=${address}`);
              if (fcResponse.ok) {
                const fcData = await fcResponse.json();
                if (fcData.result?.fid) {
                  farcasterData = {
                    fid: fcData.result.fid,
                    username: fcData.result.username,
                    displayName: fcData.result.displayName,
                  };
                  console.log('Found Farcaster account for wallet:', farcasterData);
                }
              }
            } catch (fcError) {
              console.log('No Farcaster account found for this wallet');
            }
            
            // Priority: Farcaster displayName > Basename > ENS > truncated address
            const displayName = farcasterData?.displayName || basename || ensName || null;
            const username = farcasterData?.username || basename || ensName || null;
            console.log('Resolved names:', { farcaster: farcasterData, basename, ensName, address });
            
            const walletUser = await userController.getOrCreateUserFromWallet(address, username, displayName);
            console.log('Got wallet user from controller:', walletUser);
            
            const newUser = {
              fid: walletUser.fid,
              address,
              isAuthenticated: true,
              authMethod: 'wallet' as const,
              username: walletUser.username,
              displayName: walletUser.displayName,
              profileImage: walletUser.profileImage,
            };
            
            console.log('Setting wallet user:', newUser);
            setUser(newUser);
            
            // Save auth state
            localStorage.setItem('goodcoin_auth', JSON.stringify({
              method: 'wallet',
              address: address,
            }));
            console.log('Wallet authentication complete!');
          } catch (error) {
            console.error('Error creating wallet user:', error);
            // Still set isLoading to false so user can try again
          }
          
          setIsLoading(false);
        } else if (!isConnected && user?.authMethod === 'wallet') {
          // User disconnected wallet
          console.log('Wallet disconnected');
          setUser(null);
          localStorage.removeItem('goodcoin_auth');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error in handleWalletConnection:', error);
        setIsLoading(false);
      }
    };
    
    handleWalletConnection();
  }, [isConnected, address, user?.address, user?.authMethod, ensName, basename]);

  const initializeAuth = async () => {
    try {
      // Check for saved authentication
      const savedAuth = localStorage.getItem('goodcoin_auth');
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        
        // Wallet authentication - wait for wagmi to connect
        if (authData.method === 'wallet' && authData.address) {
          console.log('Restoring wallet authentication for:', authData.address);
          // The wallet connection will be handled by the useEffect that watches isConnected/address
          // Just wait a moment for wagmi to initialize
          setIsLoading(false);
          return;
        }
      }
      
      // Check if we're in development mode (localhost) or production
      const isDevelopment = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('localhost'));
      
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
        console.log('Production mode: Initializing Farcaster SDK');
        sdk.actions.ready();
        
        const response = await sdk.quickAuth.fetch('/api/auth');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            console.log('Farcaster auth successful:', data.user);
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
        } else {
          console.log('Farcaster auth response not ok:', response.status);
        }
      } catch (error) {
        console.log('Farcaster auth not available in production:', error);
        // In production, if Farcaster fails, we should still allow wallet connections
        // Don't throw error, just continue
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
        const isDevelopment = typeof window !== 'undefined' && 
          (window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('localhost'));
        
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
        // Check if wallet is already connected
        if (isConnected && address) {
          console.log('Wallet already connected:', address);
          // The useEffect will handle authentication
          setIsLoading(false);
          return;
        }
        
        // Connect to the first available wallet connector
        const walletConnector = connectors.find(c => 
          c.name === 'MetaMask' || 
          c.name === 'WalletConnect' || 
          c.name === 'Coinbase Wallet' ||
          c.name === 'Phantom'
        );
        
        if (walletConnector) {
          console.log('Connecting to wallet:', walletConnector.name);
          await connect({ connector: walletConnector });
          // The useEffect will handle setting the user after connection
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
        const isDevelopment = typeof window !== 'undefined' && 
          (window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('localhost'));
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
