-- ============================================================================
-- HOOD FAMILY FARMS - REPORT BUILDER COMPLETE FIELD DEFINITIONS
-- Migration: 043_report_builder_all_fields.sql
-- Description: Populate field definitions for ALL record types
-- ============================================================================

-- ============================================================================
-- HERDS/FLOCKS
-- ============================================================================
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'herds'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'herds'), 'name', 'Name', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'herds'), 'species', 'Species', 'enum', '["cattle", "sheep", "goat", "poultry", "swine", "other"]', true, true, true, false, true, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'herds'), 'management_type', 'Management Type', 'enum', '["individual", "aggregate"]', true, true, true, false, false, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'herds'), 'animal_count', 'Animal Count', 'number', NULL, true, true, false, true, true, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'herds'), 'current_pasture_id', 'Pasture ID', 'number', NULL, true, true, true, false, false, NULL, 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'herds'), 'description', 'Description', 'text', NULL, true, false, false, false, false, NULL, 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'herds'), 'is_active', 'Active', 'boolean', NULL, true, true, true, false, true, NULL, 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'herds'), 'created_at', 'Created At', 'datetime', NULL, true, true, false, false, false, 'datetime', 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'herds'), 'updated_at', 'Updated At', 'datetime', NULL, true, true, false, false, false, 'datetime', 90)
ON CONFLICT (record_id, field_name) DO NOTHING;

-- ============================================================================
-- PASTURES
-- ============================================================================
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'name', 'Name', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'size_acres', 'Size (Acres)', 'number', NULL, true, true, false, true, true, 'decimal:2', 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'location', 'Location', 'text', NULL, true, true, false, false, false, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'latitude', 'Latitude', 'number', NULL, false, false, false, false, false, 'decimal:6', 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'longitude', 'Longitude', 'number', NULL, false, false, false, false, false, 'decimal:6', 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'productivity_rating', 'Productivity Rating', 'number', NULL, true, true, false, true, false, 'decimal:2', 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'notes', 'Notes', 'text', NULL, true, false, false, false, false, NULL, 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'is_active', 'Active', 'boolean', NULL, true, true, true, false, true, NULL, 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'created_at', 'Created At', 'datetime', NULL, true, true, false, false, false, 'datetime', 90),
((SELECT id FROM report_record_definitions WHERE record_name = 'pastures'), 'updated_at', 'Updated At', 'datetime', NULL, true, true, false, false, false, 'datetime', 100)
ON CONFLICT (record_id, field_name) DO NOTHING;

-- ============================================================================
-- ANIMAL WEIGHTS
-- ============================================================================
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_weights'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_weights'), 'animal_id', 'Animal ID', 'number', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_weights'), 'weight_date', 'Weight Date', 'date', NULL, true, true, false, false, true, 'date', 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_weights'), 'weight_lbs', 'Weight (lbs)', 'number', NULL, true, true, false, true, true, 'decimal:1', 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_weights'), 'notes', 'Notes', 'text', NULL, true, false, false, false, false, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_weights'), 'created_at', 'Created At', 'datetime', NULL, true, true, false, false, false, 'datetime', 50)
ON CONFLICT (record_id, field_name) DO NOTHING;

-- ============================================================================
-- RAINFALL RECORDS
-- ============================================================================
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'rainfall_records'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'rainfall_records'), 'record_date', 'Date', 'date', NULL, true, true, false, false, true, 'date', 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'rainfall_records'), 'amount_inches', 'Amount (inches)', 'number', NULL, true, true, false, true, true, 'decimal:2', 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'rainfall_records'), 'notes', 'Notes', 'text', NULL, true, false, false, false, false, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'rainfall_records'), 'created_at', 'Created At', 'datetime', NULL, true, true, false, false, false, 'datetime', 40)
ON CONFLICT (record_id, field_name) DO NOTHING;

-- ============================================================================
-- SALE TICKETS
-- ============================================================================
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_tickets'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_tickets'), 'ticket_number', 'Ticket #', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_tickets'), 'sale_date', 'Sale Date', 'date', NULL, true, true, false, false, true, 'date', 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_tickets'), 'buyer_name', 'Buyer', 'text', NULL, true, true, true, false, true, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_tickets'), 'sale_location', 'Sale Location', 'text', NULL, true, true, true, false, false, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_tickets'), 'sale_type', 'Sale Type', 'text', NULL, true, true, true, false, false, NULL, 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_tickets'), 'gross_amount', 'Gross Amount', 'currency', NULL, true, true, false, true, true, 'currency', 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_tickets'), 'total_fees', 'Total Fees', 'currency', NULL, true, true, false, true, false, 'currency', 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_tickets'), 'net_amount', 'Net Amount', 'currency', NULL, true, true, false, true, true, 'currency', 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_tickets'), 'notes', 'Notes', 'text', NULL, true, false, false, false, false, NULL, 90),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_tickets'), 'created_at', 'Created At', 'datetime', NULL, true, true, false, false, false, 'datetime', 100)
ON CONFLICT (record_id, field_name) DO NOTHING;

