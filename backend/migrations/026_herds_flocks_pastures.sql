-- ============================================================================
-- HERDS, FLOCKS & PASTURES MODULE
-- PostgreSQL Migration for livestock and pasture management
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE animal_status AS ENUM ('Active', 'Sold', 'Dead', 'Reference');
CREATE TYPE animal_species AS ENUM ('Cattle', 'Sheep', 'Goat', 'Poultry', 'Guard Dog', 'Other');
CREATE TYPE treatment_type AS ENUM ('chemical', 'mechanical');

-- ============================================================================
-- LOOKUP TABLES
-- ============================================================================

-- Animal Types (Cow, Calf, Bull, etc.)
CREATE TABLE animal_types (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    name VARCHAR(50) NOT NULL,
    species animal_species NOT NULL DEFAULT 'Cattle',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

-- Breeds
CREATE TABLE breeds (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    name VARCHAR(100) NOT NULL,
    species animal_species NOT NULL DEFAULT 'Cattle',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

-- Animal Categories (Breeders, For Sale, Harvested, etc.)
CREATE TABLE animal_categories (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

-- Owners (for tracking ownership/shares)
CREATE TABLE animal_owners (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    name VARCHAR(100) NOT NULL,
    contact_info TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

-- Insert default animal types
INSERT INTO animal_types (name, species, description) VALUES
    ('Cow', 'Cattle', 'Adult female bovine'),
    ('Bull', 'Cattle', 'Adult male bovine'),
    ('Calf', 'Cattle', 'Young bovine'),
    ('Heifer', 'Cattle', 'Young female bovine that has not calved'),
    ('Steer', 'Cattle', 'Castrated male bovine'),
    ('Ewe', 'Sheep', 'Adult female sheep'),
    ('Ram', 'Sheep', 'Adult male sheep'),
    ('Lamb', 'Sheep', 'Young sheep'),
    ('Doe', 'Goat', 'Adult female goat'),
    ('Buck', 'Goat', 'Adult male goat'),
    ('Kid', 'Goat', 'Young goat'),
    ('Guard Dog', 'Guard Dog', 'Livestock guardian dog');

-- Insert default categories
INSERT INTO animal_categories (name, description) VALUES
    ('Breeders', 'Breeding stock'),
    ('For sale', 'Available for sale'),
    ('Harvested', 'Processed for meat'),
    ('Dead', 'Deceased'),
    ('purchased', 'Acquired through purchase'),
    ('Rented', 'Temporarily on premises');

-- Insert default breeds
INSERT INTO breeds (name, species) VALUES
    ('Angus', 'Cattle'),
    ('Hereford', 'Cattle'),
    ('Angus x Hereford', 'Cattle'),
    ('Angus x Charolais', 'Cattle'),
    ('Angus x Hereford x Mashona', 'Cattle'),
    ('Brangus', 'Cattle'),
    ('Charolais', 'Cattle'),
    ('Mashona', 'Cattle'),
    ('Angus-Mashona', 'Cattle'),
    ('Katahdin', 'Sheep'),
    ('Boer', 'Goat'),
    ('Spanish', 'Goat'),
    ('Great Pyrenees', 'Guard Dog'),
    ('Anatolian Shepherd', 'Guard Dog');

-- ============================================================================
-- PASTURES
-- ============================================================================

CREATE TABLE pastures (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    name VARCHAR(100) NOT NULL,
    size_acres NUMERIC(10, 2),
    location VARCHAR(255),
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    map_url TEXT,
    productivity_rating NUMERIC(5, 2),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

CREATE INDEX idx_pastures_tenant ON pastures(tenant_id);

-- ============================================================================
-- ANIMALS
-- ============================================================================

CREATE TABLE animals (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    
    -- Identification
    ear_tag VARCHAR(50) NOT NULL,
    name VARCHAR(100),
    
    -- Classification
    animal_type_id INTEGER REFERENCES animal_types(id),
    category_id INTEGER REFERENCES animal_categories(id),
    breed_id INTEGER REFERENCES breeds(id),
    color_markings VARCHAR(100),
    
    -- Lineage (self-referential)
    dam_id INTEGER REFERENCES animals(id) ON DELETE SET NULL,
    sire_id INTEGER REFERENCES animals(id) ON DELETE SET NULL,
    
    -- Ownership
    owner_id INTEGER REFERENCES animal_owners(id),
    
    -- Important Dates
    birth_date DATE,
    death_date DATE,
    purchase_date DATE,
    
    -- Financial
    purchase_price NUMERIC(12, 2),
    
    -- Current Pasture
    current_pasture_id INTEGER REFERENCES pastures(id) ON DELETE SET NULL,
    
    -- Status
    status animal_status DEFAULT 'Active',
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_animals_tenant ON animals(tenant_id);
CREATE INDEX idx_animals_ear_tag ON animals(tenant_id, ear_tag);
CREATE INDEX idx_animals_status ON animals(tenant_id, status);
CREATE INDEX idx_animals_type ON animals(animal_type_id);
CREATE INDEX idx_animals_category ON animals(category_id);
CREATE INDEX idx_animals_dam ON animals(dam_id);
CREATE INDEX idx_animals_sire ON animals(sire_id);
CREATE INDEX idx_animals_pasture ON animals(current_pasture_id);

-- ============================================================================
-- ANIMAL SALES
-- ============================================================================

CREATE TABLE animal_sales (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    animal_id INTEGER REFERENCES animals(id) ON DELETE CASCADE,
    
    -- Sale Details
    sale_date DATE NOT NULL,
    sale_price NUMERIC(12, 2),
    sold_to VARCHAR(200),
    
    -- For record keeping
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_animal_sales_tenant ON animal_sales(tenant_id);
CREATE INDEX idx_animal_sales_animal ON animal_sales(animal_id);
CREATE INDEX idx_animal_sales_date ON animal_sales(sale_date);

-- ============================================================================
-- ANIMAL WEIGHTS (for tracking growth)
-- ============================================================================

CREATE TABLE animal_weights (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    weight_date DATE NOT NULL,
    weight_lbs NUMERIC(8, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_animal_weights_tenant ON animal_weights(tenant_id);
CREATE INDEX idx_animal_weights_animal ON animal_weights(animal_id);

-- ============================================================================
-- ANIMAL HEALTH RECORDS
-- ============================================================================

CREATE TABLE animal_health_records (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    record_type VARCHAR(50) NOT NULL, -- vaccination, treatment, illness, checkup
    description TEXT NOT NULL,
    administered_by VARCHAR(100),
    next_due_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_animal_health_tenant ON animal_health_records(tenant_id);
CREATE INDEX idx_animal_health_animal ON animal_health_records(animal_id);

-- ============================================================================
-- PASTURE GRAZING EVENTS
-- ============================================================================

CREATE TABLE pasture_grazing_events (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    pasture_id INTEGER NOT NULL REFERENCES pastures(id) ON DELETE CASCADE,
    
    start_date DATE NOT NULL,
    end_date DATE,
    initial_grass_height NUMERIC(6, 2),
    final_grass_height NUMERIC(6, 2),
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_grazing_events_tenant ON pasture_grazing_events(tenant_id);
CREATE INDEX idx_grazing_events_pasture ON pasture_grazing_events(pasture_id);

-- Animals in grazing event (which animals were in this pasture during this event)
CREATE TABLE grazing_event_animals (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    grazing_event_id INTEGER NOT NULL REFERENCES pasture_grazing_events(id) ON DELETE CASCADE,
    animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    UNIQUE(grazing_event_id, animal_id)
);

-- ============================================================================
-- PASTURE SOIL SAMPLES
-- ============================================================================

CREATE TABLE pasture_soil_samples (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    pasture_id INTEGER NOT NULL REFERENCES pastures(id) ON DELETE CASCADE,
    
    sample_id VARCHAR(100) NOT NULL,
    sample_date DATE NOT NULL,
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_soil_samples_tenant ON pasture_soil_samples(tenant_id);
CREATE INDEX idx_soil_samples_pasture ON pasture_soil_samples(pasture_id);

-- ============================================================================
-- PASTURE NUTRIENTS (linked to soil samples)
-- ============================================================================

CREATE TABLE pasture_nutrients (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    soil_sample_id INTEGER NOT NULL REFERENCES pasture_soil_samples(id) ON DELETE CASCADE,
    
    nutrient VARCHAR(50) NOT NULL, -- pH, N, P, K, etc.
    target_level NUMERIC(10, 4),
    actual_level NUMERIC(10, 4),
    unit VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nutrients_sample ON pasture_nutrients(soil_sample_id);

-- ============================================================================
-- PASTURE TASKS
-- ============================================================================

CREATE TABLE pasture_tasks (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    pasture_id INTEGER NOT NULL REFERENCES pastures(id) ON DELETE CASCADE,
    
    task_description TEXT NOT NULL,
    due_date DATE,
    completed_date DATE,
    is_completed BOOLEAN DEFAULT false,
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pasture_tasks_tenant ON pasture_tasks(tenant_id);
CREATE INDEX idx_pasture_tasks_pasture ON pasture_tasks(pasture_id);
CREATE INDEX idx_pasture_tasks_completed ON pasture_tasks(is_completed);

-- ============================================================================
-- PASTURE TREATMENTS
-- ============================================================================

CREATE TABLE pasture_treatments (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    pasture_id INTEGER NOT NULL REFERENCES pastures(id) ON DELETE CASCADE,
    
    treatment_date DATE NOT NULL,
    treatment_type treatment_type NOT NULL,
    treatment_description VARCHAR(200),
    
    -- Chemical details
    chemical_used VARCHAR(200),
    application_rate NUMERIC(10, 4),
    application_rate_unit VARCHAR(20),
    
    -- Mechanical details
    equipment_used VARCHAR(200),
    fuel_used NUMERIC(10, 2),
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_treatments_tenant ON pasture_treatments(tenant_id);
CREATE INDEX idx_treatments_pasture ON pasture_treatments(pasture_id);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Herd Summary View (replaces the MariaDB herd_history view)
CREATE OR REPLACE VIEW herd_summary AS
SELECT 
    a.id,
    a.tenant_id,
    a.ear_tag,
    a.name,
    at.name AS animal_type,
    ac.name AS category,
    b.name AS breed,
    a.color_markings,
    ao.name AS ownership,
    a.birth_date,
    a.death_date,
    a.purchase_date,
    a.purchase_price,
    s.sale_date,
    s.sale_price,
    s.sold_to,
    a.status,
    EXTRACT(YEAR FROM s.sale_date)::INTEGER AS year_sold,
    CASE 
        WHEN ac.name = 'Harvested' THEN EXTRACT(YEAR FROM a.death_date)::INTEGER 
        ELSE NULL 
    END AS year_harvested,
    CASE 
        WHEN ac.name = 'Breeders' AND a.status = 'Active' THEN 'Current Asset'
        WHEN ac.name = 'Breeders' AND a.status != 'Active' THEN 'Retired Asset'
        WHEN ac.name != 'Breeders' AND a.status = 'Active' THEN 'Inventory'
        WHEN ac.name != 'Breeders' AND a.status != 'Active' THEN 'Disposed'
        ELSE NULL
    END AS asset_class,
    CASE 
        WHEN b.name = 'Katahdin' THEN 'Sheep'
        WHEN ac.name = 'Guard Dog' THEN 'Guard Dog'
        ELSE 'Cattle'
    END AS species,
    -- Calculated age in years
    CASE 
        WHEN a.birth_date IS NOT NULL THEN
            EXTRACT(YEAR FROM age(COALESCE(a.death_date, CURRENT_DATE), a.birth_date)) +
            EXTRACT(MONTH FROM age(COALESCE(a.death_date, CURRENT_DATE), a.birth_date)) / 12.0
        ELSE NULL
    END AS age_in_years,
    -- Dam info
    dam.ear_tag AS dam_ear_tag,
    dam.name AS dam_name,
    -- Sire info
    sire.ear_tag AS sire_ear_tag,
    sire.name AS sire_name
FROM animals a
LEFT JOIN animal_types at ON a.animal_type_id = at.id
LEFT JOIN animal_categories ac ON a.category_id = ac.id
LEFT JOIN breeds b ON a.breed_id = b.id
LEFT JOIN animal_owners ao ON a.owner_id = ao.id
LEFT JOIN animal_sales s ON a.id = s.animal_id
LEFT JOIN animals dam ON a.dam_id = dam.id
LEFT JOIN animals sire ON a.sire_id = sire.id;

-- Active Herd View
CREATE OR REPLACE VIEW active_herd AS
SELECT * FROM herd_summary WHERE status = 'Active';

-- Pasture Status View
CREATE OR REPLACE VIEW pasture_status AS
SELECT 
    p.id,
    p.tenant_id,
    p.name,
    p.size_acres,
    p.productivity_rating,
    -- Current grazing event
    cge.id AS current_grazing_event_id,
    cge.start_date AS grazing_start,
    cge.initial_grass_height,
    -- Count of animals currently in pasture
    (SELECT COUNT(*) FROM animals a WHERE a.current_pasture_id = p.id AND a.status = 'Active') AS animal_count,
    -- Last soil sample
    (SELECT sample_date FROM pasture_soil_samples pss WHERE pss.pasture_id = p.id ORDER BY sample_date DESC LIMIT 1) AS last_soil_sample,
    -- Incomplete tasks count
    (SELECT COUNT(*) FROM pasture_tasks pt WHERE pt.pasture_id = p.id AND pt.is_completed = false) AS pending_tasks
FROM pastures p
LEFT JOIN pasture_grazing_events cge ON p.id = cge.pasture_id AND cge.end_date IS NULL;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamps
CREATE TRIGGER update_animals_updated_at BEFORE UPDATE ON animals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_pastures_updated_at BEFORE UPDATE ON pastures 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_animal_sales_updated_at BEFORE UPDATE ON animal_sales 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_grazing_events_updated_at BEFORE UPDATE ON pasture_grazing_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_pasture_tasks_updated_at BEFORE UPDATE ON pasture_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_pasture_treatments_updated_at BEFORE UPDATE ON pasture_treatments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_soil_samples_updated_at BEFORE UPDATE ON pasture_soil_samples 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE animals IS 'Livestock records - cattle, sheep, goats, etc.';
COMMENT ON TABLE pastures IS 'Pasture/paddock management';
COMMENT ON TABLE animal_sales IS 'Sales records for sold animals';
COMMENT ON TABLE animal_weights IS 'Weight tracking for growth monitoring';
COMMENT ON TABLE animal_health_records IS 'Vaccination, treatment, and health records';
COMMENT ON TABLE pasture_grazing_events IS 'Rotational grazing tracking';
COMMENT ON TABLE pasture_soil_samples IS 'Soil testing records';
COMMENT ON TABLE pasture_nutrients IS 'Nutrient levels from soil samples';
COMMENT ON TABLE pasture_tasks IS 'Pasture maintenance tasks';
COMMENT ON TABLE pasture_treatments IS 'Chemical and mechanical pasture treatments';
