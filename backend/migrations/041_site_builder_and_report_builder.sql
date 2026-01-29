-- Migration 041: Site Builder Templates and Report Builder System
-- FRESH COPY - 2026-01-28

-- ============================================================================
-- PART 1: SITE BUILDER ENHANCEMENTS
-- ============================================================================

-- Function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_site_designer_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- Site Templates - Reusable page templates
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    preview_image character varying(500),
    template_type character varying(50) DEFAULT 'page'::character varying NOT NULL,
    is_default boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT site_templates_pkey PRIMARY KEY (id),
    CONSTRAINT site_templates_slug_key UNIQUE (slug)
);

-- -----------------------------------------------------------------------------
-- Template Zones - Editable regions within templates
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.template_zones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    zone_key character varying(50) NOT NULL,
    zone_name character varying(100) NOT NULL,
    description text,
    allowed_blocks text[] DEFAULT '{}'::text[],
    max_blocks integer,
    min_blocks integer DEFAULT 0,
    display_order integer DEFAULT 0,
    default_blocks jsonb DEFAULT '[]'::jsonb,
    settings_schema jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT template_zones_pkey PRIMARY KEY (id),
    CONSTRAINT template_zones_template_id_zone_key_key UNIQUE (template_id, zone_key),
    CONSTRAINT template_zones_template_id_fkey FOREIGN KEY (template_id) 
        REFERENCES public.site_templates(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_template_zones_template ON public.template_zones USING btree (template_id);
CREATE INDEX IF NOT EXISTS idx_template_zones_order ON public.template_zones USING btree (template_id, display_order);

-- -----------------------------------------------------------------------------
-- Site Assets - Media library for uploaded files
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    filename character varying(255) NOT NULL,
    original_filename character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_url character varying(500) NOT NULL,
    file_size integer NOT NULL,
    mime_type character varying(100) NOT NULL,
    width integer,
    height integer,
    thumbnail_url character varying(500),
    alt_text character varying(255),
    title character varying(255),
    caption text,
    folder character varying(255) DEFAULT 'uploads'::character varying,
    tags text[] DEFAULT '{}'::text[],
    category character varying(50),
    usage_count integer DEFAULT 0,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT site_assets_pkey PRIMARY KEY (id),
    CONSTRAINT site_assets_tenant_id_fkey FOREIGN KEY (tenant_id) 
        REFERENCES public.tenants(id),
    CONSTRAINT site_assets_uploaded_by_fkey FOREIGN KEY (uploaded_by) 
        REFERENCES public.accounts(id)
);

CREATE INDEX IF NOT EXISTS idx_site_assets_tenant ON public.site_assets USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_site_assets_folder ON public.site_assets USING btree (tenant_id, folder);
CREATE INDEX IF NOT EXISTS idx_site_assets_category ON public.site_assets USING btree (category);
CREATE INDEX IF NOT EXISTS idx_site_assets_tags ON public.site_assets USING gin (tags);

-- Trigger for site_assets - uses update_site_designer_timestamp
DROP TRIGGER IF EXISTS site_assets_updated ON public.site_assets;
CREATE TRIGGER site_assets_updated 
    BEFORE UPDATE ON public.site_assets 
    FOR EACH ROW EXECUTE FUNCTION public.update_site_designer_timestamp();

