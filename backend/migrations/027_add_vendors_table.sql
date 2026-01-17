-- Migration: Add vendors table and update transactions
-- Run this migration against the business_manager database

-- ============================================================================
-- CREATE VENDORS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.vendors (
    id SERIAL PRIMARY KEY,
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    website VARCHAR(255),
    tax_id VARCHAR(50),
    payment_terms VARCHAR(100),
    notes TEXT,
    default_expense_account_id INTEGER REFERENCES public.accounts_chart(id),
    default_class_id INTEGER REFERENCES public.classes(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vendors_tenant_name_unique UNIQUE (tenant_id, name)
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_vendors_tenant_id ON public.vendors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vendors_name ON public.vendors(name);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON public.vendors(is_active);

-- Add comments
COMMENT ON TABLE public.vendors IS 'Vendors/suppliers for expense tracking';
COMMENT ON COLUMN public.vendors.default_expense_account_id IS 'Default GL account for expenses from this vendor';
COMMENT ON COLUMN public.vendors.default_class_id IS 'Default business class for expenses from this vendor';
COMMENT ON COLUMN public.vendors.payment_terms IS 'e.g., Net 30, Due on Receipt, etc.';

-- ============================================================================
-- UPDATE TRANSACTIONS TABLE
-- ============================================================================

-- Add vendor_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'vendor_id'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN vendor_id INTEGER REFERENCES public.vendors(id);
    END IF;
END $$;

-- Create index for vendor lookups
CREATE INDEX IF NOT EXISTS idx_transactions_vendor_id ON public.transactions(vendor_id);

-- Add comment
COMMENT ON COLUMN public.transactions.vendor_id IS 'Reference to vendors table (replaces vendor text field)';

-- ============================================================================
-- MIGRATE EXISTING VENDOR TEXT DATA (Optional - run manually if needed)
-- ============================================================================
-- This creates vendors from existing transaction vendor text values
-- Uncomment and run if you want to migrate existing data:

-- INSERT INTO public.vendors (tenant_id, name)
-- SELECT DISTINCT 
--     '00000000-0000-0000-0000-000000000001'::uuid,
--     vendor
-- FROM public.transactions
-- WHERE vendor IS NOT NULL 
--   AND vendor != ''
--   AND NOT EXISTS (
--       SELECT 1 FROM public.vendors v 
--       WHERE v.name = transactions.vendor 
--         AND v.tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
--   );

-- Then update transactions to reference the new vendor records:
-- UPDATE public.transactions t
-- SET vendor_id = v.id
-- FROM public.vendors v
-- WHERE t.vendor = v.name
--   AND t.vendor_id IS NULL;