-- ============================================================================
-- SALE TICKET ITEMS
-- ============================================================================
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_items'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_items'), 'sale_ticket_id', 'Sale Ticket ID', 'number', NULL, true, true, false, false, false, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_items'), 'animal_id', 'Animal ID', 'number', NULL, true, true, false, false, false, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_items'), 'ear_tag', 'Ear Tag', 'text', NULL, true, true, false, false, true, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_items'), 'animal_name', 'Animal Name', 'text', NULL, true, true, false, false, false, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_items'), 'animal_type', 'Animal Type', 'text', NULL, true, true, true, false, true, NULL, 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_items'), 'weight_lbs', 'Weight (lbs)', 'number', NULL, true, true, false, true, true, 'decimal:1', 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_items'), 'price_per_lb', 'Price/lb', 'currency', NULL, true, true, false, true, false, 'currency', 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_items'), 'head_price', 'Head Price', 'currency', NULL, true, true, false, true, false, 'currency', 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_items'), 'line_total', 'Line Total', 'currency', NULL, true, true, false, true, true, 'currency', 90),
((SELECT id FROM report_record_definitions WHERE record_name = 'sale_ticket_items'), 'notes', 'Notes', 'text', NULL, true, false, false, false, false, NULL, 100)
ON CONFLICT (record_id, field_name) DO NOTHING;

-- ============================================================================
-- RESTAURANT ORDERS
-- ============================================================================
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'id', 'ID', 'text', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'order_number', 'Order #', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'ticket_number', 'Ticket #', 'number', NULL, true, true, false, false, true, NULL, 15),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'customer_name', 'Customer', 'text', NULL, true, true, false, false, true, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'customer_phone', 'Phone', 'text', NULL, true, false, false, false, false, NULL, 25),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'order_type', 'Order Type', 'enum', '["dine_in", "takeout", "delivery"]', true, true, true, false, false, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'subtotal', 'Subtotal', 'currency', NULL, true, true, false, true, false, 'currency', 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'tax_amount', 'Tax', 'currency', NULL, true, true, false, true, false, 'currency', 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'total', 'Total', 'currency', NULL, true, true, false, true, true, 'currency', 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'payment_method', 'Payment Method', 'enum', '["card", "cash", "split", "unpaid"]', true, true, true, false, false, NULL, 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'payment_status', 'Payment Status', 'enum', '["unpaid", "paid", "refunded"]', true, true, true, false, true, NULL, 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'status', 'Status', 'enum', '["entered", "in_process", "done", "complete", "cancelled"]', true, true, true, false, true, NULL, 90),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_orders'), 'created_at', 'Created At', 'datetime', NULL, true, true, false, false, true, 'datetime', 100)
ON CONFLICT (record_id, field_name) DO NOTHING;

-- ============================================================================
-- RESTAURANT ORDER ITEMS
-- ============================================================================
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_order_items'), 'id', 'ID', 'text', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_order_items'), 'order_id', 'Order ID', 'text', NULL, true, true, false, false, false, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_order_items'), 'menu_item_id', 'Menu Item ID', 'text', NULL, true, true, false, false, false, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_order_items'), 'item_name', 'Item Name', 'text', NULL, true, true, false, false, true, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_order_items'), 'quantity', 'Quantity', 'number', NULL, true, true, false, true, true, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_order_items'), 'unit_price', 'Unit Price', 'currency', NULL, true, true, false, true, true, 'currency', 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_order_items'), 'line_total', 'Line Total', 'currency', NULL, true, true, false, true, true, 'currency', 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_order_items'), 'notes', 'Notes', 'text', NULL, true, false, false, false, false, NULL, 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'restaurant_order_items'), 'status', 'Status', 'enum', '["pending", "preparing", "ready", "delivered", "cancelled"]', true, true, true, false, true, NULL, 80)
ON CONFLICT (record_id, field_name) DO NOTHING;

