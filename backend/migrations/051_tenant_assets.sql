-- ============================================================================
-- TENANT BRANDING ASSETS - Store logos and branding in database
-- For production environments without persistent filesystem
-- ============================================================================

-- Create table for storing binary assets
CREATE TABLE IF NOT EXISTS tenant_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Asset identification
    asset_type VARCHAR(50) NOT NULL,  -- 'logo', 'favicon', 'og_image', etc.
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- The actual file data
    data BYTEA NOT NULL,
    
    -- Metadata
    file_size INTEGER NOT NULL,
    width INTEGER,              -- For images
    height INTEGER,             -- For images
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Only one of each asset type per tenant
    UNIQUE(tenant_id, asset_type)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_tenant_assets_lookup 
ON tenant_assets(tenant_id, asset_type);

-- Comments
COMMENT ON TABLE tenant_assets IS 'Stores tenant branding assets (logos, favicons) in database for serverless deployments';
COMMENT ON COLUMN tenant_assets.data IS 'Binary file data stored as bytea';
COMMENT ON COLUMN tenant_assets.asset_type IS 'Type of asset: logo, favicon, og_image, email_header, etc.';
