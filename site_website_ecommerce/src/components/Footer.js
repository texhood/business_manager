import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      // TODO: Connect to backend for newsletter subscription
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      {/* Newsletter Section */}
      <div className="newsletter-section">
        <div className="container">
          <h3>Don't Miss Out on Farm Updates!</h3>
          <p>Sign up with your email address to receive new product announcements, subscriber-only sales, and exciting farm news.</p>
          
          {subscribed ? (
            <p className="newsletter-success">Thank you for subscribing!</p>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">Sign Up</button>
            </form>
          )}
          <p className="privacy-note">We respect your privacy.</p>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Contact Info */}
            <div className="footer-section">
              <h4>Hood Family Farms</h4>
              <address>
                3950 County Road 3802,<br />
                Bullard, TX 75757,<br />
                United States of America
              </address>
              <a href="mailto:sara@hoodfamilyfarms.com" className="footer-email">
                sara@hoodfamilyfarms.com
              </a>
            </div>

            {/* Hours */}
            <div className="footer-section">
              <h4>Hours</h4>
              <ul className="hours-list">
                <li><span>Mon</span><span>Open</span></li>
                <li><span>Tue</span><span>Open</span></li>
                <li><span>Wed</span><span>Open</span></li>
                <li><span>Thu</span><span>Open</span></li>
                <li><span>Fri</span><span>Open</span></li>
                <li><span>Sat</span><span>Open</span></li>
                <li><span>Sun</span><span>Open</span></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/story">Our Story</Link></li>
                <li><Link to="/shopping">Shop</Link></li>
                <li><Link to="/frequently-asked-questions">FAQ</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            {/* Social Media */}
            <div className="footer-section">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="https://www.facebook.com/hoodfamilyfarms/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/hoodfamilyfarms/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Hood Family Farms. All rights reserved.</p>
          <p className="tagline">Going beyond sustainability and supporting a regenerative way of life.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
