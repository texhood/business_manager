-- ============================================================================
-- CR Hood Solutions- REPORT BUILDER
-- Migration: 040_report_builder.sql
-- Description: CattleMax-style dynamic report builder with record/field metadata
-- ============================================================================

-- ============================================================================
-- REPORT RECORD DEFINITIONS
-- Metadata about available tables/views that can be used for reporting
-- ============================================================================

CREATE TABLE report_record_definitions (
    id SERIAL PRIMARY KEY,
    record_name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('table', 'view')),
    source_name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_tenant_filtered BOOLEAN DEFAULT true,
    tenant_id_column VARCHAR(100) DEFAULT 'tenant_id',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_records_category ON report_record_definitions(category);
CREATE INDEX idx_report_records_active ON report_record_definitions(is_active);

-- ============================================================================
-- REPORT FIELD DEFINITIONS
-- Metadata about fields available for each record type
-- ============================================================================

CREATE TABLE report_field_definitions (
    id SERIAL PRIMARY KEY,
    record_id INTEGER NOT NULL REFERENCES report_record_definitions(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('text', 'number', 'date', 'datetime', 'boolean', 'enum', 'currency')),
    enum_values JSONB,
    is_filterable BOOLEAN DEFAULT true,
    is_sortable BOOLEAN DEFAULT true,
    is_groupable BOOLEAN DEFAULT false,
    is_aggregatable BOOLEAN DEFAULT false,
    default_selected BOOLEAN DEFAULT false,
    format_hint VARCHAR(50),
    column_width INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(record_id, field_name)
);

CREATE INDEX idx_report_fields_record ON report_field_definitions(record_id);

-- ============================================================================
-- CUSTOM REPORTS (User-saved report definitions)
-- ============================================================================

CREATE TABLE custom_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    record_type VARCHAR(100) NOT NULL,
    selected_columns JSONB NOT NULL DEFAULT '[]',
    constraints JSONB NOT NULL DEFAULT '[]',
    sort_config JSONB DEFAULT '[]',
    group_by_fields JSONB DEFAULT '[]',
    aggregations JSONB DEFAULT '[]',
    page_size INTEGER DEFAULT 50 CHECK (page_size > 0 AND page_size <= 500),
    show_row_numbers BOOLEAN DEFAULT false,
    show_totals BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    run_count INTEGER DEFAULT 0,
    last_run_at TIMESTAMPTZ,
    created_by UUID REFERENCES accounts(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, name)
);

