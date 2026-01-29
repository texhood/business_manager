/**
 * Hero Block Component
 * Full-width banner with background image, headline, and CTA buttons
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './blocks.css';

const HeroBlock = ({ content, settings }) => {
  const {
    headline = '',
    subheadline = '',
    backgroundImage = '',
    overlayOpacity = 0.4,
    alignment = 'center',
    minHeight = '70vh',
    primaryButton = {},
    secondaryButton = {}
  } = content;

  const { backgroundColor = '' } = settings;

  const heroStyle = {
    minHeight,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
    backgroundColor: backgroundColor || 'var(--color-primary)',
    textAlign: alignment
  };

  const overlayStyle = {
    backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`
  };

  const isExternalLink = (url) => url && (url.startsWith('http://') || url.startsWith('https://'));

  const renderButton = (button, isPrimary = true) => {
    if (!button?.text) return null;

    const className = isPrimary ? 'btn btn-primary btn-lg' : 'btn btn-outline btn-lg';
    
    if (isExternalLink(button.link)) {
      return (
        <a href={button.link} className={className} target="_blank" rel="noopener noreferrer">
          {button.text}
        </a>
      );
    }
    
    return (
      <Link to={button.link || '/'} className={className}>
        {button.text}
      </Link>
    );
  };

  return (
    <section className="block block-hero" style={heroStyle}>
      {backgroundImage && <div className="hero-overlay" style={overlayStyle} />}
      <div className="hero-content">
        <div className="container">
          {headline && <h1 className="hero-headline">{headline}</h1>}
          {subheadline && <p className="hero-subheadline">{subheadline}</p>}
          {(primaryButton?.text || secondaryButton?.text) && (
            <div className="hero-buttons">
              {renderButton(primaryButton, true)}
              {renderButton(secondaryButton, false)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroBlock;
