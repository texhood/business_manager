-- ============================================================================
-- ASSET MANAGEMENT MIGRATION
-- Adds fixed asset register and depreciation schedule tracking
-- Ties into existing: accounts_chart, journal_entries, fiscal_periods,
--                      classes, vendors, tenants
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. ENUM TYPES
-- ----------------------------------------------------------------------------

CREATE TYPE public.asset_status AS ENUM (
    'active',            -- In service, being depreciated
    'fully_depreciated', -- Reached end of useful life, still in use
    'disposed',          -- Sold, scrapped, donated, etc.
    'inactive'           -- Temporarily out of service
);

ALTER TYPE public.asset_status OWNER TO postgres;

CREATE TYPE public.depreciation_method AS ENUM (
    'straight_line',       -- Equal amount each period
    'declining_balance',   -- Fixed % of remaining book value
    'double_declining',    -- 2x straight-line rate on remaining value
    'sum_of_years_digits', -- Accelerated based on remaining life fraction
    'units_of_production', -- Based on actual usage vs estimated total
    'none'                 -- Land, art, or other non-depreciable assets
);

ALTER TYPE public.depreciation_method OWNER TO postgres;

CREATE TYPE public.disposal_method AS ENUM (
    'sold',
    'scrapped',
    'traded_in',
    'donated',
    'lost',
    'stolen',
    'written_off'
);

ALTER TYPE public.disposal_method OWNER TO postgres;

-- ----------------------------------------------------------------------------
-- 2. FIXED ASSETS TABLE (Asset Register)
-- ----------------------------------------------------------------------------

CREATE TABLE public.fixed_assets (
    id                                uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id                         uuid NOT NULL,
    asset_number                      character varying(30) NOT NULL,
    name                              character varying(255) NOT NULL,
    description                       text,
    category                          character varying(100) NOT NULL,

    -- Identification
    serial_number                     character varying(100),
    make                              character varying(100),
    model                             character varying(100),
    year                              integer,
    location                          character varying(255),
    barcode                           character varying(100),

    -- Acquisition
    purchase_date                     date NOT NULL,
    in_service_date                   date,
    purchase_cost                     numeric(14,2) NOT NULL,
    vendor_id                         integer,

    -- Depreciation configuration
    depreciation_method               public.depreciation_method DEFAULT 'straight_line' NOT NULL,
    useful_life_months                integer,
    salvage_value                     numeric(14,2) DEFAULT 0 NOT NULL,
    declining_balance_rate            numeric(5,2),
    estimated_total_units             numeric(14,2),
    units_label                       character varying(50),

    -- GL account mapping (links to accounts_chart)
    asset_account_id                  integer NOT NULL,
    accumulated_depreciation_account_id integer NOT NULL,
    depreciation_expense_account_id   integer NOT NULL,

    -- Classification
    class_id                          integer,

    -- Running totals (updated when depreciation is posted)
    accumulated_depreciation          numeric(14,2) DEFAULT 0 NOT NULL,
    current_book_value                numeric(14,2) NOT NULL,
    units_used                        numeric(14,2) DEFAULT 0,

    -- Status & lifecycle
    status                            public.asset_status DEFAULT 'active' NOT NULL,

    -- Disposal fields (populated when asset is disposed)
    disposal_date                     date,
    disposal_method                   public.disposal_method,
    disposal_amount                   numeric(14,2),
    disposal_notes                    text,
    disposal_journal_entry_id         uuid,

    -- Journal entry for initial acquisition posting
    acquisition_journal_entry_id      uuid,

    -- Insurance / warranty
    warranty_expiration               date,
    insurance_policy                  character varying(100),

    -- Photo / document reference
    photo_url                         character varying(500),

    -- Notes
    notes                             text,

    -- Audit
    created_by                        uuid,
    created_at                        timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at                        timestamp with time zone DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT fixed_assets_pkey PRIMARY KEY (id),
    CONSTRAINT fixed_assets_tenant_asset_number_unique UNIQUE (tenant_id, asset_number),
    CONSTRAINT fixed_assets_purchase_cost_positive CHECK (purchase_cost >= 0),
    CONSTRAINT fixed_assets_salvage_value_positive CHECK (salvage_value >= 0),
    CONSTRAINT fixed_assets_salvage_lte_cost CHECK (salvage_value <= purchase_cost),
    CONSTRAINT fixed_assets_useful_life_positive CHECK (useful_life_months IS NULL OR useful_life_months > 0),
    CONSTRAINT fixed_assets_declining_rate_range CHECK (declining_balance_rate IS NULL OR (declining_balance_rate > 0 AND declining_balance_rate <= 100)),
    CONSTRAINT fixed_assets_disposal_requires_date CHECK (
        (status != 'disposed') OR (disposal_date IS NOT NULL AND disposal_method IS NOT NULL)
    )
);

