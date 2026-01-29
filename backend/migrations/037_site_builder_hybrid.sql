-- Site Builder Hybrid System
-- Migration: 037_site_builder_hybrid.sql
-- Implements hybrid template-zone-block architecture for flexible site building

-- ============================================================================
-- SITE TEMPLATES (predefined page layouts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    preview_image VARCHAR(500),
    template_type VARCHAR(50) NOT NULL DEFAULT 'page', -- 'page', 'landing', 'blog', 'product'
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TEMPLATE ZONES (regions within templates that can hold blocks)
-- ============================================================================
CREATE TABLE IF NOT EXISTS template_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES site_templates(id) ON DELETE CASCADE,
    zone_key VARCHAR(50) NOT NULL,              -- 'header', 'hero', 'content', 'sidebar', 'footer'
    zone_name VARCHAR(100) NOT NULL,            -- Display name: "Hero Section", "Main Content"
    description TEXT,
    allowed_blocks TEXT[] DEFAULT '{}',         -- Array of allowed block types, empty = all allowed
    max_blocks INTEGER DEFAULT NULL,            -- NULL = unlimited
    min_blocks INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    default_blocks JSONB DEFAULT '[]',          -- Default blocks to create when using template
    settings_schema JSONB DEFAULT '{}',         -- Zone-level settings schema
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(template_id, zone_key)
);

-- ============================================================================
-- BLOCK TYPES (registry of available block types)
-- ============================================================================
CREATE TABLE IF NOT EXISTS block_types (
    id VARCHAR(50) PRIMARY KEY,                 -- 'hero', 'text', 'image', 'gallery', etc.
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),                           -- Icon name for UI
    category VARCHAR(50) DEFAULT 'content',     -- 'layout', 'content', 'media', 'commerce', 'forms'
    content_schema JSONB NOT NULL,              -- JSON Schema for block content
    default_content JSONB DEFAULT '{}',
    supports_children BOOLEAN DEFAULT false,    -- Can contain nested blocks
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PAGE BLOCKS (actual content blocks on pages)
-- ============================================================================
CREATE TABLE IF NOT EXISTS page_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES site_pages(id) ON DELETE CASCADE,
    zone_key VARCHAR(50) NOT NULL,              -- Which zone this block is in
    block_type VARCHAR(50) NOT NULL REFERENCES block_types(id),
    content JSONB NOT NULL DEFAULT '{}',        -- Block-specific content
    settings JSONB DEFAULT '{}',                -- Block-specific settings (styling, etc.)
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    
    -- For nested blocks
    parent_block_id UUID REFERENCES page_blocks(id) ON DELETE CASCADE,
    
    -- Draft/publish support
    is_draft BOOLEAN DEFAULT false,
    draft_content JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- GLOBAL BLOCKS (reusable blocks across pages)
-- ============================================================================
CREATE TABLE IF NOT EXISTS global_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    block_type VARCHAR(50) NOT NULL REFERENCES block_types(id),
    content JSONB NOT NULL DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, name)
);

-- ============================================================================
-- GLOBAL BLOCK INSTANCES (where global blocks are used)
-- ============================================================================
CREATE TABLE IF NOT EXISTS global_block_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    global_block_id UUID NOT NULL REFERENCES global_blocks(id) ON DELETE CASCADE,
    page_id UUID NOT NULL REFERENCES site_pages(id) ON DELETE CASCADE,
    zone_key VARCHAR(50) NOT NULL,
    display_order INTEGER DEFAULT 0,
    setting_overrides JSONB DEFAULT '{}',       -- Per-instance setting overrides
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SITE ASSETS (media library)
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES tenants(id),
    
    -- File info
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,                 -- bytes
    mime_type VARCHAR(100) NOT NULL,
    
    -- Image-specific
    width INTEGER,
    height INTEGER,
    thumbnail_url VARCHAR(500),
    
    -- Metadata
    alt_text VARCHAR(255),
    title VARCHAR(255),
    caption TEXT,
    
    -- Organization
    folder VARCHAR(255) DEFAULT 'uploads',
    tags TEXT[] DEFAULT '{}',
    category VARCHAR(50),                       -- 'image', 'document', 'video'
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    
    -- Audit
    uploaded_by UUID REFERENCES accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ADD template_id TO site_pages
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_pages' AND column_name = 'template_id'
    ) THEN
        ALTER TABLE site_pages ADD COLUMN template_id UUID REFERENCES site_templates(id);
    END IF;
