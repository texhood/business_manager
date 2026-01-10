-- Plaid Integration Tables
-- Run with: psql -U robin -d business_manager -f migrations/004_plaid_integration.sql

-- ============================================================================
-- PLAID_ITEMS - Add missing columns to existing table
-- ============================================================================

ALTER TABLE plaid_items 
ADD COLUMN IF NOT EXISTS institution_id TEXT,
ADD COLUMN IF NOT EXISTS cursor TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS error_code TEXT,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add unique constraint on item_id if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'plaid_items_item_id_key'
    ) THEN
        ALTER TABLE plaid_items ADD CONSTRAINT plaid_items_item_id_key UNIQUE (item_id);
    END IF;
END $$;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_plaid_items_item_id ON plaid_items(item_id);

COMMENT ON TABLE plaid_items IS 'Linked bank connections via Plaid';
COMMENT ON COLUMN plaid_items.access_token IS 'Plaid access token - encrypt in production!';
COMMENT ON COLUMN plaid_items.cursor IS 'Pagination cursor for transaction sync';

-- ============================================================================
-- PLAID_ACCOUNTS - Individual bank accounts within Plaid items
-- ============================================================================

CREATE TABLE IF NOT EXISTS plaid_accounts (
    id SERIAL PRIMARY KEY,
    plaid_item_id INT NOT NULL REFERENCES plaid_items(id) ON DELETE CASCADE,
    account_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    official_name TEXT,
    type TEXT,
    subtype TEXT,
    mask TEXT,
    current_balance DECIMAL(15, 2),
    available_balance DECIMAL(15, 2),
    iso_currency_code TEXT DEFAULT 'USD',
    linked_account_id INT REFERENCES accounts_chart(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for plaid_accounts
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_account_id ON plaid_accounts(account_id);
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_plaid_item_id ON plaid_accounts(plaid_item_id);

COMMENT ON TABLE plaid_accounts IS 'Individual bank accounts within Plaid items';

-- ============================================================================
-- TRANSACTIONS - Add Plaid tracking columns
-- ============================================================================

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS plaid_transaction_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS plaid_account_id INT REFERENCES plaid_accounts(id);

-- Index for Plaid transaction lookups
CREATE INDEX IF NOT EXISTS idx_transactions_plaid_transaction_id ON transactions(plaid_transaction_id);