/**
 * Image Block Component
 * Single image with optional caption and link
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './blocks.css';

const ImageBlock = ({ content, settings }) => {
  const {
    src = '',
    alt = '',
    caption = '',
    link = '',
    alignment = 'center', // 'left', 'center', 'right', 'full'
    size = 'medium' // 'small', 'medium', 'large', 'full'
  } = content;

  const { backgroundColor = '', padding = 'medium' } = settings;

  const sectionStyle = {
    backgroundColor: backgroundColor || undefined,
    textAlign: alignment
  };

  const isExternalLink = link && (link.startsWith('http://') || link.startsWith('https://'));

  const imageElement = (
    <figure className={`image-figure size-${size}`}>
      <img src={src} alt={alt} loading="lazy" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );

  const wrappedImage = link ? (
    isExternalLink ? (
      <a href={link} target="_blank" rel="noopener noreferrer">
        {imageElement}
      </a>
    ) : (
      <Link to={link}>{imageElement}</Link>
    )
  ) : (
    imageElement
  );

  return (
    <section className={`block block-image padding-${padding}`} style={sectionStyle}>
      <div className="container">
        {wrappedImage}
      </div>
    </section>
  );
};

export default ImageBlock;
