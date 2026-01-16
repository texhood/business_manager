-- ============================================================================
-- ADD MISSING COLUMNS TO PROCESSING_RECORDS
-- Adds processor_contact, hanging_weight_lbs, packaged_weight_lbs, cost
-- ============================================================================

-- Add processor_contact column
ALTER TABLE processing_records 
ADD COLUMN IF NOT EXISTS processor_contact TEXT;

-- Add hanging_weight_lbs column
ALTER TABLE processing_records 
ADD COLUMN IF NOT EXISTS hanging_weight_lbs DECIMAL(10,2);

-- Add packaged_weight_lbs column
ALTER TABLE processing_records 
ADD COLUMN IF NOT EXISTS packaged_weight_lbs DECIMAL(10,2);

-- Add cost column
ALTER TABLE processing_records 
ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2);

-- Drop the existing view first (required when changing column structure)
DROP VIEW IF EXISTS processing_records_summary;

-- Recreate the view with new columns
CREATE VIEW processing_records_summary AS
SELECT 
    pr.id,
    pr.tenant_id,
    pr.animal_id,
    pr.herd_id,
    pr.processing_date,
    pr.processor_name,
    pr.processor_contact,
    pr.status,
    pr.hanging_weight_lbs,
    pr.packaged_weight_lbs,
    pr.cost,
    pr.notes,
    pr.completed_date,
    pr.created_at,
    pr.updated_at,
    -- Animal details
    a.ear_tag AS animal_ear_tag,
    a.name AS animal_name,
    at.species AS animal_species,
    -- Herd details
    hf.name AS herd_name,
    hf.species AS herd_species,
    CASE 
        WHEN hf.management_mode = 'aggregate' THEN hf.animal_count
        ELSE (SELECT COUNT(*) FROM animals ha WHERE ha.herd_id = hf.id AND ha.status = 'Active')
    END AS herd_animal_count,
    -- Combined display
    COALESCE(a.ear_tag, hf.name) AS display_name,
    CASE 
        WHEN a.id IS NOT NULL THEN 'animal'
        ELSE 'herd'
    END AS record_type,
    COALESCE(at.species::text, hf.species::text) AS species
FROM processing_records pr
LEFT JOIN animals a ON pr.animal_id = a.id
LEFT JOIN animal_types at ON a.animal_type_id = at.id
LEFT JOIN herds_flocks hf ON pr.herd_id = hf.id;

COMMENT ON COLUMN processing_records.processor_contact IS 'Contact info (phone, email) for the processor';
COMMENT ON COLUMN processing_records.hanging_weight_lbs IS 'Hanging/carcass weight in pounds';
COMMENT ON COLUMN processing_records.packaged_weight_lbs IS 'Final packaged weight in pounds';
COMMENT ON COLUMN processing_records.cost IS 'Total processing cost';
