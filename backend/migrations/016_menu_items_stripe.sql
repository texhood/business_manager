-- ============================================================================
-- Add Stripe fields to menu_items table
-- For syncing menu items to Stripe for POS use
-- ============================================================================

-- Add Stripe columns to menu_items
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255);

-- Create indexes for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_menu_items_stripe_product ON menu_items(stripe_product_id) WHERE stripe_product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_menu_items_stripe_price ON menu_items(stripe_price_id) WHERE stripe_price_id IS NOT NULL;

-- Comments
COMMENT ON COLUMN menu_items.stripe_product_id IS 'Stripe Product ID for POS integration';
COMMENT ON COLUMN menu_items.stripe_price_id IS 'Stripe Price ID for POS integration';
