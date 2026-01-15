/**
 * Blog Preview View
 * Preview how a blog post will look when published
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import './BlogPreviewView.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

const BlogPreviewView = ({ postId, onBack }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        setError('No post ID provided');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/blog/${postId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        
        const result = await response.json();
        setPost(result.data);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="blog-preview-view">
        <div className="preview-loading">
          <Icons.Loader />
          <p>Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-preview-view">
        <div className="preview-error">
          <Icons.AlertCircle />
          <h2>Could not load preview</h2>
          <p>{error || 'Post not found'}</p>
          <button className="btn btn-primary" onClick={onBack}>
            ← Back to Blog Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-preview-view">
      {/* Preview Header Bar */}
      <div className="preview-toolbar">
        <div className="preview-toolbar-left">
          <button className="btn btn-secondary" onClick={onBack}>
            <Icons.ArrowLeft /> Back to Blog
          </button>
          <span className="preview-label">
            <Icons.Eye /> Preview Mode
          </span>
          {post.status !== 'published' && (
            <span className="preview-status-badge">
              {post.status === 'draft' ? 'Draft' : 'Archived'}
            </span>
          )}
        </div>
        <div className="preview-toolbar-right">
          <span className="preview-note">
            This is how the post will appear on the public site
          </span>
        </div>
      </div>

      {/* Preview Content - Styled like public site */}
      <div className="preview-container">
        <article className="preview-article">
          {/* Featured Image */}
          {post.featured_image && (
            <div className="preview-hero">
              <img src={post.featured_image} alt={post.title} />
            </div>
          )}

          <div className="preview-content">
            {/* Post Header */}
            <header className="preview-header">
              <h1>{post.title}</h1>
              <div className="preview-meta">
                {post.author_name && (
                  <span className="preview-author">
                    <Icons.Users /> {post.author_name}
                  </span>
                )}
                <span className="preview-date">
                  <Icons.Calendar /> {post.status === 'published' 
                    ? formatDate(post.published_at) 
                    : `Created ${formatDate(post.created_at)}`}
                </span>
                <span className="preview-views">
                  <Icons.Eye /> {post.view_count || 0} views
                </span>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="preview-tags">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="preview-tag">{tag}</span>
                  ))}
                </div>
              )}
            </header>

            {/* Excerpt */}
            {post.excerpt && (
              <div className="preview-excerpt">
                <p>{post.excerpt}</p>
              </div>
            )}

            {/* Post Body */}
            <div 
              className="preview-body"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Post Footer */}
            <footer className="preview-footer">
              <div className="preview-share">
                <span>Share this post:</span>
                <div className="preview-share-buttons">
                  <button className="share-btn">Facebook</button>
                  <button className="share-btn">Twitter</button>
                  <button className="share-btn">Email</button>
                </div>
              </div>
            </footer>
          </div>
        </article>

        {/* SEO Preview */}
        <div className="seo-preview-section">
          <h3><Icons.Search /> SEO Preview</h3>
          <div className="seo-preview-card">
            <div className="seo-title">
              {post.meta_title || post.title}
            </div>
            <div className="seo-url">
              hoodfamilyfarms.com/blog/{post.slug}
            </div>
            <div className="seo-description">
              {post.meta_description || post.excerpt || 'No description set'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPreviewView;
