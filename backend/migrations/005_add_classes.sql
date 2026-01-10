-- Migration: Add Classes table for business segment tracking
-- Classes allow tracking income/expenses by business segment (e.g., Farm, Food Trailer, etc.)

-- ============================================================================
-- CLASSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50),
    description TEXT,
    parent_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_classes_active ON classes(is_active);
CREATE INDEX IF NOT EXISTS idx_classes_parent ON classes(parent_id);

-- ============================================================================
-- ADD CLASS REFERENCE TO JOURNAL ENTRY LINES
-- ============================================================================

ALTER TABLE journal_entry_lines 
ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_journal_lines_class ON journal_entry_lines(class_id);

-- ============================================================================
-- ADD CLASS REFERENCE TO TRANSACTIONS
-- ============================================================================

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_class ON transactions(class_id);

-- ============================================================================
-- SEED DEFAULT CLASSES
-- ============================================================================

INSERT INTO classes (name, code, description, sort_order) VALUES
    ('Farm Operations', 'FARM', 'General farm operations - livestock, produce, etc.', 10),
    ('Food Trailer', 'TRAILER', 'Food trailer/mobile restaurant operations', 20),
    ('Farm Store', 'STORE', 'On-farm retail store', 30),
    ('Farmers Market', 'MARKET', 'Farmers market sales', 40),
    ('Wholesale', 'WHOLESALE', 'Wholesale/bulk sales to restaurants, stores', 50),
    ('Online Sales', 'ONLINE', 'E-commerce and delivery sales', 60)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- UPDATE TRIGGER
-- ============================================================================

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE classes IS 'Business segments/classes for tracking income and expenses by category';
