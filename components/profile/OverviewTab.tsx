'use client';

import '../../styles/profile-tabs.css';

interface OverviewTabProps {
  postsCount: number;
  likedCount: number;
  donationsSentCount: number;
  totalDonated: number;
  donationsReceivedCount: number;
  totalReceived: number;
}

export default function OverviewTab({
  postsCount,
  likedCount,
  donationsSentCount,
  totalDonated,
  donationsReceivedCount,
  totalReceived,
}: OverviewTabProps) {
  const netImpact = totalReceived - totalDonated;

  return (
    <div className="bg-white p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span style={{ fontSize: '1.2em' }}>▪</span>
        Activity Summary
      </h3>
      
      <div className="space-y-4">
        {/* Posts Card */}
        <div className="overview-card border-blue-300 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50">
          <div className="flex items-center gap-4">
            <div className="stat-icon bg-gradient-to-br from-blue-500 to-blue-600">
              <span style={{ fontSize: '2em', fontWeight: 'bold' }}>✎</span>
            </div>
            <div>
              <p className="stat-label text-blue-700">Total Posts</p>
              <p className="stat-value text-blue-900">{postsCount}</p>
            </div>
          </div>
        </div>

        {/* Likes Card */}
        <div className="overview-card border-pink-300 bg-gradient-to-r from-pink-50 via-pink-100 to-purple-50">
          <div className="flex items-center gap-4">
            <div className="stat-icon bg-gradient-to-br from-pink-500 to-purple-600">
              <span style={{ fontSize: '2em', fontWeight: 'bold' }}>♥</span>
            </div>
            <div>
              <p className="stat-label text-pink-700">Likes Given</p>
              <p className="stat-value text-pink-900">{likedCount}</p>
            </div>
          </div>
        </div>

        {/* Donations Sent Card */}
        <div className="overview-card border-orange-300 bg-gradient-to-r from-orange-50 via-orange-100 to-red-50">
          <div className="flex items-center gap-4">
            <div className="stat-icon bg-gradient-to-br from-orange-500 to-red-500">
              <span style={{ fontSize: '2em', fontWeight: 'bold' }}>→</span>
            </div>
            <div>
              <p className="stat-label text-orange-700">Donations Sent</p>
              <p className="stat-value text-orange-900">{donationsSentCount} <span className="text-base font-semibold">({totalDonated} coins)</span></p>
            </div>
          </div>
        </div>

        {/* Donations Received Card */}
        <div className="overview-card border-green-300 bg-gradient-to-r from-green-50 via-emerald-100 to-green-50">
          <div className="flex items-center gap-4">
            <div className="stat-icon bg-gradient-to-br from-green-500 to-emerald-600">
              <span style={{ fontSize: '2em', fontWeight: 'bold' }}>🪙</span>
            </div>
            <div>
              <p className="stat-label text-green-700">Donations Received</p>
              <p className="stat-value text-green-900">{donationsReceivedCount} <span className="text-base font-semibold">({totalReceived} coins)</span></p>
            </div>
          </div>
        </div>

        {/* Net Impact Card */}
        <div className={`net-impact-card ${
          netImpact >= 0 
            ? 'border-green-400 bg-gradient-to-br from-green-100 via-emerald-100 to-green-200' 
            : 'border-red-400 bg-gradient-to-br from-red-100 via-orange-100 to-red-200'
        }`}>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className={`stat-icon ${
                netImpact >= 0 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-orange-600'
              }`} style={{ width: '4rem', height: '4rem' }}>
                <span style={{ fontSize: '2.5em', fontWeight: 'bold' }}>
                  {netImpact >= 0 ? '↗' : '↘'}
                </span>
              </div>
              <div>
                <p className={`text-sm font-black uppercase tracking-wide ${netImpact >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  Net Impact
                </p>
                <p className={`text-4xl font-black ${netImpact >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {netImpact > 0 ? '+' : ''}{netImpact} <span className="text-2xl">coins</span>
                </p>
              </div>
            </div>
            <div className={`${netImpact >= 0 ? 'text-green-500' : 'text-red-500'}`} style={{ animation: 'pulse-subtle 1.5s ease-in-out infinite', fontSize: '3em', fontWeight: 'bold' }}>
              {netImpact >= 0 ? '◉' : '!'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

