/**
 * Two Column Block Component
 * Side-by-side layout with image and text content
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './blocks.css';

const TwoColumnBlock = ({ content, settings }) => {
  const {
    leftContent = '',
    rightContent = '',
    leftImage = '',
    rightImage = '',
    imagePosition = 'left', // 'left' or 'right'
    splitRatio = '50-50', // '50-50', '40-60', '60-40', '33-67', '67-33'
    verticalAlign = 'center', // 'top', 'center', 'bottom'
    buttonText = '',
    buttonLink = ''
  } = content;

  const { backgroundColor = '', padding = 'large' } = settings;

  const sectionStyle = {
    backgroundColor: backgroundColor || undefined
  };

  // Determine which side has the image
  const hasLeftImage = leftImage || imagePosition === 'left';
  const hasRightImage = rightImage || imagePosition === 'right';
  
  // Get the actual image URL
  const imageUrl = leftImage || rightImage || '';
  const textContent = leftContent || rightContent || '';

  // Parse split ratio
  const [leftWidth, rightWidth] = splitRatio.split('-').map(Number);
  const leftFlex = leftWidth / 100;
  const rightFlex = rightWidth / 100;

  const renderImage = () => (
    <div className="two-col-image">
      <img src={imageUrl} alt="" loading="lazy" />
    </div>
  );

  const renderContent = () => (
    <div className="two-col-content">
      <div 
        className="rich-text"
        dangerouslySetInnerHTML={{ __html: textContent }}
      />
      {buttonText && buttonLink && (
        <div className="two-col-cta">
          <Link to={buttonLink} className="btn btn-primary">
            {buttonText}
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <section className={`block block-two-column padding-${padding}`} style={sectionStyle}>
      <div className="container">
        <div className={`two-col-grid align-${verticalAlign}`}>
          <div className="two-col-left" style={{ flex: leftFlex }}>
            {imagePosition === 'left' ? renderImage() : renderContent()}
          </div>
          <div className="two-col-right" style={{ flex: rightFlex }}>
            {imagePosition === 'right' ? renderImage() : renderContent()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TwoColumnBlock;
