-- ============================================================================
-- TENANT ISOLATION MIGRATION
-- Adds tenant_id to 8 tables that were missing multi-tenant scoping
-- Backfills existing rows with Hood Family Farms tenant UUID
-- Updates unique constraints to be tenant-scoped
-- Adds foreign keys and indexes
-- ============================================================================
-- TABLES MODIFIED:
--   1. classes              (HIGH - financial segment tracking)
--   2. trailer_orders       (HIGH - sales order data)
--   3. delivery_zones       (MEDIUM - operational)
--   4. inventory_logs       (MEDIUM - operational)
--   5. memberships          (MEDIUM - customer data)
--   6. audit_log            (MEDIUM - security)
--   7. report_configurations(MEDIUM - operational)
--   8. journal_entry_lines  (DEFENSE-IN-DEPTH - financial)
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: ADD tenant_id COLUMNS (nullable initially for safe backfill)
-- ============================================================================

ALTER TABLE public.classes
    ADD COLUMN tenant_id uuid;

ALTER TABLE public.trailer_orders
    ADD COLUMN tenant_id uuid;

ALTER TABLE public.delivery_zones
    ADD COLUMN tenant_id uuid;

ALTER TABLE public.inventory_logs
    ADD COLUMN tenant_id uuid;

ALTER TABLE public.memberships
    ADD COLUMN tenant_id uuid;

ALTER TABLE public.audit_log
    ADD COLUMN tenant_id uuid;

ALTER TABLE public.report_configurations
    ADD COLUMN tenant_id uuid;

ALTER TABLE public.journal_entry_lines
    ADD COLUMN tenant_id uuid;

-- ============================================================================
-- STEP 2: BACKFILL existing rows with Hood Family Farms tenant UUID
-- ============================================================================

-- Classes, delivery_zones, report_configurations: standalone tables, backfill directly
UPDATE public.classes
    SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'hood-family-farms')
    WHERE tenant_id IS NULL;

UPDATE public.delivery_zones
    SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'hood-family-farms')
    WHERE tenant_id IS NULL;

UPDATE public.report_configurations
    SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'hood-family-farms')
    WHERE tenant_id IS NULL;

-- Trailer orders: standalone, backfill directly
UPDATE public.trailer_orders
    SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'hood-family-farms')
    WHERE tenant_id IS NULL;

-- Inventory logs: inherit from parent item where possible, fallback to default
UPDATE public.inventory_logs il
    SET tenant_id = i.tenant_id
    FROM public.items i
    WHERE il.item_id = i.id
      AND il.tenant_id IS NULL;

UPDATE public.inventory_logs
    SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'hood-family-farms')
    WHERE tenant_id IS NULL;

-- Memberships: inherit from parent account where possible, fallback to default
UPDATE public.memberships m
    SET tenant_id = a.tenant_id
    FROM public.accounts a
    WHERE m.account_id = a.id
      AND m.tenant_id IS NULL;

UPDATE public.memberships
    SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'hood-family-farms')
    WHERE tenant_id IS NULL;

-- Audit log: backfill directly (no reliable parent to inherit from)
UPDATE public.audit_log
    SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'hood-family-farms')
    WHERE tenant_id IS NULL;

-- Journal entry lines: inherit from parent journal entry
UPDATE public.journal_entry_lines jel
    SET tenant_id = je.tenant_id
    FROM public.journal_entries je
    WHERE jel.journal_entry_id = je.id
      AND jel.tenant_id IS NULL;

UPDATE public.journal_entry_lines
    SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'hood-family-farms')
    WHERE tenant_id IS NULL;

-- ============================================================================
-- STEP 3: SET NOT NULL constraints now that all rows are backfilled
-- ============================================================================

ALTER TABLE public.classes
    ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE public.trailer_orders
    ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE public.delivery_zones
    ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE public.inventory_logs
    ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE public.memberships
    ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE public.audit_log
    ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE public.report_configurations
    ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE public.journal_entry_lines
    ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================================================
-- STEP 4: ADD FOREIGN KEY constraints to tenants table
-- ============================================================================

ALTER TABLE public.classes
    ADD CONSTRAINT classes_tenant_fk
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.trailer_orders
    ADD CONSTRAINT trailer_orders_tenant_fk
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.delivery_zones
    ADD CONSTRAINT delivery_zones_tenant_fk
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.inventory_logs
    ADD CONSTRAINT inventory_logs_tenant_fk
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.memberships
    ADD CONSTRAINT memberships_tenant_fk
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.audit_log
    ADD CONSTRAINT audit_log_tenant_fk
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.report_configurations
    ADD CONSTRAINT report_configurations_tenant_fk
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_tenant_fk
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 5: FIX UNIQUE CONSTRAINTS to be tenant-scoped
-- ============================================================================