END $$;

-- ============================================================================
-- ADD is_homepage TO site_pages
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_pages' AND column_name = 'is_homepage'
    ) THEN
        ALTER TABLE site_pages ADD COLUMN is_homepage BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_template_zones_template ON template_zones(template_id);
CREATE INDEX IF NOT EXISTS idx_template_zones_order ON template_zones(template_id, display_order);

CREATE INDEX IF NOT EXISTS idx_page_blocks_page ON page_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_page_blocks_zone ON page_blocks(page_id, zone_key);
CREATE INDEX IF NOT EXISTS idx_page_blocks_order ON page_blocks(page_id, zone_key, display_order);
CREATE INDEX IF NOT EXISTS idx_page_blocks_parent ON page_blocks(parent_block_id) WHERE parent_block_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_page_blocks_type ON page_blocks(block_type);

CREATE INDEX IF NOT EXISTS idx_global_blocks_tenant ON global_blocks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_global_blocks_type ON global_blocks(block_type);

CREATE INDEX IF NOT EXISTS idx_global_block_instances_block ON global_block_instances(global_block_id);
CREATE INDEX IF NOT EXISTS idx_global_block_instances_page ON global_block_instances(page_id);

CREATE INDEX IF NOT EXISTS idx_site_assets_tenant ON site_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_site_assets_folder ON site_assets(tenant_id, folder);
CREATE INDEX IF NOT EXISTS idx_site_assets_category ON site_assets(category);
CREATE INDEX IF NOT EXISTS idx_site_assets_tags ON site_assets USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_site_pages_template ON site_pages(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_site_pages_homepage ON site_pages(tenant_id, is_homepage) WHERE is_homepage = true;

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_page_blocks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS page_blocks_updated ON page_blocks;
CREATE TRIGGER page_blocks_updated
    BEFORE UPDATE ON page_blocks
    FOR EACH ROW EXECUTE FUNCTION update_page_blocks_timestamp();

DROP TRIGGER IF EXISTS global_blocks_updated ON global_blocks;
CREATE TRIGGER global_blocks_updated
    BEFORE UPDATE ON global_blocks
    FOR EACH ROW EXECUTE FUNCTION update_page_blocks_timestamp();

DROP TRIGGER IF EXISTS site_assets_updated ON site_assets;
CREATE TRIGGER site_assets_updated
    BEFORE UPDATE ON site_assets
    FOR EACH ROW EXECUTE FUNCTION update_page_blocks_timestamp();

DROP TRIGGER IF EXISTS site_templates_updated ON site_templates;
CREATE TRIGGER site_templates_updated
    BEFORE UPDATE ON site_templates
    FOR EACH ROW EXECUTE FUNCTION update_page_blocks_timestamp();

-- ============================================================================
-- SEED DATA: BLOCK TYPES
-- ============================================================================
INSERT INTO block_types (id, name, description, icon, category, content_schema, default_content, sort_order) VALUES

-- HERO BLOCK
('hero', 'Hero Banner', 'Large banner with headline, background image, and call-to-action', 'image', 'layout',
'{
    "type": "object",
    "properties": {
        "headline": {"type": "string", "title": "Headline", "maxLength": 120},
        "subheadline": {"type": "string", "title": "Subheadline", "maxLength": 250},
        "backgroundImage": {"type": "string", "format": "image", "title": "Background Image"},
        "backgroundVideo": {"type": "string", "format": "video", "title": "Background Video URL"},
        "overlayColor": {"type": "string", "format": "color", "title": "Overlay Color", "default": "#000000"},
        "overlayOpacity": {"type": "number", "title": "Overlay Opacity", "minimum": 0, "maximum": 1, "default": 0.4},
        "alignment": {"type": "string", "enum": ["left", "center", "right"], "title": "Text Alignment", "default": "center"},
        "verticalAlign": {"type": "string", "enum": ["top", "middle", "bottom"], "title": "Vertical Alignment", "default": "middle"},
        "minHeight": {"type": "string", "title": "Minimum Height", "default": "70vh"},
        "primaryButton": {
            "type": "object",
            "properties": {
                "text": {"type": "string", "title": "Button Text"},
                "link": {"type": "string", "title": "Button Link"},
                "style": {"type": "string", "enum": ["solid", "outline", "ghost"], "default": "solid"}
            }
        },
        "secondaryButton": {
            "type": "object",
            "properties": {
                "text": {"type": "string", "title": "Button Text"},
                "link": {"type": "string", "title": "Button Link"},
                "style": {"type": "string", "enum": ["solid", "outline", "ghost"], "default": "outline"}
            }
        }
    }
}',
'{
    "headline": "Welcome to Our Site",
    "subheadline": "Discover what makes us special",
    "alignment": "center",
    "overlayOpacity": 0.4,
    "primaryButton": {"text": "Get Started", "link": "/contact", "style": "solid"}
}', 1),

