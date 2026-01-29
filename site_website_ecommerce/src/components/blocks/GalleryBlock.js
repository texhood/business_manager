/**
 * Gallery Block Component
 * Image grid or masonry layout
 */

import React, { useState } from 'react';
import './blocks.css';

const GalleryBlock = ({ content, settings }) => {
  const {
    title = '',
    images = [],
    layout = 'grid', // 'grid' or 'masonry'
    columns = 3,
    gap = 'medium', // 'small', 'medium', 'large'
    aspectRatio = '4:3' // '1:1', '4:3', '16:9', 'original'
  } = content;

  const { backgroundColor = '', padding = 'large' } = settings;

  const [lightboxImage, setLightboxImage] = useState(null);

  const sectionStyle = {
    backgroundColor: backgroundColor || undefined
  };

  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, 1fr)`
  };

  const getAspectClass = () => {
    if (aspectRatio === 'original') return '';
    return `aspect-${aspectRatio.replace(':', '-')}`;
  };

  const openLightbox = (image) => {
    setLightboxImage(image);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  return (
    <section className={`block block-gallery padding-${padding}`} style={sectionStyle}>
      <div className="container">
        {title && <h2 className="block-title text-center">{title}</h2>}
        
        <div 
          className={`gallery-grid layout-${layout} gap-${gap}`} 
          style={gridStyle}
        >
          {images.map((image, index) => (
            <div 
              key={index} 
              className={`gallery-item ${getAspectClass()}`}
              onClick={() => openLightbox(image)}
            >
              <img 
                src={image.src || image} 
                alt={image.alt || `Gallery image ${index + 1}`}
                loading="lazy"
              />
              {image.caption && (
                <div className="gallery-caption">{image.caption}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="gallery-lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>×</button>
          <img 
            src={lightboxImage.src || lightboxImage} 
            alt={lightboxImage.alt || ''} 
          />
          {lightboxImage.caption && (
            <div className="lightbox-caption">{lightboxImage.caption}</div>
          )}
        </div>
      )}
    </section>
  );
};

export default GalleryBlock;
