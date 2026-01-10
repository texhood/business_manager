-- ============================================================================
-- HOOD FAMILY FARMS BUSINESS_MANAGER - DATABASE SCHEMA
-- PostgreSQL Database Schema for Phase 1 & 2
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE account_role AS ENUM ('admin', 'staff', 'customer');
CREATE TYPE item_type AS ENUM ('inventory', 'non-inventory', 'digital');
CREATE TYPE shipping_zone AS ENUM ('not-shippable', 'in-state', 'in-country', 'no-restrictions');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'cancelled');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled');

-- ============================================================================
-- DELIVERY ZONES
-- ============================================================================

CREATE TABLE delivery_zones (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    schedule VARCHAR(100) NOT NULL,
    radius INTEGER NOT NULL DEFAULT 20,
    base_city VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default zones
INSERT INTO delivery_zones (id, name, schedule, radius, base_city) VALUES
    ('bullard', 'Bullard', 'Friday', 20, 'Bullard, TX'),
    ('tyler', 'Tyler', 'Saturday', 20, 'Tyler, TX'),
    ('dallas', 'Dallas', 'Alternating Wednesday', 20, 'Dallas, TX'),
    ('houston', 'Houston/Woodlands', 'Alternating Wednesday', 20, 'The Woodlands, TX');

-- ============================================================================
-- ACCOUNTS (Users)
-- ============================================================================

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL for customers who haven't set up login
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    role account_role NOT NULL DEFAULT 'customer',
    delivery_zone_id VARCHAR(50) REFERENCES delivery_zones(id) ON DELETE SET NULL,
    is_farm_member BOOLEAN NOT NULL DEFAULT false,
    member_since DATE,
    member_discount_percent NUMERIC(5,2) DEFAULT 10.00,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_role ON accounts(role);
CREATE INDEX idx_accounts_farm_member ON accounts(is_farm_member);
CREATE INDEX idx_accounts_zone ON accounts(delivery_zone_id);

-- ============================================================================
-- CATEGORIES
-- ============================================================================

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, slug, sort_order) VALUES
    ('Beef', 'beef', 1),
    ('Chicken', 'chicken', 2),
    ('Lamb', 'lamb', 3),
    ('Eggs', 'eggs', 4),
    ('Farm Fresh', 'farm-fresh', 5),
    ('Gear', 'gear', 6),
    ('Lifestyle', 'lifestyle', 7),
    ('Meats', 'meats', 8),
    ('Membership', 'membership', 9),
    ('Digital', 'digital', 10);

-- ============================================================================
-- TAGS
-- ============================================================================

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default tags
INSERT INTO tags (name, slug) VALUES
    ('Meats', 'meats'),
    ('Poultry', 'poultry'),
    ('Farm Fresh', 'farm-fresh'),
    ('Subscription', 'subscription'),
    ('Downloads', 'downloads'),
    ('Apparel', 'apparel'),
    ('Seasonal', 'seasonal'),
    ('Best Seller', 'best-seller'),
    ('New Arrival', 'new-arrival');

-- ============================================================================
-- ITEMS (Products)
-- ============================================================================

CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    item_type item_type NOT NULL DEFAULT 'inventory',
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    price NUMERIC(10,2) NOT NULL,
    member_price NUMERIC(10,2), -- If NULL, calculated as price * (1 - member_discount_percent/100)
    cost NUMERIC(10,2), -- Cost of goods for profit calculation
    inventory_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    is_taxable BOOLEAN NOT NULL DEFAULT true,
    tax_rate NUMERIC(5,4) DEFAULT 0.0825, -- Texas sales tax
    shipping_zone shipping_zone NOT NULL DEFAULT 'in-state',
    weight_oz NUMERIC(8,2), -- For shipping calculations
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    image_url TEXT,
    digital_file_url TEXT, -- For digital downloads
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_items_sku ON items(sku);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_type ON items(item_type);
CREATE INDEX idx_items_active ON items(is_active);

