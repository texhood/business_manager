-- ============================================================================
-- FIX: Subscription Plans Column Name
-- Fixes the column naming inconsistency
-- Migration: 053_fix_subscription_plans.sql
-- ============================================================================

-- Rename column if it exists with wrong name
DO $$
BEGIN
    -- Check if price_annual exists and price_yearly doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscription_plans' AND column_name = 'price_annual'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscription_plans' AND column_name = 'price_yearly'
    ) THEN
        ALTER TABLE subscription_plans RENAME COLUMN price_annual TO price_yearly;
    END IF;
    
    -- Same for stripe price IDs
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscription_plans' AND column_name = 'stripe_price_id_annual'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscription_plans' AND column_name = 'stripe_price_yearly_id'
    ) THEN
        ALTER TABLE subscription_plans RENAME COLUMN stripe_price_id_annual TO stripe_price_yearly_id;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscription_plans' AND column_name = 'stripe_price_id_monthly'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscription_plans' AND column_name = 'stripe_price_monthly_id'
    ) THEN
        ALTER TABLE subscription_plans RENAME COLUMN stripe_price_id_monthly TO stripe_price_monthly_id;
    END IF;
END $$;

-- Add any missing columns
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS price_yearly INTEGER;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_price_yearly_id VARCHAR(255);
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_price_monthly_id VARCHAR(255);
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS limits JSONB DEFAULT '{}';
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Insert default plans (upsert)
INSERT INTO subscription_plans (slug, name, description, price_monthly, price_yearly, features, limits, sort_order, is_featured) VALUES
(
    'starter',
    'Starter',
    'Perfect for small farms and food trucks just getting started',
    2900,
    29000,
    '["POS Terminal", "Basic Inventory", "Up to 100 products", "Email support"]',
    '{"max_products": 100, "max_users": 2, "max_locations": 1}',
    1,
    false
),
(
    'professional',
    'Professional',
    'For growing operations with multiple sales channels',
    7900,
    79000,
    '["Everything in Starter", "Unlimited products", "Restaurant POS", "Kitchen Display", "Livestock management", "Bank sync", "Priority support"]',
    '{"max_products": -1, "max_users": 10, "max_locations": 3}',
    2,
    true
),
(
    'enterprise',
    'Enterprise',
    'Full platform access for established operations',
    14900,
    149000,
    '["Everything in Professional", "Unlimited users", "Unlimited locations", "Custom integrations", "Dedicated support", "Custom branding", "API access"]',
    '{"max_products": -1, "max_users": -1, "max_locations": -1}',
    3,
    false
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits,
    sort_order = EXCLUDED.sort_order,
    is_featured = EXCLUDED.is_featured,
    updated_at = CURRENT_TIMESTAMP;

-- Add tenant subscription columns if missing
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES subscription_plans(id);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_interval VARCHAR(20) DEFAULT 'monthly';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_email VARCHAR(255);

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug ON subscription_plans(slug);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_plan ON tenants(subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON tenants(subscription_status);

-- Update subscription_status constraint
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS chk_tenants_subscription_status;
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS chk_subscription_status;

DO $$
BEGIN
    ALTER TABLE tenants ADD CONSTRAINT chk_tenants_subscription_status 
    CHECK (subscription_status IS NULL OR subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

SELECT 'Migration complete. Plans:' as status;
SELECT slug, name, price_monthly, price_yearly FROM subscription_plans ORDER BY sort_order;
