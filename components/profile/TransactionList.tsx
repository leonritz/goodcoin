'use client';

import { useState, useEffect } from 'react';
import { Transaction, Post, User } from '../../model';
import '../../styles/profile-tabs.css';

interface TransactionListProps {
  transactions: Transaction[];
  type: 'sent' | 'received';
  getPost: (postId: string) => Promise<Post | undefined>;
  getUser: (fid: string) => Promise<User | undefined>;
}

interface TransactionData {
  transaction: Transaction;
  post: Post | undefined;
  otherUser: User | undefined;
}

export default function TransactionList({
  transactions,
  type,
  getPost,
  getUser,
}: TransactionListProps) {
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTransactionData = async () => {
      setIsLoading(true);
      const data = await Promise.all(
        transactions.map(async (transaction) => {
          const post = await getPost(transaction.postId);
          const otherUserFid = type === 'sent' ? transaction.toFid : transaction.fromFid;
          const otherUser = await getUser(otherUserFid);
          return { transaction, post, otherUser };
        })
      );
      setTransactionData(data);
      setIsLoading(false);
    };

    loadTransactionData();
  }, [transactions, type, getPost, getUser]);

  if (transactions.length === 0) {
    const emptyMessage = type === 'sent' 
      ? "You haven't made any donations yet."
      : "You haven't received any donations yet.";
    const emptySubtext = type === 'sent'
      ? "Support others by donating to their positive posts!"
      : "Create positive content to receive donations!";
    
    return (
      <div className="empty-state">
        <div className="empty-state-icon" style={{ fontSize: '3em', fontWeight: 'bold' }}>
          {type === 'sent' ? '→' : '🪙'}
        </div>
        <p className="empty-state-title">{emptyMessage}</p>
        <p className="empty-state-subtitle">{emptySubtext}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="empty-state">
        <p className="empty-state-subtitle">Loading transactions...</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white p-4 space-y-3">
      {transactionData.map(({ transaction, post, otherUser }) => (
        <div 
          key={transaction.id} 
          className={`transaction-card ${
            type === 'sent'
              ? 'border-orange-300 bg-gradient-to-r from-orange-50 via-red-50 to-orange-50'
              : 'border-green-300 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50'
          }`}
        >
          <div className="flex items-start gap-4 relative z-10">
            {/* Avatar Icon */}
            <div className={`transaction-avatar ${
              type === 'sent'
                ? 'bg-gradient-to-br from-orange-500 to-red-500'
                : 'bg-gradient-to-br from-green-500 to-emerald-600'
            }`}>
              {otherUser?.displayName?.charAt(0).toUpperCase() || '?'}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                  type === 'sent' ? 'text-orange-600' : 'text-green-600'
                }`}>
                  <span style={{ fontSize: '1.2em' }}>{type === 'sent' ? '→' : '←'}</span>
                  {type === 'sent' ? 'Donated to' : 'Received from'}
                </span>
              </div>
              <p className="font-black text-lg text-gray-900 mb-2">
                {otherUser?.displayName || 'Unknown User'}
              </p>
              {post && (
                <p className="text-sm text-gray-700 line-clamp-2 italic mb-2 bg-white bg-opacity-60 p-2 rounded">
                  &quot;{post.description}&quot;
                </p>
              )}
              <p className="text-xs font-semibold text-gray-500">
                {formatDate(transaction.createdAt)}
              </p>
            </div>

            {/* Amount Badge */}
            <div className="flex-shrink-0">
              <div className={`amount-badge ${
                type === 'sent'
                  ? 'bg-orange-300 text-orange-900'
                  : 'bg-green-300 text-green-900'
              }`}>
                <span>{type === 'sent' ? '-' : '+'}{transaction.amount}</span>
                <span style={{ marginLeft: '4px', fontSize: '1.1em', fontWeight: 'bold' }}>🪙</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
