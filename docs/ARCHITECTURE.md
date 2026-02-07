# Hood Family Farms Business Manager

# Platform Architecture

**Version:** 2.0
**Last Updated:** February 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Multi-Tenant Architecture](#multi-tenant-architecture)
4. [Application Components](#application-components)
5. [Infrastructure &amp; Deployment](#infrastructure--deployment)
6. [Data Architecture](#data-architecture)
7. [Integration Services](#integration-services)
8. [Security Architecture](#security-architecture)
9. [API Design](#api-design)
10. [Appendix: Technology Stack](#appendix-technology-stack)

---

## Executive Summary

The Hood Family Farms Business Manager is a comprehensive multi-tenant SaaS platform designed for farm and restaurant operations. It provides a complete business management solution covering livestock tracking, restaurant POS operations, accounting, inventory management, and customer-facing ecommerce.

The platform replaces multiple legacy systems (QuickBooks, Square, spreadsheets) with a unified solution featuring:

- **Unified Payment Processing** via Stripe Connect (multi-tenant connected accounts)
- **Multi-tenant Architecture** with complete data isolation and per-tenant branding
- **SSO Authentication** across all applications via shared cookie
- **Custom Branding** per tenant with dynamic color schemes, logos, and white-label storefronts
- **Integrated Operations** from farm to table to customer
- **Tenant Portal** — SSO-powered app launcher for staff to access all enabled applications

The platform is live in production under the `busmgr.com` domain (with `hoodfamilyfarms.com` retained as a legacy/transition domain). The first active tenant is "Hood Family Farms" (slug: `hood-family-farms`).

---

## System Overview

### Platform Components

The platform consists of eight frontend applications and a shared backend API, each serving specific operational needs:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HOOD FAMILY FARMS BUSINESS MANAGER                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Back Office │  │   Herds &   │  │ Restaurant  │  │   Kitchen   │         │
│  │             │  │   Flocks    │  │     POS     │  │   Display   │         │
│  │ • Accounting│  │             │  │             │  │   System    │         │
│  │ • Inventory │  │ • Livestock │  │ • Orders    │  │             │         │
│  │ • CMS       │  │ • Health    │  │ • Tables    │  │ • Order     │         │
│  │ • Orders    │  │ • Breeding  │  │ • Tickets   │  │   Queue     │         │
│  │ • Reports   │  │ • Pastures  │  │ • Tips      │  │ • Prep      │         │
│  │ • Vendors   │  │ • Sales     │  │ • Modifiers │  │ • Bump      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    POS      │  │  Ecommerce  │  │ Onboarding  │  │   Tenant    │         │
│  │  Terminal   │  │   Website   │  │   Portal    │  │   Portal    │         │
│  │             │  │             │  │             │  │             │         │
│  │ • Quick     │  │ • Products  │  │ • Tenant    │  │ • SSO App   │         │
│  │   Sales     │  │ • Cart      │  │   Setup     │  │   Launcher  │         │
│  │ • Payments  │  │ • Checkout  │  │ • Stripe    │  │ • Enabled   │         │
│  │ • Layouts   │  │ • Blog      │  │   Connect   │  │   Apps      │         │
│  │ • Receipts  │  │ • Events    │  │ • App       │  │ • Branding  │         │
│  └─────────────┘  └─────────────┘  │   Registry  │  └─────────────┘         │
│                                    └─────────────┘                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Application Summary

| Application                      | Purpose                                      | Primary Users         | Dev Port | Production Subdomain         |
| -------------------------------- | -------------------------------------------- | --------------------- | -------- | ---------------------------- |
| **Backend API**            | Shared Express API for all applications      | All apps              | 3001     | api.busmgr.com               |
| **Back Office**            | Accounting, inventory, CMS, order management | Owner, Office Staff   | 3000     | {tenant}.office.busmgr.com   |
| **Herds & Flocks**         | Livestock tracking, health records, pastures | Farm Hands, Ranchers  | 3002     | {tenant}.herds.busmgr.com    |
| **POS Terminal**           | Quick sales and payment processing           | Cashiers, Sales Staff | 3005     | {tenant}.pos.busmgr.com      |
| **Restaurant POS**         | Menu-based ordering for food service         | Servers, Order Takers | 3003     | {tenant}.rpos.busmgr.com     |
| **Kitchen Display System** | Order queue management for kitchen           | Kitchen Staff, Cooks  | 3004     | {tenant}.kitchen.busmgr.com  |
| **Ecommerce Website**      | Customer-facing store and content            | Customers (Public)    | 3006     | {tenant}.app.busmgr.com      |
| **Onboarding Portal**      | Tenant setup and configuration               | Super Admin           | 3007     | onboarding.busmgr.com        |
| **Tenant Portal**          | SSO app launcher for tenant staff            | All Tenant Staff      | 3008     | {tenant}.busmgr.com           |

---

## Multi-Tenant Architecture

### Tenant Isolation Model

The platform implements strict tenant isolation at every layer:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TENANT ISOLATION LAYERS                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PRESENTATION LAYER                                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Subdomains: {tenant}.{app}.busmgr.com                               │   │
│  │  Examples:                                                           │   │
│  │  • hood-family-farms.office.busmgr.com                               │   │
│  │  • green-acres.herds.busmgr.com                                      │   │
│  │  • hood-family-farms.busmgr.com (ecommerce storefront)               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  APPLICATION LAYER                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  • SSO cookie (busmgr_sso) shared across *.busmgr.com                │   │
│  │  • JWT tokens contain tenant_id claim                                │   │
│  │  • Middleware validates tenant context on every request              │   │
│  │  • React state scoped to authenticated tenant                        │   │
│  │  • Dynamic branding (colors, logos) loaded per tenant                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  API LAYER                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  • All routes extract tenant_id from authenticated user              │   │
│  │  • Defense-in-depth: tenant_id required even where inherited         │   │
│  │  • Stripe Connect routes to tenant's connected account               │   │
│  │  • App access controlled via tenant_app_access + app_registry        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  DATA LAYER                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  • All tables include tenant_id column                               │   │
│  │  • Foreign key constraints ensure referential integrity              │   │
│  │  • Composite indexes on (tenant_id, ...) for query performance       │   │
│  │  • Tenants table uses UUID primary key                               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Subdomain Architecture

Each tenant receives dedicated subdomains for each application:

```
Primary Domain: busmgr.com

{tenant-slug}.office.busmgr.com          → Back Office
{tenant-slug}.herds.busmgr.com           → Herds & Flocks
{tenant-slug}.rpos.busmgr.com            → Restaurant POS
{tenant-slug}.kitchen.busmgr.com         → Kitchen Display System
{tenant-slug}.pos.busmgr.com             → POS Terminal
{tenant-slug}.portal.busmgr.com          → Tenant Portal (SSO App Launcher)
{tenant-slug}.busmgr.com                 → Ecommerce Website (storefront)
signup.busmgr.com                        → Onboarding Portal (super admin only)
backend.busmgr.com                       → Shared API

Legacy Domain (transition): hoodfamilyfarms.com
Same subdomain patterns apply with hoodfamilyfarms.com base.
```

### Custom Domain Support

Tenants can configure custom domains for their ecommerce storefront:

```
CNAME: www.fredsfarm.com → freds-farm.busmgr.com
```

---

## Application Components

### Back Office

The central hub for business administration.

**Modules:**

- **Dashboard** — KPIs, alerts, recent activity
- **Accounting** — Chart of accounts (accounts_chart), journal entries, financial reports
- **Bank Connections** — Plaid integration for transaction sync and reconciliation
- **Customers** — Contact management, purchase history
- **Inventory** — Products (items), stock levels, categories, tags
- **Orders** — Online order management, fulfillment tracking
- **Reports** — Financial statements, sales analytics, custom Report Builder
- **Settings** — Business profile, tax rates, tenant settings, integrations
- **Site Builder** — CMS for ecommerce website content (blocks, templates, themes)
- **Site Designer** — Page layout management for storefront
- **Users** — Staff accounts and role-based permissions
- **Data Import** — CSV import tools for migration
- **Vendors** — Vendor/supplier management
- **Fixed Assets** — Asset tracking and depreciation schedules
- **Blog** — Content management for blog posts
- **Events** — Event management and event series
- **Social Media** — Social media connections and post management
- **Memberships** — Farm membership management

### Herds & Flocks

Comprehensive livestock management.

**Features:**

- Herd/flock registration with configurable animal types, breeds, and categories
- Individual animal tracking with unique identifiers and custom field definitions
- Health event tracking (vaccinations, treatments, health records)
- Breeding records and lineage
- Pasture management (soil samples, nutrient tracking, treatments, tasks, grazing events)
- Weight and growth tracking
- Processing and harvest records
- Rainfall records for pasture management
- Animal sales with buyers, sale tickets, and fee tracking
- Full traceability from birth to sale

### Restaurant POS

Full-service restaurant ordering system.

**Features:**

- Menu management with sections, items, and modifiers
- Menu item ingredient tracking
- Table/ticket management
- Order modifications and special requests
- Split checks and merged tabs
- Tip handling
- Kitchen ticket display integration
- Server assignment

### Kitchen Display System (KDS)

Real-time order queue for food preparation.

**Features:**

- Order queue with priority sorting
- Item-level prep status
- Color-coded timing alerts
- Bump/complete functionality
- Course firing control
- Station-specific filtering
- Dedicated high-frequency polling rate limit (120 req/min)

### POS Terminal

Streamlined point-of-sale for quick transactions.

**Features:**

- Product catalog with customizable quick-button layouts (pos_layouts)
- Barcode scanning support
- Cash and card payments via Stripe Terminal (with reader management)
- Receipt printing/emailing
- Discount application
- Refund processing
- End-of-day settlement
- Separate order tables (pos_orders, pos_order_items) from ecommerce

### Ecommerce Website

Customer-facing storefront and content platform.

**Features:**

- Product catalog with categories
- Shopping cart and checkout
- Stripe payment processing (via tenant's connected account)
- Order confirmation and tracking
- Blog/content pages
- Event listings
- Contact forms
- Newsletter signup
- Custom branding (logo, colors, fonts via tenant_site_settings)
- Site Builder with global blocks, templates, and themes
- Delivery zone configuration

### Onboarding Portal

System administration and tenant provisioning (super_admin access only).

**Features:**

- Tenant creation wizard
- Business profile configuration
- Stripe Connect onboarding flow
- Subscription plan selection and billing management
- App registry and per-tenant app enablement
- Feature configuration
- Data import tools
- Tenant monitoring dashboard
- Platform settings management

### Tenant Portal

SSO-powered application launcher for tenant staff.

**Features:**

- Single sign-on hub using shared busmgr_sso cookie
- Displays only applications enabled for the tenant (via app_registry + tenant_app_access)
- Tenant-branded interface with custom colors and logo
- Quick navigation to all staff-facing applications
- Role-aware: shows apps appropriate to the user's role

---

## Infrastructure & Deployment

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEPLOYMENT INFRASTRUCTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    INTERNET                                                                 │
│        │                                                                    │
│        ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │              DNS (Squarespace Nameservers)                           │   │
│  │  • DNS management for *.busmgr.com + *.hoodfamilyfarms.com           │   │
│  │  • Wildcard subdomains routed to Vercel / Railway                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│        │                                                                    │
│        ├────────────────────────┬───────────────────────────────┐           │
│        ▼                        ▼                               ▼           │
│  ┌───────────────┐       ┌───────────────┐             ┌───────────────┐    │
│  │    VERCEL     │       │    RAILWAY    │             │   RAILWAY     │    │
│  │   (Frontend)  │       │   (Backend)   │             │  (Database)   │    │
│  │               │       │               │             │               │    │
│  │ • Back Office │       │ • Express API │             │ • PostgreSQL  │    │
│  │ • Herds       │       │ • Auth + SSO  │             │   17          │    │
│  │ • Restaurant  │       │ • Business    │             │ • Connection  │    │
│  │ • KDS         │       │   Logic       │             │   Pooling     │    │
│  │ • POS Terminal│       │ • Webhooks    │             │ • Backups     │    │
│  │ • Ecommerce   │       │ • Media       │             │               │    │
│  │ • Onboarding  │       │   Uploads     │             │               │    │
│  │ • Portal      │       │               │             │               │    │
│  └───────────────┘       └───────────────┘             └───────────────┘    │
│                                   │                             │           │
│                                   └─────────────────────────────┘           │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    CLOUDFLARE (Storage)                              │   │
│  │  • R2 Object Storage (tenant media assets)                           │   │
│  │  • CDN distribution for uploaded files                               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Environment Configuration

| Environment | Frontend URL                    | API URL            | Database              |
| ----------- | ------------------------------- | ------------------ | --------------------- |
| Development | localhost:300X (see port table) | localhost:3000     | Local PostgreSQL      |
| Production  | *.busmgr.com                    | backend.busmgr.com | Railway PostgreSQL 17 |

### Scaling Considerations

- **Frontend**: Vercel auto-scales based on traffic
- **Backend**: Railway supports horizontal scaling
- **Database**: PostgreSQL 17 with connection pooling; read replicas for analytics
- **Media**: Cloudflare R2 with global CDN distribution

---

## Data Architecture

### Database Schema Overview

The database uses PostgreSQL 17 with `uuid-ossp` extension. Tables are organized into the following domains:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA DOMAINS                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CORE TENANT                    ACCOUNTING                                  │
│  ├─ tenants (UUID PK)           ├─ accounts_chart (chart of accounts)       │
│  ├─ accounts (UUID PK, users)   ├─ journal_entries                          │
│  ├─ platform_settings           ├─ journal_entry_lines                      │
│  ├─ tenant_settings             ├─ fiscal_periods                           │
│  ├─ app_registry                ├─ classes                                  │
│  └─ tenant_app_access           ├─ transactions                             │
│                                 └─ transaction_acceptance                   │
│                                                                             │
│  BANKING                        CUSTOMERS & VENDORS                         │
│  ├─ plaid_items                 ├─ memberships                              │
│  ├─ plaid_accounts              └─ vendors                                  │
│  └─ bank_accounts                                                           │
│                                                                             │
│  INVENTORY                      FIXED ASSETS                                │
│  ├─ items                       ├─ fixed_assets                             │
│  ├─ categories                  └─ asset_depreciation_schedule              │
│  ├─ item_tags                                                               │
│  ├─ tags                        ECOMMERCE ORDERS                            │
│  └─ inventory_logs              ├─ orders                                   │
│                                 ├─ order_items                              │
│  POS ORDERS                     └─ delivery_zones                           │
│  ├─ pos_orders                                                              │
│  ├─ pos_order_items             RESTAURANT ORDERS                           │
│  ├─ pos_layouts                 ├─ restaurant_orders                        │
│  └─ pos_layout_items            └─ restaurant_order_items                   │
│                                                                             │
│  MENUS                          TRAILER ORDERS                              │
│  ├─ menus                       ├─ trailer_orders                           │
│  ├─ menu_sections               └─ trailer_order_items                      │
│  ├─ menu_section_items                                                      │
│  ├─ menu_items                  LIVESTOCK                                   │
│  ├─ menu_item_modifications     ├─ herds_flocks (INT PK)                    │
│  ├─ menu_item_ingredients       ├─ animals                                  │
│  └─ modifications               ├─ animal_types                             │
│                                 ├─ animal_categories                        │
│  PASTURES                       ├─ breeds                                   │
│  ├─ pastures                    ├─ animal_health_records                    │
│  ├─ pasture_soil_samples        ├─ animal_weights                           │
│  ├─ pasture_nutrients           ├─ animal_owners                            │
│  ├─ pasture_treatments          ├─ animal_sales                             │
│  ├─ pasture_tasks               ├─ processing_records                       │
│  ├─ pasture_grazing_events      └─ rainfall_records                         │
│  └─ grazing_event_animals                                                   │
│                                 SALES (Livestock)                           │
│  WEBSITE / CMS                  ├─ sale_tickets                             │
│  ├─ site_pages                  ├─ sale_ticket_items                        │
│  ├─ page_blocks                 ├─ sale_ticket_fees                         │
│  ├─ page_sections               ├─ sale_fee_types                           │
│  ├─ site_templates              └─ buyers                                   │
│  ├─ template_zones                                                          │
│  ├─ block_types                 CONTENT                                     │
│  ├─ global_blocks               ├─ blog_posts                               │
│  ├─ global_block_instances      ├─ events                                   │
│  ├─ site_themes                 ├─ event_series                             │
│  ├─ theme_sections              ├─ media                                    │
│  ├─ site_assets                 └─ media_folders                            │
│  └─ tenant_site_settings                                                    │
│                                 SOCIAL MEDIA                                │
│  SUBSCRIPTIONS / BILLING        ├─ social_platforms                         │
│  ├─ subscription_plans          ├─ social_connections                       │
│  ├─ subscription_events         ├─ social_posts                             │
│  ├─ stripe_application_fees     └─ social_post_platforms                    │
│  └─ tenant_assets                                                           │
│                                 STRIPE TERMINAL                             │
│  REPORTING                      ├─ stripe_terminal_locations                │
│  ├─ report_configurations       └─ stripe_terminal_readers                  │
│  ├─ report_field_definitions                                                │
│  ├─ report_record_definitions   SYSTEM                                      │
│  ├─ report_run_history          ├─ _migrations                              │
│  └─ custom_reports              └─ audit_log                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Tenant Isolation**: Every table includes `tenant_id` with foreign key constraint to `tenants`
2. **UUID Primary Keys**: Core tables (tenants, accounts) use UUID; livestock tables (herds_flocks) use INT
3. **Audit Trail**: Created/updated timestamps on all records
4. **Soft Deletes**: Archival flags rather than hard deletes where appropriate
5. **JSONB Flexibility**: Settings and metadata stored as JSONB for extensibility
6. **Referential Integrity**: Foreign keys enforced at database level
7. **Enum Types**: PostgreSQL enums for account_role, account_type, account_subtype

### Custom Enum Types

| Enum Name           | Values                                                                                                                                                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `account_role`    | admin, staff, customer, super_admin                                                                                                                                                                                                                 |
| `account_type`    | asset, liability, equity, revenue, expense                                                                                                                                                                                                          |
| `account_subtype` | cash, bank, accounts_receivable, inventory, fixed_asset, other_asset, accounts_payable, credit_card, current_liability, long_term_liability, owners_equity, retained_earnings, sales, other_income, cost_of_goods, operating_expense, other_expense |

### Data Flow Example: Order Lifecycle

```
Customer places order on Ecommerce ({tenant}.busmgr.com)
         │
         ▼
┌─────────────────┐
│  orders table   │ ← Order created with status 'pending'
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Stripe API     │ ← Payment processed via tenant's connected account
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   payments      │ ← Payment recorded (Stripe webhook)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ journal_entries │ ← Revenue and receivables posted
│ journal_entry_  │
│ lines           │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│     items       │ ← Inventory decremented
└─────────────────┘
         │
         ▼
Order appears in Back Office for fulfillment
```

---

## Integration Services

### Stripe Connect

Multi-tenant payment processing with connected accounts.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STRIPE CONNECT ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐                              ┌──────────────────────┐     │
│  │   Customer   │ ───── Payment ────────────▶ │       Stripe         │     │
│  └──────────────┘                              │                      │     │
│                                                │  ┌────────────────┐  │     │
│                                                │  │ Platform Acct  │  │     │
│                                                │  │ (BusMgr)       │  │     │
│                                                │  └───────┬────────┘  │     │
│                                                │          │           │     │
│                        Application Fee ───────────────────┤           │     │
│                     (stripe_application_fees)  │          │           │     │
│                                                │          │           │     │
│  ┌──────────────┐                              │  ┌───────▼────────┐  │     │
│  │   Tenant     │ ◀───── Payout ──────────────│  │ Connected Acct │  │     │
│  │ Bank Account │                              │  │ (Tenant)       │  │     │
│  └──────────────┘                              │  └────────────────┘  │     │
│                                                │                      │     │
│                                                └──────────────────────┘     │
│                                                                             │
│  Stripe Terminal Integration:                                               │
│  • stripe_terminal_locations — physical reader locations                    │
│  • stripe_terminal_readers — registered card readers per tenant             │
│  • In-person payments via POS Terminal and Restaurant POS                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Plaid

Bank account connections for transaction synchronization.

**Tables:** `plaid_items`, `plaid_accounts`, `bank_accounts`

**Capabilities:**

- Link bank accounts securely via Plaid Link
- Sync transactions daily
- Categorize transactions automatically
- Support bank reconciliation workflow

### Webhooks

Event-driven architecture for external integrations.

| Provider | Events Handled                                                                 |
| -------- | ------------------------------------------------------------------------------ |
| Stripe   | `payment_intent.succeeded`, `customer.subscription.*`, `account.updated` |
| Plaid    | `TRANSACTIONS_SYNC`, `ITEM_ERROR`                                          |

Note: Webhook routes receive raw request bodies (JSON parsing is skipped for `/webhook` paths to allow Stripe signature verification).

---

## Security Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AUTHENTICATION FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. LOGIN REQUEST                                                           │
│     User → POST /auth/login { email, password }                             │
│                                                                             │
│  2. VALIDATION                                                              │
│     Server validates credentials against bcrypt hash in accounts table      │
│                                                                             │
│  3. TOKEN GENERATION                                                        │
│     JWT created with claims:                                                │
│     {                                                                       │
│       id: "uuid",                                                           │
│       email: "user@example.com",                                            │
│       role: "admin|staff|customer|super_admin",                             │
│       tenant_id: "uuid",                                                    │
│       exp: <7 days>                                                         │
│     }                                                                       │
│                                                                             │
│  4. SSO COOKIE + TOKEN STORAGE                                              │
│     • JWT set as busmgr_sso cookie (domain: .busmgr.com)                    │
│     • Shared across all *.busmgr.com subdomains                             │
│     • Client also stores token in localStorage as fallback                  │
│                                                                             │
│  5. AUTHENTICATED REQUESTS (Token Resolution Priority)                      │
│     1st: Authorization: Bearer <token>                                      │
│     2nd: ?token=<token> (query parameter)                                   │
│     3rd: busmgr_sso cookie                                                  │
│     Each source is tried in order; if one fails, the next is attempted      │
│                                                                             │
│  6. MIDDLEWARE VALIDATION                                                   │
│     • Verify JWT signature                                                  │
│     • Check expiration                                                      │
│     • Look up user in accounts table (verify active)                        │
│     • Extract tenant_id for data scoping                                    │
│     • Verify role permissions                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Role-Based Access Control

Role hierarchy (highest to lowest):

| Role                   | Description                                 | Back Office | Herds    | Restaurant | KDS  | POS     | Portal |
| ---------------------- | ------------------------------------------- | ----------- | -------- | ---------- | ---- | ------- | ------ |
| **super_admin**  | Platform-level admin (assigned via DB only) | Full        | Full     | Full       | Full | Full    | Full   |
| **tenant_admin** | Full control of their own tenant            | Full        | Full     | Full       | Full | Full    | Full   |
| **admin**        | Day-to-day admin within a tenant            | Full        | Full     | Full       | Full | Full    | Full   |
| **staff**        | Front-line staff (POS, herds, etc.)         | Limited     | Assigned | Assigned   | View | Operate | View   |
| **accountant**   | External accountant; financial views only   | Financial   | None     | None       | None | None    | View   |
| **customer**     | End-user / shopper                          | None        | None     | None       | None | None    | None   |

### Security Middleware

| Middleware       | Purpose                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `helmet`       | Security headers (CSP, X-Frame-Options, etc.)                        |
| `cors`         | Strict origin validation with pattern matching for subdomains        |
| `cookieParser` | SSO cookie parsing for cross-subdomain authentication                |
| `rateLimit`    | General: 100 req/15min per IP; POS/KDS: 120 req/1min                 |
| `authenticate` | JWT verification with fallback chain (Bearer → query → SSO cookie) |
| `appAccess`    | Verifies tenant has access to the requested application              |

### Data Protection

- **Encryption at Rest**: PostgreSQL with encrypted storage on Railway
- **Encryption in Transit**: TLS for all connections
- **PCI Compliance**: Payment data handled exclusively by Stripe (no card data touches our servers)
- **CORS Policy**: Regex-based origin validation for `*.busmgr.com` and `*.hoodfamilyfarms.com`
- **Rate Limiting**: Tiered API throttling (general vs POS/KDS high-frequency)
- **Body Size Limits**: 10MB max for JSON and URL-encoded payloads

---

## API Design

### RESTful Conventions

```
Base URL: https://backend.busmgr.com/api/v1

Authentication: Bearer token in Authorization header, query param, or busmgr_sso cookie

Health Check: GET /health (returns DB status, uptime, version)

Standard Response Format:
{
  "status": "success" | "error",
  "data": { ... } | null,
  "message": "..." (for errors),
  "pagination": { ... } (for lists)
}
```

### Route Organization

| Route Prefix                | Domain                                       |
| --------------------------- | -------------------------------------------- |
| `/auth`                   | Authentication, login, SSO, user management  |
| `/accounts`               | User accounts (staff, customers)             |
| `/tenants`                | Tenant configuration                         |
| `/tenant-settings`        | Per-tenant settings and branding             |
| `/tenant-assets`          | Tenant media assets (logos, images)          |
| `/portal`                 | Tenant portal API                            |
| `/admin`                  | Super admin operations                       |
| `/accounting`             | Accounting categories and settings           |
| `/items`                  | Inventory / product management               |
| `/categories`             | Item categories                              |
| `/tags`                   | Item tags                                    |
| `/journal-entries`        | Journal entries and lines                    |
| `/financial-reports`      | Financial statement generation               |
| `/report-builder`         | Custom report configuration and execution    |
| `/reports`                | Standard reports                             |
| `/transactions`           | Transaction management                       |
| `/transaction-acceptance` | Transaction acceptance rules                 |
| `/classes`                | Accounting classes                           |
| `/fixed-assets`           | Fixed asset tracking and depreciation        |
| `/orders`                 | Ecommerce order management                   |
| `/payments`               | Payment processing                           |
| `/plaid`                  | Plaid bank connection integration            |
| `/connect`                | Stripe Connect onboarding                    |
| `/subscriptions`          | Subscription billing and plans               |
| `/terminal`               | Stripe Terminal reader management            |
| `/menus`                  | Restaurant menu management                   |
| `/modifications`          | Menu item modifications                      |
| `/restaurant-pos`         | Restaurant POS ordering (rate-limited)       |
| `/kds`                    | Kitchen Display System (rate-limited)        |
| `/pos-layouts`            | POS Terminal button layouts                  |
| `/herds-flocks`           | Livestock management                         |
| `/site-builder`           | CMS block and template management            |
| `/site-designer`          | Page layout management                       |
| `/site-public`            | Public-facing site content (unauthenticated) |
| `/blog`                   | Blog post management                         |
| `/events`                 | Event management                             |
| `/media`                  | Media file uploads and management            |
| `/social`                 | Social media connections and posts           |
| `/memberships`            | Farm membership management                   |
| `/delivery-zones`         | Delivery zone configuration                  |
| `/vendors`                | Vendor/supplier management                   |
| `/data-import`            | CSV data import tools                        |
| `/import`                 | Legacy import endpoint                       |

### Pagination Pattern

```json
GET /api/v1/items?page=1&limit=20

Response:
{
  "status": "success",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

## Appendix: Technology Stack

### Frontend

| Technology              | Purpose                      |
| ----------------------- | ---------------------------- |
| React 18                | UI framework                 |
| React Router 6          | Client-side routing          |
| Axios                   | HTTP client                  |
| CSS (external)          | Component styling (per-file) |
| Recharts                | Data visualization           |
| Lucide React            | Icon library                 |
| React Quill             | Rich text editor (Blog/CMS)  |
| React Plaid Link        | Plaid bank connection UI     |
| @stripe/stripe-js       | Stripe checkout integration  |
| @stripe/react-stripe-js | Stripe React components      |
| @stripe/terminal-js     | Stripe Terminal SDK          |

### Backend

| Technology         | Purpose               |
| ------------------ | --------------------- |
| Node.js 18+        | Runtime environment   |
| Express.js         | Web framework         |
| PostgreSQL 17      | Primary database      |
| node-postgres (pg) | Database driver       |
| JWT (jsonwebtoken) | Authentication tokens |
| bcrypt             | Password hashing      |
| Winston            | Structured logging    |
| Multer             | File uploads          |
| Helmet             | Security headers      |
| express-rate-limit | API rate limiting     |
| cookie-parser      | SSO cookie handling   |

### External Services

| Service    | Purpose                                         |
| ---------- | ----------------------------------------------- |
| Stripe     | Payment processing, Connect, Terminal, Webhooks |
| Plaid      | Bank account linking and transaction sync       |
| Cloudflare | R2 object storage for tenant media              |
| Vercel     | Frontend hosting (all 8 applications)           |
| Railway    | Backend API and PostgreSQL database hosting     |

### DNS & Domains

| Service             | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| Squarespace         | Nameservers and DNS management                  |
| busmgr.com          | Primary production domain (wildcard subdomains) |
| hoodfamilyfarms.com | Legacy/transition domain (wildcard subdomains)  |

### Development Tools

| Tool    | Purpose                 |
| ------- | ----------------------- |
| Git     | Version control         |
| npm     | Package management      |
| pgAdmin | Database administration |
| Postman | API testing             |
| Draw.io | Architecture diagrams   |

---

*Document maintained by the CR Hood Solutions development team.*
*Last audited against production codebase: February 7, 2026.*
