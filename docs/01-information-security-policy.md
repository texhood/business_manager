# Information Security Policy

**CR Hood Solutions Business Manager Platform**
**CR Hood Solutions, LLC**

| Field          | Value                                      |
| -------------- | ------------------------------------------ |
| Document Owner | Robin Hood, Owner & Platform Administrator |
| Approved By    | Robin Hood                                 |
| Effective Date | February 10, 2026                          |
| Last Reviewed  | February 10, 2026                          |
| Next Review    | February 10, 2027                          |
| Version        | 1.0                                        |

---

## 1. Purpose

This Information Security Policy (ISP) establishes the foundation for the information security program at CR Hood Solutions, LLC, the organization responsible for the CR Hood Solutions Business Manager platform. It defines objectives, establishes accountability, sets scope, and outlines the commitment to protecting the confidentiality, integrity, and availability of information assets across all platform operations.

## 2. Scope

This policy applies to:

- The CR Hood Solutions Business Manager platform and all six constituent applications: Back Office, Herds & Flocks, Restaurant POS, POS Terminal, Kitchen Display System, and Onboarding Portal
- All tenant-facing ecommerce sites hosted on the platform
- All production infrastructure, including Railway backend services, PostgreSQL databases, and Vercel frontend deployments
- All third-party integrations, including Stripe Connect, Plaid, and Cloudflare
- All personnel with access to the platform, including the platform owner, any staff, contractors, and tenant administrators
- All data processed by the platform, including financial records, customer information, livestock records, and operational data

## 3. Objectives

The information security program exists to:

- Protect the confidentiality of tenant data through strict multi-tenant isolation at the database, API, and application layers
- Maintain the integrity of financial, operational, and personal data processed by the platform
- Ensure the availability of platform services for all tenants and their end users
- Comply with applicable regulations and contractual obligations, including those required by payment processors and financial data providers
- Build and maintain trust with tenants, their customers, and integration partners

## 4. Accountability

**Platform Owner (Robin Hood)** holds ultimate responsibility for the information security program and is accountable for:

- Approval and maintenance of all security policies
- Oversight of access control decisions, including user provisioning and de-provisioning
- Response to security incidents and vulnerability findings
- Ensuring compliance with this policy and all supporting policies
- Conducting or delegating periodic access reviews

**Tenant Administrators** are responsible for:

- Managing user accounts within their tenant according to platform access control policies
- Reporting suspected security incidents to the platform owner
- Ensuring their users follow acceptable use practices

**All Users** are responsible for:

- Protecting their authentication credentials
- Enabling multi-factor authentication when available, and when required by role
- Reporting suspicious activity or security concerns

## 5. Security Principles

The platform's security program is built on the following principles:

**Defense in Depth.** Security controls are implemented at multiple layers. Tenant isolation is enforced at the database query level, API middleware, and frontend routing. Authentication is verified on every request. Authorization checks are applied per endpoint.

**Least Privilege.** Users are granted the minimum access necessary for their role. The platform implements six role tiers (super_admin, tenant_admin, admin, staff, accountant, customer), each with progressively restricted permissions. The accountant role, for example, is limited exclusively to financial modules.

**Zero Trust Alignment.** No request is implicitly trusted. Every API request requires authentication regardless of origin, and authorization is evaluated contextually based on the user's role and tenant membership. All communication occurs over encrypted channels (HTTPS/TLS).

**Continuous Verification.** Account status is verified against the database on every authenticated request. Deactivated accounts are immediately denied access regardless of token validity.

## 6. Supporting Policies

This ISP is supported by the following detailed policies, each addressing specific domains of the security program:

- **Access Control Policy** — Role-based access control, user provisioning and de-provisioning, access review procedures
- **Vulnerability Management and Patching Policy** — Dependency scanning, patching SLAs, EOL software monitoring
- **Privacy Policy** — Data collection, processing, storage, and user rights
- **Data Retention and Deletion Policy** — Retention schedules, deletion procedures, and data lifecycle management

## 7. Technical Security Controls

The following technical controls are implemented across the platform:

**Authentication and Access Management**

- Centralized identity system with a single accounts database serving all applications
- JWT-based authentication with SSO cookie for cross-application access
- TOTP-based multi-factor authentication available for all users
- Password requirements enforcing minimum 8-character length with bcrypt hashing (12 rounds)
- Session tokens with defined expiry periods
- Real-time account status verification on every authenticated request

**Data Protection**

- All data in transit encrypted via TLS (enforced by Railway and Vercel)
- Database connections encrypted in transit
- Multi-tenant data isolation enforced at every query via tenant_id filtering
- Sensitive fields (passwords, TOTP secrets, recovery codes) stored using industry-standard hashing

**Infrastructure Security**

- Production infrastructure hosted on managed platforms (Railway, Vercel) with provider-managed OS patching and infrastructure security
- Rate limiting on API endpoints to prevent abuse
- CORS policies restricting cross-origin requests to approved domains
- Security headers (Helmet.js) applied to all responses
- Graceful shutdown handling to prevent data loss

**Monitoring and Audit**

- Structured application logging of authentication events, access changes, and errors
- Access change audit log recording all user provisioning, role changes, de-provisioning, password changes, and MFA changes
- Request logging with IP address and user agent tracking
- Report Builder with Security category reports for access reviews

## 8. Incident Response

Security incidents are handled through the following process:

1. **Identification** — Detected through monitoring, user reports, or third-party notifications
2. **Containment** — Affected accounts deactivated immediately; compromised tokens invalidated through account status checks
3. **Investigation** — Audit logs reviewed to determine scope and impact
4. **Remediation** — Vulnerabilities patched, access restored or permanently revoked as appropriate
5. **Documentation** — Incident documented with timeline, impact assessment, and corrective actions

## 9. Policy Review

This policy and all supporting policies are reviewed annually or whenever significant changes occur to the platform architecture, regulatory requirements, or threat landscape. Reviews are documented and any updates require approval from the Platform Owner.

## 10. Compliance

Violations of this policy by platform personnel may result in disciplinary action up to and including termination of access. Tenant administrators who fail to comply with access management requirements may have their administrative privileges suspended pending review.

---

*This policy was approved and is maintained by CR Hood Solutions, LLC. Questions or concerns should be directed to the Platform Owner.*
