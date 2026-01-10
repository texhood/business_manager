-- ============================================================================
-- HOOD FAMILY FARMS - REPORT CONFIGURATIONS
-- Migration: 003_report_configurations.sql
-- ============================================================================

-- ============================================================================
-- REPORT CONFIGURATIONS (Saved report settings)
-- ============================================================================

CREATE TABLE report_configurations (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL, -- 'income_statement', 'balance_sheet', 'sales_by_customer', 'sales_by_class'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    account_ids INTEGER[], -- Array of account IDs to include
    settings JSONB DEFAULT '{}', -- Additional settings (grouping, sorting, etc.)
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_type, name)
);

-- Create index for quick lookups
CREATE INDEX idx_report_config_type ON report_configurations(report_type);

-- ============================================================================
-- DEFAULT REPORT CONFIGURATIONS
-- ============================================================================

-- Income Statement default config
INSERT INTO report_configurations (report_type, name, description, is_default, settings) VALUES
(
    'income_statement',
    'Standard Income Statement',
    'Default P&L showing all revenue and expense accounts',
    true,
    '{
        "show_subtotals": true,
        "group_by_type": true,
        "include_zero_balances": false
    }'::jsonb
),
(
    'balance_sheet',
    'Standard Balance Sheet',
    'Default balance sheet showing all asset, liability, and equity accounts',
    true,
    '{
        "show_subtotals": true,
        "group_by_type": true,
        "include_zero_balances": false
    }'::jsonb
),
(
    'sales_by_customer',
    'Sales by Customer',
    'Revenue breakdown by customer/vendor name',
    true,
    '{
        "sort_by": "amount",
        "sort_order": "desc",
        "limit": 50
    }'::jsonb
),
(
    'sales_by_class',
    'Sales by Class',
    'Revenue breakdown by account category',
    true,
    '{
        "sort_by": "amount",
        "sort_order": "desc"
    }'::jsonb
);

-- ============================================================================
-- HELPER VIEW: Account Balances by Date Range
-- ============================================================================

CREATE OR REPLACE VIEW v_account_balances AS
SELECT 
    ac.id AS account_id,
    ac.account_code,
    ac.name AS account_name,
    ac.account_type,
    ac.account_subtype,
    ac.normal_balance,
    COALESCE(SUM(jel.debit), 0) AS total_debits,
    COALESCE(SUM(jel.credit), 0) AS total_credits,
    CASE 
        WHEN ac.normal_balance = 'debit' THEN COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0)
        ELSE COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)
    END AS balance
FROM accounts_chart ac
LEFT JOIN journal_entry_lines jel ON ac.id = jel.account_id
LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status = 'posted'
GROUP BY ac.id, ac.account_code, ac.name, ac.account_type, ac.account_subtype, ac.normal_balance;

-- ============================================================================
-- FUNCTION: Get Account Balance for Date Range
-- ============================================================================

CREATE OR REPLACE FUNCTION get_account_balance(
    p_account_id INTEGER,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
) RETURNS NUMERIC AS $$
DECLARE
    v_balance NUMERIC;
    v_normal_balance VARCHAR(10);
