'use client';

import { useState, useRef } from 'react';
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadSource, setUploadSource] = useState<'url' | 'file' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    const validTypes = [...validImageTypes, ...validVideoTypes];

    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload an image (JPG, PNG, GIF, WebP) or video (MP4, WebM, MOV)');
      return;
    }

    // Validate size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      alert('File too large. Maximum size is 50MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      setMediaUrl(data.url);
      setMediaType(data.mediaType);
      setUploadSource('file');
      setUploadProgress(100);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload file');
      setPreviewUrl('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setMediaUrl(url);
    setPreviewUrl(url);
    setUploadSource('url');
  };

  const clearMedia = () => {
    setMediaUrl('');
    setPreviewUrl('');
    setUploadSource(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
      setPreviewUrl('');
      setUploadSource(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
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
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>+</span>
        Create a Post
      </h2>
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
          
          {/* Upload buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || isUploading}
              style={{
                flex: '1',
                minWidth: '140px',
                padding: '0.75rem 1rem',
                background: 'var(--primary-green)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: isSubmitting || isUploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: isSubmitting || isUploading ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                if (!isSubmitting && !isUploading) {
                  e.currentTarget.style.background = 'var(--primary-green-darker)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--primary-green)';
              }}
            >
              <span style={{ fontSize: '1.2em' }}>📁</span>
              {isUploading ? 'Uploading...' : 'Upload from Device'}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {/* URL input */}
          <div style={{ position: 'relative' }}>
            <input
              type="url"
              value={uploadSource === 'url' ? mediaUrl : ''}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Or paste image/video URL..."
              className="form-input"
              disabled={isSubmitting || isUploading || uploadSource === 'file'}
              style={{
                opacity: uploadSource === 'file' ? 0.5 : 1,
              }}
            />
            {mediaUrl && (
              <button
                type="button"
                onClick={clearMedia}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'var(--error-bg)',
                  color: 'var(--error-text)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                Clear
              </button>
            )}
          </div>
          
          {/* Upload progress */}
          {isUploading && (
            <div style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              background: 'var(--bg-secondary)',
              borderRadius: '6px',
            }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Uploading... {uploadProgress}%
              </div>
              <div style={{
                width: '100%',
                height: '4px',
                background: 'var(--border-color)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  background: 'var(--primary-green)',
                  transition: 'width 0.3s',
                }}></div>
              </div>
            </div>
          )}

          {/* Preview */}
          {previewUrl && !isUploading && (
            <div style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Preview:
              </div>
              {mediaType === 'photo' ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '6px',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '6px',
                  }}
                />
              )}
            </div>
          )}
          
          {/* Media type selector (only for URL uploads) */}
          {mediaUrl && uploadSource === 'url' && (
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
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>◇</span> Photo
                </span>
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
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>▶</span> Video
                </span>
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
            {isSubmitting ? 'Sharing...' : '→ Share Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
