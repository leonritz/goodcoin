'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { postController, userController } from '../controller';
import { Post } from '../model';
import PostCard from './PostCard';
import CreatePostForm from './CreatePostForm';
import AuthModal from './AuthModal';
import '../styles/feed.css';
import '../styles/auth-modal.css';

interface FeedProps {
  currentUserFid: string;
}

export default function Feed({ currentUserFid }: FeedProps) {
  const router = useRouter();
  const { user, disconnect } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUserBalance, setCurrentUserBalance] = useState(0);
  const [isPostFormExpanded, setIsPostFormExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const loadFeed = useCallback(async () => {
    try {
      setIsLoading(true);
      const allPosts = await postController.getAllPosts();
      setPosts(allPosts);
      
      const balance = await userController.getUserBalance(currentUserFid);
      setCurrentUserBalance(balance);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserFid]);

  const handleProfileClick = () => {
    if (user?.isAuthenticated) {
      router.push('/profile');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    router.push('/');
  };

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  return (
    <div className="feed-container">
      {/* Header */}
      <div className="feed-header">
        <div className="feed-header-content">
          <h1 className="feed-title">Goodcoin</h1>
          <div className="feed-balance-container">
            {/* User Info Display */}
            {user?.isAuthenticated && (
              <div className="feed-user-info" title={user?.address || user?.fid}>
                <div className="feed-user-avatar">
                  <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                    {user?.authMethod === 'wallet' ? '₿' : '◉'}
                  </span>
                </div>
                <span className="feed-user-name">
                  {user?.displayName || user?.username || 
                   (user?.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : 'User')}
                </span>
                {user?.authMethod === 'wallet' && user?.address && (
                  <span className="feed-user-badge">WALLET</span>
                )}
              </div>
            )}
            
            <div className="feed-balance-badge">
              <span className="feed-balance-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>$</span>
                {currentUserBalance} Coins
              </span>
            </div>
            <button
              onClick={handleProfileClick}
              className="feed-profile-button"
              title={user?.isAuthenticated ? "View Profile" : "Sign In"}
            >
              <span style={{ fontSize: '1.3em', fontWeight: 'bold' }}>⚙</span>
            </button>
            {user?.isAuthenticated && (
              <button
                onClick={handleDisconnect}
                className="feed-profile-button feed-disconnect-button"
                title="Disconnect"
              >
                <span style={{ fontSize: '1.3em', fontWeight: 'bold' }}>×</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="feed-content">
        {/* Collapsible Post Creation Area */}
        <div className="post-creation-container">
          {!isPostFormExpanded ? (
            <div 
              className="post-creation-trigger"
              onClick={() => setIsPostFormExpanded(true)}
            >
              <div className="post-creation-avatar">
                <span style={{ fontSize: '1.8em', fontWeight: 'bold' }}>+</span>
              </div>
              <div className="post-creation-placeholder">
                Share something positive...
              </div>
            </div>
          ) : (
            <div className="post-creation-expanded">
              <CreatePostForm
                currentUserFid={currentUserFid}
                onPostCreated={() => {
                  loadFeed();
                  setIsPostFormExpanded(false);
                }}
                onCancel={() => setIsPostFormExpanded(false)}
              />
            </div>
          )}
        </div>

        {/* Feed */}
        <div>
          {isLoading ? (
            <div className="feed-empty-state">
              <p>Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="feed-empty-state">
              <p>No posts yet. Be the first to share something positive!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserFid={currentUserFid}
                currentUserBalance={currentUserBalance}
                onUpdate={loadFeed}
              />
            ))
          )}
        </div>
      </div>
      
      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}
