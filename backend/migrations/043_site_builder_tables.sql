-- Migration: 043_site_builder_tables_fix.sql
-- Description: Create remaining Site Builder tables (page_blocks, global_blocks)
-- Date: 2026-01-31
-- Note: site_templates, template_zones, block_types, site_assets already exist

-- ============================================================================
-- PAGE BLOCKS (the missing table causing the 500 errors)
-- ============================================================================

CREATE TABLE IF NOT EXISTS page_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES site_pages(id) ON DELETE CASCADE,
    zone_key VARCHAR(50) NOT NULL DEFAULT 'content',
    block_type VARCHAR(50) NOT NULL,
    content JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    display_order INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    parent_block_id UUID REFERENCES page_blocks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_blocks_page ON page_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_page_blocks_zone ON page_blocks(page_id, zone_key);
CREATE INDEX IF NOT EXISTS idx_page_blocks_order ON page_blocks(page_id, zone_key, display_order);

-- ============================================================================
-- GLOBAL BLOCKS (Reusable across pages)
-- ============================================================================

CREATE TABLE IF NOT EXISTS global_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    block_type VARCHAR(50) NOT NULL,
    content JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_global_blocks_tenant ON global_blocks(tenant_id);

-- ============================================================================
-- GLOBAL BLOCK INSTANCES (Placement of global blocks on pages)
-- ============================================================================

CREATE TABLE IF NOT EXISTS global_block_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    global_block_id UUID NOT NULL REFERENCES global_blocks(id) ON DELETE CASCADE,
    page_id UUID NOT NULL REFERENCES site_pages(id) ON DELETE CASCADE,
    zone_key VARCHAR(50) NOT NULL DEFAULT 'content',
    display_order INT DEFAULT 0,
    setting_overrides JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(global_block_id, page_id, zone_key)
);

CREATE INDEX IF NOT EXISTS idx_global_block_instances_page ON global_block_instances(page_id);

-- ============================================================================
-- ADD template_id TO site_pages IF NOT EXISTS (as UUID to match site_templates)
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
-- MIGRATE DATA FROM page_sections TO page_blocks (if page_sections exists)
-- ============================================================================

DO $$
BEGIN
    -- Check if page_sections has data and page_blocks is empty
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'page_sections') THEN
        IF EXISTS (SELECT 1 FROM page_sections LIMIT 1) THEN
            IF NOT EXISTS (SELECT 1 FROM page_blocks LIMIT 1) THEN
                -- Migrate page_sections to page_blocks
                INSERT INTO page_blocks (page_id, zone_key, block_type, content, settings, display_order, is_visible)
                SELECT 
                    ps.page_id,
                    'content' as zone_key,
                    CASE 
                        WHEN ps.section_type = 'hero' THEN 'hero'
                        WHEN ps.section_type = 'about' THEN 'text'
                        WHEN ps.section_type = 'features' THEN 'feature-cards'
                        WHEN ps.section_type = 'products' THEN 'product-grid'
                        WHEN ps.section_type = 'testimonials' THEN 'testimonials-carousel'
                        WHEN ps.section_type = 'contact' THEN 'contact-info'
                        WHEN ps.section_type = 'gallery' THEN 'gallery'
                        WHEN ps.section_type = 'blog' THEN 'text'
                        WHEN ps.section_type = 'newsletter' THEN 'newsletter'
                        WHEN ps.section_type = 'faq' THEN 'faq'
                        WHEN ps.section_type = 'cta' THEN 'cta'
                        ELSE 'text'
                    END as block_type,
                    ps.settings as content,
                    '{}' as settings,
                    ps.sort_order as display_order,
                    ps.is_enabled as is_visible
                FROM page_sections ps;
                
                RAISE NOTICE 'Migrated % records from page_sections to page_blocks', 
                    (SELECT COUNT(*) FROM page_sections);
            END IF;
        END IF;
    END IF;
END $$;

SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'page_blocks'
);