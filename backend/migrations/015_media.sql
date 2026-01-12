-- ============================================================================
-- MEDIA LIBRARY TABLE
-- Centralized asset management
-- ============================================================================

CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    
    -- File info
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,             -- Bytes
    
    -- Storage location
    storage_provider VARCHAR(50) DEFAULT 'local',  -- 'local', 'r2', 's3'
    storage_key VARCHAR(500) NOT NULL,      -- Path/key in storage
    storage_url TEXT NOT NULL,              -- Public URL
    
    -- Image-specific
    width INTEGER,
    height INTEGER,
    
    -- Thumbnails (stored as JSON for flexibility)
    thumbnails JSONB DEFAULT '{}',          -- {"small": "url", "medium": "url", "large": "url"}
    
    -- Organization
    folder VARCHAR(255) DEFAULT 'uploads',
    alt_text TEXT,
    caption TEXT,
    title VARCHAR(255),
    tags TEXT[],
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES media(id),    -- For version history
    
    -- Metadata
    uploaded_by UUID REFERENCES accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Media folders for organization
CREATE TABLE IF NOT EXISTS media_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES media_folders(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, parent_id, slug)
);

-- Insert default folders
INSERT INTO media_folders (tenant_id, name, slug) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Products', 'products'),
    ('00000000-0000-0000-0000-000000000001', 'Blog', 'blog'),
    ('00000000-0000-0000-0000-000000000001', 'Gallery', 'gallery'),
    ('00000000-0000-0000-0000-000000000001', 'Menus', 'menus'),
    ('00000000-0000-0000-0000-000000000001', 'Events', 'events'),
    ('00000000-0000-0000-0000-000000000001', 'Pages', 'pages')
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_media_tenant ON media(tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_folder ON media(tenant_id, folder);
CREATE INDEX IF NOT EXISTS idx_media_tags ON media USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_mime ON media(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_folders_tenant ON media_folders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_folders_parent ON media_folders(parent_id);

-- Comments
COMMENT ON TABLE media IS 'Centralized media/asset library';
COMMENT ON TABLE media_folders IS 'Virtual folders for organizing media';
COMMENT ON COLUMN media.storage_key IS 'Path or key in the storage provider (R2/S3 object key)';
COMMENT ON COLUMN media.storage_url IS 'Public CDN URL for serving the file';
