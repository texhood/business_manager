-- ============================================================================
-- SUBSCRIPTION PLANS AND BILLING
-- Adds subscription plan management for SaaS billing
-- Migration: 052_subscription_plans.sql
-- ============================================================================

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    
    -- Pricing
    price_monthly INTEGER NOT NULL, -- in cents
    price_yearly INTEGER, -- in cents (optional annual pricing)
    
    -- Stripe Product/Price IDs
    stripe_product_id VARCHAR(255),
    stripe_price_monthly_id VARCHAR(255),
    stripe_price_yearly_id VARCHAR(255),
    
    -- Features & Limits
    features JSONB DEFAULT '[]',
    limits JSONB DEFAULT '{}',
    
    -- Display
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default subscription plans
INSERT INTO subscription_plans (slug, name, description, price_monthly, price_yearly, features, limits, sort_order, is_featured) VALUES
(
    'starter',
    'Starter',
    'Perfect for small farms and food trucks just getting started',
    2900, -- $29/month
    29000, -- $290/year (2 months free)
    '["POS Terminal", "Basic Inventory", "Up to 100 products", "Email support"]',
    '{"max_products": 100, "max_users": 2, "max_locations": 1}',
    1,
    false
),
(
    'professional',
    'Professional',
    'For growing operations with multiple sales channels',
    7900, -- $79/month
    79000, -- $790/year
    '["Everything in Starter", "Unlimited products", "Restaurant POS", "Kitchen Display", "Livestock management", "Bank sync", "Priority support"]',
    '{"max_products": -1, "max_users": 10, "max_locations": 3}',
    2,
    true
),
(
    'enterprise',
    'Enterprise',
    'Full platform access for established operations',
    14900, -- $149/month
    149000, -- $1490/year
    '["Everything in Professional", "Unlimited users", "Unlimited locations", "Custom integrations", "Dedicated support", "Custom branding", "API access"]',
    '{"max_products": -1, "max_users": -1, "max_locations": -1}',
    3,
    false
)
ON CONFLICT (slug) DO NOTHING;

-- Add subscription fields to tenants if not exists
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES subscription_plans(id);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_interval VARCHAR(20) DEFAULT 'monthly';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_email VARCHAR(255);

-- Index for plan lookups
CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug ON subscription_plans(slug);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_plan ON tenants(subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON tenants(subscription_status);

-- Comments
COMMENT ON TABLE subscription_plans IS 'Available subscription plans for the SaaS platform';
COMMENT ON COLUMN subscription_plans.price_monthly IS 'Monthly price in cents';
COMMENT ON COLUMN subscription_plans.price_yearly IS 'Annual price in cents (typically discounted)';
COMMENT ON COLUMN subscription_plans.features IS 'JSON array of feature descriptions for display';
COMMENT ON COLUMN subscription_plans.limits IS 'JSON object of limits (max_products, max_users, etc.)';
COMMENT ON COLUMN tenants.billing_interval IS 'monthly or yearly';
COMMENT ON COLUMN tenants.trial_ends_at IS 'If on trial, when the trial expires';

-- Update subscription_status constraint to include more states
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS chk_tenants_subscription_status;
ALTER TABLE tenants ADD CONSTRAINT chk_tenants_subscription_status 
CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused'));

-- Set default subscription status
UPDATE tenants SET subscription_status = 'active' WHERE subscription_status IS NULL;
