/**
 * Blog Management View
 * Create, edit, and manage blog posts
 */

import React, { useState, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Icons } from '../common/Icons';
import Modal from '../common/Modal';
import './BlogManagementView.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';
const PUBLIC_SITE_URL = process.env.REACT_APP_PUBLIC_SITE_URL || 'http://localhost:3000';

// Get the base URL for media files (backend server without /api/v1)
const getMediaBaseUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';
  return apiUrl.replace('/api/v1', '').replace('/api', '');
};

const MEDIA_BASE_URL = getMediaBaseUrl();

// Log configuration on load
console.log('[BlogManagementView] Configuration:');
console.log('  API_URL:', API_URL);
console.log('  PUBLIC_SITE_URL:', PUBLIC_SITE_URL);
console.log('  MEDIA_BASE_URL:', MEDIA_BASE_URL);

// Helper to format dates
const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

// Helper to ensure image URLs are valid
// The backend already provides full URLs, so we mostly just pass through
const getImageUrl = (url) => {
  if (!url) return null;
  
  // Log for debugging
  console.log('[getImageUrl] Input:', url);
  
  // If it's already a full URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it starts with /uploads, prepend the media base URL
  if (url.startsWith('/uploads')) {
    const fullUrl = `${MEDIA_BASE_URL}${url}`;
    console.log('[getImageUrl] Prepended base:', fullUrl);
    return fullUrl;
  }
  
  // Otherwise, assume it's a relative path and prepend full path
  const fullUrl = `${MEDIA_BASE_URL}/uploads/${url}`;
  console.log('[getImageUrl] Constructed:', fullUrl);
  return fullUrl;
};