-- TEXT BLOCK
('text', 'Text Content', 'Rich text content block', 'file-text', 'content',
'{
    "type": "object",
    "properties": {
        "content": {"type": "string", "format": "richtext", "title": "Content"},
        "alignment": {"type": "string", "enum": ["left", "center", "right", "justify"], "default": "left"},
        "maxWidth": {"type": "string", "title": "Max Width", "default": "none"},
        "columns": {"type": "integer", "enum": [1, 2, 3], "title": "Columns", "default": 1}
    }
}',
'{"content": "", "alignment": "left", "columns": 1}', 2),

-- IMAGE BLOCK
('image', 'Image', 'Single image with optional caption and link', 'image', 'media',
'{
    "type": "object",
    "properties": {
        "src": {"type": "string", "format": "image", "title": "Image"},
        "alt": {"type": "string", "title": "Alt Text"},
        "caption": {"type": "string", "title": "Caption"},
        "link": {"type": "string", "title": "Link URL"},
        "linkTarget": {"type": "string", "enum": ["_self", "_blank"], "default": "_self"},
        "size": {"type": "string", "enum": ["small", "medium", "large", "full"], "default": "large"},
        "alignment": {"type": "string", "enum": ["left", "center", "right"], "default": "center"},
        "rounded": {"type": "boolean", "title": "Rounded Corners", "default": false},
        "shadow": {"type": "boolean", "title": "Drop Shadow", "default": false}
    }
}',
'{"size": "large", "alignment": "center"}', 3),

-- FEATURE CARDS BLOCK
('feature-cards', 'Feature Cards', 'Grid of feature cards with icons', 'grid', 'content',
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Section Title"},
        "subtitle": {"type": "string", "title": "Section Subtitle"},
        "columns": {"type": "integer", "enum": [2, 3, 4], "title": "Columns", "default": 3},
        "cardStyle": {"type": "string", "enum": ["simple", "bordered", "shadowed", "filled"], "default": "simple"},
        "iconPosition": {"type": "string", "enum": ["top", "left"], "default": "top"},
        "cards": {
            "type": "array",
            "title": "Cards",
            "maxItems": 12,
            "items": {
                "type": "object",
                "properties": {
                    "icon": {"type": "string", "title": "Icon"},
                    "image": {"type": "string", "format": "image", "title": "Image (instead of icon)"},
                    "title": {"type": "string", "title": "Title"},
                    "description": {"type": "string", "title": "Description"},
                    "link": {"type": "string", "title": "Link URL"},
                    "linkText": {"type": "string", "title": "Link Text"}
                }
            }
        }
    }
}',
'{
    "columns": 3,
    "cardStyle": "simple",
    "cards": [
        {"icon": "star", "title": "Feature One", "description": "Description of feature one"},
        {"icon": "zap", "title": "Feature Two", "description": "Description of feature two"},
        {"icon": "heart", "title": "Feature Three", "description": "Description of feature three"}
    ]
}', 4),

