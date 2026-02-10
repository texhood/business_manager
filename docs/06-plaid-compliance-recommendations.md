# Plaid Compliance — Platform Enhancement Recommendations

**CR Hood Solutions Business Manager Platform**
**CR Hood Solutions, LLC**

| Field           | Value                                                                        |
| --------------- | ---------------------------------------------------------------------------- |
| Assessment Date | February 10, 2026                                                            |
| Assessed By     | Platform development team in consultation with Plaid compliance requirements |

---

## Summary

This document consolidates all platform enhancements identified during a review of Plaid's Identity and Access Management, Development and Vulnerability Management, Privacy, and Governance and Risk Management requirements. Each recommendation is categorized by priority, current status, and estimated effort.

---

## Recommendations

### 1. Immediate Session Invalidation on Account Deactivation

**Plaid Requirement:** Automating the de-provisioning and modification of access for terminated or transferred employees.

**Finding:** The `authenticate` middleware already queries `is_active` from the database on every request and rejects deactivated accounts immediately, regardless of JWT token validity. No gap exists.

**Status:** ✅ Already implemented — no changes needed.

**Priority:** N/A

---

### 2. Access Change Audit Log

**Plaid Requirement:** Multiple requirements reference the need for audit trails covering access provisioning, modification, and revocation.

**Enhancement:** Created `account_access_log` table and centralized `accessAuditLog.js` utility. Integrated audit logging into account creation, role changes, activation/deactivation, password changes, admin password resets, account deletions, and 2FA enable/disable events. Each entry captures the acting administrator, the affected user, details of the change, IP address, user agent, and timestamp.

**Status:** ✅ Built — migration 057, utility, and route integrations complete. Pending deployment.

**Priority:** Critical

**Effort:** Complete

---

### 3. Access Review Report (Report Builder)

**Plaid Requirement:** Performing periodic access reviews and audits to identify excessive or outdated permissions.

**Enhancement:** Added two Report Builder record types in the Security category: (1) **User Accounts** — name, email, role, active status, MFA enabled, last login, created date; (2) **Access Change Log** — action, affected user, performer, IP, timestamp. Both support filtering, sorting, and CSV export through the existing Report Builder interface.

**Status:** ✅ Built — included in migration 057. Pending deployment.

**Priority:** Critical

**Effort:** Complete

---

### 4. Automated Vulnerability Scanning (GitHub Actions)

**Plaid Requirement:** Actively performing vulnerability scans and establishing a defined SLA for patching vulnerabilities.

**Enhancement:** Created `.github/workflows/vulnerability-scan.yml` that runs `npm audit` on the backend and all seven frontend applications. Scheduled weekly (Monday 8:00 AM UTC), triggered on push when package files change, and available for manual trigger. Scan artifacts are retained 90 days for compliance evidence. Automatically creates a GitHub issue when high or critical vulnerabilities are detected during scheduled runs.

**Status:** ✅ Built — pending commit and push to activate.

**Priority:** High

**Effort:** Complete

---

### 5. MFA Enforcement by Role

**Plaid Requirement:** Implementing MFA on all internal systems, particularly those managing sensitive data.

**Enhancement:** Add a tenant-level or role-level setting that requires MFA for sensitive roles (super_admin, tenant_admin, admin, accountant). Users without MFA configured would be redirected to the setup flow upon login rather than being permitted to continue without it.

**Status:** ⬜ Not yet built

**Priority:** Medium — MFA is currently available and enabled on administrative accounts. Enforcement becomes important when onboarding tenants with multiple users.

**Effort:** Moderate — requires a tenant settings flag, login flow modification to check and redirect, and a setup-required interstitial component.

---

### 6. Consolidated API De-provisioning Endpoint

**Plaid Requirement:** Automating the de-provisioning and modification of access for terminated or transferred employees.

**Enhancement:** A dedicated `POST /api/v1/accounts/:id/deactivate` endpoint that performs account deactivation, session invalidation (via the existing is_active check), and audit log entry in a single atomic operation. Provides a clean, documentable "de-provisioning action" for compliance purposes.

**Status:** ⬜ Not yet built

**Priority:** Medium — the functionality exists across existing endpoints; this wraps it in a single purpose-built action.

