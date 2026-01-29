/**
 * Text Block Component
 * Rich text content with various alignment and styling options
 */

import React from 'react';
import './blocks.css';

const TextBlock = ({ content, settings }) => {
  const {
    content: textContent = '',
    title = '',
    alignment = 'left',
    maxWidth = '800px'
  } = content;

  const { backgroundColor = '', padding = 'medium', textColor = '' } = settings;

  const sectionStyle = {
    backgroundColor: backgroundColor || undefined,
    color: textColor || undefined
  };

  const contentStyle = {
    maxWidth,
    margin: alignment === 'center' ? '0 auto' : undefined,
    textAlign: alignment
  };

  return (
    <section className={`block block-text padding-${padding}`} style={sectionStyle}>
      <div className="container">
        <div className="text-content" style={contentStyle}>
          {title && <h2 className="block-title">{title}</h2>}
          <div 
            className="rich-text"
            dangerouslySetInnerHTML={{ __html: textContent }}
          />
        </div>
      </div>
    </section>
  );
};

export default TextBlock;
