-- Site Designer Tables
-- Migration: 025_site_designer.sql

-- ============================================================================
-- SITE THEMES (global theme definitions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    preview_image VARCHAR(500),
    
    -- Default styling
    default_colors JSONB DEFAULT '{
        "primary": "#4a6741",
        "secondary": "#8b7355",
        "accent": "#d4a574",
        "background": "#fdfbf7",
        "text": "#333333",
        "textLight": "#666666",
        "border": "#e0e0e0"
    }',
    default_fonts JSONB DEFAULT '{
        "heading": "Playfair Display",
        "body": "Open Sans"
    }',
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- THEME SECTIONS (section definitions per theme and page type)
-- ============================================================================
CREATE TABLE IF NOT EXISTS theme_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID NOT NULL REFERENCES site_themes(id) ON DELETE CASCADE,
    page_type VARCHAR(50) NOT NULL,           -- 'home', 'about', 'contact', 'faq', 'custom'
    section_type VARCHAR(50) NOT NULL,        -- 'hero', 'features', 'testimonials', etc.
    section_name VARCHAR(100) NOT NULL,       -- Display name for UI
    description TEXT,                         -- Help text for users
    default_sort_order INTEGER DEFAULT 0,
    default_enabled BOOLEAN DEFAULT true,
    
    -- JSON Schema defining what can be configured
    settings_schema JSONB NOT NULL,
    
    -- Default values for new pages
    default_settings JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(theme_id, page_type, section_type)
);

-- ============================================================================
-- TENANT SITE SETTINGS (per-tenant configuration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenant_site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE DEFAULT '00000000-0000-0000-0000-000000000001',
    theme_id UUID REFERENCES site_themes(id),
    
    -- Branding
    site_name VARCHAR(255),
    tagline VARCHAR(255),
    logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    
    -- Style overrides
    color_overrides JSONB DEFAULT '{}',
    font_overrides JSONB DEFAULT '{}',
    
    -- Contact & social
    contact_info JSONB DEFAULT '{
        "phone": "",
        "email": "",
        "address": ""
    }',
    social_links JSONB DEFAULT '{
        "facebook": "",
        "instagram": "",
        "twitter": "",
        "linkedin": ""
    }',
    business_hours JSONB DEFAULT '[]',
    
    -- SEO defaults
    default_seo_title VARCHAR(255),
    default_seo_description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SITE PAGES (pages per tenant)
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    
    page_type VARCHAR(50) NOT NULL,           -- 'home', 'about', 'contact', 'faq', 'custom'
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    
    -- System pages can't be deleted
    is_system_page BOOLEAN DEFAULT false,
    
    -- Publishing
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- SEO
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_image VARCHAR(500),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, slug)
);

