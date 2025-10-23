import { Post } from '../model';

/**
 * PostController handles all post-related operations
 */
class PostController {
  private posts: Map<string, Post>; // postId -> Post
  private likedPosts: Map<string, Set<string>>; // postId -> Set of fids who liked
  private readonly STORAGE_KEY_POSTS = 'goodcoin_posts';
  private readonly STORAGE_KEY_LIKES = 'goodcoin_likes';

  constructor() {
    this.posts = new Map();
    this.likedPosts = new Map();
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Load posts
      const storedPosts = localStorage.getItem(this.STORAGE_KEY_POSTS);
      if (storedPosts) {
        const data = JSON.parse(storedPosts);
        Object.entries(data).forEach(([id, postData]: [string, any]) => {
          const post = new Post(
            postData.id,
            postData.creatorFid,
            postData.description,
            postData.mediaUrl,
            postData.mediaType
          );
          post.likesCount = postData.likesCount;
          post.commentsCount = postData.commentsCount;
          post.donationsReceived = postData.donationsReceived;
          post.createdAt = new Date(postData.createdAt);
          post.updatedAt = new Date(postData.updatedAt);
          this.posts.set(id, post);
        });
      }

      // Load likes
      const storedLikes = localStorage.getItem(this.STORAGE_KEY_LIKES);
      if (storedLikes) {
        const data = JSON.parse(storedLikes);
        Object.entries(data).forEach(([postId, likers]: [string, any]) => {
          this.likedPosts.set(postId, new Set(likers));
        });
      }
    } catch (error) {
      console.error('Error loading posts from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Save posts
      const postsData: any = {};
      this.posts.forEach((post, id) => {
        postsData[id] = {
          id: post.id,
          creatorFid: post.creatorFid,
          description: post.description,
          mediaUrl: post.mediaUrl,
          mediaType: post.mediaType,
          likesCount: post.likesCount,
          commentsCount: post.commentsCount,
          donationsReceived: post.donationsReceived,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        };
      });
      localStorage.setItem(this.STORAGE_KEY_POSTS, JSON.stringify(postsData));

      // Save likes
      const likesData: any = {};
      this.likedPosts.forEach((likers, postId) => {
        likesData[postId] = Array.from(likers);
      });
      localStorage.setItem(this.STORAGE_KEY_LIKES, JSON.stringify(likesData));
    } catch (error) {
      console.error('Error saving posts to storage:', error);
    }
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
    this.saveToStorage();
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
      this.saveToStorage();
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
      this.saveToStorage();
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
    this.saveToStorage();
    return true;
  }

  /**
   * Increment comment count (called by CommentController)
   */
  incrementCommentCount(postId: string): boolean {
    const post = this.posts.get(postId);
    if (!post) return false;

    post.addComment();
    this.saveToStorage();
    return true;
  }

  /**
   * Get all posts liked by a specific user
   */
  getPostsLikedByUser(userFid: string): Post[] {
    const likedPosts: Post[] = [];
    
    this.likedPosts.forEach((likers, postId) => {
      if (likers.has(userFid)) {
        const post = this.posts.get(postId);
        if (post) {
          likedPosts.push(post);
        }
      }
    });
    
    return likedPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

// Singleton instance
export const postController = new PostController();

