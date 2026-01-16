/**
 * Media Library View
 * Upload, browse, and manage media files
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Icons } from '../common/Icons';
import Modal from '../common/Modal';
import './MediaLibraryView.css';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

// Helper to format file sizes
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to format dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// ============================================================================
// MEDIA CARD COMPONENT
// ============================================================================

const MediaCard = ({ media, isSelected, onSelect, onEdit, onDelete }) => {
  const isImage = media.mime_type?.startsWith('image/');
  
  const getFileIcon = () => {
    if (media.mime_type?.includes('pdf')) return '📄';
    if (media.mime_type?.includes('word')) return '📝';
    if (media.mime_type?.includes('excel') || media.mime_type?.includes('spreadsheet')) return '📊';
    if (media.mime_type?.includes('text')) return '📃';
    return '📎';
  };
  
  return (
    <div 
      className={`media-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(media)}
    >
      <div className="media-card-preview">
        {isImage ? (
          <img 
            src={media.storage_url} 
            alt={media.alt_text || media.original_filename}
            loading="lazy"
          />
        ) : (
          <div className="file-icon">{getFileIcon()}</div>
        )}
        {isSelected && (
          <div className="selected-indicator">
            <Icons.Check />
          </div>
        )}
      </div>
      <div className="media-card-info">
        <div className="media-card-name" title={media.original_filename}>
          {media.title || media.original_filename}
        </div>
        <div className="media-card-meta">
          <span>{formatBytes(media.file_size)}</span>
          <span>{formatDate(media.created_at)}</span>
        </div>
      </div>
      <div className="media-card-actions">
        <button 
          className="btn-icon" 
          onClick={(e) => { e.stopPropagation(); onEdit(media); }}
          title="Edit"
        >
          <Icons.Edit />
        </button>
        <button 
          className="btn-icon btn-danger" 
          onClick={(e) => { e.stopPropagation(); onDelete(media); }}
          title="Delete"
        >
          <Icons.Trash />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// UPLOAD DROPZONE COMPONENT
// ============================================================================

const UploadDropzone = ({ folder, onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const fileInputRef = useRef(null);
  
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const uploadFiles = async (files) => {
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(files.map(f => ({ name: f.name, status: 'uploading' })));
    
    const formData = new FormData();
    formData.append('folder', folder || 'uploads');
    
    for (const file of files) {
      formData.append('files', file);
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      const result = await response.json();
      setUploadProgress(files.map(f => ({ name: f.name, status: 'complete' })));
      
      setTimeout(() => {
        setUploading(false);
        setUploadProgress([]);
        onUploadComplete(result.data);
      }, 1000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(files.map(f => ({ name: f.name, status: 'error', error: error.message })));
      setTimeout(() => {
        setUploading(false);
        setUploadProgress([]);
      }, 3000);
    }
  };
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  }, [folder]);
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    uploadFiles(files);
    e.target.value = ''; // Reset input
  };
  
  return (
    <div
      className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !uploading && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
      />
      
      {uploading ? (
        <div className="upload-progress">
          <Icons.Loader />
          <p>Uploading {uploadProgress.length} file(s)...</p>
          <div className="upload-files-list">
            {uploadProgress.map((file, idx) => (
              <div key={idx} className={`upload-file-item ${file.status}`}>
                <span>{file.name}</span>
                {file.status === 'complete' && <Icons.Check />}
                {file.status === 'error' && <span className="error-text">{file.error}</span>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <Icons.Upload />
          <p>Drag & drop files here, or click to browse</p>
          <span className="dropzone-hint">
            Images, PDFs, Documents up to 10MB
          </span>
        </>
      )}
    </div>
  );
};

// ============================================================================
// EDIT MEDIA MODAL
// ============================================================================

const EditMediaModal = ({ media, folders, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: media.title || '',
    alt_text: media.alt_text || '',
    caption: media.caption || '',
    folder: media.folder || 'uploads',
    tags: media.tags?.join(', ') || ''
  });
  const [saving, setSaving] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/media/${media.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: form.title || null,
          alt_text: form.alt_text || null,
          caption: form.caption || null,
          folder: form.folder,
          tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
        })
      });
      
      if (!response.ok) throw new Error('Failed to update');
      
      const updated = await response.json();
      onSave(updated);
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update media');
    } finally {
      setSaving(false);
    }
  };
  
  const isImage = media.mime_type?.startsWith('image/');
  
  return (
    <Modal title="Edit Media" onClose={onClose}>
      <div className="edit-media-modal">
        <div className="edit-media-preview">
          {isImage ? (
            <img src={media.storage_url} alt={media.alt_text || media.original_filename} />
          ) : (
            <div className="file-preview">
              <span className="file-icon-large">📄</span>
              <span>{media.original_filename}</span>
            </div>
          )}
          <div className="media-details">
            <p><strong>Filename:</strong> {media.original_filename}</p>
            <p><strong>Type:</strong> {media.mime_type}</p>
            <p><strong>Size:</strong> {formatBytes(media.file_size)}</p>
            {media.width && <p><strong>Dimensions:</strong> {media.width} x {media.height}</p>}
            <p><strong>Uploaded:</strong> {formatDate(media.created_at)}</p>
          </div>
          <div className="media-url">
            <label>URL</label>
            <input 
              type="text" 
              value={media.storage_url} 
              readOnly 
              onClick={(e) => e.target.select()}
            />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-media-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Display title"
            />
          </div>
          
          {isImage && (
            <div className="form-group">
              <label>Alt Text</label>
              <input
                type="text"
                value={form.alt_text}
                onChange={(e) => setForm({ ...form, alt_text: e.target.value })}
                placeholder="Describe the image for accessibility"
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Caption</label>
            <textarea
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              placeholder="Optional caption"
              rows={2}
            />
          </div>
          
          <div className="form-group">
            <label>Folder</label>
            <select
              value={form.folder}
              onChange={(e) => setForm({ ...form, folder: e.target.value })}
            >
              <option value="uploads">Uploads</option>
              {folders.map(f => (
                <option key={f.id} value={f.slug}>{f.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="Comma-separated tags"
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// ============================================================================
// MAIN MEDIA LIBRARY VIEW
// ============================================================================

const MediaLibraryView = () => {
  const [media, setMedia] = useState([]);
  const [folders, setFolders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [filterType, setFilterType] = useState('all'); // all, image, document
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [editingMedia, setEditingMedia] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  
  // Fetch media list
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (selectedFolder) params.append('folder', selectedFolder);
      if (filterType === 'image') params.append('mime_type', 'image');
      if (filterType === 'document') params.append('mime_type', 'document');
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`${API_URL}/media?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch media');
      
      const result = await response.json();
      setMedia(result.data);
      setPagination(prev => ({ ...prev, ...result.pagination }));
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedFolder, filterType, searchQuery, pagination.page, pagination.limit]);
  
  // Fetch folders
  const fetchFolders = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/media/folders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch folders');
      
      const result = await response.json();
      setFolders(result);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  }, []);
  
  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/media/stats/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const result = await response.json();
      setStats(result);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);
  
  // Initial load
  useEffect(() => {
    fetchMedia();
    fetchFolders();
    fetchStats();
  }, []);
  
  // Refetch when filters change
  useEffect(() => {
    fetchMedia();
  }, [selectedFolder, filterType, searchQuery, pagination.page]);
  
  // Handle upload complete
  const handleUploadComplete = (newFiles) => {
    setShowUpload(false);
    fetchMedia();
    fetchStats();
  };
  
  // Handle delete
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.original_filename}"? This cannot be undone.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/media/${item.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      setMedia(prev => prev.filter(m => m.id !== item.id));
      setSelectedMedia(prev => prev.filter(id => id !== item.id));
      fetchStats();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete media');
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedMedia.length === 0) return;
    if (!window.confirm(`Delete ${selectedMedia.length} selected files? This cannot be undone.`)) {
      return;
    }
    
    const token = localStorage.getItem('token');
    
    for (const id of selectedMedia) {
      try {
        await fetch(`${API_URL}/media/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        console.error(`Failed to delete ${id}:`, error);
      }
    }
    
    setSelectedMedia([]);
    fetchMedia();
    fetchStats();
  };
  
  // Handle edit save
  const handleEditSave = (updated) => {
    setMedia(prev => prev.map(m => m.id === updated.id ? updated : m));
    setEditingMedia(null);
  };
  
  // Toggle selection
  const toggleSelection = (item) => {
    setSelectedMedia(prev => 
      prev.includes(item.id) 
        ? prev.filter(id => id !== item.id)
        : [...prev, item.id]
    );
  };
  
  // Create folder
  const handleCreateFolder = async () => {
    const name = prompt('Enter folder name:');
    if (!name) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/media/folders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });
      
      if (!response.ok) throw new Error('Failed to create folder');
      
      fetchFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder');
    }
  };
  
  return (
    <div className="media-library-view">
      {/* Header */}
      <div className="view-header">
        <div className="view-title">
          <h2>Media Library</h2>
          {stats && (
            <span className="media-stats">
              {stats.total_files} files • {stats.total_size_formatted}
            </span>
          )}
        </div>
        <div className="view-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowUpload(!showUpload)}
          >
            <Icons.Upload /> Upload Files
          </button>
        </div>
      </div>
      
      {/* Upload Zone (collapsible) */}
      {showUpload && (
        <UploadDropzone 
          folder={selectedFolder}
          onUploadComplete={handleUploadComplete}
        />
      )}
      
      {/* Toolbar */}
      <div className="media-toolbar">
        <div className="toolbar-left">
          {/* Folder Filter */}
          <select 
            value={selectedFolder || ''}
            onChange={(e) => {
              setSelectedFolder(e.target.value || null);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="folder-select"
          >
            <option value="">All Folders</option>
            <option value="uploads">Uploads</option>
            {folders.map(f => (
              <option key={f.id} value={f.slug}>
                {f.name} ({f.file_count})
              </option>
            ))}
          </select>
          
          {/* Type Filter */}
          <div className="filter-buttons">
            <button 
              className={filterType === 'all' ? 'active' : ''}
              onClick={() => { setFilterType('all'); setPagination(prev => ({ ...prev, page: 1 })); }}
            >
              All
            </button>
            <button 
              className={filterType === 'image' ? 'active' : ''}
              onClick={() => { setFilterType('image'); setPagination(prev => ({ ...prev, page: 1 })); }}
            >
              <Icons.Image /> Images
            </button>
            <button 
              className={filterType === 'document' ? 'active' : ''}
              onClick={() => { setFilterType('document'); setPagination(prev => ({ ...prev, page: 1 })); }}
            >
              <Icons.FileText /> Documents
            </button>
          </div>
          
          {/* Search */}
          <div className="search-box">
            <Icons.Search />
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            />
          </div>
        </div>
        
        <div className="toolbar-right">
          {/* Bulk Actions */}
          {selectedMedia.length > 0 && (
            <div className="bulk-actions">
              <span>{selectedMedia.length} selected</span>
              <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
                <Icons.Trash /> Delete
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedMedia([])}
              >
                Clear
              </button>
            </div>
          )}
          
          {/* New Folder */}
          <button className="btn btn-secondary btn-sm" onClick={handleCreateFolder}>
            <Icons.FolderPlus /> New Folder
          </button>
          
          {/* View Toggle */}
          <div className="view-toggle">
            <button 
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Icons.Grid />
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <Icons.List />
            </button>
          </div>
        </div>
      </div>
      
      {/* Media Grid/List */}
      {loading ? (
        <div className="loading-state">
          <Icons.Loader />
          <p>Loading media...</p>
        </div>
      ) : media.length === 0 ? (
        <div className="empty-state">
          <Icons.Image />
          <h3>No media files</h3>
          <p>Upload images and documents to get started</p>
          <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
            <Icons.Upload /> Upload Files
          </button>
        </div>
      ) : (
        <>
          <div className={`media-container ${viewMode}`}>
            {media.map(item => (
              <MediaCard
                key={item.id}
                media={item}
                isSelected={selectedMedia.includes(item.id)}
                onSelect={toggleSelection}
                onEdit={setEditingMedia}
                onDelete={handleDelete}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button 
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </button>
              <span>Page {pagination.page} of {pagination.pages}</span>
              <button 
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Edit Modal */}
      {editingMedia && (
        <EditMediaModal
          media={editingMedia}
          folders={folders}
          onClose={() => setEditingMedia(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default MediaLibraryView;