-- GALLERY BLOCK
('gallery', 'Image Gallery', 'Grid or carousel of images', 'images', 'media',
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Gallery Title"},
        "layout": {"type": "string", "enum": ["grid", "masonry", "carousel", "lightbox"], "default": "grid"},
        "columns": {"type": "integer", "enum": [2, 3, 4, 5], "default": 3},
        "gap": {"type": "string", "enum": ["none", "small", "medium", "large"], "default": "medium"},
        "aspectRatio": {"type": "string", "enum": ["square", "4:3", "16:9", "original"], "default": "square"},
        "images": {
            "type": "array",
            "title": "Images",
            "items": {
                "type": "object",
                "properties": {
                    "src": {"type": "string", "format": "image", "title": "Image"},
                    "alt": {"type": "string", "title": "Alt Text"},
                    "caption": {"type": "string", "title": "Caption"}
                }
            }
        }
    }
}',
'{"layout": "grid", "columns": 3, "gap": "medium", "aspectRatio": "square", "images": []}', 5),

-- TESTIMONIAL BLOCK
('testimonial', 'Testimonial', 'Customer quote with attribution', 'message-circle', 'content',
'{
    "type": "object",
    "properties": {
        "quote": {"type": "string", "title": "Quote", "format": "textarea"},
        "authorName": {"type": "string", "title": "Author Name"},
        "authorTitle": {"type": "string", "title": "Author Title/Role"},
        "authorImage": {"type": "string", "format": "image", "title": "Author Photo"},
        "companyLogo": {"type": "string", "format": "image", "title": "Company Logo"},
        "rating": {"type": "integer", "title": "Star Rating", "minimum": 0, "maximum": 5},
        "style": {"type": "string", "enum": ["simple", "card", "featured"], "default": "card"}
    }
}',
'{"style": "card"}', 6),

-- TESTIMONIALS CAROUSEL BLOCK
('testimonials-carousel', 'Testimonials Carousel', 'Multiple testimonials in carousel format', 'message-square', 'content',
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Section Title"},
        "subtitle": {"type": "string", "title": "Section Subtitle"},
        "autoplay": {"type": "boolean", "title": "Autoplay", "default": true},
        "interval": {"type": "integer", "title": "Interval (seconds)", "default": 5},
        "testimonials": {
            "type": "array",
            "title": "Testimonials",
            "items": {
                "type": "object",
                "properties": {
                    "quote": {"type": "string", "title": "Quote"},
                    "authorName": {"type": "string", "title": "Author Name"},
                    "authorTitle": {"type": "string", "title": "Author Title"},
                    "authorImage": {"type": "string", "format": "image", "title": "Author Photo"},
                    "rating": {"type": "integer", "minimum": 0, "maximum": 5}
                }
            }
        }
    }
}',
'{"autoplay": true, "interval": 5, "testimonials": []}', 7),

-- PRODUCT GRID BLOCK
('product-grid', 'Product Grid', 'Display products from your store', 'shopping-bag', 'commerce',
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Section Title"},
        "subtitle": {"type": "string", "title": "Section Subtitle"},
        "source": {"type": "string", "enum": ["featured", "category", "manual", "recent"], "default": "featured"},
        "categoryId": {"type": "string", "title": "Category ID (if source is category)"},
        "productIds": {"type": "array", "items": {"type": "string"}, "title": "Product IDs (if source is manual)"},
        "limit": {"type": "integer", "title": "Number of Products", "minimum": 1, "maximum": 24, "default": 8},
        "columns": {"type": "integer", "enum": [2, 3, 4], "default": 4},
        "showPrice": {"type": "boolean", "title": "Show Price", "default": true},
        "showButton": {"type": "boolean", "title": "Show Add to Cart", "default": true},
        "viewAllLink": {"type": "string", "title": "View All Link"},
        "viewAllText": {"type": "string", "title": "View All Text", "default": "View All Products"}
    }
}',
'{"source": "featured", "limit": 8, "columns": 4, "showPrice": true, "showButton": true}', 8),

