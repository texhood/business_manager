-- ============================================================================
-- CR Hood Solutions BUSINESS MANAGER
-- Migration: 057_access_audit_log_and_review_report.sql
-- Description: Access change audit log table and Access Review report
--              definitions for Plaid compliance attestation support
-- ============================================================================

-- ============================================================================
-- ACCOUNT ACCESS LOG
-- Records every access-related change: role changes, activation/deactivation,
-- password resets, 2FA changes, account creation, and account deletion.
-- Provides the audit trail required for IAM compliance attestations.
-- ============================================================================

CREATE TABLE IF NOT EXISTS account_access_log (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       UUID REFERENCES tenants(id),
    action          VARCHAR(50) NOT NULL,
    target_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    target_email    VARCHAR(255),
    target_name     VARCHAR(255),
    performed_by_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    performed_by_email VARCHAR(255),
    performed_by_name VARCHAR(255),
    details         JSONB DEFAULT '{}',
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common query patterns
CREATE INDEX idx_access_log_tenant      ON account_access_log(tenant_id);
CREATE INDEX idx_access_log_target      ON account_access_log(target_account_id);
CREATE INDEX idx_access_log_performed   ON account_access_log(performed_by_id);
CREATE INDEX idx_access_log_action      ON account_access_log(action);
CREATE INDEX idx_access_log_created     ON account_access_log(created_at);
CREATE INDEX idx_access_log_tenant_date ON account_access_log(tenant_id, created_at DESC);

-- ============================================================================
-- REPORT BUILDER: Access Review Report
-- Allows admins to run periodic access reviews showing all active users,
-- their roles, last login, and 2FA status.
-- ============================================================================

-- Record definition: User Accounts (for access review)
INSERT INTO report_record_definitions (record_name, display_name, description, source_type, source_name, category, is_tenant_filtered, tenant_id_column, sort_order, is_active)
VALUES (
    'user_accounts',
    'User Accounts',
    'All user accounts with roles, login activity, and security status. Use for periodic access reviews.',
    'table',
    'accounts',
    'Security',
    true,
    'tenant_id',
    100,
    true
) ON CONFLICT (record_name) DO NOTHING;

-- Field definitions for user_accounts
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'user_accounts'), 'name', 'Name', 'text', NULL, true, true, false, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'user_accounts'), 'email', 'Email', 'text', NULL, true, true, false, false, true, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'user_accounts'), 'role', 'Role', 'enum', '["super_admin","tenant_admin","admin","staff","accountant","customer"]', true, true, true, false, true, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'user_accounts'), 'is_active', 'Active', 'boolean', NULL, true, true, true, false, true, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'user_accounts'), 'totp_enabled', 'MFA Enabled', 'boolean', NULL, true, true, true, false, true, NULL, 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'user_accounts'), 'last_login', 'Last Login', 'datetime', NULL, true, true, false, false, true, 'datetime', 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'user_accounts'), 'created_at', 'Account Created', 'datetime', NULL, true, true, false, false, false, 'datetime', 70),
((SELECT id FROM report_record_definitions WHERE record_name = 'user_accounts'), 'updated_at', 'Last Updated', 'datetime', NULL, true, true, false, false, false, 'datetime', 80)
ON CONFLICT (record_id, field_name) DO NOTHING;

-- Record definition: Access Change Log
INSERT INTO report_record_definitions (record_name, display_name, description, source_type, source_name, category, is_tenant_filtered, tenant_id_column, sort_order, is_active)
VALUES (
    'access_change_log',
    'Access Change Log',
    'Audit trail of all access-related changes including role changes, activations, deactivations, password resets, and 2FA changes.',
    'table',
    'account_access_log',
    'Security',
    true,
    'tenant_id',
    110,
    true
) ON CONFLICT (record_name) DO NOTHING;

-- Field definitions for access_change_log
INSERT INTO report_field_definitions (record_id, field_name, display_name, data_type, enum_values, is_filterable, is_sortable, is_groupable, is_aggregatable, default_selected, format_hint, sort_order) VALUES
((SELECT id FROM report_record_definitions WHERE record_name = 'access_change_log'), 'action', 'Action', 'enum', '["account_created","account_deactivated","account_reactivated","account_deleted","role_changed","password_changed","password_reset_by_admin","2fa_enabled","2fa_disabled","login_success","login_failed"]', true, true, true, false, true, NULL, 10),
((SELECT id FROM report_record_definitions WHERE record_name = 'access_change_log'), 'target_name', 'Affected User', 'text', NULL, true, true, false, false, true, NULL, 20),
((SELECT id FROM report_record_definitions WHERE record_name = 'access_change_log'), 'target_email', 'Affected Email', 'text', NULL, true, true, false, false, true, NULL, 30),
((SELECT id FROM report_record_definitions WHERE record_name = 'access_change_log'), 'performed_by_name', 'Performed By', 'text', NULL, true, true, true, false, true, NULL, 40),
((SELECT id FROM report_record_definitions WHERE record_name = 'access_change_log'), 'performed_by_email', 'Performer Email', 'text', NULL, true, true, false, false, false, NULL, 50),
((SELECT id FROM report_record_definitions WHERE record_name = 'access_change_log'), 'ip_address', 'IP Address', 'text', NULL, true, true, false, false, false, NULL, 60),
((SELECT id FROM report_record_definitions WHERE record_name = 'access_change_log'), 'created_at', 'Timestamp', 'datetime', NULL, true, true, false, false, true, 'datetime', 70)
ON CONFLICT (record_id, field_name) DO NOTHING;