-- -----------------------------------------------------------------------------
-- Alter site_pages - Add template support and homepage flag
-- -----------------------------------------------------------------------------
ALTER TABLE public.site_pages 
    ADD COLUMN IF NOT EXISTS template_id uuid,
    ADD COLUMN IF NOT EXISTS is_homepage boolean DEFAULT false;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'site_pages_template_id_fkey' 
        AND table_name = 'site_pages'
    ) THEN
        ALTER TABLE public.site_pages 
            ADD CONSTRAINT site_pages_template_id_fkey 
            FOREIGN KEY (template_id) REFERENCES public.site_templates(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_site_pages_template ON public.site_pages USING btree (template_id) WHERE (template_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_site_pages_homepage ON public.site_pages USING btree (tenant_id, is_homepage) WHERE (is_homepage = true);
CREATE INDEX IF NOT EXISTS idx_site_pages_slug ON public.site_pages USING btree (tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_site_pages_tenant ON public.site_pages USING btree (tenant_id);

DROP TRIGGER IF EXISTS site_pages_updated ON public.site_pages;
CREATE TRIGGER site_pages_updated 
    BEFORE UPDATE ON public.site_pages 
    FOR EACH ROW EXECUTE FUNCTION public.update_site_designer_timestamp();

-- -----------------------------------------------------------------------------
-- Site Page Details View (simplified - no page_blocks dependency)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.site_page_details AS
SELECT 
    p.id,
    p.tenant_id,
    p.page_type,
    p.title,
    p.slug,
    p.is_published,
    p.is_homepage,
    p.template_id,
    t.name AS template_name,
    t.slug AS template_slug,
    p.seo_title,
    p.seo_description,
    p.created_at,
    p.updated_at
FROM public.site_pages p
LEFT JOIN public.site_templates t ON p.template_id = t.id;


-- ============================================================================
-- PART 2: REPORT BUILDER SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.report_record_definitions (
    id integer NOT NULL,
    record_name character varying(100) NOT NULL,
    display_name character varying(255) NOT NULL,
    description text,
    source_type character varying(20) NOT NULL,
    source_name character varying(100) NOT NULL,
    category character varying(100) NOT NULL,
    is_tenant_filtered boolean DEFAULT true,
    tenant_id_column character varying(100) DEFAULT 'tenant_id'::character varying,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT report_record_definitions_pkey PRIMARY KEY (id),
    CONSTRAINT report_record_definitions_record_name_key UNIQUE (record_name),
    CONSTRAINT report_record_definitions_source_type_check CHECK (
        (source_type)::text = ANY ((ARRAY['table'::character varying, 'view'::character varying])::text[])
    )
);

CREATE SEQUENCE IF NOT EXISTS public.report_record_definitions_id_seq
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.report_record_definitions_id_seq OWNED BY public.report_record_definitions.id;
ALTER TABLE ONLY public.report_record_definitions 
    ALTER COLUMN id SET DEFAULT nextval('public.report_record_definitions_id_seq'::regclass);

CREATE TABLE IF NOT EXISTS public.report_field_definitions (
    id integer NOT NULL,
    record_id integer NOT NULL,
    field_name character varying(100) NOT NULL,
    display_name character varying(255) NOT NULL,
    data_type character varying(50) NOT NULL,
    enum_values jsonb,
    is_filterable boolean DEFAULT true,
    is_sortable boolean DEFAULT true,
    is_groupable boolean DEFAULT false,
    is_aggregatable boolean DEFAULT false,
    default_selected boolean DEFAULT false,
    format_hint character varying(50),
    column_width integer,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT report_field_definitions_pkey PRIMARY KEY (id),
    CONSTRAINT report_field_definitions_record_id_field_name_key UNIQUE (record_id, field_name),
    CONSTRAINT report_field_definitions_data_type_check CHECK (
        (data_type)::text = ANY ((ARRAY['text'::character varying, 'number'::character varying, 'date'::character varying, 'datetime'::character varying, 'boolean'::character varying, 'enum'::character varying, 'currency'::character varying])::text[])
    ),
    CONSTRAINT report_field_definitions_record_id_fkey FOREIGN KEY (record_id) 
        REFERENCES public.report_record_definitions(id) ON DELETE CASCADE
);

CREATE SEQUENCE IF NOT EXISTS public.report_field_definitions_id_seq
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.report_field_definitions_id_seq OWNED BY public.report_field_definitions.id;
ALTER TABLE ONLY public.report_field_definitions 
    ALTER COLUMN id SET DEFAULT nextval('public.report_field_definitions_id_seq'::regclass);

CREATE TABLE IF NOT EXISTS public.custom_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    record_type character varying(100) NOT NULL,
    selected_columns jsonb DEFAULT '[]'::jsonb NOT NULL,
    constraints jsonb DEFAULT '[]'::jsonb NOT NULL,
    sort_config jsonb DEFAULT '[]'::jsonb,
    group_by_fields jsonb DEFAULT '[]'::jsonb,
    aggregations jsonb DEFAULT '[]'::jsonb,
    page_size integer DEFAULT 50,
    show_row_numbers boolean DEFAULT false,
    show_totals boolean DEFAULT false,
    is_favorite boolean DEFAULT false,
    is_shared boolean DEFAULT false,
    run_count integer DEFAULT 0,
    last_run_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT custom_reports_pkey PRIMARY KEY (id),
    CONSTRAINT custom_reports_tenant_id_name_key UNIQUE (tenant_id, name),
    CONSTRAINT custom_reports_page_size_check CHECK ((page_size > 0) AND (page_size <= 500)),
    CONSTRAINT custom_reports_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
    CONSTRAINT custom_reports_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id)
);

CREATE INDEX IF NOT EXISTS idx_custom_reports_tenant ON public.custom_reports USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_custom_reports_record_type ON public.custom_reports USING btree (record_type);
CREATE INDEX IF NOT EXISTS idx_custom_reports_created_by ON public.custom_reports USING btree (created_by);
CREATE INDEX IF NOT EXISTS idx_custom_reports_favorite ON public.custom_reports USING btree (tenant_id, is_favorite) WHERE (is_favorite = true);

CREATE TABLE IF NOT EXISTS public.report_run_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    report_id uuid,
    report_name character varying(255) NOT NULL,
    record_type character varying(100) NOT NULL,
    run_by uuid,
    row_count integer,
    execution_time_ms integer,
    exported_format character varying(20),
    run_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT report_run_history_pkey PRIMARY KEY (id),
    CONSTRAINT report_run_history_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
    CONSTRAINT report_run_history_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.custom_reports(id) ON DELETE SET NULL,
    CONSTRAINT report_run_history_run_by_fkey FOREIGN KEY (run_by) REFERENCES public.accounts(id)
);

