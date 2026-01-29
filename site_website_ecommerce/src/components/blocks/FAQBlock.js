/**
 * FAQ Block Component
 * Accordion-style questions and answers
 */

import React, { useState } from 'react';
import './blocks.css';

const FAQBlock = ({ content, settings }) => {
  const {
    title = '',
    items = [],
    allowMultiple = false,
    style = 'bordered' // 'bordered', 'minimal', 'cards'
  } = content;

  const { backgroundColor = '', padding = 'large' } = settings;

  const [openItems, setOpenItems] = useState([]);

  const sectionStyle = {
    backgroundColor: backgroundColor || undefined
  };

  const toggleItem = (index) => {
    if (allowMultiple) {
      setOpenItems(prev => 
        prev.includes(index) 
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenItems(prev => 
        prev.includes(index) ? [] : [index]
      );
    }
  };

  const isOpen = (index) => openItems.includes(index);

  // Format answer text - preserve line breaks
  const formatAnswer = (answer) => {
    if (!answer) return '';
    return answer.split('\n\n').map((paragraph, i) => (
      <p key={i}>{paragraph}</p>
    ));
  };

  return (
    <section className={`block block-faq padding-${padding}`} style={sectionStyle}>
      <div className="container">
        <div className="faq-container">
          {title && <h2 className="block-title">{title}</h2>}
          
          <div className={`faq-list style-${style}`}>
            {items.map((item, index) => (
              <div 
                key={index} 
                className={`faq-item ${isOpen(index) ? 'open' : ''}`}
              >
                <button 
                  className="faq-question"
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen(index)}
                >
                  <span>{item.question}</span>
                  <span className="faq-icon">{isOpen(index) ? '−' : '+'}</span>
                </button>
                <div className="faq-answer">
                  <div className="faq-answer-content">
                    {formatAnswer(item.answer)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQBlock;
