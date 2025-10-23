/**
 * Comment model representing a user's comment on a post
 */
export class Comment {
  id: string; // Unique comment identifier
  postId: string; // ID of the post this comment belongs to
  creatorFid: string; // Farcaster ID of the commenter
  text: string; // Comment text content
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    postId: string,
    creatorFid: string,
    text: string
  ) {
    this.id = id;
    this.postId = postId;
    this.creatorFid = creatorFid;
    this.text = text;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