ALTER TABLE public.fixed_assets OWNER TO postgres;

-- Table and column comments
COMMENT ON TABLE public.fixed_assets IS 'Fixed asset register tracking business property, equipment, vehicles, and infrastructure with depreciation';

COMMENT ON COLUMN public.fixed_assets.asset_number IS 'Unique per-tenant identifier (e.g., FA-0001)';
COMMENT ON COLUMN public.fixed_assets.category IS 'Asset category: Vehicles, Equipment, Buildings, Land, Livestock Infrastructure, POS Hardware, Furniture, etc.';
COMMENT ON COLUMN public.fixed_assets.in_service_date IS 'Date asset was placed in service (may differ from purchase date)';
COMMENT ON COLUMN public.fixed_assets.declining_balance_rate IS 'Annual rate % for declining balance method (e.g., 40.00 for 40%)';
COMMENT ON COLUMN public.fixed_assets.estimated_total_units IS 'Total estimated units for units-of-production method (e.g., total miles, hours)';
COMMENT ON COLUMN public.fixed_assets.units_label IS 'Label for units-of-production tracking (e.g., miles, hours, units)';
COMMENT ON COLUMN public.fixed_assets.asset_account_id IS 'GL fixed asset account (e.g., 1500 - Equipment)';
COMMENT ON COLUMN public.fixed_assets.accumulated_depreciation_account_id IS 'GL contra-asset account (e.g., 1510 - Accum Depr - Equipment)';
COMMENT ON COLUMN public.fixed_assets.depreciation_expense_account_id IS 'GL expense account (e.g., 6200 - Depreciation Expense)';
COMMENT ON COLUMN public.fixed_assets.current_book_value IS 'purchase_cost minus accumulated_depreciation (maintained on depreciation posting)';
COMMENT ON COLUMN public.fixed_assets.disposal_amount IS 'Proceeds received from disposal (sale price, trade-in value, etc.)';
COMMENT ON COLUMN public.fixed_assets.acquisition_journal_entry_id IS 'JE recording the initial asset purchase on the books';

-- Foreign keys
ALTER TABLE public.fixed_assets
    ADD CONSTRAINT fixed_assets_tenant_fk FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.fixed_assets
    ADD CONSTRAINT fixed_assets_vendor_fk FOREIGN KEY (vendor_id)
    REFERENCES public.vendors(id) ON DELETE SET NULL;

ALTER TABLE public.fixed_assets
    ADD CONSTRAINT fixed_assets_asset_account_fk FOREIGN KEY (asset_account_id)
    REFERENCES public.accounts_chart(id) ON DELETE RESTRICT;

ALTER TABLE public.fixed_assets
    ADD CONSTRAINT fixed_assets_accum_depr_account_fk FOREIGN KEY (accumulated_depreciation_account_id)
    REFERENCES public.accounts_chart(id) ON DELETE RESTRICT;

ALTER TABLE public.fixed_assets
    ADD CONSTRAINT fixed_assets_depr_expense_account_fk FOREIGN KEY (depreciation_expense_account_id)
    REFERENCES public.accounts_chart(id) ON DELETE RESTRICT;

