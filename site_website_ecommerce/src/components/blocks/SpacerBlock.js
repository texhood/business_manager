/**
 * Spacer Block Component
 * Adds vertical spacing between blocks
 */

import React from 'react';
import './blocks.css';

const SpacerBlock = ({ content, settings }) => {
  const { height = 'medium' } = content; // 'small', 'medium', 'large', 'xlarge' or pixel value
  const { backgroundColor = 'transparent' } = settings;

  // Convert named sizes to pixels
  const getHeight = () => {
    const sizes = {
      small: '24px',
      medium: '48px',
      large: '80px',
      xlarge: '120px'
    };
    return sizes[height] || height;
  };

  const style = {
    height: getHeight(),
    backgroundColor
  };

  return <div className="block block-spacer" style={style} />;
};

export default SpacerBlock;
