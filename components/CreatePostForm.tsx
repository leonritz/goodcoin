'use client';

import { useState } from 'react';
import { postController } from '../controller';
import '../styles/forms.css';

interface CreatePostFormProps {
  currentUserFid: string;
  onPostCreated: () => void;
}

export default function CreatePostForm({ currentUserFid, onPostCreated }: CreatePostFormProps) {
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      alert('Please write a description');
      return;
    }

    const media = mediaUrl.trim() || undefined;
    const type = media ? mediaType : undefined;

    postController.createPost(currentUserFid, description, media, type);
    
    // Reset form
    setDescription('');
    setMediaUrl('');
    setMediaType('photo');
    
    onPostCreated();
  };

  return (
    <div className="create-post-form">
      <h2>✨ Create a Post</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">What positive thing would you like to share?</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share something positive..."
            className="form-textarea"
            rows={4}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Add Media (Optional)</label>
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="Paste image or video URL..."
            className="form-input"
          />
          
          {mediaUrl && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="photo"
                  checked={mediaType === 'photo'}
                  onChange={(e) => setMediaType(e.target.value as 'photo' | 'video')}
                  style={{ accentColor: 'var(--primary-pink)' }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>📷 Photo</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="video"
                  checked={mediaType === 'video'}
                  onChange={(e) => setMediaType(e.target.value as 'photo' | 'video')}
                  style={{ accentColor: 'var(--primary-pink)' }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>🎥 Video</span>
              </label>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="form-button-primary"
          style={{ width: '100%' }}
        >
          🚀 Share Post
        </button>
      </form>
    </div>
  );
}



