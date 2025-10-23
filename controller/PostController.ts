import { Post } from '../model';

/**
 * PostController handles all post-related operations
 */
class PostController {
  private posts: Map<string, Post>; // postId -> Post
  private likedPosts: Map<string, Set<string>>; // postId -> Set of fids who liked

  constructor() {
    this.posts = new Map();
    this.likedPosts = new Map();
  }

  /**
   * Create a new post
   */
  createPost(
    creatorFid: string,
    description: string,
    mediaUrl?: string,
    mediaType?: 'photo' | 'video'
  ): Post {
    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const post = new Post(postId, creatorFid, description, mediaUrl, mediaType);
    this.posts.set(postId, post);
    this.likedPosts.set(postId, new Set());
    return post;
  }

  /**
   * Get all posts sorted by newest first
   */
  getAllPosts(): Post[] {
    const allPosts = Array.from(this.posts.values());
    return allPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get a specific post by ID
   */
  getPostById(postId: string): Post | undefined {
    return this.posts.get(postId);
  }

  /**
   * Get posts by a specific user
   */
  getPostsByUser(creatorFid: string): Post[] {
    const userPosts = Array.from(this.posts.values()).filter(
      (post) => post.creatorFid === creatorFid
    );
    return userPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Like a post
   */
  likePost(postId: string, userFid: string): boolean {
    const post = this.posts.get(postId);
    if (!post) return false;

    const likers = this.likedPosts.get(postId);
    if (!likers) return false;

    if (!likers.has(userFid)) {
      likers.add(userFid);
      post.addLike();
      return true;
    }
    return false; // Already liked
  }

  /**
   * Unlike a post
   */
  unlikePost(postId: string, userFid: string): boolean {
    const post = this.posts.get(postId);
    if (!post) return false;

    const likers = this.likedPosts.get(postId);
    if (!likers) return false;

    if (likers.has(userFid)) {
      likers.delete(userFid);
      post.removeLike();
      return true;
    }
    return false; // Not liked
  }

  /**
   * Check if user has liked a post
   */
  hasUserLikedPost(postId: string, userFid: string): boolean {
    const likers = this.likedPosts.get(postId);
    return likers ? likers.has(userFid) : false;
  }

  /**
   * Record a donation on the post
   */
  addDonationToPost(postId: string, amount: number): boolean {
    const post = this.posts.get(postId);
    if (!post) return false;

    post.addDonation(amount);
    return true;
  }

  /**
   * Increment comment count (called by CommentController)
   */
  incrementCommentCount(postId: string): boolean {
    const post = this.posts.get(postId);
    if (!post) return false;

    post.addComment();
    return true;
  }
}

// Singleton instance
export const postController = new PostController();