-- CONTACT INFO BLOCK
('contact-info', 'Contact Information', 'Display contact details', 'phone', 'content',
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Section Title"},
        "showPhone": {"type": "boolean", "title": "Show Phone", "default": true},
        "showEmail": {"type": "boolean", "title": "Show Email", "default": true},
        "showAddress": {"type": "boolean", "title": "Show Address", "default": true},
        "showHours": {"type": "boolean", "title": "Show Business Hours", "default": true},
        "showMap": {"type": "boolean", "title": "Show Map", "default": false},
        "mapHeight": {"type": "integer", "title": "Map Height (px)", "default": 300},
        "layout": {"type": "string", "enum": ["vertical", "horizontal", "cards"], "default": "vertical"},
        "customPhone": {"type": "string", "title": "Override Phone"},
        "customEmail": {"type": "string", "title": "Override Email"},
        "customAddress": {"type": "string", "title": "Override Address"}
    }
}',
'{"showPhone": true, "showEmail": true, "showAddress": true, "showHours": true, "layout": "vertical"}', 9),

-- CTA BLOCK
('cta', 'Call to Action', 'Prominent call-to-action banner', 'megaphone', 'layout',
'{
    "type": "object",
    "properties": {
        "headline": {"type": "string", "title": "Headline"},
        "subheadline": {"type": "string", "title": "Subheadline"},
        "buttonText": {"type": "string", "title": "Button Text"},
        "buttonLink": {"type": "string", "title": "Button Link"},
        "buttonStyle": {"type": "string", "enum": ["solid", "outline", "ghost"], "default": "solid"},
        "secondaryButtonText": {"type": "string", "title": "Secondary Button Text"},
        "secondaryButtonLink": {"type": "string", "title": "Secondary Button Link"},
        "backgroundColor": {"type": "string", "format": "color", "title": "Background Color"},
        "backgroundImage": {"type": "string", "format": "image", "title": "Background Image"},
        "alignment": {"type": "string", "enum": ["left", "center", "right"], "default": "center"},
        "padding": {"type": "string", "enum": ["small", "medium", "large"], "default": "large"}
    }
}',
'{
    "headline": "Ready to get started?",
    "subheadline": "Contact us today to learn more",
    "buttonText": "Contact Us",
    "buttonLink": "/contact",
    "alignment": "center",
    "padding": "large"
}', 10),

-- SPACER BLOCK
('spacer', 'Spacer', 'Vertical spacing between blocks', 'more-horizontal', 'layout',
'{
    "type": "object",
    "properties": {
        "height": {"type": "string", "title": "Height", "default": "60px"},
        "showDivider": {"type": "boolean", "title": "Show Divider Line", "default": false},
        "dividerStyle": {"type": "string", "enum": ["solid", "dashed", "dotted"], "default": "solid"},
        "dividerWidth": {"type": "string", "enum": ["25%", "50%", "75%", "100%"], "default": "50%"}
    }
}',
'{"height": "60px", "showDivider": false}', 11),

-- VIDEO BLOCK
('video', 'Video', 'Embedded video from YouTube, Vimeo, or uploaded', 'video', 'media',
'{
    "type": "object",
    "properties": {
        "source": {"type": "string", "enum": ["youtube", "vimeo", "upload"], "default": "youtube"},
        "url": {"type": "string", "title": "Video URL"},
        "posterImage": {"type": "string", "format": "image", "title": "Poster/Thumbnail Image"},
        "autoplay": {"type": "boolean", "title": "Autoplay", "default": false},
        "muted": {"type": "boolean", "title": "Muted", "default": false},
        "loop": {"type": "boolean", "title": "Loop", "default": false},
        "controls": {"type": "boolean", "title": "Show Controls", "default": true},
        "aspectRatio": {"type": "string", "enum": ["16:9", "4:3", "1:1", "9:16"], "default": "16:9"},
        "maxWidth": {"type": "string", "title": "Max Width", "default": "100%"},
        "caption": {"type": "string", "title": "Caption"}
    }
}',
'{"source": "youtube", "controls": true, "aspectRatio": "16:9"}', 12),

