-- Migration: Fix tags table tenant isolation
-- The tags table has a unique constraint on slug alone, but should be (tenant_id, slug)
-- to allow each tenant to have their own tags

-- Drop the existing slug-only constraint
ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_slug_key;

-- Add tenant-scoped unique constraint on slug
ALTER TABLE tags ADD CONSTRAINT tags_tenant_slug_key UNIQUE (tenant_id, slug);

-- Also ensure name is unique per tenant (not globally)
-- First check if there's a name constraint
ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_name_key;

-- Add tenant-scoped unique constraint on name
ALTER TABLE tags ADD CONSTRAINT tags_tenant_name_key UNIQUE (tenant_id, name);