-- ============================================================================
-- ITEM TAGS (Many-to-Many)
-- ============================================================================

CREATE TABLE item_tags (
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (item_id, tag_id)
);

-- ============================================================================
-- MEMBERSHIPS (Subscription tracking)
-- ============================================================================

CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE SET NULL, -- The membership product purchased
    status membership_status NOT NULL DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    auto_renew BOOLEAN NOT NULL DEFAULT true,
    payment_method VARCHAR(50),
    stripe_subscription_id VARCHAR(255), -- For Stripe integration
    discount_percent NUMERIC(5,2) DEFAULT 10.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_memberships_account ON memberships(account_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_memberships_dates ON memberships(start_date, end_date);

-- ============================================================================
-- TRANSACTION CATEGORIES (Bookkeeping)
-- ============================================================================

CREATE TABLE transaction_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type transaction_type NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default income categories
INSERT INTO transaction_categories (name, type) VALUES
    ('Product Sales', 'income'),
    ('Farm Membership', 'income'),
    ('Food Trailer', 'income'),
    ('Catering', 'income'),
    ('Farm Visits', 'income'),
    ('Shipping Revenue', 'income'),
    ('Other Income', 'income');

-- Insert default expense categories
INSERT INTO transaction_categories (name, type) VALUES
    ('Feed & Supplies', 'expense'),
    ('Utilities', 'expense'),
    ('Equipment', 'expense'),
    ('Labor', 'expense'),
    ('Fuel & Transport', 'expense'),
    ('Processing Fees', 'expense'),
    ('Marketing', 'expense'),
    ('Insurance', 'expense'),
    ('Repairs & Maintenance', 'expense'),
    ('Office & Admin', 'expense'),
    ('Other Expense', 'expense');

-- ============================================================================
-- BANK ACCOUNTS
-- ============================================================================

CREATE TABLE bank_accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50), -- checking, savings, etc.
    last_four VARCHAR(4),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default accounts
INSERT INTO bank_accounts (name, account_type) VALUES
    ('Checking', 'checking'),
    ('Savings', 'savings'),
    ('Cash', 'cash'),
    ('PayPal', 'digital'),
    ('Square', 'digital');

-- ============================================================================
-- TRANSACTIONS (Bookkeeping)
-- ============================================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    type transaction_type NOT NULL,
    category_id INTEGER REFERENCES transaction_categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    bank_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE SET NULL,
    reference VARCHAR(100), -- Invoice #, receipt #, etc.
    order_id UUID, -- Link to order if applicable (for Phase 2)
    vendor VARCHAR(255), -- For expenses
    is_reconciled BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_by UUID REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category_id);

