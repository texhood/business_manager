# Hood Family Farms Platform Vision

## Overview

The Hood Family Farms Platform is a comprehensive business management and digital presence solution designed for regenerative farms and farm-to-fork food businesses. Initially built to serve Hood Family Farms, the platform is architected to evolve into a multi-tenant SaaS product serving similar businesses nationwide.

---

## Platform Components

### The Five Applications

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         HOOD FAMILY FARMS PLATFORM                           │
│                        (Future: Multi-Tenant SaaS)                           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                            SHARED BACKEND API                                │
│                     (Authentication, Data, Business Logic)                   │
│                                                                              │
├────────────┬────────────┬────────────┬────────────┬──────────────────────────┤
│            │            │            │            │                          │
│    (1)     │    (2)     │    (3)     │    (4)     │         (5)              │
│            │            │            │            │                          │
│   BACK     │   E-COM    │  MARKET    │ RESTAURANT │      KITCHEN             │
│  OFFICE    │  WEBSITE   │    POS     │    POS     │      DISPLAY             │
│            │            │            │            │                          │
│ Accounting │  Browse    │ Tap/Swipe  │ Menu-based │  Order Queue             │
│ Inventory  │  Cart      │ Quick Sale │ Table/Guest│  Prep Status             │
│ Orders     │  Checkout  │ Inventory  │ Modifiers  │  Fulfillment             │
│ Customers  │  Account   │ Receipts   │ Split/Tabs │  Ready Alert             │
│ Reports    │  Blog      │ End of Day │ Tips       │                          │
│ CMS        │            │            │ Send to KDS│                          │
│            │            │            │            │                          │
│  Desktop   │ Web/Mobile │  Tablet    │  Tablet    │   Tablet/Screen          │
│            │            │  + Reader  │            │                          │
│            │            │            │            │                          │
└────────────┴────────────┴────────────┴────────────┴──────────────────────────┘
```

### Application Descriptions

#### 1. Back Office (Admin Hub)
The central management console for all business operations.

**Folder:** `site_back_office`

**Features:**
- Accounting & Bookkeeping (QuickBooks-style workflow)
- Inventory Management
- Order Management
- Customer Database
- Bank Feed Integration (Plaid)
- Financial Reports
- **Site Administration (CMS)**
  - Media Library
  - Page Builder
  - Blog Management
  - Menu Management
  - Event Management
  - Site Settings

**Target Users:** Business owners, office staff, accountants

#### 2. E-Commerce Website
Customer-facing website with integrated shopping.

**Folder:** `site_website_ecommerce`

**Features:**
- Product catalog (database-driven)
- Shopping cart
- Stripe payment processing
- Customer accounts
- Blog
- Dynamic pages (CMS-managed)
- Food trailer events & menus

**Target Users:** Customers, general public

#### 3. Market POS (Point of Sale Terminal)
For farmers markets and direct sales with Stripe Terminal integration.

**Folder:** `site_point_of_sale_terminal`

**Features:**
- Quick product lookup
- Tap/swipe card payments
- Cash handling
- Inventory deduction
- Receipt printing/texting
- End-of-day reconciliation
- Offline capability

**Target Users:** Farmers market staff

#### 4. Restaurant POS
Menu-based ordering system for food trailer events.

**Folder:** `site_restaurant_pos`

**Features:**
- Event menu selection
- Visual menu interface
- Order customization & modifiers
- Table/guest tracking
- Tab management
- Tip handling
- Send to kitchen display
- Payment processing

**Target Users:** Food trailer staff

#### 5. Kitchen Display System (KDS)
Real-time order management for food preparation.

**Folder:** `site_kitchen_display_system`

**Features:**
- Live order queue
- Prep status tracking
- Order prioritization
- Ready alerts
- Order completion
- Performance metrics

**Target Users:** Kitchen/prep staff

---

## Technical Architecture

### Infrastructure

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Vercel (Frontend)        Railway (Backend + DB)               │
│   ┌─────────────────┐      ┌─────────────────────┐              │
│   │ React Apps      │ ←──→ │ Node.js API         │              │
│   │ - Back Office   │      │ PostgreSQL          │              │
│   │ - E-Commerce    │      │ Redis (sessions)    │              │
│   │ - POS Apps      │      └──────────┬──────────┘              │
│   │ - KDS           │                 │                         │
│   └─────────────────┘                 ↓                         │
│                            ┌─────────────────────┐              │
│                            │ Cloudflare R2       │              │
│                            │ (Media Storage)     │              │
│                            └──────────┬──────────┘              │
│                                       ↓                         │
│                            ┌─────────────────────┐              │
│                            │ Cloudflare CDN      │              │
│                            │ (Global Edge Cache) │              │
│                            └─────────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
business_manager/
│
├── backend/                            # Unified Multi-Tenant API
│   └── src/
│       ├── middleware/
│       │   ├── auth.js                 # Authentication
│       │   └── tenant.js               # Tenant resolution & isolation
│       └── routes/
│           ├── platform/               # Platform-level (super admin)
│           ├── admin/                  # Tenant admin routes
│           └── public/                 # Public API routes
│
├── site_back_office/                   # (1) Admin Dashboard
│
├── site_website_ecommerce/             # (2) Customer Website
│
├── site_point_of_sale_terminal/        # (3) Market POS
│
├── site_restaurant_pos/                # (4) Food Trailer POS
│
├── site_kitchen_display_system/        # (5) KDS
│
├── packages/                           # Shared code (monorepo) - future
│   ├── ui/                             # Shared React components
│   ├── api-client/                     # Typed API client
│   └── utils/                          # Shared utilities
│
├── scripts/                            # Utility scripts
│
└── infrastructure/                     # Future
    ├── terraform/                      # Infrastructure as code
    └── docker/                         # Container configs
```

