'use client';

import { useState, useEffect, useCallback } from 'react';
import { commentController, userController } from '../controller';
import { Comment, User } from '../model';
import '../styles/forms.css';

interface CommentSectionProps {
  postId: string;
  currentUserFid: string;
  onCommentAdded: () => void;
}

export default function CommentSection({ postId, currentUserFid, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commenters, setCommenters] = useState<Map<string, User>>(new Map());

  const loadComments = useCallback(async () => {
    try {
      const postComments = await commentController.getCommentsByPost(postId);
      setComments(postComments);
      
      // Load commenter data
      const userMap = new Map<string, User>();
      for (const comment of postComments) {
        if (!userMap.has(comment.creatorFid)) {
          const user = await userController.getUserByFid(comment.creatorFid);
          if (user) {
            userMap.set(comment.creatorFid, user);
          }
        }
      }
      setCommenters(userMap);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    
    try {
      const comment = await commentController.createComment(postId, currentUserFid, newComment);
      if (comment) {
        setNewComment('');
        loadComments();
        onCommentAdded();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="comments-section">
      {/* Comment List */}
      <div style={{ maxHeight: '20rem', overflowY: 'auto', marginBottom: '1rem' }}>
        {comments.length === 0 ? (
          <p style={{ 
            textAlign: 'center', 
            color: 'var(--text-secondary)', 
            padding: '1.5rem',
            fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace",
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: '700'
          }}>
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => {
            const commenter = commenters.get(comment.creatorFid);
            return (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">
                    {commenter?.displayName || 'Unknown User'}
                  </span>
                  <span className="comment-timestamp">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="comment-form">
        <div className="comment-input-group">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="comment-input"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="comment-submit-button"
          >
            {isSubmitting ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