-- FAQ BLOCK
('faq', 'FAQ Accordion', 'Frequently asked questions with accordion', 'help-circle', 'content',
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Section Title"},
        "subtitle": {"type": "string", "title": "Section Subtitle"},
        "allowMultiple": {"type": "boolean", "title": "Allow Multiple Open", "default": false},
        "defaultOpen": {"type": "integer", "title": "Default Open Index", "default": 0},
        "style": {"type": "string", "enum": ["simple", "bordered", "separated"], "default": "bordered"},
        "items": {
            "type": "array",
            "title": "FAQ Items",
            "items": {
                "type": "object",
                "properties": {
                    "question": {"type": "string", "title": "Question"},
                    "answer": {"type": "string", "format": "richtext", "title": "Answer"}
                }
            }
        }
    }
}',
'{"allowMultiple": false, "style": "bordered", "items": []}', 13),

-- FORM BLOCK
('form', 'Contact Form', 'Customizable contact form', 'mail', 'forms',
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Form Title"},
        "description": {"type": "string", "title": "Form Description"},
        "recipientEmail": {"type": "string", "format": "email", "title": "Recipient Email"},
        "submitButtonText": {"type": "string", "title": "Submit Button Text", "default": "Send Message"},
        "successMessage": {"type": "string", "title": "Success Message", "default": "Thank you! We will be in touch soon."},
        "fields": {
            "type": "array",
            "title": "Form Fields",
            "items": {
                "type": "object",
                "properties": {
                    "type": {"type": "string", "enum": ["text", "email", "phone", "textarea", "select", "checkbox"], "title": "Field Type"},
                    "name": {"type": "string", "title": "Field Name"},
                    "label": {"type": "string", "title": "Label"},
                    "placeholder": {"type": "string", "title": "Placeholder"},
                    "required": {"type": "boolean", "title": "Required", "default": false},
                    "options": {"type": "array", "items": {"type": "string"}, "title": "Options (for select)"}
                }
            }
        }
    }
}',
'{
    "submitButtonText": "Send Message",
    "successMessage": "Thank you! We will be in touch soon.",
    "fields": [
        {"type": "text", "name": "name", "label": "Name", "required": true},
        {"type": "email", "name": "email", "label": "Email", "required": true},
        {"type": "textarea", "name": "message", "label": "Message", "required": true}
    ]
}', 14),

-- TWO COLUMN BLOCK
('two-column', 'Two Column Layout', 'Side-by-side content with image', 'columns', 'layout',
'{
    "type": "object",
    "properties": {
        "leftContent": {"type": "string", "format": "richtext", "title": "Left Column Content"},
        "rightContent": {"type": "string", "format": "richtext", "title": "Right Column Content"},
        "leftImage": {"type": "string", "format": "image", "title": "Left Column Image"},
        "rightImage": {"type": "string", "format": "image", "title": "Right Column Image"},
        "imagePosition": {"type": "string", "enum": ["left", "right"], "title": "Image Side", "default": "right"},
        "splitRatio": {"type": "string", "enum": ["50-50", "60-40", "40-60", "70-30", "30-70"], "default": "50-50"},
        "verticalAlign": {"type": "string", "enum": ["top", "center", "bottom"], "default": "center"},
        "reverseOnMobile": {"type": "boolean", "title": "Reverse on Mobile", "default": false}
    }
}',
'{"splitRatio": "50-50", "verticalAlign": "center", "imagePosition": "right"}', 15),

-- NEWSLETTER BLOCK
('newsletter', 'Newsletter Signup', 'Email subscription form', 'mail', 'forms',
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Title"},
        "description": {"type": "string", "title": "Description"},
        "placeholder": {"type": "string", "title": "Email Placeholder", "default": "Enter your email"},
        "buttonText": {"type": "string", "title": "Button Text", "default": "Subscribe"},
        "successMessage": {"type": "string", "title": "Success Message", "default": "Thanks for subscribing!"},
        "backgroundColor": {"type": "string", "format": "color", "title": "Background Color"},
        "compact": {"type": "boolean", "title": "Compact Style", "default": false}
    }
}',
'{
    "title": "Stay Updated",
    "description": "Subscribe to our newsletter for the latest news and offers.",
    "placeholder": "Enter your email",
    "buttonText": "Subscribe"
}', 16),

