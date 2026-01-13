-- ============================================================================
-- POS TERMINAL TABLES
-- For recording point-of-sale orders and transactions
-- ============================================================================

-- POS Orders (completed sales)
CREATE TABLE IF NOT EXISTS pos_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    
    -- Order identification
    order_number VARCHAR(50) NOT NULL,
    
    -- Amounts
    subtotal NUMERIC(10,2) NOT NULL,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    
    -- Payment info
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('card', 'cash', 'split')),
    payment_intent_id VARCHAR(255),  -- Stripe payment intent ID for card payments
    cash_received NUMERIC(10,2),     -- For cash payments
    change_given NUMERIC(10,2),      -- For cash payments
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'voided')),
    
    -- Additional info
    notes TEXT,
    
    -- Metadata
    created_by UUID REFERENCES accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, order_number)
);

-- POS Order Items (line items in an order)
CREATE TABLE IF NOT EXISTS pos_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES pos_orders(id) ON DELETE CASCADE,
    
    -- Item reference (optional - allows custom items)
    item_id UUID REFERENCES items(id),
    
    -- Item details (captured at time of sale)
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pos_orders_tenant ON pos_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pos_orders_number ON pos_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_pos_orders_date ON pos_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_pos_orders_status ON pos_orders(status);
CREATE INDEX IF NOT EXISTS idx_pos_orders_payment ON pos_orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_pos_orders_payment_intent ON pos_orders(payment_intent_id) WHERE payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pos_order_items_order ON pos_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_pos_order_items_item ON pos_order_items(item_id) WHERE item_id IS NOT NULL;

-- Comments
COMMENT ON TABLE pos_orders IS 'Point-of-sale orders from the POS terminal';
COMMENT ON TABLE pos_order_items IS 'Line items within POS orders';
COMMENT ON COLUMN pos_orders.order_number IS 'Human-readable order number (YYYYMMDD-NNN format)';
COMMENT ON COLUMN pos_orders.payment_intent_id IS 'Stripe PaymentIntent ID for card payments';
