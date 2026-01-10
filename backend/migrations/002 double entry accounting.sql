-- ============================================================================
-- HOOD FAMILY FARMS - DOUBLE-ENTRY ACCOUNTING SYSTEM
-- Migration 002: Chart of Accounts & Journal Entries
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');
CREATE TYPE account_subtype AS ENUM (
  -- Assets
  'cash', 'bank', 'accounts_receivable', 'inventory', 'fixed_asset', 'other_asset',
  -- Liabilities
  'accounts_payable', 'credit_card', 'current_liability', 'long_term_liability',
  -- Equity
  'owners_equity', 'retained_earnings',
  -- Revenue
  'sales', 'other_income',
  -- Expenses
  'cost_of_goods', 'operating_expense', 'other_expense'
);

CREATE TYPE journal_status AS ENUM ('draft', 'posted', 'void');

-- ============================================================================
-- CHART OF ACCOUNTS
-- ============================================================================

CREATE TABLE accounts_chart (
    id SERIAL PRIMARY KEY,
    account_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    account_type account_type NOT NULL,
    account_subtype account_subtype,
    parent_id INTEGER REFERENCES accounts_chart(id) ON DELETE SET NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_system BOOLEAN NOT NULL DEFAULT false, -- System accounts can't be deleted
    normal_balance VARCHAR(10) NOT NULL DEFAULT 'debit', -- 'debit' or 'credit'
    opening_balance NUMERIC(14,2) DEFAULT 0,
    current_balance NUMERIC(14,2) DEFAULT 0, -- Updated by triggers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_chart_code ON accounts_chart(account_code);
CREATE INDEX idx_accounts_chart_type ON accounts_chart(account_type);
CREATE INDEX idx_accounts_chart_parent ON accounts_chart(parent_id);

-- ============================================================================
-- FISCAL PERIODS
-- ============================================================================

CREATE TABLE fiscal_periods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT false,
    closed_at TIMESTAMP WITH TIME ZONE,
    closed_by UUID REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- JOURNAL ENTRIES (Header)
-- ============================================================================

CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_number VARCHAR(50) UNIQUE NOT NULL,
    entry_date DATE NOT NULL,
    fiscal_period_id INTEGER REFERENCES fiscal_periods(id) ON DELETE RESTRICT,
    reference VARCHAR(100), -- Invoice #, check #, etc.
    description TEXT NOT NULL,
    status journal_status NOT NULL DEFAULT 'draft',
    source_type VARCHAR(50), -- 'manual', 'sales', 'purchase', 'payroll', etc.
    source_id UUID, -- Reference to order, invoice, etc.
    total_debit NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_credit NUMERIC(14,2) NOT NULL DEFAULT 0,
    is_balanced BOOLEAN GENERATED ALWAYS AS (total_debit = total_credit) STORED,
    notes TEXT,
    posted_at TIMESTAMP WITH TIME ZONE,
    posted_by UUID REFERENCES accounts(id) ON DELETE SET NULL,
    voided_at TIMESTAMP WITH TIME ZONE,
    voided_by UUID REFERENCES accounts(id) ON DELETE SET NULL,
    void_reason TEXT,
    created_by UUID REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entries_number ON journal_entries(entry_number);

-- ============================================================================
-- JOURNAL ENTRY LINES (Details)
-- ============================================================================

CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    account_id INTEGER NOT NULL REFERENCES accounts_chart(id) ON DELETE RESTRICT,
    description TEXT,
    debit NUMERIC(14,2) NOT NULL DEFAULT 0,
    credit NUMERIC(14,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_debit_or_credit CHECK (
        (debit > 0 AND credit = 0) OR (debit = 0 AND credit > 0) OR (debit = 0 AND credit = 0)
    )
);

CREATE INDEX idx_journal_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_lines_account ON journal_entry_lines(account_id);

-- ============================================================================
-- DEFAULT CHART OF ACCOUNTS
-- ============================================================================

-- ASSETS (1000-1999)
INSERT INTO accounts_chart (account_code, name, account_type, account_subtype, normal_balance, is_system) VALUES
('1000', 'Cash - Checking', 'asset', 'bank', 'debit', true),
('1010', 'Cash - Savings', 'asset', 'bank', 'debit', true),
('1020', 'Cash - PayPal', 'asset', 'bank', 'debit', false),
('1030', 'Cash - Square', 'asset', 'bank', 'debit', false),
('1040', 'Petty Cash', 'asset', 'cash', 'debit', false),
('1100', 'Accounts Receivable', 'asset', 'accounts_receivable', 'debit', true),
('1200', 'Inventory - Meat', 'asset', 'inventory', 'debit', false),
('1210', 'Inventory - Eggs', 'asset', 'inventory', 'debit', false),
('1220', 'Inventory - Farm Goods', 'asset', 'inventory', 'debit', false),
('1230', 'Inventory - Merchandise', 'asset', 'inventory', 'debit', false),
('1300', 'Prepaid Expenses', 'asset', 'other_asset', 'debit', false),
('1500', 'Equipment', 'asset', 'fixed_asset', 'debit', false),
('1510', 'Vehicles', 'asset', 'fixed_asset', 'debit', false),
('1520', 'Buildings & Improvements', 'asset', 'fixed_asset', 'debit', false),
('1550', 'Accumulated Depreciation', 'asset', 'fixed_asset', 'credit', false);

-- LIABILITIES (2000-2999)
INSERT INTO accounts_chart (account_code, name, account_type, account_subtype, normal_balance, is_system) VALUES
('2000', 'Accounts Payable', 'liability', 'accounts_payable', 'credit', true),
('2100', 'Credit Card Payable', 'liability', 'credit_card', 'credit', false),
('2200', 'Sales Tax Payable', 'liability', 'current_liability', 'credit', true),
('2300', 'Payroll Liabilities', 'liability', 'current_liability', 'credit', false),
('2400', 'Unearned Revenue', 'liability', 'current_liability', 'credit', false),
('2500', 'Loans Payable - Short Term', 'liability', 'current_liability', 'credit', false),
('2600', 'Loans Payable - Long Term', 'liability', 'long_term_liability', 'credit', false);

-- EQUITY (3000-3999)
INSERT INTO accounts_chart (account_code, name, account_type, account_subtype, normal_balance, is_system) VALUES
('3000', 'Owner''s Equity', 'equity', 'owners_equity', 'credit', true),
('3100', 'Owner''s Draw', 'equity', 'owners_equity', 'debit', false),
('3200', 'Owner''s Contribution', 'equity', 'owners_equity', 'credit', false),
('3900', 'Retained Earnings', 'equity', 'retained_earnings', 'credit', true);

-- REVENUE (4000-4999)
INSERT INTO accounts_chart (account_code, name, account_type, account_subtype, normal_balance, is_system) VALUES
('4000', 'Product Sales - Meat', 'revenue', 'sales', 'credit', false),
('4010', 'Product Sales - Eggs', 'revenue', 'sales', 'credit', false),
('4020', 'Product Sales - Farm Goods', 'revenue', 'sales', 'credit', false),
('4030', 'Product Sales - Merchandise', 'revenue', 'sales', 'credit', false),
('4100', 'Farm Membership Revenue', 'revenue', 'sales', 'credit', false),
('4200', 'Food Trailer Sales', 'revenue', 'sales', 'credit', false),
('4300', 'Catering Revenue', 'revenue', 'sales', 'credit', false),
('4400', 'Farm Visit Revenue', 'revenue', 'sales', 'credit', false),
('4500', 'Shipping Revenue', 'revenue', 'other_income', 'credit', false),
('4900', 'Other Income', 'revenue', 'other_income', 'credit', false);

-- COST OF GOODS SOLD (5000-5999)
INSERT INTO accounts_chart (account_code, name, account_type, account_subtype, normal_balance, is_system) VALUES
('5000', 'Cost of Goods Sold - Meat', 'expense', 'cost_of_goods', 'debit', false),
('5010', 'Cost of Goods Sold - Eggs', 'expense', 'cost_of_goods', 'debit', false),
('5020', 'Cost of Goods Sold - Farm Goods', 'expense', 'cost_of_goods', 'debit', false),
('5100', 'Feed & Supplies', 'expense', 'cost_of_goods', 'debit', false),
('5200', 'Processing Fees', 'expense', 'cost_of_goods', 'debit', false),
('5300', 'Packaging & Shipping Supplies', 'expense', 'cost_of_goods', 'debit', false),
('5400', 'Livestock Purchases', 'expense', 'cost_of_goods', 'debit', false);

-- OPERATING EXPENSES (6000-6999)
INSERT INTO accounts_chart (account_code, name, account_type, account_subtype, normal_balance, is_system) VALUES
('6000', 'Advertising & Marketing', 'expense', 'operating_expense', 'debit', false),
('6100', 'Bank & Merchant Fees', 'expense', 'operating_expense', 'debit', false),
('6200', 'Fuel & Transport', 'expense', 'operating_expense', 'debit', false),
('6300', 'Insurance', 'expense', 'operating_expense', 'debit', false),
('6400', 'Labor & Wages', 'expense', 'operating_expense', 'debit', false),
('6410', 'Payroll Taxes', 'expense', 'operating_expense', 'debit', false),
('6500', 'Professional Fees', 'expense', 'operating_expense', 'debit', false),
('6600', 'Rent & Lease', 'expense', 'operating_expense', 'debit', false),
('6700', 'Repairs & Maintenance', 'expense', 'operating_expense', 'debit', false),
('6800', 'Utilities', 'expense', 'operating_expense', 'debit', false),
('6810', 'Utilities - Electric', 'expense', 'operating_expense', 'debit', false),
('6820', 'Utilities - Water', 'expense', 'operating_expense', 'debit', false),
('6830', 'Utilities - Gas/Propane', 'expense', 'operating_expense', 'debit', false),
('6900', 'Office & Admin', 'expense', 'operating_expense', 'debit', false),
('6950', 'Depreciation Expense', 'expense', 'operating_expense', 'debit', false),
('6990', 'Miscellaneous Expense', 'expense', 'other_expense', 'debit', false);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Generate journal entry number
CREATE SEQUENCE journal_entry_seq START 1;

CREATE OR REPLACE FUNCTION generate_journal_entry_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.entry_number = 'JE-' || TO_CHAR(NEW.entry_date, 'YYMM') || '-' || LPAD(nextval('journal_entry_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_journal_entry_number
    BEFORE INSERT ON journal_entries
    FOR EACH ROW
    WHEN (NEW.entry_number IS NULL)
    EXECUTE FUNCTION generate_journal_entry_number();

-- Update journal entry totals when lines change
CREATE OR REPLACE FUNCTION update_journal_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE journal_entries
    SET 
        total_debit = (SELECT COALESCE(SUM(debit), 0) FROM journal_entry_lines WHERE journal_entry_id = COALESCE(NEW.journal_entry_id, OLD.journal_entry_id)),
        total_credit = (SELECT COALESCE(SUM(credit), 0) FROM journal_entry_lines WHERE journal_entry_id = COALESCE(NEW.journal_entry_id, OLD.journal_entry_id)),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.journal_entry_id, OLD.journal_entry_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_journal_totals_on_line_change
    AFTER INSERT OR UPDATE OR DELETE ON journal_entry_lines
    FOR EACH ROW
    EXECUTE FUNCTION update_journal_totals();

-- Update account balances when journal entry is posted
CREATE OR REPLACE FUNCTION update_account_balances()
RETURNS TRIGGER AS $$
BEGIN
    -- When posting an entry
    IF NEW.status = 'posted' AND OLD.status = 'draft' THEN
        UPDATE accounts_chart ac
        SET current_balance = current_balance + 
            CASE 
                WHEN ac.normal_balance = 'debit' THEN jel.debit - jel.credit
                ELSE jel.credit - jel.debit
            END,
            updated_at = CURRENT_TIMESTAMP
        FROM journal_entry_lines jel
        WHERE jel.journal_entry_id = NEW.id AND jel.account_id = ac.id;
    END IF;
    
    -- When voiding an entry
    IF NEW.status = 'void' AND OLD.status = 'posted' THEN
        UPDATE accounts_chart ac
        SET current_balance = current_balance - 
            CASE 
                WHEN ac.normal_balance = 'debit' THEN jel.debit - jel.credit
                ELSE jel.credit - jel.debit
            END,
            updated_at = CURRENT_TIMESTAMP
        FROM journal_entry_lines jel
        WHERE jel.journal_entry_id = NEW.id AND jel.account_id = ac.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_balances_on_post
    AFTER UPDATE OF status ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_account_balances();

-- Trigger for updated_at
CREATE TRIGGER update_accounts_chart_updated_at
    BEFORE UPDATE ON accounts_chart
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR FINANCIAL REPORTS
-- ============================================================================

-- Trial Balance View
CREATE VIEW trial_balance AS
SELECT 
    ac.account_code,
    ac.name,
    ac.account_type,
    ac.normal_balance,
    CASE 
        WHEN ac.normal_balance = 'debit' THEN ac.current_balance
        ELSE 0
    END as debit_balance,
    CASE 
        WHEN ac.normal_balance = 'credit' THEN ac.current_balance
        ELSE 0
    END as credit_balance,
    ac.current_balance
FROM accounts_chart ac
WHERE ac.is_active = true
ORDER BY ac.account_code;

-- Balance Sheet View (Assets, Liabilities, Equity)
CREATE VIEW balance_sheet AS
SELECT 
    ac.account_type,
    ac.account_code,
    ac.name,
    ac.current_balance as balance
FROM accounts_chart ac
WHERE ac.is_active = true
    AND ac.account_type IN ('asset', 'liability', 'equity')
ORDER BY ac.account_type, ac.account_code;

-- Income Statement View (Revenue, Expenses)
CREATE VIEW income_statement AS
SELECT 
    ac.account_type,
    ac.account_subtype,
    ac.account_code,
    ac.name,
    ac.current_balance as balance
FROM accounts_chart ac
WHERE ac.is_active = true
    AND ac.account_type IN ('revenue', 'expense')
ORDER BY ac.account_type, ac.account_code;

-- General Ledger View
CREATE VIEW general_ledger AS
SELECT 
    je.entry_date,
    je.entry_number,
    je.description as entry_description,
    ac.account_code,
    ac.name as account_name,
    jel.description as line_description,
    jel.debit,
    jel.credit,
    je.status
FROM journal_entries je
JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
JOIN accounts_chart ac ON jel.account_id = ac.id
ORDER BY je.entry_date, je.entry_number, jel.line_number;

-- ============================================================================
-- DEFAULT FISCAL PERIOD
-- ============================================================================

INSERT INTO fiscal_periods (name, start_date, end_date) VALUES
('FY 2024', '2024-01-01', '2024-12-31'),
('FY 2025', '2025-01-01', '2025-12-31');