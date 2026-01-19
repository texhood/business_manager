-- ============================================================================
-- Migration: POS Layouts
-- Allows staff to configure which items appear on the POS terminal and in what order
-- Similar to Square's item grid customization
-- ============================================================================

-- Layouts table - named configurations (e.g., "Register 1", "Farmers Market")
CREATE TABLE IF NOT EXISTS pos_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Grid configuration
  grid_columns INTEGER DEFAULT 4,
  
  -- Metadata
  created_by UUID REFERENCES accounts(id),
  updated_by UUID REFERENCES accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(tenant_id, name)
);

-- Layout items - which items appear in each layout and where
CREATE TABLE IF NOT EXISTS pos_layout_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  layout_id UUID NOT NULL REFERENCES pos_layouts(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  
  -- Position in the grid
  display_order INTEGER NOT NULL DEFAULT 0,
  grid_row INTEGER,
  grid_column INTEGER,
  
  -- Optional display overrides for this layout
  display_name VARCHAR(100),  -- Override item name for POS display
  display_color VARCHAR(7),   -- Hex color for the button (e.g., "#FF5733")
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(layout_id, item_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pos_layouts_tenant ON pos_layouts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pos_layouts_default ON pos_layouts(tenant_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_pos_layout_items_layout ON pos_layout_items(layout_id);
CREATE INDEX IF NOT EXISTS idx_pos_layout_items_item ON pos_layout_items(item_id);
CREATE INDEX IF NOT EXISTS idx_pos_layout_items_order ON pos_layout_items(layout_id, display_order);

-- Ensure only one default layout per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_pos_layouts_one_default 
  ON pos_layouts(tenant_id) 
  WHERE is_default = true;

-- Comments
COMMENT ON TABLE pos_layouts IS 'Named POS terminal layouts for customizing item display';
COMMENT ON TABLE pos_layout_items IS 'Items assigned to each POS layout with positioning';
COMMENT ON COLUMN pos_layouts.grid_columns IS 'Number of columns in the item grid';
COMMENT ON COLUMN pos_layout_items.display_order IS 'Sort order for items (lower = first)';
COMMENT ON COLUMN pos_layout_items.display_name IS 'Optional override for item name on POS';
COMMENT ON COLUMN pos_layout_items.display_color IS 'Optional button color (hex)';

-- ============================================================================
-- Create a default layout for existing tenants with all active items
-- ============================================================================
DO $$
DECLARE
  tenant_record RECORD;
  layout_id UUID;
  item_record RECORD;
  item_order INTEGER;
BEGIN
  -- Loop through each tenant
  FOR tenant_record IN SELECT id FROM tenants LOOP
    -- Create a default layout
    INSERT INTO pos_layouts (tenant_id, name, description, is_default, is_active)
    VALUES (tenant_record.id, 'Default', 'All active items', true, true)
    RETURNING id INTO layout_id;
    
    -- Add all active items to the layout
    item_order := 0;
    FOR item_record IN 
      SELECT id FROM items 
      WHERE tenant_id = tenant_record.id AND status = 'active'
      ORDER BY name
    LOOP
      INSERT INTO pos_layout_items (layout_id, item_id, display_order)
      VALUES (layout_id, item_record.id, item_order);
      item_order := item_order + 1;
    END LOOP;
  END LOOP;
END $$;
