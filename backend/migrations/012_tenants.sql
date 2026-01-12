-- ============================================================================
-- TENANTS TABLE (Multi-Tenant Foundation)
-- Non-breaking: Creates new table, adds optional tenant_id to existing tables
-- ============================================================================

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    
    -- Subscription (future)
    plan VARCHAR(50) DEFAULT 'starter',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    subscription_status VARCHAR(50) DEFAULT 'active',
    
    -- Branding
    logo_url TEXT,
    primary_color VARCHAR(20) DEFAULT '#2d5016',
    domain VARCHAR(255),
    
    -- Contact
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    
    -- Settings
    settings JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}',
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default tenant (Hood Family Farms)
INSERT INTO tenants (id, slug, name, email, phone, address, city, state, zip_code, domain)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'hood-family-farms',
    'Hood Family Farms',
    'info@hoodfamilyfarms.com',
    '903-360-7840',
    '3950 County Road 3802',
    'Bullard',
    'TX',
    '75757',
    'hoodfamilyfarms.com'
) ON CONFLICT (slug) DO NOTHING;

-- Add tenant_id to existing tables (nullable for backward compatibility)
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE tags ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
CREATE INDEX IF NOT EXISTS idx_accounts_tenant ON accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_items_tenant ON items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tenant ON blog_posts(tenant_id);

COMMENT ON TABLE tenants IS 'Multi-tenant support - each tenant is a separate business/farm';
