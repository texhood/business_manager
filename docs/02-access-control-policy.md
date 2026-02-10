# Access Control Policy

**CR Hood Solutions Business Manager Platform**
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

This policy defines how access to the CR Hood Solutions Business Manager platform is granted, modified, reviewed, and revoked. It establishes role-based access controls, the principle of least privilege, and procedures for managing the full user access lifecycle.

## 2. Scope

This policy applies to all user accounts on the platform, including platform administrators, tenant administrators, operational staff, accountants, and customers, across all six applications and all tenant environments.

## 3. Principles

**Least Privilege.** Every user is assigned the minimum level of access required to perform their function. Access is never granted on a "just in case" basis.

**Role-Based Access.** Access rights are determined by role assignment, not individual permission grants. This ensures consistency and simplifies auditing.

**Tenant Isolation.** Users can only access data within their assigned tenant. Cross-tenant access is not possible regardless of role, except for super_admin accounts which operate at the platform level.

**Accountability.** All access changes are logged in the access audit trail with the identity of both the acting administrator and the affected user.

## 4. Role Definitions

The platform enforces six roles, listed from most privileged to least privileged:

### super_admin

- **Scope:** Platform-wide, across all tenants
- **Assigned by:** Direct database assignment only (cannot be granted through the UI)
- **Access:** Full access to all platform features, all tenant data, tenant management, and platform configuration
- **Intended for:** Platform owner only

### tenant_admin

- **Scope:** Single tenant
- **Assigned by:** super_admin or another tenant_admin
- **Access:** Full control within their tenant, including user management, all application features, financial data, settings, and integrations
- **Intended for:** Business owners or primary managers of a tenant organization

### admin

- **Scope:** Single tenant
- **Assigned by:** tenant_admin or super_admin
- **Access:** Day-to-day administrative operations, user management for staff-level accounts and below, all operational features
- **Restrictions:** Cannot modify tenant configuration, cannot create or modify tenant_admin accounts
- **Intended for:** Operations managers, shift supervisors

### staff

- **Scope:** Single tenant
- **Assigned by:** admin, tenant_admin, or super_admin
- **Access:** Operational features needed for daily work — POS operations, livestock management, order processing
- **Restrictions:** No access to user management, financial reporting, or system configuration
- **Intended for:** Front-line employees, farm hands, kitchen staff

### accountant

- **Scope:** Single tenant, financial modules only
- **Assigned by:** admin, tenant_admin, or super_admin
- **Access:** Financial data only — transactions, accounts, bank feeds, financial reports, fixed assets
- **Restrictions:** No access to livestock management, restaurant operations, customer data, user management, or system configuration
- **Intended for:** External bookkeepers, CPAs, or financial consultants

### customer

- **Scope:** Single tenant, own account only
- **Assigned by:** Self-registration or created by staff and above
- **Access:** Own account profile, order history, ecommerce storefront browsing and purchasing
- **Restrictions:** Cannot access any internal systems, other customers' data, or administrative functions
- **Intended for:** End consumers and farm members

## 5. Granting Access

### New Account Creation

- Internal accounts (staff, admin, accountant, tenant_admin) may only be created by users with admin-level access or above
- The super_admin role cannot be assigned through the application interface; it requires direct database modification
- tenant_admin accounts may only be created by existing tenant_admin or super_admin users
- Customer accounts may be created by staff-level users or above, or through self-registration on ecommerce sites
- All account creation events are recorded in the access audit log

### Role Assignment Rules

- A user may not assign a role higher than their own (enforced by the API)
- Role assignment is validated server-side; client-side restrictions alone are not relied upon
- Each account is assigned exactly one role; there are no compound roles or individual permission overrides

## 6. Modifying Access

### Role Changes

- Role changes are performed by authorized administrators through the Back Office user management interface
- Changes take effect immediately upon save
- Role changes are recorded in the access audit log, capturing both the previous role and the new role
- The acting administrator's identity is recorded with every change

### Tenant Reassignment

- Moving a user between tenants requires super_admin access
- This operation is rare and should be documented outside the system as well

## 7. Revoking Access

### Account Deactivation

When an employee departs, changes roles, or no longer requires access:

1. An authorized administrator (admin or above) navigates to the user's account in the Back Office
2. The administrator sets the account status to inactive (deactivated)
3. The deactivation takes effect immediately — the authentication middleware checks account active status on every request and denies access to deactivated accounts regardless of existing token validity
4. The deactivation event is recorded in the access audit log with the administrator's identity and timestamp

### Timeliness

- Accounts for departed employees or contractors must be deactivated within 24 hours of their last working day
- Accounts for personnel whose roles change must be modified to reflect their new access requirements on the same day the change takes effect

### Account Deletion

- Account deletion permanently removes the account record
- Deletion may only be performed by admin-level users or above
- Users may not delete their own account
- Deletion events are recorded in the access audit log
- Deletion should only be used when the account record is no longer needed; deactivation is preferred for audit trail preservation

## 8. Authentication Requirements

### Passwords

- Minimum 8 characters required
- Passwords are hashed using bcrypt with 12 rounds before storage
- Plaintext passwords are never stored or logged
- Users may change their own password through any application's security settings
- Administrators may reset passwords for users within their authorization scope

### Multi-Factor Authentication (MFA)

- TOTP-based multi-factor authentication is available for all users
- MFA is recommended for all accounts with admin-level access or above
- MFA is recommended for all accountant accounts due to their access to financial data
- Users configure MFA through their security settings in any application
- Recovery codes are generated at MFA setup for backup access
- Disabling MFA requires password confirmation

### Session Management

- Authentication tokens (JWT) expire after 7 days
- SSO cookies enable cross-application access without re-authentication
- Account active status is verified on every authenticated request, providing real-time session invalidation for deactivated accounts
- Logout clears the SSO cookie

## 9. Access Reviews

### Quarterly Review

The Platform Owner or designated administrator conducts a quarterly access review:

1. Generate the **User Accounts** report from the Report Builder (Security category), including: name, email, role, active status, MFA enabled, last login date, and account creation date
2. Review each active account to verify:
   - The account is still needed (user is still associated with the organization)
   - The assigned role is appropriate for the user's current responsibilities
   - MFA is enabled for accounts with elevated access
   - The account has been used recently (flag accounts with no login in 90+ days)
3. Take corrective action for any findings: deactivate stale accounts, adjust roles, follow up on MFA enrollment
4. Export the report as CSV and retain as evidence of the review
5. Document any corrective actions taken

### Review Schedule

| Quarter | Review Period | Due Date |
|---|---|---|
| Q1 | January 1 – March 31 | April 15 |
| Q2 | April 1 – June 30 | July 15 |
| Q3 | July 1 – September 30 | October 15 |
| Q4 | October 1 – December 31 | January 15 |

### Access Change Audit

The **Access Change Log** report (Security category in Report Builder) provides a complete audit trail of all access-related events. This report may be generated at any time to investigate specific events or to supplement the quarterly access review.

Logged events include: account creation, account deactivation, account reactivation, account deletion, role changes, password changes, administrator-initiated password resets, MFA enablement, and MFA disablement.

Each log entry records the action performed, the affected user, the acting administrator, an IP address, a user agent, and a timestamp.

## 10. Policy Compliance

Failure to follow this policy may result in suspension of administrative privileges pending review. Persistent or willful violations may result in account deactivation and termination of platform access.

---

*This policy supports the Information Security Policy maintained by CR Hood Solutions, LLC.*