CREATE INDEX idx_custom_reports_tenant ON custom_reports(tenant_id);
CREATE INDEX idx_custom_reports_record_type ON custom_reports(record_type);
CREATE INDEX idx_custom_reports_favorite ON custom_reports(tenant_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_custom_reports_created_by ON custom_reports(created_by);

-- ============================================================================
-- REPORT RUN HISTORY
-- ============================================================================

CREATE TABLE report_run_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    report_id UUID REFERENCES custom_reports(id) ON DELETE SET NULL,
    report_name VARCHAR(255) NOT NULL,
    record_type VARCHAR(100) NOT NULL,
    run_by UUID REFERENCES accounts(id),
    row_count INTEGER,
    execution_time_ms INTEGER,
    exported_format VARCHAR(20),
    run_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_history_tenant ON report_run_history(tenant_id);
CREATE INDEX idx_report_history_report ON report_run_history(report_id);
CREATE INDEX idx_report_history_date ON report_run_history(run_at DESC);

-- ============================================================================
-- TRIGGER: Update custom_reports.updated_at
-- ============================================================================

CREATE TRIGGER update_custom_reports_updated_at
    BEFORE UPDATE ON custom_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA: Record Definitions
-- ============================================================================

-- Livestock Records
INSERT INTO report_record_definitions (record_name, display_name, description, source_type, source_name, category, sort_order) VALUES
('herd_summary', 'Herd Summary', 'Complete animal records with computed fields like age, dam/sire info, and sale data', 'view', 'herd_summary', 'livestock', 10),
('active_herd', 'Active Herd', 'Currently active animals only (status = Active)', 'view', 'active_herd', 'livestock', 20),
('animals', 'Animals (Raw)', 'Raw animal records without computed fields', 'table', 'animals', 'livestock', 30),
('animal_health_records', 'Health Records', 'Vaccination, treatment, and health history', 'table', 'animal_health_records', 'livestock', 40),
('animal_weights', 'Weight Records', 'Weight tracking over time', 'table', 'animal_weights', 'livestock', 50),
('animal_sales', 'Animal Sales', 'Historical sale records for individual animals', 'table', 'animal_sales', 'livestock', 60),
('herd_flock_summary', 'Herds & Flocks', 'Herd/flock groupings with animal counts', 'view', 'herd_flock_summary', 'livestock', 70),
('processing_records_summary', 'Processing Records', 'Animals sent to processor with status tracking', 'view', 'processing_records_summary', 'livestock', 80),
('sale_ticket_summary', 'Sale Tickets', 'Sales transactions with totals and head counts', 'view', 'sale_ticket_summary', 'livestock', 90);

-- Pasture Records
INSERT INTO report_record_definitions (record_name, display_name, description, source_type, source_name, category, sort_order) VALUES
('pasture_status', 'Pasture Status', 'Current pasture utilization and animal counts', 'view', 'pasture_status', 'pastures', 10),
('pastures', 'Pastures', 'Pasture/paddock definitions', 'table', 'pastures', 'pastures', 20),
('pasture_grazing_events', 'Grazing Events', 'Rotational grazing history', 'table', 'pasture_grazing_events', 'pastures', 30),
('pasture_soil_samples', 'Soil Samples', 'Soil testing records', 'table', 'pasture_soil_samples', 'pastures', 40),
('pasture_tasks', 'Pasture Tasks', 'Maintenance tasks and completion status', 'table', 'pasture_tasks', 'pastures', 50),
('pasture_treatments', 'Pasture Treatments', 'Chemical and mechanical treatments', 'table', 'pasture_treatments', 'pastures', 60),
('rainfall_records', 'Rainfall Records', 'Daily rainfall measurements', 'table', 'rainfall_records', 'pastures', 70);

-- Financial Records
INSERT INTO report_record_definitions (record_name, display_name, description, source_type, source_name, category, sort_order) VALUES
('general_ledger', 'General Ledger', 'Detailed transaction journal with account info', 'view', 'general_ledger', 'financial', 10),
('trial_balance', 'Trial Balance', 'Account balances for verification', 'view', 'trial_balance', 'financial', 20),
('transactions', 'Transactions', 'Raw transaction records', 'table', 'transactions', 'financial', 30),
('journal_entries', 'Journal Entries', 'Double-entry accounting records', 'table', 'journal_entries', 'financial', 40),
('accounts_chart', 'Chart of Accounts', 'GL account definitions', 'table', 'accounts_chart', 'financial', 50),
('vendors', 'Vendors', 'Vendor/supplier master list', 'table', 'vendors', 'financial', 60);

-- Restaurant/POS Records
INSERT INTO report_record_definitions (record_name, display_name, description, source_type, source_name, category, sort_order) VALUES
('restaurant_orders', 'Restaurant Orders', 'Food trailer/restaurant order history', 'table', 'restaurant_orders', 'restaurant', 10),
('restaurant_order_items', 'Order Line Items', 'Individual items within restaurant orders', 'table', 'restaurant_order_items', 'restaurant', 20),
('pos_orders', 'POS Orders', 'Point-of-sale terminal transactions', 'table', 'pos_orders', 'restaurant', 30),
('menu_items', 'Menu Items', 'Menu product catalog', 'table', 'menu_items', 'restaurant', 40);

-- Customer Records
INSERT INTO report_record_definitions (record_name, display_name, description, source_type, source_name, category, sort_order) VALUES
('customer_summary', 'Customer Summary', 'Customer analytics with order history', 'view', 'customer_summary', 'customers', 10),
('accounts', 'Accounts', 'User and customer records', 'table', 'accounts', 'customers', 20),
('memberships', 'Memberships', 'Farm membership tracking', 'table', 'memberships', 'customers', 30),
('orders', 'eCommerce Orders', 'Online store orders', 'table', 'orders', 'customers', 40);

-- Mark views without tenant_id column
UPDATE report_record_definitions SET is_tenant_filtered = false WHERE record_name IN ('general_ledger', 'trial_balance');

-- ============================================================================
-- SEED DATA: Field Definitions
-- All INSERT statements use consistent column list with enum_values
-- ============================================================================

-- Herd Summary Fields
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'ear_tag', 'Ear Tag', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'name', 'Name', 'text', NULL, true, true, false, false, true, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'animal_type', 'Animal Type', 'text', NULL, true, true, true, false, true, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'category', 'Category', 'text', NULL, true, true, true, false, true, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'breed', 'Breed', 'text', NULL, true, true, true, false, true, NULL, 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'color_markings', 'Color/Markings', 'text', NULL, true, true, false, false, false, NULL, 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'ownership', 'Ownership', 'text', NULL, true, true, true, false, false, NULL, 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'birth_date', 'Birth Date', 'date', NULL, true, true, false, false, true, 'date', 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'death_date', 'Death Date', 'date', NULL, true, true, false, false, false, 'date', 90),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'purchase_date', 'Purchase Date', 'date', NULL, true, true, false, false, false, 'date', 100),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'purchase_price', 'Purchase Price', 'currency', NULL, true, true, false, true, false, 'currency', 110),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'sale_date', 'Sale Date', 'date', NULL, true, true, false, false, false, 'date', 120),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'sale_price', 'Sale Price', 'currency', NULL, true, true, false, true, false, 'currency', 130),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'sold_to', 'Sold To', 'text', NULL, true, true, true, false, false, NULL, 140),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'status', 'Status', 'enum', '["Active", "Sold", "Dead", "Reference", "Processed"]', true, true, true, false, true, NULL, 150),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'year_sold', 'Year Sold', 'number', NULL, true, true, true, false, false, NULL, 160),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'year_harvested', 'Year Harvested', 'number', NULL, true, true, true, false, false, NULL, 170),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'asset_class', 'Asset Class', 'text', NULL, true, true, true, false, false, NULL, 180),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'species', 'Species', 'text', NULL, true, true, true, false, false, NULL, 190),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'age_in_years', 'Age (Years)', 'number', NULL, true, true, false, true, true, 'decimal:1', 200),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'dam_ear_tag', 'Dam Ear Tag', 'text', NULL, true, true, false, false, false, NULL, 210),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'dam_name', 'Dam Name', 'text', NULL, true, true, false, false, false, NULL, 220),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'sire_ear_tag', 'Sire Ear Tag', 'text', NULL, true, true, false, false, false, NULL, 230),
((SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary'), 'sire_name', 'Sire Name', 'text', NULL, true, true, false, false, false, NULL, 240);

-- Active Herd (copy from herd_summary since it's a filtered view)
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order)
SELECT 
    (SELECT id FROM report_record_definitions WHERE record_name = 'active_herd'),
    field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order
FROM report_field_definitions
WHERE record_id = (SELECT id FROM report_record_definitions WHERE record_name = 'herd_summary');

-- Animal Health Records Fields
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_health_records'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_health_records'), 'animal_id', 'Animal ID', 'number', NULL, true, true, false, false, false, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_health_records'), 'record_date', 'Date', 'date', NULL, true, true, false, false, true, 'date', 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_health_records'), 'record_type', 'Type', 'text', NULL, true, true, true, false, true, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_health_records'), 'description', 'Description', 'text', NULL, true, true, false, false, true, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_health_records'), 'administered_by', 'Administered By', 'text', NULL, true, true, true, false, false, NULL, 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_health_records'), 'next_due_date', 'Next Due Date', 'date', NULL, true, true, false, false, false, 'date', 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_health_records'), 'notes', 'Notes', 'text', NULL, true, false, false, false, false, NULL, 70);

