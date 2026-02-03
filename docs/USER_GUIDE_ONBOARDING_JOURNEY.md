# Hood Family Farms Business Manager
# Onboarding Journey Overview

**Audience:** All Stakeholders (Platform Team, Super Admins, New Tenants)  
**Version:** 1.0  
**Last Updated:** January 2026

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
│  • Discover          • Business          • Configure         • Morning    │
│  • Compare             Profile             Accounts            Routine    │
│  • Sign Up           • Payment           • Add Products      • Process    │
│  • Verify              Setup             • Build Site          Orders     │
│                      • Select Plan       • Create Users      • Evening    │
│                      • Import Data       • Go Live!            Close      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Participants

| Participant | Role in Onboarding |
|-------------|-------------------|
| **Prospect/Tenant** | Business owner signing up for the platform |
| **Super Admin** | Platform administrator assisting with setup |
| **Platform System** | Automated processes and wizards |
| **Stripe** | Payment processing partner |
| **Plaid** | Bank connection partner |

---

## Phase 1: Discovery & Signup

**Duration:** Day 1  
**Goal:** Convert prospect to registered tenant

### 1.1 Discovery

The prospect discovers Hood Family Farms Business Manager through:

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
│  Marketing Website (hoodfamilyfarms.com)                       │
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

Prospect reviews subscription tiers:

| Feature | Starter ($29/mo) | Professional ($79/mo) | Enterprise ($149/mo) |
|---------|------------------|----------------------|---------------------|
| Back Office | ✓ | ✓ | ✓ |
| Ecommerce Website | ✓ | ✓ | ✓ |
| POS Terminal | ✓ | ✓ | ✓ |
| Herds & Flocks | — | ✓ | ✓ |
| Restaurant POS | — | ✓ | ✓ |
| Staff Users | 2 | 10 | Unlimited |
| Products | 50 | 500 | Unlimited |
| Bank Connections | 1 | 3 | Unlimited |
| Advanced Reports | — | ✓ | ✓ |
| Priority Support | — | — | ✓ |

### 1.4 Signup

**Self-Service Flow:**

1. Click "Start Free Trial"
2. Enter account information:
   - Business name
   - Owner name
   - Email address
   - Password
   - Phone number
3. Agree to Terms of Service
4. Submit registration

**Assisted Flow (Super Admin):**

1. Super Admin creates tenant in Onboarding Portal
2. Enters business and contact information
3. Creates initial admin user
4. Sends welcome email with login credentials

### 1.5 Account Provisioning

Upon signup, the system automatically:

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTOMATIC PROVISIONING                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✓ Create tenant record in database                           │
│  ✓ Generate unique tenant ID (UUID)                           │
│  ✓ Create URL slug from business name                         │
│  ✓ Configure subdomain routing                                │
│  ✓ Create admin user account                                  │
│  ✓ Initialize default chart of accounts                       │
│  ✓ Create default website pages (Home, About, Contact, FAQ)   │
│  ✓ Send welcome email with login instructions                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 Email Verification

1. System sends verification email
2. User clicks verification link
3. Account activated
4. Redirect to onboarding wizard

---

## Phase 2: Onboarding Wizard

**Duration:** Day 1-2  
**Goal:** Complete essential setup for platform functionality

### 2.1 Wizard Overview

The onboarding wizard guides new tenants through critical setup steps:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ONBOARDING WIZARD STEPS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Business Profile ─────────────────────▶ [ 10 min ]    │
│          Name, address, logo, brand colors                     │
│                                                                 │
│  Step 2: Payment Setup ────────────────────────▶ [ 15 min ]    │
│          Stripe Connect, bank account, verification            │
│                                                                 │
│  Step 3: Select Plan & Payment ────────────────▶ [ 5 min ]     │
│          Choose tier, enter payment method                     │
│                                                                 │
│  Step 4: Enable Features ──────────────────────▶ [ 5 min ]     │
│          Toggle applications needed                            │
│                                                                 │
│  Step 5: Import Data (Optional) ───────────────▶ [ 30+ min ]   │
│          Upload livestock, products, customers                 │
│                                                                 │
│  ════════════════════════════════════════════════════════════  │
│                          COMPLETE!                              │
│               Redirect to Back Office Dashboard                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Step 1: Business Profile

**Information Collected:**

| Section | Fields |
|---------|--------|
| **Basic Info** | Business name, display name, tagline |
| **Contact** | Phone, email, website |
| **Address** | Street, city, state, postal code, country |
| **Branding** | Logo upload, primary color, secondary color |
| **Social** | Facebook, Instagram, Twitter links |

**Tips for Success:**
- Have logo file ready (PNG/SVG, min 200x200px)
- Know your brand colors (hex codes)
- Use a professional email address

### 2.3 Step 2: Payment Setup (Stripe Connect)

