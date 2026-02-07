# Business Manager Platform Vision

## Overview

Business Manager is a comprehensive multi-tenant SaaS platform designed for regenerative farms and farm-to-fork food businesses. Originally built to serve Hood Family Farms, the platform is now a fully operational multi-tenant system serving agricultural businesses with integrated e-commerce, point-of-sale, livestock management, accounting, and food service operations.

**Platform Domain:** `busmgr.com`  
**Version:** Production (Live)  
**Last Updated:** February 2026

---

## Platform Architecture

### The Eight Tenant Applications

Every tenant accesses their applications via subdomain URLs at `{slug}.busmgr.com`. Access is gated by subscription tier through the App Registry system.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         BUSINESS MANAGER PLATFORM                            │
│                         Multi-Tenant SaaS (Live)                             │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                          SHARED BACKEND API                                  │
│              (Node.js/Express · PostgreSQL · Railway)                         │
│           Authentication · Tenant Isolation · Business Logic                 │
│                                                                              │
├────────────┬────────────┬────────────┬────────────┬──────────────────────────┤
│            │            │            │            │                          │
│   TENANT   │   BACK     │    POS     │ RESTAURANT │      KITCHEN             │
│   PORTAL   │  OFFICE    │  TERMINAL  │    POS     │      DISPLAY             │
│            │            │            │            │                          │
│ SSO App    │ Accounting │ Tap/Swipe  │ Menu-based │  Order Queue             │
│ Launcher   │ Inventory  │ Quick Sale │ Modifiers  │  Prep Status             │
│ Tier Gate  │ Site Mgmt  │ Layouts    │ Tabs/Tips  │  Fulfillment             │
│ Branding   │ Reports    │ Receipts   │ Send→KDS   │  Bump/Done               │
│            │ Blog/CMS   │ End of Day │ End of Day │                          │
│            │            │            │            │                          │
│  Tier: All │  Tier: 1   │  Tier: 1   │  Tier: 2   │   Tier: 2               │
│            │            │            │            │                          │
├────────────┼────────────┼────────────┼────────────┤                          │
│            │            │            │                                        │
│   HERDS &  │  ONLINE    │    SITE    │                                        │
│   FLOCKS   │   STORE    │  BUILDER   │                                        │
│            │            │            │                                        │
│ Livestock  │ Product    │ Page       │                                        │
│ Pastures   │ Catalog    │ Templates  │                                        │
│ Health     │ Cart       │ Blocks     │                                        │
│ Sales      │ Checkout   │ CMS        │                                        │
│ Rainfall   │ Blog       │ Publishing │                                        │
│            │            │            │                                        │
│  Tier: 2   │  Tier: 2   │  Tier: 3   │                                        │
│            │            │            │                                        │
└────────────┴────────────┴────────────┴───────────────────────────────────────┘
```

### Platform Administration Applications

Two additional applications serve platform operations (not tenant-facing):

| Application | URL | Purpose |
|-------------|-----|---------|
| **Onboarding Portal** | `onboarding.busmgr.com` | Super Admin tenant management, 7-step wizard, system settings |
| **Backend API** | `api.busmgr.com` | Unified multi-tenant REST API |

---

## Application Details

### Tenant Portal — SSO App Launcher
**Folder:** `site_portal` · **URL:** `{slug}.busmgr.com` · **Tier:** All  
Central entry point for all staff. Branded app launcher with SSO authentication, tier-gated app cards organized by category, and access tracking.

### Back Office — Central Management Hub
**Folder:** `site_back_office` · **URL:** `{slug}.office.busmgr.com` · **Tier:** Starter (1)  
Comprehensive business management console with collapsible sidebar navigation:
- **Food Trailer:** Menus, menu items, modifications, events, POS sales review
- **Inventory:** Products (with images, variants, stock tracking), hierarchical categories
- **Accounting:** Bookkeeping, bank feed (Plaid), bank connections, journal entries, chart of accounts, fixed assets
- **Site Management:** Site settings, branding assets, site builder, media library, blog posts, social media
- **System:** Stripe Connect setup, CSV data import
- **Standalone:** User/account management, delivery zones, financial reports (P&L, balance sheet, cash flow), report builder
- **Role-based access:** Accountant role sees only financial views

### POS Terminal — Quick In-Person Sales
**Folder:** `site_point_of_sale_terminal` · **URL:** `{slug}.pos.busmgr.com` · **Tier:** Starter (1)  
Touch-friendly product grid for farmers markets and farm stands. Stripe Terminal card reader integration, cash handling with change calculation, customizable grid layouts, and end-of-day sales review.

### Restaurant POS — Food Service Operations
**Folder:** `site_restaurant_pos` · **URL:** `{slug}.rpos.busmgr.com` · **Tier:** Professional (2)  
Full-service food ordering with multi-menu support, item modifications (required/optional groups), open orders sidebar, checkout with tips and discounts, Stripe Terminal payments, and kitchen display integration.

### Kitchen Display System (KDS)
**Folder:** `site_kitchen_display_system` · **URL:** `{slug}.kitchen.busmgr.com` · **Tier:** Professional (2)  
Real-time order display for kitchen staff. Order cards with timers and urgency escalation, bump-to-complete workflow, done orders panel, and multi-device support for high-volume operations.

### Herds & Flocks — Livestock & Land Management
**Folder:** `site_herds_and_flocks` · **URL:** `{slug}.herds.busmgr.com` · **Tier:** Professional (2)  
Dedicated livestock management application with its own sidebar navigation:
- **Livestock:** Herds/flocks, individual animals, health records, weight tracking, processing records
- **Land Management:** Pastures, grazing events, soil samples, tasks, treatments
- **Sales:** Sale tickets, buyer management
- **Settings:** Breeds, animal categories, owners, fee types
- **Rainfall tracking**

### Online Store — Customer-Facing Ecommerce
**Folder:** `site_website_ecommerce` · **URL:** `{slug}.app.busmgr.com` · **Tier:** Professional (2)  
Public website with product catalog, shopping cart, Stripe checkout, food trailer info, blog, gallery, contact form, FAQ, and dynamic pages built with Site Builder. Fully responsive with tenant branding.

### Site Builder — Visual Page Design
**Access:** Back Office → Site Management → Site Builder · **Tier:** Enterprise (3)  
No-code page builder with templates (Standard, Landing, About, Contact, Minimal), zones, and 16 block types: hero banner, text, image, two-column, feature cards, image gallery, video, testimonial, product grid, contact info, contact form, FAQ accordion, call to action, spacer, newsletter signup, and custom HTML.

### Onboarding Portal — Platform Administration
**Folder:** `site_onboarding` · **URL:** `onboarding.busmgr.com` · **Role:** `super_admin`  
Platform-level administration: dashboard with system health metrics, tenant list with search/filter, 7-step onboarding wizard (tenant info → admin user → subscription → business config → chart of accounts → integrations → sample data), tenant detail with tabs (overview, users, settings, integrations), and global system settings.

---

## Technical Architecture

### Infrastructure

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Vercel (Frontend)          Railway (Backend + DB)             │
│   ┌──────────────────┐       ┌──────────────────────┐           │
│   │ 8 React Apps     │ ←──→  │ Node.js/Express API  │           │
│   │ + Onboarding     │       │ PostgreSQL Database   │           │
│   │                  │       └──────────┬───────────┘           │
│   │ DNS: busmgr.com  │                  │                       │
│   │ (Squarespace NS) │                  ↓                       │
│   └──────────────────┘       ┌──────────────────────┐           │
│                              │ Cloudflare R2        │           │
│                              │ (Media Storage)      │           │
│                              │ + CDN Edge Cache     │           │
│                              └──────────────────────┘           │
│                                                                 │
│   External Services:                                            │
│   ├── Stripe Connect  (Multi-tenant payments & payouts)         │
│   ├── Stripe Terminal (In-person card readers)                  │
│   └── Plaid           (Bank transaction sync)                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
business_manager/
│
├── backend/                            # Unified Multi-Tenant API (Railway)
│   └── src/
│       ├── middleware/
│       │   ├── auth.js                 # JWT + SSO cookie authentication
│       │   └── tenant.js               # Tenant resolution & data isolation
│       ├── routes/                     # 40+ route files (camelCase naming)
│       │   ├── admin.js                # Super admin / platform routes
│       │   ├── auth.js                 # Authentication (login, SSO, sessions)
│       │   ├── portal.js               # Tenant Portal launcher API
│       │   ├── subscriptions.js        # Stripe billing & plan management
│       │   ├── tenants.js              # Tenant management & branding
│       │   ├── items.js                # Products / inventory
│       │   ├── herdsFlocks.js          # Livestock management
│       │   ├── siteBuilder.js          # Page builder API
│       │   ├── restaurantPos.js        # Restaurant order management
│       │   ├── kds.js                  # Kitchen display API
│       │   ├── payments.js             # Stripe payment processing
│       │   ├── plaid.js                # Bank feed integration
│       │   └── ...                     # And many more
│       └── migrations/                 # PostgreSQL schema migrations
│
├── site_back_office/                   # Back Office (Vercel)
├── site_website_ecommerce/             # Online Store (Vercel)
├── site_point_of_sale_terminal/        # POS Terminal (Vercel)
├── site_restaurant_pos/                # Restaurant POS (Vercel)
├── site_kitchen_display_system/        # Kitchen Display (Vercel)
├── site_herds_and_flocks/              # Herds & Flocks (Vercel)
├── site_portal/                        # Tenant Portal (Vercel)
├── site_onboarding/                    # Onboarding Portal (Vercel)
│
├── docs/                               # Documentation
│   ├── ARCHITECTURE.md
│   ├── VISION.md                       # This file
│   ├── USER_GUIDE_TENANT_ADMIN.md
│   ├── USER_GUIDE_SUPER_ADMIN.md
│   ├── USER_GUIDE_ONBOARDING_JOURNEY.md
│   ├── PLAID_INTEGRATION.md
│   └── modules/                        # Per-app user guides
│
└── scripts/                            # Utility scripts
```