**Effort:** Low — thin wrapper around existing logic.

---

### 7. Privacy Policy Publication in Application

**Plaid Requirement:** Developing a comprehensive privacy policy for the application where Plaid Link is deployed.

**Enhancement:** Publish the Privacy Policy (drafted as a companion to this document) as a route within the Back Office application and as a page on each tenant's ecommerce site. Link in the application footer. For the Back Office, a simple static route serving the markdown-rendered policy is sufficient. For ecommerce sites, the Site Builder can include a default privacy policy template that tenants customize.

**Status:** ⬜ Not yet built — policy document drafted, technical implementation pending.

**Priority:** Medium — the drafted policy satisfies the documentation requirement; publishing it in-app is a UX enhancement.

**Effort:** Low for Back Office (static route). Moderate for ecommerce (template integration).

---

### 8. Consent Capture at Data Collection Points

**Plaid Requirement:** Obtaining explicit consent from consumers for the collection, processing, and storing of their data.

**Enhancement:** Add checkbox acceptance of terms and privacy policy during customer account registration and guest checkout. Create a `consent_records` table storing account_id, consent_type, policy version, granted_at timestamp, and IP address. This provides a verifiable record of when and to what each customer consented.

**Status:** ⬜ Not yet built

**Priority:** Low (deferred) — becomes important when ecommerce sites are actively serving customers. Build as part of ecommerce go-live preparation.

**Effort:** Moderate — database table, API endpoint, frontend checkbox components, and privacy policy page linkage.

---

### 9. Customer Data Deletion Endpoint

**Plaid Requirement:** Implementing a defined and enforced data deletion and retention policy.

**Enhancement:** A `DELETE /api/v1/customers/:id` endpoint that cascades through orders, addresses, consent records, and associated data. Includes anonymization capability for records under legal retention holds (replacing PII with anonymized values while preserving the financial record). A customer-facing mechanism to request deletion of their own account and data.

**Status:** ⬜ Not yet built

**Priority:** Low (deferred) — depends on the Data Retention Policy being finalized. Important for CCPA and similar regulatory compliance.

**Effort:** Moderate to high — requires careful cascade logic, anonymization handling, and retention hold awareness.

---

### 10. Automated Data Retention Purging

**Plaid Requirement:** Implementing a defined and enforced data deletion and retention policy.

**Enhancement:** A scheduled background job that identifies data past its defined retention period and performs deletion or anonymization according to the retention schedule. Includes soft-delete with a configurable grace period before hard deletion to allow recovery from accidental deletions.

**Status:** ⬜ Not yet built

**Priority:** Low (deferred) — the most complex enhancement on this list. Only becomes necessary once retention periods are formally established and data volumes warrant automated management.

**Effort:** High — scheduled job infrastructure, per-table retention logic, soft-delete patterns, grace period handling, and comprehensive testing.

---

## Policy Documents

The following policy documents were identified as necessary and have been drafted:

| Document                                     | Status     | Description                                                                     |
| -------------------------------------------- | ---------- | ------------------------------------------------------------------------------- |
| Information Security Policy                  | ✅ Drafted | Foundational ISP covering objectives, accountability, scope, security controls  |
| Access Control Policy                        | ✅ Drafted | Role definitions, provisioning/deprovisioning procedures, access review process |
| Vulnerability Management and Patching Policy | ✅ Drafted | Scanning requirements, patching SLAs by severity, EOL monitoring                |
| Privacy Policy                               | ✅ Drafted | Data collection, Plaid/Stripe data flows, user rights, cookies                  |
| Data Retention and Deletion Policy           | ✅ Drafted | Retention schedules by data category, deletion procedures, legal holds          |

All policy documents require formal review and approval by the Platform Owner before use in attestations.

---

## Priority Summary

### Build Now (complete)

| # | Enhancement                           | Status                   |
| - | ------------------------------------- | ------------------------ |
| 1 | Session invalidation on deactivation  | ✅ Already existed       |
| 2 | Access change audit log               | ✅ Built, pending deploy |
| 3 | Access review reports                 | ✅ Built, pending deploy |
| 4 | GitHub Actions vulnerability scanning | ✅ Built, pending deploy |

