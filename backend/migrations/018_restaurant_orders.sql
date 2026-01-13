-- ============================================================================
-- RESTAURANT ORDERS TABLE
-- For restaurant POS with order status tracking through kitchen workflow
-- ============================================================================

-- Create order status enum
DO $$ BEGIN
    CREATE TYPE restaurant_order_status AS ENUM ('entered', 'in_process', 'done', 'complete', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Restaurant Orders
CREATE TABLE IF NOT EXISTS restaurant_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    
    -- Order identification
    order_number VARCHAR(50) NOT NULL,
    ticket_number INTEGER,                  -- Short ticket number for kitchen display
    
    -- Menu reference
    menu_id UUID REFERENCES menus(id),
    
    -- Customer info (optional)
    customer_name VARCHAR(255),
    phone_number VARCHAR(20),
    table_number VARCHAR(50),
    order_type VARCHAR(50) DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeout', 'delivery')),
    
    -- Amounts
    subtotal NUMERIC(10,2) NOT NULL,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    
    -- Payment info
    payment_method VARCHAR(20) CHECK (payment_method IN ('card', 'cash', 'split', 'unpaid')),
    payment_intent_id VARCHAR(255),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    cash_received NUMERIC(10,2),
    change_given NUMERIC(10,2),
    
    -- Status tracking
    status restaurant_order_status DEFAULT 'entered',
    status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Notes
    notes TEXT,
    kitchen_notes TEXT,
    
    -- Metadata
    created_by UUID REFERENCES accounts(id),
    completed_by UUID REFERENCES accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, order_number)
);

-- Restaurant Order Items
CREATE TABLE IF NOT EXISTS restaurant_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES restaurant_orders(id) ON DELETE CASCADE,
    
    -- Menu item reference
    menu_item_id UUID REFERENCES menu_items(id),
    
    -- Item details (captured at time of order)
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    
    -- Modifications
    modifications TEXT[],                   -- ['no onions', 'extra cheese']
    special_instructions TEXT,
    
    -- Status per item (for kitchen tracking)
    item_status VARCHAR(20) DEFAULT 'pending' CHECK (item_status IN ('pending', 'preparing', 'ready', 'served')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_tenant ON restaurant_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_number ON restaurant_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_ticket ON restaurant_orders(ticket_number);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_status ON restaurant_orders(status);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_date ON restaurant_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_menu ON restaurant_orders(menu_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_order_items_order ON restaurant_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_order_items_menu_item ON restaurant_order_items(menu_item_id);

-- Comments
COMMENT ON TABLE restaurant_orders IS 'Restaurant POS orders with kitchen workflow status tracking';
COMMENT ON TABLE restaurant_order_items IS 'Line items within restaurant orders';
COMMENT ON COLUMN restaurant_orders.status IS 'Order workflow: entered -> in_process -> done -> complete';
COMMENT ON COLUMN restaurant_orders.ticket_number IS 'Short number for kitchen display (resets daily)';
