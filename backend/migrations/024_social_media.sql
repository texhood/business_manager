-- Social Media Management Tables
-- Migration: 024_social_media.sql

-- ============================================================================
-- SOCIAL PLATFORMS (configurable list of supported platforms)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
    
    -- Platform info
    name VARCHAR(50) NOT NULL,                    -- 'facebook', 'instagram', 'twitter', 'linkedin'
    display_name VARCHAR(100) NOT NULL,           -- 'Facebook', 'Instagram', 'X (Twitter)', 'LinkedIn'
    icon VARCHAR(50),                             -- Icon identifier
    
    -- Platform capabilities
    supports_images BOOLEAN DEFAULT true,
    supports_video BOOLEAN DEFAULT false,
    supports_links BOOLEAN DEFAULT true,
    supports_scheduling BOOLEAN DEFAULT true,
    max_characters INTEGER,                       -- NULL = no limit, e.g., Twitter = 280
    max_images INTEGER DEFAULT 4,
    
    -- Status
    is_enabled BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SOCIAL CONNECTIONS (OAuth connections to platforms per tenant)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
    platform_id UUID NOT NULL REFERENCES social_platforms(id) ON DELETE CASCADE,
    
    -- Account info
    account_name VARCHAR(255),                    -- Display name from platform
    account_id VARCHAR(255),                      -- Platform's user/page ID
    account_type VARCHAR(50),                     -- 'page', 'profile', 'business'
    profile_image_url TEXT,
    
    -- OAuth tokens (encrypted in production)
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',         -- 'pending', 'connected', 'expired', 'revoked'
    last_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    connected_by UUID,                            -- User who connected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, platform_id, account_id)
);

-- ============================================================================
-- SOCIAL POSTS (the actual posts to be published)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
    
    -- Content
    content TEXT NOT NULL,                        -- The post text
    
    -- Media attachments (JSON array of URLs)
    media_urls JSONB DEFAULT '[]',
    
    -- Link sharing
    link_url TEXT,
    link_title VARCHAR(255),
    link_description TEXT,
    link_image_url TEXT,
    
    -- Related blog post (if sharing a blog)
    blog_post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE,       -- NULL = draft, set = scheduled
    posted_at TIMESTAMP WITH TIME ZONE,           -- When actually posted
    
    -- Recurrence (for recurring posts)
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule VARCHAR(255),                 -- RRULE format: 'FREQ=WEEKLY;BYDAY=MO,WE,FR'
    recurrence_end_date DATE,
    parent_post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,  -- For recurring instances
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft',           -- 'draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled'
    
    -- Metadata
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SOCIAL POST PLATFORMS (which platforms to post to - many-to-many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_post_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    social_post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES social_connections(id) ON DELETE CASCADE,
    
    -- Platform-specific content override (optional)
    content_override TEXT,                        -- If different content per platform
    
    -- Publishing status per platform
    status VARCHAR(20) DEFAULT 'pending',         -- 'pending', 'published', 'failed'
    published_at TIMESTAMP WITH TIME ZONE,
    platform_post_id VARCHAR(255),                -- ID returned by platform after posting
    platform_post_url TEXT,                       -- URL to the post on the platform
    error_message TEXT,
    
    -- Analytics (updated periodically)
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    impressions_count INTEGER DEFAULT 0,
    last_analytics_update TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(social_post_id, connection_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_social_connections_tenant ON social_connections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_platform ON social_connections(platform_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_status ON social_connections(status);

CREATE INDEX IF NOT EXISTS idx_social_posts_tenant ON social_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_social_posts_blog ON social_posts(blog_post_id) WHERE blog_post_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_social_post_platforms_post ON social_post_platforms(social_post_id);
CREATE INDEX IF NOT EXISTS idx_social_post_platforms_connection ON social_post_platforms(connection_id);

-- ============================================================================
-- INSERT DEFAULT PLATFORMS
-- ============================================================================
INSERT INTO social_platforms (name, display_name, icon, max_characters, supports_video, max_images) VALUES
    ('facebook', 'Facebook', 'facebook', 63206, true, 10),
    ('instagram', 'Instagram', 'instagram', 2200, true, 10),
    ('twitter', 'X (Twitter)', 'twitter', 280, true, 4),
    ('linkedin', 'LinkedIn', 'linkedin', 3000, true, 9)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_social_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS social_platforms_updated_at ON social_platforms;
CREATE TRIGGER social_platforms_updated_at
    BEFORE UPDATE ON social_platforms
    FOR EACH ROW EXECUTE FUNCTION update_social_updated_at();

DROP TRIGGER IF EXISTS social_connections_updated_at ON social_connections;
CREATE TRIGGER social_connections_updated_at
    BEFORE UPDATE ON social_connections
    FOR EACH ROW EXECUTE FUNCTION update_social_updated_at();

DROP TRIGGER IF EXISTS social_posts_updated_at ON social_posts;
CREATE TRIGGER social_posts_updated_at
    BEFORE UPDATE ON social_posts
    FOR EACH ROW EXECUTE FUNCTION update_social_updated_at();

DROP TRIGGER IF EXISTS social_post_platforms_updated_at ON social_post_platforms;
CREATE TRIGGER social_post_platforms_updated_at
    BEFORE UPDATE ON social_post_platforms
    FOR EACH ROW EXECUTE FUNCTION update_social_updated_at();
