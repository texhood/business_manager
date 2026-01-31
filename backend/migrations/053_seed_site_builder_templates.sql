-- Migration: 053_seed_site_builder_templates.sql (CORRECTED)
-- Seeds default templates and block types for the Site Builder
-- Run: psql -U postgres -d business_manager -f migrations/053_seed_site_builder_templates.sql

-- ============================================================================
-- BLOCK TYPES
-- ============================================================================

-- First, ensure the block_types table exists
CREATE TABLE IF NOT EXISTS block_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'content',
  icon VARCHAR(50),
  content_schema JSONB DEFAULT '{}',
  default_content JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clear existing block types and re-seed
DELETE FROM block_types;

-- Layout blocks
INSERT INTO block_types (id, name, description, category, icon, sort_order, content_schema, default_content) VALUES
('hero', 'Hero Banner', 'Large banner with headline, image, and call-to-action', 'layout', 'image', 1, 
  '{
    "type": "object",
    "properties": {
      "headline": {"type": "string", "title": "Headline"},
      "subheadline": {"type": "string", "title": "Subheadline", "format": "textarea"},
      "backgroundImage": {"type": "string", "title": "Background Image", "format": "image"},
      "overlayOpacity": {"type": "number", "title": "Overlay Opacity", "minimum": 0, "maximum": 1, "default": 0.3},
      "alignment": {"type": "string", "title": "Text Alignment", "enum": ["left", "center", "right"], "default": "center"},
      "button": {
        "type": "object",
        "title": "Primary Button",
        "properties": {
          "text": {"type": "string", "title": "Button Text"},
          "link": {"type": "string", "title": "Button Link"}
        }
      },
      "secondaryButton": {
        "type": "object",
        "title": "Secondary Button",
        "properties": {
          "text": {"type": "string", "title": "Button Text"},
          "link": {"type": "string", "title": "Button Link"}
        }
      }
    }
  }',
  '{"headline": "Welcome to Our Site", "subheadline": "Your tagline here", "alignment": "center", "overlayOpacity": 0.3}'
),

('two-column', 'Two Column Layout', 'Side-by-side content with image and text', 'layout', 'columns', 2,
  '{
    "type": "object",
    "properties": {
      "title": {"type": "string", "title": "Title"},
      "content": {"type": "string", "title": "Content", "format": "richtext"},
      "image": {"type": "string", "title": "Image", "format": "image"},
      "imagePosition": {"type": "string", "title": "Image Position", "enum": ["left", "right"], "default": "right"},
      "button": {
        "type": "object",
        "title": "Button",
        "properties": {
          "text": {"type": "string", "title": "Button Text"},
          "link": {"type": "string", "title": "Button Link"}
        }
      }
    }
  }',
  '{"title": "Section Title", "content": "Add your content here...", "imagePosition": "right"}'
),

('spacer', 'Spacer', 'Add vertical spacing between sections', 'layout', 'minus', 3,
  '{
    "type": "object",
    "properties": {
      "height": {"type": "string", "title": "Height", "enum": ["small", "medium", "large", "xlarge"], "default": "medium"}
    }
  }',
  '{"height": "medium"}'
);

-- Content blocks
INSERT INTO block_types (id, name, description, category, icon, sort_order, content_schema, default_content) VALUES
('text', 'Text Block', 'Rich text content area', 'content', 'file-text', 10,
  '{
    "type": "object",
    "properties": {
      "content": {"type": "string", "title": "Content", "format": "richtext"}
    }
  }',
  '{"content": "<p>Add your text content here...</p>"}'
),

('feature-cards', 'Feature Cards', 'Grid of feature cards with icons', 'content', 'grid', 11,
  '{
    "type": "object",
    "properties": {
      "title": {"type": "string", "title": "Section Title"},
      "columns": {"type": "integer", "title": "Columns", "minimum": 2, "maximum": 4, "default": 3},
      "cards": {
        "type": "array",
        "title": "Cards",
        "items": {
          "type": "object",
          "properties": {
            "icon": {"type": "string", "title": "Icon Name"},
            "title": {"type": "string", "title": "Title"},
            "description": {"type": "string", "title": "Description", "format": "textarea"}
          }
        }
      }
    }
  }',
  '{"title": "Our Features", "columns": 3, "cards": [{"icon": "star", "title": "Feature 1", "description": "Description here"}]}'
),

