-- ============================================================================
-- ADD STRIPE INTEGRATION FIELDS TO ITEMS TABLE
-- ============================================================================

-- Add Stripe product and price IDs to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255);
ALTER TABLE items ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255);
ALTER TABLE items ADD COLUMN IF NOT EXISTS stripe_member_price_id VARCHAR(255);

-- Create indexes for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_items_stripe_product ON items(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_items_stripe_price ON items(stripe_price_id);

-- Add comment for documentation
COMMENT ON COLUMN items.stripe_product_id IS 'Stripe Product ID for this item';
COMMENT ON COLUMN items.stripe_price_id IS 'Stripe Price ID for regular price';
COMMENT ON COLUMN items.stripe_member_price_id IS 'Stripe Price ID for member price';