-- ============================================================================
-- PAGE SECTIONS (tenant's actual content for each section)
-- ============================================================================
CREATE TABLE IF NOT EXISTS page_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES site_pages(id) ON DELETE CASCADE,
    
    section_type VARCHAR(50) NOT NULL,        -- matches theme_sections.section_type
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    
    -- The actual content/settings
    settings JSONB NOT NULL DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(page_id, section_type)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_theme_sections_theme ON theme_sections(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_sections_page_type ON theme_sections(theme_id, page_type);
CREATE INDEX IF NOT EXISTS idx_site_pages_tenant ON site_pages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_site_pages_slug ON site_pages(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_page_sections_page ON page_sections(page_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_site_designer_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_themes_updated ON site_themes;
CREATE TRIGGER site_themes_updated
    BEFORE UPDATE ON site_themes
    FOR EACH ROW EXECUTE FUNCTION update_site_designer_timestamp();

DROP TRIGGER IF EXISTS tenant_site_settings_updated ON tenant_site_settings;
CREATE TRIGGER tenant_site_settings_updated
    BEFORE UPDATE ON tenant_site_settings
    FOR EACH ROW EXECUTE FUNCTION update_site_designer_timestamp();

DROP TRIGGER IF EXISTS site_pages_updated ON site_pages;
CREATE TRIGGER site_pages_updated
    BEFORE UPDATE ON site_pages
    FOR EACH ROW EXECUTE FUNCTION update_site_designer_timestamp();

DROP TRIGGER IF EXISTS page_sections_updated ON page_sections;
CREATE TRIGGER page_sections_updated
    BEFORE UPDATE ON page_sections
    FOR EACH ROW EXECUTE FUNCTION update_site_designer_timestamp();

-- ============================================================================
-- SEED DATA: THEMES
-- ============================================================================

-- Theme 1: Farm Fresh (eCommerce style)
INSERT INTO site_themes (id, name, slug, description, default_colors, default_fonts) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'Farm Fresh',
    'farm-fresh',
    'Warm, inviting design perfect for farms, markets, and artisan food businesses. Features earthy colors and elegant typography.',
    '{
        "primary": "#4a6741",
        "secondary": "#8b7355",
        "accent": "#d4a574",
        "background": "#fdfbf7",
        "backgroundAlt": "#f5f1eb",
        "text": "#333333",
        "textLight": "#666666",
        "border": "#e0d5c7",
        "success": "#4a6741",
        "error": "#c44536",
        "warning": "#d4a574"
    }',
    '{
        "heading": "Playfair Display",
        "body": "Open Sans",
        "accent": "Georgia"
    }'
)
ON CONFLICT (slug) DO NOTHING;

-- Theme 2: Modern Professional (Back Office style)
INSERT INTO site_themes (id, name, slug, description, default_colors, default_fonts) VALUES
(
    'a0000000-0000-0000-0000-000000000002',
    'Modern Professional',
    'modern-professional',
    'Clean, modern design ideal for professional services, B2B, and corporate sites. Features crisp lines and a business-focused aesthetic.',
    '{
        "primary": "#2c3e50",
        "secondary": "#3498db",
        "accent": "#27ae60",
        "background": "#ffffff",
        "backgroundAlt": "#f8f9fa",
        "text": "#2c3e50",
        "textLight": "#7f8c8d",
        "border": "#e0e0e0",
        "success": "#27ae60",
        "error": "#e74c3c",
        "warning": "#f39c12"
    }',
    '{
        "heading": "Inter",
        "body": "Inter",
        "accent": "Roboto Mono"
    }'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA: THEME SECTIONS FOR "FARM FRESH"
-- ============================================================================

-- HOME PAGE SECTIONS
INSERT INTO theme_sections (theme_id, page_type, section_type, section_name, description, default_sort_order, default_enabled, settings_schema, default_settings) VALUES

-- Hero Section
('a0000000-0000-0000-0000-000000000001', 'home', 'hero', 'Hero Banner', 'Large banner with headline, subtext, and call-to-action button', 1, true,
'{
    "type": "object",
    "properties": {
        "headline": {"type": "string", "title": "Headline", "maxLength": 100},
        "subheadline": {"type": "string", "title": "Subheadline", "maxLength": 200},
        "backgroundImage": {"type": "string", "format": "image", "title": "Background Image"},
        "buttonText": {"type": "string", "title": "Button Text", "maxLength": 30},
        "buttonLink": {"type": "string", "title": "Button Link"},
        "overlayOpacity": {"type": "number", "title": "Overlay Darkness", "minimum": 0, "maximum": 1},
        "alignment": {"type": "string", "enum": ["left", "center", "right"], "title": "Text Alignment"}
    }
}',
'{
    "headline": "Welcome to Our Farm",
    "subheadline": "Fresh, local produce delivered to your door",
    "buttonText": "Shop Now",
    "buttonLink": "/shop",
    "overlayOpacity": 0.4,
    "alignment": "center"
}'),

