'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { userController, postController, transactionController } from '../../controller';
import { Post, Transaction, User } from '../../model';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import OverviewTab from '../../components/profile/OverviewTab';
import PostsList from '../../components/profile/PostsList';
import TransactionList from '../../components/profile/TransactionList';
import '../../styles/profile.css';

type TabType = 'overview' | 'posts' | 'liked' | 'donated' | 'received';

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isLoading } = useAuth();
  const [currentUserFid, setCurrentUserFid] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [user, setUser] = useState<User | undefined>(undefined);
  
  // Removed virtual balance tracking
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [donationsSent, setDonationsSent] = useState<Transaction[]>([]);
  const [donationsReceived, setDonationsReceived] = useState<Transaction[]>([]);
  const [totalDonated, setTotalDonated] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);

  useEffect(() => {
    const initialize = async () => {
      // Check if user is authenticated
      if (isLoading) {
        return; // Wait for auth to load
      }
      
      if (!authUser?.isAuthenticated || !authUser?.fid) {
        // Not authenticated, redirect to home
        router.push('/');
        return;
      }
      
      setCurrentUserFid(authUser.fid);
      loadUserData(authUser.fid);
    };

    initialize();
  }, [authUser, isLoading, router]);

  const loadUserData = async (fid: string) => {
    try {
      // Get user
      const userData = await userController.getUserByFid(fid);
      setUser(userData);

      // Removed virtual balance loading

      // Get user's posts
      const posts = await postController.getPostsByUser(fid);
      setUserPosts(posts);

      // Get liked posts
      const liked = await postController.getPostsLikedByUser(fid);
      setLikedPosts(liked);

      // Get donations sent
      const sent = await transactionController.getDonationsSentByUser(fid);
      setDonationsSent(sent);

      // Get donations received
      const received = await transactionController.getDonationsReceivedByUser(fid);
      setDonationsReceived(received);

      // Get totals
      const totalSent = await transactionController.getTotalDonatedByUser(fid);
      setTotalDonated(totalSent);

      const totalRec = await transactionController.getTotalReceivedByUser(fid);
      setTotalReceived(totalRec);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const refreshData = () => {
    if (currentUserFid) {
      loadUserData(currentUserFid);
    }
  };

  if (isLoading || !currentUserFid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-nav-header">
        <div className="profile-nav-content">
          <button
            onClick={() => router.push('/')}
            className="profile-back-button"
          >
            ← Back to Feed
          </button>
          <h1 className="profile-title">Profile</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto">
            {/* Profile Header with Stats */}
            <ProfileHeader
              user={user}
              postsCount={userPosts.length}
              totalDonated={totalDonated}
              totalReceived={totalReceived}
              onUpdate={refreshData}
            />

        {/* Tab Navigation */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={{
            posts: userPosts.length,
            liked: likedPosts.length,
            donated: donationsSent.length,
            received: donationsReceived.length,
          }}
        />

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'overview' && (
            <OverviewTab
              postsCount={userPosts.length}
              likedCount={likedPosts.length}
              donationsSentCount={donationsSent.length}
              totalDonated={totalDonated}
              donationsReceivedCount={donationsReceived.length}
              totalReceived={totalReceived}
            />
          )}

          {activeTab === 'posts' && (
            <PostsList
              posts={userPosts}
              currentUserFid={currentUserFid}
              emptyMessage="You haven't created any posts yet."
              getUser={userController.getUserByFid.bind(userController)}
              onUpdate={refreshData}
            />
          )}

          {activeTab === 'liked' && (
            <PostsList
              posts={likedPosts}
              currentUserFid={currentUserFid}
              emptyMessage="You haven't liked any posts yet."
              getUser={userController.getUserByFid.bind(userController)}
              onUpdate={refreshData}
            />
          )}

          {activeTab === 'donated' && (
            <TransactionList
              transactions={donationsSent}
              type="sent"
              getPost={postController.getPostById.bind(postController)}
              getUser={userController.getUserByFid.bind(userController)}
            />
          )}

          {activeTab === 'received' && (
            <TransactionList
              transactions={donationsReceived}
              type="received"
              getPost={postController.getPostById.bind(postController)}
              getUser={userController.getUserByFid.bind(userController)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
