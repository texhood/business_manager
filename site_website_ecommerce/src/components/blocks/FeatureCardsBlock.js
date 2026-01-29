/**
 * Feature Cards Block Component
 * Grid of feature/benefit cards with icons
 */

import React from 'react';
import './blocks.css';

// Simple icon set - can be expanded
const icons = {
  leaf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="3" width="15" height="13"/>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  award: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="7"/>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
};

const FeatureCardsBlock = ({ content, settings }) => {
  const {
    title = '',
    subtitle = '',
    cards = [],
    columns = 3,
    cardStyle = 'bordered' // 'bordered', 'filled', 'minimal'
  } = content;

  const { backgroundColor = '', padding = 'large' } = settings;

  const sectionStyle = {
    backgroundColor: backgroundColor || undefined
  };

  const gridStyle = {
    gridTemplateColumns: `repeat(${Math.min(columns, cards.length)}, 1fr)`
  };

  const renderIcon = (iconName) => {
    const IconComponent = icons[iconName];
    if (IconComponent) {
      return <div className="feature-icon">{IconComponent}</div>;
    }
    // Fallback: render icon name as emoji or text
    return <div className="feature-icon feature-icon-text">{iconName}</div>;
  };

  return (
    <section className={`block block-feature-cards padding-${padding}`} style={sectionStyle}>
      <div className="container">
        {(title || subtitle) && (
          <div className="block-header text-center">
            {title && <h2 className="block-title">{title}</h2>}
            {subtitle && <p className="block-subtitle">{subtitle}</p>}
          </div>
        )}
        
        <div className={`feature-cards-grid style-${cardStyle}`} style={gridStyle}>
          {cards.map((card, index) => (
            <div key={index} className="feature-card">
              {card.icon && renderIcon(card.icon)}
              {card.title && <h3 className="feature-title">{card.title}</h3>}
              {card.description && <p className="feature-description">{card.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCardsBlock;
