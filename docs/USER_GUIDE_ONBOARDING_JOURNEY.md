# Hood Family Farms Business Manager
# Onboarding Journey Overview

**Audience:** All Stakeholders (Platform Team, Super Admins, New Tenants)  
**Version:** 2.0  
**Last Updated:** February 2026

---

## Table of Contents

1. [Journey Overview](#journey-overview)
2. [Phase 1: Discovery & Signup](#phase-1-discovery--signup)
3. [Phase 2: Onboarding Wizard](#phase-2-onboarding-wizard)
4. [Phase 3: System Configuration](#phase-3-system-configuration)
5. [Phase 4: Daily Operations](#phase-4-daily-operations)
6. [Ongoing Activities](#ongoing-activities)
7. [Timeline Summary](#timeline-summary)
8. [Success Metrics](#success-metrics)

---

## Journey Overview

The onboarding journey transforms a prospect into an active, successful platform user. This document maps the complete journey from initial discovery through ongoing daily operations.

The platform is live in production under the `busmgr.com` domain. Each tenant receives a unique subdomain pattern: `{slug}.office.busmgr.com` for the Back Office, `{slug}.busmgr.com` for the Tenant Portal, and similar patterns for each enabled application.

### Journey Phases at a Glance

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TENANT ONBOARDING JOURNEY                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   PHASE 1              PHASE 2              PHASE 3            PHASE 4     │
│  Discovery &          Onboarding           System              Daily       │
│    Signup              Wizard            Configuration       Operations    │
│                                                                             │
│  ┌─────────┐         ┌─────────┐         ┌─────────┐        ┌─────────┐   │
│  │ Day 1   │ ──────▶ │ Day 1-2 │ ──────▶ │ Week 1-2│ ─────▶ │ Ongoing │   │
│  └─────────┘         └─────────┘         └─────────┘        └─────────┘   │
│       │                   │                   │                   │        │
│       ▼                   ▼                   ▼                   ▼        │
│  • Discover          • Tenant Info       • Configure         • Morning    │
│  • Compare           • Admin User          Accounts            Routine    │
│  • Sign Up           • Subscription      • Add Products      • Process    │
│  • Verify            • Business Config   • Build Site          Orders     │
│                      • Chart of Accts    • Create Users      • Evening    │
│                      • Integrations      • Go Live!            Close      │
│                      • Sample Data                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Participants

| Participant | Role in Onboarding |
|-------------|-------------------|
| **Prospect/Tenant** | Business owner signing up for the platform |
| **Super Admin** | Platform administrator using the Onboarding Portal to create tenants |
| **Platform System** | Automated provisioning, wizard steps, and app registry |
| **Stripe** | Payment processing partner (Stripe Connect for tenants, Stripe Billing for subscriptions) |
| **Plaid** | Bank connection partner for transaction sync |

---

## Phase 1: Discovery & Signup

**Duration:** Day 1  
**Goal:** Convert prospect to registered tenant

### 1.1 Discovery

The prospect discovers the platform through:

- Word of mouth / referrals
- Online search (Google, Bing)
- Social media
- Industry publications
- Farmers market networking
- Direct sales outreach

### 1.2 Evaluation

The prospect evaluates the platform:

```
┌─────────────────────────────────────────────────────────────────┐
│                     EVALUATION TOUCHPOINTS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Marketing Website                                             │
│  ├── Feature Overview                                          │
│  ├── Pricing Page                                              │
│  ├── Demo Videos                                               │
│  ├── Customer Testimonials                                     │
│  └── FAQ Section                                               │
│                                                                 │
│  Sales Interaction (optional)                                  │
│  ├── Schedule Demo                                             │
│  ├── Live Walkthrough                                          │
│  └── Q&A Session                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Plan Selection

Prospect reviews subscription tiers. Each tier unlocks access to a specific set of applications via the **App Registry** system:

| Feature | Starter ($29/mo) | Professional ($79/mo) | Enterprise ($149/mo) |
|---------|------------------|----------------------|---------------------|
| Back Office | ✓ | ✓ | ✓ |
| POS Terminal | ✓ | ✓ | ✓ |
| Restaurant POS | — | ✓ | ✓ |
| Kitchen Display | — | ✓ | ✓ |
| Herds & Flocks | — | ✓ | ✓ |
| Online Store (Ecommerce) | — | ✓ | ✓ |
| Site Builder | — | — | ✓ |
| Tenant Portal (App Launcher) | ✓ | ✓ | ✓ |
| Staff Users | 2 | 10 | Unlimited |
| Products | 100 | Unlimited | Unlimited |
| Locations | 1 | 3 | Unlimited |
| Annual Pricing | $290/yr (~17% off) | $790/yr (~17% off) | $1,490/yr (~17% off) |

> **App Registry:** The platform uses a tier-based app access model. Each application has a `min_plan_tier` setting (1=Starter, 2=Professional, 3=Enterprise). The Tenant Portal dynamically shows only apps available at the tenant's subscription level, with override capability for super admins.

### 1.4 Signup

Tenant creation is currently handled through the **Onboarding Portal** by a Super Admin:

1. Super Admin navigates to the Onboarding Portal (`onboarding.busmgr.com`)
2. Clicks "Create New Tenant" to launch the 7-step wizard
3. Walks through the setup process (see Phase 2)
4. System provisions the tenant and all enabled subdomains
5. Admin credentials are delivered to the new tenant

> **Note:** Self-service signup from a public marketing site is a planned future enhancement. Currently, all tenant creation flows through the Onboarding Portal.

### 1.5 Account Provisioning

Upon completing the wizard, the system automatically:

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTOMATIC PROVISIONING                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✓ Create tenant record in database (UUID primary key)        │
│  ✓ Generate unique URL slug from business name                │
│  ✓ Create admin user account with hashed password             │
│  ✓ Assign subscription plan and set trial period              │
│  ✓ Initialize chart of accounts from selected template        │
│  ✓ Register enabled apps in tenant_app_access table           │
│  ✓ Configure subdomain routing across all applications        │
│  ✓ Apply tenant branding (primary color, logo)                │
│  ✓ Create default website pages (Home, About, Contact, FAQ)   │
│  ✓ Send welcome email with login instructions                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 2: Onboarding Wizard

**Duration:** Day 1-2  
**Goal:** Complete essential setup for platform functionality

### 2.1 Wizard Overview

The Onboarding Wizard is a 7-step guided process within the Onboarding Portal that creates and configures a new tenant:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ONBOARDING WIZARD STEPS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Tenant Info ──────────────────────▶ [ 5 min ]         │
│          Name, URL slug, description, brand color              │
│                                                                 │
│  Step 2: Admin User ───────────────────────▶ [ 5 min ]         │
│          Email, password, name, phone                          │
│                                                                 │
│  Step 3: Subscription ─────────────────────▶ [ 5 min ]         │
│          Plan selection, billing interval, payment option      │
│                                                                 │
│  Step 4: Business Config ──────────────────▶ [ 10 min ]        │
│          Business name/type, address, tax rate, timezone       │
│                                                                 │
│  Step 5: Chart of Accounts ────────────────▶ [ 5 min ]         │
│          Select COA template for accounting system             │
│                                                                 │
│  Step 6: Integrations ─────────────────────▶ [ 5 min ]         │
│          Enable Stripe Connect and/or Plaid Banking            │
│                                                                 │
│  Step 7: Sample Data (Optional) ───────────▶ [ 2 min ]         │
│          Load demo categories, products, livestock, entries    │
│                                                                 │
│  ════════════════════════════════════════════════════════════  │
│                          COMPLETE!                              │
│            Redirect to Tenant Detail in Onboarding Portal      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Step 1: Tenant Info

Creates the core tenant record in the database.

| Field | Required | Description |
|-------|----------|-------------|
| **Tenant Name** | ✓ | Display name (e.g., "Smith Family Farm") |
| **URL Slug** | Auto | Auto-generated from name, editable (e.g., `smith-family-farm`) |
| **Description** | | Brief description of the tenant organization |
| **Brand Color** | | Primary color for the Back Office UI (hex code, default `#2d5016`) |

**Tips:**
- The slug becomes part of all URLs: `{slug}.office.busmgr.com`, `{slug}.busmgr.com`, etc.
- Choose a slug that's short and memorable — it cannot easily be changed later
- Brand color is applied across the Back Office sidebar, buttons, and UI accents
- Six preset colors are offered plus a custom color picker

### 2.3 Step 2: Admin User

Creates the primary administrator account for the new tenant.

| Field | Required | Description |
|-------|----------|-------------|
| **Email Address** | ✓ | Admin login email |
| **Password** | ✓ | Minimum 8 characters |
| **Confirm Password** | ✓ | Must match password |
| **Full Name** | | Admin's display name |
| **Phone Number** | | Contact phone |

**Notes:**
- The admin user is assigned the `tenant_admin` role with full access to all tenant features
- Additional staff users are created later within the Back Office
- The email is also used for billing notifications if a subscription is activated

### 2.4 Step 3: Subscription

Select the subscription plan, billing cycle, and payment approach.

**Plan Selection:**
Plans are fetched from the `subscription_plans` database table and displayed as cards with feature lists and pricing. The "Professional" plan is pre-selected as it's marked `is_featured`.

**Billing Interval Toggle:**
- **Monthly** — Standard month-to-month pricing
- **Yearly** — ~17% discount (approximately 2 months free)

**Payment Options:**

| Option | Description |
|--------|-------------|
| **Start with 14-day free trial** | No payment required now. Tenant can add payment later. |
| **Add payment method now** | Stripe Elements card form. Still includes 14-day trial. |
| **Skip subscription (internal use)** | For demo, testing, or internal tenants. No billing. |

### 2.5 Step 4: Business Configuration

Configures operational details for the business.

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| **Business Name** | ✓ | From tenant name | Legal business name |
| **Business Type** | | Farm / Ranch | Options: Farm/Ranch, Retail Store, Restaurant, Wholesale, Mixed Operations |
| **Address** | | | Street, City, State, ZIP |
| **Default Tax Rate** | | 8.25% | Applied to taxable sales |
| **Timezone** | | Central Time | Eastern, Central, Mountain, or Pacific |

### 2.6 Step 5: Chart of Accounts

Select a template to initialize the accounting system. This creates the starting set of GL accounts.

| Template | Description | Best For |
|----------|-------------|----------|
| **Farm Standard** | Complete COA for farm operations including livestock, crops, and retail | Farms and ranches |
| **Retail Standard** | Standard retail business accounts for inventory and sales | Retail stores, market vendors |
| **Restaurant** | Food service focused accounts with cost of goods and labor | Restaurants, food trucks |
| **Minimal** | Basic accounts only — build your own structure | Custom setups |

### 2.7 Step 6: Integrations

Flag which integrations the tenant intends to use. The actual integration setup happens later from within the Back Office.

| Integration | Description | How It Works |
|-------------|-------------|-------------|
| **Stripe Connect** | Accept credit card payments | Admin sets up their own Stripe Connected Account via Back Office → System → Stripe Connect |
| **Plaid Banking** | Sync bank transactions | Admin links bank accounts via Back Office → Accounting → Bank Sync |

> **Important:** Enabling integrations here is a configuration flag only. The tenant must complete the actual Stripe Connect onboarding and Plaid bank linking from within the Back Office after the wizard is complete.

### 2.8 Step 7: Sample Data

Optionally load demonstration data to help the tenant explore the platform.

| Option | Description |
|--------|-------------|
| **Product Categories** | Common category structures for farm products |
| **Sample Products** | Example inventory items and pricing |
| **Livestock Reference Data** | Animal types, breeds, and categories |
| **Sample Transactions** | Example journal entries and transactions |

> **Warning:** Sample data is for demonstration purposes. It can be deleted later but may require manual cleanup. Not recommended for production tenants.

### 2.9 Wizard Completion

Upon completing the wizard, the system provisions the tenant and redirects to the tenant detail page within the Onboarding Portal.

```
┌─────────────────────────────────────────────────────────────────┐
│                    WIZARD COMPLETION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✓ Tenant record created with UUID                             │
│  ✓ Admin user account created and linked                       │
│  ✓ Subscription plan assigned (trial or active)                │
│  ✓ Business configuration saved                                │
│  ✓ Chart of accounts initialized from template                 │
│  ✓ Integration flags set                                       │
│  ✓ Sample data loaded (if selected)                            │
│  ✓ Onboarding marked complete                                  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│              Tenant applications are now accessible:            │
│                                                                 │
│       Portal:       {slug}.busmgr.com                          │
│       Back Office:  {slug}.office.busmgr.com                   │
│       POS Terminal: {slug}.pos.busmgr.com                      │
│       Restaurant:   {slug}.rpos.busmgr.com        (Pro+)      │
│       Kitchen:      {slug}.kitchen.busmgr.com      (Pro+)      │
│       Herds:        {slug}.herds.busmgr.com        (Pro+)      │
│       Ecommerce:    {slug}.app.busmgr.com          (Pro+)      │
│                                                                 │
│              App availability depends on subscription tier.     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.10 Tenant Portal

After onboarding, staff access their applications through the **Tenant Portal** at `{slug}.busmgr.com`. This is an SSO-powered app launcher that:

- Shows all apps the tenant has access to based on their subscription tier
- Uses the App Registry to determine which apps are available
- Applies tenant branding (logo, primary color)
- Provides single sign-on — one login, access to all enabled apps
- Tracks app access via the `tenant_app_access` table

---

## Phase 3: System Configuration

**Duration:** Week 1-2  
**Goal:** Fully configure the platform for business operations

### 3.1 Configuration Checklist

```
┌─────────────────────────────────────────────────────────────────┐
│                   CONFIGURATION CHECKLIST                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FINANCIAL SETUP                                               │
│  □ Review/customize chart of accounts                          │
│  □ Complete Stripe Connect onboarding (Back Office → System)   │
│  □ Connect bank accounts via Plaid (Accounting → Bank Sync)   │
│  □ Configure tax rates                                         │
│  □ Set up payment preferences                                  │
│                                                                 │
│  INVENTORY SETUP                                               │
│  □ Create product categories                                   │
│  □ Add products with images and prices                         │
│  □ Set inventory quantities                                    │
│  □ Configure low stock alerts                                  │
│                                                                 │
│  WEBSITE SETUP (Site Builder — Enterprise tier)                │
│  □ Customize home page                                         │
│  □ Complete about page with your story                         │
│  □ Configure contact page                                      │
│  □ Add FAQ content                                             │
│  □ Review and publish all pages                                │
│  □ Configure custom domain (optional)                          │
│                                                                 │
│  ECOMMERCE SETUP (Professional+ tier)                          │
│  □ Configure delivery zones                                    │
│  □ Set up shipping/pickup options                              │
│  □ Review public product listings                              │
│  □ Test customer checkout flow                                 │
│                                                                 │
│  RESTAURANT SETUP (Professional+ tier)                         │
│  □ Create menu categories                                      │
│  □ Add menu items with modifiers                               │
│  □ Configure kitchen stations                                  │
│  □ Set up KDS display                                          │
│                                                                 │
│  LIVESTOCK SETUP (Professional+ tier)                          │
│  □ Import or add existing animals                              │
│  □ Set up paddocks/locations                                   │
│  □ Configure species and breeds                                │
│  □ Create health event types                                   │
│                                                                 │
│  USER SETUP                                                    │
│  □ Create staff user accounts                                  │
│  □ Assign appropriate roles (admin, staff)                     │
│  □ Send login invitations                                      │
│  □ Conduct staff training                                      │
│                                                                 │
│  GO LIVE!                                                      │
│  □ Test end-to-end order flow                                  │
│  □ Process test payment through Stripe                         │
│  □ Verify all pages published                                  │
│  □ Announce to customers                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Day-by-Day Setup Guide

**Day 1-2: Financial Foundation**
- Complete Stripe Connect onboarding from Back Office → System
- Review and customize chart of accounts
- Connect primary bank account via Plaid
- Configure sales tax rates

**Day 3-4: Products & Inventory**
- Create logical category structure
- Add all products for sale
- Upload product images
- Set initial inventory counts

**Day 5-7: Website & Ecommerce**
- Customize website pages via Site Builder (Enterprise) or default template
- Configure ecommerce delivery zones and checkout settings
- Tell your story on the about page
- Preview and publish pages

**Day 8-10: Operations Setup**
- Create staff accounts and assign roles
- Configure POS station layouts
- Set up restaurant menus and kitchen stations (if applicable)
- Enter livestock records (if applicable)

**Day 11-14: Testing & Training**
- Test complete order flow end-to-end
- Train staff on the Tenant Portal and their assigned apps
- Document any issues
- Make final adjustments

### 3.3 Go-Live Checklist

Before announcing to customers:

```
PRE-LAUNCH VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━
□ Stripe Connect onboarding complete and payments enabled
□ All products have images and accurate prices
□ Website pages reviewed and published
□ Ecommerce checkout tested with test card
□ Mobile responsiveness verified
□ Contact information accurate
□ Staff trained and can access Tenant Portal
□ Backup/support plan in place
```

---

## Phase 4: Daily Operations

**Duration:** Ongoing  
**Goal:** Efficient day-to-day business management

### 4.1 Morning Routine

```
┌─────────────────────────────────────────────────────────────────┐
│                      MORNING ROUTINE                            │
│                       (8:00 - 9:00 AM)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CHECK DASHBOARD                                            │
│     ├── Log into {slug}.busmgr.com (Tenant Portal)            │
│     ├── Launch Back Office from app launcher                   │
│     ├── Review overnight online orders                         │
│     ├── Check low stock alerts                                 │
│     └── Note today's pending fulfillments                      │
│                                                                 │
│  2. PROCESS ORDERS                                             │
│     ├── Print packing lists for orders                         │
│     ├── Verify inventory available                             │
│     └── Prepare items for pickup/shipping                      │
│                                                                 │
│  3. FARM CHORES (if applicable)                                │
│     ├── Open Herds & Flocks from Tenant Portal                │
│     ├── Log morning feeding                                    │
│     ├── Record any health observations                         │
│     └── Note egg/milk collection                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Midday Operations

```
┌─────────────────────────────────────────────────────────────────┐
│                      MIDDAY OPERATIONS                          │
│                       (10:00 AM - 4:00 PM)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FULFILLMENT                                                   │
│  ├── Complete order packing                                    │
│  ├── Process pickup orders                                     │
│  ├── Prepare shipping labels                                   │
│  └── Update order statuses                                     │
│                                                                 │
│  CUSTOMER SERVICE                                              │
│  ├── Respond to inquiries                                      │
│  ├── Process special requests                                  │
│  └── Handle any issues                                         │
│                                                                 │
│  ONGOING SALES                                                 │
│  ├── Monitor ecommerce orders at {slug}.app.busmgr.com        │
│  └── Process walk-in customers (if applicable)                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Market/Event Day

```
┌─────────────────────────────────────────────────────────────────┐
│                    MARKET/EVENT OPERATIONS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BEFORE EVENT                                                  │
│  ├── Verify POS device charged and connected                   │
│  ├── Load starting cash in drawer                              │
│  ├── Confirm product inventory counts                          │
│  └── Test Stripe Terminal card reader connectivity             │
│                                                                 │
│  DURING EVENT                                                  │
│  ├── Ring up sales on POS Terminal ({slug}.pos.busmgr.com)    │
│  ├── Accept cards, cash, and mobile payments                   │
│  ├── Apply discounts as needed                                 │
│  └── Provide receipts (print or email)                         │
│                                                                 │
│  FOOD SERVICE (if applicable)                                  │
│  ├── Take orders on Restaurant POS ({slug}.rpos.busmgr.com)  │
│  ├── Kitchen views orders on KDS ({slug}.kitchen.busmgr.com) │
│  ├── Mark items ready when complete                            │
│  └── Collect payment and tips                                  │
│                                                                 │
│  AFTER EVENT                                                   │
│  ├── Run End of Day settlement                                 │
│  ├── Count cash drawer                                         │
│  ├── Review daily sales report                                 │
│  └── Pack up and secure equipment                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Evening Close

```
┌─────────────────────────────────────────────────────────────────┐
│                      EVENING CLOSE                              │
│                       (5:00 - 6:00 PM)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. END OF DAY SETTLEMENT                                      │
│     ├── Close POS terminals                                    │
│     ├── Count and record cash                                  │
│     ├── Verify card totals match reports                       │
│     └── Submit daily settlement                                │
│                                                                 │
│  2. REVIEW ACTIVITY                                            │
│     ├── Check daily sales report in Back Office                │
│     ├── Note any issues or trends                              │
│     ├── Review customer feedback                               │
│     └── Respond to pending inquiries                           │
│                                                                 │
│  3. PLAN TOMORROW                                              │
│     ├── Review pending orders                                  │
│     ├── Check inventory needs                                  │
│     ├── Review staff schedule                                  │
│     └── Prepare for any special events                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Ongoing Activities

### Weekly Tasks

| Day | Task | Application |
|-----|------|-------------|
| Monday | Review P&L for previous week | Back Office → Reports |
| Tuesday | Bank reconciliation | Back Office → Accounting |
| Wednesday | Inventory audit | Back Office → Inventory |
| Thursday | Staff schedule review | Back Office → Settings |
| Friday | Website content updates | Back Office → Site Builder |
| Saturday | Market/Event operations | POS / Restaurant |
| Sunday | Weekly planning | All |

### Monthly Tasks

```
MONTHLY CHECKLIST
━━━━━━━━━━━━━━━━━
□ Close books for the month
□ Generate financial statements
□ Review sales by product/category
□ Analyze customer trends
□ Evaluate marketing effectiveness
□ Plan upcoming events/promotions
□ Review subscription and usage
□ Staff performance check-in
```

### Seasonal/Annual Tasks

```
SEASONAL TASKS
━━━━━━━━━━━━━━
□ Update pricing for new season
□ Refresh website content and images
□ Plan seasonal products and promotions
□ Review and update inventory

ANNUAL TASKS
━━━━━━━━━━━━
□ Year-end close and reporting
□ Tax preparation (export reports)
□ Full inventory audit
□ Review subscription plan needs
□ Platform feature evaluation
□ Staff training refresh
```

---

## Timeline Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ONBOARDING TIMELINE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Day 1         Day 2-3        Week 1         Week 2         Ongoing        │
│    │             │              │              │              │             │
│    ▼             ▼              ▼              ▼              ▼             │
│ ┌─────┐      ┌─────┐       ┌─────┐       ┌─────┐       ┌─────────┐        │
│ │Onb. │      │Stripe│      │Config│      │Test &│       │Daily    │        │
│ │Wizard│────▶│Setup │─────▶│Setup │─────▶│Train │─────▶│Operations│       │
│ └─────┘      └─────┘       └─────┘       └─────┘       └─────────┘        │
│                                                                             │
│ • Tenant     • Stripe       • Accounts    • Staff       • Orders           │
│ • Admin        Connect      • Products    • Testing     • Payments         │
│ • Plan       • Plaid Bank   • Website     • Go Live!    • Reports          │
│ • Config     • Settings     • Menus                     • Growth           │
│ • COA                       • Livestock                                    │
│ • Data                                                                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MILESTONES:                                                               │
│  ✓ Day 1: Wizard complete, tenant can log into Tenant Portal              │
│  ✓ Day 2-3: Stripe Connect ready, payment processing enabled             │
│  ✓ Week 1: Products listed, ecommerce site live                          │
│  ✓ Week 2: First real customer transaction                                │
│  ✓ Month 1: Consistent daily operations                                   │
│  ✓ Month 3: Full platform proficiency                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Success Metrics

### Onboarding Success Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Time to First Login** | < 1 hour | Wizard completion to first Back Office login |
| **Wizard Completion Rate** | > 90% | All 7 wizard steps completed |
| **Time to First Product** | < 3 days | First product added to inventory |
| **Time to First Sale** | < 14 days | First revenue transaction through POS or ecommerce |
| **Trial Conversion Rate** | > 70% | Trial to paid subscription |

### Ongoing Health Indicators

| Metric | Healthy Range | Warning Sign |
|--------|--------------|--------------|
| **Weekly Active Users** | 3+ logins/week | < 1 login/week |
| **Monthly Transactions** | Growing | Declining 2+ months |
| **Support Tickets** | Decreasing over time | Increasing |
| **Feature Utilization** | Using 60%+ features | Using < 30% |
| **App Access Diversity** | Using 3+ apps regularly | Only using Back Office |

### Tenant Lifecycle Stages

```
ENGAGEMENT STAGES
━━━━━━━━━━━━━━━━━

Onboarding (0-14 days)
├── Wizard completion
├── Stripe Connect setup
├── First product added
└── Support interactions

Adoption (15-90 days)
├── First sale processed
├── Staff accounts created
├── Multiple apps in use
└── Consistent usage patterns

Growth (90+ days)
├── Transaction volume increasing
├── Product catalog expansion
├── Customer base growth
└── Potential plan upgrade

Mature (1+ year)
├── Full feature utilization
├── Predictable operations
├── Platform advocacy
└── Tier-appropriate app usage
```

---

## Support Resources

### Getting Help

| Need | Resource |
|------|----------|
| How-to questions | In-app help (?) icon in Back Office |
| Technical issues | support@busmgr.com |
| Account/billing | billing@busmgr.com |
| Feature requests | Feedback button in app |
| Platform administration | Onboarding Portal (super admins) |

### Application URLs

| Application | URL Pattern | Minimum Tier |
|-------------|-------------|-------------|
| Tenant Portal | `{slug}.busmgr.com` | All |
| Back Office | `{slug}.office.busmgr.com` | Starter |
| POS Terminal | `{slug}.pos.busmgr.com` | Starter |
| Restaurant POS | `{slug}.rpos.busmgr.com` | Professional |
| Kitchen Display | `{slug}.kitchen.busmgr.com` | Professional |
| Herds & Flocks | `{slug}.herds.busmgr.com` | Professional |
| Online Store | `{slug}.app.busmgr.com` | Professional |
| Site Builder | `{slug}.office.busmgr.com/site-builder` | Enterprise |
| Onboarding Portal | `onboarding.busmgr.com` | Super Admin only |

### Training Options

- Self-paced video tutorials
- Live webinar sessions (weekly)
- One-on-one onboarding calls (Enterprise)
- On-site training (Enterprise, additional fee)

---

*This document provides an overview of the onboarding journey. For detailed instructions, refer to the specific user guides for Super Admins (`USER_GUIDE_SUPER_ADMIN.md`) and Tenant Admins (`USER_GUIDE_TENANT_ADMIN.md`).*
