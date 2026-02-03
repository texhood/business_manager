# Hood Family Farms Business Manager
# Super Admin User Guide

**Audience:** Platform Administrators  
**Version:** 1.0  
**Last Updated:** January 2026

---

## Table of Contents

1. [Introduction](#introduction)
2. [Accessing the Onboarding Portal](#accessing-the-onboarding-portal)
3. [Understanding Tenant Management](#understanding-tenant-management)
4. [Creating a New Tenant](#creating-a-new-tenant)
5. [Configuring Stripe Connect](#configuring-stripe-connect)
6. [Setting Up Subscriptions](#setting-up-subscriptions)
7. [Importing Client Data](#importing-client-data)
8. [Managing Existing Tenants](#managing-existing-tenants)
9. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
10. [Appendix: Reference Information](#appendix-reference-information)

---

## Introduction

As a Super Admin, you are responsible for onboarding new tenants (clients) onto the Hood Family Farms Business Manager platform. This guide walks you through the complete process of setting up a new tenant, from initial account creation through data import and go-live.

### Your Responsibilities

- Creating and configuring new tenant accounts
- Setting up payment processing via Stripe Connect
- Configuring subscription plans and billing
- Importing client data from legacy systems
- Monitoring tenant health and resolving issues
- Managing user access and permissions

### Prerequisites

Before you begin, ensure you have:

- Super Admin credentials for the Onboarding Portal
- Access to Stripe Dashboard (for Connect account management)
- Client business information (name, address, contact details)
- Client logo and brand colors (optional but recommended)
- Any data files to import (CSV format)

---

## Accessing the Onboarding Portal

### Portal URL

```
https://onboarding.hoodfamilyfarms.com
```

### Login Process

1. Navigate to the Onboarding Portal
2. Enter your Super Admin email and password
3. Complete two-factor authentication (if enabled)
4. You'll land on the **Tenant Dashboard**

### Dashboard Overview

The Tenant Dashboard displays:

| Section | Description |
|---------|-------------|
| **Active Tenants** | List of all operational tenant accounts |
| **Pending Setup** | Tenants awaiting configuration completion |
| **Recent Activity** | Latest actions across all tenants |
| **System Alerts** | Issues requiring attention |
| **Quick Actions** | Shortcuts to common tasks |

---

## Understanding Tenant Management

### What is a Tenant?

A tenant represents a single business (client) using the platform. Each tenant has:

- **Unique Identifier**: UUID assigned at creation
- **Slug**: URL-friendly name (e.g., `freds-farm`)
- **Subdomains**: Access to all applications at `{slug}.{app}.hoodfamilyfarms.com`
- **Isolated Data**: Complete separation from other tenants
- **Custom Branding**: Logo, colors, and optional custom domain

### Tenant Lifecycle

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Created   │ ──▶ │  Configured │ ──▶ │   Active    │ ──▶ │  Suspended  │
│             │     │             │     │             │     │  (if needed)│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
  Basic info         Stripe Connect       Day-to-day
  Subdomain          Subscription         operations
  Admin user         Features enabled     Billing active
```

### Subscription Plans

| Plan | Monthly | Annual | Best For |
|------|---------|--------|----------|
| **Starter** | $29 | $290 | Small farms, hobby operations |
| **Professional** | $79 | $790 | Active farms with regular sales |
| **Enterprise** | $149 | $1,490 | Large operations, multiple locations |

---

## Creating a New Tenant

### Step 1: Start the Creation Wizard

1. From the Tenant Dashboard, click **+ New Tenant**
2. The tenant creation wizard opens

### Step 2: Basic Information

Enter the client's business details:

| Field | Description | Example |
|-------|-------------|---------|
| **Business Name** | Legal business name | "Fred's Family Farm, LLC" |
| **Display Name** | Name shown to customers | "Fred's Farm" |
| **Tenant Slug** | URL identifier (auto-generated, editable) | `freds-farm` |
| **Business Type** | Primary operation type | Farm, Ranch, Restaurant, Market |
| **Contact Email** | Primary business email | fred@fredsfarm.com |
| **Contact Phone** | Business phone number | (555) 123-4567 |

**Important:** The tenant slug cannot be changed after creation. Choose carefully!

### Step 3: Business Address

```
Street Address: 123 Country Road
City: Ruralville
State/Province: Texas
Postal Code: 75001
Country: United States
```

### Step 4: Brand Configuration

Upload or configure:

- **Logo**: PNG or SVG, minimum 200x200 pixels
- **Primary Color**: Main brand color (hex code)
- **Secondary Color**: Accent color (hex code)
- **Favicon**: 32x32 pixel icon (optional)

**Tip:** If the client doesn't have brand assets ready, you can use defaults and update later.

### Step 5: Create Admin User

The initial administrator account for the tenant:

| Field | Description |
|-------|-------------|
| **First Name** | Admin's first name |
| **Last Name** | Admin's last name |
| **Email** | Admin login email |
| **Temporary Password** | Initial password (must be changed on first login) |

### Step 6: Review and Create

1. Review all entered information
2. Click **Create Tenant**
3. System provisions:
   - Tenant database records
   - Subdomain configurations
   - Default chart of accounts
   - System pages (Home, About, Contact, FAQ)

### Step 7: Record Confirmation

After creation, you'll see:

```
✓ Tenant Created Successfully

Tenant ID: 3dc67965-ceab-4b96-b309-d7640df49ee5
Slug: freds-farm

Application URLs:
• Back Office: https://freds-farm.office.hoodfamilyfarms.com
• Herds & Flocks: https://freds-farm.herds.hoodfamilyfarms.com
• Restaurant POS: https://freds-farm.restaurant.hoodfamilyfarms.com
• POS Terminal: https://freds-farm.pos.hoodfamilyfarms.com
• Website: https://freds-farm.hoodfamilyfarms.com

Admin Login:
• Email: fred@fredsfarm.com
• Temporary Password: [shown once]

Next Steps: Configure Stripe Connect →
```

---

## Configuring Stripe Connect

Every tenant needs a Stripe Connected Account to process payments and receive payouts.

### Step 1: Initiate Connect Onboarding

1. From the tenant detail page, click **Setup Stripe Connect**
2. System creates a Stripe Connect account for the tenant
3. An onboarding link is generated

### Step 2: Share Onboarding Link

You have two options:

**Option A: Email to Client**
1. Click **Send Onboarding Email**
2. Client receives email with secure link
3. Client completes Stripe's identity verification

**Option B: Complete with Client**
1. Click **Open Onboarding Link**
2. Complete the process together with the client
3. Requires client's banking and identity information

### Step 3: Stripe Onboarding Steps

The client (or you with the client) will need to provide:

1. **Business Information**
   - Legal business name
   - Business type (individual, LLC, corporation)
   - EIN or SSN (for sole proprietors)
   - Business address

2. **Personal Information** (for business representative)
   - Full legal name
   - Date of birth
   - Last 4 digits of SSN
   - Home address

3. **Bank Account**
   - Routing number
   - Account number
   - Account type (checking/savings)

4. **Identity Verification**
   - Photo ID upload
   - Selfie verification

### Step 4: Verification Status

Monitor the Connect account status:

| Status | Meaning | Action |
|--------|---------|--------|
| **Pending** | Awaiting information | Check what's needed |
| **Restricted** | Limited functionality | Complete requirements |
| **Enabled** | Fully operational | Ready for payments |
| **Rejected** | Failed verification | Contact Stripe support |

### Step 5: Test the Connection

Once enabled:

1. Process a small test payment ($1.00)
2. Verify it appears in tenant's Stripe dashboard
3. Confirm webhook notifications are received

---

## Setting Up Subscriptions

### Step 1: Select Subscription Plan

1. Navigate to tenant's **Subscription** tab
2. Click **Setup Subscription**
3. Select the appropriate plan:
   - **Starter** ($29/month) — Basic features
   - **Professional** ($79/month) — Full features + analytics
   - **Enterprise** ($149/month) — All features + priority support

### Step 2: Configure Billing

| Setting | Options |
|---------|---------|
| **Billing Cycle** | Monthly or Annual (10% discount) |
| **Trial Period** | 14 days (default), 30 days, or none |
| **Start Date** | Immediate or scheduled |

### Step 3: Payment Method

If the client hasn't already provided payment during Stripe Connect setup:

1. Click **Collect Payment Method**
2. A Stripe checkout session is created
3. Share the link with the client
4. Client enters card details

### Step 4: Activate Subscription

1. Review subscription configuration
2. Click **Activate Subscription**
3. System creates Stripe subscription
4. Tenant gains access to subscribed features

### Step 5: Feature Enablement

Based on the plan, enable/disable specific features:

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| Back Office | ✓ | ✓ | ✓ |
| Herds & Flocks | — | ✓ | ✓ |
| Restaurant POS | — | ✓ | ✓ |
| Kitchen Display | — | ✓ | ✓ |
| POS Terminal | ✓ | ✓ | ✓ |
| Ecommerce | ✓ | ✓ | ✓ |
| Bank Connections | 1 | 3 | Unlimited |
| Staff Users | 2 | 10 | Unlimited |
| Products | 50 | 500 | Unlimited |
| Advanced Reports | — | ✓ | ✓ |
| API Access | — | — | ✓ |

---

## Importing Client Data

Help clients migrate data from their existing systems.

### Available Import Types

| Data Type | Source Formats | Destination |
|-----------|----------------|-------------|
| **Livestock** | CSV, Excel | Herds & Flocks |
| **Products** | CSV, Excel | Inventory |
| **Customers** | CSV, Excel | Customer Database |
| **Menu Items** | CSV | Restaurant Menus |
| **Chart of Accounts** | CSV, QBO | Accounting |
| **Transactions** | CSV, QBO, OFX | Accounting |
| **Blog Posts** | CSV, WordPress XML | CMS |

### Import Process

#### Step 1: Download Template

1. Go to tenant's **Data Import** section
2. Select the data type to import
3. Click **Download Template**
4. Provide template to client for data preparation

#### Step 2: Prepare Data

Guide the client to:

1. Export data from their existing system
2. Map columns to match the template format
3. Clean up any data issues:
   - Remove duplicates
   - Fix formatting
   - Ensure required fields are populated

#### Step 3: Upload and Validate

1. Client uploads prepared CSV
2. System validates the data:
   - Required fields present
   - Data types correct
   - References valid (e.g., category exists)
3. Review validation report

#### Step 4: Handle Errors

If validation fails:

| Error Type | Solution |
|------------|----------|
| Missing required field | Add data to CSV and re-upload |
| Invalid format | Correct formatting (dates, numbers) |
| Duplicate record | Remove or merge duplicates |
| Invalid reference | Create referenced record first |

#### Step 5: Execute Import

1. Click **Import Data**
2. System processes records
3. Progress shown in real-time
4. Summary report generated

#### Step 6: Verify Import

1. Navigate to the imported data section
2. Spot-check random records
3. Verify counts match expectations
4. Test functionality (e.g., can products be added to orders?)

### Import Best Practices

- **Start Small**: Test with 10-20 records before full import
- **Import Order**: Chart of accounts → Customers → Products → Transactions
- **Backup First**: Export any existing data before importing
- **Document Mappings**: Keep notes on how fields were mapped

---

## Managing Existing Tenants

### Viewing Tenant Details

From the Tenant Dashboard:

1. Click on a tenant name
2. View comprehensive tenant information:
   - Business profile
   - Subscription status
   - User accounts
   - Feature usage
   - Recent activity

### Updating Tenant Information

1. Click **Edit** on the section to modify
2. Make necessary changes
3. Click **Save**

**Note:** Some fields (slug, tenant ID) cannot be changed after creation.

### User Management

#### Adding Users

1. Go to tenant's **Users** tab
2. Click **Add User**
3. Enter user details and role
4. User receives invitation email

#### Resetting Passwords

1. Find user in the list
2. Click **Reset Password**
3. New temporary password generated
4. User notified via email

#### Deactivating Users

1. Click **Deactivate** on user row
2. Confirm deactivation
3. User can no longer log in
4. Can be reactivated later

### Subscription Changes

#### Upgrading

1. Go to **Subscription** tab
2. Click **Change Plan**
3. Select new plan
4. Prorated charges applied

#### Downgrading

1. Schedule downgrade for end of billing period
2. System notifies tenant of feature changes
3. Downgrade takes effect at renewal

#### Cancellation

1. Click **Cancel Subscription**
2. Select reason for cancellation
3. Choose immediate or end-of-period
4. Tenant access restricted according to selection

---

## Monitoring & Troubleshooting

### Health Monitoring Dashboard

The monitoring dashboard shows:

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| **Active Users** | Users logged in this week | Below 1 for 2+ weeks |
| **Transaction Volume** | Payments processed | Unusual spikes/drops |
| **Error Rate** | Failed API requests | Above 1% |
| **Webhook Status** | Stripe/Plaid notifications | Any failures |
| **Storage Usage** | Media and data storage | Above 80% of limit |

### Common Issues and Solutions

#### "Tenant can't log in"

1. Verify user account exists and is active
2. Check if account is locked (too many failed attempts)
3. Reset password if needed
4. Confirm tenant subdomain is correctly configured

#### "Payments not processing"

1. Check Stripe Connect account status
2. Verify account is "Enabled"
3. Review any Stripe requirements
4. Test with a small payment

#### "Data not syncing"

1. Check Plaid connection status
2. Re-authenticate if connection expired
3. Manually trigger sync
4. Review webhook logs for errors

#### "Slow performance"

1. Check data volumes (many products, orders, etc.)
2. Review recent imports
3. Check for missing indexes
4. Escalate to development team if persistent

### Viewing Logs

1. Go to tenant's **Activity Log**
2. Filter by:
   - Date range
   - User
   - Action type
   - Status (success/error)
3. Click on entry for full details

### Escalation Path

For issues you cannot resolve:

1. Document the problem thoroughly
2. Gather relevant logs and screenshots
3. Contact development team via internal channels
4. Provide tenant ID and reproduction steps

---

## Appendix: Reference Information

### Tenant Status Values

| Status | Description |
|--------|-------------|
| `pending` | Created but setup incomplete |
| `active` | Fully operational |
| `trial` | In free trial period |
| `suspended` | Temporarily disabled (billing issue) |
| `cancelled` | Subscription cancelled |
| `archived` | Soft-deleted, data retained |

### Role Permissions Matrix

| Permission | super_admin | admin | manager | staff |
|------------|-------------|-------|---------|-------|
| Create tenants | ✓ | — | — | — |
| View all tenants | ✓ | — | — | — |
| Manage subscriptions | ✓ | — | — | — |
| Import data | ✓ | ✓ | — | — |
| Manage users | ✓ | ✓ | ✓ | — |
| View reports | ✓ | ✓ | ✓ | Limited |
| Process transactions | ✓ | ✓ | ✓ | ✓ |

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Search tenants | Ctrl/Cmd + K |
| New tenant | Ctrl/Cmd + N |
| Save changes | Ctrl/Cmd + S |
| Cancel/Close | Escape |

### API Endpoints (For Reference)

```
POST   /api/v1/tenants              Create tenant
GET    /api/v1/tenants              List all tenants
GET    /api/v1/tenants/:id          Get tenant details
PUT    /api/v1/tenants/:id          Update tenant
DELETE /api/v1/tenants/:id          Archive tenant

POST   /api/v1/subscriptions/setup  Initialize subscription
PUT    /api/v1/subscriptions/:id    Modify subscription

POST   /api/v1/data-import/upload   Upload import file
POST   /api/v1/data-import/execute  Execute import
```

### Support Resources

- **Documentation**: https://docs.hoodfamilyfarms.com
- **API Reference**: https://api.hoodfamilyfarms.com/docs
- **Status Page**: https://status.hoodfamilyfarms.com
- **Internal Wiki**: [Link to internal documentation]

---

*This guide is maintained by the Hood Family Farms platform team. For corrections or additions, contact the documentation team.*