-- Features Section
('a0000000-0000-0000-0000-000000000001', 'home', 'features', 'Features', 'Highlight key selling points with icons', 2, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Section Title"},
        "subtitle": {"type": "string", "title": "Section Subtitle"},
        "features": {
            "type": "array",
            "title": "Features",
            "items": {
                "type": "object",
                "properties": {
                    "icon": {"type": "string", "title": "Icon"},
                    "title": {"type": "string", "title": "Title"},
                    "description": {"type": "string", "title": "Description"}
                }
            }
        }
    }
}',
'{
    "title": "Why Choose Us",
    "subtitle": "",
    "features": [
        {"icon": "leaf", "title": "Fresh & Local", "description": "Harvested daily from our family farm"},
        {"icon": "truck", "title": "Free Delivery", "description": "On orders over $50 in our delivery zone"},
        {"icon": "heart", "title": "Family Owned", "description": "Three generations of farming expertise"}
    ]
}'),

-- Products Preview Section
('a0000000-0000-0000-0000-000000000001', 'home', 'products_preview', 'Featured Products', 'Showcase selected products from your store', 3, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Section Title"},
        "subtitle": {"type": "string", "title": "Section Subtitle"},
        "displayCount": {"type": "integer", "title": "Number of Products", "minimum": 3, "maximum": 12},
        "showButton": {"type": "boolean", "title": "Show View All Button"},
        "buttonText": {"type": "string", "title": "Button Text"},
        "buttonLink": {"type": "string", "title": "Button Link"}
    }
}',
'{
    "title": "Fresh This Week",
    "subtitle": "Hand-picked selections from our farm",
    "displayCount": 6,
    "showButton": true,
    "buttonText": "View All Products",
    "buttonLink": "/shop"
}'),

-- About Preview Section
('a0000000-0000-0000-0000-000000000001', 'home', 'about_preview', 'About Preview', 'Brief introduction with image', 4, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Title"},
        "content": {"type": "string", "format": "textarea", "title": "Content"},
        "image": {"type": "string", "format": "image", "title": "Image"},
        "imagePosition": {"type": "string", "enum": ["left", "right"], "title": "Image Position"},
        "buttonText": {"type": "string", "title": "Button Text"},
        "buttonLink": {"type": "string", "title": "Button Link"}
    }
}',
'{
    "title": "Our Story",
    "content": "For three generations, our family has been dedicated to growing the freshest produce using sustainable farming practices.",
    "imagePosition": "right",
    "buttonText": "Learn More",
    "buttonLink": "/about"
}'),

-- Testimonials Section
('a0000000-0000-0000-0000-000000000001', 'home', 'testimonials', 'Testimonials', 'Customer reviews and quotes', 5, false,
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
                    "quote": {"type": "string", "title": "Quote"},
                    "author": {"type": "string", "title": "Author Name"},
                    "location": {"type": "string", "title": "Location"}
                }
            }
        }
    }
}',
'{
    "title": "What Our Customers Say",
    "testimonials": []
}'),

-- CTA Section
('a0000000-0000-0000-0000-000000000001', 'home', 'cta', 'Call to Action', 'Banner prompting visitors to take action', 6, true,
'{
    "type": "object",
    "properties": {
        "headline": {"type": "string", "title": "Headline"},
        "subheadline": {"type": "string", "title": "Subheadline"},
        "buttonText": {"type": "string", "title": "Button Text"},
        "buttonLink": {"type": "string", "title": "Button Link"},
        "backgroundColor": {"type": "string", "format": "color", "title": "Background Color"}
    }
}',
'{
    "headline": "Ready to taste the difference?",
    "subheadline": "Order now and get free delivery on your first order",
    "buttonText": "Start Shopping",
    "buttonLink": "/shop"
}'),

-- Newsletter Section
('a0000000-0000-0000-0000-000000000001', 'home', 'newsletter', 'Newsletter Signup', 'Email signup form', 7, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Title"},
        "description": {"type": "string", "title": "Description"},
        "buttonText": {"type": "string", "title": "Button Text"},
        "placeholderText": {"type": "string", "title": "Placeholder Text"}
    }
}',
'{
    "title": "Stay Updated",
    "description": "Subscribe to our newsletter for seasonal updates and exclusive offers",
    "buttonText": "Subscribe",
    "placeholderText": "Enter your email"
}')

