-- ============================================================================
-- HOOD FAMILY FARMS - REPORT BUILDER FIX
-- Migration: 042_animals_field_definitions.sql
-- Description: Add missing record and field definitions for the animals table
-- ============================================================================

-- ============================================================================
-- STEP 1: Ensure the parent record definitions exist
-- ============================================================================

INSERT INTO report_record_definitions (record_name, display_name, description, source_type, source_name, category, is_tenant_filtered, tenant_id_column, sort_order, is_active)
VALUES 
    ('animals', 'Animals (Raw)', 'Raw animal records without computed fields', 'table', 'animals', 'livestock', true, 'tenant_id', 30, true),
    ('animal_sales', 'Animal Sales', 'Historical sale records for individual animals', 'table', 'animal_sales', 'livestock', true, 'tenant_id', 60, true)
ON CONFLICT (record_name) DO NOTHING;

-- ============================================================================
-- STEP 2: Animals (Raw) Table Fields
-- ============================================================================

INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'ear_tag', 'Ear Tag', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'name', 'Name', 'text', NULL, true, true, false, false, true, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'animal_type_id', 'Animal Type ID', 'number', NULL, true, true, true, false, false, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'category_id', 'Category ID', 'number', NULL, true, true, true, false, false, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'breed_id', 'Breed ID', 'number', NULL, true, true, true, false, false, NULL, 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'color_markings', 'Color/Markings', 'text', NULL, true, true, false, false, false, NULL, 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'dam_id', 'Dam ID', 'number', NULL, true, true, false, false, false, NULL, 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'sire_id', 'Sire ID', 'number', NULL, true, true, false, false, false, NULL, 80),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'owner_id', 'Owner ID', 'number', NULL, true, true, true, false, false, NULL, 90),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'birth_date', 'Birth Date', 'date', NULL, true, true, false, false, true, 'date', 100),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'death_date', 'Death Date', 'date', NULL, true, true, false, false, false, 'date', 110),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'purchase_date', 'Purchase Date', 'date', NULL, true, true, false, false, false, 'date', 120),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'purchase_price', 'Purchase Price', 'currency', NULL, true, true, false, true, false, 'currency', 130),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'current_pasture_id', 'Pasture ID', 'number', NULL, true, true, true, false, false, NULL, 140),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'status', 'Status', 'enum', '["Active", "Sold", "Dead", "Reference"]', true, true, true, false, true, NULL, 150),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'notes', 'Notes', 'text', NULL, true, false, false, false, false, NULL, 160),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'herd_id', 'Herd ID', 'number', NULL, true, true, true, false, false, NULL, 165),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'created_at', 'Created At', 'datetime', NULL, true, true, false, false, false, 'datetime', 170),
((SELECT id FROM report_record_definitions WHERE record_name = 'animals'), 'updated_at', 'Updated At', 'datetime', NULL, true, true, false, false, false, 'datetime', 180)
ON CONFLICT (record_id, field_name) DO NOTHING;

-- ============================================================================
-- STEP 3: Animal Sales Table Fields
-- ============================================================================

INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_sales'), 'id', 'ID', 'number', NULL, false, false, false, false, false, NULL, 5),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_sales'), 'animal_id', 'Animal ID', 'number', NULL, true, true, false, false, false, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_sales'), 'sale_date', 'Sale Date', 'date', NULL, true, true, false, false, true, 'date', 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_sales'), 'sale_price', 'Sale Price', 'currency', NULL, true, true, false, true, true, 'currency', 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_sales'), 'sold_to', 'Sold To', 'text', NULL, true, true, true, false, true, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_sales'), 'notes', 'Notes', 'text', NULL, true, false, false, false, false, NULL, 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_sales'), 'created_at', 'Created At', 'datetime', NULL, true, true, false, false, false, 'datetime', 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'animal_sales'), 'updated_at', 'Updated At', 'datetime', NULL, true, true, false, false, false, 'datetime', 70)
ON CONFLICT (record_id, field_name) DO NOTHING;
