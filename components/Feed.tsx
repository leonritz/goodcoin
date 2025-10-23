'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { postController, userController } from '../controller';
import { Post } from '../model';
import PostCard from './PostCard';
import CreatePostForm from './CreatePostForm';
import '../styles/feed.css';

interface FeedProps {
  currentUserFid: string;
}

export default function Feed({ currentUserFid }: FeedProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUserBalance, setCurrentUserBalance] = useState(0);

  const loadFeed = useCallback(() => {
    const allPosts = postController.getAllPosts();
    setPosts(allPosts);
    
    const balance = userController.getUserBalance(currentUserFid);
    setCurrentUserBalance(balance);
  }, [currentUserFid]);

  const switchUser = () => {
    // Toggle between two fixed test users
    const user1Fid = 'test_user_alice';
    const user2Fid = 'test_user_bob';
    
    // Create both users if they don't exist
    userController.getOrCreateUser(user1Fid, 'alice', 'Alice 👩', undefined);
    userController.getOrCreateUser(user2Fid, 'bob', 'Bob 👨', undefined);
    
    // Toggle to the other user
    const newFid = currentUserFid === user1Fid ? user2Fid : user1Fid;
    localStorage.setItem('currentUserFid', newFid);
    window.location.reload();
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
            <button
              onClick={switchUser}
              className="feed-profile-button"
              title="Switch to New User (for testing)"
              style={{ marginRight: '0.5rem' }}
            >
              <svg className="feed-profile-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
            <div className="feed-balance-badge">
              <span className="feed-balance-text">
                💰 {currentUserBalance} Coins
              </span>
            </div>
            <button
              onClick={() => router.push('/profile')}
              className="feed-profile-button"
              title="View Profile"
            >
              <svg className="feed-profile-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="feed-content">
        {/* Create Post Form */}
        <CreatePostForm
          currentUserFid={currentUserFid}
          onPostCreated={loadFeed}
        />

        {/* Feed */}
        <div>
          {posts.length === 0 ? (
            <div className="feed-empty-state">
              <p>No posts yet. Be the first to share something positive!</p>
            </div>
          ) : (
            posts.map((post) => {
              const creator = userController.getUserByFid(post.creatorFid);
              return (
                <PostCard
                  key={post.id}
                  post={post}
                  creator={creator}
                  currentUserFid={currentUserFid}
                  currentUserBalance={currentUserBalance}
                  onUpdate={loadFeed}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}