ON CONFLICT (theme_id, page_type, section_type) DO NOTHING;

-- ABOUT PAGE SECTIONS
INSERT INTO theme_sections (theme_id, page_type, section_type, section_name, description, default_sort_order, default_enabled, settings_schema, default_settings) VALUES

('a0000000-0000-0000-0000-000000000001', 'about', 'hero', 'Page Header', 'Header with title and optional background', 1, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Page Title"},
        "subtitle": {"type": "string", "title": "Subtitle"},
        "backgroundImage": {"type": "string", "format": "image", "title": "Background Image"}
    }
}',
'{"title": "About Us", "subtitle": "Our story, our passion, our farm"}'),

('a0000000-0000-0000-0000-000000000001', 'about', 'story', 'Our Story', 'Main content block with image', 2, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Title"},
        "content": {"type": "string", "format": "richtext", "title": "Content"},
        "image": {"type": "string", "format": "image", "title": "Image"},
        "imagePosition": {"type": "string", "enum": ["left", "right"], "title": "Image Position"}
    }
}',
'{"title": "Our Story", "content": "", "imagePosition": "right"}'),

('a0000000-0000-0000-0000-000000000001', 'about', 'values', 'Our Values', 'List of company values or principles', 3, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Section Title"},
        "values": {
            "type": "array",
            "title": "Values",
            "items": {
                "type": "object",
                "properties": {
                    "icon": {"type": "string", "title": "Icon"},
                    "title": {"type": "string", "title": "Title"},
                    "description": {"type": "string", "title": "Description"}
                }
            }
        }
    }
}',
'{
    "title": "Our Values",
    "values": [
        {"icon": "leaf", "title": "Sustainability", "description": "We care for the land that feeds us all"},
        {"icon": "users", "title": "Community", "description": "Supporting our local community is at our core"},
        {"icon": "award", "title": "Quality", "description": "We never compromise on freshness or taste"}
    ]
}'),

('a0000000-0000-0000-0000-000000000001', 'about', 'team', 'Meet the Team', 'Team member profiles', 4, false,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Section Title"},
        "members": {
            "type": "array",
            "title": "Team Members",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "title": "Name"},
                    "role": {"type": "string", "title": "Role"},
                    "image": {"type": "string", "format": "image", "title": "Photo"},
                    "bio": {"type": "string", "title": "Bio"}
                }
            }
        }
    }
}',
'{"title": "Meet the Team", "members": []}')

ON CONFLICT (theme_id, page_type, section_type) DO NOTHING;

-- CONTACT PAGE SECTIONS
INSERT INTO theme_sections (theme_id, page_type, section_type, section_name, description, default_sort_order, default_enabled, settings_schema, default_settings) VALUES

('a0000000-0000-0000-0000-000000000001', 'contact', 'hero', 'Page Header', 'Header with title', 1, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Page Title"},
        "subtitle": {"type": "string", "title": "Subtitle"}
    }
}',
'{"title": "Contact Us", "subtitle": "We would love to hear from you"}'),

('a0000000-0000-0000-0000-000000000001', 'contact', 'contact_info', 'Contact Information', 'Phone, email, address display', 2, true,
'{
    "type": "object",
    "properties": {
        "showPhone": {"type": "boolean", "title": "Show Phone"},
        "showEmail": {"type": "boolean", "title": "Show Email"},
        "showAddress": {"type": "boolean", "title": "Show Address"},
        "showHours": {"type": "boolean", "title": "Show Business Hours"}
    }
}',
'{"showPhone": true, "showEmail": true, "showAddress": true, "showHours": true}'),

