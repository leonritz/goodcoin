'use client';

import { useState } from 'react';
import { Post, User } from '../model';
import { postController } from '../controller';
import CommentSection from './CommentSection';
import DonationModal from './DonationModal';
import '../styles/post-card.css';

interface PostCardProps {
  post: Post;
  creator: User | undefined;
  currentUserFid: string;
  currentUserBalance: number;
  onUpdate: () => void;
}

export default function PostCard({
  post,
  creator,
  currentUserFid,
  currentUserBalance,
  onUpdate,
}: PostCardProps) {
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [hasLiked, setHasLiked] = useState(
    postController.hasUserLikedPost(post.id, currentUserFid)
  );

  const handleLike = () => {
    if (hasLiked) {
      postController.unlikePost(post.id, currentUserFid);
      setHasLiked(false);
    } else {
      postController.likePost(post.id, currentUserFid);
      setHasLiked(true);
    }
    onUpdate();
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
          <img
            src={post.mediaUrl}
            alt="Post media"
            className="post-media-image"
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
          <svg fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{post.likesCount}</span>
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className="post-action-button post-action-comment"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{post.commentsCount}</span>
        </button>

        {post.creatorFid !== currentUserFid && (
          <button
            onClick={() => setShowDonationModal(true)}
            className="post-action-button post-action-donate"
            title="Donate Goodcoins"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Donate</span>
          </button>
        )}

        {post.donationsReceived > 0 && (
          <div className="post-donations-badge">
            💰 {post.donationsReceived}
          </div>
        )}
      </div>

      {/* Comments Section */}
      <CommentSection 
        postId={post.id} 
        currentUserFid={currentUserFid}
        showComments={showComments}
        onUpdate={onUpdate}
      />

      {/* Donation Modal */}
      {showDonationModal && creator && (
        <DonationModal
          postId={post.id}
          recipientFid={post.creatorFid}
          recipientName={creator.displayName}
          currentUserFid={currentUserFid}
          currentUserBalance={currentUserBalance}
          onClose={() => setShowDonationModal(false)}
          onDonationComplete={onUpdate}
        />
      )}
    </div>
  );
}



