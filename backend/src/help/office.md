# Back Office — User Guide

**Application:** Back Office (Central Management Hub)  
**URL Pattern:** `{slug}.office.busmgr.com`  
**Required Tier:** Starter and above  
**Version:** 1.0  
**Last Updated:** February 2026

---

## Overview

The Back Office is the central management application for your business. It handles accounting, inventory, food trailer configuration, site management, Stripe Connect setup, data import, user management, delivery zones, and reporting.

**URL:** `{slug}.office.busmgr.com` (e.g., `hood-family-farms.office.busmgr.com`)

---

## Login & Authentication

1. Navigate to `{slug}.office.busmgr.com` or launch from the Tenant Portal
2. Enter your email and password
3. The dashboard loads with your tenant branding applied (sidebar color, business name, logo)

SSO is shared across all `busmgr.com` applications — logging in here authenticates you everywhere.

### Tenant Branding

The Back Office dynamically applies your tenant's brand color (set during onboarding) to:

- Sidebar background and accent colors
- Primary buttons and interactive elements
- Document title (shows your business name)

---

## Sidebar Navigation

The sidebar organizes all features into collapsible sections. Click a section header to expand/collapse it.

| Section | Contains | Purpose |
|---------|----------|---------|
| **Dashboard** | — | At-a-glance business metrics |
| **Food Trailer** | Menus, Menu Items, Modifications, Events, POS Sales | Configure food service data shared with Restaurant POS and ecommerce |
| **Inventory** | Products, Categories | Manage product catalog and stock |
| **Accounting** | Bookkeeping, Bank Feed, Bank Connections, Journal Entries, Chart of Accounts, Fixed Assets | Full financial management |
| **Site Management** | Site Settings, Branding Assets, Site Builder, Media Library, Blog Posts, Social Media | Website content and design |
| **System** | Stripe Connect, Data Import | Platform integrations and data migration |
| **Users / Accounts** | — | Staff user management |
| **Delivery Zones** | — | Geographic delivery area configuration |
| **Financial Reports** | — | P&L, Balance Sheet, Cash Flow, Sales reports |
| **Report Builder** | — | Custom report creation |

### Role-Based Access

The **accountant** role sees only financial views: Dashboard, Bookkeeping, Bank Feed, Bank Connections, Journal Entries, Chart of Accounts, Fixed Assets, POS Sales, Reports, and Report Builder. All other views are hidden.

---

## Key Features by Section

### Dashboard

- Today's sales summary
- Week-over-week trends
- Top selling products
- Low stock alerts
- Pending order count

### Food Trailer

| View | Purpose |
|------|---------|
| **Menus** | Create and manage named menus (Breakfast, Lunch, Catering) with availability schedules |
| **Menu Items** | Add food items with name, price, description, image, prep time, and menu assignment |
| **Modifications** | Create modifier groups (required/optional) with options and pricing |
| **Events** | Track upcoming markets, events, and catering gigs with dates and menus |
| **POS Sales** | Review sales transaction data from POS Terminal and Restaurant POS |

### Inventory

| View | Purpose |
|------|---------|
| **Products** | Full product management: name, SKU, description, price, cost, images, variants, stock tracking |
| **Categories** | Hierarchical product categories for organization and website filtering |

### Accounting

| View | Purpose |
|------|---------|
| **Bookkeeping** | Transaction list with categorization, filtering, and search |
| **Bank Feed** | Imported bank transactions for matching/categorizing/reconciling |
| **Bank Connections** | Connect bank accounts via Plaid for automatic transaction import |
| **Journal Entries** | Manual journal entries for adjustments (debit/credit lines) |
| **Chart of Accounts** | View and manage GL accounts (Asset, Liability, Equity, Revenue, Expense) |
| **Fixed Assets** | Track depreciable business assets with cost, useful life, and depreciation |

### Site Management

| View | Purpose |
|------|---------|
| **Site Settings** | Global website configuration: business info, hours, social links, SEO defaults |
| **Branding Assets** | Upload logo, favicon, social image; configure brand color palette |
| **Site Builder** | Visual page builder with templates, zones, and content blocks |
| **Media Library** | Upload, organize, and manage images and files |
| **Blog Posts** | Create, edit, preview, and publish blog articles |
| **Social Media** | Social media content management |

### System

| View | Purpose |
|------|---------|
| **Stripe Connect** | Set up and manage your Stripe Connected Account for payment processing |
| **Data Import** | Import data from CSV files (products, customers, accounts, transactions) |

### Standalone Items

| View | Purpose |
|------|---------|
| **Users / Accounts** | Create and manage staff user accounts with role assignments |
| **Delivery Zones** | Configure geographic delivery areas with fees for ecommerce checkout |
| **Financial Reports** | Generate P&L, Balance Sheet, Cash Flow, and Sales reports with date filtering |
| **Report Builder** | Create custom reports with flexible data sources, columns, filters, and grouping |

---

## User Info & Logout

The sidebar footer shows:

- Your user avatar (first letter of name)
- Your name and role
- **Sign Out** button — logs you out of the Back Office and clears SSO session

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Sidebar looks wrong / no branding | Brand color may not be set. Contact your administrator. |
| Can't see certain sections | Your role may be restricted (e.g., accountant). Check with admin. |
| Data not loading | Check internet connection. Try refreshing. Check browser console for errors. |
| Bank connection failing | Plaid may be experiencing issues. Try again later. Ensure correct bank credentials. |
| Stripe Connect not activating | Complete all required fields in Stripe onboarding. ID verification may take time. |
| Products not appearing on website | Ensure products are active and have a category. Check Site Builder page configuration. |

---

*See also: `USER_GUIDE_TENANT_ADMIN.md` for detailed feature walkthroughs, and individual module guides for POS, Restaurant, Kitchen, and Herds.*
