-- ============================================================================
-- Add tenant_id to restaurant_order_items for defense-in-depth
-- Ensures tenant isolation even for direct queries on order items
-- ============================================================================

-- Add tenant_id column (nullable initially for backfill)
ALTER TABLE restaurant_order_items 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- Backfill tenant_id from parent orders
UPDATE restaurant_order_items roi
SET tenant_id = ro.tenant_id
FROM restaurant_orders ro
WHERE roi.order_id = ro.id
  AND roi.tenant_id IS NULL;

-- Set default for new records
ALTER TABLE restaurant_order_items 
ALTER COLUMN tenant_id SET DEFAULT '00000000-0000-0000-0000-000000000001';

-- Make tenant_id NOT NULL after backfill
ALTER TABLE restaurant_order_items 
ALTER COLUMN tenant_id SET NOT NULL;

-- Add index for tenant queries
CREATE INDEX IF NOT EXISTS idx_restaurant_order_items_tenant 
ON restaurant_order_items(tenant_id);

-- Add composite index for common query pattern (tenant + order)
CREATE INDEX IF NOT EXISTS idx_restaurant_order_items_tenant_order 
ON restaurant_order_items(tenant_id, order_id);

-- Add comment
COMMENT ON COLUMN restaurant_order_items.tenant_id IS 'Tenant ID for defense-in-depth isolation, should match parent order tenant_id';
