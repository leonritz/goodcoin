'use client';

type TabType = 'overview' | 'posts' | 'liked' | 'donated' | 'received';

interface ProfileTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: {
    posts: number;
    liked: number;
    donated: number;
    received: number;
  };
}

export default function ProfileTabs({ activeTab, onTabChange, counts }: ProfileTabsProps) {
  const tabs = [
    { id: 'overview' as TabType, label: 'Overview' },
    { id: 'posts' as TabType, label: `My Posts (${counts.posts})` },
    { id: 'liked' as TabType, label: `Liked (${counts.liked})` },
    { id: 'donated' as TabType, label: `Donated (${counts.donated})` },
    { id: 'received' as TabType, label: `Received (${counts.received})` },
  ];

  return (
    <div className="profile-tabs-container">
      <div className="profile-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`profile-tab ${activeTab === tab.id ? 'profile-tab-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