('testimonial', 'Testimonial', 'Customer quote with attribution', 'content', 'quote', 12,
  '{
    "type": "object",
    "properties": {
      "quote": {"type": "string", "title": "Quote", "format": "textarea"},
      "author": {"type": "string", "title": "Author Name"},
      "role": {"type": "string", "title": "Author Title/Role"},
      "image": {"type": "string", "title": "Author Photo", "format": "image"}
    }
  }',
  '{"quote": "This is an amazing product!", "author": "Happy Customer"}'
),

('testimonials-carousel', 'Testimonials Carousel', 'Rotating testimonials slider', 'content', 'star', 13,
  '{
    "type": "object",
    "properties": {
      "title": {"type": "string", "title": "Section Title"},
      "testimonials": {
        "type": "array",
        "title": "Testimonials",
        "items": {
          "type": "object",
          "properties": {
            "quote": {"type": "string", "title": "Quote", "format": "textarea"},
            "author": {"type": "string", "title": "Author Name"},
            "role": {"type": "string", "title": "Author Title/Role"},
            "image": {"type": "string", "title": "Author Photo", "format": "image"}
          }
        }
      }
    }
  }',
  '{"title": "What Our Customers Say", "testimonials": []}'
),

('faq', 'FAQ Accordion', 'Expandable frequently asked questions', 'content', 'help-circle', 14,
  '{
    "type": "object",
    "properties": {
      "title": {"type": "string", "title": "Section Title"},
      "items": {
        "type": "array",
        "title": "Questions",
        "items": {
          "type": "object",
          "properties": {
            "question": {"type": "string", "title": "Question"},
            "answer": {"type": "string", "title": "Answer", "format": "richtext"}
          }
        }
      }
    }
  }',
  '{"title": "Frequently Asked Questions", "items": [{"question": "Sample question?", "answer": "Sample answer."}]}'
);

-- Media blocks
INSERT INTO block_types (id, name, description, category, icon, sort_order, content_schema, default_content) VALUES
('image', 'Image', 'Single image with optional caption', 'media', 'image', 20,
  '{
    "type": "object",
    "properties": {
      "src": {"type": "string", "title": "Image URL", "format": "image"},
      "alt": {"type": "string", "title": "Alt Text"},
      "caption": {"type": "string", "title": "Caption"},
      "size": {"type": "string", "title": "Size", "enum": ["small", "medium", "large", "full"], "default": "large"}
    }
  }',
  '{"size": "large"}'
),

('gallery', 'Image Gallery', 'Grid or masonry gallery of images', 'media', 'grid', 21,
  '{
    "type": "object",
    "properties": {
      "layout": {"type": "string", "title": "Layout", "enum": ["grid", "masonry"], "default": "grid"},
      "columns": {"type": "integer", "title": "Columns", "minimum": 2, "maximum": 6, "default": 3},
      "images": {
        "type": "array",
        "title": "Images",
        "items": {
          "type": "object",
          "properties": {
            "src": {"type": "string", "title": "Image URL", "format": "image"},
            "alt": {"type": "string", "title": "Alt Text"},
            "caption": {"type": "string", "title": "Caption"}
          }
        }
      }
    }
  }',
  '{"layout": "grid", "columns": 3, "images": []}'
),

('video', 'Video Embed', 'YouTube or Vimeo video embed', 'media', 'play', 22,
  '{
    "type": "object",
    "properties": {
      "url": {"type": "string", "title": "Video URL"},
      "title": {"type": "string", "title": "Title"},
      "autoplay": {"type": "boolean", "title": "Autoplay", "default": false}
    }
  }',
  '{"autoplay": false}'
);

-- Commerce blocks
INSERT INTO block_types (id, name, description, category, icon, sort_order, content_schema, default_content) VALUES
('product-grid', 'Product Grid', 'Display products from your store', 'commerce', 'shopping-bag', 30,
  '{
    "type": "object",
    "properties": {
      "title": {"type": "string", "title": "Section Title"},
      "category": {"type": "string", "title": "Category Filter"},
      "limit": {"type": "integer", "title": "Number of Products", "default": 6, "minimum": 1, "maximum": 24},
      "columns": {"type": "integer", "title": "Columns", "minimum": 2, "maximum": 4, "default": 3},
      "showPrice": {"type": "boolean", "title": "Show Price", "default": true},
      "showAddToCart": {"type": "boolean", "title": "Show Add to Cart", "default": true}
    }
  }',
  '{"title": "Featured Products", "limit": 6, "columns": 3, "showPrice": true, "showAddToCart": true}'
),

