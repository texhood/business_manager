import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <div className="notfound-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </div>
        
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>
          Oops! It looks like this page has wandered off the farm. 
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary btn-lg">
            Go Home
          </Link>
          <Link to="/shopping" className="btn btn-secondary btn-lg">
            Shop Products
          </Link>
        </div>

        <div className="notfound-suggestions">
          <h3>You might be looking for:</h3>
          <ul>
            <li><Link to="/shopping">Our Shop</Link></li>
            <li><Link to="/frequently-asked-questions">FAQs</Link></li>
            <li><Link to="/farm-to-fork-food-trailer">Food Trailer</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
