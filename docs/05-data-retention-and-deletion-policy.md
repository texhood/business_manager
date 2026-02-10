# Data Retention and Deletion Policy

**Hood Family Farms Business Manager Platform**
**CR Hood Solutions, LLC**

| Field | Value |
|---|---|
| Document Owner | Robin Hood, Owner & Platform Administrator |
| Approved By | Robin Hood |
| Effective Date | February 10, 2026 |
| Last Reviewed | February 10, 2026 |
| Next Review | February 10, 2027 |
| Version | 1.0 |

---

## 1. Purpose

This policy defines retention periods for the categories of data processed by the Hood Family Farms Business Manager platform and establishes procedures for securely deleting data that is no longer required. It ensures compliance with applicable data privacy regulations and minimizes risk associated with unnecessary data retention.

## 2. Scope

This policy applies to all data stored within the platform's PostgreSQL database, file storage systems, and third-party integrations, including data for all tenants and their end users.

## 3. Retention Schedule

### Financial Records

| Data Type | Retention Period | Justification |
|---|---|---|
| Transactions (bank feeds, synced via Plaid) | 7 years from transaction date | IRS record retention requirements |
| Payment records (Stripe transaction confirmations) | 7 years from transaction date | IRS record retention requirements |
| Invoices and orders with financial data | 7 years from order date | IRS record retention requirements |
| Journal entries and accounting records | 7 years from entry date | IRS record retention requirements |
| Fixed asset records and depreciation schedules | 7 years after asset disposal | IRS record retention requirements |

### Customer and Account Data

| Data Type | Retention Period | Justification |
|---|---|---|
| Active user accounts (all roles) | Duration of active use | Operational necessity |
| Deactivated internal accounts (staff, admin, etc.) | 2 years after deactivation | Audit trail and dispute resolution |
| Customer accounts (inactive) | 2 years after last activity | Customer service and order history |
| Customer shipping/delivery addresses | Duration of account retention | Associated with account lifecycle |
| Farm membership records | Duration of account retention + 2 years | Membership history and audit |

### Operational Data

| Data Type | Retention Period | Justification |
|---|---|---|
| Livestock records (herds, flocks, events) | Duration of tenant subscription + 2 years | Agricultural record keeping |
| Processing records (butchering workflows) | 7 years from processing date | Food safety traceability |
| Rainfall and pasture records | Duration of tenant subscription + 2 years | Agricultural record keeping |
| Menu items and restaurant configurations | Duration of tenant subscription | Operational necessity |
| POS order history | 7 years from order date | Financial record requirements |

### Security and Audit Data

| Data Type | Retention Period | Justification |
|---|---|---|
| Access audit log (account_access_log) | 3 years from event date | Compliance evidence and investigation |
| Application request logs | 90 days | Troubleshooting and security monitoring |
| Authentication event logs | 1 year | Security monitoring |
| Report run history | 1 year | Usage tracking |

### Third-Party Integration Data

| Data Type | Retention Period | Justification |
|---|---|---|
| Plaid access tokens | Duration of active connection | Operational necessity; revoked on disconnect |
| Plaid synced transactions | 7 years from transaction date | Financial record requirements |
| Stripe Connect account references | Duration of tenant subscription | Payment processing |
| Stripe payment intent / charge IDs | 7 years from transaction date | Financial record requirements |

### Tenant Data

| Data Type | Retention Period | Justification |
|---|---|---|
| Tenant configuration and settings | Duration of subscription + 90 days | Grace period for reactivation |
| Tenant branding and assets | Duration of subscription + 90 days | Grace period for reactivation |
| Site builder content and pages | Duration of subscription + 90 days | Grace period for reactivation |
| Blog posts and media | Duration of subscription + 90 days | Grace period for reactivation |

## 4. Deletion Procedures

### Routine Deletion

As the platform matures, automated deletion processes will be implemented to purge data that has exceeded its retention period. Until automated processes are in place, the Platform Owner conducts a semi-annual review of data retention compliance and performs manual deletions as needed.

### Customer-Initiated Deletion Requests

When a customer requests deletion of their personal data:

1. Verify the identity of the requesting party
2. Identify all data associated with the customer account
3. Determine which data is subject to legal retention requirements (financial records within the 7-year window may not be deleted)
4. Delete all data not subject to retention holds
5. For data under retention holds, anonymize personally identifiable fields where possible (replace name and email with anonymized values while retaining the financial record)
6. Confirm deletion to the requesting party, noting any data retained under legal obligation

### Tenant Offboarding

When a tenant's subscription is cancelled:

1. Tenant access is suspended immediately or at the end of the billing period per the cancellation terms
2. Tenant data is retained for a 90-day grace period to allow for reactivation or data export
3. After the grace period, the Platform Owner initiates deletion of tenant-specific data
4. Financial records within the 7-year retention window are retained in anonymized form if the tenant requests full deletion
5. The tenant's access audit log entries are retained per the 3-year audit log retention period regardless of tenant deletion

### Plaid Data Disconnection

When a tenant disconnects a bank account from Plaid:

1. The Plaid access token is revoked, stopping further data synchronization
2. Previously synced transaction data is retained per the 7-year financial record retention schedule
3. Bank account identifiers (account name, institution name) are retained alongside the transaction records for reference

### Secure Deletion Methods

- Database records are deleted using SQL DELETE operations, which remove data from active tables
- For sensitive data requiring secure erasure, database VACUUM operations reclaim the storage space
- File storage deletions are performed through the hosting provider's API, which handles physical storage reclamation
- Backups containing deleted data are rotated out per the backup retention schedule maintained by the hosting provider (Railway)

## 5. Data Minimization

The platform follows data minimization principles:

- Only data necessary for the stated purpose is collected
- Sensitive financial credentials (bank passwords, full card numbers) are never stored on the platform; they are handled exclusively by Plaid and Stripe respectively
- Password hashes use one-way hashing (bcrypt); original passwords cannot be recovered
- The accountant role demonstrates data minimization in access — financial consultants see only the data relevant to their function

## 6. Legal Holds

If the organization becomes aware of pending or anticipated litigation, regulatory investigation, or audit that may involve platform data:

1. A legal hold is issued identifying the affected data categories and tenants
2. All automated and manual deletion of the affected data is suspended
3. The hold remains in effect until released by the Platform Owner following resolution of the legal matter
4. Legal holds take precedence over routine retention schedules

## 7. Recordkeeping

The following records document data retention compliance:

- This policy document with review dates
- Access audit logs documenting account deletions and deactivations
- Records of customer deletion requests and their resolution
- Records of tenant offboarding and data deletion

## 8. Policy Review

This policy is reviewed annually or when significant changes occur to data processing activities, applicable regulations, or the platform's data architecture.

---

*This policy supports the Information Security Policy maintained by CR Hood Solutions, LLC.*
