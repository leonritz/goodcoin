'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Post, User } from '../model';
import { postController, userController } from '../controller';
import CommentSection from './CommentSection';
import EnhancedDonationModal from './EnhancedDonationModal';
import '../styles/post-card.css';

interface PostCardProps {
  post: Post;
  currentUserFid: string;
  onUpdate: () => void;
}

export default function PostCard({
  post,
  currentUserFid,
  onUpdate,
}: PostCardProps) {
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasFlagged, setHasFlagged] = useState(false);
  const [flagCount, setFlagCount] = useState(0);
  const [creator, setCreator] = useState<User | undefined>(undefined);

  useEffect(() => {
    const loadData = async () => {
      const isLiked = await postController.hasUserLikedPost(post.id, currentUserFid);
      setHasLiked(isLiked);
      
      const user = await userController.getUserByFid(post.creatorFid);
      setCreator(user);

      // Load flag status
      try {
        const response = await fetch(`/api/posts/flags?postId=${post.id}&userFid=${currentUserFid}`);
        if (response.ok) {
          const data = await response.json();
          setHasFlagged(data.hasFlagged || false);
          setFlagCount(data.flagCount || 0);
        }
      } catch (error) {
        console.error('Error loading flag status:', error);
      }
    };
    loadData();
  }, [post.id, post.creatorFid, currentUserFid]);

  const handleLike = async () => {
    try {
      if (hasLiked) {
        await postController.unlikePost(post.id, currentUserFid);
        setHasLiked(false);
      } else {
        await postController.likePost(post.id, currentUserFid);
        setHasLiked(true);
      }
      onUpdate();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleFlag = async () => {
    try {
      const response = await fetch('/api/posts/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          userFid: currentUserFid,
          action: hasFlagged ? 'unflag' : 'flag',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setHasFlagged(!hasFlagged);
        setFlagCount(data.flagCount);
      }
    } catch (error) {
      console.error('Error toggling flag:', error);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="post-card">
      {/* User Info */}
      <div className="post-card-header">
        <div className="post-avatar">
          {creator?.displayName?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="post-user-info">
          <h3>{creator?.displayName || 'Unknown User'}</h3>
          <p>{formatTimeAgo(post.createdAt)}</p>
        </div>
      </div>

      {/* Post Content */}
      <p className="post-description">{post.description}</p>

      {/* Media */}
      {post.mediaUrl && post.mediaType === 'photo' && (
        <div className="post-media-container">
          <Image
            src={post.mediaUrl}
            alt="Post media"
            className="post-media-image"
            width={600}
            height={400}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      )}
      {post.mediaUrl && post.mediaType === 'video' && (
        <div className="post-media-container">
          <video
            src={post.mediaUrl}
            controls
            className="post-media-video"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="post-actions">
        <button
          onClick={handleLike}
          className={`post-action-button post-action-like ${hasLiked ? 'liked' : ''}`}
        >
          <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>{hasLiked ? '♥' : '♡'}</span>
          <span>{post.likesCount}</span>
        </button>
        
        <button
          onClick={() => setShowComments(!showComments)}
          className="post-action-button post-action-comment"
        >
          <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>💬</span>
          <span>{post.commentsCount}</span>
        </button>

        <button
          onClick={() => setShowDonationModal(true)}
          className="post-action-button post-action-donate"
        >
          <span>Donate</span>
        </button>

        <button
          onClick={handleFlag}
          className={`post-action-button post-action-flag ${hasFlagged ? 'flagged' : ''}`}
          title={hasFlagged ? "Unflag this post" : "Report suspicious content"}
        >
          <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>⚑</span>
          {flagCount > 0 && <span className="flag-count">{flagCount}</span>}
        </button>
      </div>

      {/* Donations Display */}
      {post.donationsReceived > 0 && (
        <div className="post-donations-badge">
          <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>🪙</span>
          {post.donationsReceived} GOOD tokens donated
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <CommentSection
          postId={post.id}
          currentUserFid={currentUserFid}
          onCommentAdded={onUpdate}
        />
      )}

          {/* Enhanced Donation Modal - Rendered via Portal to body */}
          {showDonationModal && typeof document !== 'undefined' && createPortal(
              <EnhancedDonationModal
                postId={post.id}
                recipientFid={post.creatorFid}
                recipientName={creator?.displayName || 'Unknown User'}
                currentUserFid={currentUserFid}
                onClose={() => setShowDonationModal(false)}
                onDonationComplete={onUpdate}
              />,
              document.body
            )}
    </div>
  );
}