-- ============================================================================
-- PART 3: SEED DATA
-- ============================================================================

INSERT INTO public.report_record_definitions (id, record_name, display_name, description, source_type, source_name, category, is_tenant_filtered, tenant_id_column, sort_order, is_active)
SELECT * FROM (VALUES
    (1, 'animals', 'Animals', 'Individual animal records', 'table', 'animals', 'livestock', true, 'tenant_id', 1, true),
    (2, 'herds', 'Herds/Flocks', 'Herd and flock groupings', 'table', 'herds', 'livestock', true, 'tenant_id', 2, true),
    (3, 'animal_weights', 'Weight Records', 'Animal weight measurements', 'table', 'animal_weights', 'livestock', true, 'tenant_id', 3, true),
    (4, 'animal_notes', 'Animal Notes', 'Notes and observations', 'table', 'animal_notes', 'livestock', true, 'tenant_id', 4, true),
    (5, 'breeding_records', 'Breeding Records', 'Breeding and reproduction data', 'table', 'breeding_records', 'livestock', true, 'tenant_id', 5, true),
    (6, 'medical_records', 'Medical Records', 'Health and treatment records', 'table', 'medical_records', 'livestock', true, 'tenant_id', 6, true),
    (7, 'processing_appointments', 'Processing Appointments', 'Scheduled processing dates', 'table', 'processing_appointments', 'livestock', true, 'tenant_id', 7, true),
    (8, 'sale_tickets', 'Sale Tickets', 'Livestock sale records', 'table', 'sale_tickets', 'livestock', true, 'tenant_id', 8, true),
    (9, 'sale_ticket_items', 'Sale Ticket Items', 'Individual items on sale tickets', 'table', 'sale_ticket_items', 'livestock', true, 'tenant_id', 9, true),
    (10, 'pastures', 'Pastures', 'Pasture and paddock records', 'table', 'pastures', 'pastures', true, 'tenant_id', 1, true),
    (11, 'pasture_rotations', 'Pasture Rotations', 'Grazing rotation history', 'table', 'pasture_rotations', 'pastures', true, 'tenant_id', 2, true),
    (12, 'pasture_conditions', 'Pasture Conditions', 'Pasture condition assessments', 'table', 'pasture_conditions', 'pastures', true, 'tenant_id', 3, true),
    (13, 'water_sources', 'Water Sources', 'Water source inventory', 'table', 'water_sources', 'pastures', true, 'tenant_id', 4, true),
    (14, 'rainfall_records', 'Rainfall Records', 'Precipitation measurements', 'table', 'rainfall_records', 'pastures', true, 'tenant_id', 5, true),
    (15, 'soil_tests', 'Soil Tests', 'Soil analysis results', 'table', 'soil_tests', 'pastures', true, 'tenant_id', 6, true),
    (16, 'weed_treatments', 'Weed Treatments', 'Weed control applications', 'table', 'weed_treatments', 'pastures', true, 'tenant_id', 7, true),
    (17, 'transactions', 'Transactions', 'Income and expense transactions', 'table', 'transactions', 'financial', true, 'tenant_id', 1, true),
    (18, 'accounts_chart', 'Chart of Accounts', 'GL account definitions', 'table', 'accounts_chart', 'financial', true, 'tenant_id', 2, true),
    (19, 'journal_entries', 'Journal Entries', 'Accounting journal entries', 'table', 'journal_entries', 'financial', true, 'tenant_id', 3, true),
    (20, 'journal_lines', 'Journal Lines', 'Individual journal entry lines', 'table', 'journal_lines', 'financial', true, 'tenant_id', 4, true),
    (21, 'bank_accounts', 'Bank Accounts', 'Connected bank accounts', 'table', 'bank_accounts', 'financial', true, 'tenant_id', 5, true),
    (22, 'vendors', 'Vendors', 'Vendor/supplier records', 'table', 'vendors', 'financial', true, 'tenant_id', 6, true),
    (23, 'menu_items', 'Menu Items', 'Restaurant menu items', 'table', 'menu_items', 'restaurant', true, 'tenant_id', 1, true),
    (24, 'restaurant_orders', 'Restaurant Orders', 'POS orders', 'table', 'restaurant_orders', 'restaurant', true, 'tenant_id', 2, true),
    (25, 'restaurant_order_items', 'Order Items', 'Individual order line items', 'table', 'restaurant_order_items', 'restaurant', true, 'tenant_id', 3, true),
    (26, 'menus', 'Menus', 'Menu configurations', 'table', 'menus', 'restaurant', true, 'tenant_id', 4, true),
    (27, 'accounts', 'User Accounts', 'System user accounts', 'table', 'accounts', 'customers', true, 'tenant_id', 1, true),
    (28, 'customers', 'Customers', 'Customer records', 'table', 'customers', 'customers', true, 'tenant_id', 2, true),
    (29, 'memberships', 'Memberships', 'Customer memberships', 'table', 'memberships', 'customers', true, 'tenant_id', 3, true),
    (30, 'orders', 'Ecommerce Orders', 'Online store orders', 'table', 'orders', 'customers', true, 'tenant_id', 4, true)
) AS v(id, record_name, display_name, description, source_type, source_name, category, is_tenant_filtered, tenant_id_column, sort_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.report_record_definitions LIMIT 1);