-- Animal Weights Fields
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_weights'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_weights'), 'animal_id', 'Animal ID', 'number', NULL, true, true, false, false, false, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_weights'), 'weight_date', 'Date', 'date', NULL, true, true, false, false, true, 'date', 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_weights'), 'weight_lbs', 'Weight (lbs)', 'number', NULL, true, true, false, true, true, 'decimal:1', 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_weights'), 'notes', 'Notes', 'text', NULL, true, false, false, false, false, NULL, 40);

-- Sale Ticket Summary Fields
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_summary'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_summary'), 'ticket_number', 'Ticket #', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_summary'), 'sale_date', 'Sale Date', 'date', NULL, true, true, false, false, true, 'date', 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_summary'), 'sold_to', 'Sold To', 'text', NULL, true, true, true, false, true, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_summary'), 'gross_amount', 'Gross Amount', 'currency', NULL, true, true, false, true, true, 'currency', 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_summary'), 'total_fees', 'Total Fees', 'currency', NULL, true, true, false, true, false, 'currency', 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_summary'), 'net_amount', 'Net Amount', 'currency', NULL, true, true, false, true, true, 'currency', 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_summary'), 'payment_received', 'Payment Received', 'boolean', NULL, true, true, true, false, true, NULL, 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_summary'), 'payment_date', 'Payment Date', 'date', NULL, true, true, false, false, false, 'date', 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_summary'), 'item_count', 'Line Items', 'number', NULL, true, true, false, true, false, NULL, 90),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_summary'), 'total_head', 'Total Head', 'number', NULL, true, true, false, true, true, NULL, 100);

