/**
 * Post model representing a user's post in the feed
 */
export class Post {
  id: string; // Unique post identifier
  creatorFid: string; // Farcaster ID of the creator
  description: string; // Text content of the post
  mediaUrl?: string; // Optional photo or video URL
  mediaType?: 'photo' | 'video'; // Type of media
  likesCount: number;
  commentsCount: number;
  donationsReceived: number; // Total Goodcoins received
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    creatorFid: string,
    description: string,
    mediaUrl?: string,
    mediaType?: 'photo' | 'video'
  ) {
    this.id = id;
    this.creatorFid = creatorFid;
    this.description = description;
    this.mediaUrl = mediaUrl;
    this.mediaType = mediaType;
    this.likesCount = 0;
    this.commentsCount = 0;
    this.donationsReceived = 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Increment the likes count
   */
  addLike(): void {
    this.likesCount++;
    this.updatedAt = new Date();
  }

  /**
   * Decrement the likes count (if user unlikes)
   */
  removeLike(): void {
    if (this.likesCount > 0) {
      this.likesCount--;
      this.updatedAt = new Date();
    }
  }

  /**
   * Increment the comments count
   */
  addComment(): void {
    this.commentsCount++;
    this.updatedAt = new Date();
  }

  /**
   * Add donation amount to total received
   */
  addDonation(amount: number): void {
    this.donationsReceived += amount;
    this.updatedAt = new Date();
  }
}

