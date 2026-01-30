/**
 * Branding Assets View
 * Manage tenant logos, favicons, and other brand images
 * Uploads stored in database for serverless production environments
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icons } from '../common/Icons';
import './BrandingAssetsView.css';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

// Asset type definitions
const ASSET_TYPES = [
  {
    type: 'logo',
    label: 'Primary Logo',
    description: 'Main logo used in headers, emails, and Stripe checkout. Recommended: SVG or PNG, 500x500px minimum.',
    accept: 'image/svg+xml,image/png,image/jpeg,image/webp',
    maxSize: 2 * 1024 * 1024, // 2MB
    previewSize: 200,
  },
  {
    type: 'favicon',
    label: 'Favicon',
    description: 'Small icon shown in browser tabs. Recommended: ICO, PNG, or SVG, 32x32px or 64x64px.',
    accept: 'image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml',
    maxSize: 512 * 1024, // 512KB
    previewSize: 64,
  },
  {
    type: 'og_image',
    label: 'Social Share Image',
    description: 'Image shown when your site is shared on social media. Recommended: 1200x630px PNG or JPG.',
    accept: 'image/png,image/jpeg,image/webp',
    maxSize: 2 * 1024 * 1024, // 2MB
    previewSize: 300,
  },
  {
    type: 'email_header',
    label: 'Email Header',
    description: 'Logo used in transactional emails and receipts. Recommended: PNG, 600px wide max.',
    accept: 'image/png,image/jpeg',
    maxSize: 1 * 1024 * 1024, // 1MB
    previewSize: 200,
  },
  {
    type: 'receipt_logo',
    label: 'Receipt Logo',
    description: 'Logo printed on POS receipts. Recommended: PNG, black/white, 300px wide.',
    accept: 'image/png,image/jpeg',
    maxSize: 512 * 1024, // 512KB
    previewSize: 150,
  },
];

// ============================================================================
// ASSET CARD COMPONENT
// ============================================================================

const AssetCard = ({ assetConfig, currentAsset, onUpload, onDelete, uploading }) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Build the asset URL using the backend-provided URL
  const baseUrl = API_URL.replace('/api/v1', '');
  const assetUrl = currentAsset?.url
    ? `${baseUrl}${currentAsset.url}?t=${new Date(currentAsset.updated_at).getTime()}`
    : null;

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    const acceptedTypes = assetConfig.accept.split(',');
    if (!acceptedTypes.some(type => file.type === type || file.type.match(type.replace('*', '.*')))) {
      alert(`Invalid file type. Please upload: ${assetConfig.accept}`);
      return;
    }

    // Validate file size
    if (file.size > assetConfig.maxSize) {
      alert(`File too large. Maximum size: ${(assetConfig.maxSize / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload
    onUpload(assetConfig.type, file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const displayUrl = previewUrl || assetUrl;

  return (
    <div className="asset-card">
      <div className="asset-header">
        <h3>{assetConfig.label}</h3>
        <p>{assetConfig.description}</p>
      </div>

      <div 
        className={`asset-dropzone ${dragOver ? 'drag-over' : ''} ${displayUrl ? 'has-image' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        style={{ '--preview-size': `${assetConfig.previewSize}px` }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={assetConfig.accept}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {uploading === assetConfig.type ? (
          <div className="upload-progress">
            <Icons.Loader className="spin" />
            <span>Uploading...</span>
          </div>
        ) : displayUrl ? (
          <div className="asset-preview">
            <img 
              src={displayUrl} 
              alt={assetConfig.label}
              style={{ maxWidth: assetConfig.previewSize, maxHeight: assetConfig.previewSize }}
            />
            <div className="asset-overlay">
              <Icons.Upload />
              <span>Click or drag to replace</span>
            </div>
          </div>
        ) : (
          <div className="asset-placeholder">
            <Icons.Image />
            <span>Click or drag to upload</span>
            <span className="file-types">{assetConfig.accept.split(',').map(t => t.split('/')[1]).join(', ')}</span>
          </div>
        )}
      </div>

      {currentAsset && (
        <div className="asset-meta">
          <span className="asset-filename" title={currentAsset.filename}>
            {currentAsset.filename}
          </span>
          <span className="asset-size">
            {(currentAsset.file_size / 1024).toFixed(1)} KB
          </span>
          <button 
            className="asset-delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete ${assetConfig.label}?`)) {
                onDelete(assetConfig.type);
              }
            }}
            title="Delete"
          >
            <Icons.Trash />
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN VIEW COMPONENT
// ============================================================================

const BrandingAssetsView = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState(null);

  // Fetch existing assets
  const loadAssets = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/tenant-assets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load assets');
      }

      const data = await response.json();
      setAssets(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading assets:', err);
      setError('Failed to load branding assets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // Upload asset
  const handleUpload = async (assetType, file) => {
    setUploading(assetType);
    setError(null);

    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // Remove data URL prefix to get just base64
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/tenant-assets/${assetType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: base64,
          filename: file.name,
          mime_type: file.type,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Upload failed');
      }

      // Reload assets to get updated list
      await loadAssets();
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Failed to upload: ${err.message}`);
    } finally {
      setUploading(null);
    }
  };

  // Delete asset
  const handleDelete = async (assetType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/tenant-assets/${assetType}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      // Remove from local state
      setAssets(prev => prev.filter(a => a.asset_type !== assetType));
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Failed to delete: ${err.message}`);
    }
  };

  // Get current asset by type
  const getAsset = (type) => assets.find(a => a.asset_type === type);

  if (loading) {
    return (
      <div className="branding-view">
        <div className="view-header">
          <h1>Branding Assets</h1>
        </div>
        <div className="loading-state">
          <Icons.Loader className="spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="branding-view">
      <div className="view-header">
        <div>
          <h1>Branding Assets</h1>
          <p>Upload and manage your logo, favicon, and other brand images</p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <Icons.AlertCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <Icons.X />
          </button>
        </div>
      )}

      <div className="info-banner">
        <Icons.Info />
        <div>
          <strong>Production Storage:</strong> Assets are stored in the database and will persist across deployments.
          Changes take effect immediately across all applications.
        </div>
      </div>

      <div className="assets-grid">
        {ASSET_TYPES.map(config => (
          <AssetCard
            key={config.type}
            assetConfig={config}
            currentAsset={getAsset(config.type)}
            onUpload={handleUpload}
            onDelete={handleDelete}
            uploading={uploading}
          />
        ))}
      </div>

      <div className="usage-section">
        <h2>Asset URLs</h2>
        <p>Use these URLs in your applications and email templates:</p>
        <div className="url-list">
          {ASSET_TYPES.map(config => {
            const asset = getAsset(config.type);
            const baseUrl = window.location.origin.includes('localhost') 
              ? 'http://localhost:3001'
              : 'https://api.hoodfamilyfarms.com';
            // Use actual URL if asset exists, otherwise show template
            const url = asset?.url 
              ? `${baseUrl}${asset.url}`
              : `${baseUrl}/tenant-assets/{tenant-slug}/${config.type}`;
            
            return (
              <div key={config.type} className="url-item">
                <span className="url-label">{config.label}:</span>
                <code className="url-value">{url}</code>
                <button 
                  className="copy-btn"
                  onClick={() => navigator.clipboard.writeText(url)}
                  title="Copy URL"
                >
                  <Icons.Copy />
                </button>
                {asset && <span className="url-status active">Active</span>}
                {!asset && <span className="url-status inactive">Not set</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BrandingAssetsView;