### Authentication Architecture

The platform uses a layered authentication system:

- **SSO Cookie:** Shared across all `*.busmgr.com` subdomains, set on successful login from any app
- **JWT Bearer Token:** Standard header-based auth for API calls
- **Query Parameter Fallback:** Token passed via `?token=` for cross-app redirects
- **Priority Chain:** Bearer token → query parameter → SSO cookie
- **Tenant Resolution:** Subdomain slug → tenant ID lookup → scoped data access
- **Role Enforcement:** `super_admin`, `tenant_admin`, `admin`, `staff`, `accountant`

---

## Multi-Tenant Architecture

### Subscription & App Registry

The platform uses a tier-based system to control application access:

| Plan | Monthly | Annual | Tier | Apps Included |
|------|---------|--------|------|---------------|
| **Starter** | $29 | $290/yr | 1 | Portal, Back Office, POS Terminal |
| **Professional** | $79 | $790/yr | 2 | + Restaurant POS, Kitchen Display, Herds & Flocks, Online Store |
| **Enterprise** | $149 | $1,490/yr | 3 | + Site Builder (all apps) |

Each app in the `app_registry` table has a `min_plan_tier`. The Tenant Portal dynamically renders app cards based on the tenant's subscription tier. The `tenant_app_access` table supports per-tenant overrides.

