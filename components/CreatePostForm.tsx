'use client';

import { useState } from 'react';
import { postController } from '../controller';
import '../styles/forms.css';

interface CreatePostFormProps {
  currentUserFid: string;
  onPostCreated: () => void;
  onCancel?: () => void;
}

export default function CreatePostForm({ currentUserFid, onPostCreated, onCancel }: CreatePostFormProps) {
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      alert('Please write a description');
      return;
    }

    const media = mediaUrl.trim() || undefined;
    const type = media ? mediaType : undefined;

    setIsSubmitting(true);
    
    try {
      await postController.createPost(currentUserFid, description, media, type);
      
      // Reset form
      setDescription('');
      setMediaUrl('');
      setMediaType('photo');
      
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
          
          {mediaUrl && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="photo"
                  checked={mediaType === 'photo'}
                  onChange={(e) => setMediaType(e.target.value as 'photo' | 'video')}
                  style={{ accentColor: 'var(--primary-green)' }}
                  disabled={isSubmitting}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>📷 Photo</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="video"
                  checked={mediaType === 'video'}
                  onChange={(e) => setMediaType(e.target.value as 'photo' | 'video')}
                  style={{ accentColor: 'var(--primary-green)' }}
                  disabled={isSubmitting}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>🎥 Video</span>
              </label>
            </div>
          )}
        </div>

        <div className="form-button-group">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="form-button-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="form-button-primary"
            style={{ flex: 1 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? '⏳ Sharing...' : '🚀 Share Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
