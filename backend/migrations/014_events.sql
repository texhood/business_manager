-- ============================================================================
-- EVENTS TABLE
-- Food trailer events and schedule
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    
    -- Basic info
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Date/Time
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    timezone VARCHAR(50) DEFAULT 'America/Chicago',
    
    -- Location
    location_name VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    map_url TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    
    -- Menu link
    menu_id UUID REFERENCES menus(id),
    
    -- Display
    featured_image TEXT,
    is_featured BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'cancelled', 'completed')),
    
    -- External links
    ticket_url TEXT,
    facebook_event_url TEXT,
    
    -- Metadata
    created_by UUID REFERENCES accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, slug)
);

-- Recurring event support (optional)
CREATE TABLE IF NOT EXISTS event_series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Recurrence pattern
    recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('weekly', 'biweekly', 'monthly')),
    day_of_week INTEGER,                    -- 0=Sunday, 6=Saturday
    week_of_month INTEGER,                  -- 1-4, for monthly events
    
    -- Default values for events in series
    default_start_time TIME,
    default_end_time TIME,
    default_location_name VARCHAR(255),
    default_address TEXT,
    default_city VARCHAR(100),
    default_state VARCHAR(50),
    default_zip_code VARCHAR(20),
    default_map_url TEXT,
    default_menu_id UUID REFERENCES menus(id),
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Link events to series
ALTER TABLE events ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES event_series(id);

-- Create indexes (without CURRENT_DATE which is not immutable)
CREATE INDEX IF NOT EXISTS idx_events_tenant ON events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_tenant_date_status ON events(tenant_id, event_date, status);
CREATE INDEX IF NOT EXISTS idx_events_menu ON events(menu_id);
CREATE INDEX IF NOT EXISTS idx_events_series ON events(series_id);
CREATE INDEX IF NOT EXISTS idx_event_series_tenant ON event_series(tenant_id);

-- Comments
COMMENT ON TABLE events IS 'Food trailer events and schedule';
COMMENT ON TABLE event_series IS 'Recurring event templates';