### Data Isolation

Every data table includes `tenant_id` (UUID FK) for complete data isolation:

```
┌──────────────────────────────────────────────────────────┐
│                    PLATFORM LEVEL                         │
│  tenants · subscription_plans · app_registry              │
│  platform_settings · super_admin accounts                 │
├──────────────────────────────────────────────────────────┤
│          ┌──────────────┐  ┌──────────────┐               │
│          │  TENANT A    │  │  TENANT B    │               │
│          │  (Hood Farm) │  │  (Smith Farm)│               │
│          ├──────────────┤  ├──────────────┤               │
│          │ • accounts   │  │ • accounts   │               │
│          │ • items      │  │ • items      │               │
│          │ • orders     │  │ • orders     │               │
│          │ • menus      │  │ • menus      │               │
│          │ • animals    │  │ • animals    │               │
│          │ • pages      │  │ • pages      │               │
│          │ • media      │  │ • media      │               │
│          │ • blog_posts │  │ • blog_posts │               │
│          │ • ...        │  │ • ...        │               │
│          └──────────────┘  └──────────────┘               │
└──────────────────────────────────────────────────────────┘
```

### Security

- **Tenant Middleware:** Every API request is scoped by `tenant_id` extracted from the authenticated session
- **Defense-in-Depth:** `tenant_id` filtering applied at middleware, route, and query levels
- **Role-Based Access:** Granular permissions per role (accountant sees only financial views)
- **SSO Boundary:** Cookies scoped to `busmgr.com` domain; tenants cannot access each other's apps

---

## Content Management System

All website content is managed from the Back Office and rendered on the ecommerce site.

### Content Types

| Type | Management Location | Rendering |
|------|-------------------|-----------|
| **Pages** | Site Builder (templates, zones, blocks) | Dynamic page renderer |
| **Blog Posts** | Blog Management (rich text editor) | `/blog` and `/blog/:slug` |
| **Products** | Inventory → Products | `/shop` and `/shop/:slug` |
| **Menus** | Food Trailer → Menus/Items | `/menu` and `/food-trailer` |
| **Events** | Food Trailer → Events | `/food-trailer` |
| **Media** | Media Library (drag-drop upload) | CDN-delivered images |
| **Settings** | Site Settings + Branding Assets | Header, footer, SEO, colors |

