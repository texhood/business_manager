/**
 * CTA (Call to Action) Block Component
 * Prominent banner encouraging user action
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './blocks.css';

const CTABlock = ({ content, settings }) => {
  const {
    headline = '',
    subheadline = '',
    buttonText = '',
    buttonLink = '',
    secondaryButtonText = '',
    secondaryButtonLink = '',
    alignment = 'center',
    padding = 'large'
  } = content;

  const { 
    backgroundColor = 'var(--color-primary)', 
    textColor = '#ffffff',
    backgroundImage = ''
  } = settings;

  const sectionStyle = {
    backgroundColor: backgroundColor,
    color: textColor,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    textAlign: alignment
  };

  const isExternalLink = (url) => url && (url.startsWith('http://') || url.startsWith('https://'));

  const renderButton = (text, link, isPrimary = true) => {
    if (!text || !link) return null;

    const className = isPrimary 
      ? 'btn btn-white btn-lg' 
      : 'btn btn-outline-white btn-lg';
    
    if (isExternalLink(link)) {
      return (
        <a href={link} className={className} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      );
    }
    
    return (
      <Link to={link} className={className}>
        {text}
      </Link>
    );
  };

  return (
    <section className={`block block-cta padding-${padding}`} style={sectionStyle}>
      <div className="container">
        <div className="cta-content">
          {headline && <h2 className="cta-headline">{headline}</h2>}
          {subheadline && <p className="cta-subheadline">{subheadline}</p>}
          {(buttonText || secondaryButtonText) && (
            <div className="cta-buttons">
              {renderButton(buttonText, buttonLink, true)}
              {renderButton(secondaryButtonText, secondaryButtonLink, false)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CTABlock;