### Build at Next Milestone

| # | Enhancement                             | Effort        |
| - | --------------------------------------- | ------------- |
| 5 | MFA enforcement by role                 | Moderate      |
| 6 | Consolidated de-provisioning endpoint   | Low           |
| 7 | Privacy policy published in application | Low–Moderate |

### Defer Until Needed

| #  | Enhancement                        | Dependency                        |
| -- | ---------------------------------- | --------------------------------- |
| 8  | Consent capture at data collection | Ecommerce go-live                 |
| 9  | Customer data deletion endpoint    | Data retention policy finalized   |
| 10 | Automated retention purging        | Data volumes and retention policy |

---

### 11. Update Mode for Broken Bank Connections

**Plaid Requirement:** Implement update mode to fix connected Items that need end-user interaction. Detect ITEM_LOGIN_REQUIRED, PENDING_EXPIRATION, and PENDING_DISCONNECT webhooks and activate an entry point for update mode.

**Enhancement:** Added `POST /api/v1/plaid/create-update-link-token` endpoint that creates a Plaid Link token in update mode for re-authenticating existing Items. Added `POST /api/v1/plaid/update-complete` endpoint that resets item status and triggers a fresh transaction sync. Enhanced webhook handler to detect and differentiate ITEM_LOGIN_REQUIRED (sets status `login_required`), PENDING_EXPIRATION (sets `pending_reauth`), PENDING_DISCONNECT (sets `pending_disconnect`), and USER_PERMISSION_REVOKED (sets `revoked`). Sync error handler also detects ITEM_LOGIN_REQUIRED from API error responses. Frontend shows amber alert banner when any connections need attention, status badges on each bank card, and a "Re-authenticate" button that launches Plaid Link in update mode.

**Status:** ✅ Built — pending deployment.

**Priority:** Critical (Plaid production requirement)

**Effort:** Complete

---

### 12. Access Token Encryption at Rest

**Plaid Requirement:** Store all access tokens securely, associated with the user whose data they represent.

**Enhancement:** Added AES-256-GCM encryption for Plaid access tokens using `PLAID_TOKEN_ENCRYPTION_KEY` environment variable. Tokens are encrypted before database storage (prefixed with `enc:`) and decrypted transparently when needed for API calls. Backward-compatible with legacy plaintext tokens. Includes a one-time migration endpoint `POST /api/v1/plaid/encrypt-tokens` (admin-only) to encrypt existing plaintext tokens in place.

**Status:** ✅ Built — pending deployment and environment variable configuration.

**Priority:** Critical (Plaid production requirement)

**Effort:** Complete

---

### 13. User Offboarding / Item Removal

**Plaid Requirement:** Honor user privacy and manage costs by building offboarding flows for users who have unlinked their accounts or closed their account with you.

**Enhancement:** Already implemented via `DELETE /api/v1/plaid/items/:item_id`. Calls `plaidClient.itemRemove()` to revoke access at Plaid, cleans up plaid_accounts and plaid_items records, and preserves transaction history by nullifying the plaid_account_id foreign key.

**Status:** ✅ Already implemented — no changes needed.

**Priority:** N/A

---

## Deployment Checklist

To activate the completed enhancements:

1. Run migration `057_access_audit_log_and_review_report.sql` on the Railway PostgreSQL database
2. Add `PLAID_TOKEN_ENCRYPTION_KEY` environment variable to Railway (generate a strong random string, e.g. `openssl rand -hex 32`)
3. Commit all changes with descriptive message
4. Push to main branch (triggers Railway backend deploy and Vercel frontend deploys)
5. After deployment, call `POST /api/v1/plaid/encrypt-tokens` to encrypt any existing plaintext access tokens
6. Verify the GitHub Actions workflow appears in the repository's Actions tab
7. Verify the Access Change Log and User Accounts reports appear in the Report Builder under the Security category
8. Test an account action (e.g., role change) and confirm an entry appears in the account_access_log table
9. Review and formally approve all five policy documents

---

*This document was prepared to support Plaid compliance attestation for the Hood Family Farms Business Manager platform operated by CR Hood Solutions, LLC.*