BEGIN
    -- Get the normal balance type for this account
    SELECT normal_balance INTO v_normal_balance
    FROM accounts_chart WHERE id = p_account_id;
    
    -- Calculate balance based on date range
    SELECT 
        CASE 
            WHEN v_normal_balance = 'debit' THEN COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0)
            ELSE COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)
        END
    INTO v_balance
    FROM journal_entry_lines jel
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    WHERE jel.account_id = p_account_id
      AND je.status = 'posted'
      AND (p_start_date IS NULL OR je.entry_date >= p_start_date)
      AND (p_end_date IS NULL OR je.entry_date <= p_end_date);
    
    RETURN COALESCE(v_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Generate Income Statement Data
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_income_statement(
    p_start_date DATE,
    p_end_date DATE,
    p_account_ids INTEGER[] DEFAULT NULL
) RETURNS TABLE (
    account_id INTEGER,
    account_code VARCHAR(50),
    account_name VARCHAR(255),
    account_type VARCHAR(50),
    account_subtype VARCHAR(50),
    balance NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.id,
        ac.account_code,
        ac.name,
        ac.account_type,
        ac.account_subtype,
        CASE 
            WHEN ac.normal_balance = 'debit' THEN COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0)
            ELSE COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)
        END AS balance
    FROM accounts_chart ac
    LEFT JOIN journal_entry_lines jel ON ac.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id 
        AND je.status = 'posted'
        AND je.entry_date >= p_start_date 
        AND je.entry_date <= p_end_date
    WHERE ac.account_type IN ('revenue', 'expense')
      AND (p_account_ids IS NULL OR ac.id = ANY(p_account_ids))
    GROUP BY ac.id, ac.account_code, ac.name, ac.account_type, ac.account_subtype, ac.normal_balance
    HAVING CASE 
        WHEN ac.normal_balance = 'debit' THEN COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0)
        ELSE COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)
    END != 0
    ORDER BY ac.account_type DESC, ac.account_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Generate Balance Sheet Data
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_balance_sheet(
    p_as_of_date DATE,
    p_account_ids INTEGER[] DEFAULT NULL
) RETURNS TABLE (
    account_id INTEGER,
    account_code VARCHAR(50),
    account_name VARCHAR(255),
    account_type VARCHAR(50),
    account_subtype VARCHAR(50),
    balance NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.id,
        ac.account_code,
        ac.name,
        ac.account_type,
        ac.account_subtype,
        CASE 
            WHEN ac.normal_balance = 'debit' THEN COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0)
            ELSE COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)
        END AS balance
    FROM accounts_chart ac
    LEFT JOIN journal_entry_lines jel ON ac.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id 
        AND je.status = 'posted'
        AND je.entry_date <= p_as_of_date
    WHERE ac.account_type IN ('asset', 'liability', 'equity')
      AND (p_account_ids IS NULL OR ac.id = ANY(p_account_ids))
    GROUP BY ac.id, ac.account_code, ac.name, ac.account_type, ac.account_subtype, ac.normal_balance
    HAVING CASE 
        WHEN ac.normal_balance = 'debit' THEN COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0)
        ELSE COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)
    END != 0
    ORDER BY 
        CASE ac.account_type 
            WHEN 'asset' THEN 1 
            WHEN 'liability' THEN 2 
            WHEN 'equity' THEN 3 
        END,
        ac.account_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Sales by Customer
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_sales_by_customer(
    p_start_date DATE,
    p_end_date DATE,
    p_limit INTEGER DEFAULT 50
) RETURNS TABLE (
    customer_name TEXT,
    transaction_count BIGINT,
    total_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(NULLIF(TRIM(
            SPLIT_PART(je.description, ' - ', 1)
        ), ''), 'Unknown') AS customer_name,
        COUNT(DISTINCT je.id) AS transaction_count,
        SUM(jel.credit) AS total_amount
    FROM journal_entries je
    JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE je.status = 'posted'
      AND je.entry_date >= p_start_date
      AND je.entry_date <= p_end_date
      AND ac.account_type = 'revenue'
      AND jel.credit > 0
    GROUP BY SPLIT_PART(je.description, ' - ', 1)
    ORDER BY SUM(jel.credit) DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Sales by Class (Account Category)
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_sales_by_class(
    p_start_date DATE,
    p_end_date DATE
) RETURNS TABLE (
    class_name VARCHAR(255),
    account_code VARCHAR(50),
    transaction_count BIGINT,
    total_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.name AS class_name,
        ac.account_code,
        COUNT(DISTINCT je.id) AS transaction_count,
        SUM(jel.credit) AS total_amount
    FROM journal_entries je
    JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE je.status = 'posted'
      AND je.entry_date >= p_start_date
      AND je.entry_date <= p_end_date
      AND ac.account_type = 'revenue'
      AND jel.credit > 0
    GROUP BY ac.id, ac.name, ac.account_code
    ORDER BY SUM(jel.credit) DESC;
END;
$$ LANGUAGE plpgsql;
