-- ============================================================================
-- APP REGISTRY & PORTAL SUPPORT
-- Migration: 054_app_registry_portal.sql
-- 
-- Adds:
--   1. app_registry table — defines all platform apps with tier requirements
--   2. tenant_app_access table — tracks per-tenant app overrides & usage
--   3. Updates subscription_plans.limits with app access definitions
-- ============================================================================

-- ============================================================================
-- APP REGISTRY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,           -- e.g., 'office', 'pos', 'restaurant'
    name VARCHAR(100) NOT NULL,                  -- e.g., 'Back Office'
    description TEXT,                             -- Short description for the portal card
    icon VARCHAR(50) DEFAULT 'layout-dashboard', -- Lucide icon name
    subdomain VARCHAR(50) NOT NULL,              -- e.g., 'office' → {tenant}.office.busmgr.com
    url_pattern VARCHAR(255) NOT NULL,           -- e.g., 'https://{tenant}.office.busmgr.com'
    min_plan_tier INTEGER NOT NULL DEFAULT 1,    -- 1=starter, 2=professional, 3=enterprise
    category VARCHAR(50) DEFAULT 'core',         -- core, sales, operations, analytics
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    requires_roles TEXT[] DEFAULT '{}',           -- empty = all roles can access
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TENANT APP ACCESS TABLE (overrides & tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_app_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES app_registry(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,             -- Override: admin can disable specific apps
    granted_override BOOLEAN DEFAULT false,      -- Override: grant access beyond tier
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, app_id)
);

-- ============================================================================
-- ADD PLAN TIER COLUMN TO SUBSCRIPTION PLANS
-- ============================================================================

ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS tier_level INTEGER;

-- Set tier levels on existing plans
UPDATE subscription_plans SET tier_level = 1 WHERE slug = 'starter' AND tier_level IS NULL;
UPDATE subscription_plans SET tier_level = 2 WHERE slug = 'professional' AND tier_level IS NULL;
UPDATE subscription_plans SET tier_level = 3 WHERE slug = 'enterprise' AND tier_level IS NULL;

-- ============================================================================
-- SEED APP REGISTRY
-- ============================================================================

INSERT INTO app_registry (slug, name, description, icon, subdomain, url_pattern, min_plan_tier, category, sort_order, requires_roles) VALUES
(
    'office',
    'Back Office',
    'Financial management, inventory, accounts, and business operations',
    'building-2',
    'office',
    'https://{tenant}.office.busmgr.com',
    1,
    'core',
    1,
    '{admin,tenant_admin,staff,super_admin}'
),
(
    'pos',
    'Point of Sale',
    'Terminal-based checkout for in-person sales and food trailers',
    'credit-card',
    'pos',
    'https://{tenant}.pos.busmgr.com',
    1,
    'sales',
    2,
    '{admin,tenant_admin,staff,super_admin}'
),
(
    'restaurant',
    'Restaurant POS',
    'Full-service restaurant ordering with table management and tabs',
    'utensils-crossed',
    'rpos',
    'https://{tenant}.rpos.busmgr.com',
    2,
    'sales',
    3,
    '{admin,tenant_admin,staff,super_admin}'
),
(
    'kitchen',
    'Kitchen Display',
    'Real-time kitchen order display and fulfillment tracking',
    'chef-hat',
    'kitchen',
    'https://{tenant}.kitchen.busmgr.com',
    2,
    'operations',
    4,
    '{admin,tenant_admin,staff,super_admin}'
),
(
    'herds',
    'Herds & Flocks',
    'Livestock tracking, health records, pasture management, and sales',
    'rabbit',
    'herds',
    'https://{tenant}.herds.busmgr.com',
    2,
    'operations',
    5,
    '{admin,tenant_admin,staff,super_admin}'
),
(
    'ecommerce',
    'Online Store',
    'Public-facing ecommerce website with ordering and delivery zones',
    'shopping-bag',
    'app',
    'https://{tenant}.app.busmgr.com',
    2,
    'sales',
    6,
    '{admin,tenant_admin,super_admin}'
),
(
    'site-builder',
    'Site Builder',
    'Design and publish your public website with templates and content tools',
    'palette',
    'office',
    'https://{tenant}.office.busmgr.com/site-builder',
    3,
    'core',
    7,
    '{admin,tenant_admin,super_admin}'
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    subdomain = EXCLUDED.subdomain,
    url_pattern = EXCLUDED.url_pattern,
    min_plan_tier = EXCLUDED.min_plan_tier,
    category = EXCLUDED.category,
    sort_order = EXCLUDED.sort_order,
    requires_roles = EXCLUDED.requires_roles,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_app_registry_slug ON app_registry(slug);
CREATE INDEX IF NOT EXISTS idx_app_registry_active ON app_registry(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_app_registry_tier ON app_registry(min_plan_tier);
CREATE INDEX IF NOT EXISTS idx_tenant_app_access_tenant ON tenant_app_access(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_app_access_app ON tenant_app_access(app_id);
CREATE INDEX IF NOT EXISTS idx_tenant_app_access_composite ON tenant_app_access(tenant_id, app_id);

-- ============================================================================
-- UPDATE SUBSCRIPTION PLANS — add allowed_apps to limits JSON
-- ============================================================================

UPDATE subscription_plans 
SET limits = limits || '{"allowed_apps": ["office", "pos"]}'::jsonb
WHERE slug = 'starter';

UPDATE subscription_plans 
SET limits = limits || '{"allowed_apps": ["office", "pos", "restaurant", "kitchen", "herds", "ecommerce"]}'::jsonb
WHERE slug = 'professional';

UPDATE subscription_plans 
SET limits = limits || '{"allowed_apps": ["office", "pos", "restaurant", "kitchen", "herds", "ecommerce", "site-builder"]}'::jsonb
WHERE slug = 'enterprise';

SELECT 'Migration 054 complete. App registry:' as status;
SELECT slug, name, min_plan_tier, category FROM app_registry ORDER BY sort_order;