-- ============================================================================
-- VENDORS
-- ============================================================================
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'name', 'Name', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'display_name', 'Display Name', 'text', NULL, true, true, false, false, false, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'contact_name', 'Contact', 'text', NULL, true, true, false, false, false, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'email', 'Email', 'text', NULL, true, true, false, false, false, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'phone', 'Phone', 'text', NULL, true, false, false, false, false, NULL, 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'address', 'Address', 'text', NULL, true, false, false, false, false, NULL, 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'city', 'City', 'text', NULL, true, true, true, false, false, NULL, 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'state', 'State', 'text', NULL, true, true, true, false, false, NULL, 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'zip_code', 'Zip Code', 'text', NULL, true, true, false, false, false, NULL, 90),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'payment_terms', 'Payment Terms', 'text', NULL, true, true, true, false, false, NULL, 100),
((SELECT id FROM report_record_definitions WHERE record_name = 'vendors'), 'is_active', 'Active', 'boolean', NULL, true, true, true, false, true, NULL, 110)
ON CONFLICT (record_id, field_name) DO NOTHING;

-- ============================================================================
-- ACCOUNTS (Users/Customers)
-- ============================================================================
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
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts'), 'created_at', 'Created At', 'datetime', NULL, true, true, false, false, false, 'datetime', 100)
ON CONFLICT (record_id, field_name) DO NOTHING;

-- ============================================================================
-- ORDERS (Ecommerce)
-- ============================================================================
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'id', 'ID', 'text', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'order_number', 'Order #', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'customer_name', 'Customer', 'text', NULL, true, true, false, false, true, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'customer_email', 'Email', 'text', NULL, true, true, false, false, false, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'status', 'Status', 'enum', '["pending", "confirmed", "processing", "ready", "delivered", "cancelled"]', true, true, true, false, true, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'subtotal', 'Subtotal', 'currency', NULL, true, true, false, true, false, 'currency', 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'tax_amount', 'Tax', 'currency', NULL, true, true, false, true, false, 'currency', 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'total', 'Total', 'currency', NULL, true, true, false, true, true, 'currency', 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'payment_status', 'Payment Status', 'text', NULL, true, true, true, false, true, NULL, 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'delivery_date', 'Delivery Date', 'date', NULL, true, true, false, false, false, 'date', 90),
((SELECT id FROM report_record_definitions WHERE record_name = 'orders'), 'created_at', 'Ordered At', 'datetime', NULL, true, true, false, false, true, 'datetime', 100)
ON CONFLICT (record_id, field_name) DO NOTHING;

-- ============================================================================
-- CHART OF ACCOUNTS
-- ============================================================================
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts_chart'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts_chart'), 'account_code', 'Account Code', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts_chart'), 'name', 'Name', 'text', NULL, true, true, false, false, true, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts_chart'), 'account_type', 'Account Type', 'enum', '["asset", "liability", "equity", "revenue", "expense"]', true, true, true, false, true, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts_chart'), 'description', 'Description', 'text', NULL, true, false, false, false, false, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'accounts_chart'), 'is_active', 'Active', 'boolean', NULL, true, true, true, false, true, NULL, 50)
ON CONFLICT (record_id, field_name) DO NOTHING;

-- ============================================================================
-- JOURNAL ENTRIES
-- ============================================================================
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'journal_entries'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'journal_entries'), 'entry_number', 'Entry #', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'journal_entries'), 'entry_date', 'Entry Date', 'date', NULL, true, true, false, false, true, 'date', 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'journal_entries'), 'description', 'Description', 'text', NULL, true, true, false, false, true, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'journal_entries'), 'status', 'Status', 'enum', '["draft", "posted", "void"]', true, true, true, false, true, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'journal_entries'), 'created_at', 'Created At', 'datetime', NULL, true, true, false, false, false, 'datetime', 50)
ON CONFLICT (record_id, field_name) DO NOTHING;

-- ============================================================================
-- JOURNAL LINES
-- ============================================================================
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'journal_lines'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'journal_lines'), 'journal_entry_id', 'Journal Entry ID', 'number', NULL, true, true, false, false, false, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'journal_lines'), 'account_id', 'Account ID', 'number', NULL, true, true, false, false, false, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'journal_lines'), 'description', 'Description', 'text', NULL, true, true, false, false, true, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'journal_lines'), 'debit', 'Debit', 'currency', NULL, true, true, false, true, true, 'currency', 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'journal_lines'), 'credit', 'Credit', 'currency', NULL, true, true, false, true, true, 'currency', 50)
ON CONFLICT (record_id, field_name) DO NOTHING;

-- ============================================================================
-- MENUS
-- ============================================================================
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'menus'), 'id', 'ID', 'text', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'menus'), 'name', 'Name', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'menus'), 'description', 'Description', 'text', NULL, true, false, false, false, false, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'menus'), 'is_active', 'Active', 'boolean', NULL, true, true, true, false, true, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'menus'), 'created_at', 'Created At', 'datetime', NULL, true, true, false, false, false, 'datetime', 40)
ON CONFLICT (record_id, field_name) DO NOTHING;

-- Done!
