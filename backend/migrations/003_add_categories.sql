-- Migration: Simplify accounting structure with Categories
-- Categories are for income/expense classification (managerial reporting)
-- Accounts are for balance sheet items (where money/value actually lives)

-- ============================================================================
-- CATEGORIES TABLE (Income/Expense buckets for classification)
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    code VARCHAR(50),  -- Optional code for sorting/reference
    description TEXT,
    default_class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- ============================================================================
-- SEED DEFAULT CATEGORIES (migrate from existing chart of accounts)
-- ============================================================================

-- Income Categories
INSERT INTO categories (name, type, code, sort_order) VALUES
    ('Sales Revenue', 'income', 'INC-100', 10),
    ('Livestock Sales', 'income', 'INC-110', 20),
    ('Produce Sales', 'income', 'INC-120', 30),
    ('Egg Sales', 'income', 'INC-130', 40),
    ('Meat Sales', 'income', 'INC-140', 50),
    ('Farm Store Sales', 'income', 'INC-150', 60),
    ('Farmers Market Sales', 'income', 'INC-160', 70),
    ('Wholesale Sales', 'income', 'INC-170', 80),
    ('Delivery Fees', 'income', 'INC-180', 90),
    ('Other Income', 'income', 'INC-900', 900)
ON CONFLICT DO NOTHING;

-- Expense Categories
INSERT INTO categories (name, type, code, sort_order) VALUES
    ('Feed & Supplements', 'expense', 'EXP-100', 10),
    ('Livestock Purchases', 'expense', 'EXP-110', 20),
    ('Veterinary & Medicine', 'expense', 'EXP-120', 30),
    ('Seeds & Plants', 'expense', 'EXP-130', 40),
    ('Fertilizer & Soil', 'expense', 'EXP-140', 50),
    ('Equipment & Tools', 'expense', 'EXP-150', 60),
    ('Equipment Repairs', 'expense', 'EXP-160', 70),
    ('Fuel & Oil', 'expense', 'EXP-170', 80),
    ('Utilities', 'expense', 'EXP-180', 90),
    ('Insurance', 'expense', 'EXP-190', 100),
    ('Property Tax', 'expense', 'EXP-200', 110),
    ('Labor & Wages', 'expense', 'EXP-210', 120),
    ('Contract Services', 'expense', 'EXP-220', 130),
    ('Marketing & Advertising', 'expense', 'EXP-230', 140),
    ('Office & Supplies', 'expense', 'EXP-240', 150),
    ('Packaging & Containers', 'expense', 'EXP-250', 160),
    ('Processing Fees', 'expense', 'EXP-260', 170),
    ('Delivery & Shipping', 'expense', 'EXP-270', 180),
    ('Bank & Merchant Fees', 'expense', 'EXP-280', 190),
    ('Professional Services', 'expense', 'EXP-290', 200),
    ('Rent & Lease', 'expense', 'EXP-300', 210),
    ('Travel & Meals', 'expense', 'EXP-310', 220),
    ('Miscellaneous', 'expense', 'EXP-900', 900)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- UPDATE TRANSACTIONS TABLE (add category reference)
-- ============================================================================

-- Add category_id to transactions if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'category_id') THEN
        ALTER TABLE transactions ADD COLUMN category_id INTEGER REFERENCES categories(id);
    END IF;
END $$;

-- Add index for category lookups
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

-- ============================================================================
-- SIMPLIFY ACCOUNTS_CHART (mark income/expense accounts as category-type)
-- ============================================================================

-- Add a flag to distinguish "real" accounts from category-accounts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'accounts_chart' AND column_name = 'is_category_account') THEN
        ALTER TABLE accounts_chart ADD COLUMN is_category_account BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Mark existing revenue/expense accounts as category accounts
UPDATE accounts_chart 
SET is_category_account = true 
WHERE account_type IN ('revenue', 'expense');

-- ============================================================================
-- CREATE VIEW FOR "REAL" ACCOUNTS (Balance Sheet only)
-- ============================================================================

CREATE OR REPLACE VIEW real_accounts AS
SELECT * FROM accounts_chart 
WHERE account_type IN ('asset', 'liability', 'equity')
  AND (is_category_account = false OR is_category_account IS NULL)
  AND is_active = true;

-- ============================================================================
-- CREATE VIEW FOR BANK/CASH ACCOUNTS (for transaction acceptance)
-- ============================================================================

CREATE OR REPLACE VIEW bank_accounts AS
SELECT * FROM accounts_chart 
WHERE account_subtype IN ('cash', 'bank', 'credit_card')
  AND is_active = true;

-- ============================================================================
-- HELPFUL COMMENTS
-- ============================================================================

COMMENT ON TABLE categories IS 'Income and expense categories for transaction classification (managerial reporting)';
COMMENT ON VIEW real_accounts IS 'Balance sheet accounts only - where money/value actually lives';
COMMENT ON VIEW bank_accounts IS 'Cash, bank, and credit card accounts for transaction acceptance';
