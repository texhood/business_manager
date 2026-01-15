-- ============================================================================
-- Add tenant_id to restaurant_order_items
-- Required for multi-tenant support
-- ============================================================================

-- Add tenant_id column to restaurant_order_items
ALTER TABLE restaurant_order_items 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';

-- Create index for tenant queries
CREATE INDEX IF NOT EXISTS idx_restaurant_order_items_tenant ON restaurant_order_items(tenant_id);

-- Comment
COMMENT ON COLUMN restaurant_order_items.tenant_id IS 'Tenant ID for multi-tenant support';
