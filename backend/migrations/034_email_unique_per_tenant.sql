-- ============================================================================
-- MIGRATION 034: Make email unique per tenant, not globally
-- Allows same email to exist in different tenants
-- ============================================================================

-- Drop the global unique constraint on email
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_email_key;

-- Add composite unique constraint for tenant + email
-- This allows the same email to be used in different tenants
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'accounts_tenant_email_unique'
    ) THEN
        ALTER TABLE accounts ADD CONSTRAINT accounts_tenant_email_unique 
        UNIQUE (tenant_id, email);
    END IF;
END $$;

-- Comment
COMMENT ON CONSTRAINT accounts_tenant_email_unique ON accounts IS 'Email must be unique within each tenant, but can be reused across tenants';
