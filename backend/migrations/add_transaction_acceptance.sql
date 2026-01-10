-- Transaction Acceptance System Migration
-- Adds support for bank feed / transaction review workflow

-- Add new columns to transactions table for acceptance workflow
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'excluded')),
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'stripe', 'square', 'import')),
ADD COLUMN IF NOT EXISTS external_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS suggested_account_id INTEGER REFERENCES accounts_chart(id),
ADD COLUMN IF NOT EXISTS accepted_account_id INTEGER REFERENCES accounts_chart(id),
ADD COLUMN IF NOT EXISTS journal_entry_id INTEGER REFERENCES journal_entries(id),
ADD COLUMN IF NOT EXISTS accepted_by INTEGER REFERENCES accounts(id),
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS excluded_reason VARCHAR(255),
ADD COLUMN IF NOT EXISTS raw_data JSONB;

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);
CREATE INDEX IF NOT EXISTS idx_transactions_external_id ON transactions(external_id);

-- Add source_transaction_id to journal_entries for linking back
ALTER TABLE journal_entries
ADD COLUMN IF NOT EXISTS source_transaction_id INTEGER REFERENCES transactions(id);

CREATE INDEX IF NOT EXISTS idx_journal_entries_source_transaction ON journal_entries(source_transaction_id);

-- Update existing transactions to 'accepted' status since they already have journal entries
UPDATE transactions 
SET status = 'accepted', 
    accepted_at = created_at,
    source = 'import'
WHERE status IS NULL OR status = 'pending';

COMMENT ON COLUMN transactions.status IS 'pending=needs review, accepted=categorized and posted, excluded=marked as not applicable';
COMMENT ON COLUMN transactions.source IS 'Where the transaction originated from';
COMMENT ON COLUMN transactions.external_id IS 'ID from external system (Stripe, Square, etc.)';
COMMENT ON COLUMN transactions.journal_entry_id IS 'Link to the journal entry created when accepted';
COMMENT ON COLUMN transactions.accepted_by IS 'User who accepted/categorized the transaction';
COMMENT ON COLUMN transactions.excluded_reason IS 'Why transaction was excluded (duplicate, personal, etc.)';
COMMENT ON COLUMN transactions.raw_data IS 'Original data from external source';