-- HTML BLOCK
('html', 'Custom HTML', 'Raw HTML content (use with caution)', 'code', 'content',
'{
    "type": "object",
    "properties": {
        "html": {"type": "string", "format": "code", "title": "HTML Content"},
        "css": {"type": "string", "format": "code", "title": "Custom CSS"},
        "sandboxed": {"type": "boolean", "title": "Sandbox (iframe)", "default": false}
    }
}',
'{"html": "", "sandboxed": false}', 99)

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    content_schema = EXCLUDED.content_schema,
    default_content = EXCLUDED.default_content,
    sort_order = EXCLUDED.sort_order;

-- ============================================================================
-- SEED DATA: DEFAULT TEMPLATES
-- ============================================================================
INSERT INTO site_templates (id, name, slug, description, template_type, is_default) VALUES

('a0000000-0000-0000-0000-000000000001', 'Standard Page', 'standard-page', 
 'Flexible page layout with hero, main content area, and call-to-action zones', 'page', true),

('a0000000-0000-0000-0000-000000000002', 'Landing Page', 'landing-page',
 'Conversion-focused layout with prominent hero, features, testimonials, and CTA', 'landing', false),

('a0000000-0000-0000-0000-000000000003', 'About Page', 'about-page',
 'Tell your story with hero, content sections, team, and values', 'page', false),

('a0000000-0000-0000-0000-000000000004', 'Contact Page', 'contact-page',
 'Contact form with location information and map', 'page', false),

('a0000000-0000-0000-0000-000000000005', 'Minimal Page', 'minimal-page',
 'Simple page with just a content zone - maximum flexibility', 'page', false)

ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA: TEMPLATE ZONES
-- ============================================================================

-- Standard Page Template Zones
INSERT INTO template_zones (template_id, zone_key, zone_name, description, allowed_blocks, max_blocks, display_order, default_blocks) VALUES

('a0000000-0000-0000-0000-000000000001', 'hero', 'Hero Section', 
 'Large banner at the top of the page', 
 ARRAY['hero'], 1, 1,
 '[{"type": "hero", "content": {"headline": "Page Title", "subheadline": "Page description goes here"}}]'),

('a0000000-0000-0000-0000-000000000001', 'content', 'Main Content', 
 'Primary content area - add any blocks here', 
 ARRAY[]::TEXT[], NULL, 2, '[]'),

('a0000000-0000-0000-0000-000000000001', 'cta', 'Call to Action', 
 'Bottom call-to-action section', 
 ARRAY['cta', 'newsletter'], 1, 3,
 '[{"type": "cta", "content": {"headline": "Ready to get started?", "buttonText": "Contact Us", "buttonLink": "/contact"}}]')

ON CONFLICT (template_id, zone_key) DO NOTHING;

-- Landing Page Template Zones
INSERT INTO template_zones (template_id, zone_key, zone_name, description, allowed_blocks, max_blocks, display_order, default_blocks) VALUES

('a0000000-0000-0000-0000-000000000002', 'hero', 'Hero Section', 
 'Prominent hero with strong call-to-action', 
 ARRAY['hero'], 1, 1,
 '[{"type": "hero", "content": {"headline": "Transform Your Business", "subheadline": "Discover how we can help you succeed", "primaryButton": {"text": "Get Started", "link": "/contact"}}}]'),

('a0000000-0000-0000-0000-000000000002', 'features', 'Features Section', 
 'Highlight key features or benefits', 
 ARRAY['feature-cards', 'two-column'], 2, 2,
 '[{"type": "feature-cards", "content": {"title": "Why Choose Us", "columns": 3}}]'),

('a0000000-0000-0000-0000-000000000002', 'social-proof', 'Social Proof', 
 'Testimonials and trust indicators', 
 ARRAY['testimonial', 'testimonials-carousel', 'gallery'], 2, 3, '[]'),

('a0000000-0000-0000-0000-000000000002', 'content', 'Additional Content', 
 'Flexible content area', 
 ARRAY[]::TEXT[], NULL, 4, '[]'),

