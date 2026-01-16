-- ============================================================================
-- PROCESSING RECORDS
-- Track animals/herds sent to processor
-- ============================================================================

-- Create processing status enum
DO $$
BEGIN
    CREATE TYPE processing_status AS ENUM ('Pending', 'At Processor', 'Complete');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add 'Processed' to animal_status enum if not exists
DO $$
BEGIN
    ALTER TYPE animal_status ADD VALUE IF NOT EXISTS 'Processed';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Processing Records table
CREATE TABLE IF NOT EXISTS processing_records (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    
    -- Either animal OR herd, not both
    animal_id INTEGER REFERENCES animals(id) ON DELETE SET NULL,
    herd_id INTEGER REFERENCES herds_flocks(id) ON DELETE SET NULL,
    
    -- Processing details
    processing_date DATE NOT NULL,
    processor_name VARCHAR(200),
    status processing_status NOT NULL DEFAULT 'Pending',
    
    -- Additional info
    notes TEXT,
    completed_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: must have animal OR herd, not both, not neither
    CONSTRAINT chk_animal_or_herd CHECK (
        (animal_id IS NOT NULL AND herd_id IS NULL) OR
        (animal_id IS NULL AND herd_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_processing_records_tenant ON processing_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_processing_records_animal ON processing_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_processing_records_herd ON processing_records(herd_id);
CREATE INDEX IF NOT EXISTS idx_processing_records_status ON processing_records(status);
CREATE INDEX IF NOT EXISTS idx_processing_records_date ON processing_records(processing_date);

-- Trigger to update timestamps
DROP TRIGGER IF EXISTS update_processing_records_updated_at ON processing_records;
CREATE TRIGGER update_processing_records_updated_at 
    BEFORE UPDATE ON processing_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for processing records with animal/herd details
CREATE OR REPLACE VIEW processing_records_summary AS
SELECT 
    pr.id,
    pr.tenant_id,
    pr.animal_id,
    pr.herd_id,
    pr.processing_date,
    pr.processor_name,
    pr.status,
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

COMMENT ON TABLE processing_records IS 'Track animals or herds sent for processing';
COMMENT ON CONSTRAINT chk_animal_or_herd ON processing_records IS 'Either animal_id OR herd_id must be set, not both';