-- ============================================================================
-- ORDERS (Phase 2 - eCommerce)
-- ============================================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    status order_status NOT NULL DEFAULT 'pending',
    
    -- Customer info (copied at time of order for historical record)
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    
    -- Shipping address
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(50),
    shipping_zip VARCHAR(20),
    delivery_zone_id VARCHAR(50) REFERENCES delivery_zones(id) ON DELETE SET NULL,
    delivery_date DATE,
    delivery_notes TEXT,
    
    -- Totals
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    shipping_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    
    -- Membership discount applied
    is_member_order BOOLEAN NOT NULL DEFAULT false,
    member_discount_percent NUMERIC(5,2) DEFAULT 0,
    
    -- Payment
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    stripe_payment_intent_id VARCHAR(255),
    
    -- Timestamps
    ordered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    ready_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_account ON orders(account_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(ordered_at);

-- ============================================================================
-- ORDER ITEMS (Line items)
-- ============================================================================

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    
    -- Item info (copied at time of order for historical record)
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    member_price NUMERIC(10,2),
    price_used NUMERIC(10,2) NOT NULL, -- Actual price charged
    
    is_taxable BOOLEAN NOT NULL DEFAULT true,
    tax_rate NUMERIC(5,4) DEFAULT 0,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    
    line_total NUMERIC(12,2) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_item ON order_items(item_id);

-- ============================================================================
-- INVENTORY LOGS (Track inventory changes)
-- ============================================================================

CREATE TABLE inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    quantity_change INTEGER NOT NULL, -- Positive for additions, negative for subtractions
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL, -- 'sale', 'restock', 'adjustment', 'spoilage', etc.
    reference_type VARCHAR(50), -- 'order', 'manual', etc.
    reference_id UUID, -- order_id if from a sale
    notes TEXT,
    created_by UUID REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_logs_item ON inventory_logs(item_id);
CREATE INDEX idx_inventory_logs_date ON inventory_logs(created_at);

-- ============================================================================
-- FOOD TRAILER / RESTAURANT (Phase 3)
-- ============================================================================

-- Menu items specific to food trailer (can link to inventory items)
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    category VARCHAR(100),
    is_available BOOLEAN NOT NULL DEFAULT true,
    prep_time_minutes INTEGER,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Menu item ingredients (links to inventory for cost tracking)
CREATE TABLE menu_item_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    ingredient_name VARCHAR(255) NOT NULL, -- In case item_id is null
    quantity_used NUMERIC(10,4) NOT NULL,
    unit VARCHAR(50) NOT NULL, -- oz, lb, each, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Food trailer orders (separate from farm shop orders)
CREATE TABLE trailer_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    tip_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    ordered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trailer_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trailer_order_id UUID NOT NULL REFERENCES trailer_orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    modifiers TEXT, -- JSON for customizations
    line_total NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES accounts(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_record ON audit_log(record_id);
CREATE INDEX idx_audit_log_date ON audit_log(changed_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_zones_updated_at BEFORE UPDATE ON delivery_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'HFF-' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE SEQUENCE order_number_seq START 1;
CREATE TRIGGER set_order_number BEFORE INSERT ON orders FOR EACH ROW WHEN (NEW.order_number IS NULL) EXECUTE FUNCTION generate_order_number();

-- Function to generate trailer order number
CREATE OR REPLACE FUNCTION generate_trailer_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'FT-' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' || LPAD(nextval('trailer_order_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE SEQUENCE trailer_order_number_seq START 1;
CREATE TRIGGER set_trailer_order_number BEFORE INSERT ON trailer_orders FOR EACH ROW WHEN (NEW.order_number IS NULL) EXECUTE FUNCTION generate_trailer_order_number();

-- Function to update inventory after order
CREATE OR REPLACE FUNCTION update_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update for inventory items
    IF EXISTS (SELECT 1 FROM items WHERE id = NEW.item_id AND item_type = 'inventory') THEN
        UPDATE items 
        SET inventory_quantity = inventory_quantity - NEW.quantity
        WHERE id = NEW.item_id;
        
        -- Log the inventory change
        INSERT INTO inventory_logs (item_id, quantity_change, quantity_before, quantity_after, reason, reference_type, reference_id)
        SELECT 
            NEW.item_id,
            -NEW.quantity,
            inventory_quantity + NEW.quantity,
            inventory_quantity,
            'sale',
            'order',
            NEW.order_id
        FROM items WHERE id = NEW.item_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER inventory_update_on_order_item AFTER INSERT ON order_items FOR EACH ROW EXECUTE FUNCTION update_inventory_on_order();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for items with category and stock status
CREATE VIEW items_with_details AS
SELECT 
    i.*,
    c.name as category_name,
    c.slug as category_slug,
    CASE 
        WHEN i.item_type != 'inventory' THEN 'digital'
        WHEN i.inventory_quantity = 0 THEN 'out'
        WHEN i.inventory_quantity <= i.low_stock_threshold THEN 'low'
        ELSE 'in'
    END as stock_status,
    COALESCE(i.member_price, i.price * 0.9) as calculated_member_price,
    array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tag_names
FROM items i
LEFT JOIN categories c ON i.category_id = c.id
LEFT JOIN item_tags it ON i.id = it.item_id
LEFT JOIN tags t ON it.tag_id = t.id
GROUP BY i.id, c.name, c.slug;

-- View for monthly financial summary
CREATE VIEW monthly_summary AS
SELECT 
    DATE_TRUNC('month', date) as month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_profit
FROM transactions
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;

-- View for customer summary
CREATE VIEW customer_summary AS
SELECT 
    a.id,
    a.name,
    a.email,
    a.is_farm_member,
    a.member_since,
    dz.name as delivery_zone,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total), 0) as lifetime_value,
    MAX(o.ordered_at) as last_order_date
FROM accounts a
LEFT JOIN delivery_zones dz ON a.delivery_zone_id = dz.id
LEFT JOIN orders o ON a.id = o.account_id
WHERE a.role = 'customer'
GROUP BY a.id, a.name, a.email, a.is_farm_member, a.member_since, dz.name;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert admin account (password would be hashed in real app)
INSERT INTO accounts (email, name, phone, address, city, state, zip_code, role, delivery_zone_id)
VALUES ('sara@hoodfamilyfarms.com', 'Sara Hood', '903-555-0100', '3950 County Road 3802', 'Bullard', 'TX', '75757', 'admin', 'bullard');

-- Insert sample items
INSERT INTO items (sku, name, description, item_type, category_id, price, member_price, inventory_quantity, is_taxable, shipping_zone) VALUES
    ('CHK-001', 'Pasture Raised Whole Chicken', 'Farm-raised whole chicken, approximately 4-5 lbs', 'inventory', 2, 23.00, 20.70, 0, true, 'in-state'),
    ('CHK-002', 'Chicken Thighs', 'Pack of bone-in chicken thighs, approximately 2 lbs', 'inventory', 2, 15.00, 13.50, 12, true, 'in-state'),
    ('EGG-001', 'Pasture Raised Eggs - One Dozen', 'Farm fresh eggs from free-range hens', 'inventory', 4, 8.00, 7.20, 4, false, 'not-shippable'),
    ('LMB-001', 'Grass Fed Ground Lamb', 'Ground lamb, 1 lb package', 'inventory', 3, 12.00, 10.80, 8, true, 'in-country'),
    ('MEM-001', 'Farm Membership - Annual', 'Annual farm membership with 10% discount, free farm visits, and early access', 'non-inventory', 9, 99.00, 99.00, NULL, false, 'no-restrictions'),
    ('DIG-001', 'FREE Fall Recipe Download', 'Downloadable PDF with seasonal recipes', 'digital', 10, 0.00, 0.00, NULL, false, 'no-restrictions');

-- Add tags to items
INSERT INTO item_tags (item_id, tag_id)
SELECT i.id, t.id FROM items i, tags t WHERE i.sku = 'CHK-001' AND t.slug IN ('meats', 'poultry');
INSERT INTO item_tags (item_id, tag_id)
SELECT i.id, t.id FROM items i, tags t WHERE i.sku = 'CHK-002' AND t.slug IN ('meats', 'poultry');
INSERT INTO item_tags (item_id, tag_id)
SELECT i.id, t.id FROM items i, tags t WHERE i.sku = 'EGG-001' AND t.slug = 'farm-fresh';
INSERT INTO item_tags (item_id, tag_id)
SELECT i.id, t.id FROM items i, tags t WHERE i.sku = 'LMB-001' AND t.slug = 'meats';
INSERT INTO item_tags (item_id, tag_id)
SELECT i.id, t.id FROM items i, tags t WHERE i.sku = 'MEM-001' AND t.slug = 'subscription';
INSERT INTO item_tags (item_id, tag_id)
SELECT i.id, t.id FROM items i, tags t WHERE i.sku = 'DIG-001' AND t.slug = 'downloads';
