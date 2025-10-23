'use client';

import { Post, User } from '../../model';
import PostCard from '../PostCard';
import '../../styles/profile-tabs.css';

interface PostsListProps {
  posts: Post[];
  currentUserFid: string;
  currentUserBalance: number;
  emptyMessage: string;
  getUser: (fid: string) => User | undefined;
  onUpdate: () => void;
}

export default function PostsList({
  posts,
  currentUserFid,
  currentUserBalance,
  emptyMessage,
  getUser,
  onUpdate,
}: PostsListProps) {
  if (posts.length === 0) {
    // Determine icon based on message content
    const isLikedPosts = emptyMessage.toLowerCase().includes('liked');
    const icon = isLikedPosts ? '❤️' : '📝';
    const subtext = isLikedPosts 
      ? "Start liking posts to see them here!"
      : "Share something positive to get started!";
    
    return (
      <div className="empty-state">
        <div className="empty-state-icon">{icon}</div>
        <p className="empty-state-title">{emptyMessage}</p>
        <p className="empty-state-subtitle">{subtext}</p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => {
        const creator = getUser(post.creatorFid);
        return (
          <PostCard
            key={post.id}
            post={post}
            creator={creator}
            currentUserFid={currentUserFid}
            currentUserBalance={currentUserBalance}
            onUpdate={onUpdate}
          />
        );
      })}
    </div>
  );
}

