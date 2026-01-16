-- ============================================================================
-- FIX HERDS_FLOCKS TABLE SCHEMA
-- Corrects species column to use herd_species enum (lowercase)
-- ============================================================================

-- First, ensure herd_species enum exists with lowercase values
DO $$
BEGIN
    CREATE TYPE herd_species AS ENUM ('cattle', 'sheep', 'goat', 'poultry', 'swine', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop the dependent view first
DROP VIEW IF EXISTS herd_flock_summary;

-- Check if species column uses wrong enum type (animal_species) and fix it
DO $$
DECLARE
    current_type text;
BEGIN
    -- Get the current type of the species column
    SELECT udt_name INTO current_type
    FROM information_schema.columns
    WHERE table_name = 'herds_flocks' AND column_name = 'species';
    
    RAISE NOTICE 'Current species column type: %', current_type;
    
    -- If it's using animal_species instead of herd_species, fix it
    IF current_type = 'animal_species' THEN
        -- Add temp column with correct type
        ALTER TABLE herds_flocks ADD COLUMN species_new herd_species DEFAULT 'cattle';
        
        -- Copy data, converting from capitalized to lowercase
        UPDATE herds_flocks SET species_new = 
            CASE species::text
                WHEN 'Cattle' THEN 'cattle'::herd_species
                WHEN 'Sheep' THEN 'sheep'::herd_species
                WHEN 'Goat' THEN 'goat'::herd_species
                WHEN 'Poultry' THEN 'poultry'::herd_species
                WHEN 'Guard Dog' THEN 'other'::herd_species
                WHEN 'Other' THEN 'other'::herd_species
                ELSE 'cattle'::herd_species
            END;
        
        -- Drop old column
        ALTER TABLE herds_flocks DROP COLUMN species;
        
        -- Rename new column
        ALTER TABLE herds_flocks RENAME COLUMN species_new TO species;
        
        -- Set not null constraint
        ALTER TABLE herds_flocks ALTER COLUMN species SET NOT NULL;
        ALTER TABLE herds_flocks ALTER COLUMN species SET DEFAULT 'cattle';
        
        RAISE NOTICE 'Fixed species column type from animal_species to herd_species';
    ELSE
        RAISE NOTICE 'Species column type is: % (no change needed if herd_species)', current_type;
    END IF;
END $$;

-- Recreate the view with correct column type
CREATE OR REPLACE VIEW herd_flock_summary AS
SELECT 
    hf.id,
    hf.tenant_id,
    hf.name,
    hf.species,
    hf.management_mode,
    hf.description,
    hf.is_active,
    p.name AS pasture_name,
    CASE 
        WHEN hf.management_mode = 'aggregate' THEN hf.animal_count
        ELSE (SELECT COUNT(*) FROM animals a WHERE a.herd_id = hf.id AND a.status = 'Active')
    END AS current_count,
    CASE 
        WHEN hf.management_mode = 'individual' THEN 
            (SELECT COUNT(*) FROM animals a WHERE a.herd_id = hf.id)
        ELSE NULL
    END AS total_animals_ever
FROM herds_flocks hf
LEFT JOIN pastures p ON hf.current_pasture_id = p.id;

-- Verify final structure
DO $$
DECLARE
    col_info RECORD;
BEGIN
    RAISE NOTICE '--- Final herds_flocks species column ---';
    SELECT column_name, udt_name INTO col_info
    FROM information_schema.columns
    WHERE table_name = 'herds_flocks' AND column_name = 'species';
    
    RAISE NOTICE 'Column: %, Type: %', col_info.column_name, col_info.udt_name;
END $$;