ALTER TABLE public.fixed_assets
    ADD CONSTRAINT fixed_assets_class_fk FOREIGN KEY (class_id)
    REFERENCES public.classes(id) ON DELETE SET NULL;

ALTER TABLE public.fixed_assets
    ADD CONSTRAINT fixed_assets_created_by_fk FOREIGN KEY (created_by)
    REFERENCES public.accounts(id) ON DELETE SET NULL;

ALTER TABLE public.fixed_assets
    ADD CONSTRAINT fixed_assets_disposal_je_fk FOREIGN KEY (disposal_journal_entry_id)
    REFERENCES public.journal_entries(id) ON DELETE SET NULL;

ALTER TABLE public.fixed_assets
    ADD CONSTRAINT fixed_assets_acquisition_je_fk FOREIGN KEY (acquisition_journal_entry_id)
    REFERENCES public.journal_entries(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_fixed_assets_tenant ON public.fixed_assets(tenant_id);
CREATE INDEX idx_fixed_assets_status ON public.fixed_assets(tenant_id, status);
CREATE INDEX idx_fixed_assets_category ON public.fixed_assets(tenant_id, category);
CREATE INDEX idx_fixed_assets_asset_account ON public.fixed_assets(asset_account_id);
CREATE INDEX idx_fixed_assets_class ON public.fixed_assets(class_id);

-- ----------------------------------------------------------------------------
-- 3. ASSET DEPRECIATION SCHEDULE TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE public.asset_depreciation_schedule (
    id                    uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fixed_asset_id        uuid NOT NULL,
    tenant_id             uuid NOT NULL,
    period_number         integer NOT NULL,
    period_date           date NOT NULL,
    fiscal_period_id      integer,

    -- Depreciation amounts
    depreciation_amount   numeric(14,2) NOT NULL,
    accumulated_total     numeric(14,2) NOT NULL,
    book_value_after      numeric(14,2) NOT NULL,

    -- For units-of-production method
    units_this_period     numeric(14,2),

    -- Journal entry link (populated when posted to books)
    journal_entry_id      uuid,
    is_posted             boolean DEFAULT false NOT NULL,
    posted_at             timestamp with time zone,
    posted_by             uuid,

    -- Notes
    notes                 text,

    -- Audit
    created_at            timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at            timestamp with time zone DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT asset_depreciation_schedule_pkey PRIMARY KEY (id),
    CONSTRAINT asset_depr_asset_period_unique UNIQUE (fixed_asset_id, period_number),
    CONSTRAINT asset_depr_amount_positive CHECK (depreciation_amount >= 0),
    CONSTRAINT asset_depr_book_value_not_negative CHECK (book_value_after >= 0)
);

ALTER TABLE public.asset_depreciation_schedule OWNER TO postgres;

-- Table and column comments
COMMENT ON TABLE public.asset_depreciation_schedule IS 'Monthly/periodic depreciation schedule for each fixed asset, with journal entry linkage';

COMMENT ON COLUMN public.asset_depreciation_schedule.period_number IS 'Sequential period number (1, 2, 3...) within the asset life';
COMMENT ON COLUMN public.asset_depreciation_schedule.period_date IS 'Last day of the period this depreciation applies to';
COMMENT ON COLUMN public.asset_depreciation_schedule.depreciation_amount IS 'Depreciation expense for this single period';
COMMENT ON COLUMN public.asset_depreciation_schedule.accumulated_total IS 'Running total of all depreciation through this period';
COMMENT ON COLUMN public.asset_depreciation_schedule.book_value_after IS 'Asset book value after this period depreciation (cost - accumulated)';
COMMENT ON COLUMN public.asset_depreciation_schedule.units_this_period IS 'Actual units consumed this period (units-of-production method only)';
COMMENT ON COLUMN public.asset_depreciation_schedule.journal_entry_id IS 'Links to journal_entries when this period depreciation is posted to the books';

-- Foreign keys
ALTER TABLE public.asset_depreciation_schedule
    ADD CONSTRAINT asset_depr_fixed_asset_fk FOREIGN KEY (fixed_asset_id)
    REFERENCES public.fixed_assets(id) ON DELETE CASCADE;

ALTER TABLE public.asset_depreciation_schedule
    ADD CONSTRAINT asset_depr_tenant_fk FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.asset_depreciation_schedule
    ADD CONSTRAINT asset_depr_fiscal_period_fk FOREIGN KEY (fiscal_period_id)
    REFERENCES public.fiscal_periods(id) ON DELETE SET NULL;

ALTER TABLE public.asset_depreciation_schedule
    ADD CONSTRAINT asset_depr_journal_entry_fk FOREIGN KEY (journal_entry_id)
    REFERENCES public.journal_entries(id) ON DELETE SET NULL;

ALTER TABLE public.asset_depreciation_schedule
    ADD CONSTRAINT asset_depr_posted_by_fk FOREIGN KEY (posted_by)
    REFERENCES public.accounts(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_asset_depr_tenant ON public.asset_depreciation_schedule(tenant_id);
CREATE INDEX idx_asset_depr_asset ON public.asset_depreciation_schedule(fixed_asset_id);
CREATE INDEX idx_asset_depr_period_date ON public.asset_depreciation_schedule(tenant_id, period_date);
CREATE INDEX idx_asset_depr_posted ON public.asset_depreciation_schedule(tenant_id, is_posted);
CREATE INDEX idx_asset_depr_journal_entry ON public.asset_depreciation_schedule(journal_entry_id);

-- ----------------------------------------------------------------------------
-- 4. ASSET SUMMARY VIEW
-- ----------------------------------------------------------------------------

CREATE VIEW public.asset_register_summary AS
SELECT
    fa.id,
    fa.tenant_id,
    fa.asset_number,
    fa.name,
    fa.category,
    fa.status,
    fa.purchase_date,
    fa.in_service_date,
    fa.purchase_cost,
    fa.salvage_value,
    fa.depreciation_method,
    fa.useful_life_months,
    fa.accumulated_depreciation,
    fa.current_book_value,
    ac_asset.account_code AS asset_account_code,
    ac_asset.name AS asset_account_name,
    ac_accum.account_code AS accum_depr_account_code,
    ac_accum.name AS accum_depr_account_name,
    ac_exp.account_code AS depr_expense_account_code,
    ac_exp.name AS depr_expense_account_name,
    cl.name AS class_name,
    v.name AS vendor_name,
    fa.location,
    fa.serial_number,
    fa.disposal_date,
    fa.disposal_method,
    fa.disposal_amount
FROM public.fixed_assets fa
JOIN public.accounts_chart ac_asset ON fa.asset_account_id = ac_asset.id
JOIN public.accounts_chart ac_accum ON fa.accumulated_depreciation_account_id = ac_accum.id
JOIN public.accounts_chart ac_exp ON fa.depreciation_expense_account_id = ac_exp.id
LEFT JOIN public.classes cl ON fa.class_id = cl.id
LEFT JOIN public.vendors v ON fa.vendor_id = v.id
ORDER BY fa.tenant_id, fa.asset_number;

ALTER VIEW public.asset_register_summary OWNER TO postgres;

COMMENT ON VIEW public.asset_register_summary IS 'Flattened view of fixed assets with account names, class, and vendor for reporting';

-- ----------------------------------------------------------------------------
-- 5. UPDATE TIMESTAMP TRIGGER
-- ----------------------------------------------------------------------------

-- Reuse existing trigger function if available, otherwise create
CREATE OR REPLACE FUNCTION public.update_fixed_asset_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fixed_assets_updated_at
    BEFORE UPDATE ON public.fixed_assets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_fixed_asset_timestamp();

CREATE TRIGGER trg_asset_depr_schedule_updated_at
    BEFORE UPDATE ON public.asset_depreciation_schedule
    FOR EACH ROW
    EXECUTE FUNCTION public.update_fixed_asset_timestamp();

COMMIT;
