import { Comment } from '../model';
import { postController } from './PostController';

/**
 * CommentController handles all comment-related operations
 */
class CommentController {
  private comments: Map<string, Comment>; // commentId -> Comment
  private postComments: Map<string, string[]>; // postId -> array of commentIds
  private readonly STORAGE_KEY = 'goodcoin_comments';

  constructor() {
    this.comments = new Map();
    this.postComments = new Map();
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Load comments
        if (data.comments) {
          Object.entries(data.comments).forEach(([id, commentData]: [string, any]) => {
            const comment = new Comment(
              commentData.id,
              commentData.postId,
              commentData.creatorFid,
              commentData.text
            );
            comment.createdAt = new Date(commentData.createdAt);
            this.comments.set(id, comment);
          });
        }
        
        // Load postComments mapping
        if (data.postComments) {
          Object.entries(data.postComments).forEach(([postId, commentIds]: [string, any]) => {
            this.postComments.set(postId, commentIds);
          });
        }
      }
    } catch (error) {
      console.error('Error loading comments from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data: any = {
        comments: {},
        postComments: {}
      };
      
      this.comments.forEach((comment, id) => {
        data.comments[id] = {
          id: comment.id,
          postId: comment.postId,
          creatorFid: comment.creatorFid,
          text: comment.text,
          createdAt: comment.createdAt.toISOString(),
        };
      });
      
      this.postComments.forEach((commentIds, postId) => {
        data.postComments[postId] = commentIds;
      });
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving comments to storage:', error);
    }
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
    
    this.saveToStorage();
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

