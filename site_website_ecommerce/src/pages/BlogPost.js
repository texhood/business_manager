import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './BlogPost.css';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`${API_URL}/blog/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Post not found');
          }
          throw new Error('Failed to fetch blog post');
        }
        const data = await response.json();
        setPost(data.data);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

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
      <div className="blog-post-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <div className="error-state">
            <h2>Post Not Found</h2>
            <p>{error || 'This blog post could not be found.'}</p>
            <Link to="/blog" className="btn btn-primary">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-page">
      {/* Hero with featured image */}
      {post.featured_image && (
        <section className="post-hero">
          <div className="post-hero-image">
            <img src={post.featured_image} alt={post.title} />
          </div>
        </section>
      )}

      <article className="post-content section">
        <div className="container container-narrow">
          {/* Back link */}
          <Link to="/blog" className="back-link">
            ← Back to Blog
          </Link>

          {/* Post header */}
          <header className="post-header">
            <h1>{post.title}</h1>
            <div className="post-meta">
              {post.author_name && (
                <span className="post-author">By {post.author_name}</span>
              )}
              {post.published_at && (
                <span className="post-date">{formatDate(post.published_at)}</span>
              )}
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag, index) => (
                  <Link key={index} to={`/blog?tag=${tag}`} className="post-tag">
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* Post body */}
          <div 
            className="post-body"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share / Navigation */}
          <footer className="post-footer">
            <div className="share-section">
              <span>Share this post:</span>
              <div className="share-buttons">
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn facebook"
                >
                  Facebook
                </a>
                <a 
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn twitter"
                >
                  Twitter
                </a>
                <a 
                  href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(window.location.href)}`}
                  className="share-btn email"
                >
                  Email
                </a>
              </div>
            </div>

            <Link to="/blog" className="btn btn-secondary">
              ← Back to All Posts
            </Link>
          </footer>
        </div>
      </article>
    </div>
  );
}

export default BlogPost;
