-- ============================================================================
-- STRIPE CONNECT MIGRATION
-- Adds support for Stripe Connect - each tenant gets their own connected account
-- Migration: 050_stripe_connect.sql
-- ============================================================================

-- Add Connect-specific fields to tenants
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_account_status VARCHAR(50) DEFAULT 'not_connected',
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_requirements JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS stripe_account_type VARCHAR(50) DEFAULT 'express',
ADD COLUMN IF NOT EXISTS stripe_connected_at TIMESTAMP WITH TIME ZONE;

-- Index for fast lookups by Stripe account ID
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_account_id ON tenants(stripe_account_id);

-- Add status constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_tenants_stripe_account_status'
    ) THEN
        ALTER TABLE tenants 
        ADD CONSTRAINT chk_tenants_stripe_account_status 
        CHECK (stripe_account_status IN ('not_connected', 'pending', 'onboarding', 'restricted', 'active'));
    END IF;
END $$;

-- Comments for documentation
COMMENT ON COLUMN tenants.stripe_account_id IS 'Stripe Connect Account ID (acct_xxx)';
COMMENT ON COLUMN tenants.stripe_account_status IS 'Status: not_connected, pending, onboarding, restricted, active';
COMMENT ON COLUMN tenants.stripe_onboarding_complete IS 'Whether Stripe onboarding flow is complete';
COMMENT ON COLUMN tenants.stripe_payouts_enabled IS 'Whether payouts are enabled on the connected account';
COMMENT ON COLUMN tenants.stripe_charges_enabled IS 'Whether the account can accept charges';
COMMENT ON COLUMN tenants.stripe_details_submitted IS 'Whether all required details have been submitted to Stripe';
COMMENT ON COLUMN tenants.stripe_requirements IS 'JSONB of pending requirements from Stripe';
COMMENT ON COLUMN tenants.stripe_account_type IS 'Type of Stripe Connect account (express, standard, custom)';
COMMENT ON COLUMN tenants.stripe_connected_at IS 'When the Stripe account was first connected';

-- Create a table to track Stripe Terminal readers per tenant
CREATE TABLE IF NOT EXISTS stripe_terminal_readers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    stripe_reader_id VARCHAR(255) NOT NULL,
    stripe_location_id VARCHAR(255),
    label VARCHAR(255),
    device_type VARCHAR(100),
    serial_number VARCHAR(255),
    status VARCHAR(50) DEFAULT 'online',
    last_seen_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, stripe_reader_id)
);

CREATE INDEX IF NOT EXISTS idx_stripe_terminal_readers_tenant ON stripe_terminal_readers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stripe_terminal_readers_stripe_id ON stripe_terminal_readers(stripe_reader_id);

COMMENT ON TABLE stripe_terminal_readers IS 'Tracks Stripe Terminal readers registered to each tenant connected account';

-- Create a table to track Stripe Terminal locations per tenant
CREATE TABLE IF NOT EXISTS stripe_terminal_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    stripe_location_id VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_postal_code VARCHAR(20),
    address_country VARCHAR(10) DEFAULT 'US',
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, stripe_location_id)
);

CREATE INDEX IF NOT EXISTS idx_stripe_terminal_locations_tenant ON stripe_terminal_locations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stripe_terminal_locations_stripe_id ON stripe_terminal_locations(stripe_location_id);

COMMENT ON TABLE stripe_terminal_locations IS 'Tracks Stripe Terminal locations registered to each tenant connected account';

-- Table for tracking platform application fees
CREATE TABLE IF NOT EXISTS stripe_application_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    stripe_fee_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_charge_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(10) DEFAULT 'usd',
    refunded_amount INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stripe_app_fees_tenant ON stripe_application_fees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stripe_app_fees_stripe_id ON stripe_application_fees(stripe_fee_id);

COMMENT ON TABLE stripe_application_fees IS 'Tracks application fees collected from connected accounts';

-- ============================================================================
-- Platform settings table for Stripe Connect configuration
-- ============================================================================
CREATE TABLE IF NOT EXISTS platform_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default platform fee settings
INSERT INTO platform_settings (key, value, description) VALUES
    ('stripe_connect_fee_percent', '2.5', 'Platform application fee percentage for each transaction'),
    ('stripe_connect_fee_minimum', '0', 'Minimum application fee in cents (0 = no minimum)'),
    ('stripe_connect_enabled', 'true', 'Whether Stripe Connect is enabled for the platform')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE platform_settings IS 'Global platform configuration settings';
