'use client';

import { useState, useEffect } from 'react';
import { User } from '../../model';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileHeaderProps {
  user: User;
  balance: number;
  postsCount: number;
  totalDonated: number;
  totalReceived: number;
  onUpdate: () => void;
}

export default function ProfileHeader({
  user,
  balance,
  postsCount,
  totalDonated,
  totalReceived,
  onUpdate,
}: ProfileHeaderProps) {
  const { user: authUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.displayName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [localDisplayName, setLocalDisplayName] = useState(user.displayName || '');
  
  // Sync localDisplayName with user.displayName when it changes
  useEffect(() => {
    setLocalDisplayName(user.displayName || '');
    setEditName(user.displayName || '');
  }, [user.displayName]);
  
  // Determine what type of identity is being used
  let displayInfo = '';
  let connectionType = '';
  
  if (authUser?.authMethod === 'wallet') {
    // Check if username is a real name (not truncated address)
    const isTruncatedAddress = user.username?.includes('...');
    
    if (isTruncatedAddress && authUser?.address) {
      // Show full wallet address if no better name available
      displayInfo = `${authUser.address.slice(0, 10)}...${authUser.address.slice(-8)}`;
      connectionType = 'Wallet Address';
    } else {
      // Show the resolved name (ENS/Basename/Farcaster)
      displayInfo = user.username || 'User';
      
      // Try to determine the source
      if (user.username?.endsWith('.eth')) {
        connectionType = 'ENS Name';
      } else if (user.username?.endsWith('.base.eth')) {
        connectionType = 'Basename';
      } else if (!isTruncatedAddress) {
        connectionType = 'Farcaster Account';
      } else {
        connectionType = 'Wallet Connection';
      }
    }
  } else {
    // Farcaster user
    displayInfo = `@${user.username || 'username'}`;
    connectionType = 'Farcaster User';
  }
  
  const handleSaveName = async () => {
    if (!editName.trim()) {
      alert('Please enter a valid name');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fid: user.fid, 
          displayName: editName.trim() 
        }),
      });
      
      if (response.ok) {
        // Update local state immediately for better UX
        setLocalDisplayName(editName.trim());
        setIsEditing(false);
        // Call onUpdate in the background without blocking
        setTimeout(() => onUpdate(), 100);
      } else {
        alert('Failed to update name');
      }
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="profile-header">
      <div className="profile-user-info">
        <div className="profile-avatar">
          {(editName || localDisplayName || user.displayName)?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="profile-user-details" style={{ flex: 1 }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
                style={{
                  flex: 1,
                  minWidth: '150px',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                  fontWeight: '700',
                }}
                maxLength={50}
                autoFocus
                disabled={isSaving}
              />
              <button
                onClick={handleSaveName}
                disabled={isSaving}
                style={{
                  padding: '0.5rem 1rem',
                  background: isSaving ? 'var(--text-disabled)' : 'var(--primary-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(localDisplayName || user.displayName || '');
                }}
                disabled={isSaving}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--surface-hover)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <h2>{localDisplayName || user.displayName || authUser?.displayName || 'User'}</h2>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: 'transparent',
                  color: 'var(--primary-green)',
                  border: '1px solid var(--primary-green)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.75rem',
                }}
                title="Edit display name"
              >
                ✎ Edit
              </button>
            </div>
          )}
          <p style={{ fontSize: 'clamp(0.813rem, 2vw, 0.875rem)', color: 'var(--text-secondary)' }}>
            {displayInfo}
          </p>
          <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.813rem)', color: 'var(--text-disabled)', marginTop: '0.25rem' }}>
            {connectionType}
          </p>
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