// Debug helper - log image URL issues
const logImageUrl = (label, url, resolved) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Image URL] ${label}: original="${url}" resolved="${resolved}"`);
  }
};

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
};

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { label: 'Draft', className: 'status-draft' },
    published: { label: 'Published', className: 'status-published' },
    archived: { label: 'Archived', className: 'status-archived' }
  };
  
  const config = statusConfig[status] || statusConfig.draft;
  
  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
};

// ============================================================================
// BLOG POST EDITOR MODAL
// ============================================================================

const BlogPostEditor = ({ post, onClose, onSave }) => {
  const isNew = !post;
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'draft',
    tags: '',
    meta_title: '',
    meta_description: ''
  });
  const [saving, setSaving] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [error, setError] = useState(null);
  const [autoSlug, setAutoSlug] = useState(isNew);
  const [activeTab, setActiveTab] = useState('content');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editorMode, setEditorMode] = useState('richtext'); // 'richtext' or 'html'

  // React-Quill toolbar configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote'],
      ['link', 'image'],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'blockquote',
    'link', 'image',
    'align'
  ];

  // Fetch full post data when editing (list doesn't include content)
  useEffect(() => {
    if (post && post.id) {
      const fetchFullPost = async () => {
        setLoadingPost(true);
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/blog/${post.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const result = await response.json();
            const fullPost = result.data;
            setForm({
              title: fullPost.title || '',
              slug: fullPost.slug || '',
              excerpt: fullPost.excerpt || '',
              content: fullPost.content || '',
              featured_image: fullPost.featured_image || '',
              status: fullPost.status || 'draft',
              tags: fullPost.tags?.join(', ') || '',
              meta_title: fullPost.meta_title || '',
              meta_description: fullPost.meta_description || ''
            });
          }
        } catch (err) {
          console.error('Failed to load post:', err);
          setError('Failed to load post data');
        } finally {
          setLoadingPost(false);
        }
      };
      fetchFullPost();
    }
  }, [post]);

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && form.title) {
      setForm(prev => ({ ...prev, slug: generateSlug(prev.title) }));
    }
  }, [form.title, autoSlug]);

  // Load media for picker
  const loadMedia = async () => {
    setLoadingMedia(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/media?mime_type=image&limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setMediaList(result.data || []);
      }
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleOpenMediaPicker = () => {
    loadMedia();
    setShowMediaPicker(true);
  };

  const handleSelectMedia = (media) => {
    // Use storage_url directly - it's already the full URL from the server
    console.log('Selected media:', media);
    setForm(prev => ({ ...prev, featured_image: media.storage_url }));
    setShowMediaPicker(false);
  };

  // Handle drag & drop for featured image
  const handleImageDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(true);
  };

  const handleImageDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
  };

  const handleImageDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    // Upload the first image
    const file = files[0];
    setUploadingImage(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      // IMPORTANT: folder must be appended BEFORE files for multer to access it
      formData.append('folder', 'blog');
      formData.append('files', file);

      const response = await fetch(`${API_URL}/media/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      console.log('Upload response:', result);
      if (result.data && result.data.length > 0) {
        const uploaded = result.data[0];
        console.log('Uploaded file:', uploaded);
        // Use storage_url directly - it's already the full URL
        const imageUrl = uploaded.storage_url;
        console.log('Using storage_url:', imageUrl);
        setForm(prev => ({ ...prev, featured_image: imageUrl }));
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const url = isNew ? `${API_URL}/blog` : `${API_URL}/blog/${post.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const payload = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt || null,
        content: form.content,
        featured_image: form.featured_image || null,
        status: form.status,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save post');
      }

      const result = await response.json();
      onSave(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="blog-editor-overlay">
      <div className="blog-editor">
        <div className="blog-editor-header">
          <h2>{isNew ? 'New Blog Post' : 'Edit Blog Post'}</h2>
          <button className="btn-close" onClick={onClose}>
            <Icons.X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="blog-editor-body">
            {/* Main Title */}
            <div className="form-group title-group">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Post title..."
                className="title-input"
                required
              />
            </div>

            {/* Slug */}
            <div className="form-group slug-group">
              <span className="slug-prefix">/blog/</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setForm({ ...form, slug: e.target.value });
                }}
                placeholder="post-url-slug"
                className="slug-input"
              />
              {!autoSlug && (
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => {
                    setAutoSlug(true);
                    setForm(prev => ({ ...prev, slug: generateSlug(prev.title) }));
                  }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="editor-tabs">
              <button
                type="button"
                className={activeTab === 'content' ? 'active' : ''}
                onClick={() => setActiveTab('content')}
              >
                Content
              </button>
              <button
                type="button"
                className={activeTab === 'seo' ? 'active' : ''}
                onClick={() => setActiveTab('seo')}
              >
                SEO & Meta
              </button>
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="tab-content">
                {/* Excerpt */}
                <div className="form-group">
                  <label>Excerpt</label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    placeholder="Brief summary of the post (shown in listings)..."
                    rows={2}
                  />
                </div>

                {/* Featured Image */}
                <div className="form-group">
                  <label>Featured Image</label>
                  {form.featured_image && (
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px', wordBreak: 'break-all' }}>
                      URL: {form.featured_image}
                    </div>
                  )}
                  <div 
                    className={`featured-image-picker ${isDraggingImage ? 'dragging' : ''}`}
                    onDragOver={handleImageDragOver}
                    onDragLeave={handleImageDragLeave}
                    onDrop={handleImageDrop}
                  >
                    {uploadingImage ? (
                      <div className="btn-pick-image uploading">
                        <Icons.Loader />
                        Uploading...
                      </div>
                    ) : form.featured_image ? (
                      <div className="featured-image-preview">
                        <img 
                          src={getImageUrl(form.featured_image)} 
                          alt="Featured" 
                          onLoad={() => console.log('Image loaded successfully:', getImageUrl(form.featured_image))}
                          onError={(e) => {
                            const attemptedUrl = getImageUrl(form.featured_image);
                            console.error('Featured image load failed:');
                            console.error('  Original URL:', form.featured_image);
                            console.error('  Resolved URL:', attemptedUrl);
                            console.error('  MEDIA_BASE_URL:', MEDIA_BASE_URL);
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120"><rect fill="%23f5f5f5" width="200" height="120"/><text x="100" y="60" text-anchor="middle" fill="%23999" font-size="12">Image not found</text></svg>';
                          }}
                        />
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => setForm({ ...form, featured_image: '' })}
                        >
                          <Icons.X />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-pick-image"
                        onClick={handleOpenMediaPicker}
                      >
                        <Icons.Image />
                        <span>Choose Image</span>
                        <span className="drop-hint">or drag & drop</span>
                      </button>
                    )}
                    {form.featured_image && (
                      <button
                        type="button"
                        className="btn-link"
                        onClick={handleOpenMediaPicker}
                      >
                        Change Image
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="form-group">
                  <div className="content-editor-header">
                    <label>Content</label>
                    <div className="editor-mode-toggle">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="editorMode"
                          value="richtext"
                          checked={editorMode === 'richtext'}
                          onChange={() => setEditorMode('richtext')}
                        />
                        <span>Rich Text</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="editorMode"
                          value="html"
                          checked={editorMode === 'html'}
                          onChange={() => setEditorMode('html')}
                        />
                        <span>HTML</span>
                      </label>
                    </div>
                  </div>
                  
                  {editorMode === 'richtext' ? (
                    <div className="quill-wrapper">
                      <ReactQuill
                        theme="snow"
                        value={form.content}
                        onChange={(value) => setForm({ ...form, content: value })}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Write your blog post content here..."
                      />
                    </div>
                  ) : (
                    <>
                      <textarea
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        placeholder="Write your blog post content here... (HTML supported)"
                        rows={15}
                        className="content-textarea"
                        required
                      />
                      <span className="form-hint">HTML formatting is supported</span>
                    </>
                  )}
                </div>

                {/* Tags */}
                <div className="form-group">
                  <label>Tags</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="farming, recipes, sustainability (comma-separated)"
                  />
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="tab-content">
                <div className="form-group">
                  <label>Meta Title</label>
                  <input
                    type="text"
                    value={form.meta_title}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    placeholder={form.title || 'Page title for search engines'}
                  />
                  <span className="form-hint">
                    {(form.meta_title || form.title).length}/60 characters
                  </span>
                </div>

                <div className="form-group">
                  <label>Meta Description</label>
                  <textarea
                    value={form.meta_description}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    placeholder={form.excerpt || 'Description for search engine results'}
                    rows={3}
                  />
                  <span className="form-hint">
                    {(form.meta_description || form.excerpt).length}/160 characters recommended
                  </span>
                </div>

                {/* SEO Preview */}
                <div className="seo-preview">
                  <label>Search Engine Preview</label>
                  <div className="seo-preview-box">
                    <div className="seo-preview-title">
                      {form.meta_title || form.title || 'Post Title'}
                    </div>
                    <div className="seo-preview-url">
                      hoodfamilyfarms.com/blog/{form.slug || 'post-slug'}
                    </div>
                    <div className="seo-preview-description">
                      {form.meta_description || form.excerpt || 'Post description will appear here...'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="blog-editor-footer">
            {error && <div className="error-message">{error}</div>}
            
            <div className="footer-left">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="status-select"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="footer-right">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : (form.status === 'published' ? 'Publish' : 'Save Draft')}
              </button>
            </div>
          </div>
        </form>

        {/* Media Picker Modal */}
        {showMediaPicker && (
          <Modal title="Select Image" onClose={() => setShowMediaPicker(false)}>
            <div className="media-picker">
              {loadingMedia ? (
                <div className="loading-state">
                  <Icons.Loader />
                  <p>Loading images...</p>
                </div>
              ) : mediaList.length === 0 ? (
                <div className="empty-state">
                  <Icons.Image />
                  <p>No images found. Upload images in the Media Library first.</p>
                </div>
              ) : (
                <div className="media-picker-grid">
                  {mediaList.map(media => (
                    <div
                      key={media.id}
                      className="media-picker-item"
                      onClick={() => handleSelectMedia(media)}
                    >
                      <img 
                        src={media.storage_url} 
                        alt={media.alt_text || media.original_filename}
                        onError={(e) => {
                          console.error('Media picker image load failed:', media.storage_url);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// BLOG POST LIST ITEM
// ============================================================================

const BlogPostItem = ({ post, onEdit, onDelete, onPreview }) => {
  return (
    <div className="blog-post-item">
      <div className="post-thumbnail">
        {post.featured_image ? (
          <img 
            src={getImageUrl(post.featured_image)} 
            alt={post.title}
            onError={(e) => {
              console.error('Post thumbnail load failed:', post.featured_image);
              e.target.style.display = 'none';
              e.target.parentNode.classList.add('image-error');
            }}
          />
        ) : (
          <div className="no-image">
            <Icons.FileText />
          </div>
        )}
      </div>
      
      <div className="post-info">
        <div className="post-title-row">
          <h3 className="post-title">{post.title}</h3>
          <StatusBadge status={post.status} />
        </div>
        
        <p className="post-excerpt">
          {post.excerpt || 'No excerpt provided'}
        </p>
        
        <div className="post-meta">
          <span className="post-author">
            <Icons.Users /> {post.author_name || 'Unknown'}
          </span>
          <span className="post-date">
            <Icons.Calendar /> {post.status === 'published' 
              ? `Published ${formatDate(post.published_at)}` 
              : `Created ${formatDate(post.created_at)}`}
          </span>
          <span className="post-views">
            <Icons.Eye /> {post.view_count || 0} views
          </span>
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, idx) => (
              <span key={idx} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
      
      <div className="post-actions">
        <button className="btn-icon" onClick={() => onEdit(post)} title="Edit">
          <Icons.Edit />
        </button>
        <button 
          className="btn-icon"
          onClick={() => onPreview(post.id)}
          title="Preview"
        >
          <Icons.Eye />
        </button>
        <button className="btn-icon btn-danger" onClick={() => onDelete(post)} title="Delete">
          <Icons.Trash />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN BLOG MANAGEMENT VIEW
// ============================================================================

const BlogManagementView = ({ onPreview }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, archived: 0 });

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`${API_URL}/blog?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const result = await response.json();
      let filteredPosts = result.data || [];
      
      // Client-side status filter (API returns all for staff)
      if (statusFilter !== 'all') {
        filteredPosts = filteredPosts.filter(p => p.status === statusFilter);
      }
      
      setPosts(filteredPosts);
      setPagination(prev => ({ ...prev, ...result.pagination }));
      
      // Calculate stats from all posts
      const allPosts = result.data || [];
      setStats({
        total: allPosts.length,
        published: allPosts.filter(p => p.status === 'published').length,
        draft: allPosts.filter(p => p.status === 'draft').length,
        archived: allPosts.filter(p => p.status === 'archived').length
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle new post
  const handleNewPost = () => {
    setEditingPost(null);
    setShowEditor(true);
  };

  // Handle edit
  const handleEdit = (post) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  // Handle save
  const handleSave = (savedPost) => {
    if (editingPost) {
      setPosts(prev => prev.map(p => p.id === savedPost.id ? savedPost : p));
    } else {
      setPosts(prev => [savedPost, ...prev]);
    }
    setShowEditor(false);
    setEditingPost(null);
    fetchPosts(); // Refresh to get updated stats
  };

  // Handle delete
  const handleDelete = async (post) => {
    const action = post.status === 'archived' 
      ? 'permanently delete' 
      : 'archive';
    
    if (!window.confirm(`Are you sure you want to ${action} "${post.title}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const hard = post.status === 'archived' ? '?hard=true' : '';
      
      const response = await fetch(`${API_URL}/blog/${post.id}${hard}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete post');

      if (post.status === 'archived') {
        setPosts(prev => prev.filter(p => p.id !== post.id));
      } else {
        setPosts(prev => prev.map(p => 
          p.id === post.id ? { ...p, status: 'archived' } : p
        ));
      }
      
      fetchPosts(); // Refresh stats
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete post');
    }
  };

  return (
    <div className="blog-management-view">
      {/* Header */}
      <div className="view-header">
        <div className="view-title">
          <h2>Blog Posts</h2>
          <span className="post-count">{stats.total} posts</span>
        </div>
        <div className="view-actions">
          <button className="btn btn-primary" onClick={handleNewPost}>
            <Icons.Plus /> New Post
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div 
          className={`stat-card ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">All Posts</div>
        </div>
        <div 
          className={`stat-card published ${statusFilter === 'published' ? 'active' : ''}`}
          onClick={() => setStatusFilter('published')}
        >
          <div className="stat-value">{stats.published}</div>
          <div className="stat-label">Published</div>
        </div>
        <div 
          className={`stat-card draft ${statusFilter === 'draft' ? 'active' : ''}`}
          onClick={() => setStatusFilter('draft')}
        >
          <div className="stat-value">{stats.draft}</div>
          <div className="stat-label">Drafts</div>
        </div>
        <div 
          className={`stat-card archived ${statusFilter === 'archived' ? 'active' : ''}`}
          onClick={() => setStatusFilter('archived')}
        >
          <div className="stat-value">{stats.archived}</div>
          <div className="stat-label">Archived</div>
        </div>
      </div>

      {/* Search */}
      <div className="blog-toolbar">
        <div className="search-box">
          <Icons.Search />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="loading-state">
          <Icons.Loader />
          <p>Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <Icons.FileText />
          <h3>No blog posts</h3>
          <p>
            {statusFilter !== 'all' 
              ? `No ${statusFilter} posts found` 
              : 'Create your first blog post to get started'}
          </p>
          {statusFilter === 'all' && (
            <button className="btn btn-primary" onClick={handleNewPost}>
              <Icons.Plus /> Create Post
            </button>
          )}
        </div>
      ) : (
        <div className="posts-list">
          {posts.map(post => (
            <BlogPostItem
              key={post.id}
              post={post}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPreview={onPreview}
            />
          ))}
        </div>
      )}

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

      {/* Editor */}
      {showEditor && (
        <BlogPostEditor
          post={editingPost}
          onClose={() => {
            setShowEditor(false);
            setEditingPost(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default BlogManagementView;
