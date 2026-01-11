-- ============================================================================
-- Migration: Remove Transaction Categories & Fix Column Names
-- 
-- This migration removes the deprecated transaction_categories table and 
-- related column. Transaction categorization is now handled through the
-- Chart of Accounts (accounts_chart table) via the transaction acceptance
-- workflow.
-- ============================================================================

-- Step 0: Ensure acceptance_status column exists and sync from status column if needed
DO $
BEGIN
    -- Add acceptance_status if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'acceptance_status'
    ) THEN
        ALTER TABLE transactions ADD COLUMN acceptance_status VARCHAR(20) DEFAULT 'pending';
    END IF;
    
    -- Add exclusion_reason if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'exclusion_reason'
    ) THEN
        ALTER TABLE transactions ADD COLUMN exclusion_reason VARCHAR(255);
    END IF;
END $;

-- Sync status -> acceptance_status for any transactions that have status but not acceptance_status
UPDATE transactions 
SET acceptance_status = COALESCE(
    CASE 
        WHEN status IN ('pending', 'accepted', 'excluded') THEN status
        ELSE 'pending'
    END,
    'pending'
)
WHERE acceptance_status IS NULL;

-- Also copy excluded_reason to exclusion_reason if it exists
DO $
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'excluded_reason'
    ) THEN
        UPDATE transactions SET exclusion_reason = excluded_reason WHERE exclusion_reason IS NULL AND excluded_reason IS NOT NULL;
    END IF;
END $;

-- Step 1: Drop the category_id column from transactions table
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_category_id_fkey;
ALTER TABLE transactions DROP COLUMN IF EXISTS category_id;

-- Step 2: Drop the old status column if it exists (we now use acceptance_status)
ALTER TABLE transactions DROP COLUMN IF EXISTS status;
ALTER TABLE transactions DROP COLUMN IF EXISTS excluded_reason;
ALTER TABLE transactions DROP COLUMN IF EXISTS category;

-- Step 3: Drop the transaction_categories table
DROP TABLE IF EXISTS transaction_categories;

-- ============================================================================
-- Verification query (run manually to confirm):
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'transactions' AND column_name = 'category_id';
-- Should return 0 rows
--
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name = 'transaction_categories';
-- Should return 0 rows
-- ============================================================================
