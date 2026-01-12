import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Blog.css';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch(`${API_URL}/blog`);
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        const data = await response.json();
        setPosts(data.data || []);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Unable to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <div className="blog-hero-image">
          <img 
            src="https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1577170369127-IBXEQUXW5SK5ZLQULDAG/farm+mist+jpg.jpg" 
            alt="Farm at sunrise"
          />
        </div>
        <div className="blog-hero-content">
          <h1>Blog</h1>
          <p>Stories and updates from Hood Family Farms</p>
        </div>
      </section>

      <section className="blog-content section">
        <div className="container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading posts...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="no-posts">
              <h2>No posts yet</h2>
              <p>Check back soon for updates from the farm!</p>
            </div>
          ) : (
            <div className="blog-grid">
              {posts.map(post => (
                <article key={post.id} className="blog-card">
                  <Link to={`/blog/${post.slug}`}>
                    <div className="blog-card-image">
                      <img 
                        src={post.featured_image || 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555900163717-AYN5T9AUW61HX4WYDX8K/wide+shot+sunset.jpg'} 
                        alt={post.title} 
                      />
                    </div>
                    <div className="blog-card-content">
                      <span className="blog-date">{formatDate(post.published_at)}</span>
                      <h2>{post.title}</h2>
                      {post.excerpt && <p>{post.excerpt}</p>}
                      {post.tags && post.tags.length > 0 && (
                        <div className="blog-tags">
                          {post.tags.map((tag, index) => (
                            <span key={index} className="blog-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                      <span className="read-more">Read More →</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Blog;
