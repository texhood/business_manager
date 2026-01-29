/**
 * Block Renderer
 * Maps block_type to React component and renders with content/settings
 */

import React from 'react';

// Block Components
import HeroBlock from './HeroBlock';
import TextBlock from './TextBlock';
import TwoColumnBlock from './TwoColumnBlock';
import GalleryBlock from './GalleryBlock';
import CTABlock from './CTABlock';
import FAQBlock from './FAQBlock';
import ContactInfoBlock from './ContactInfoBlock';
import ContactFormBlock from './ContactFormBlock';
import FeatureCardsBlock from './FeatureCardsBlock';
import ImageBlock from './ImageBlock';
import SpacerBlock from './SpacerBlock';
import VideoBlock from './VideoBlock';
import TestimonialBlock from './TestimonialBlock';
import ProductGridBlock from './ProductGridBlock';
import HTMLBlock from './HTMLBlock';

// Block type to component mapping
const blockComponents = {
  'hero': HeroBlock,
  'text': TextBlock,
  'two-column': TwoColumnBlock,
  'gallery': GalleryBlock,
  'cta': CTABlock,
  'faq': FAQBlock,
  'contact-info': ContactInfoBlock,
  'contact-form': ContactFormBlock,
  'form': ContactFormBlock, // alias
  'feature-cards': FeatureCardsBlock,
  'features': FeatureCardsBlock, // alias
  'image': ImageBlock,
  'spacer': SpacerBlock,
  'video': VideoBlock,
  'testimonial': TestimonialBlock,
  'testimonials': TestimonialBlock, // alias
  'product-grid': ProductGridBlock,
  'products': ProductGridBlock, // alias
  'html': HTMLBlock,
  'custom-html': HTMLBlock, // alias
};

/**
 * Render a single block
 * @param {Object} block - Block data from database
 * @param {number} index - Block index for keys
 */
export const renderBlock = (block, index = 0) => {
  const { block_type, content, settings, id } = block;
  
  const Component = blockComponents[block_type];
  
  if (!Component) {
    console.warn(`Unknown block type: ${block_type}`);
    return null;
  }
  
  return (
    <Component
      key={id || `block-${index}`}
      content={content || {}}
      settings={settings || {}}
      blockId={id}
    />
  );
};

/**
 * Block Renderer Component
 * Renders an array of blocks in order
 */
const BlockRenderer = ({ blocks = [] }) => {
  if (!blocks || blocks.length === 0) {
    return null;
  }
  
  return (
    <div className="block-renderer">
      {blocks
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map((block, index) => renderBlock(block, index))
      }
    </div>
  );
};

export default BlockRenderer;
