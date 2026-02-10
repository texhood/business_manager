# Privacy Policy

**CR Hood Solutions Business Manager Platform**
**CR Hood Solutions, LLC**

| Field          | Value                                      |
| -------------- | ------------------------------------------ |
| Document Owner | Robin Hood, Owner & Platform Administrator |
| Effective Date | February 10, 2026                          |
| Last Updated   | February 10, 2026                          |
| Version        | 1.0                                        |

---

## 1. Introduction

CR Hood Solutions, LLC ("we," "our," or "us") operates the CR Hood Solutions Business Manager platform, a multi-tenant software platform that provides business management, point-of-sale, livestock tracking, and ecommerce services to agricultural businesses and their customers.

This Privacy Policy describes how we collect, use, store, protect, and share personal information through our platform. It applies to all users of the platform, including tenant administrators, staff, and end customers who interact with tenant storefronts or services.

## 2. Information We Collect

### Information You Provide Directly

- **Account information:** Name, email address, phone number, mailing address when you create an account or place an order
- **Payment information:** Payment card details are collected and processed directly by Stripe and are never stored on our servers. We receive only transaction confirmation details (amount, status, last four digits of the card) from Stripe.
- **Order information:** Products ordered, delivery preferences, order notes
- **Communications:** Messages or inquiries you send to a tenant business through the platform

### Information Collected Through Third-Party Integrations

**Plaid.** When a tenant administrator connects a bank account through Plaid Link within the Back Office application, Plaid collects banking credentials and account information directly under Plaid's own privacy policy (https://plaid.com/legal/#end-user-privacy-policy). Our platform receives from Plaid:

- Bank account name and type
- Transaction data: dates, amounts, merchant names, and categories
- Account balances

This data is used exclusively for financial management and reconciliation within the tenant's Back Office.

**Stripe.** When processing payments, Stripe collects payment card information directly under Stripe's privacy policy (https://stripe.com/privacy). Our platform receives:

- Transaction confirmation (amount, status, timestamp)
- Last four digits of the payment card
- Stripe customer and charge identifiers

### Information Collected Automatically

- **Access logs:** IP addresses, user agent strings, and timestamps for authenticated requests
- **Access audit logs:** Records of account creation, role changes, deactivation, password changes, and MFA changes, including the identity of the acting administrator

## 3. How We Use Your Information

We use the information we collect for the following purposes:

- **Providing services:** Processing orders, managing accounts, enabling financial management, and operating tenant storefronts
- **Authentication and security:** Verifying your identity, managing access controls, detecting unauthorized access, and maintaining platform security
- **Financial management:** Synchronizing and categorizing bank transactions for tenant accounting and reconciliation through our Plaid integration
- **Communication:** Sending order confirmations, account notifications, and responding to inquiries
- **Platform improvement:** Monitoring platform performance and resolving technical issues

We do not sell personal information to third parties. We do not use personal information for advertising purposes.

## 4. How We Share Your Information

We share personal information only in the following circumstances:

- **With the tenant business:** When you interact with a tenant's storefront or services, the tenant business has access to your account information and order history within their tenant environment
- **With service providers:** We share data with Stripe (payment processing), Plaid (bank account connectivity), Railway (infrastructure hosting), Vercel (frontend hosting), and Cloudflare (CDN and storage) as necessary to operate the platform. These providers process data under their own privacy policies and contractual obligations.
- **Legal requirements:** We may disclose information when required by law, legal process, or government request
- **Protection of rights:** We may disclose information to protect the rights, property, or safety of our users, our platform, or the public

## 5. Data Storage and Security

### Where Data Is Stored

- Account data, transaction records, order history, and operational data are stored in a PostgreSQL database hosted by Railway in the United States
- Frontend application assets are served through Vercel's global CDN
- Payment card data is stored by Stripe and is never stored on our servers
- Bank credentials are stored by Plaid and are never stored on our servers

### How Data Is Protected

- All data in transit is encrypted via TLS (HTTPS)
- Database connections are encrypted in transit
- Passwords are hashed using bcrypt with 12 rounds; plaintext passwords are never stored
- TOTP secrets and recovery codes are stored in hashed form
- Multi-tenant data isolation is enforced at the database query, API middleware, and application layers, ensuring tenant data is never accessible across tenant boundaries
- Access to platform data is controlled through role-based access controls with six defined permission levels
- Multi-factor authentication is available for all users
- Account access changes are logged in an immutable audit trail

## 6. Data Retention

Personal information is retained in accordance with our Data Retention and Deletion Policy. In summary:

- **Financial records** (transactions, invoices, payment records) are retained for 7 years to comply with tax and regulatory requirements
- **Customer account data** is retained for the duration of the account relationship plus 2 years
- **Access and audit logs** are retained for 3 years
- **Bank connection data** (Plaid access tokens and synced transactions) is retained while the connection is active and for 7 years after disconnection for financial record purposes

See the Data Retention and Deletion Policy for complete retention schedules and deletion procedures.

## 7. Your Rights

Depending on your jurisdiction, you may have the following rights regarding your personal information:

- **Access:** You may request a copy of the personal information we hold about you
- **Correction:** You may request correction of inaccurate personal information through your account settings or by contacting the tenant business
- **Deletion:** You may request deletion of your personal information, subject to legal retention requirements. Financial records required for tax compliance may not be deletable within the retention period.
- **Disconnection:** Tenant administrators may disconnect their Plaid bank account connection at any time through the Back Office, which revokes the Plaid access token and stops further data synchronization. Previously synced transactions are retained per the data retention schedule.
- **Portability:** You may request your personal data in a machine-readable format

To exercise any of these rights, contact the tenant business you interact with, or contact us directly at the address provided in Section 10.

## 8. Cookies and Tracking

The platform uses a functional authentication cookie (`busmgr_sso`) to maintain your login session across applications. This cookie is:

- HttpOnly (not accessible to JavaScript)
- Secure (transmitted only over HTTPS in production)
- Scoped to the platform domain
- Expires after 7 days

We do not use advertising cookies, analytics tracking cookies, or third-party tracking technologies on the platform.

## 9. Children's Privacy

The platform is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete that information.

## 10. Contact Information

For questions about this Privacy Policy or to exercise your data rights, contact:

CR Hood Solutions, LLC
Email: robin@crhoodsolutions.com
Address: Robin Hood, 3950 County Road 3802, Bullard, Texas 75757

## 11. Changes to This Policy

We may update this Privacy Policy from time to time. When we make material changes, we will update the "Last Updated" date at the top of this document. Continued use of the platform after changes constitutes acceptance of the updated policy.

---

*This policy supports the Information Security Policy maintained by CR Hood Solutions, LLC.*