('a0000000-0000-0000-0000-000000000002', 'cta', 'Final Call to Action', 
 'Strong closing CTA', 
 ARRAY['cta'], 1, 5,
 '[{"type": "cta", "content": {"headline": "Ready to take the next step?", "buttonText": "Contact Us Today", "buttonLink": "/contact"}}]')

ON CONFLICT (template_id, zone_key) DO NOTHING;

-- About Page Template Zones
INSERT INTO template_zones (template_id, zone_key, zone_name, description, allowed_blocks, max_blocks, display_order, default_blocks) VALUES

('a0000000-0000-0000-0000-000000000003', 'hero', 'Page Header', 
 'Simple header with page title', 
 ARRAY['hero'], 1, 1,
 '[{"type": "hero", "content": {"headline": "About Us", "subheadline": "Our story and mission", "minHeight": "40vh"}}]'),

('a0000000-0000-0000-0000-000000000003', 'story', 'Our Story', 
 'Company history and background', 
 ARRAY['text', 'two-column', 'image'], 3, 2,
 '[{"type": "two-column", "content": {"imagePosition": "right"}}]'),

('a0000000-0000-0000-0000-000000000003', 'values', 'Our Values', 
 'Core values or principles', 
 ARRAY['feature-cards', 'text'], 2, 3, '[]'),

('a0000000-0000-0000-0000-000000000003', 'team', 'Meet the Team', 
 'Team member profiles', 
 ARRAY['feature-cards', 'gallery'], 1, 4, '[]'),

('a0000000-0000-0000-0000-000000000003', 'cta', 'Call to Action', 
 'Invite visitors to connect', 
 ARRAY['cta', 'contact-info'], 1, 5, '[]')

ON CONFLICT (template_id, zone_key) DO NOTHING;

-- Contact Page Template Zones
INSERT INTO template_zones (template_id, zone_key, zone_name, description, allowed_blocks, max_blocks, display_order, default_blocks) VALUES

('a0000000-0000-0000-0000-000000000004', 'hero', 'Page Header', 
 'Contact page header', 
 ARRAY['hero'], 1, 1,
 '[{"type": "hero", "content": {"headline": "Contact Us", "subheadline": "We would love to hear from you", "minHeight": "30vh"}}]'),

('a0000000-0000-0000-0000-000000000004', 'contact', 'Contact Section', 
 'Contact form and information', 
 ARRAY['form', 'contact-info', 'two-column'], 3, 2,
 '[{"type": "contact-info", "content": {"showPhone": true, "showEmail": true, "showAddress": true, "showMap": true}}]'),

('a0000000-0000-0000-0000-000000000004', 'faq', 'FAQ Section', 
 'Common questions (optional)', 
 ARRAY['faq'], 1, 3, '[]')

ON CONFLICT (template_id, zone_key) DO NOTHING;

-- Minimal Page Template Zones
INSERT INTO template_zones (template_id, zone_key, zone_name, description, allowed_blocks, max_blocks, display_order, default_blocks) VALUES

('a0000000-0000-0000-0000-000000000005', 'content', 'Page Content', 
 'Flexible content area - add any blocks', 
 ARRAY[]::TEXT[], NULL, 1, '[]')

ON CONFLICT (template_id, zone_key) DO NOTHING;

-- ============================================================================
-- HELPER VIEW: Page with blocks
-- ============================================================================
CREATE OR REPLACE VIEW site_page_details AS
SELECT 
    p.id,
    p.tenant_id,
    p.page_type,
    p.title,
    p.slug,
    p.is_published,
    p.is_homepage,
    p.template_id,
    t.name as template_name,
    t.slug as template_slug,
    p.seo_title,
    p.seo_description,
    p.created_at,
    p.updated_at,
    (
        SELECT COUNT(*) FROM page_blocks pb WHERE pb.page_id = p.id
    ) as block_count,
    (
        SELECT COUNT(*) FROM page_blocks pb WHERE pb.page_id = p.id AND pb.is_visible = true
    ) as visible_block_count
FROM site_pages p
LEFT JOIN site_templates t ON p.template_id = t.id;
