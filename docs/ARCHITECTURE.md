# Hood Family Farms Business Manager
# Platform Architecture

**Version:** 1.0  
**Last Updated:** January 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Multi-Tenant Architecture](#multi-tenant-architecture)
4. [Application Components](#application-components)
5. [Infrastructure & Deployment](#infrastructure--deployment)
6. [Data Architecture](#data-architecture)
7. [Integration Services](#integration-services)
8. [Security Architecture](#security-architecture)
9. [API Design](#api-design)
10. [Appendix: Technology Stack](#appendix-technology-stack)

---

## Executive Summary

The Hood Family Farms Business Manager is a comprehensive multi-tenant SaaS platform designed for farm and restaurant operations. It provides a complete business management solution covering livestock tracking, restaurant POS operations, accounting, inventory management, and customer-facing ecommerce.

The platform replaces multiple legacy systems (QuickBooks, Square, spreadsheets) with a unified solution featuring:

- **Unified Payment Processing** via Stripe Connect
- **Multi-tenant Architecture** with complete data isolation
- **Custom Branding** per tenant with white-label capabilities
- **Integrated Operations** from farm to table to customer

---

## System Overview

### Platform Components

The platform consists of six core applications, each serving specific operational needs:

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
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                          │
│  │    POS      │  │  Ecommerce  │  │ Onboarding  │                          │
│  │  Terminal   │  │   Website   │  │   Portal    │                          │
│  │             │  │             │  │             │                          │
│  │ • Quick     │  │ • Products  │  │ • Tenant    │                          │
│  │   Sales     │  │ • Cart      │  │   Setup     │                          │
│  │ • Payments  │  │ • Checkout  │  │ • Config    │                          │
│  │ • Receipts  │  │ • Blog      │  │ • Import    │                          │
│  └─────────────┘  └─────────────┘  └─────────────┘                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Application Summary

| Application                | Purpose                                      | Primary Users         | Port |
|----------------------------|----------------------------------------------|-----------------------|------|
| **Back Office**            | Accounting, inventory, CMS, order management | Owner, Office Staff   | 3001 |
| **Herds & Flocks**         | Livestock tracking, health records, breeding | Farm Hands, Ranchers  | 3002 |
| **Restaurant POS**         | Menu-based ordering for food service         | Servers, Order Takers | 3003 |
| **Kitchen Display System** | Order queue management for kitchen           | Kitchen Staff, Cooks  | 3004 |
| **POS Terminal**           | Quick sales and payment processing           | Cashiers, Sales Staff | 3005 |
| **Ecommerce Website**      | Customer-facing store and content            | Customers (Public)    | 3006 |
| **Onboarding Portal**      | Tenant setup and configuration               | Super Admin           | 3008 |

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
│  │  Subdomains: {tenant}.{app}.hoodfamilyfarms.com                      │   │
│  │  Examples:                                                           │   │
│  │  • freds-farm.office.hoodfamilyfarms.com                             │   │
│  │  • green-acres.pos.hoodfamilyfarms.com                               │   │
│  │  • smith-ranch.hoodfamilyfarms.com (ecommerce)                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  APPLICATION LAYER                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  • JWT tokens contain tenant_id claim                                │   │
│  │  • Middleware validates tenant context on every request              │   │
│  │  • React state scoped to authenticated tenant                        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  API LAYER                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  • All routes extract tenant_id from authenticated user              │   │
│  │  • Defense-in-depth: tenant_id required even where inherited         │   │
│  │  • Stripe Connect routes to tenant's connected account               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  DATA LAYER                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  • All tables include tenant_id column                               │   │
│  │  • Foreign key constraints ensure referential integrity              │   │
│  │  • Indexes on (tenant_id, ...) for query performance                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Subdomain Architecture

Each tenant receives dedicated subdomains for each application:

```
{tenant-slug}.office.hoodfamilyfarms.com        → Back Office
{tenant-slug}.herds.hoodfamilyfarms.com         → Herds & Flocks
{tenant-slug}.restaurant.hoodfamilyfarms.com    → Restaurant POS
{tenant-slug}.kitchen.hoodfamilyfarms.com       → Kitchen Display
{tenant-slug}.pos.hoodfamilyfarms.com           → POS Terminal
{tenant-slug}.hoodfamilyfarms.com               → Ecommerce Website
```

### Custom Domain Support

Tenants can configure custom domains for their ecommerce site:

```
CNAME: www.fredsfarm.com → freds-farm.hoodfamilyfarms.com
```

---

## Application Components

### Back Office

The central hub for business administration.

**Modules:**
- **Dashboard** — KPIs, alerts, recent activity
- **Accounting** — Chart of accounts, journal entries, reconciliation
- **Bank Connections** — Plaid integration for transaction sync
- **Customers** — Contact management, purchase history
- **Inventory** — Products, stock levels, categories
- **Orders** — Online order management, fulfillment
- **Reports** — Financial statements, sales analytics
- **Settings** — Business profile, tax rates, integrations
- **Site Builder** — CMS for ecommerce website content
- **Users** — Staff accounts and permissions
- **Data Import** — CSV import tools for migration

### Herds & Flocks

Comprehensive livestock management.

**Features:**
- Animal registration with unique identifiers
- Health event tracking (vaccinations, treatments)
- Breeding records and lineage
- Pasture and paddock management
- Weight and growth tracking
- Processing and harvest records
- Full traceability from birth to sale

### Restaurant POS

Full-service restaurant ordering system.

**Features:**
- Menu management with modifiers
- Table/ticket management
- Order modifications and special requests
- Split checks and merged tabs
- Tip handling
- Kitchen ticket printing/display
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

### POS Terminal

Streamlined point-of-sale for quick transactions.

**Features:**
- Product catalog with quick buttons
- Barcode scanning support
- Cash and card payments via Stripe Terminal
- Receipt printing/emailing
- Discount application
- Refund processing
- End-of-day settlement

### Ecommerce Website

Customer-facing storefront and content platform.

**Features:**
- Product catalog with categories
- Shopping cart and checkout
- Stripe payment processing
- Order confirmation and tracking
- Blog/content pages
- Contact forms
- Newsletter signup
- Custom branding (logo, colors, fonts)

### Onboarding Portal

System administration and tenant provisioning.

**Features:**
- Tenant creation wizard
- Business profile configuration
- Stripe Connect onboarding
- Subscription plan selection
- Feature enablement
- Data import tools
- Tenant monitoring dashboard

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
│  │                    CLOUDFLARE (DNS + CDN)                            │   │
│  │  • DNS management for *.hoodfamilyfarms.com                          │   │
│  │  • SSL/TLS termination                                               │   │
│  │  • DDoS protection                                                   │   │
│  │  • R2 Object Storage (media assets)                                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│        │                                                                    │
│        ├────────────────────────┬───────────────────────────────┐           │
│        ▼                        ▼                               ▼           │
│  ┌───────────────┐       ┌───────────────┐             ┌───────────────┐    │
│  │    VERCEL     │       │    RAILWAY    │             │   RAILWAY     │    │
│  │   (Frontend)  │       │   (Backend)   │             │  (Database)   │    │
│  │               │       │               │             │               │    │
│  │ • Back Office │       │ • Express API │             │ • PostgreSQL  │    │
│  │ • Herds       │       │ • Auth        │             │ • Connection  │    │
│  │ • Restaurant  │       │ • Business    │             │   Pooling     │    │
│  │ • KDS         │       │   Logic       │             │ • Backups     │    │
│  │ • POS         │       │ • Webhooks    │             │               │    │
│  │ • Ecommerce   │       │               │             │               │    │
│  │ • Onboarding  │       │               │             │               │    │
│  └───────────────┘       └───────────────┘             └───────────────┘    │
│                                   │                             │           │
│                                   └─────────────────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Environment Configuration

| Environment | Frontend URL                   | API URL                | Database           |
|-------------|--------------------------------|------------------------|--------------------|
| Development | localhost:300X                 | localhost:5000         | Local PostgreSQL   |
| Staging     | *.staging.hoodfamilyfarms.com  | api-staging.busmgr.com | Railway Staging    |
| Production  | *.hoodfamilyfarms.com          | backend.busmgr.com     | Railway Production |

### Scaling Considerations

- **Frontend**: Vercel auto-scales based on traffic
- **Backend**: Railway supports horizontal scaling
- **Database**: PostgreSQL with connection pooling; read replicas for analytics
- **Media**: Cloudflare R2 with global CDN distribution

---

## Data Architecture

### Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA DOMAINS                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CORE TENANT                    ACCOUNTING                                  │
│  ├─ tenants                     ├─ accounts (chart of accounts)             │
│  ├─ users                       ├─ journal_entries                          │
│  ├─ user_roles                  ├─ journal_lines                            │
│  └─ tenant_settings             ├─ bank_connections                         │
│                                 └─ bank_transactions                        │
│                                                                             │
│  INVENTORY                      CUSTOMERS                                   │
│  ├─ products                    ├─ customers                                │
│  ├─ product_categories          ├─ customer_addresses                       │
│  ├─ inventory_adjustments       └─ customer_notes                           │
│  └─ stock_locations                                                         │
│                                                                             │
│  ORDERS                         RESTAURANT                                  │
│  ├─ orders                      ├─ menus                                    │
│  ├─ order_items                 ├─ menu_items                               │
│  ├─ order_payments              ├─ menu_modifiers                           │
│  └─ order_status_history        ├─ tickets                                  │
│                                 └─ ticket_items                             │
│                                                                             │
│  LIVESTOCK                      WEBSITE                                     │
│  ├─ animals                     ├─ site_pages                               │
│  ├─ health_events               ├─ page_blocks                              │
│  ├─ breeding_records            ├─ site_templates                           │
│  ├─ paddocks                    ├─ block_types                              │
│  └─ animal_movements            └─ site_assets                              │
│                                                                             │
│  SUBSCRIPTIONS                  INTEGRATIONS                                │
│  ├─ subscription_plans          ├─ stripe_connect_accounts                  │
│  ├─ tenant_subscriptions        ├─ plaid_connections                        │
│  └─ subscription_history        └─ webhook_logs                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Tenant Isolation**: Every table includes `tenant_id` with foreign key constraint
2. **Audit Trail**: Created/updated timestamps on all records
3. **Soft Deletes**: Archival flags rather than hard deletes where appropriate
4. **JSONB Flexibility**: Settings and metadata stored as JSONB for extensibility
5. **Referential Integrity**: Foreign keys enforced at database level

### Data Flow Example: Order Lifecycle

```
Customer places order on Ecommerce
         │
         ▼
┌─────────────────┐
│  orders table   │ ← Order created with status 'pending'
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Stripe API     │ ← Payment processed
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ order_payments  │ ← Payment recorded
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ journal_entries │ ← Revenue and receivables posted
└─────────────────┘
         │
         ▼
┌─────────────────┐
│    products     │ ← Inventory decremented
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
│                                                │  │ (HFF Business  │  │     │
│                                                │  │  Manager)      │  │     │
│                                                │  └───────┬────────┘  │     │
│                                                │          │           │     │
│                        Application Fee ───────────────────┤           │     │
│                                                │          │           │     │
│  ┌──────────────┐                              │  ┌───────▼────────┐  │     │
│  │   Tenant     │ ◀───── Payout ──────────────│  │ Connected Acct │  │     │
│  │ Bank Account │                              │  │ (Tenant)       │  │     │
│  └──────────────┘                              │  └────────────────┘  │     │
│                                                │                      │     │
│                                                └──────────────────────┘     │
│                                                                             │
│  Flow:                                                                      │
│  1. Customer pays $100                                                      │
│  2. Stripe processes payment                                                │
│  3. Platform fee (e.g., 2.9% + $0.30) retained                              │
│  4. Remainder deposited to tenant's connected account                       │
│  5. Webhook notifies platform of successful payment                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Plaid

Bank account connections for transaction synchronization.

**Capabilities:**
- Link bank accounts securely
- Sync transactions daily
- Categorize transactions automatically
- Support bank reconciliation workflow

### Webhooks

Event-driven architecture for external integrations.

| Provider | Events Handled                                                           |
|----------|--------------------------------------------------------------------------|
| Stripe   | `payment_intent.succeeded`, `customer.subscription.*`, `account.updated` |
| Plaid    | `TRANSACTIONS_SYNC`, `ITEM_ERROR`                                        |

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
│     Server validates credentials against bcrypt hash                        │
│                                                                             │
│  3. TOKEN GENERATION                                                        │
│     JWT created with claims:                                                │
│     {                                                                       │
│       user_id: "uuid",                                                      │
│       tenant_id: "uuid",                                                    │
│       role: "admin|staff|viewer",                                           │
│       exp: <24 hours>                                                       │
│     }                                                                       │
│                                                                             │
│  4. TOKEN STORAGE                                                           │
│     Client stores token in localStorage                                     │
│                                                                             │
│  5. AUTHENTICATED REQUESTS                                                  │
│     Authorization: Bearer <token>                                           │
│                                                                             │
│  6. MIDDLEWARE VALIDATION                                                   │
│     • Verify JWT signature                                                  │
│     • Check expiration                                                      │
│     • Extract tenant_id for data scoping                                    │
│     • Verify role permissions                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Role-Based Access Control

| Role            | Back Office | Herds     | Restaurant | KDS  | POS     | Ecommerce Admin |
|-----------------|-------------|-----------|------------|------|---------|-----------------|
| **super_admin** | Full        | Full      | Full       | Full | Full    | Full            |
| **admin**       | Full        | Full      | Full       | Full | Full    | Full            |
| **manager**     | Most        | Full      | Full       | Full | Full    | Edit            |
| **staff**       | Limited     | Assigned  | Assigned   | View | Operate | None            |
| **viewer**      | Read-only   | Read-only | None       | None | None    | None            |

### Data Protection

- **Encryption at Rest**: PostgreSQL with encrypted storage
- **Encryption in Transit**: TLS 1.3 for all connections
- **PCI Compliance**: Payment data handled exclusively by Stripe
- **CORS Policy**: Strict origin validation
- **Rate Limiting**: API throttling to prevent abuse

---

## API Design

### RESTful Conventions

```
Base URL: https://backend.busmgr.com/api/v1

Authentication: Bearer token in Authorization header

Standard Response Format:
{
  "status": "success" | "error",
  "data": { ... } | null,
  "message": "..." (for errors),
  "pagination": { ... } (for lists)
}
```

### Route Organization

| Route Prefix     | Domain                             |
|------------------|------------------------------------|
| `/auth`          | Authentication and user management |
| `/tenants`       | Tenant configuration               |
| `/accounts`      | Chart of accounts                  |
| `/journal`       | Journal entries                    |
| `/products`      | Inventory management               |
| `/orders`        | Order management                   |
| `/customers`     | Customer management                |
| `/animals`       | Livestock (Herds & Flocks)         |
| `/restaurant`    | Menu and ticket management         |
| `/site-builder`  | CMS blocks and templates           |
| `/site-designer` | Page management                    |
| `/subscriptions` | Billing and plans                  |
| `/data-import`   | CSV import endpoints               |

### Pagination Pattern

```json
GET /api/v1/products?page=1&limit=20

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

| Technology   | Purpose             |
|--------------|---------------------|
| React 18     | UI framework        |
| React Router | Client-side routing |
| CSS Modules  | Component styling   |
| Recharts     | Data visualization  |
| Lucide React | Icon library        |

### Backend

| Technology         | Purpose               |
|--------------------|-----------------------|
| Node.js 18+        | Runtime environment   |
| Express.js         | Web framework         |
| PostgreSQL 15      | Primary database      |
| node-postgres (pg) | Database driver       |
| JWT                | Authentication tokens |
| bcrypt             | Password hashing      |
| Winston            | Logging               |
| Multer             | File uploads          |

### External Services

| Service    | Purpose                               |
|------------|---------------------------------------|
| Stripe     | Payment processing, Connect, Terminal |
| Plaid      | Bank account linking                  |
| Cloudflare | DNS, CDN, R2 storage                  |
| Vercel     | Frontend hosting                      |
| Railway    | Backend and database hosting          |

### Development Tools

| Tool    | Purpose                 |
|---------|-------------------------|
| Git     | Version control         |
| npm     | Package management      |
| pgAdmin | Database administration |
| Postman | API testing             |
| Draw.io | Architecture diagrams   |

---

*Document maintained by the Hood Family Farms development team.*
