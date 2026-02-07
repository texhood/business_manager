# Hood Family Farms Business Manager
# Super Admin User Guide

**Audience:** Platform Administrators  
**Version:** 2.0  
**Last Updated:** February 2026

---

## Table of Contents

1. [Introduction](#introduction)
2. [Accessing the Onboarding Portal](#accessing-the-onboarding-portal)
3. [Understanding Tenant Management](#understanding-tenant-management)
4. [Creating a New Tenant (7-Step Wizard)](#creating-a-new-tenant-7-step-wizard)
5. [Managing Existing Tenants](#managing-existing-tenants)
6. [Subscription & App Registry](#subscription--app-registry)
7. [Configuring Stripe Connect](#configuring-stripe-connect)
8. [Importing Client Data](#importing-client-data)
9. [System Settings](#system-settings)
10. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
11. [Appendix: Reference Information](#appendix-reference-information)

---

## Introduction

As a Super Admin, you are responsible for onboarding new tenants (clients) onto the Business Manager platform and managing the platform overall. This guide walks you through the complete process from tenant creation through ongoing management.

### Your Responsibilities

- Creating and configuring new tenant accounts via the Onboarding Wizard
- Managing subscription plans and tier-based app access
- Monitoring tenant health and usage across the App Registry
- Managing user access and permissions
- Importing client data from legacy systems
- Configuring system-wide settings
- Troubleshooting tenant issues

### Prerequisites

Before you begin, ensure you have:

- Super Admin credentials for the Onboarding Portal
- Access to Stripe Dashboard (for Connect account management)
- Client business information (name, address, contact details)
- Client's preferred brand color (hex code, optional)
- Any data files to import (CSV format)

---

## Accessing the Onboarding Portal

### Portal URL

```
https://onboarding.busmgr.com
```

### Login Process

1. Navigate to the Onboarding Portal
2. Enter your Super Admin email and password
3. You'll land on the **Dashboard**

> **Note:** Only users with the `super_admin` role can access the Onboarding Portal. Regular tenant users attempting to log in will be denied.

### Portal Navigation

The Onboarding Portal has a sidebar with the following sections:

```
🛡️ System Admin
│
├── Main
│   ├── Dashboard          → System overview and tenant health
│   ├── Tenants            → List and manage all tenants
│   └── New Tenant         → Launch 7-step Onboarding Wizard
│
└── System
    └── Settings           → Global system configuration
```

### Dashboard Overview

The Dashboard displays key platform metrics:

| Section | Description |
|---------|-------------|
| **Total Tenants** | Count of all tenant accounts |
| **Active Tenants** | Currently active tenants |
| **Total Users** | Non-super-admin user count across all tenants |
| **Transactions (30d)** | Transaction volume in the last 30 days |
| **System Health** | Overall platform health indicator |
| **Recent Tenants** | Quick links to recently created/updated tenants |

---

## Understanding Tenant Management

### What is a Tenant?

A tenant represents a single business (client) using the platform. Each tenant has:

- **Unique Identifier**: UUID primary key assigned at creation
- **Slug**: URL-friendly name (e.g., `freds-farm`) used in all subdomain URLs
- **Subdomains**: Access to applications at `{slug}.{app}.busmgr.com`
- **Isolated Data**: Complete data separation from other tenants via `tenant_id` filtering
- **Custom Branding**: Primary color applied to Back Office UI, plus logo
- **Subscription Tier**: Determines which apps are accessible via the App Registry

### Tenant Lifecycle

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Created   │ ──▶ │  Configured │ ──▶ │   Active    │ ──▶ │  Suspended  │
│  (Wizard)   │     │ (Post-setup)│     │             │     │  (if needed)│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
  Wizard creates:    Tenant completes:    Day-to-day:
  • Tenant record    • Stripe Connect     • Operations
  • Admin user       • Bank connections   • Billing active
  • Subscription     • Products/inventory • Growing usage
  • COA template     • Website pages
  • Brand color      • Staff accounts
```

### Subscription Plans

| Plan | Monthly | Annual | Tier Level | Best For |
|------|---------|--------|-----------|----------|
| **Starter** | $29 | $290/yr | 1 | Small farms, hobby operations |
| **Professional** | $79 | $790/yr | 2 | Active farms with multiple sales channels |
| **Enterprise** | $149 | $1,490/yr | 3 | Large operations, multiple locations |

Annual pricing provides approximately 17% savings (roughly 2 months free).

---

## Creating a New Tenant (7-Step Wizard)

### Launching the Wizard

1. From the sidebar, click **New Tenant** (or from the Tenants list, click **+ New Tenant**)
2. The 7-step Onboarding Wizard opens

### Wizard Steps Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ONBOARDING WIZARD                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Tenant Info ──────────── Name, slug, brand color      │
│  Step 2: Admin User ───────────── Email, password, name        │
│  Step 3: Subscription ─────────── Plan, billing, payment       │
│  Step 4: Business Config ──────── Address, tax rate, timezone  │
│  Step 5: Chart of Accounts ────── COA template selection       │
│  Step 6: Integrations ─────────── Stripe & Plaid flags         │
│  Step 7: Sample Data ──────────── Optional demo data           │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│              → Redirects to Tenant Detail page                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 1: Tenant Info

Creates the core tenant record.

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| **Tenant Name** | ✓ | Display name for the business | "Fred's Family Farm" |
| **URL Slug** | Auto | Auto-generated from name, editable | `freds-family-farm` |
| **Description** | | Brief description of the tenant | "Organic farm in East Texas" |
| **Brand Color** | | Primary UI color (hex), default `#2d5016` | `#1e40af` |

**Important:** 
- The slug becomes part of all URLs (e.g., `freds-family-farm.office.busmgr.com`). Choose carefully — it cannot be changed after creation.
- Six preset colors are offered, plus a custom color picker and hex code input.
- The brand color is applied across the tenant's Back Office sidebar, buttons, and UI accents.

### Step 2: Admin User

Creates the primary administrator account.

| Field | Required | Description |
|-------|----------|-------------|
| **Email Address** | ✓ | Admin login email |
| **Full Name** | | Admin's display name |
| **Password** | ✓ | Minimum 8 characters |
| **Confirm Password** | ✓ | Must match password |
| **Phone Number** | | Contact phone |

The admin user is assigned the `tenant_admin` role with full access to all tenant features.

### Step 3: Subscription

Select the plan, billing interval, and payment approach.

**Plan Selection:** Plans are loaded from the `subscription_plans` database table and displayed as cards. The "Professional" plan is pre-selected (marked as `is_featured`).

**Billing Interval:** Toggle between Monthly and Yearly (~17% savings).

**Payment Options:**

| Option | Description | When to Use |
|--------|-------------|-------------|
| **14-day free trial** | No payment now; tenant adds payment later | Default for new clients |
| **Add payment method now** | Stripe Elements card form; still includes 14-day trial | Client ready to commit |
| **Skip subscription (internal)** | No billing at all | Demo/testing/internal tenants |

### Step 4: Business Configuration

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| **Business Name** | ✓ | From tenant name | Legal business name |
| **Business Type** | | Farm / Ranch | Farm/Ranch, Retail Store, Restaurant, Wholesale, Mixed Operations |
| **Address** | | | Street, City, State, ZIP |
| **Tax Rate** | | 8.25% | Default sales tax rate |
| **Timezone** | | Central Time | Eastern, Central, Mountain, Pacific |

### Step 5: Chart of Accounts

Select a template to initialize the accounting system:

| Template | Description | Best For |
|----------|-------------|----------|
| **Farm Standard** | Complete COA for farm operations including livestock, crops, and retail | Farms and ranches |
| **Retail Standard** | Standard retail business accounts for inventory and sales | Retail stores, market vendors |
| **Restaurant** | Food service focused accounts with cost of goods and labor | Restaurants, food trucks |
| **Minimal** | Basic accounts only — build your own structure | Custom setups |

### Step 6: Integrations

Flag which integrations the tenant plans to use. These are configuration flags only — the tenant must complete the actual setup from within the Back Office after the wizard.

| Integration | Description |
|-------------|-------------|
| **Stripe Connect** | Accept credit card payments via connected account |
| **Plaid Banking** | Sync bank transactions automatically |

When Stripe Connect is enabled, an info box explains the post-wizard setup flow: the admin logs into Back Office → System → Stripe Connect to create their connected account.

### Step 7: Sample Data (Optional)

Load demonstration data to help the tenant explore the platform:

| Option | Description |
|--------|-------------|
| **Product Categories** | Common category structures for farm products |
| **Sample Products** | Example inventory items and pricing |
| **Livestock Reference Data** | Animal types, breeds, and categories |
| **Sample Transactions** | Example journal entries and transactions |

> **Warning:** Sample data is for demonstration purposes. It can be deleted later but may require manual cleanup. Not recommended for production tenants.

### Wizard Completion

Upon clicking **Complete Setup** on Step 7, the system:

1. Provisions all tenant records and relationships
2. Initializes the chart of accounts from the selected template
3. Loads sample data if selected
4. Marks onboarding as complete
5. Redirects to the **Tenant Detail** page

The tenant's applications are now accessible:

```
Application URLs Created:
─────────────────────────
Portal:       {slug}.busmgr.com
Back Office:  {slug}.office.busmgr.com
POS Terminal: {slug}.pos.busmgr.com
Restaurant:   {slug}.rpos.busmgr.com         (Professional+)
Kitchen:      {slug}.kitchen.busmgr.com       (Professional+)
Herds:        {slug}.herds.busmgr.com         (Professional+)
Ecommerce:    {slug}.app.busmgr.com           (Professional+)

Admin Login:
Email: [as entered in Step 2]
Password: [as entered in Step 2]
```

---

## Managing Existing Tenants

### Tenants List

Navigate to **Tenants** in the sidebar to see all tenants.

**Features:**
- **Search** — Filter by name or slug
- **Status Filter** — All, Active, or Inactive
- **Tenant Cards** — Each shows name, slug, active status, user count, and creation date
- Click any tenant to view its detail page

### Tenant Detail Page

The Tenant Detail page has four tabs:

#### Overview Tab

Displays:
- Tenant name, slug, and status (active/inactive badge)
- Subscription status (trialing, active, etc.)
- Key stats: user count, transaction count, account count, last activity
- Quick action buttons

#### Users Tab

Manage the tenant's user accounts:

- **View Users** — List all users with name, email, role, and status
- **Add User** — Create new user accounts with name, email, password, and role assignment
- **Available Roles:** `tenant_admin`, `admin`, `staff`, `accountant`

**Adding a User:**
1. Click **Add User**
2. Enter email, password, full name
3. Select role from dropdown
4. Click **Create User**
5. User can now log in to the tenant's applications

#### Settings Tab

View and manage tenant configuration:
- Business name, type, address
- Tax rate and timezone
- Brand color and logo

#### Integrations Tab

Monitor integration status:
- Stripe Connect account status
- Plaid banking connection status
- Integration configuration flags

---

## Subscription & App Registry

### App Registry System

The platform uses a **tier-based App Registry** to control which applications each tenant can access. This is managed automatically based on subscription plan.

| Application | Slug | Subdomain | Min. Tier | Category |
|-------------|------|-----------|-----------|----------|
| Back Office | `office` | `{slug}.office.busmgr.com` | 1 (Starter) | Core |
| POS Terminal | `pos` | `{slug}.pos.busmgr.com` | 1 (Starter) | Sales |
| Restaurant POS | `restaurant` | `{slug}.rpos.busmgr.com` | 2 (Professional) | Sales |
| Kitchen Display | `kitchen` | `{slug}.kitchen.busmgr.com` | 2 (Professional) | Operations |
| Herds & Flocks | `herds` | `{slug}.herds.busmgr.com` | 2 (Professional) | Operations |
| Online Store | `ecommerce` | `{slug}.app.busmgr.com` | 2 (Professional) | Sales |
| Site Builder | `site-builder` | Back Office → Site Builder | 3 (Enterprise) | Core |

### How Tier Access Works

1. Each app in the `app_registry` table has a `min_plan_tier` value (1, 2, or 3)
2. Each subscription plan has a `tier_level` (Starter=1, Professional=2, Enterprise=3)
3. The **Tenant Portal** at `{slug}.busmgr.com` dynamically shows only apps at or below the tenant's tier
4. The `tenant_app_access` table tracks per-tenant overrides and usage metrics
5. Super admins can grant `granted_override` to give a tenant access beyond their tier

### Plan Feature Limits

| Limit | Starter (Tier 1) | Professional (Tier 2) | Enterprise (Tier 3) |
|-------|------------------|----------------------|---------------------|
| **Apps** | Office, POS | + Restaurant, Kitchen, Herds, Ecommerce | + Site Builder |
| **Max Products** | 100 | Unlimited | Unlimited |
| **Max Users** | 2 | 10 | Unlimited |
| **Max Locations** | 1 | 3 | Unlimited |

### Tenant Portal

After onboarding, staff access their applications through the **Tenant Portal** at `{slug}.busmgr.com`:

- SSO-powered app launcher with tenant branding
- Shows app cards organized by category (Core, Sales & Commerce, Operations)
- Locked cards for apps above the tenant's subscription tier
- One login → access to all enabled apps via shared cookie

---

## Configuring Stripe Connect

Every tenant needs a Stripe Connected Account to process card payments and receive payouts. This is completed by the tenant admin from within the Back Office — not from the Onboarding Portal.

### Process

1. **During Onboarding Wizard:** Enable the Stripe Connect integration flag (Step 6)
2. **After Wizard:** The tenant admin logs into the Back Office
3. **Back Office → System → Stripe Connect:** Click "Connect with Stripe" or "Set up Stripe Connect"
4. **Stripe Hosted Onboarding:** Admin is redirected to Stripe's hosted onboarding flow
5. **Information Required:**
   - Business legal name and type
   - EIN or SSN (for sole proprietors)
   - Business address
   - Representative personal information (name, DOB, last 4 of SSN)
   - Bank account details (routing + account number)
   - Government-issued ID verification
6. **Completion:** Admin is redirected back to Back Office, status shows "Connected"

### Verification Timeline

| Step | Timeline |
|------|----------|
| Basic information | Instant |
| Bank account verification | 1-2 business days |
| ID verification | Minutes to 1 day |

### Monitoring Connect Status

From the Onboarding Portal's Tenant Detail → Integrations tab, you can see the Stripe Connect status:

| Status | Meaning | Action |
|--------|---------|--------|
| **Not Connected** | Onboarding not started | Remind tenant to complete setup |
| **Pending** | Awaiting verification | Check what Stripe still requires |
| **Restricted** | Limited functionality | Complete outstanding requirements |
| **Enabled** | Fully operational | Ready for payments |

### Testing

Once connected, have the tenant:
1. Process a small test payment ($1.00) through POS
2. Verify it appears in their Stripe dashboard
3. Confirm webhook notifications are received in the backend

---

## Importing Client Data

Help clients migrate data from their existing systems via the Back Office's **System → Data Import** feature.

### Available Import Types

| Data Type | Source Formats | Destination |
|-----------|----------------|-------------|
| **Products** | CSV | Inventory |
| **Livestock** | CSV | Herds & Flocks |
| **Customers** | CSV | Customer Database |
| **Menu Items** | CSV | Restaurant Menus |
| **Chart of Accounts** | CSV, QBO | Accounting |
| **Transactions** | CSV, QBO, OFX | Accounting |

### Import Process

#### 1. Download Template
- Navigate to the tenant's Back Office → System → Data Import
- Select data type
- Click **Download Template**
- Provide template to client for data preparation

#### 2. Prepare Data
Guide the client to:
- Export data from their existing system (QuickBooks, Square, spreadsheets)
- Map columns to match the template format
- Clean up issues: remove duplicates, fix formatting, ensure required fields are populated

#### 3. Upload and Validate
- Client uploads prepared CSV
- System validates: required fields present, data types correct, references valid
- Review validation report

#### 4. Handle Errors

| Error Type | Solution |
|------------|----------|
| Missing required field | Add data to CSV and re-upload |
| Invalid format | Correct formatting (dates, numbers) |
| Duplicate record | Remove or merge duplicates |
| Invalid reference | Create referenced record first |

#### 5. Execute and Verify
- Click **Import Data**
- Review progress and summary report
- Spot-check random records
- Verify counts match expectations

### Import Best Practices

- **Start Small:** Test with 10-20 records before full import
- **Import Order:** Chart of accounts → Categories → Products → Customers → Transactions
- **Backup First:** Export any existing data before importing
- **Document Mappings:** Keep notes on how fields were mapped from the legacy system

---

## System Settings

Navigate to **Settings** in the sidebar to manage global platform configuration.

### Available Settings

| Setting | Default | Description |
|---------|---------|-------------|
| **System Name** | Business Manager | Platform display name |
| **Default Timezone** | America/Chicago | Default timezone for new tenants |
| **Default Tax Rate** | 8.25% | Default tax rate for new tenants |
| **Maintenance Mode** | Off | When enabled, blocks non-admin access |
| **Allow Self Registration** | Off | Whether tenants can self-register (future feature) |
| **Require Email Verification** | On | Require email verification for new accounts |
| **Session Timeout** | 480 min (8 hrs) | Auto-logout after inactivity |
| **Max File Upload** | 10 MB | Maximum file upload size |

---

## Monitoring & Troubleshooting

### Dashboard Health Monitoring

The Dashboard provides system-level health indicators:

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| **Active Tenants** | Tenants with recent activity | Track trends |
| **Total Users** | Users across all tenants | Monitor growth |
| **Transaction Volume** | Payments in last 30 days | Watch for drops |
| **System Health** | Database connectivity | Any failures |

### Common Issues and Solutions

#### "Tenant can't log in"

1. Verify user account exists in Tenant Detail → Users tab
2. Check if the user's role allows access to the app they're trying to reach
3. Reset password by creating a new user or working with the tenant admin
4. Confirm tenant subdomain DNS is correctly configured
5. Check SSO cookie: all apps must be on `*.busmgr.com` for SSO to work

#### "Payments not processing"

1. Check Stripe Connect status in Tenant Detail → Integrations
2. Verify account shows "Enabled" (not "Pending" or "Restricted")
3. Check Stripe Dashboard for outstanding requirements
4. Test with a small payment
5. Verify webhook endpoints are receiving events

#### "Bank transactions not syncing"

1. Check Plaid connection status in Back Office → Accounting → Bank Connections
2. Re-authenticate if bank session has expired (Plaid sessions can timeout)
3. Manually trigger a sync from the Bank Connections page
4. Check backend logs for Plaid webhook errors

#### "Tenant can't see an app"

1. Verify the tenant's subscription tier in Tenant Detail → Overview
2. Check the App Registry: the app's `min_plan_tier` must be ≤ the tenant's tier
3. Check `tenant_app_access` table for any disabled overrides
4. If needed, grant a `granted_override` for the specific app

#### "Slow performance"

1. Check data volumes (large numbers of products, transactions, or animals)
2. Review recent imports for large data loads
3. Check database indexes are in place
4. Escalate to development team with tenant ID and reproduction steps

### Escalation Path

For issues you cannot resolve:

1. Document the problem with screenshots
2. Note the tenant ID and slug
3. Gather relevant backend logs (Railway logs)
4. Contact development team via internal channels

---

## Appendix: Reference Information

### Tenant Status Values

| Status | Description |
|--------|-------------|
| `active` | Fully operational |
| `inactive` | Deactivated |

### Subscription Status Values

| Status | Description |
|--------|-------------|
| `trialing` | In free trial period |
| `active` | Paid and current |
| `past_due` | Payment failed, grace period |
| `canceled` | Subscription cancelled |
| `unpaid` | Payment failed, past grace period |
| `incomplete` | Initial payment not completed |
| `paused` | Temporarily paused |

### User Roles

| Role | Scope | Description |
|------|-------|-------------|
| `super_admin` | Platform-wide | Onboarding Portal access, manages all tenants |
| `tenant_admin` | Single tenant | Full access to all tenant features and user management |
| `admin` | Single tenant | Full access to tenant features |
| `staff` | Single tenant | Day-to-day operations (POS, orders, basic inventory) |
| `accountant` | Single tenant | Financial views only (Dashboard, Bookkeeping, Bank Feed, Journal Entries, COA, Fixed Assets, Reports) |

### Role Permissions Matrix

| Permission | super_admin | tenant_admin | admin | staff | accountant |
|------------|-------------|-------------|-------|-------|------------|
| Onboarding Portal access | ✓ | — | — | — | — |
| Create/manage tenants | ✓ | — | — | — | — |
| Manage tenant users | ✓ | ✓ | ✓ | — | — |
| View/edit accounting | ✓ | ✓ | ✓ | — | ✓ |
| Manage inventory | ✓ | ✓ | ✓ | ✓ | — |
| Process POS sales | ✓ | ✓ | ✓ | ✓ | — |
| Site management | ✓ | ✓ | ✓ | — | — |
| View reports | ✓ | ✓ | ✓ | Limited | ✓ |
| System settings | ✓ | ✓ | — | — | — |

### Application URL Reference

| Application | Production URL | Dev Port |
|-------------|---------------|----------|
| Backend API | `api.busmgr.com` | 3001 |
| Back Office | `{slug}.office.busmgr.com` | 3000 |
| Herds & Flocks | `{slug}.herds.busmgr.com` | 3002 |
| Restaurant POS | `{slug}.rpos.busmgr.com` | 3003 |
| Kitchen Display | `{slug}.kitchen.busmgr.com` | 3004 |
| POS Terminal | `{slug}.pos.busmgr.com` | 3005 |
| Ecommerce Website | `{slug}.app.busmgr.com` | 3006 |
| Onboarding Portal | `onboarding.busmgr.com` | 3007 |
| Tenant Portal | `{slug}.busmgr.com` | 3008 |

### Key API Endpoints (For Reference)

```
ADMIN ROUTES (require super_admin role)
──────────────────────────────────────────
GET    /admin/system/dashboard    Dashboard stats
GET    /admin/system/settings     Get system settings
PUT    /admin/system/settings     Update system settings
GET    /admin/system/health       Health check

GET    /admin/tenants             List all tenants
POST   /admin/tenants             Create tenant (wizard Step 1)
GET    /admin/tenants/:id         Get tenant details
PUT    /admin/tenants/:id         Update tenant
GET    /admin/tenants/:id/users   List tenant users
POST   /admin/tenants/:id/users   Add user to tenant
GET    /admin/tenants/:id/stats   Get tenant stats

SUBSCRIPTION ROUTES
──────────────────────────────────────────
GET    /admin/subscriptions/plans           List plans
POST   /admin/subscriptions/setup-intent    Create Stripe setup intent
POST   /admin/subscriptions/trial           Create trial subscription
POST   /admin/subscriptions/skip            Skip subscription (internal)

TENANT ROUTES (public)
──────────────────────────────────────────
GET    /tenants/by-slug/:slug     Resolve slug → tenant ID (public)
GET    /tenants/:id/branding      Get tenant branding (public)
```

### Support Resources

| Resource | URL |
|----------|-----|
| Technical issues | support@busmgr.com |
| Account/billing | billing@busmgr.com |
| Onboarding Portal | `onboarding.busmgr.com` |

### Related Documentation

| Document | File | Description |
|----------|------|-------------|
| Architecture | `ARCHITECTURE.md` | Technical platform architecture |
| Tenant Admin Guide | `USER_GUIDE_TENANT_ADMIN.md` | Comprehensive tenant user guide |
| Onboarding Journey | `USER_GUIDE_ONBOARDING_JOURNEY.md` | End-to-end onboarding overview |
| Module Guides | `modules/README.md` | Individual app user guides |

---

*This guide is maintained by the platform team. For corrections or additions, contact the documentation team.*
