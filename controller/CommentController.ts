import { Comment } from '../model';

/**
 * CommentController handles all comment-related operations using API
 */
class CommentController {
  private readonly API_BASE = '/api/comments';

  /**
   * Create a new comment on a post
   */
  async createComment(postId: string, creatorFid: string, text: string): Promise<Comment | null> {
    if (!text.trim()) return null;

    try {
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          creatorFid,
          text: text.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create comment');
      }

      const commentData = await response.json();
      const comment = new Comment(
        commentData.id,
        commentData.postId,
        commentData.creatorFid,
        commentData.text
      );
      comment.createdAt = new Date(commentData.createdAt);
      return comment;
    } catch (error) {
      console.error('Error creating comment:', error);
      return null;
    }
  }

  /**
   * Get all comments for a specific post
   */
  async getCommentsByPost(postId: string): Promise<Comment[]> {
    try {
      const response = await fetch(`${this.API_BASE}?postId=${postId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const commentsData = await response.json();
      return commentsData.map((commentData: any) => {
        const comment = new Comment(
          commentData.id,
          commentData.postId,
          commentData.creatorFid,
          commentData.text
        );
        comment.createdAt = new Date(commentData.createdAt);
        return comment;
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  /**
   * Get a specific comment by ID
   */
  async getCommentById(commentId: string): Promise<Comment | undefined> {
    try {
      const response = await fetch(`${this.API_BASE}?commentId=${commentId}`);
      
      if (response.status === 404) {
        return undefined;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch comment');
      }

      const commentData = await response.json();
      const comment = new Comment(
        commentData.id,
        commentData.postId,
        commentData.creatorFid,
        commentData.text
      );
      comment.createdAt = new Date(commentData.createdAt);
      return comment;
    } catch (error) {
      console.error('Error fetching comment:', error);
      return undefined;
    }
  }
}

// Singleton instance
export const commentController = new CommentController();
