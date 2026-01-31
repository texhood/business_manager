-- Migration: 052_tenant_settings_columns.sql
-- Ensures all columns needed for tenant self-service settings exist
-- Run: psql -U postgres -d business_manager -f migrations/052_tenant_settings_columns.sql

-- Add secondary_color if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'secondary_color'
  ) THEN
    ALTER TABLE tenants ADD COLUMN secondary_color VARCHAR(7) DEFAULT '#4a7c59';
  END IF;
END $$;

-- Add business_hours JSONB if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'business_hours'
  ) THEN
    ALTER TABLE tenants ADD COLUMN business_hours JSONB DEFAULT '{
      "monday": {"open": "09:00", "close": "17:00", "closed": false},
      "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
      "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
      "thursday": {"open": "09:00", "close": "17:00", "closed": false},
      "friday": {"open": "09:00", "close": "17:00", "closed": false},
      "saturday": {"open": "10:00", "close": "14:00", "closed": false},
      "sunday": {"open": "", "close": "", "closed": true}
    }';
  END IF;
END $$;

-- Add tax_rate if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'tax_rate'
  ) THEN
    ALTER TABLE tenants ADD COLUMN tax_rate DECIMAL(5,4) DEFAULT 0.0825;
  END IF;
END $$;

-- Add currency if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'currency'
  ) THEN
    ALTER TABLE tenants ADD COLUMN currency VARCHAR(3) DEFAULT 'USD';
  END IF;
END $$;

-- Add timezone if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE tenants ADD COLUMN timezone VARCHAR(50) DEFAULT 'America/Chicago';
  END IF;
END $$;

-- Add description if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'description'
  ) THEN
    ALTER TABLE tenants ADD COLUMN description TEXT;
  END IF;
END $$;

-- Add updated_at if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE tenants ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Verify columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'tenants'
ORDER BY ordinal_position;