('cta', 'Call to Action', 'Highlighted section with button', 'commerce', 'megaphone', 31,
  '{
    "type": "object",
    "properties": {
      "headline": {"type": "string", "title": "Headline"},
      "subheadline": {"type": "string", "title": "Subheadline", "format": "textarea"},
      "button": {
        "type": "object",
        "title": "Button",
        "properties": {
          "text": {"type": "string", "title": "Button Text"},
          "link": {"type": "string", "title": "Button Link"}
        }
      },
      "backgroundColor": {"type": "string", "title": "Background Color", "format": "color"}
    }
  }',
  '{"headline": "Ready to get started?", "subheadline": "Contact us today to learn more.", "button": {"text": "Contact Us", "link": "/contact"}}'
);

-- Forms blocks
INSERT INTO block_types (id, name, description, category, icon, sort_order, content_schema, default_content) VALUES
('contact-info', 'Contact Info', 'Display contact information', 'forms', 'map-pin', 40,
  '{
    "type": "object",
    "properties": {
      "title": {"type": "string", "title": "Title"},
      "showPhone": {"type": "boolean", "title": "Show Phone", "default": true},
      "showEmail": {"type": "boolean", "title": "Show Email", "default": true},
      "showAddress": {"type": "boolean", "title": "Show Address", "default": true},
      "showHours": {"type": "boolean", "title": "Show Business Hours", "default": true},
      "showMap": {"type": "boolean", "title": "Show Map", "default": false}
    }
  }',
  '{"title": "Contact Us", "showPhone": true, "showEmail": true, "showAddress": true, "showHours": true, "showMap": false}'
),

('form', 'Contact Form', 'Simple contact form', 'forms', 'mail', 41,
  '{
    "type": "object",
    "properties": {
      "title": {"type": "string", "title": "Title"},
      "description": {"type": "string", "title": "Description", "format": "textarea"},
      "submitText": {"type": "string", "title": "Submit Button Text", "default": "Send Message"},
      "successMessage": {"type": "string", "title": "Success Message", "default": "Thanks for your message! We will get back to you soon."}
    }
  }',
  '{"title": "Send us a Message", "submitText": "Send Message", "successMessage": "Thanks for your message!"}'
),

('newsletter', 'Newsletter Signup', 'Email subscription form', 'forms', 'mail', 42,
  '{
    "type": "object",
    "properties": {
      "title": {"type": "string", "title": "Title"},
      "description": {"type": "string", "title": "Description", "format": "textarea"},
      "buttonText": {"type": "string", "title": "Button Text", "default": "Subscribe"},
      "placeholder": {"type": "string", "title": "Input Placeholder", "default": "Enter your email"}
    }
  }',
  '{"title": "Stay Updated", "description": "Subscribe to our newsletter for updates.", "buttonText": "Subscribe"}'
),

('html', 'Custom HTML', 'Raw HTML embed for advanced users', 'forms', 'code', 50,
  '{
    "type": "object",
    "properties": {
      "html": {"type": "string", "title": "HTML Code", "format": "textarea"}
    }
  }',
  '{"html": "<!-- Custom HTML here -->"}'
);

-- ============================================================================
-- SITE TEMPLATES (using existing schema)
-- ============================================================================

-- Clear existing templates and re-seed
DELETE FROM template_zones;
DELETE FROM site_templates;

-- Farm Fresh Theme (based on Hood Family Farms ecommerce site)
INSERT INTO site_templates (id, name, slug, description, template_type, is_default) VALUES
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Farm Fresh',
  'farm-fresh',
  'Warm, earthy design perfect for farms, markets, and artisan food businesses. Features large imagery and organic feel.',
  'page',
  true
);

-- Farm Fresh template zones
INSERT INTO template_zones (template_id, zone_key, zone_name, description, display_order, allowed_blocks, max_blocks) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'hero', 'Hero Section', 'Full-width hero banner at the top', 0, ARRAY['hero'], 1),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'content', 'Main Content', 'Primary content area', 1, ARRAY['two-column', 'text', 'feature-cards', 'gallery', 'image', 'video', 'faq', 'testimonial', 'testimonials-carousel', 'product-grid', 'html'], NULL),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'cta', 'Call to Action', 'Highlighted action section', 2, ARRAY['cta', 'newsletter'], 2),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'footer-content', 'Footer Content', 'Above-footer content area', 3, ARRAY['contact-info', 'newsletter', 'text'], 2);

-- Modern Professional Theme
INSERT INTO site_templates (id, name, slug, description, template_type, is_default) VALUES
(
  'a1b2c3d4-58cc-4372-a567-0e02b2c3d480',
  'Modern Professional',
  'modern-professional',
  'Clean, minimalist design for B2B, professional services, and corporate sites. Emphasizes clarity and trust.',
  'page',
  false
);