('a0000000-0000-0000-0000-000000000001', 'contact', 'contact_form', 'Contact Form', 'Email contact form', 3, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Form Title"},
        "description": {"type": "string", "title": "Description"},
        "recipientEmail": {"type": "string", "format": "email", "title": "Recipient Email"},
        "showPhone": {"type": "boolean", "title": "Include Phone Field"},
        "showSubject": {"type": "boolean", "title": "Include Subject Field"}
    }
}',
'{"title": "Send us a Message", "description": "", "showPhone": true, "showSubject": true}'),

('a0000000-0000-0000-0000-000000000001', 'contact', 'map', 'Map', 'Embedded map showing location', 4, true,
'{
    "type": "object",
    "properties": {
        "showMap": {"type": "boolean", "title": "Show Map"},
        "mapHeight": {"type": "integer", "title": "Map Height (px)", "minimum": 200, "maximum": 600}
    }
}',
'{"showMap": true, "mapHeight": 400}')

ON CONFLICT (theme_id, page_type, section_type) DO NOTHING;

-- FAQ PAGE SECTIONS
INSERT INTO theme_sections (theme_id, page_type, section_type, section_name, description, default_sort_order, default_enabled, settings_schema, default_settings) VALUES

('a0000000-0000-0000-0000-000000000001', 'faq', 'hero', 'Page Header', 'Header with title', 1, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Page Title"},
        "subtitle": {"type": "string", "title": "Subtitle"}
    }
}',
'{"title": "Frequently Asked Questions", "subtitle": "Find answers to common questions"}'),

('a0000000-0000-0000-0000-000000000001', 'faq', 'faq_list', 'FAQ Items', 'Accordion-style questions and answers', 2, true,
'{
    "type": "object",
    "properties": {
        "items": {
            "type": "array",
            "title": "Questions",
            "items": {
                "type": "object",
                "properties": {
                    "question": {"type": "string", "title": "Question"},
                    "answer": {"type": "string", "format": "textarea", "title": "Answer"}
                }
            }
        }
    }
}',
'{"items": []}'),

('a0000000-0000-0000-0000-000000000001', 'faq', 'contact_cta', 'Contact CTA', 'Prompt to contact for more questions', 3, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Title"},
        "description": {"type": "string", "title": "Description"},
        "buttonText": {"type": "string", "title": "Button Text"},
        "buttonLink": {"type": "string", "title": "Button Link"}
    }
}',
'{"title": "Still have questions?", "description": "We are here to help", "buttonText": "Contact Us", "buttonLink": "/contact"}')

ON CONFLICT (theme_id, page_type, section_type) DO NOTHING;

-- ============================================================================
-- SEED DATA: THEME SECTIONS FOR "MODERN PROFESSIONAL"
-- ============================================================================

-- HOME PAGE SECTIONS
INSERT INTO theme_sections (theme_id, page_type, section_type, section_name, description, default_sort_order, default_enabled, settings_schema, default_settings) VALUES

('a0000000-0000-0000-0000-000000000002', 'home', 'hero', 'Hero Banner', 'Large banner with headline and call-to-action', 1, true,
'{
    "type": "object",
    "properties": {
        "headline": {"type": "string", "title": "Headline", "maxLength": 100},
        "subheadline": {"type": "string", "title": "Subheadline", "maxLength": 200},
        "backgroundImage": {"type": "string", "format": "image", "title": "Background Image"},
        "buttonText": {"type": "string", "title": "Primary Button Text"},
        "buttonLink": {"type": "string", "title": "Primary Button Link"},
        "secondaryButtonText": {"type": "string", "title": "Secondary Button Text"},
        "secondaryButtonLink": {"type": "string", "title": "Secondary Button Link"},
        "style": {"type": "string", "enum": ["centered", "left-aligned", "split"], "title": "Layout Style"}
    }
}',
'{
    "headline": "Professional Solutions for Modern Business",
    "subheadline": "Streamline your operations with our comprehensive platform",
    "buttonText": "Get Started",
    "buttonLink": "/contact",
    "secondaryButtonText": "Learn More",
    "secondaryButtonLink": "/about",
    "style": "centered"
}'),