-- classes: name must be unique per tenant, not globally
ALTER TABLE public.classes
    DROP CONSTRAINT classes_name_key;

ALTER TABLE public.classes
    ADD CONSTRAINT classes_tenant_name_unique UNIQUE (tenant_id, name);

-- trailer_orders: order_number must be unique per tenant, not globally
ALTER TABLE public.trailer_orders
    DROP CONSTRAINT trailer_orders_order_number_key;

ALTER TABLE public.trailer_orders
    ADD CONSTRAINT trailer_orders_tenant_order_number_unique UNIQUE (tenant_id, order_number);

-- report_configurations: report_type + name must be unique per tenant
ALTER TABLE public.report_configurations
    DROP CONSTRAINT report_configurations_report_type_name_key;

ALTER TABLE public.report_configurations
    ADD CONSTRAINT report_configs_tenant_type_name_unique UNIQUE (tenant_id, report_type, name);

-- ============================================================================
-- STEP 6: ADD INDEXES for tenant-scoped queries
-- ============================================================================

-- classes
DROP INDEX IF EXISTS public.idx_classes_active;
CREATE INDEX idx_classes_tenant ON public.classes(tenant_id);
CREATE INDEX idx_classes_tenant_active ON public.classes(tenant_id, is_active);

-- trailer_orders
CREATE INDEX idx_trailer_orders_tenant ON public.trailer_orders(tenant_id);
CREATE INDEX idx_trailer_orders_tenant_status ON public.trailer_orders(tenant_id, status);

-- delivery_zones
CREATE INDEX idx_delivery_zones_tenant ON public.delivery_zones(tenant_id);
CREATE INDEX idx_delivery_zones_tenant_active ON public.delivery_zones(tenant_id, is_active);

-- inventory_logs
CREATE INDEX idx_inventory_logs_tenant ON public.inventory_logs(tenant_id);
CREATE INDEX idx_inventory_logs_tenant_date ON public.inventory_logs(tenant_id, created_at);

-- memberships
CREATE INDEX idx_memberships_tenant ON public.memberships(tenant_id);
CREATE INDEX idx_memberships_tenant_status ON public.memberships(tenant_id, status);

-- audit_log
CREATE INDEX idx_audit_log_tenant ON public.audit_log(tenant_id);
CREATE INDEX idx_audit_log_tenant_table ON public.audit_log(tenant_id, table_name);
CREATE INDEX idx_audit_log_tenant_date ON public.audit_log(tenant_id, changed_at);

-- report_configurations
DROP INDEX IF EXISTS public.idx_report_config_type;
CREATE INDEX idx_report_config_tenant ON public.report_configurations(tenant_id);
CREATE INDEX idx_report_config_tenant_type ON public.report_configurations(tenant_id, report_type);

-- journal_entry_lines
CREATE INDEX idx_journal_entry_lines_tenant ON public.journal_entry_lines(tenant_id);

-- Clean up duplicate index on journal_entry_lines
-- (idx_journal_entry_lines_class and idx_journal_lines_class are both on class_id)
DROP INDEX IF EXISTS public.idx_journal_entry_lines_class;

-- ============================================================================
-- STEP 7: ADD TABLE AND COLUMN COMMENTS
-- ============================================================================

COMMENT ON COLUMN public.classes.tenant_id IS 'Multi-tenant: Each tenant has their own business segments/classes';
COMMENT ON COLUMN public.trailer_orders.tenant_id IS 'Multi-tenant: Trailer sales orders scoped to tenant';
COMMENT ON COLUMN public.delivery_zones.tenant_id IS 'Multi-tenant: Delivery zones scoped to tenant';
COMMENT ON COLUMN public.inventory_logs.tenant_id IS 'Multi-tenant: Inventory history scoped to tenant';
COMMENT ON COLUMN public.memberships.tenant_id IS 'Multi-tenant: Customer memberships scoped to tenant';
COMMENT ON COLUMN public.audit_log.tenant_id IS 'Multi-tenant: Audit trail scoped to tenant';
COMMENT ON COLUMN public.report_configurations.tenant_id IS 'Multi-tenant: Report configs scoped to tenant';
COMMENT ON COLUMN public.journal_entry_lines.tenant_id IS 'Defense-in-depth: Denormalized from journal_entries for direct-query tenant filtering';

COMMIT;
