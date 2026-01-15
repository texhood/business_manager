/**
 * Social Media Management View
 * Create, schedule, and manage social media posts with calendar view
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../common/Icons';
import Modal from '../common/Modal';
import './SocialMediaView.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

// Platform icons (simple SVG components)
const PlatformIcons = {
  facebook: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  instagram: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  twitter: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  linkedin: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
};

// Helper functions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
};

const formatDateTime = (date) => {
  return `${formatDate(date)} at ${formatTime(date)}`;
};

// Status badge component
const StatusBadge = ({ status }) => {
  const config = {
    draft: { label: 'Draft', className: 'status-draft' },
    scheduled: { label: 'Scheduled', className: 'status-scheduled' },
    publishing: { label: 'Publishing...', className: 'status-publishing' },
    published: { label: 'Published', className: 'status-published' },
    failed: { label: 'Failed', className: 'status-failed' },
    cancelled: { label: 'Cancelled', className: 'status-cancelled' }
  };
  const { label, className } = config[status] || config.draft;
  return <span className={`status-badge ${className}`}>{label}</span>;
};

// ============================================================================
// CALENDAR COMPONENT
// ============================================================================

const Calendar = ({ posts, currentDate, onDateChange, onPostClick, onAddPost }) => {
  const [viewDate, setViewDate] = useState(currentDate || new Date());
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay, year, month };
  };

  const { daysInMonth, startingDay, year, month } = getDaysInMonth(viewDate);
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setViewDate(newDate);
    onDateChange?.(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setViewDate(newDate);
    onDateChange?.(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setViewDate(today);
    onDateChange?.(today);
  };

  const getPostsForDay = (day) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduled_for || post.posted_at);
      return postDate.getDate() === day && 
             postDate.getMonth() === month && 
             postDate.getFullYear() === year;
    });
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPosts = getPostsForDay(day);
      const hasScheduled = dayPosts.some(p => p.status === 'scheduled');
      const hasPublished = dayPosts.some(p => p.status === 'published');
      
      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday(day) ? 'today' : ''} ${dayPosts.length > 0 ? 'has-posts' : ''}`}
          onClick={() => onAddPost?.(new Date(year, month, day))}
        >
          <span className="day-number">{day}</span>
          {dayPosts.length > 0 && (
            <div className="day-posts">
              {dayPosts.slice(0, 3).map(post => (
                <div 
                  key={post.id} 
                  className={`day-post ${post.status}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPostClick?.(post);
                  }}
                  title={post.content.substring(0, 100)}
                >
                  <div className="post-platforms">
                    {post.platforms?.slice(0, 3).map((p, i) => (
                      <span key={i} className={`platform-dot ${p.platform_name}`} title={p.platform_display_name}></span>
                    ))}
                  </div>
                  <span className="post-preview">{post.content.substring(0, 30)}...</span>
                </div>
              ))}
              {dayPosts.length > 3 && (
                <div className="more-posts">+{dayPosts.length - 3} more</div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="btn btn-icon" onClick={prevMonth}>
          <Icons.ChevronDown style={{ transform: 'rotate(90deg)' }} />
        </button>
        <div className="calendar-title">
          <h3>{monthNames[month]} {year}</h3>
          <button className="btn btn-link" onClick={goToToday}>Today</button>
        </div>
        <button className="btn btn-icon" onClick={nextMonth}>
          <Icons.ChevronDown style={{ transform: 'rotate(-90deg)' }} />
        </button>
      </div>
      
      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}
        {renderCalendarDays()}
      </div>
    </div>
  );
};

// ============================================================================
// POST COMPOSER MODAL
// ============================================================================

const PostComposer = ({ post, connections, blogPosts, onClose, onSave }) => {
  const isEditing = !!post;
  const [form, setForm] = useState({
    content: post?.content || '',
    scheduled_for: post?.scheduled_for ? new Date(post.scheduled_for).toISOString().slice(0, 16) : '',
    connection_ids: post?.platforms?.map(p => p.connection_id) || [],
    blog_post_id: post?.blog_post_id || '',
    link_url: post?.link_url || '',
    media_urls: post?.media_urls || []
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(form.content.length);
  }, [form.content]);

  const handleConnectionToggle = (connectionId) => {
    setForm(prev => ({
      ...prev,
      connection_ids: prev.connection_ids.includes(connectionId)
        ? prev.connection_ids.filter(id => id !== connectionId)
        : [...prev.connection_ids, connectionId]
    }));
  };

  const handleBlogPostSelect = (blogPostId) => {
    if (!blogPostId) {
      setForm(prev => ({ ...prev, blog_post_id: '', link_url: '' }));
      return;
    }
    
    const blogPost = blogPosts.find(bp => bp.id === blogPostId);
    if (blogPost) {
      const siteUrl = process.env.REACT_APP_PUBLIC_SITE_URL || 'http://localhost:3002';
      setForm(prev => ({
        ...prev,
        blog_post_id: blogPostId,
        link_url: `${siteUrl}/blog/${blogPost.slug}`,
        content: prev.content || `${blogPost.title}\n\n${blogPost.excerpt || ''}`
      }));
    }
  };

  const handleSubmit = async (e, publishNow = false) => {
    e.preventDefault();
    setError(null);

    if (form.connection_ids.length === 0) {
      setError('Please select at least one platform');
      return;
    }

    if (!form.content.trim()) {
      setError('Please enter post content');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const url = isEditing ? `${API_URL}/social/posts/${post.id}` : `${API_URL}/social/posts`;
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        content: form.content,
        scheduled_for: publishNow ? new Date().toISOString() : (form.scheduled_for || null),
        connection_ids: form.connection_ids,
        blog_post_id: form.blog_post_id || null,
        link_url: form.link_url || null,
        media_urls: form.media_urls
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

  const getMinCharLimit = () => {
    const selectedConnections = connections.filter(c => form.connection_ids.includes(c.id));
    const limits = selectedConnections.map(c => c.max_characters).filter(Boolean);
    return limits.length > 0 ? Math.min(...limits) : null;
  };

  const minCharLimit = getMinCharLimit();
  const isOverLimit = minCharLimit && charCount > minCharLimit;

  return (
    <Modal isOpen={true} title={isEditing ? 'Edit Post' : 'Create Post'} onClose={onClose} size="large">
      <form onSubmit={handleSubmit} className="post-composer">
        {/* Platform Selection */}
        <div className="form-section">
          <label>Post to:</label>
          <div className="platform-selector">
            {connections.length === 0 ? (
              <p className="no-connections">No connected accounts. Connect your social accounts first.</p>
            ) : (
              connections.map(conn => (
                <button
                  key={conn.id}
                  type="button"
                  className={`platform-btn ${form.connection_ids.includes(conn.id) ? 'selected' : ''}`}
                  onClick={() => handleConnectionToggle(conn.id)}
                >
                  <span className={`platform-icon ${conn.platform_name}`}>
                    {PlatformIcons[conn.platform_name]?.()}
                  </span>
                  <span className="platform-name">{conn.account_name || conn.platform_display_name}</span>
                  {conn.max_characters && (
                    <span className="platform-limit">{conn.max_characters} chars</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Share Blog Post */}
        <div className="form-section">
          <label>Share Blog Post (optional):</label>
          <select
            value={form.blog_post_id}
            onChange={(e) => handleBlogPostSelect(e.target.value)}
            className="form-select"
          >
            <option value="">-- Select a blog post --</option>
            {blogPosts.map(bp => (
              <option key={bp.id} value={bp.id}>{bp.title}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="form-section">
          <label>Content:</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="What's on your mind?"
            rows={6}
            className={`form-textarea ${isOverLimit ? 'over-limit' : ''}`}
          />
          <div className="char-counter">
            <span className={isOverLimit ? 'over-limit' : ''}>
              {charCount}{minCharLimit ? ` / ${minCharLimit}` : ''} characters
            </span>
            {isOverLimit && <span className="limit-warning">Content exceeds platform limit!</span>}
          </div>
        </div>

        {/* Link URL */}
        {form.link_url && (
          <div className="form-section">
            <label>Link:</label>
            <input
              type="url"
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
              className="form-input"
              placeholder="https://..."
            />
          </div>
        )}

        {/* Schedule */}
        <div className="form-section">
          <label>Schedule for:</label>
          <input
            type="datetime-local"
            value={form.scheduled_for}
            onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })}
            className="form-input"
            min={new Date().toISOString().slice(0, 16)}
          />
          <span className="form-hint">Leave empty to save as draft</span>
        </div>

        {/* Error */}
        {error && <div className="error-message">{error}</div>}

        {/* Actions */}
        <div className="composer-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <div className="action-group">
            <button 
              type="submit" 
              className="btn btn-secondary"
              disabled={saving || form.connection_ids.length === 0}
            >
              {saving ? 'Saving...' : (form.scheduled_for ? 'Schedule' : 'Save Draft')}
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={(e) => handleSubmit(e, true)}
              disabled={saving || form.connection_ids.length === 0 || isOverLimit}
            >
              Post Now
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

// ============================================================================
// CONNECTIONS MANAGER
// ============================================================================

const ConnectionsManager = ({ connections, platforms, onConnect, onDisconnect, onClose }) => {
  const [connecting, setConnecting] = useState(null);

  const handleConnect = async (platform) => {
    console.log('ConnectionsManager handleConnect clicked for platform:', platform);
    setConnecting(platform.id);
    
    // For MVP, create a mock connection
    // In production, this would initiate OAuth flow
    try {
      const connectionData = {
        platform_id: platform.id,
        account_name: `${platform.display_name} Account`
      };
      console.log('Calling onConnect with:', connectionData);
      await onConnect(connectionData);
      console.log('onConnect completed');
    } catch (err) {
      console.error('handleConnect error:', err);
    } finally {
      setConnecting(null);
    }
  };

  const getConnectionForPlatform = (platformId) => {
    return connections.find(c => c.platform_id === platformId);
  };

  return (
    <Modal isOpen={true} title="Manage Connections" onClose={onClose}>
      <div className="connections-manager">
        <p className="connections-intro">
          Connect your social media accounts to start posting. 
          <br /><small>(In development mode, connections are simulated)</small>
        </p>
        
        {platforms.length === 0 ? (
          <p>Loading platforms...</p>
        ) : (
          <div className="platforms-list">
            {platforms.map(platform => {
              const connection = getConnectionForPlatform(platform.id);
              const isConnected = !!connection;
              
              return (
                <div key={platform.id} className={`platform-item ${isConnected ? 'connected' : ''}`}>
                  <div className="platform-info">
                    <span className={`platform-icon ${platform.name}`}>
                      {PlatformIcons[platform.name]?.()}
                    </span>
                    <div className="platform-details">
                      <span className="platform-name">{platform.display_name}</span>
                      {isConnected && (
                        <span className="account-name">{connection.account_name}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="platform-actions">
                    {isConnected ? (
                      <button 
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => onDisconnect(connection.id)}
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button 
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleConnect(platform)}
                        disabled={connecting === platform.id}
                      >
                        {connecting === platform.id ? 'Connecting...' : 'Connect'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};

// ============================================================================
// POST QUEUE LIST
// ============================================================================

const PostQueue = ({ posts, onEdit, onDelete, onPublish }) => {
  if (posts.length === 0) {
    return (
      <div className="empty-queue">
        <Icons.Calendar />
        <p>No scheduled posts</p>
      </div>
    );
  }

  return (
    <div className="post-queue">
      {posts.map(post => (
        <div key={post.id} className="queue-item">
          <div className="queue-item-header">
            <div className="queue-platforms">
              {post.platforms?.map((p, i) => (
                <span key={i} className={`platform-icon-sm ${p.platform_name}`} title={p.platform_display_name}>
                  {PlatformIcons[p.platform_name]?.()}
                </span>
              ))}
            </div>
            <StatusBadge status={post.status} />
          </div>
          
          <div className="queue-item-content">
            <p>{post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}</p>
          </div>
          
          <div className="queue-item-footer">
            <span className="queue-time">
              {post.scheduled_for 
                ? formatDateTime(post.scheduled_for)
                : post.posted_at 
                  ? `Posted ${formatDateTime(post.posted_at)}`
                  : 'Draft'}
            </span>
            
            <div className="queue-actions">
              {['draft', 'scheduled'].includes(post.status) && (
                <>
                  <button className="btn-icon" onClick={() => onEdit(post)} title="Edit">
                    <Icons.Edit />
                  </button>
                  {post.status === 'draft' && (
                    <button className="btn-icon" onClick={() => onPublish(post.id)} title="Publish Now">
                      <Icons.Play />
                    </button>
                  )}
                  <button className="btn-icon btn-danger" onClick={() => onDelete(post.id)} title="Delete">
                    <Icons.Trash />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// MAIN SOCIAL MEDIA VIEW
// ============================================================================

const SocialMediaView = () => {
  const [view, setView] = useState('calendar'); // 'calendar' or 'queue'
  const [posts, setPosts] = useState([]);
  const [connections, setConnections] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      // Fetch all data in parallel
      const [postsRes, connectionsRes, platformsRes, statsRes, blogRes] = await Promise.all([
        fetch(`${API_URL}/social/posts/calendar?start_date=${getMonthStart(calendarDate)}&end_date=${getMonthEnd(calendarDate)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/social/connections`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/social/platforms`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/social/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/blog?status=published&limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(data.data || []);
      }

      if (connectionsRes.ok) {
        const data = await connectionsRes.json();
        setConnections(data.data || []);
      }

      if (platformsRes.ok) {
        const data = await platformsRes.json();
        setPlatforms(data.data || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.data);
      }

      if (blogRes.ok) {
        const data = await blogRes.json();
        setBlogPosts(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching social data:', err);
    } finally {
      setLoading(false);
    }
  }, [calendarDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getMonthStart = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    return d.toISOString();
  };

  const getMonthEnd = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
    return d.toISOString();
  };

  const handleConnect = async (connectionData) => {
    console.log('handleConnect called with:', connectionData);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/social/connections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(connectionData)
      });

      console.log('Connection response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Connection created:', data);
        await fetchData();
      } else {
        const errorData = await response.json();
        console.error('Connection failed:', errorData);
        alert(`Failed to connect: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Connection error:', err);
      alert(`Connection error: ${err.message}`);
    }
  };

  const handleDisconnect = async (connectionId) => {
    if (!window.confirm('Are you sure you want to disconnect this account?')) return;
    
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/social/connections/${connectionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    fetchData();
  };

  const handleSavePost = (savedPost) => {
    setShowComposer(false);
    setEditingPost(null);
    fetchData();
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/social/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    fetchData();
  };

  const handlePublishPost = async (postId) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/social/posts/${postId}/publish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    fetchData();
  };

  const handleAddPost = (date) => {
    setSelectedDate(date);
    setEditingPost(null);
    setShowComposer(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowComposer(true);
  };

  return (
    <div className="social-media-view">
      {/* Header */}
      <div className="view-header">
        <div className="view-title">
          <h2>Social Media</h2>
          <span className="connection-count">
            {connections.length} connected account{connections.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="view-actions">
          <button className="btn btn-secondary" onClick={() => setShowConnections(true)}>
            <Icons.Users /> Manage Accounts
          </button>
          <button className="btn btn-primary" onClick={() => handleAddPost(new Date())}>
            <Icons.Plus /> New Post
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-value">{stats.posts?.scheduled || 0}</div>
            <div className="stat-label">Scheduled</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.posts?.published || 0}</div>
            <div className="stat-label">Published</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.posts?.drafts || 0}</div>
            <div className="stat-label">Drafts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.engagement?.total_likes || 0}</div>
            <div className="stat-label">Total Likes</div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="view-toggle">
        <button 
          className={`toggle-btn ${view === 'calendar' ? 'active' : ''}`}
          onClick={() => setView('calendar')}
        >
          <Icons.Calendar /> Calendar
        </button>
        <button 
          className={`toggle-btn ${view === 'queue' ? 'active' : ''}`}
          onClick={() => setView('queue')}
        >
          <Icons.List /> Queue
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <Icons.Loader />
          <p>Loading...</p>
        </div>
      ) : connections.length === 0 ? (
        <div className="empty-state">
          <Icons.Users />
          <h3>No Connected Accounts</h3>
          <p>Connect your social media accounts to start scheduling posts.</p>
          <button className="btn btn-primary" onClick={() => setShowConnections(true)}>
            <Icons.Plus /> Connect Account
          </button>
        </div>
      ) : view === 'calendar' ? (
        <Calendar 
          posts={posts}
          currentDate={calendarDate}
          onDateChange={setCalendarDate}
          onPostClick={handleEditPost}
          onAddPost={handleAddPost}
        />
      ) : (
        <PostQueue
          posts={posts.filter(p => ['draft', 'scheduled'].includes(p.status))}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
          onPublish={handlePublishPost}
        />
      )}

      {/* Modals */}
      {showComposer && (
        <PostComposer
          post={editingPost}
          connections={connections}
          blogPosts={blogPosts}
          onClose={() => {
            setShowComposer(false);
            setEditingPost(null);
          }}
          onSave={handleSavePost}
        />
      )}

      {showConnections && (
        <ConnectionsManager
          connections={connections}
          platforms={platforms}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onClose={() => setShowConnections(false)}
        />
      )}
    </div>
  );
};

export default SocialMediaView;
