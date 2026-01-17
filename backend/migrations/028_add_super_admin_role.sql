-- Migration: Add super_admin role and onboarding support
-- Run this migration to enable the System Administration portal

-- ============================================================================
-- 1. Add super_admin to account_role enum
-- ============================================================================

-- Add super_admin to the account_role enum type
ALTER TYPE account_role ADD VALUE IF NOT EXISTS 'super_admin';

-- ============================================================================
-- 2. Add onboarding fields to tenants table
-- ============================================================================

-- Add onboarding_complete flag
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;

-- Add description field
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS description text;

-- ============================================================================
-- 3. Create first super_admin user (update email/password as needed)
-- ============================================================================

-- Note: You'll need to create a super_admin user manually or through the API
-- Example (update the values):
-- INSERT INTO accounts (email, password_hash, name, role, is_active)
-- VALUES ('admin@example.com', '$2b$10$...', 'System Admin', 'super_admin', true);

-- To create password hash, use bcrypt with 10 rounds
-- You can use the auth API to create the user, then update the role:
-- UPDATE accounts SET role = 'super_admin' WHERE email = 'your-admin@email.com';

-- ============================================================================
-- 4. Verify existing default tenant
-- ============================================================================

-- Ensure default tenant exists and is properly configured
UPDATE tenants 
SET onboarding_complete = true 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- If no default tenant exists, create one:
INSERT INTO tenants (id, slug, name, is_active, onboarding_complete)
VALUES ('00000000-0000-0000-0000-000000000001', 'hood-family-farms', 'Hood Family Farms', true, true)
ON CONFLICT (id) DO NOTHING;
