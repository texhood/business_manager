-- ============================================================================
-- HERDS & FLOCKS + ENHANCED SALES
-- Adds herd/flock groupings and sale ticket with fees
-- Run AFTER 026_herds_flocks_pastures.sql
-- ============================================================================

-- ============================================================================
-- HERDS & FLOCKS
-- ============================================================================

-- Create types if they don't exist
DO $$
BEGIN
    CREATE TYPE herd_management_type AS ENUM ('individual', 'aggregate');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    CREATE TYPE herd_species AS ENUM ('cattle', 'sheep', 'goat', 'poultry', 'swine', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS herds_flocks (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    
    name VARCHAR(100) NOT NULL,
    species herd_species NOT NULL DEFAULT 'cattle',
    management_type herd_management_type NOT NULL DEFAULT 'individual',
    
    -- For aggregate management only
    animal_count INTEGER DEFAULT 0,
    
    -- Optional assignment to pasture
    current_pasture_id INTEGER REFERENCES pastures(id) ON DELETE SET NULL,
    
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_herds_flocks_tenant ON herds_flocks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_herds_flocks_species ON herds_flocks(species);

-- Add herd_flock_id to animals table
ALTER TABLE animals ADD COLUMN IF NOT EXISTS herd_flock_id INTEGER REFERENCES herds_flocks(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_animals_herd_flock ON animals(herd_flock_id);

-- ============================================================================
-- SALE TICKETS (Enhanced Sales Structure)
-- A sale ticket is an event where one or more animals are sold
-- ============================================================================

CREATE TABLE IF NOT EXISTS sale_tickets (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    
    -- Ticket identification
    ticket_number VARCHAR(50),
    sale_date DATE NOT NULL,
    
    -- Buyer info
    buyer_name VARCHAR(200) NOT NULL,
    buyer_contact TEXT,
    
    -- Location (auction house, private sale, etc.)
    sale_location VARCHAR(200),
    sale_type VARCHAR(50) DEFAULT 'auction', -- auction, private, consignment
    
    -- Totals (calculated from line items and fees)
    gross_amount NUMERIC(12, 2) DEFAULT 0,
    total_fees NUMERIC(12, 2) DEFAULT 0,
    net_amount NUMERIC(12, 2) DEFAULT 0,
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sale_tickets_tenant ON sale_tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sale_tickets_date ON sale_tickets(sale_date);
CREATE INDEX IF NOT EXISTS idx_sale_tickets_buyer ON sale_tickets(buyer_name);

-- ============================================================================
-- SALE TICKET LINE ITEMS (Animals on the ticket)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sale_ticket_items (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    sale_ticket_id INTEGER NOT NULL REFERENCES sale_tickets(id) ON DELETE CASCADE,
    animal_id INTEGER REFERENCES animals(id) ON DELETE SET NULL,
    
    -- Denormalized for historical record
    ear_tag VARCHAR(50),
    animal_name VARCHAR(100),
    animal_type VARCHAR(50),
    
    -- Sale details
    weight_lbs NUMERIC(8, 2),
    price_per_lb NUMERIC(8, 4),
    head_price NUMERIC(12, 2),
    line_total NUMERIC(12, 2) NOT NULL,
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sale_ticket_items_ticket ON sale_ticket_items(sale_ticket_id);
CREATE INDEX IF NOT EXISTS idx_sale_ticket_items_animal ON sale_ticket_items(animal_id);

-- ============================================================================
-- SALE FEES (Deductions from sale proceeds)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sale_fee_types (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_amount NUMERIC(12, 2),
    is_percentage BOOLEAN DEFAULT false,
    default_percentage NUMERIC(5, 4),
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

-- Insert common sale fee types
INSERT INTO sale_fee_types (name, description, is_percentage, default_percentage) VALUES
    ('Commission', 'Auction house commission', true, 0.03),
    ('Yardage', 'Holding/pen fee', false, NULL),
    ('Brand Inspection', 'State brand inspection fee', false, NULL),
    ('Trucking', 'Transportation to sale barn', false, NULL),
    ('Feed', 'Feed charges while at sale barn', false, NULL),
    ('Vet Check', 'Veterinary inspection', false, NULL),
    ('Insurance', 'Transit/liability insurance', false, NULL),
    ('Checkoff', 'Beef/livestock checkoff fee', true, 0.01),
    ('Other', 'Miscellaneous fees', false, NULL)
ON CONFLICT (tenant_id, name) DO NOTHING;

CREATE TABLE IF NOT EXISTS sale_ticket_fees (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    sale_ticket_id INTEGER NOT NULL REFERENCES sale_tickets(id) ON DELETE CASCADE,
    fee_type_id INTEGER REFERENCES sale_fee_types(id) ON DELETE SET NULL,
    
    -- Denormalized for historical record
    fee_name VARCHAR(100) NOT NULL,
    
    -- Amount
    amount NUMERIC(12, 2) NOT NULL,
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sale_ticket_fees_ticket ON sale_ticket_fees(sale_ticket_id);

-- ============================================================================
-- BUYERS (For tracking repeat buyers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS buyers (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    
    name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    buyer_type VARCHAR(50), -- auction, private, dealer, processor
    
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_buyers_tenant ON buyers(tenant_id);

-- Insert common buyers from existing data
INSERT INTO buyers (name, buyer_type) VALUES
    ('Tri-County Livestock Market, Inc.', 'auction'),
    ('Hunt Livestock Exchange', 'auction')
ON CONFLICT (tenant_id, name) DO NOTHING;

-- Add buyer reference to sale_tickets
ALTER TABLE sale_tickets ADD COLUMN IF NOT EXISTS buyer_id INTEGER REFERENCES buyers(id) ON DELETE SET NULL;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Herd/Flock Summary View
CREATE OR REPLACE VIEW herd_flock_summary AS
SELECT 
    hf.id,
    hf.tenant_id,
    hf.name,
    hf.species,
    hf.management_type,
    hf.description,
    hf.is_active,
    p.name AS pasture_name,
    CASE 
        WHEN hf.management_type = 'aggregate' THEN hf.animal_count
        ELSE (SELECT COUNT(*) FROM animals a WHERE a.herd_flock_id = hf.id AND a.status = 'Active')
    END AS current_count,
    CASE 
        WHEN hf.management_type = 'individual' THEN 
            (SELECT COUNT(*) FROM animals a WHERE a.herd_flock_id = hf.id)
        ELSE NULL
    END AS total_animals_ever
FROM herds_flocks hf
LEFT JOIN pastures p ON hf.current_pasture_id = p.id;

-- Sale Ticket Summary View
CREATE OR REPLACE VIEW sale_ticket_summary AS
SELECT 
    st.id,
    st.tenant_id,
    st.ticket_number,
    st.sale_date,
    st.buyer_name,
    st.sale_location,
    st.sale_type,
    st.gross_amount,
    st.total_fees,
    st.net_amount,
    (SELECT COUNT(*) FROM sale_ticket_items sti WHERE sti.sale_ticket_id = st.id) AS animal_count,
    (SELECT string_agg(sti.ear_tag, ', ') FROM sale_ticket_items sti WHERE sti.sale_ticket_id = st.id) AS ear_tags
FROM sale_tickets st;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Drop triggers if they exist before recreating
DROP TRIGGER IF EXISTS update_herds_flocks_updated_at ON herds_flocks;
DROP TRIGGER IF EXISTS update_sale_tickets_updated_at ON sale_tickets;
DROP TRIGGER IF EXISTS update_buyers_updated_at ON buyers;
DROP TRIGGER IF EXISTS recalc_ticket_on_item_change ON sale_ticket_items;
DROP TRIGGER IF EXISTS recalc_ticket_on_fee_change ON sale_ticket_fees;

CREATE TRIGGER update_herds_flocks_updated_at BEFORE UPDATE ON herds_flocks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sale_tickets_updated_at BEFORE UPDATE ON sale_tickets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buyers_updated_at BEFORE UPDATE ON buyers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Recalculate sale ticket totals
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_sale_ticket_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sale_tickets SET
        gross_amount = COALESCE((
            SELECT SUM(line_total) FROM sale_ticket_items WHERE sale_ticket_id = COALESCE(NEW.sale_ticket_id, OLD.sale_ticket_id)
        ), 0),
        total_fees = COALESCE((
            SELECT SUM(amount) FROM sale_ticket_fees WHERE sale_ticket_id = COALESCE(NEW.sale_ticket_id, OLD.sale_ticket_id)
        ), 0),
        net_amount = COALESCE((
            SELECT SUM(line_total) FROM sale_ticket_items WHERE sale_ticket_id = COALESCE(NEW.sale_ticket_id, OLD.sale_ticket_id)
        ), 0) - COALESCE((
            SELECT SUM(amount) FROM sale_ticket_fees WHERE sale_ticket_id = COALESCE(NEW.sale_ticket_id, OLD.sale_ticket_id)
        ), 0)
    WHERE id = COALESCE(NEW.sale_ticket_id, OLD.sale_ticket_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalc_ticket_on_item_change
    AFTER INSERT OR UPDATE OR DELETE ON sale_ticket_items
    FOR EACH ROW EXECUTE FUNCTION recalculate_sale_ticket_totals();

CREATE TRIGGER recalc_ticket_on_fee_change
    AFTER INSERT OR UPDATE OR DELETE ON sale_ticket_fees
    FOR EACH ROW EXECUTE FUNCTION recalculate_sale_ticket_totals();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE herds_flocks IS 'Groupings of animals - can be managed individually or as aggregate counts';
COMMENT ON COLUMN herds_flocks.management_type IS 'individual = track each animal, aggregate = just track count';
COMMENT ON TABLE sale_tickets IS 'Sale events with one or more animals sold to a buyer';
COMMENT ON TABLE sale_ticket_items IS 'Individual animals on a sale ticket';
COMMENT ON TABLE sale_ticket_fees IS 'Fees deducted from sale proceeds (commission, trucking, etc.)';
COMMENT ON TABLE sale_fee_types IS 'Predefined fee types for quick entry';
COMMENT ON TABLE buyers IS 'Buyer/auction house directory for repeat sales';
