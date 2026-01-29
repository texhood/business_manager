/**
 * HTML Block Component
 * Renders custom HTML content (use with caution)
 */

import React from 'react';
import './blocks.css';

const HTMLBlock = ({ content, settings }) => {
  const {
    html = '',
    containerId = '',
    containerClass = ''
  } = content;

  const { backgroundColor = '', padding = 'medium' } = settings;

  const sectionStyle = {
    backgroundColor: backgroundColor || undefined
  };

  // Basic sanitization - in production, use a library like DOMPurify
  const sanitizeHtml = (html) => {
    // Remove script tags
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  };

  if (!html) {
    return null;
  }

  return (
    <section className={`block block-html padding-${padding}`} style={sectionStyle}>
      <div className="container">
        <div 
          id={containerId || undefined}
          className={`html-content ${containerClass}`}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
        />
      </div>
    </section>
  );
};

export default HTMLBlock;
