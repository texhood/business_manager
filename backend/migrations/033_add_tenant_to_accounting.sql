-- ============================================================================
-- MIGRATION 033: Add tenant_id to Accounting Tables
-- Adds multi-tenant support to accounts_chart, transactions, and related tables
-- ============================================================================

-- Add onboarding_complete column to tenants if not exists
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;

-- Add tenant_id to accounts_chart (Chart of Accounts)
ALTER TABLE accounts_chart ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
CREATE INDEX IF NOT EXISTS idx_accounts_chart_tenant ON accounts_chart(tenant_id);

-- Add tenant_id to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON transactions(tenant_id);

-- Add tenant_id to journal_entries
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
CREATE INDEX IF NOT EXISTS idx_journal_entries_tenant ON journal_entries(tenant_id);

-- Add tenant_id to fiscal_periods
ALTER TABLE fiscal_periods ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
CREATE INDEX IF NOT EXISTS idx_fiscal_periods_tenant ON fiscal_periods(tenant_id);

-- Add tenant_id to bank_accounts
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
CREATE INDEX IF NOT EXISTS idx_bank_accounts_tenant ON bank_accounts(tenant_id);

-- Add tenant_id to orders if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);

-- Make account_code unique within tenant, not globally
-- First, drop the existing unique constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'accounts_chart_account_code_key'
    ) THEN
        ALTER TABLE accounts_chart DROP CONSTRAINT accounts_chart_account_code_key;
    END IF;
END $$;

-- Add composite unique constraint for tenant + account_code
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'accounts_chart_tenant_account_code_unique'
    ) THEN
        ALTER TABLE accounts_chart ADD CONSTRAINT accounts_chart_tenant_account_code_unique 
        UNIQUE (tenant_id, account_code);
    END IF;
END $$;

-- Comment
COMMENT ON COLUMN accounts_chart.tenant_id IS 'Multi-tenant: Each tenant has their own chart of accounts';
COMMENT ON COLUMN transactions.tenant_id IS 'Multi-tenant: Transactions belong to a specific tenant';