**Process Flow:**

```
Tenant                    Platform                    Stripe
   │                         │                          │
   │──── Start Setup ───────▶│                          │
   │                         │────Create Account───────▶│
   │                         │◀───Account Created───────│
   │◀── Onboarding Link ─────│                          │
   │                         │                          │
   │════════════════ Stripe Hosted Onboarding ═════════│
   │                         │                          │
   │──── Business Info ─────────────────────────────────▶│
   │──── Personal Info ─────────────────────────────────▶│
   │──── Bank Account ──────────────────────────────────▶│
   │──── ID Verification ───────────────────────────────▶│
   │                         │                          │
   │◀─────────────── Onboarding Complete ───────────────│
   │                         │                          │
   │                         │◀───Webhook: Enabled──────│
   │◀── Ready for Payments ──│                          │
```

**Information Required:**
- Business legal name and type
- EIN or SSN (sole proprietor)
- Business address
- Representative personal information
- Bank account details
- Government-issued ID

**Timeline:** 
- Basic info: Instant
- Bank verification: 1-2 business days
- ID verification: Minutes to 1 day

### 2.4 Step 3: Select Plan & Payment

**Process:**

1. Review subscription options
2. Choose billing cycle (monthly/annual)
3. 14-day free trial starts automatically
4. Enter payment method for after trial
5. Confirm selection

**Trial Features:**
- Full access to selected plan features
- No charge during trial period
- Cancel anytime before trial ends
- Automatic conversion to paid if not cancelled

### 2.5 Step 4: Enable Features

Based on subscription tier, toggle needed applications:

| Application | When to Enable |
|-------------|---------------|
| **Herds & Flocks** | If raising livestock |
| **Restaurant POS** | If serving prepared food |
| **Kitchen Display** | If has food prep kitchen |
| **POS Terminal** | If selling at markets/events |

### 2.6 Step 5: Import Data (Optional)

For tenants migrating from existing systems:

**Available Imports:**

| Data Type | Source Systems | Time Estimate |
|-----------|---------------|---------------|
| Livestock Records | Spreadsheets, legacy systems | 30-60 min |
| Products/Inventory | QuickBooks, Square, spreadsheets | 20-40 min |
| Customer List | Email lists, CRM exports | 15-30 min |
| Menu Items | POS exports, spreadsheets | 20-30 min |
| Chart of Accounts | QuickBooks, accounting software | 15-20 min |
| Historical Transactions | Bank exports, accounting software | 30-60 min |

**Import Process:**
1. Download template for data type
2. Populate with existing data
3. Upload CSV file
4. Validate and fix errors
5. Execute import
6. Verify results

### 2.7 Wizard Completion

Upon completing the wizard:

```
┌─────────────────────────────────────────────────────────────────┐
│                    WIZARD COMPLETION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✓ Business profile saved                                      │
│  ✓ Stripe Connect account linked                               │
│  ✓ Subscription activated (trial started)                      │
│  ✓ Features enabled                                            │
│  ✓ Data imported (if applicable)                               │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│              Welcome to Hood Family Farms Business Manager!     │
│                                                                 │
│              Your applications are ready:                       │
│              • Back Office: {slug}.office.hoodfamilyfarms.com  │
│              • Website: {slug}.hoodfamilyfarms.com             │
│              • [Other enabled apps...]                         │
│                                                                 │
│                    [ Go to Dashboard ]                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

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
│  □ Connect bank accounts (Plaid)                               │
│  □ Configure tax rates                                         │
│  □ Set up payment preferences                                  │
│                                                                 │
│  INVENTORY SETUP                                               │
│  □ Create product categories                                   │
│  □ Add products with images and prices                         │
│  □ Set inventory quantities                                    │
│  □ Configure low stock alerts                                  │
│                                                                 │
│  WEBSITE SETUP                                                 │
│  □ Customize home page                                         │
│  □ Complete about page with your story                         │
│  □ Configure contact page                                      │
│  □ Add FAQ content                                             │
│  □ Review and publish all pages                                │
│  □ Configure custom domain (optional)                          │
│                                                                 │
│  RESTAURANT SETUP (if applicable)                              │
│  □ Create menu categories                                      │
│  □ Add menu items with modifiers                               │
│  □ Configure kitchen stations                                  │
│  □ Set up KDS display                                          │
│                                                                 │
│  LIVESTOCK SETUP (if applicable)                               │
│  □ Import or add existing animals                              │
│  □ Set up paddocks/locations                                   │
│  □ Configure species and breeds                                │
│  □ Create health event templates                               │
│                                                                 │
│  USER SETUP                                                    │
│  □ Create staff user accounts                                  │
│  □ Assign appropriate roles/permissions                        │
│  □ Send login invitations                                      │
│  □ Conduct staff training                                      │
│                                                                 │
│  GO LIVE!                                                      │
│  □ Test end-to-end order flow                                  │
│  □ Process test payment                                        │
│  □ Verify all pages published                                  │
│  □ Announce to customers                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Day-by-Day Setup Guide

**Day 1-2: Financial Foundation**
- Review and customize chart of accounts
- Connect primary bank account
- Configure sales tax rates
- Understand the reconciliation process

**Day 3-4: Products & Inventory**
- Create logical category structure
- Add all products for sale
- Upload product images
- Set initial inventory counts

**Day 5-7: Website Building**
- Customize home page hero and content
- Tell your story on the about page
- Add contact information
- Write FAQ entries
- Preview and publish pages

**Day 8-10: Operations Setup**
- Create staff accounts
- Configure POS stations
- Set up restaurant menus (if applicable)
- Enter livestock records (if applicable)

**Day 11-14: Testing & Training**
- Test complete order flow
- Train staff on their applications
- Document any issues
- Make final adjustments

### 3.3 Go-Live Checklist

Before announcing to customers:

```
PRE-LAUNCH VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━
□ Payment processing tested and working
□ All products have images and accurate prices
□ Website pages reviewed and published
□ Mobile responsiveness verified
□ Contact information accurate
□ Staff trained and confident
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
│     ├── Open Herds & Flocks app                                │
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
│  ├── Monitor website orders                                    │
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
│  └── Test card reader connectivity                             │
│                                                                 │
│  DURING EVENT                                                  │
│  ├── Ring up sales on POS Terminal                             │
│  ├── Accept cards, cash, and mobile payments                   │
│  ├── Apply discounts as needed                                 │
│  └── Provide receipts (print or email)                         │
│                                                                 │
│  FOOD SERVICE (if applicable)                                  │
│  ├── Take orders on Restaurant POS                             │
│  ├── Kitchen views orders on KDS                               │
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
│     ├── Check daily sales report                               │
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
│ │Sign │      │Onb. │       │Config│      │Test &│       │Daily    │        │
│ │Up   │─────▶│Wizard│─────▶│Setup │─────▶│Train │─────▶│Operations│       │
│ └─────┘      └─────┘       └─────┘       └─────┘       └─────────┘        │
│                                                                             │
│ • Account    • Profile      • Accounts    • Staff       • Orders           │
│ • Email      • Stripe       • Products    • Testing     • Payments         │
│ • Login      • Plan         • Website     • Go Live!    • Reports          │
│              • Import       • Menus                     • Growth           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MILESTONES:                                                               │
│  ✓ Day 1: Account created, can log in                                     │
│  ✓ Day 2-3: Payment processing ready                                      │
│  ✓ Week 1: Products and website live                                      │
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
| **Time to First Login** | < 1 hour | Account creation to first login |
| **Wizard Completion Rate** | > 90% | Complete all wizard steps |
| **Time to First Product** | < 3 days | First product added |
| **Time to First Sale** | < 14 days | First revenue transaction |
| **Trial Conversion Rate** | > 70% | Trial to paid subscription |

### Ongoing Health Indicators

| Metric | Healthy Range | Warning Sign |
|--------|--------------|--------------|
| **Weekly Active Users** | 3+ logins/week | < 1 login/week |
| **Monthly Transactions** | Growing | Declining 2+ months |
| **Support Tickets** | Decreasing over time | Increasing |
| **Feature Utilization** | Using 60%+ features | Using < 30% |

### Tenant Lifecycle Stages

```
ENGAGEMENT STAGES
━━━━━━━━━━━━━━━━━

Onboarding (0-14 days)
├── Setup completion %
├── First sale achieved
└── Support interactions

Adoption (15-90 days)
├── Feature exploration
├── Staff accounts created
└── Consistent usage patterns

Growth (90+ days)
├── Transaction volume
├── Product catalog expansion
└── Customer base growth

Mature (1+ year)
├── Full feature utilization
├── Predictable operations
└── Platform advocacy
```

---

## Support Resources

### Documentation

- **User Guides**: https://docs.hoodfamilyfarms.com/guides
- **Video Tutorials**: https://docs.hoodfamilyfarms.com/videos
- **FAQ**: https://docs.hoodfamilyfarms.com/faq

### Getting Help

| Need | Resource |
|------|----------|
| How-to questions | In-app help (?) icon |
| Technical issues | support@hoodfamilyfarms.com |
| Account/billing | billing@hoodfamilyfarms.com |
| Feature requests | Feedback button in app |

### Training Options

- Self-paced video tutorials
- Live webinar sessions (weekly)
- One-on-one onboarding calls (Enterprise)
- On-site training (Enterprise, additional fee)

---

*This document provides an overview of the onboarding journey. For detailed instructions, refer to the specific user guides for Super Admins and Tenant Admins.*
