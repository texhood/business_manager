/**
 * Testimonial Block Component
 * Customer quotes and reviews
 */

import React from 'react';
import './blocks.css';

const TestimonialBlock = ({ content, settings }) => {
  const {
    title = '',
    testimonials = [],
    layout = 'carousel', // 'carousel', 'grid', 'stacked'
    showImages = true
  } = content;

  const { backgroundColor = '', padding = 'large' } = settings;

  const sectionStyle = {
    backgroundColor: backgroundColor || undefined
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className={`block block-testimonials padding-${padding}`} style={sectionStyle}>
      <div className="container">
        {title && <h2 className="block-title text-center">{title}</h2>}
        
        <div className={`testimonials-grid layout-${layout}`}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-quote">
                <svg className="quote-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
                <p>{testimonial.quote}</p>
              </div>
              <div className="testimonial-author">
                {showImages && testimonial.image && (
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.author} 
                    className="author-image"
                  />
                )}
                <div className="author-info">
                  <span className="author-name">{testimonial.author}</span>
                  {testimonial.location && (
                    <span className="author-location">{testimonial.location}</span>
                  )}
                  {testimonial.role && (
                    <span className="author-role">{testimonial.role}</span>
                  )}
                </div>
              </div>
              {testimonial.rating && (
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`star ${i < testimonial.rating ? 'filled' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialBlock;