-- Processing Records Summary Fields
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'processing_records_summary'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'processing_records_summary'), 'display_name', 'Animal/Herd', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'processing_records_summary'), 'record_type', 'Record Type', 'text', NULL, true, true, true, false, false, NULL, 15),
((SELECT id FROM report_record_definitions WHERE record_name = 'processing_records_summary'), 'processing_date', 'Processing Date', 'date', NULL, true, true, false, false, true, 'date', 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'processing_records_summary'), 'processor_name', 'Processor', 'text', NULL, true, true, true, false, true, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'processing_records_summary'), 'status', 'Status', 'enum', '["Pending", "At Processor", "Complete"]', true, true, true, false, true, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'processing_records_summary'), 'hanging_weight_lbs', 'Hanging Weight', 'number', NULL, true, true, false, true, false, 'decimal:1', 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'processing_records_summary'), 'packaged_weight_lbs', 'Packaged Weight', 'number', NULL, true, true, false, true, false, 'decimal:1', 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'processing_records_summary'), 'cost', 'Cost', 'currency', NULL, true, true, false, true, false, 'currency', 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'processing_records_summary'), 'completed_date', 'Completed Date', 'date', NULL, true, true, false, false, false, 'date', 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'processing_records_summary'), 'species', 'Species', 'text', NULL, true, true, true, false, false, NULL, 90);

-- Pasture Status Fields
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'pasture_status'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'pasture_status'), 'name', 'Pasture Name', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'pasture_status'), 'size_acres', 'Size (Acres)', 'number', NULL, true, true, false, true, true, 'decimal:2', 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'pasture_status'), 'productivity_rating', 'Productivity Rating', 'number', NULL, true, true, false, true, false, 'decimal:1', 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'pasture_status'), 'grazing_start', 'Current Grazing Start', 'date', NULL, true, true, false, false, false, 'date', 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'pasture_status'), 'initial_grass_height', 'Initial Grass Height', 'number', NULL, true, true, false, true, false, 'decimal:1', 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'pasture_status'), 'animal_count', 'Animal Count', 'number', NULL, true, true, false, true, true, NULL, 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'pasture_status'), 'last_soil_sample', 'Last Soil Sample', 'date', NULL, true, true, false, false, false, 'date', 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'pasture_status'), 'pending_tasks', 'Pending Tasks', 'number', NULL, true, true, false, true, true, NULL, 80);

-- Pastures Table Fields
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'name', 'Name', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'size_acres', 'Size (Acres)', 'number', NULL, true, true, false, true, true, 'decimal:2', 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'location', 'Location', 'text', NULL, true, true, false, false, false, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'productivity_rating', 'Productivity Rating', 'number', NULL, true, true, false, true, false, 'decimal:1', 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'is_active', 'Active', 'boolean', NULL, true, true, true, false, true, NULL, 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'notes', 'Notes', 'text', NULL, true, false, false, false, false, NULL, 60);

-- Rainfall Records Fields
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'rainfall_records'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'rainfall_records'), 'record_date', 'Date', 'date', NULL, true, true, false, false, true, 'date', 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'rainfall_records'), 'amount_inches', 'Amount (inches)', 'number', NULL, true, true, false, true, true, 'decimal:2', 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'rainfall_records'), 'notes', 'Notes', 'text', NULL, true, false, false, false, false, NULL, 30);

