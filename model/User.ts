/**
 * User model representing a Farcaster user in the Goodcoin app
 * Now only tracks user identity, not virtual balances
 */
export class User {
  fid: string; // Farcaster ID (unique identifier)
  username: string;
  displayName: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    fid: string,
    username: string,
    displayName: string,
    profileImage?: string
  ) {
    this.fid = fid;
    this.username = username;
    this.displayName = displayName;
    this.profileImage = profileImage;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

