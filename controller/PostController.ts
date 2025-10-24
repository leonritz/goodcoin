import { Post } from '../model';

/**
 * PostController handles all post-related operations using API
 */
class PostController {
  private readonly API_BASE = '/api/posts';

  /**
   * Create a new post
   */
  async createPost(
    creatorFid: string,
    description: string,
    mediaUrl?: string,
    mediaType?: 'photo' | 'video'
  ): Promise<Post> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorFid,
          description,
          mediaUrl,
          mediaType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const postData = await response.json();
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
      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  /**
   * Get all posts sorted by newest first
   */
  async getAllPosts(): Promise<Post[]> {
    try {
      const response = await fetch(this.API_BASE);
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const postsData = await response.json();
      return postsData.map((postData: any) => {
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
        return post;
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  /**
   * Get a specific post by ID
   */
  async getPostById(postId: string): Promise<Post | undefined> {
    try {
      const response = await fetch(`${this.API_BASE}?postId=${postId}`);
      
      if (response.status === 404) {
        return undefined;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }

      const postData = await response.json();
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
      return post;
    } catch (error) {
      console.error('Error fetching post:', error);
      return undefined;
    }
  }

  /**
   * Get posts by a specific user
   */
  async getPostsByUser(creatorFid: string): Promise<Post[]> {
    try {
      const response = await fetch(`${this.API_BASE}?creatorFid=${creatorFid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user posts');
      }

      const postsData = await response.json();
      return postsData.map((postData: any) => {
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
        return post;
      });
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  }

  /**
   * Like a post
   */
  async likePost(postId: string, userFid: string): Promise<boolean> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          action: 'like',
          userFid,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error liking post:', error);
      return false;
    }
  }

  /**
   * Unlike a post
   */
  async unlikePost(postId: string, userFid: string): Promise<boolean> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          action: 'unlike',
          userFid,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error unliking post:', error);
      return false;
    }
  }

  /**
   * Check if user has liked a post
   */
  async hasUserLikedPost(postId: string, userFid: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/posts/likes?postId=${postId}&userFid=${userFid}`);
      
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.isLiked || false;
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  }

  /**
   * Record a donation on the post
   */
  async addDonationToPost(postId: string, amount: number): Promise<boolean> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          action: 'addDonation',
          amount,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error adding donation to post:', error);
      return false;
    }
  }

  /**
   * Increment comment count (called by CommentController)
   */
  async incrementCommentCount(postId: string): Promise<boolean> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          action: 'incrementComments',
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error incrementing comment count:', error);
      return false;
    }
  }

  /**
   * Get all posts liked by a specific user
   */
  async getPostsLikedByUser(userFid: string): Promise<Post[]> {
    try {
      const response = await fetch(`${this.API_BASE}?likedByFid=${userFid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch liked posts');
      }

      const postsData = await response.json();
      return postsData.map((postData: any) => {
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
        return post;
      });
    } catch (error) {
      console.error('Error fetching liked posts:', error);
      return [];
    }
  }
}

// Singleton instance
export const postController = new PostController();
