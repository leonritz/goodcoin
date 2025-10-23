import { Comment } from '../model';
import { postController } from './PostController';

/**
 * CommentController handles all comment-related operations
 */
class CommentController {
  private comments: Map<string, Comment>; // commentId -> Comment
  private postComments: Map<string, string[]>; // postId -> array of commentIds

  constructor() {
    this.comments = new Map();
    this.postComments = new Map();
  }

  /**
   * Create a new comment on a post
   */
  createComment(postId: string, creatorFid: string, text: string): Comment | null {
    if (!text.trim()) return null;

    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const comment = new Comment(commentId, postId, creatorFid, text);
    
    this.comments.set(commentId, comment);
    
    // Add to post's comment list
    if (!this.postComments.has(postId)) {
      this.postComments.set(postId, []);
    }
    this.postComments.get(postId)!.push(commentId);
    
    // Increment the post's comment count
    postController.incrementCommentCount(postId);
    
    return comment;
  }

  /**
   * Get all comments for a specific post
   */
  getCommentsByPost(postId: string): Comment[] {
    const commentIds = this.postComments.get(postId) || [];
    const comments = commentIds
      .map((id) => this.comments.get(id))
      .filter((c): c is Comment => c !== undefined);
    
    // Sort by creation time (oldest first)
    return comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  /**
   * Get a specific comment by ID
   */
  getCommentById(commentId: string): Comment | undefined {
    return this.comments.get(commentId);
  }
}

// Singleton instance
export const commentController = new CommentController();

