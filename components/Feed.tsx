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
            <div className="feed-balance-badge">
              <span className="feed-balance-text">
                💰 {currentUserBalance} Coins
              </span>
            </div>
            <button
              onClick={handleProfileClick}
              className="feed-profile-button"
              title={user?.isAuthenticated ? "View Profile" : "Sign In"}
            >
              <svg className="feed-profile-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            {user?.isAuthenticated && (
              <button
                onClick={handleDisconnect}
                className="feed-profile-button"
                title="Disconnect"
                style={{ marginLeft: '0.5rem' }}
              >
                <svg className="feed-profile-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
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
                ?
              </div>
              <div className="post-creation-placeholder">
                Spread Positivity...
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
