# System Administration — User Guide

**Audience:** Platform Administrators  
**Version:** 2.0  
**Last Updated:** February 2026

---

## Overview

As a Super Admin, you are responsible for onboarding new tenants (clients) onto the Business Manager platform and managing the platform overall. This guide covers tenant creation, subscription management, and system monitoring.

### Portal URL

```
https://onboarding.busmgr.com
```

> **Note:** Only users with the `super_admin` role can access the Onboarding Portal.

---

## Portal Navigation

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

### Dashboard

| Section | Description |
|---------|-------------|
| **Total Tenants** | Count of all tenant accounts |
| **Active Tenants** | Currently active tenants |
| **Total Users** | Non-super-admin user count across all tenants |
| **Transactions (30d)** | Transaction volume in the last 30 days |
| **System Health** | Overall platform health indicator |
| **Recent Tenants** | Quick links to recently created/updated tenants |

---

## Creating a New Tenant (7-Step Wizard)

### Wizard Steps

```
Step 1: Tenant Info ──────────── Name, slug, brand color
Step 2: Admin User ───────────── Email, password, name
Step 3: Subscription ─────────── Plan, billing, payment
Step 4: Business Config ──────── Address, tax rate, timezone
Step 5: Chart of Accounts ────── COA template selection
Step 6: Integrations ─────────── Stripe & Plaid flags
Step 7: Sample Data ──────────── Optional demo data
```

### Step 1: Tenant Info

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| **Tenant Name** | ✓ | Display name for the business | "Fred's Family Farm" |
| **URL Slug** | Auto | Auto-generated from name, editable | `freds-family-farm` |
| **Description** | | Brief description of the tenant | "Organic farm in East Texas" |
| **Brand Color** | | Primary UI color (hex), default `#2d5016` | `#1e40af` |

**Important:** The slug becomes part of all URLs (e.g., `freds-family-farm.office.busmgr.com`). Choose carefully — it cannot be changed after creation.

### Step 2: Admin User

| Field | Required | Description |
|-------|----------|-------------|
| **Email Address** | ✓ | Admin login email |
| **Full Name** | | Admin's display name |
| **Password** | ✓ | Minimum 8 characters |
| **Confirm Password** | ✓ | Must match password |
| **Phone Number** | | Contact phone |

### Step 3: Subscription

**Plans:**

| Plan | Monthly | Annual | Tier Level |
|------|---------|--------|-----------|
| **Starter** | $29 | $290/yr | 1 |
| **Professional** | $79 | $790/yr | 2 |
| **Enterprise** | $149 | $1,490/yr | 3 |

**Payment Options:**
- **14-day free trial** — No payment now (default)
- **Add payment method now** — Stripe card form; still includes trial
- **Skip subscription (internal)** — No billing (demo/testing)

### Step 4: Business Configuration

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| **Business Name** | ✓ | From tenant name | Legal business name |
| **Business Type** | | Farm / Ranch | Farm/Ranch, Retail, Restaurant, Wholesale, Mixed |
| **Address** | | | Street, City, State, ZIP |
| **Tax Rate** | | 8.25% | Default sales tax rate |
| **Timezone** | | Central Time | Eastern, Central, Mountain, Pacific |

### Step 5: Chart of Accounts

| Template | Best For |
|----------|----------|
| **Farm Standard** | Farms and ranches |
| **Retail Standard** | Retail stores, market vendors |
| **Restaurant** | Restaurants, food trucks |
| **Minimal** | Custom setups |

### Step 6: Integrations

| Integration | Description |
|-------------|-------------|
| **Stripe Connect** | Accept credit card payments |
| **Plaid Banking** | Sync bank transactions automatically |

### Step 7: Sample Data (Optional)

| Option | Description |
|--------|-------------|
| **Product Categories** | Common category structures |
| **Sample Products** | Example inventory items |
| **Livestock Reference Data** | Animal types, breeds, categories |
| **Sample Transactions** | Example journal entries |

> **Warning:** Sample data is for demo purposes. Not recommended for production tenants.

### Wizard Completion

On completion, the tenant's applications become accessible:

```
Portal:       {slug}.busmgr.com
Back Office:  {slug}.office.busmgr.com
POS Terminal: {slug}.pos.busmgr.com
Restaurant:   {slug}.rpos.busmgr.com         (Professional+)
Kitchen:      {slug}.kitchen.busmgr.com       (Professional+)
Herds:        {slug}.herds.busmgr.com         (Professional+)
Ecommerce:    {slug}.app.busmgr.com           (Professional+)
```

---

## Managing Existing Tenants

### Tenants List

Navigate to **Tenants** to see all tenants. Features: search, status filter (All/Active/Inactive), click to view details.

### Tenant Detail Page (4 Tabs)

**Overview Tab** — Name, slug, status, subscription, stats, quick actions

**Users Tab** — List, add, and manage tenant user accounts. Roles: `tenant_admin`, `admin`, `staff`, `accountant`

**Settings Tab** — Business configuration, branding, tax rate

**Integrations Tab** — Stripe Connect and Plaid status

---

## Subscription & App Registry

### Tier-Based Access

| Application | Min. Tier |
|-------------|-----------|
| Back Office | 1 (Starter) |
| POS Terminal | 1 (Starter) |
| Restaurant POS | 2 (Professional) |
| Kitchen Display | 2 (Professional) |
| Herds & Flocks | 2 (Professional) |
| Online Store | 2 (Professional) |
| Site Builder | 3 (Enterprise) |

### Plan Feature Limits

| Limit | Starter | Professional | Enterprise |
|-------|---------|-------------|------------|
| **Max Products** | 100 | Unlimited | Unlimited |
| **Max Users** | 2 | 10 | Unlimited |
| **Max Locations** | 1 | 3 | Unlimited |

---

## Stripe Connect Setup

Completed by the tenant admin from the Back Office (not from here):

1. Tenant admin logs into Back Office → System → Stripe Connect
2. Clicks "Connect with Stripe"
3. Completes Stripe's hosted onboarding (business info, ID verification, bank account)
4. Status shows "Connected" when complete

### Monitoring Status

| Status | Meaning | Action |
|--------|---------|--------|
| **Not Connected** | Not started | Remind tenant |
| **Pending** | Awaiting verification | Check Stripe requirements |
| **Restricted** | Limited functionality | Complete outstanding items |
| **Enabled** | Fully operational | Ready for payments |

---

## Data Import

Help clients migrate via Back Office → System → Data Import:

| Data Type | Source Formats |
|-----------|----------------|
| Products | CSV |
| Livestock | CSV |
| Customers | CSV |
| Menu Items | CSV |
| Chart of Accounts | CSV, QBO |
| Transactions | CSV, QBO, OFX |

**Import Order:** Chart of accounts → Categories → Products → Customers → Transactions

---

## System Settings

| Setting | Default | Description |
|---------|---------|-------------|
| **System Name** | Business Manager | Platform display name |
| **Default Timezone** | America/Chicago | Default for new tenants |
| **Default Tax Rate** | 8.25% | Default for new tenants |
| **Maintenance Mode** | Off | Blocks non-admin access |
| **Session Timeout** | 480 min | Auto-logout after inactivity |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tenant can't log in | Verify user exists in Tenant Detail → Users tab. Check role. Reset password if needed. Confirm SSO cookie on `*.busmgr.com`. |
| Payments not processing | Check Stripe Connect status. Verify "Enabled" (not "Pending"). Check Stripe Dashboard for requirements. |
| Bank transactions not syncing | Check Plaid connection in Back Office → Bank Connections. Re-authenticate if expired. |
| Tenant can't see an app | Check subscription tier vs. app's `min_plan_tier`. Grant override if needed. |
| Slow performance | Check data volumes. Review recent imports. Check database indexes. |

---

## Reference

### User Roles

| Role | Scope | Description |
|------|-------|-------------|
| `super_admin` | Platform-wide | Onboarding Portal access |
| `tenant_admin` | Single tenant | Full tenant access + user management |
| `admin` | Single tenant | Full feature access |
| `staff` | Single tenant | Day-to-day operations |
| `accountant` | Single tenant | Financial views only |

### Subscription Status Values

| Status | Description |
|--------|-------------|
| `trialing` | In free trial period |
| `active` | Paid and current |
| `past_due` | Payment failed, grace period |
| `canceled` | Subscription cancelled |
| `unpaid` | Payment failed, past grace |

---

*This guide is maintained by the platform team. For corrections or additions, contact the documentation team.*