('a0000000-0000-0000-0000-000000000002', 'home', 'features', 'Features', 'Key features or services grid', 2, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Section Title"},
        "subtitle": {"type": "string", "title": "Section Subtitle"},
        "columns": {"type": "integer", "enum": [2, 3, 4], "title": "Columns"},
        "features": {
            "type": "array",
            "title": "Features",
            "items": {
                "type": "object",
                "properties": {
                    "icon": {"type": "string", "title": "Icon"},
                    "title": {"type": "string", "title": "Title"},
                    "description": {"type": "string", "title": "Description"}
                }
            }
        }
    }
}',
'{
    "title": "Our Services",
    "subtitle": "Everything you need to succeed",
    "columns": 3,
    "features": [
        {"icon": "zap", "title": "Fast & Efficient", "description": "Optimized for performance"},
        {"icon": "shield", "title": "Secure", "description": "Enterprise-grade security"},
        {"icon": "headphones", "title": "24/7 Support", "description": "Always here to help"}
    ]
}'),

('a0000000-0000-0000-0000-000000000002', 'home', 'stats', 'Statistics', 'Key numbers and metrics', 3, true,
'{
    "type": "object",
    "properties": {
        "stats": {
            "type": "array",
            "title": "Statistics",
            "items": {
                "type": "object",
                "properties": {
                    "value": {"type": "string", "title": "Value"},
                    "label": {"type": "string", "title": "Label"}
                }
            }
        }
    }
}',
'{
    "stats": [
        {"value": "500+", "label": "Clients"},
        {"value": "99.9%", "label": "Uptime"},
        {"value": "24/7", "label": "Support"}
    ]
}'),

('a0000000-0000-0000-0000-000000000002', 'home', 'cta', 'Call to Action', 'Conversion-focused banner', 4, true,
'{
    "type": "object",
    "properties": {
        "headline": {"type": "string", "title": "Headline"},
        "subheadline": {"type": "string", "title": "Subheadline"},
        "buttonText": {"type": "string", "title": "Button Text"},
        "buttonLink": {"type": "string", "title": "Button Link"}
    }
}',
'{
    "headline": "Ready to get started?",
    "subheadline": "Contact us today for a free consultation",
    "buttonText": "Contact Us",
    "buttonLink": "/contact"
}')

ON CONFLICT (theme_id, page_type, section_type) DO NOTHING;

-- ABOUT PAGE for Modern Professional
INSERT INTO theme_sections (theme_id, page_type, section_type, section_name, description, default_sort_order, default_enabled, settings_schema, default_settings) VALUES

('a0000000-0000-0000-0000-000000000002', 'about', 'hero', 'Page Header', 'Clean header with title', 1, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Page Title"},
        "subtitle": {"type": "string", "title": "Subtitle"},
        "backgroundStyle": {"type": "string", "enum": ["solid", "gradient", "image"], "title": "Background Style"}
    }
}',
'{"title": "About Us", "subtitle": "Learn more about our company", "backgroundStyle": "gradient"}'),

('a0000000-0000-0000-0000-000000000002', 'about', 'story', 'Company Story', 'Main about content', 2, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Title"},
        "content": {"type": "string", "format": "richtext", "title": "Content"},
        "image": {"type": "string", "format": "image", "title": "Image"}
    }
}',
'{"title": "Our Story", "content": ""}'),

('a0000000-0000-0000-0000-000000000002', 'about', 'mission', 'Mission & Vision', 'Mission and vision statements', 3, true,
'{
    "type": "object",
    "properties": {
        "missionTitle": {"type": "string", "title": "Mission Title"},
        "missionContent": {"type": "string", "title": "Mission Statement"},
        "visionTitle": {"type": "string", "title": "Vision Title"},
        "visionContent": {"type": "string", "title": "Vision Statement"}
    }
}',
'{"missionTitle": "Our Mission", "missionContent": "", "visionTitle": "Our Vision", "visionContent": ""}'),