SELECT setval('public.report_record_definitions_id_seq', COALESCE((SELECT MAX(id) FROM public.report_record_definitions), 0) + 1, false);

INSERT INTO public.report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, default_selected, format_hint, sort_order)
SELECT * FROM (VALUES
    (1, 'tag_number', 'Tag Number', 'text', NULL::jsonb, true, true, true, NULL, 1),
    (1, 'name', 'Name', 'text', NULL::jsonb, true, true, true, NULL, 2),
    (1, 'species', 'Species', 'enum', '["Cattle","Sheep","Goat","Poultry","Guard Dog","Other"]'::jsonb, true, true, true, NULL, 3),
    (1, 'breed', 'Breed', 'text', NULL::jsonb, true, true, false, NULL, 4),
    (1, 'status', 'Status', 'enum', '["Active","Sold","Dead","Reference","Processed"]'::jsonb, true, true, true, NULL, 5),
    (1, 'sex', 'Sex', 'enum', '["Male","Female","Unknown"]'::jsonb, true, true, false, NULL, 6),
    (1, 'birth_date', 'Birth Date', 'date', NULL::jsonb, true, true, true, NULL, 7),
    (1, 'purchase_date', 'Purchase Date', 'date', NULL::jsonb, true, true, false, NULL, 8),
    (1, 'purchase_price', 'Purchase Price', 'currency', NULL::jsonb, true, true, false, 'currency', 9),
    (1, 'sale_date', 'Sale Date', 'date', NULL::jsonb, true, true, false, NULL, 10),
    (1, 'sale_price', 'Sale Price', 'currency', NULL::jsonb, true, true, false, 'currency', 11),
    (1, 'current_weight', 'Current Weight', 'number', NULL::jsonb, true, true, false, 'decimal:1', 12),
    (1, 'is_registered', 'Registered', 'boolean', NULL::jsonb, true, true, false, NULL, 13),
    (1, 'registration_number', 'Registration #', 'text', NULL::jsonb, true, false, false, NULL, 14),
    (1, 'created_at', 'Created', 'datetime', NULL::jsonb, false, true, false, NULL, 99),
    (17, 'date', 'Date', 'date', NULL::jsonb, true, true, true, NULL, 1),
    (17, 'description', 'Description', 'text', NULL::jsonb, true, true, true, NULL, 2),
    (17, 'type', 'Type', 'enum', '["income","expense"]'::jsonb, true, true, true, NULL, 3),
    (17, 'amount', 'Amount', 'currency', NULL::jsonb, true, true, true, 'currency', 4),
    (17, 'category', 'Category', 'text', NULL::jsonb, true, true, false, NULL, 5),
    (17, 'status', 'Status', 'text', NULL::jsonb, true, true, true, NULL, 6),
    (17, 'reference_number', 'Reference #', 'text', NULL::jsonb, true, false, false, NULL, 7),
    (17, 'created_at', 'Created', 'datetime', NULL::jsonb, false, true, false, NULL, 99),
    (23, 'name', 'Item Name', 'text', NULL::jsonb, true, true, true, NULL, 1),
    (23, 'description', 'Description', 'text', NULL::jsonb, true, false, false, NULL, 2),
    (23, 'price', 'Price', 'currency', NULL::jsonb, true, true, true, 'currency', 3),
    (23, 'category', 'Category', 'text', NULL::jsonb, true, true, true, NULL, 4),
    (23, 'is_available', 'Available', 'boolean', NULL::jsonb, true, true, true, NULL, 5),
    (23, 'display_order', 'Display Order', 'number', NULL::jsonb, false, true, false, NULL, 6),
    (23, 'created_at', 'Created', 'datetime', NULL::jsonb, false, true, false, NULL, 99)
) AS v(record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, default_selected, format_hint, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.report_field_definitions LIMIT 1);

SELECT setval('public.report_field_definitions_id_seq', COALESCE((SELECT MAX(id) FROM public.report_field_definitions), 0) + 1, false);

-- Done!
SELECT 'Migration complete' AS status;
