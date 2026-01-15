-- ============================================================================
-- Add reissue tracking to restaurant_orders
-- ============================================================================

-- Add reissue_count column (0 = original, 1+ = number of times reissued)
ALTER TABLE restaurant_orders 
ADD COLUMN IF NOT EXISTS reissue_count INTEGER DEFAULT 0;

-- Comment
COMMENT ON COLUMN restaurant_orders.reissue_count IS 'Number of times this order has been reissued (0 = never reissued)';
