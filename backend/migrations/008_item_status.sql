-- ============================================================================
-- Migration: Add Item Status
-- 
-- Replaces boolean is_active with a status enum for better control:
-- - active: Can be sold, can be purchased, appears on eCommerce/POS
-- - inactive: Cannot be sold, cannot be purchased, hidden from eCommerce/POS
-- - draft: Work in progress, not ready for use
-- ============================================================================

-- Create the enum type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_status') THEN
        CREATE TYPE item_status AS ENUM ('active', 'inactive', 'draft');
    END IF;
END $$;

-- Add the status column
ALTER TABLE items ADD COLUMN IF NOT EXISTS status item_status;

-- Migrate existing data: is_active = true -> 'active', is_active = false -> 'inactive'
UPDATE items 
SET status = CASE 
    WHEN is_active = true THEN 'active'::item_status
    ELSE 'inactive'::item_status
END
WHERE status IS NULL;

-- Set default for new items
ALTER TABLE items ALTER COLUMN status SET DEFAULT 'draft'::item_status;

-- Make status NOT NULL after migration
ALTER TABLE items ALTER COLUMN status SET NOT NULL;

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);

-- Add comments
COMMENT ON COLUMN items.status IS 'active=can be sold/purchased and visible, inactive=hidden and disabled, draft=work in progress';

-- ============================================================================
-- Verification query (run manually):
-- SELECT status, COUNT(*), array_agg(DISTINCT is_active) as old_is_active_values
-- FROM items GROUP BY status;
-- ============================================================================
