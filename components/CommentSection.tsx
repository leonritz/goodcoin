'use client';

import { useState, useEffect } from 'react';
import { commentController, userController } from '../controller';
import { Comment } from '../model';
import '../styles/forms.css';

interface CommentSectionProps {
  postId: string;
  currentUserFid: string;
  showComments: boolean;
  onUpdate: () => void;
}

export default function CommentSection({ postId, currentUserFid, showComments, onUpdate }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const loadComments = () => {
    const postComments = commentController.getCommentsByPost(postId);
    setComments(postComments);
  };

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments, postId]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    const comment = commentController.createComment(postId, currentUserFid, newComment);
    if (comment) {
      setNewComment('');
      loadComments();
      onUpdate(); // Notify parent to refresh post data
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
    <>
      {showComments && (
        <div className="comments-section">
          {/* Comment List */}
          <div style={{ maxHeight: '20rem', overflowY: 'auto', marginBottom: '1rem' }}>
            {comments.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem' }}>
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => {
                const commenter = userController.getUserByFid(comment.creatorFid);
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
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="comment-submit-button"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}