---

## Multi-Tenant Architecture

### Data Isolation

Every data table includes a `tenant_id` for complete data isolation:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MULTI-TENANT DATA MODEL                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         PLATFORM LEVEL                              │   │
│   │   • Tenant management (subscriptions, billing)                      │   │
│   │   • Platform admins                                                 │   │
│   │   • Shared resources (component library, templates)                 │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│          ┌─────────────────────────┼─────────────────────────┐              │
│          ▼                         ▼                         ▼              │
│   ┌─────────────┐          ┌─────────────┐          ┌─────────────┐         │
│   │  TENANT A   │          │  TENANT B   │          │  TENANT C   │         │
│   │ Hood Family │          │ Smith Farms │          │ Jones Ranch │         │
│   │   Farms     │          │             │          │             │         │
│   ├─────────────┤          ├─────────────┤          ├─────────────┤         │
│   │ • Products  │          │ • Products  │          │ • Products  │         │
│   │ • Orders    │          │ • Orders    │          │ • Orders    │         │
│   │ • Customers │          │ • Customers │          │ • Customers │         │
│   │ • Menus     │          │ • Menus     │          │ • Menus     │         │
│   │ • Events    │          │ • Events    │          │ • Events    │         │
│   │ • Media     │          │ • Media     │          │ • Media     │         │
│   │ • Pages     │          │ • Pages     │          │ • Pages     │         │
│   │ • Settings  │          │ • Settings  │          │ • Settings  │         │
│   │ • Staff     │          │ • Staff     │          │ • Staff     │         │
│   └─────────────┘          └─────────────┘          └─────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Security Features

- **Row-Level Security (RLS):** PostgreSQL enforces tenant isolation at the database level
- **Tenant Context:** Every API request is scoped to the authenticated tenant
- **Role-Based Access:** Admin, staff, and customer roles with granular permissions

---

## Content Management System (CMS)

### Design Principles

1. **Dynamic content, static styling** - Content editors change what's displayed, not how it looks
2. **WYSIWYG editing** - Non-technical users can edit content visually
3. **Full page builder** - Flexible layouts using predefined components
4. **Immediate publishing** - Changes go live when saved
5. **Version history** - Ability to revert/rollback changes
6. **Centralized in Back Office** - All site management in one place

### Content Types

| Type | Description |
|------|-------------|
| **Media** | Images, files with CDN delivery |
| **Pages** | Editable page content via page builder |
| **Blog Posts** | Articles with rich text |
| **Menus** | Food trailer menus with sections & items |
| **Events** | Food trailer schedule & locations |
| **Settings** | Site-wide configuration |

### Media Storage

- **Object Storage:** Cloudflare R2 (S3-compatible)
- **CDN:** Cloudflare (automatic, global edge caching)
- **Zero egress fees:** Cost-effective for image-heavy sites
- **Metadata in PostgreSQL:** Searchable, taggable, organized

---

## Development Roadmap

### Phase 1: Foundation ✓ (Current)
- [x] Backend API basics
- [x] Authentication system
- [x] Items/Products management
- [x] E-commerce website structure
- [x] Stripe payment integration
- [x] Blog system (API)
- [x] Menu system (API)
- [x] Events system (API)
- [ ] Complete CMS (media, pages)
- [ ] Back office site admin integration

### Phase 2: POS Systems
- [ ] Stripe Terminal integration research
- [ ] Market POS application (`site_point_of_sale_terminal`)
- [ ] Restaurant POS application (`site_restaurant_pos`)
- [ ] Kitchen Display System (`site_kitchen_display_system`)
- [ ] Real-time order sync (WebSockets)
- [ ] Offline capability

### Phase 3: Multi-Tenancy
- [x] Add tenant_id to all tables
- [ ] Tenant middleware & isolation
- [ ] Row-level security policies
- [ ] Onboarding flow
- [ ] Per-tenant subdomains/domains

### Phase 4: SaaS Platform
- [ ] Subscription billing (Stripe Billing)
- [ ] Usage metering
- [ ] Plan tiers & feature flags
- [ ] Platform admin dashboard
- [ ] White-labeling options
- [ ] API rate limiting
- [ ] Documentation & support portal

---

## Target Market

### Primary: Regenerative Farms
- Pasture-raised livestock operations
- Direct-to-consumer sales model
- Farmers market presence
- Farm store or on-farm sales

### Secondary: Farm-to-Fork Food Businesses
- Food trucks/trailers
- Farm-to-table restaurants
- CSA (Community Supported Agriculture)
- Specialty food producers

### Value Proposition
1. **Purpose-built:** Designed specifically for farm businesses, not generic retail
2. **Integrated:** One platform for website, POS, inventory, and accounting
3. **Affordable:** Priced for small farm economics
4. **Mission-aligned:** Built by farmers, for farmers

---

## Success Metrics

### Phase 1 (Hood Family Farms)
- Fully operational e-commerce website
- All content manageable through back office
- Successful food trailer events using POS
- Reduced manual bookkeeping time

### Phase 2+ (SaaS)
- Number of active tenants
- Monthly recurring revenue (MRR)
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- Net promoter score (NPS)

---

## Document History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-01-12 | 1.0 | Robin Hood | Initial vision document |
| 2026-01-12 | 1.1 | Robin Hood | Updated folder naming convention |

---

*"Strengthening local food systems, one farm at a time."*
