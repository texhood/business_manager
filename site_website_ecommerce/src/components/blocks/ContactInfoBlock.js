/**
 * Contact Info Block Component
 * Displays contact information (phone, email, address, hours)
 */

import React from 'react';
import { useSite } from '../../context/SiteContext';
import './blocks.css';

const ContactInfoBlock = ({ content, settings }) => {
  const site = useSite();
  
  const {
    title = 'Contact Information',
    showPhone = true,
    showEmail = true,
    showAddress = true,
    showHours = true,
    showMap = false,
    layout = 'vertical', // 'vertical', 'horizontal', 'cards'
    // Optional overrides (use site settings if not provided)
    customPhone = '',
    customEmail = '',
    customAddress = ''
  } = content;

  const { backgroundColor = '', padding = 'medium' } = settings;

  // Use custom values or fall back to site settings
  const phone = customPhone || site.contactInfo?.phone || '';
  const email = customEmail || site.contactInfo?.email || '';
  const address = customAddress || site.contactInfo?.address || '';
  const hours = site.businessHours || [];

  const sectionStyle = {
    backgroundColor: backgroundColor || undefined
  };

  return (
    <section className={`block block-contact-info padding-${padding}`} style={sectionStyle}>
      <div className="container">
        {title && <h2 className="block-title">{title}</h2>}
        
        <div className={`contact-info-grid layout-${layout}`}>
          {showPhone && phone && (
            <div className="contact-info-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div className="contact-text">
                <h4>Phone</h4>
                <p><a href={`tel:${phone.replace(/[^0-9+]/g, '')}`}>{phone}</a></p>
              </div>
            </div>
          )}

          {showEmail && email && (
            <div className="contact-info-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div className="contact-text">
                <h4>Email</h4>
                <p><a href={`mailto:${email}`}>{email}</a></p>
              </div>
            </div>
          )}

          {showAddress && address && (
            <div className="contact-info-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className="contact-text">
                <h4>Address</h4>
                <p style={{ whiteSpace: 'pre-line' }}>{address}</p>
              </div>
            </div>
          )}

          {showHours && hours.length > 0 && (
            <div className="contact-info-item contact-hours">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="contact-text">
                <h4>Hours</h4>
                <ul className="hours-list">
                  {hours.map((item, index) => (
                    <li key={index}>
                      <span className="hours-day">{item.day}</span>
                      <span className="hours-time">{item.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactInfoBlock;
