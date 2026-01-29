-- ============================================================================
-- Add missing columns to tenants table for onboarding
-- Migration: 038_tenants_add_onboarding_columns.sql
-- ============================================================================

-- Add description column
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS description TEXT;

-- Add onboarding_complete column
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;

-- Update existing tenants to mark onboarding as complete
UPDATE tenants SET onboarding_complete = true WHERE onboarding_complete IS NULL;

-- Add comment
COMMENT ON COLUMN tenants.description IS 'Optional description of the tenant/business';
COMMENT ON COLUMN tenants.onboarding_complete IS 'Whether the tenant has completed initial onboarding';