-- General Ledger Fields
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'general_ledger'), 'entry_date', 'Date', 'date', NULL, true, true, false, false, true, 'date', 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'general_ledger'), 'entry_number', 'Entry #', 'text', NULL, true, true, false, false, true, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'general_ledger'), 'entry_description', 'Entry Description', 'text', NULL, true, true, false, false, true, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'general_ledger'), 'account_code', 'Account Code', 'text', NULL, true, true, true, false, true, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'general_ledger'), 'account_name', 'Account Name', 'text', NULL, true, true, true, false, true, NULL, 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'general_ledger'), 'line_description', 'Line Description', 'text', NULL, true, false, false, false, false, NULL, 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'general_ledger'), 'debit', 'Debit', 'currency', NULL, true, true, false, true, true, 'currency', 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'general_ledger'), 'credit', 'Credit', 'currency', NULL, true, true, false, true, true, 'currency', 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'general_ledger'), 'status', 'Status', 'enum', '["draft", "posted", "void"]', true, true, true, false, false, NULL, 90);

-- Transactions Fields
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'transactions'), 'id', 'ID', 'text', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'transactions'), 'date', 'Date', 'date', NULL, true, true, false, false, true, 'date', 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'transactions'), 'type', 'Type', 'enum', '["income", "expense"]', true, true, true, false, true, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'transactions'), 'description', 'Description', 'text', NULL, true, true, false, false, true, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'transactions'), 'amount', 'Amount', 'currency', NULL, true, true, false, true, true, 'currency', 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'transactions'), 'vendor', 'Vendor', 'text', NULL, true, true, true, false, false, NULL, 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'transactions'), 'category', 'Category', 'text', NULL, true, true, true, false, false, NULL, 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'transactions'), 'reference', 'Reference', 'text', NULL, true, true, false, false, false, NULL, 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'transactions'), 'acceptance_status', 'Acceptance Status', 'enum', '["pending", "accepted", "excluded"]', true, true, true, false, false, NULL, 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'transactions'), 'source', 'Source', 'text', NULL, true, true, true, false, false, NULL, 90),
((SELECT id FROM report_record_definitions WHERE record_name = 'transactions'), 'is_reconciled', 'Reconciled', 'boolean', NULL, true, true, true, false, false, NULL, 100);

-- Vendors Fields
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'name', 'Name', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'display_name', 'Display Name', 'text', NULL, true, true, false, false, false, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'contact_name', 'Contact', 'text', NULL, true, true, false, false, false, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'email', 'Email', 'text', NULL, true, true, false, false, false, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'phone', 'Phone', 'text', NULL, true, false, false, false, false, NULL, 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'city', 'City', 'text', NULL, true, true, true, false, false, NULL, 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'state', 'State', 'text', NULL, true, true, true, false, false, NULL, 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'payment_terms', 'Payment Terms', 'text', NULL, true, true, true, false, false, NULL, 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'is_active', 'Active', 'boolean', NULL, true, true, true, false, true, NULL, 90);

-- Restaurant Orders Fields
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'id', 'ID', 'text', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'order_number', 'Order #', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'ticket_number', 'Ticket #', 'number', NULL, true, true, false, false, true, NULL, 15),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'customer_name', 'Customer', 'text', NULL, true, true, false, false, true, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'order_type', 'Order Type', 'enum', '["dine_in", "takeout", "delivery"]', true, true, true, false, false, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'subtotal', 'Subtotal', 'currency', NULL, true, true, false, true, false, 'currency', 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'tax_amount', 'Tax', 'currency', NULL, true, true, false, true, false, 'currency', 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'total', 'Total', 'currency', NULL, true, true, false, true, true, 'currency', 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'payment_method', 'Payment Method', 'enum', '["card", "cash", "split", "unpaid"]', true, true, true, false, false, NULL, 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'payment_status', 'Payment Status', 'enum', '["unpaid", "paid", "refunded"]', true, true, true, false, true, NULL, 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'status', 'Status', 'enum', '["entered", "in_process", "done", "complete", "cancelled"]', true, true, true, false, true, NULL, 90),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'created_at', 'Created At', 'datetime', NULL, true, true, false, false, true, 'datetime', 100);

