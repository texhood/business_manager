-- ============================================================================
-- SUBSCRIPTION PLANS AND BILLING
-- Supports SaaS subscription billing for tenants
-- Migration: 052_subscription_billing.sql
-- ============================================================================

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    -- Pricing
    price_monthly INTEGER NOT NULL, -- Price in cents
    price_annual INTEGER, -- Annual price in cents (optional discount)
    
    -- Stripe IDs (created when plan is set up)
    stripe_product_id VARCHAR(255),
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_annual VARCHAR(255),
    
    -- Features (stored as JSONB for flexibility)
    features JSONB DEFAULT '{}',
    
    -- Limits
    max_users INTEGER DEFAULT 5,
    max_locations INTEGER DEFAULT 1,
    max_products INTEGER DEFAULT 100,
    max_monthly_orders INTEGER DEFAULT 500,
    
    -- Feature flags
    includes_pos BOOLEAN DEFAULT true,
    includes_restaurant_pos BOOLEAN DEFAULT false,
    includes_ecommerce BOOLEAN DEFAULT false,
    includes_herds_flocks BOOLEAN DEFAULT false,
    includes_accounting BOOLEAN DEFAULT true,
    includes_reports BOOLEAN DEFAULT true,
    includes_api_access BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default subscription plans
INSERT INTO subscription_plans (
    slug, name, description, 
    price_monthly, price_annual,
    max_users, max_locations, max_products, max_monthly_orders,
    includes_pos, includes_restaurant_pos, includes_ecommerce, 
    includes_herds_flocks, includes_accounting, includes_reports, includes_api_access,
    is_active, is_featured, sort_order, features
) VALUES 
(
    'starter',
    'Starter',
    'Perfect for small farms and market vendors',
    2900, -- $29/month
    29000, -- $290/year (2 months free)
    2, 1, 50, 200,
    true, false, false, false, true, true, false,
    true, false, 1,
    '{"highlights": ["Point of Sale", "Inventory Management", "Basic Reports", "Email Support"]}'
),
(
    'professional',
    'Professional',
    'For growing operations with multiple sales channels',
    7900, -- $79/month
    79000, -- $790/year
    5, 2, 500, 1000,
    true, true, true, false, true, true, false,
    true, true, 2,
    '{"highlights": ["Everything in Starter", "Restaurant POS", "E-Commerce Website", "Advanced Reports", "Priority Support"]}'
),
(
    'business',
    'Business',
    'Full-featured solution for established operations',
    14900, -- $149/month
    149000, -- $1490/year
    15, 5, 2000, 5000,
    true, true, true, true, true, true, true,
    true, false, 3,
    '{"highlights": ["Everything in Professional", "Herds & Flocks Management", "Unlimited Products", "API Access", "Dedicated Support"]}'
),
(
    'enterprise',
    'Enterprise',
    'Custom solutions for large-scale operations',
    0, -- Custom pricing
    0,
    -1, -1, -1, -1, -- Unlimited (-1)
    true, true, true, true, true, true, true,
    true, false, 4,
    '{"highlights": ["Everything in Business", "Custom Integrations", "White Labeling", "SLA Guarantee", "Dedicated Account Manager"], "contact_sales": true}'
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_annual = EXCLUDED.price_annual,
    features = EXCLUDED.features,
    updated_at = CURRENT_TIMESTAMP;

-- Add subscription fields to tenants if not exists
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES subscription_plans(id),
ADD COLUMN IF NOT EXISTS subscription_interval VARCHAR(20) DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Update subscription_status check constraint if needed
DO $$
BEGIN
    -- Drop old constraint if exists
    ALTER TABLE tenants DROP CONSTRAINT IF EXISTS chk_subscription_status;
    
    -- Add updated constraint
    ALTER TABLE tenants 
    ADD CONSTRAINT chk_subscription_status 
    CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'cancelled', 'unpaid', 'incomplete'));
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Update default subscription status
ALTER TABLE tenants ALTER COLUMN subscription_status SET DEFAULT 'trialing';

-- Subscription events log (for audit trail)
CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    stripe_event_id VARCHAR(255),
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    plan_id UUID REFERENCES subscription_plans(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscription_events_tenant ON subscription_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);

COMMENT ON TABLE subscription_plans IS 'SaaS subscription plan definitions';
COMMENT ON TABLE subscription_events IS 'Audit log of subscription changes';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON tenants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_plan ON tenants(subscription_plan_id);
