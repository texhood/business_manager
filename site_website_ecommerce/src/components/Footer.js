import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import './Footer.css';

function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const site = useSite();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      // TODO: Connect to backend for newsletter subscription
      setSubscribed(true);
      setEmail('');
    }
  };

  // Build quick links from navigation
  const quickLinks = site.navigation
    .filter(nav => nav.type !== 'home')
    .slice(0, 4);

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
              <h4>{site.siteName || 'Hood Family Farms'}</h4>
              {site.contactInfo?.address && (
                <address>
                  {site.contactInfo.address.split(',').map((line, i) => (
                    <React.Fragment key={i}>
                      {line.trim()}
                      {i < site.contactInfo.address.split(',').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </address>
              )}
              {site.contactInfo?.email && (
                <a href={`mailto:${site.contactInfo.email}`} className="footer-email">
                  {site.contactInfo.email}
                </a>
              )}
              {site.contactInfo?.phone && (
                <a href={`tel:${site.contactInfo.phone.replace(/[^0-9+]/g, '')}`} className="footer-phone">
                  {site.contactInfo.phone}
                </a>
              )}
            </div>

            {/* Hours */}
            {site.businessHours && site.businessHours.length > 0 && (
              <div className="footer-section">
                <h4>Hours</h4>
                <ul className="hours-list">
                  {site.businessHours.map((item, index) => (
                    <li key={index}>
                      <span>{item.day}</span>
                      <span>{item.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Links */}
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                {quickLinks.length > 0 ? (
                  quickLinks.map((nav, index) => (
                    <li key={index}>
                      <Link to={nav.path}>{nav.label}</Link>
                    </li>
                  ))
                ) : (
                  // Fallback links if no CMS navigation
                  <>
                    <li><Link to="/story">Our Story</Link></li>
                    <li><Link to="/shopping">Shop</Link></li>
                    <li><Link to="/frequently-asked-questions">FAQ</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                  </>
                )}
              </ul>
            </div>

            {/* Social Media */}
            <div className="footer-section">
              <h4>Follow Us</h4>
              <div className="social-links">
                {site.socialLinks?.facebook && (
                  <a href={site.socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </a>
                )}
                {site.socialLinks?.instagram && (
                  <a href={site.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </a>
                )}
                {site.socialLinks?.twitter && (
                  <a href={site.socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                    </svg>
                  </a>
                )}
                {site.socialLinks?.linkedin && (
                  <a href={site.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect x="2" y="9" width="4" height="12"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  </a>
                )}
                {/* Fallback if no social links configured */}
                {!site.socialLinks?.facebook && !site.socialLinks?.instagram && !site.socialLinks?.twitter && !site.socialLinks?.linkedin && (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} {site.siteName || 'Hood Family Farms'}. All rights reserved.</p>
          {site.tagline && (
            <p className="tagline">{site.tagline}</p>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