### Media Storage

- **Object Storage:** Cloudflare R2 (S3-compatible, zero egress fees)
- **CDN:** Cloudflare global edge cache
- **Metadata:** Stored in PostgreSQL (searchable, taggable)

---

## Target Market

### Primary: Regenerative Farms
- Pasture-raised livestock operations
- Direct-to-consumer sales model
- Farmers market and farm stand presence
- On-farm retail

### Secondary: Farm-to-Fork Food Businesses
- Food trucks and trailers
- Farm-to-table restaurants
- CSA (Community Supported Agriculture)
- Specialty food producers

### Value Proposition
1. **Purpose-built:** Designed for farm businesses, not generic retail
2. **Integrated:** One platform for website, POS, inventory, livestock, and accounting
3. **Affordable:** Priced for small farm economics ($29-$149/month)
4. **Multi-channel:** Online store + in-person POS + food service, all connected
5. **Complete lifecycle:** Track animals from birth through sale, products from farm to customer

---

## Development Status

### Completed ✓

- [x] Multi-tenant backend API with full tenant isolation
- [x] JWT + SSO authentication across all applications
- [x] Subscription billing with Stripe (trial, monthly, annual)
- [x] Tier-based App Registry with Tenant Portal launcher
- [x] 7-step onboarding wizard with super admin portal
- [x] Back Office with full sidebar navigation and role-based access
- [x] Accounting system (COA, bookkeeping, journal entries, bank feed, fixed assets, reports)
- [x] Plaid bank connection integration
- [x] Inventory and product management with images and variants
- [x] Food trailer menus, items, modifications, and events
- [x] Stripe Connect for multi-tenant payment processing
- [x] POS Terminal with Stripe Terminal hardware reader support
- [x] Restaurant POS with modifiers, tips, orders sidebar
- [x] Kitchen Display System with bump/complete workflow
- [x] Herds & Flocks livestock management (animals, health, weights, processing, sales)
- [x] Land management (pastures, grazing, soil, tasks, treatments, rainfall)
- [x] Ecommerce website with full page set (shop, cart, checkout, blog, gallery, etc.)
- [x] Site Builder with 5 templates and 16 block types
- [x] Media library with Cloudflare R2 storage
- [x] Blog management with preview
- [x] Branding assets and dynamic tenant color theming
- [x] Delivery zones for ecommerce
- [x] Report builder for custom reports
- [x] Data import (CSV) for products, livestock, accounts, transactions
- [x] Production deployment (Vercel + Railway + Cloudflare)
- [x] DNS and subdomain routing via busmgr.com

### Known Gaps

- [ ] Newsletter signup block: defined in Site Builder UI but no renderer in ecommerce site
- [ ] Testimonials Carousel: block type exists in admin but maps to single Testimonial renderer
- [ ] BusinessSettingsView: component exists in Back Office but not wired into navigation
- [ ] Offline capability for POS applications
- [ ] Real-time WebSocket order sync (currently polling-based)
- [ ] Customer accounts and order history on ecommerce site
- [ ] Email notifications (order confirmation, password reset)
- [ ] Usage metering and plan limit enforcement

### Future Roadmap

- [ ] Self-service tenant registration (public signup flow)
- [ ] White-labeling options (custom domains per tenant)
- [ ] Mobile-native POS apps
- [ ] Advanced analytics dashboard
- [ ] API rate limiting and usage tracking
- [ ] Multi-language support
- [ ] Webhook notifications for third-party integrations

---

## Success Metrics

### Current (Production)
- First tenant (Hood Family Farms) fully operational
- All 8 tenant apps + 2 admin apps deployed and accessible
- End-to-end flow working: onboarding → configuration → daily operations

### Growth Targets
- Number of active tenants
- Monthly recurring revenue (MRR)
- Customer acquisition cost (CAC)
- Tenant lifetime value (LTV)
- Net Promoter Score (NPS)
- Feature adoption rates per app

---

## Document History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-01-12 | 1.0 | Robin Hood | Initial vision document |
| 2026-01-12 | 1.1 | Robin Hood | Updated folder naming convention |
| 2026-02-07 | 2.0 | Robin Hood | Complete rewrite reflecting production platform state: 8 tenant apps, busmgr.com domain, subscription tiers, app registry, updated architecture and roadmap |

---

*"Strengthening local food systems, one farm at a time."*
