'use client';

import { User } from '../../model';

interface ProfileHeaderProps {
  user: User;
  balance: number;
  postsCount: number;
  totalDonated: number;
  totalReceived: number;
}

export default function ProfileHeader({
  user,
  balance,
  postsCount,
  totalDonated,
  totalReceived,
}: ProfileHeaderProps) {
  return (
    <div className="profile-header">
      <div className="profile-user-info">
        <div className="profile-avatar">
          {user.displayName?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="profile-user-details">
          <h2>{user.displayName || 'User'}</h2>
          <p>@{user.username || 'username'}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="profile-stats-grid">
        <div className="profile-stat-card profile-stat-card-green">
          <div className="profile-stat-value">{balance}</div>
          <div className="profile-stat-label">Current Balance</div>
        </div>
        <div className="profile-stat-card profile-stat-card-pink">
          <div className="profile-stat-value">{postsCount}</div>
          <div className="profile-stat-label">Posts Created</div>
        </div>
        <div className="profile-stat-card profile-stat-card-orange">
          <div className="profile-stat-value">{totalDonated}</div>
          <div className="profile-stat-label">Goodcoins Donated</div>
        </div>
        <div className="profile-stat-card profile-stat-card-purple">
          <div className="profile-stat-value">{totalReceived}</div>
          <div className="profile-stat-label">Goodcoins Received</div>
        </div>
      </div>
    </div>
  );
}