('a0000000-0000-0000-0000-000000000002', 'about', 'team', 'Team', 'Team member grid', 4, false,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Section Title"},
        "members": {
            "type": "array",
            "title": "Team Members",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "title": "Name"},
                    "role": {"type": "string", "title": "Role"},
                    "image": {"type": "string", "format": "image", "title": "Photo"},
                    "linkedin": {"type": "string", "title": "LinkedIn URL"}
                }
            }
        }
    }
}',
'{"title": "Our Team", "members": []}')

ON CONFLICT (theme_id, page_type, section_type) DO NOTHING;

-- CONTACT PAGE for Modern Professional
INSERT INTO theme_sections (theme_id, page_type, section_type, section_name, description, default_sort_order, default_enabled, settings_schema, default_settings) VALUES

('a0000000-0000-0000-0000-000000000002', 'contact', 'hero', 'Page Header', 'Header with title', 1, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Page Title"},
        "subtitle": {"type": "string", "title": "Subtitle"}
    }
}',
'{"title": "Contact Us", "subtitle": "Get in touch with our team"}'),

('a0000000-0000-0000-0000-000000000002', 'contact', 'contact_info', 'Contact Information', 'Contact details cards', 2, true,
'{
    "type": "object",
    "properties": {
        "showPhone": {"type": "boolean", "title": "Show Phone"},
        "showEmail": {"type": "boolean", "title": "Show Email"},
        "showAddress": {"type": "boolean", "title": "Show Address"},
        "layout": {"type": "string", "enum": ["cards", "list"], "title": "Layout Style"}
    }
}',
'{"showPhone": true, "showEmail": true, "showAddress": true, "layout": "cards"}'),

('a0000000-0000-0000-0000-000000000002', 'contact', 'contact_form', 'Contact Form', 'Professional contact form', 3, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Form Title"},
        "fields": {
            "type": "array",
            "title": "Form Fields",
            "items": {
                "type": "string",
                "enum": ["name", "email", "phone", "company", "subject", "message"]
            }
        }
    }
}',
'{"title": "Send a Message", "fields": ["name", "email", "company", "subject", "message"]}')

ON CONFLICT (theme_id, page_type, section_type) DO NOTHING;

-- FAQ PAGE for Modern Professional
INSERT INTO theme_sections (theme_id, page_type, section_type, section_name, description, default_sort_order, default_enabled, settings_schema, default_settings) VALUES

('a0000000-0000-0000-0000-000000000002', 'faq', 'hero', 'Page Header', 'Header with search', 1, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Page Title"},
        "subtitle": {"type": "string", "title": "Subtitle"},
        "showSearch": {"type": "boolean", "title": "Show Search Bar"}
    }
}',
'{"title": "FAQ", "subtitle": "Find answers to common questions", "showSearch": true}'),

('a0000000-0000-0000-0000-000000000002', 'faq', 'faq_categories', 'FAQ by Category', 'Organized FAQ with categories', 2, true,
'{
    "type": "object",
    "properties": {
        "categories": {
            "type": "array",
            "title": "Categories",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "title": "Category Name"},
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "question": {"type": "string", "title": "Question"},
                                "answer": {"type": "string", "title": "Answer"}
                            }
                        }
                    }
                }
            }
        }
    }
}',
'{"categories": []}'),

('a0000000-0000-0000-0000-000000000002', 'faq', 'contact_cta', 'Contact CTA', 'Prompt for more help', 3, true,
'{
    "type": "object",
    "properties": {
        "title": {"type": "string", "title": "Title"},
        "description": {"type": "string", "title": "Description"},
        "buttonText": {"type": "string", "title": "Button Text"},
        "buttonLink": {"type": "string", "title": "Button Link"}
    }
}',
'{"title": "Need more help?", "description": "Our support team is ready to assist", "buttonText": "Contact Support", "buttonLink": "/contact"}')

ON CONFLICT (theme_id, page_type, section_type) DO NOTHING;
