# Hood Family Farms Business Manager
# Tenant Admin User Guide

**Audience:** Business Owners and Administrators  
**Version:** 2.0  
**Last Updated:** February 2026

---

## Table of Contents

1. [Welcome to Business Manager](#welcome-to-business-manager)
2. [Getting Started](#getting-started)
3. [Tenant Portal — Your App Launcher](#tenant-portal--your-app-launcher)
4. [Back Office Overview](#back-office-overview)
5. [Setting Up Your Business](#setting-up-your-business)
6. [Accounting & Financial Management](#accounting--financial-management)
7. [Inventory & Products](#inventory--products)
8. [Food Trailer / Restaurant Setup](#food-trailer--restaurant-setup)
9. [Site Management & Ecommerce](#site-management--ecommerce)
10. [Managing Livestock (Herds & Flocks)](#managing-livestock-herds--flocks)
11. [Point of Sale Operations](#point-of-sale-operations)
12. [Kitchen Display System](#kitchen-display-system)
13. [Managing Staff & Permissions](#managing-staff--permissions)
14. [Reports & Analytics](#reports--analytics)
15. [Day-to-Day Operations](#day-to-day-operations)
16. [Getting Help](#getting-help)

---

## Welcome to Business Manager

Congratulations on joining the Business Manager platform! This guide will help you configure your account and start using all the tools available to run your business efficiently.

### What You Can Do

With Business Manager, you can:

- **Manage Your Finances** — Chart of accounts, bank feed reconciliation, journal entries, and financial reports
- **Sell Online** — Customer-facing ecommerce website with shop, blog, events, and food trailer menus
- **Process Payments** — Accept credit cards via Stripe (in-person and online), plus cash
- **Track Inventory** — Products, categories, stock levels, and low-stock alerts
- **Manage Livestock** — Track animals from birth to sale with health records, weight tracking, and pasture management
- **Run Food Service** — Full restaurant POS with kitchen display integration, modifiers, and tips
- **Build Your Brand** — Site Builder, branding assets, blog posts, social media management
- **Understand Your Business** — Financial reports, report builder, and dashboard analytics

### Your Applications

Based on your subscription tier, you have access to these applications. All are accessed via the **Tenant Portal** at `{your-slug}.busmgr.com`:

| Application | URL | Min. Tier | Purpose |
|-------------|-----|-----------|---------|
| **Tenant Portal** | `{slug}.busmgr.com` | All | SSO app launcher — your starting point |
| **Back Office** | `{slug}.office.busmgr.com` | Starter | Central management hub |
| **POS Terminal** | `{slug}.pos.busmgr.com` | Starter | In-person quick sales |
| **Restaurant POS** | `{slug}.rpos.busmgr.com` | Professional | Food service ordering with tabs and tips |
| **Kitchen Display** | `{slug}.kitchen.busmgr.com` | Professional | Kitchen order queue and fulfillment |
| **Herds & Flocks** | `{slug}.herds.busmgr.com` | Professional | Livestock and pasture management |
| **Online Store** | `{slug}.app.busmgr.com` | Professional | Customer-facing ecommerce website |
| **Site Builder** | `{slug}.office.busmgr.com/site-builder` | Enterprise | Page design and content management |

> **Note:** Replace `{slug}` with your business slug (e.g., `hood-family-farms`). Your slug was assigned during onboarding and appears in all your URLs.

---

## Getting Started

### First Login

1. Navigate to your Tenant Portal: `{slug}.busmgr.com`
2. Enter the email and password provided by your administrator
3. You'll see the app launcher dashboard showing all applications available at your subscription tier
4. Click **Back Office** to begin configuring your business

Alternatively, go directly to `{slug}.office.busmgr.com` to log into the Back Office.

### SSO (Single Sign-On)

Once you log into any application, you're automatically authenticated across all your apps. The platform uses a shared SSO cookie across the `busmgr.com` domain, so you don't need to log in separately to each application.

### Recommended Setup Order

```
Week 1: Foundation
├── 1. Set up Stripe Connect (System → Stripe Connect)
├── 2. Review Chart of Accounts (Accounting → Chart of Accounts)
├── 3. Connect Bank Accounts (Accounting → Bank Connections)
└── 4. Configure Business Settings (via admin or support)

Week 2: Products & Content
├── 5. Create Product Categories (Inventory → Categories)
├── 6. Add Products with images & prices (Inventory → Products)
├── 7. Configure Site Settings (Site Management → Site Settings)
├── 8. Build Website Pages (Site Management → Site Builder)
└── 9. Set Up Delivery Zones (Delivery Zones)

Week 3: Operations
├── 10. Set Up Menus & Menu Items (Food Trailer section)
├── 11. Create Staff Accounts (Users / Accounts)
├── 12. Train Staff on POS and Portal
└── 13. Go Live!
```

---

## Tenant Portal — Your App Launcher

**URL:** `{slug}.busmgr.com`

The Tenant Portal is your central starting point. After logging in, you see a categorized grid of available applications.

### Features

- **App Cards** — Each enabled application appears as a card with name, description, and icon
- **Category Grouping** — Apps are organized into categories: Core, Sales & Commerce, Operations
- **Tier Gating** — Only apps included in your subscription plan are accessible; others show as locked
- **Launch in New Tab** — Clicking an app card opens it in a new browser tab with SSO authentication
- **Tenant Branding** — Portal displays your business name, logo, and brand color
- **Access Tracking** — App launches are recorded for usage analytics

### How It Works

1. Log in at `{slug}.busmgr.com`
2. Browse available apps by category
3. Click any app card to launch it in a new tab
4. You're automatically signed in via SSO — no separate login required

---

## Back Office Overview

**URL:** `{slug}.office.busmgr.com`

The Back Office is your central management hub. It uses a sidebar navigation with collapsible sections:

### Navigation Structure

```
🌱 {Business Name} — Back Office
│
├── Dashboard
│
├── 🚛 Food Trailer
│   ├── Menus
│   ├── Menu Items
│   ├── Modifications
│   ├── Events
│   └── POS Sales
│
├── 📦 Inventory
│   ├── Products
│   └── Categories
│
├── 💰 Accounting
│   ├── Bookkeeping (Transactions)
│   ├── Bank Feed
│   ├── Bank Connections
│   ├── Journal Entries
│   ├── Chart of Accounts
│   └── Fixed Assets
│
├── 🌐 Site Management
│   ├── Site Settings
│   ├── Branding Assets
│   ├── Site Builder
│   ├── Media Library
│   ├── Blog Posts
│   └── Social Media
│
├── ⚙️ System
│   ├── Stripe Connect
│   └── Data Import
│
├── Users / Accounts
├── Delivery Zones
├── Financial Reports
└── Report Builder
```

### Dashboard

The dashboard shows at-a-glance metrics including today's sales, inventory status, recent orders, and key trends. It adapts to your tenant's data.

### Tenant Branding

The Back Office dynamically applies your tenant's brand color to the sidebar, buttons, and accents throughout the interface. This is set during onboarding and can be updated by your administrator.

---

## Setting Up Your Business

### Stripe Connect (System → Stripe Connect)

Before you can accept card payments, you must complete Stripe Connect onboarding:

1. Navigate to **System → Stripe Connect**
2. Click **Connect with Stripe** (or **Set up Stripe Connect**)
3. You'll be redirected to Stripe's hosted onboarding flow
4. Complete the required steps:
   - Business legal name and type
   - Business address
   - Representative personal information (name, DOB, SSN/EIN)
   - Bank account details for payouts
   - Government-issued ID verification
5. Once approved, you'll be redirected back to the Back Office
6. Your status will show as **Connected** and you can accept payments

**Timeline:** Basic info is instant. Bank verification takes 1-2 business days. ID verification takes minutes to 1 day.

### Business Settings

Your business profile (name, address, tax rate, timezone) was configured during onboarding. To update it, contact your administrator or navigate to the relevant settings within the Back Office.

### Data Import (System → Data Import)

Migrate data from existing systems:

1. Navigate to **System → Data Import**
2. Select the data type to import
3. Download the CSV template
4. Fill in your data following the template format
5. Upload the completed CSV
6. Review validation results and fix any errors
7. Execute the import
8. Verify the imported data

---

## Accounting & Financial Management

### Chart of Accounts (Accounting → Chart of Accounts)

The Chart of Accounts is your financial foundation. A template was selected during onboarding (Farm Standard, Retail Standard, Restaurant, or Minimal).

**Account Types:**

| Type | Purpose | Examples |
|------|---------|----------|
| **Asset** | Things you own | Cash, Inventory, Equipment |
| **Liability** | Things you owe | Loans, Credit Cards, Sales Tax Payable |
| **Equity** | Owner's investment | Owner's Capital, Retained Earnings |
| **Revenue** | Money earned | Product Sales, Service Revenue |
| **Expense** | Money spent | Feed, Supplies, Utilities |

**Adding an Account:**
1. Go to **Accounting → Chart of Accounts**
2. Click **Add Account**
3. Enter: Account Name, Account Type, Account Number (optional), Parent Account, Description
4. Save

### Bookkeeping / Transactions (Accounting → Bookkeeping)

Record and categorize transactions:

1. Go to **Accounting → Bookkeeping**
2. View all transactions with date, description, amount, and category
3. Categorize uncategorized transactions by assigning them to GL accounts
4. Filter by date range, account, or status

### Bank Connections (Accounting → Bank Connections)

Link bank accounts via Plaid for automatic transaction import:

1. Go to **Accounting → Bank Connections**
2. Click **Connect Bank Account**
3. Search for your bank in the Plaid dialog
4. Log in with your bank credentials (handled securely by Plaid — we never see your login)
5. Select which accounts to sync
6. Transactions begin importing automatically

### Bank Feed (Accounting → Bank Feed)

After connecting bank accounts, imported transactions appear in the Bank Feed:

1. Go to **Accounting → Bank Feed**
2. Review imported transactions
3. For each transaction, choose to:
   - **Match** — Link to an existing record
   - **Categorize** — Assign to a GL account
   - **Create** — Generate a new record
4. Mark transactions as reconciled

### Journal Entries (Accounting → Journal Entries)

Create manual journal entries for adjustments:

1. Go to **Accounting → Journal Entries**
2. Click **New Entry**
3. Enter date, description, and debit/credit lines
4. Ensure debits equal credits
5. Save (or save as draft)

### Fixed Assets (Accounting → Fixed Assets)

Track depreciable business assets (equipment, vehicles, buildings):

1. Go to **Accounting → Fixed Assets**
2. Add assets with purchase date, cost, useful life, and depreciation method
3. Track current book value over time

---

## Inventory & Products

### Product Categories (Inventory → Categories)

Organize products into a hierarchical category structure:

1. Go to **Inventory → Categories**
2. Click **Add Category**
3. Enter: Category Name, Description, Parent Category (for sub-categories), Display Order

**Example Structure:**
```
Eggs
├── Chicken Eggs
├── Duck Eggs
└── Quail Eggs
Meat
├── Beef
├── Pork
└── Poultry
Produce
├── Vegetables
├── Fruits
└── Herbs
```

### Products (Inventory → Products)

1. Go to **Inventory → Products**
2. Click **Add Product**
3. Complete the form:

| Section | Fields |
|---------|--------|
| **Basic Info** | Name, SKU, Description, Category |
| **Pricing** | Price, Compare-at Price, Cost |
| **Inventory** | Track inventory?, Stock quantity, Low stock alert threshold |
| **Images** | Product photos (first = primary image) |
| **Variants** | Size, weight, or other options with per-variant pricing |

**Inventory Adjustments:**
- Select a product and click **Adjust Inventory**
- Enter quantity change (+/-) and reason (received shipment, damaged/spoiled, manual correction, processing)
- Add notes as needed

---

## Food Trailer / Restaurant Setup

The Back Office includes a **Food Trailer** section for managing menus, items, modifiers, and events. This data is shared with both the Restaurant POS and the ecommerce website.

### Menus (Food Trailer → Menus)

1. Go to **Food Trailer → Menus**
2. Click **Create Menu**
3. Enter menu name (e.g., "Breakfast", "Lunch", "Catering")
4. Set availability schedule (days/times)

### Menu Items (Food Trailer → Menu Items)

1. Go to **Food Trailer → Menu Items**
2. Click **Add Item**
3. Configure: Name, Description, Price, Category, Image, Preparation Time
4. Assign to one or more menus

### Modifications (Food Trailer → Modifications)

Create modifier groups for customizable items:

1. Go to **Food Trailer → Modifications**
2. Create modifier groups:
   - "Egg Style" → Scrambled, Fried, Poached (required)
   - "Add Protein" → +$3 Bacon, +$2 Sausage (optional)
3. Assign modifier groups to applicable menu items

### Events (Food Trailer → Events)

Track upcoming events, markets, and catering gigs:

1. Go to **Food Trailer → Events**
2. Create events with date, location, expected attendance, and menu selection

### POS Sales (Food Trailer → POS Sales)

Review sales data from both POS Terminal and Restaurant POS transactions. Filter by date range, view totals, and analyze trends.

---

## Site Management & Ecommerce

### Site Settings (Site Management → Site Settings)

Configure your ecommerce website's global settings:

- Business name, tagline, contact information
- Social media links (Facebook, Instagram, Twitter/X, YouTube, TikTok)
- Business hours
- Default SEO settings

### Branding Assets (Site Management → Branding Assets)

Upload and manage brand elements:

- **Logo** — Used in website header, receipts, emails (PNG/SVG, min 200x200px)
- **Favicon** — Browser tab icon (32x32px)
- **Social Image** — For social media sharing (1200x630px)
- **Brand Colors** — Primary, secondary, background, and text colors

### Site Builder (Site Management → Site Builder)

Build and customize your ecommerce website pages without coding:

1. Go to **Site Management → Site Builder**
2. You'll see existing pages (Home, About/Our Story, Contact, FAQ, and any custom pages)
3. Click **Edit** on any page to open the page builder

**Page Structure:**
Each page has a template with zones, and zones contain content blocks.

```
┌─────────────────────────────────────┐
│  HERO ZONE                          │
│  [Hero Block - Welcome banner]      │
├─────────────────────────────────────┤
│  CONTENT ZONE                       │
│  [Text Block]                       │
│  [Product Grid Block]               │
│  [Testimonials Block]               │
├─────────────────────────────────────┤
│  CTA ZONE                           │
│  [Call to Action Block]             │
└─────────────────────────────────────┘
```

**Available Block Types:**

| Block | Best For |
|-------|----------|
| Hero Banner | Page headers, welcome messages |
| Text Content | Paragraphs, articles |
| Image | Single photos |
| Two Column | Side-by-side content |
| Feature Cards | Benefits, services |
| Product Grid | Featured products |
| Image Gallery | Photo collections |
| Video | Embedded video content |
| Testimonial | Customer reviews |
| Contact Info | Business details |
| Contact Form | Visitor message forms |
| FAQ Accordion | Questions & answers |
| Call to Action | Conversion prompts |
| Spacer | Visual breaks between sections |
| Custom HTML | Advanced embeds and custom code |
| Newsletter* | Email signup (*not yet rendering on live site) |

**Publishing:**
1. Complete your edits and click **Save Page**
2. Preview the page
3. Toggle **Published** to make it visible on the live site
4. Visit `{slug}.app.busmgr.com` to confirm

### Media Library (Site Management → Media Library)

Upload and manage images and files used across the website:

- Upload images (drag-and-drop or file picker)
- Organize by folder/tag
- Copy URLs for use in blocks and products

### Blog Posts (Site Management → Blog Posts)

Create and manage blog content:

1. Go to **Site Management → Blog Posts**
2. Click **New Post**
3. Write your content with the editor
4. Add a featured image, tags, and SEO metadata
5. Preview before publishing
6. Published posts appear on the blog page at `{slug}.app.busmgr.com/blog`

### Social Media (Site Management → Social Media)

Manage social media content and scheduling from within the Back Office.

### Ecommerce Website — Customer Experience

Your online store at `{slug}.app.busmgr.com` includes these public pages:

| Page | Description |
|------|-------------|
| **Home** | Landing page built with Site Builder blocks |
| **Shop** | Product catalog with category filtering |
| **Product Detail** | Individual product pages with images, descriptions, variants |
| **Food Trailer / Menu** | Food service menu display for online ordering |
| **Blog** | Published blog posts |
| **Gallery** | Photo gallery |
| **Our Story** | About/story page |
| **Contact** | Contact form and business info |
| **FAQ** | Frequently asked questions |
| **Cart** | Shopping cart with item management |
| **Checkout** | Order placement with Stripe payment |
| **Order Confirmation** | Post-purchase confirmation |

### Delivery Zones

Configure delivery areas and fees:

1. Go to **Delivery Zones** in the Back Office sidebar
2. Create zones with geographic boundaries
3. Set delivery fees per zone
4. Zones appear during customer checkout for delivery orders

---

## Managing Livestock (Herds & Flocks)

**URL:** `{slug}.herds.busmgr.com`  
**Required Tier:** Professional or Enterprise

The Herds & Flocks application is a dedicated livestock and pasture management system with its own sidebar navigation.

### Dashboard

Shows at-a-glance counts for cattle, sheep/goats, poultry, and pastures. Quick action buttons for adding animals, creating sale tickets, recording weights, and logging health records.

### Livestock Section

**Herds & Flocks** — Manage named groups of animals (e.g., "East Pasture Herd", "Layer Flock")

**Animals** — Individual animal records:
- Tag/ID number, species, breed, birth date, gender
- Dam/sire parentage tracking
- Status tracking through lifecycle

**Health Records** — Track veterinary events:
- Vaccinations, treatments, checkups, illnesses
- Date, notes, cost, and vet information

**Weight Tracking** — Record periodic weights:
- Track growth over time with date and weight entries
- Monitor average daily gain

**Processing Records** — When animals are processed for sale:
- Record processing date, cuts/products, weights
- Maintain traceability from animal to inventory

### Land Management Section

**Pastures** — Manage named pastures with acreage and descriptions

**Grazing Events** — Record which animals are in which pastures and when

**Soil Samples** — Track soil test results for pasture management

**Tasks** — Manage pasture-related tasks (fencing, clearing, reseeding)

**Treatments** — Record pasture treatments (fertilizer, herbicide, liming)

### Rainfall

Record and track rainfall measurements for your property.

### Sales Section

**Sale Tickets** — Create sale records when selling livestock:
- Buyer, animals, prices, fees, and total
- Track per-head pricing and commissions

**Buyers** — Manage buyer contacts and purchase history

### Settings Section

Configure reference data: **Breeds**, **Animal Categories**, **Owners**, and **Fee Types**.

---

## Point of Sale Operations

### POS Terminal

**URL:** `{slug}.pos.busmgr.com`  
**Required Tier:** Starter or above

The POS Terminal is designed for quick in-person sales at markets, events, and the farm stand.

**Features:**
- **Product Grid** — Tap products to add to cart, organized by category with customizable layouts
- **Cart** — Running total with quantity adjustments and item removal
- **Cash Payments** — Enter cash tendered, calculates change
- **Card Payments** — Stripe Terminal integration for tap/swipe/insert; manual card entry fallback
- **Order Complete** — Receipt display with print or email option
- **Layout Editor** — Customize the product grid layout and arrange items for quick access
- **Sales Review** — End-of-day sales summary with card and cash totals

**Typical Flow:**
1. Staff logs in (or uses SSO from Portal)
2. Tap products on the grid to add to cart
3. Adjust quantities as needed
4. Choose **Pay Cash** or **Pay Card**
5. Complete payment and provide receipt
6. At end of day, review sales in the Sales Review screen

### Restaurant POS

**URL:** `{slug}.rpos.busmgr.com`  
**Required Tier:** Professional or Enterprise

The Restaurant POS is built for food service operations with full order management.

**Features:**
- **Menu Selector** — Switch between active menus (Breakfast, Lunch, etc.)
- **Menu Item Grid** — Browse and add items by category
- **Item Modifications** — Apply modifiers (egg style, add-ons, special requests)
- **Cart** — Current order with item-level modifications displayed
- **Orders Sidebar** — View all open orders, mark as ready, track status
- **Checkout** — Apply discounts, calculate tax, accept tips
- **Cash & Card Payments** — Full Stripe Terminal support plus cash handling
- **Order Detail** — View past order details
- **Sales Review** — Shift and daily sales reporting

**Typical Flow:**
1. Select the active menu
2. Add items to the order, applying modifications as needed
3. Send order to kitchen (appears on KDS)
4. When customer is ready, process payment (card or cash)
5. Collect tip if applicable
6. Review sales at end of shift

---

## Kitchen Display System

**URL:** `{slug}.kitchen.busmgr.com`  
**Required Tier:** Professional or Enterprise

The Kitchen Display System (KDS) shows incoming orders from the Restaurant POS in real time.

**Features:**
- **Order Cards** — Each order displays as a card showing items, modifications, and time elapsed
- **Priority Ordering** — Oldest orders appear first; cards change color as they age
- **Bump/Complete** — Kitchen staff mark orders as done, moving them to the completed panel
- **Done Orders Panel** — Recently completed orders for reference

**Setup:**
1. Connect a display or tablet in the kitchen
2. Navigate to `{slug}.kitchen.busmgr.com`
3. Log in (or SSO auto-authenticates)
4. Orders appear automatically when placed from Restaurant POS

---

## Managing Staff & Permissions

### Creating User Accounts (Users / Accounts)

1. Go to **Users / Accounts** in the Back Office sidebar
2. Click **Add User**
3. Enter: Name, Email, Role
4. User receives login credentials

### User Roles

| Role | Access Level |
|------|--------------|
| **tenant_admin** | Full access to all features and settings |
| **admin** | Full access to all features and settings |
| **staff** | Day-to-day operations (POS, orders, basic inventory) |
| **accountant** | Financial views only: Dashboard, Bookkeeping, Bank Feed/Connections, Journal Entries, Chart of Accounts, Fixed Assets, POS Sales, Reports, Report Builder |

> **Accountant Role:** The accountant role is restricted to accounting-related views. They cannot access inventory, site management, food trailer setup, or user management.

---

## Reports & Analytics

### Financial Reports

1. Go to **Financial Reports** in the Back Office sidebar
2. Select a report type: Profit & Loss, Balance Sheet, Cash Flow, Sales by Product, Sales by Category
3. Set date range and any filters
4. Click **Generate**
5. Export to CSV or PDF as needed

### Report Builder

1. Go to **Report Builder** for custom report creation
2. Select data source, columns, filters, and grouping
3. Preview and save custom reports for reuse

### Dashboard KPIs

Your Back Office dashboard shows key metrics: today's sales, week-over-week comparison, top selling products, low stock alerts, and pending orders.

---

## Day-to-Day Operations

### Morning Routine

1. **Check Dashboard** — Log into Portal → Back Office
   - New online orders overnight?
   - Low stock alerts?
   - Today's schedule?

2. **Process Orders** — Review and fulfill new orders

3. **Herds & Flocks (if applicable)** — Record morning chores, health observations, collections

### Market/Event Day

1. **Before:** Charge POS device, verify Stripe Terminal connectivity, load cash drawer
2. **During:** Ring sales on POS Terminal, accept cards and cash
3. **Food Service:** Take orders on Restaurant POS, kitchen monitors KDS
4. **After:** Run End of Day settlement, count cash, review daily sales report

### Evening Close

1. **Settlement** — Close POS terminals, count cash, verify card totals
2. **Review** — Check daily sales report in Back Office, note issues
3. **Plan Tomorrow** — Pending orders, low stock, staff schedule

---

## Getting Help

### In-App Help

Click the **?** icon in any screen for contextual help.

### Support

| Need | Resource |
|------|----------|
| How-to questions | In-app help icon |
| Technical issues | support@busmgr.com |
| Account/billing | billing@busmgr.com |
| Feature requests | Feedback button in app |

### Related Documentation

- **Onboarding Journey** — `USER_GUIDE_ONBOARDING_JOURNEY.md`
- **Super Admin Guide** — `USER_GUIDE_SUPER_ADMIN.md`
- **Architecture** — `ARCHITECTURE.md`

---

*Thank you for choosing Business Manager. We're here to help your business thrive!*