-- Menu Items Fields
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'menu_items'), 'id', 'ID', 'text', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'menu_items'), 'name', 'Name', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'menu_items'), 'description', 'Description', 'text', NULL, true, false, false, false, false, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'menu_items'), 'price', 'Price', 'currency', NULL, true, true, false, true, true, 'currency', 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'menu_items'), 'category', 'Category', 'text', NULL, true, true, true, false, true, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'menu_items'), 'is_available', 'Available', 'boolean', NULL, true, true, true, false, true, NULL, 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'menu_items'), 'prep_time_minutes', 'Prep Time (min)', 'number', NULL, true, true, false, true, false, NULL, 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'menu_items'), 'is_vegetarian', 'Vegetarian', 'boolean', NULL, true, true, true, false, false, NULL, 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'menu_items'), 'is_vegan', 'Vegan', 'boolean', NULL, true, true, true, false, false, NULL, 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'menu_items'), 'is_gluten_free', 'Gluten Free', 'boolean', NULL, true, true, true, false, false, NULL, 90),
((SELECT id FROM report_record_definitions WHERE record_name = 'menu_items'), 'is_featured', 'Featured', 'boolean', NULL, true, true, true, false, false, NULL, 100);

-- Customer Summary Fields
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'customer_summary'), 'id', 'ID', 'text', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'customer_summary'), 'name', 'Name', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'customer_summary'), 'email', 'Email', 'text', NULL, true, true, false, false, true, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'customer_summary'), 'is_farm_member', 'Farm Member', 'boolean', NULL, true, true, true, false, true, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'customer_summary'), 'member_since', 'Member Since', 'date', NULL, true, true, false, false, false, 'date', 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'customer_summary'), 'delivery_zone', 'Delivery Zone', 'text', NULL, true, true, true, false, false, NULL, 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'customer_summary'), 'total_orders', 'Total Orders', 'number', NULL, true, true, false, true, true, NULL, 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'customer_summary'), 'lifetime_value', 'Lifetime Value', 'currency', NULL, true, true, false, true, true, 'currency', 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'customer_summary'), 'last_order_date', 'Last Order', 'datetime', NULL, true, true, false, false, false, 'datetime', 80);

-- Accounts Fields
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts'), 'id', 'ID', 'text', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts'), 'name', 'Name', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts'), 'email', 'Email', 'text', NULL, true, true, false, false, true, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts'), 'phone', 'Phone', 'text', NULL, true, false, false, false, false, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts'), 'city', 'City', 'text', NULL, true, true, true, false, false, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts'), 'state', 'State', 'text', NULL, true, true, true, false, false, NULL, 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts'), 'role', 'Role', 'enum', '["admin", "staff", "customer", "super_admin"]', true, true, true, false, true, NULL, 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts'), 'is_farm_member', 'Farm Member', 'boolean', NULL, true, true, true, false, true, NULL, 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts'), 'member_since', 'Member Since', 'date', NULL, true, true, false, false, false, 'date', 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts'), 'is_active', 'Active', 'boolean', NULL, true, true, true, false, true, NULL, 90),
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts'), 'created_at', 'Created At', 'datetime', NULL, true, true, false, false, false, 'datetime', 100);

-- eCommerce Orders Fields
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'id', 'ID', 'text', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'order_number', 'Order #', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'customer_name', 'Customer', 'text', NULL, true, true, false, false, true, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'customer_email', 'Email', 'text', NULL, true, true, false, false, false, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'status', 'Status', 'enum', '["pending", "confirmed", "processing", "ready", "delivered", "cancelled"]', true, true, true, false, true, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'subtotal', 'Subtotal', 'currency', NULL, true, true, false, true, false, 'currency', 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'tax_amount', 'Tax', 'currency', NULL, true, true, false, true, false, 'currency', 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'total', 'Total', 'currency', NULL, true, true, false, true, true, 'currency', 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'is_member_order', 'Member Order', 'boolean', NULL, true, true, true, false, false, NULL, 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'payment_status', 'Payment Status', 'text', NULL, true, true, true, false, true, NULL, 90),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'delivery_date', 'Delivery Date', 'date', NULL, true, true, false, false, false, 'date', 100),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'ordered_at', 'Ordered At', 'datetime', NULL, true, true, false, false, true, 'datetime', 110);

COMMIT;
