-- ============================================================================
-- MENU SYSTEM TABLES
-- For food trailer menus with sections and items
-- ============================================================================

-- Menus (the container)
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Categorization
    season VARCHAR(50),                     -- 'spring', 'summer', 'fall', 'winter', 'all'
    menu_type VARCHAR(50) DEFAULT 'food_trailer',  -- 'food_trailer', 'catering', 'special_event'
    
    -- Display
    header_image TEXT,
    footer_text TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES menus(id),    -- For version history
    
    -- Metadata
    created_by UUID REFERENCES accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, slug)
);

-- Menu Sections (groups of items)
CREATE TABLE IF NOT EXISTS menu_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Display
    sort_order INTEGER DEFAULT 0,
    show_prices BOOLEAN DEFAULT true,
    columns INTEGER DEFAULT 1,              -- Layout: 1, 2, or 3 columns
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items (individual dishes/products)
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Pricing
    price NUMERIC(10,2),
    price_label VARCHAR(100),               -- e.g., "Market Price", "Starting at $12"
    
    -- Dietary/allergen flags
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    is_dairy_free BOOLEAN DEFAULT false,
    is_spicy BOOLEAN DEFAULT false,
    allergens TEXT[],                       -- ['nuts', 'shellfish', etc.]
    
    -- Display
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    
    -- Link to inventory (optional)
    item_id UUID REFERENCES items(id),      -- Link to products table if applicable
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Junction table: Menu Sections to Menu Items (many-to-many)
-- Allows same item to appear in multiple menus/sections
CREATE TABLE IF NOT EXISTS menu_section_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES menu_sections(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    
    -- Override price for this specific menu (optional)
    override_price NUMERIC(10,2),
    override_description TEXT,
    
    -- Display
    sort_order INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,      -- Can mark unavailable for specific menu
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(section_id, menu_item_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_menus_tenant ON menus(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menus_slug ON menus(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_menus_status ON menus(status);
CREATE INDEX IF NOT EXISTS idx_menus_featured ON menus(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_menu_sections_menu ON menu_sections(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_sections_order ON menu_sections(menu_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_tenant ON menu_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_section_items_section ON menu_section_items(section_id);
CREATE INDEX IF NOT EXISTS idx_menu_section_items_order ON menu_section_items(section_id, sort_order);

-- Comments
COMMENT ON TABLE menus IS 'Food trailer menus - reusable menu templates';
COMMENT ON TABLE menu_sections IS 'Sections within a menu (Appetizers, Mains, etc.)';
COMMENT ON TABLE menu_items IS 'Individual menu items - can be reused across menus';
COMMENT ON TABLE menu_section_items IS 'Links items to sections with ordering and optional overrides';
