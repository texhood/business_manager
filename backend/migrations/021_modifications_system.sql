-- Modifications System
-- Allows item-specific modifications with price adjustments and required groups

-- Global modification options
CREATE TABLE modifications (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100), -- optional override for display
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  category VARCHAR(50) NOT NULL DEFAULT 'general', -- removal, addition, preparation, size, temperature, allergy
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link modifications to specific menu items (menu_items uses UUID)
CREATE TABLE menu_item_modifications (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  modification_id INTEGER NOT NULL REFERENCES modifications(id) ON DELETE CASCADE,
  price_override DECIMAL(10,2), -- override the default price adjustment for this item
  is_default BOOLEAN DEFAULT false, -- pre-selected when item added to cart
  group_name VARCHAR(50), -- for grouping required choices (e.g., 'temperature', 'size')
  is_required BOOLEAN DEFAULT false, -- if true, must select one from group
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, menu_item_id, modification_id)
);

-- Index for fast lookups
CREATE INDEX idx_menu_item_modifications_item ON menu_item_modifications(tenant_id, menu_item_id);
CREATE INDEX idx_modifications_category ON modifications(tenant_id, category);
CREATE INDEX idx_modifications_active ON modifications(tenant_id, is_active);
CREATE INDEX idx_modifications_tenant ON modifications(tenant_id);
CREATE INDEX idx_menu_item_modifications_tenant ON menu_item_modifications(tenant_id);

-- Seed common modifications
INSERT INTO modifications (tenant_id, name, display_name, price_adjustment, category, sort_order) VALUES
-- Removals (typically free)
('00000000-0000-0000-0000-000000000001', 'no_onions', 'No Onions', 0, 'removal', 10),
('00000000-0000-0000-0000-000000000001', 'no_tomato', 'No Tomato', 0, 'removal', 11),
('00000000-0000-0000-0000-000000000001', 'no_lettuce', 'No Lettuce', 0, 'removal', 12),
('00000000-0000-0000-0000-000000000001', 'no_cheese', 'No Cheese', 0, 'removal', 13),
('00000000-0000-0000-0000-000000000001', 'no_sauce', 'No Sauce', 0, 'removal', 14),
('00000000-0000-0000-0000-000000000001', 'no_mayo', 'No Mayo', 0, 'removal', 15),
('00000000-0000-0000-0000-000000000001', 'no_pickles', 'No Pickles', 0, 'removal', 16),
('00000000-0000-0000-0000-000000000001', 'no_bun', 'No Bun', 0, 'removal', 17),

-- Additions (typically cost extra)
('00000000-0000-0000-0000-000000000001', 'extra_cheese', 'Extra Cheese', 1.00, 'addition', 20),
('00000000-0000-0000-0000-000000000001', 'add_bacon', 'Add Bacon', 2.00, 'addition', 21),
('00000000-0000-0000-0000-000000000001', 'add_avocado', 'Add Avocado', 1.50, 'addition', 22),
('00000000-0000-0000-0000-000000000001', 'add_egg', 'Add Egg', 1.50, 'addition', 23),
('00000000-0000-0000-0000-000000000001', 'extra_sauce', 'Extra Sauce', 0.50, 'addition', 24),
('00000000-0000-0000-0000-000000000001', 'add_jalapenos', 'Add Jalapeños', 0.75, 'addition', 25),
('00000000-0000-0000-0000-000000000001', 'double_meat', 'Double Meat', 4.00, 'addition', 26),

-- Temperature (for proteins)
('00000000-0000-0000-0000-000000000001', 'temp_rare', 'Rare', 0, 'temperature', 30),
('00000000-0000-0000-0000-000000000001', 'temp_medium_rare', 'Medium Rare', 0, 'temperature', 31),
('00000000-0000-0000-0000-000000000001', 'temp_medium', 'Medium', 0, 'temperature', 32),
('00000000-0000-0000-0000-000000000001', 'temp_medium_well', 'Medium Well', 0, 'temperature', 33),
('00000000-0000-0000-0000-000000000001', 'temp_well_done', 'Well Done', 0, 'temperature', 34),

-- Size options
('00000000-0000-0000-0000-000000000001', 'size_small', 'Small', -1.00, 'size', 40),
('00000000-0000-0000-0000-000000000001', 'size_regular', 'Regular', 0, 'size', 41),
('00000000-0000-0000-0000-000000000001', 'size_large', 'Large', 1.50, 'size', 42),

-- Drink modifications
('00000000-0000-0000-0000-000000000001', 'light_ice', 'Light Ice', 0, 'preparation', 50),
('00000000-0000-0000-0000-000000000001', 'no_ice', 'No Ice', 0, 'preparation', 51),
('00000000-0000-0000-0000-000000000001', 'extra_ice', 'Extra Ice', 0, 'preparation', 52),

-- Preparation
('00000000-0000-0000-0000-000000000001', 'cut_in_half', 'Cut in Half', 0, 'preparation', 60),
('00000000-0000-0000-0000-000000000001', 'on_the_side', 'On the Side', 0, 'preparation', 61),
('00000000-0000-0000-0000-000000000001', 'extra_crispy', 'Extra Crispy', 0, 'preparation', 62),
('00000000-0000-0000-0000-000000000001', 'lightly_toasted', 'Lightly Toasted', 0, 'preparation', 63),

-- Allergy/Dietary
('00000000-0000-0000-0000-000000000001', 'gluten_free_bun', 'Gluten Free Bun', 1.50, 'allergy', 70),
('00000000-0000-0000-0000-000000000001', 'dairy_free', 'Make Dairy Free', 0, 'allergy', 71),
('00000000-0000-0000-0000-000000000001', 'nut_free', 'Nut Free Prep', 0, 'allergy', 72),
('00000000-0000-0000-0000-000000000001', 'allergy_alert', 'Allergy Alert', 0, 'allergy', 73);

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_modifications_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_modifications_updated_at
  BEFORE UPDATE ON modifications
  FOR EACH ROW
  EXECUTE FUNCTION update_modifications_timestamp();
