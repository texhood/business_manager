-- Migration: Add accepted_gl_account_id to transactions
-- This column stores the GL account (from accounts_chart) selected during transaction acceptance

-- Add the column if it doesn't exist
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS accepted_gl_account_id INTEGER REFERENCES accounts_chart(id);

-- Add index for reporting
CREATE INDEX IF NOT EXISTS idx_transactions_accepted_gl_account ON transactions(accepted_gl_account_id);

-- Add accepted_at and accepted_by if they don't exist
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS accepted_by UUID REFERENCES accounts(id);

-- Ensure acceptance_status column exists with correct values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'acceptance_status'
    ) THEN
        ALTER TABLE transactions ADD COLUMN acceptance_status VARCHAR(20) DEFAULT 'pending';
    END IF;
END $$;

-- Update any NULL acceptance_status to 'pending'
UPDATE transactions SET acceptance_status = 'pending' WHERE acceptance_status IS NULL;

COMMENT ON COLUMN transactions.accepted_gl_account_id IS 'The GL account (expense/revenue) assigned during transaction acceptance';
COMMENT ON COLUMN transactions.acceptance_status IS 'pending=needs review, accepted=categorized and posted, excluded=marked as not applicable';
