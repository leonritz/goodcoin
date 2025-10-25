import { User } from '../model';

/**
 * UserController handles all user-related operations using API
 */
class UserController {
  private readonly API_BASE = '/api/users';
  private userCache: Map<string, User> = new Map();
  private pendingRequests: Map<string, Promise<User | undefined>> = new Map();

  /**
   * Create or get existing user (for Farcaster login)
   */
  async getOrCreateUser(
    fid: string,
    username: string,
    displayName: string,
    profileImage?: string
  ): Promise<User> {
    try {
      console.log('UserController: Creating/getting user:', { fid, username, displayName });
      
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fid,
          username,
          displayName,
          profileImage,
        }),
      });

      console.log('UserController: POST response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('UserController: API error response:', errorData);
        throw new Error(`Failed to create/get user: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const userData = await response.json();
      console.log('UserController: User created/retrieved:', userData);
      
      const user = new User(
        userData.fid,
        userData.username,
        userData.displayName,
        userData.profileImage
      );
      
      // Cache the user immediately
      this.userCache.set(fid, user);
      console.log('UserController: ✅ User cached for future requests');
      
      return user;
    } catch (error) {
      console.error('UserController: Error creating/getting user:', error);
      throw error;
    }
  }

  /**
   * Create or get user from wallet address
   * Optionally accepts ENS/Basename for better display
   */
  async getOrCreateUserFromWallet(
    address: string, 
    ensName?: string | null,
    basename?: string | null
  ): Promise<User> {
    const fid = `wallet_${address}`;
    
    // Use basename first, then ENS, then truncated address
    const displayName = basename || ensName || `${address.slice(0, 6)}...${address.slice(-4)}`;
    const username = basename || ensName || `${address.slice(0, 6)}...${address.slice(-4)}`;
    
    return await this.getOrCreateUser(fid, username, displayName);
  }

  /**
   * Create or get user from Farcaster FID
   */
  async getOrCreateUserFromFarcaster(fid: string, username?: string, displayName?: string): Promise<User> {
    const finalUsername = username || `fid_${fid}`;
    const finalDisplayName = displayName || `Farcaster User ${fid}`;
    
    return await this.getOrCreateUser(fid, finalUsername, finalDisplayName);
  }

  /**
   * Get user by Farcaster ID
   */
  async getUserByFid(fid: string): Promise<User | undefined> {
    // Check cache first
    if (this.userCache.has(fid)) {
      return this.userCache.get(fid);
    }

    // Check if there's already a pending request for this user
    if (this.pendingRequests.has(fid)) {
      return this.pendingRequests.get(fid);
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        const response = await fetch(`${this.API_BASE}?fid=${fid}`);
        
        if (response.status === 404) {
          // User doesn't exist yet - this is normal, not an error
          return undefined;
        }

        if (!response.ok) {
          console.error('Error fetching user: HTTP', response.status);
          return undefined;
        }

        const userData = await response.json();
        const user = new User(
          userData.fid,
          userData.username,
          userData.displayName,
          userData.profileImage
        );
        user.createdAt = new Date(userData.createdAt);
        user.updatedAt = new Date(userData.updatedAt);
        
        // Cache the user
        this.userCache.set(fid, user);
        
        return user;
      } catch (error) {
        // Only log unexpected errors (network issues, etc.)
        if (error instanceof TypeError) {
          console.error('Network error fetching user:', error.message);
        } else {
          console.error('Unexpected error fetching user:', error);
        }
        return undefined;
      } finally {
        // Remove from pending requests
        this.pendingRequests.delete(fid);
      }
    })();

    this.pendingRequests.set(fid, requestPromise);
    return requestPromise;
  }

  // Removed virtual balance methods - only real token transfers now
}

// Singleton instance
export const userController = new UserController();
