-- Social Media Management Schema
-- Migration: 012_social_media.sql

-- ============================================================================
-- SOCIAL PLATFORMS (configurable list of supported platforms)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_platforms (
    id SERIAL PRIMARY KEY,
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
    
    -- Platform identification
    platform_key VARCHAR(50) NOT NULL, -- 'facebook', 'instagram', 'twitter', 'linkedin'
    display_name VARCHAR(100) NOT NULL,
    icon_name VARCHAR(50), -- for UI rendering
    
    -- Platform status
    is_enabled BOOLEAN DEFAULT true,
    is_connected BOOLEAN DEFAULT false,
    
    -- OAuth credentials (encrypted in production)
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    
    -- Platform-specific settings
    account_id VARCHAR(255), -- platform's user/page ID
    account_name VARCHAR(255), -- display name on platform
    account_url VARCHAR(500),
    
    -- Metadata
    connected_at TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, platform_key)
);

-- ============================================================================
-- SOCIAL POSTS (the actual posts to be published)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_posts (
    id SERIAL PRIMARY KEY,
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
    
    -- Content
    content TEXT NOT NULL,
    
    -- Media attachments (JSON array of media URLs)
    media_urls JSONB DEFAULT '[]',
    
    -- Link sharing (for blog posts or external links)
    link_url VARCHAR(1000),
    link_title VARCHAR(255),
    link_description TEXT,
    link_image VARCHAR(1000),
    
    -- Source reference (if created from a blog post)
    source_type VARCHAR(50), -- 'standalone', 'blog'
    source_id INTEGER, -- blog_posts.id if source_type = 'blog'
    
    -- Scheduling
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'failed', 'cancelled'
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    
    -- Recurrence (for future implementation)
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule VARCHAR(255), -- iCal RRULE format
    recurrence_end_date DATE,
    parent_post_id INTEGER REFERENCES social_posts(id),
    
    -- Author tracking
    created_by INTEGER REFERENCES accounts(id),
    author_name VARCHAR(255),
    
    -- Error tracking
    last_error TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SOCIAL POST PLATFORMS (which platforms a post should be published to)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_post_platforms (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    platform_id INTEGER NOT NULL REFERENCES social_platforms(id) ON DELETE CASCADE,
    
    -- Platform-specific content override (optional)
    content_override TEXT,
    
    -- Publishing status for this specific platform
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'published', 'failed'
    published_at TIMESTAMPTZ,
    
    -- Platform response data
    platform_post_id VARCHAR(255), -- ID of the post on the platform
    platform_post_url VARCHAR(1000), -- URL to the post on the platform
    
    -- Error tracking
    last_error TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(post_id, platform_id)
);

-- ============================================================================
-- SOCIAL POST ANALYTICS (for tracking engagement)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_post_analytics (
    id SERIAL PRIMARY KEY,
    post_platform_id INTEGER NOT NULL REFERENCES social_post_platforms(id) ON DELETE CASCADE,
    
    -- Engagement metrics
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    
    -- Timestamps
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Store raw API response for additional metrics
    raw_data JSONB
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_social_posts_tenant ON social_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_social_posts_source ON social_posts(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_social_post_platforms_post ON social_post_platforms(post_id);
CREATE INDEX IF NOT EXISTS idx_social_post_platforms_platform ON social_post_platforms(platform_id);

-- ============================================================================
-- INSERT DEFAULT PLATFORMS
-- ============================================================================
INSERT INTO social_platforms (platform_key, display_name, icon_name, is_enabled, is_connected)
VALUES 
    ('facebook', 'Facebook', 'facebook', true, false),
    ('instagram', 'Instagram', 'instagram', true, false),
    ('twitter', 'X (Twitter)', 'twitter', true, false),
    ('linkedin', 'LinkedIn', 'linkedin', true, false)
ON CONFLICT (tenant_id, platform_key) DO NOTHING;

-- ============================================================================
-- TRIGGER FOR updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_social_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS social_posts_updated_at ON social_posts;
CREATE TRIGGER social_posts_updated_at
    BEFORE UPDATE ON social_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_social_updated_at();

DROP TRIGGER IF EXISTS social_platforms_updated_at ON social_platforms;
CREATE TRIGGER social_platforms_updated_at
    BEFORE UPDATE ON social_platforms
    FOR EACH ROW
    EXECUTE FUNCTION update_social_updated_at();

DROP TRIGGER IF EXISTS social_post_platforms_updated_at ON social_post_platforms;
CREATE TRIGGER social_post_platforms_updated_at
    BEFORE UPDATE ON social_post_platforms
    FOR EACH ROW
    EXECUTE FUNCTION update_social_updated_at();
