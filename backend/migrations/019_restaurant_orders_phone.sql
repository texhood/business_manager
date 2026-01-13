-- ============================================================================
-- Add phone_number to restaurant_orders
-- For SMS notifications when order status changes to Done
-- ============================================================================

ALTER TABLE restaurant_orders 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

COMMENT ON COLUMN restaurant_orders.phone_number IS 'Customer phone number for SMS notification when order is ready';
