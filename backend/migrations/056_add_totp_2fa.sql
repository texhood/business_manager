-- Migration: 056_add_totp_2fa.sql
-- Add TOTP two-factor authentication support to accounts

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(64);
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS totp_verified_at TIMESTAMP WITH TIME ZONE;

-- Recovery codes (JSON array of hashed codes, single-use)
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS totp_recovery_codes TEXT;

-- Index for quick lookup during login
CREATE INDEX IF NOT EXISTS idx_accounts_totp_enabled ON accounts (id) WHERE totp_enabled = true;