-- Modern Professional template zones
INSERT INTO template_zones (template_id, zone_key, zone_name, description, display_order, allowed_blocks, max_blocks) VALUES
('a1b2c3d4-58cc-4372-a567-0e02b2c3d480', 'hero', 'Hero Section', 'Full-width hero area', 0, ARRAY['hero'], 1),
('a1b2c3d4-58cc-4372-a567-0e02b2c3d480', 'features', 'Features Section', 'Highlight key features or services', 1, ARRAY['feature-cards', 'two-column'], 2),
('a1b2c3d4-58cc-4372-a567-0e02b2c3d480', 'content', 'Main Content', 'Primary content area', 2, ARRAY['text', 'two-column', 'gallery', 'image', 'video', 'faq', 'testimonials-carousel', 'product-grid', 'html'], NULL),
('a1b2c3d4-58cc-4372-a567-0e02b2c3d480', 'social-proof', 'Social Proof', 'Testimonials and trust indicators', 3, ARRAY['testimonial', 'testimonials-carousel', 'feature-cards'], 2),
('a1b2c3d4-58cc-4372-a567-0e02b2c3d480', 'cta', 'Call to Action', 'Conversion-focused section', 4, ARRAY['cta', 'form', 'newsletter'], 1);

-- Minimal Blog Theme
INSERT INTO site_templates (id, name, slug, description, template_type, is_default) VALUES
(
  'b2c3d4e5-58cc-4372-a567-0e02b2c3d481',
  'Minimal Blog',
  'minimal-blog',
  'Content-focused design for blogs, portfolios, and personal sites. Clean typography and lots of white space.',
  'page',
  false
);

-- Minimal Blog template zones
INSERT INTO template_zones (template_id, zone_key, zone_name, description, display_order, allowed_blocks, max_blocks) VALUES
('b2c3d4e5-58cc-4372-a567-0e02b2c3d481', 'header', 'Page Header', 'Simple header with title', 0, ARRAY['hero', 'text'], 1),
('b2c3d4e5-58cc-4372-a567-0e02b2c3d481', 'content', 'Main Content', 'Article content area', 1, ARRAY['text', 'image', 'gallery', 'video', 'html'], NULL),
('b2c3d4e5-58cc-4372-a567-0e02b2c3d481', 'sidebar', 'Sidebar', 'Optional sidebar content', 2, ARRAY['newsletter', 'text', 'contact-info'], 3);

-- Restaurant/Food Theme
INSERT INTO site_templates (id, name, slug, description, template_type, is_default) VALUES
(
  'c3d4e5f6-58cc-4372-a567-0e02b2c3d482',
  'Restaurant',
  'restaurant',
  'Appetizing design for restaurants, cafes, and food businesses. Features menu sections and reservation calls-to-action.',
  'page',
  false
);

-- Restaurant template zones
INSERT INTO template_zones (template_id, zone_key, zone_name, description, display_order, allowed_blocks, max_blocks) VALUES
('c3d4e5f6-58cc-4372-a567-0e02b2c3d482', 'hero', 'Hero Section', 'Full-width hero with atmosphere shot', 0, ARRAY['hero'], 1),
('c3d4e5f6-58cc-4372-a567-0e02b2c3d482', 'intro', 'Introduction', 'Welcome message and about', 1, ARRAY['two-column', 'text'], 2),
('c3d4e5f6-58cc-4372-a567-0e02b2c3d482', 'menu-preview', 'Menu Preview', 'Featured menu items', 2, ARRAY['product-grid', 'feature-cards', 'gallery'], 2),
('c3d4e5f6-58cc-4372-a567-0e02b2c3d482', 'testimonials', 'Reviews', 'Customer testimonials', 3, ARRAY['testimonials-carousel', 'testimonial'], 1),
('c3d4e5f6-58cc-4372-a567-0e02b2c3d482', 'cta', 'Reservation CTA', 'Call to book/order', 4, ARRAY['cta', 'contact-info', 'form'], 2);

-- Verify inserts
SELECT 'Block Types:' as info, COUNT(*) as count FROM block_types;
SELECT 'Templates:' as info, COUNT(*) as count FROM site_templates;
SELECT 'Template Zones:' as info, COUNT(*) as count FROM template_zones;

-- Show template summary
SELECT t.name as template, t.template_type, COUNT(tz.id) as zones 
FROM site_templates t 
LEFT JOIN template_zones tz ON t.id = tz.template_id 
GROUP BY t.id, t.name, t.template_type 
ORDER BY t.is_default DESC, t.name;