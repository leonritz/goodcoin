'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userController, postController, transactionController } from '../../controller';
import { Post, Transaction } from '../../model';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import OverviewTab from '../../components/profile/OverviewTab';
import PostsList from '../../components/profile/PostsList';
import TransactionList from '../../components/profile/TransactionList';
import '../../styles/profile.css';

type TabType = 'overview' | 'posts' | 'liked' | 'donated' | 'received';

export default function ProfilePage() {
  const router = useRouter();
  const [currentUserFid, setCurrentUserFid] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // User data
  const [balance, setBalance] = useState(0);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [donationsSent, setDonationsSent] = useState<Transaction[]>([]);
  const [donationsReceived, setDonationsReceived] = useState<Transaction[]>([]);
  const [totalDonated, setTotalDonated] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);

  useEffect(() => {
    // Get current user FID from localStorage
    let mockFid = localStorage.getItem('currentUserFid');
    
    // If no user exists, create one and redirect to home first
    if (!mockFid) {
      mockFid = 'user_' + Date.now();
      localStorage.setItem('currentUserFid', mockFid);
      
      // Create the user
      userController.getOrCreateUser(
        mockFid,
        'testuser',
        'Test User',
        undefined
      );
      
      // Redirect to home page first
      router.push('/');
      return;
    }
    
    // Make sure the user exists in the controller
    userController.getOrCreateUser(
      mockFid,
      'testuser',
      'Test User',
      undefined
    );
    
    setCurrentUserFid(mockFid);
    loadUserData(mockFid);
  }, [router]);

  const loadUserData = (fid: string) => {
    // Get user balance
    const userBalance = userController.getUserBalance(fid);
    setBalance(userBalance);

    // Get user's posts
    const posts = postController.getPostsByUser(fid);
    setUserPosts(posts);

    // Get liked posts
    const liked = postController.getPostsLikedByUser(fid);
    setLikedPosts(liked);

    // Get donations sent
    const sent = transactionController.getDonationsSentByUser(fid);
    setDonationsSent(sent);

    // Get donations received
    const received = transactionController.getDonationsReceivedByUser(fid);
    setDonationsReceived(received);

    // Get totals
    const totalSent = transactionController.getTotalDonatedByUser(fid);
    setTotalDonated(totalSent);

    const totalRec = transactionController.getTotalReceivedByUser(fid);
    setTotalReceived(totalRec);
  };

  const refreshData = () => {
    if (currentUserFid) {
      loadUserData(currentUserFid);
    }
  };

  if (!currentUserFid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const user = userController.getUserByFid(currentUserFid);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>User not found</p>
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
          balance={balance}
          postsCount={userPosts.length}
          totalDonated={totalDonated}
          totalReceived={totalReceived}
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
              currentUserBalance={balance}
              emptyMessage="You haven't created any posts yet."
              getUser={userController.getUserByFid.bind(userController)}
              onUpdate={refreshData}
            />
          )}

          {activeTab === 'liked' && (
            <PostsList
              posts={likedPosts}
              currentUserFid={currentUserFid}
              currentUserBalance={balance}
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
