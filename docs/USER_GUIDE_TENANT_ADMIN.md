# Hood Family Farms Business Manager
# Tenant Admin User Guide

**Audience:** Business Owners and Administrators  
**Version:** 1.0  
**Last Updated:** January 2026

---

## Table of Contents

1. [Welcome to Business Manager](#welcome-to-business-manager)
2. [Getting Started](#getting-started)
3. [Setting Up Your Business Profile](#setting-up-your-business-profile)
4. [Configuring Your Financial System](#configuring-your-financial-system)
5. [Managing Inventory & Products](#managing-inventory--products)
6. [Building Your Ecommerce Website](#building-your-ecommerce-website)
7. [Setting Up Restaurant Operations](#setting-up-restaurant-operations)
8. [Managing Livestock (Herds & Flocks)](#managing-livestock-herds--flocks)
9. [Managing Staff & Permissions](#managing-staff--permissions)
10. [Processing Payments](#processing-payments)
11. [Reports & Analytics](#reports--analytics)
12. [Day-to-Day Operations](#day-to-day-operations)

---

## Welcome to Business Manager

Congratulations on joining the Hood Family Farms Business Manager platform! This guide will help you configure your account and start using all the tools available to run your business efficiently.

### What You Can Do

With Business Manager, you can:

- **Manage Your Finances**: Track income, expenses, and generate financial reports
- **Sell Online**: Create a professional ecommerce website for your products
- **Process Payments**: Accept credit cards, cash, and digital payments
- **Track Inventory**: Know what you have in stock at all times
- **Manage Livestock**: Track animals from birth to sale (if applicable)
- **Run a Food Service**: Full restaurant POS with kitchen display (if applicable)
- **Understand Your Business**: Comprehensive reports and analytics

### Your Applications

Based on your subscription, you have access to these applications:

| Application | URL | Purpose |
|-------------|-----|---------|
| **Back Office** | `{your-slug}.office.hoodfamilyfarms.com` | Central management hub |
| **Ecommerce Website** | `{your-slug}.hoodfamilyfarms.com` | Customer-facing store |
| **POS Terminal** | `{your-slug}.pos.hoodfamilyfarms.com` | In-person sales |
| **Herds & Flocks** | `{your-slug}.herds.hoodfamilyfarms.com` | Livestock management |
| **Restaurant POS** | `{your-slug}.restaurant.hoodfamilyfarms.com` | Food service orders |
| **Kitchen Display** | `{your-slug}.kds.hoodfamilyfarms.com` | Kitchen order queue |

---

## Getting Started

### First Login

1. Open your Back Office URL in a web browser
2. Enter the email and temporary password provided by your administrator
3. You'll be prompted to create a new password
4. Complete your profile setup

### Recommended Setup Order

For the smoothest setup experience, we recommend this order:

```
Week 1: Foundation
├── 1. Complete Business Profile
├── 2. Configure Chart of Accounts
├── 3. Connect Bank Accounts
└── 4. Set Up Tax Rates

Week 2: Products & Content
├── 5. Add Product Categories
├── 6. Create Products/Inventory
├── 7. Build Website Pages
└── 8. Configure Site Settings

Week 3: Operations
├── 9. Create Staff Accounts
├── 10. Set Up POS Stations
├── 11. Train Staff
└── 12. Go Live!
```

---

## Setting Up Your Business Profile

Your business profile appears throughout the platform and on customer-facing pages.

### Basic Information

Navigate to **Settings → Business Profile**

| Field | Description | Example |
|-------|-------------|---------|
| **Business Name** | Your official business name | "Smith Family Farm, LLC" |
| **Display Name** | How customers see you | "Smith Family Farm" |
| **Tagline** | Brief description (optional) | "Fresh from our family to yours" |
| **Phone** | Customer contact number | (555) 123-4567 |
| **Email** | Customer contact email | hello@smithfamilyfarm.com |

### Address

Your business address is used for:
- Customer inquiries
- Receipt/invoice printing
- Tax calculations
- Shipping estimates

### Brand Assets

Upload your brand elements:

- **Logo**: Used in header, receipts, emails (PNG/SVG, min 200x200px)
- **Favicon**: Browser tab icon (32x32px)
- **Social Image**: For social media sharing (1200x630px)

### Brand Colors

Set your brand colors for the website:

| Color | Use |
|-------|-----|
| **Primary** | Headers, buttons, links |
| **Secondary** | Accents, hover states |
| **Background** | Page backgrounds |
| **Text** | Body text color |

### Business Hours

Set your operating hours for display on your website:

```
Monday:    8:00 AM - 5:00 PM
Tuesday:   8:00 AM - 5:00 PM
Wednesday: 8:00 AM - 5:00 PM
Thursday:  8:00 AM - 5:00 PM
Friday:    8:00 AM - 5:00 PM
Saturday:  9:00 AM - 3:00 PM
Sunday:    Closed
```

### Social Media Links

Connect your social profiles:
- Facebook
- Instagram
- Twitter/X
- YouTube
- TikTok

---

## Configuring Your Financial System

### Understanding the Chart of Accounts

The Chart of Accounts is the foundation of your financial tracking. Default accounts are created for you, but you can customize them.

**Account Types:**

| Type | Purpose | Examples |
|------|---------|----------|
| **Asset** | Things you own | Cash, Inventory, Equipment |
| **Liability** | Things you owe | Loans, Credit Cards, Sales Tax Payable |
| **Equity** | Owner's investment | Owner's Capital, Retained Earnings |
| **Revenue** | Money earned | Product Sales, Service Revenue |
| **Expense** | Money spent | Feed, Supplies, Utilities |

### Customizing Accounts

To add a new account:

1. Go to **Accounting → Chart of Accounts**
2. Click **Add Account**
3. Fill in:
   - Account Name
   - Account Type
   - Account Number (optional)
   - Parent Account (for sub-accounts)
   - Description

### Connecting Bank Accounts

Link your bank accounts to automatically import transactions.

1. Go to **Settings → Bank Connections**
2. Click **Connect Bank Account**
3. Search for your bank
4. Log in with your bank credentials (securely via Plaid)
5. Select accounts to sync

**Security Note:** We never see your bank login credentials. Plaid handles all authentication securely.

### Reconciling Transactions

After transactions import:

1. Go to **Accounting → Bank Transactions**
2. Review imported transactions
3. Match or categorize each transaction:
   - **Match**: Link to existing invoice or bill
   - **Categorize**: Assign to an expense/income account
   - **Create**: Generate a new record
4. Mark as reconciled

### Tax Configuration

Set up sales tax collection:

1. Go to **Settings → Tax Rates**
2. Add tax rates for your jurisdictions:
   ```
   Texas State Sales Tax: 6.25%
   Smith County Tax: 1.0%
   City of Farmville Tax: 0.5%
   Combined Rate: 7.75%
   ```
3. Set default tax rate for new products

---

## Managing Inventory & Products

### Product Categories

Organize products into categories for your website and reports.

1. Go to **Inventory → Categories**
2. Click **Add Category**
3. Enter:
   - Category Name (e.g., "Fresh Eggs")
   - Description
   - Parent Category (for sub-categories)
   - Display Order

**Example Category Structure:**
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

### Adding Products

1. Go to **Inventory → Products**
2. Click **Add Product**
3. Complete the form:

| Tab | Fields |
|-----|--------|
| **Basic Info** | Name, SKU, Description, Category |
| **Pricing** | Price, Compare-at Price, Cost |
| **Inventory** | Track inventory?, Stock quantity, Low stock alert |
| **Images** | Product photos (first = primary) |
| **Options** | Variants (size, weight, etc.) |
| **SEO** | URL slug, Meta title, Meta description |

### Product Variants

For products with options (e.g., different sizes):

1. Enable **This product has variants**
2. Add option names: "Size"
3. Add option values: "Dozen", "Half Dozen", "Flat (30)"
4. Set price and inventory for each variant

### Inventory Management

**Adjusting Stock:**
1. Go to product detail
2. Click **Adjust Inventory**
3. Enter adjustment quantity (+/-)
4. Select reason:
   - Received shipment
   - Damaged/spoiled
   - Manual count correction
   - Processing/production
5. Add notes if needed

**Low Stock Alerts:**
Set threshold quantities to receive alerts when stock is low.

---

## Building Your Ecommerce Website

Your website is your digital storefront. The Site Builder lets you customize every page without coding.

### Accessing Site Builder

1. In Back Office, go to **Content → Site Builder**
2. You'll see your existing pages (Home, About, Contact, FAQ)

### Understanding Page Structure

Each page consists of:
- **Template**: The overall layout structure
- **Zones**: Designated areas for content
- **Blocks**: Individual content pieces within zones

```
┌─────────────────────────────────────┐
│  HERO ZONE                          │
│  [Hero Block - Welcome banner]      │
├─────────────────────────────────────┤
│  CONTENT ZONE                       │
│  [Text Block - Introduction]        │
│  [Product Grid Block - Featured]    │
│  [Testimonials Block]               │
├─────────────────────────────────────┤
│  CTA ZONE                           │
│  [Call to Action Block]             │
└─────────────────────────────────────┘
```

### Editing a Page

1. Click **Edit** on any page
2. The page builder opens
3. You'll see three tabs:
   - **Page Content**: Add and arrange blocks
   - **Page Settings**: Title, slug, homepage setting
   - **SEO**: Search engine optimization

### Working with Blocks

**Adding a Block:**
1. Click **+ Add Block** in any zone
2. Select a block type
3. Configure the block content
4. Click **Save Block**

**Editing a Block:**
1. Click the **Edit** icon on the block
2. Modify content
3. Click **Save Changes**

**Reordering Blocks:**
- Drag and drop blocks within a zone
- Use the grip handle on the left side

**Block Types Available:**

| Block | Best For |
|-------|----------|
| **Hero Banner** | Page headers, welcome messages |
| **Text Content** | Paragraphs, articles |
| **Image** | Single photos |
| **Two Column** | Side-by-side content |
| **Feature Cards** | Benefits, services |
| **Product Grid** | Featured products |
| **Image Gallery** | Photo collections |
| **Testimonials** | Customer reviews |
| **Contact Info** | Business details |
| **FAQ Accordion** | Questions & answers |
| **Newsletter** | Email signup |
| **Call to Action** | Conversion prompts |

### Building Your Home Page

A great home page includes:

1. **Hero Section**
   - Compelling headline
   - Brief tagline
   - Strong call-to-action button
   - Attractive background image

2. **Value Proposition**
   - What makes you special?
   - Feature cards highlighting benefits

3. **Featured Products**
   - Product grid showing bestsellers
   - Link to full catalog

4. **Social Proof**
   - Customer testimonials
   - Trust badges

5. **Call to Action**
   - Clear next step for visitors
   - Shop now, contact us, subscribe

### Building Your About Page

Tell your story:

1. **Hero**: Simple header with your farm name
2. **Our Story**: Two-column with photo and narrative
3. **Our Values**: Feature cards with your principles
4. **The Team**: Photos and bios (optional)
5. **Visit Us**: Map and directions (if applicable)

### Building Your Contact Page

Make it easy to reach you:

1. **Hero**: "Get in Touch" header
2. **Contact Methods**: Phone, email, address
3. **Business Hours**: When you're available
4. **Contact Form**: Direct messaging
5. **FAQ**: Common questions

### SEO Best Practices

For each page:

1. **Page Title**: 50-60 characters, include keywords
   - Good: "Fresh Farm Eggs | Smith Family Farm"
   - Bad: "Home"

2. **Meta Description**: 150-160 characters, compelling
   - Good: "Order farm-fresh eggs from Smith Family Farm. Free-range chickens, delivered weekly to the greater Dallas area."
   - Bad: "Welcome to our website"

3. **URL Slug**: Short, descriptive, hyphenated
   - Good: `/about-us`
   - Bad: `/page12345`

### Publishing Pages

1. Complete your edits
2. Click **Save Page**
3. Review in preview mode
4. Toggle **Published** to make visible
5. Visit your website to confirm

---

## Setting Up Restaurant Operations

If you have food service (food trailer, farm restaurant, etc.), configure your restaurant system.

### Creating Menus

1. Go to **Restaurant → Menus**
2. Click **Create Menu**
3. Enter menu name (e.g., "Breakfast", "Lunch", "Catering")
4. Set availability schedule (days/times)

### Adding Menu Items

1. Select a menu
2. Click **Add Item**
3. Configure:
   - Name
   - Description
   - Price
   - Category (Appetizers, Mains, Drinks, etc.)
   - Image
   - Preparation time

### Modifiers & Add-ons

For customizable items:

1. Create Modifier Groups:
   - "Egg Style" (Scrambled, Fried, Poached)
   - "Add Protein" (+$3 Bacon, +$2 Sausage)

2. Assign to items:
   - Breakfast Plate: "Egg Style" required, "Add Protein" optional

### Kitchen Display Setup

1. Connect a display in the kitchen
2. Navigate to your KDS URL
3. Configure station (if multiple prep areas)
4. Orders appear automatically when placed

---

## Managing Livestock (Herds & Flocks)

Track your animals from birth to sale.

### Adding Animals

1. Go to **Herds & Flocks → Animals**
2. Click **Add Animal**
3. Enter:
   - ID/Tag Number
   - Species (Cattle, Pig, Chicken, etc.)
   - Breed
   - Birth Date
   - Gender
   - Dam/Sire (parents)

### Health Records

Track medical events:

1. Select an animal
2. Click **Add Health Event**
3. Record:
   - Event Type (Vaccination, Treatment, Checkup)
   - Date
   - Notes
   - Cost (optional)

### Breeding Records

Track lineage:

1. Go to **Breeding → Record Breeding**
2. Select sire and dam
3. Enter breeding date
4. Track expected birth date
5. Record outcome when born

### Processing to Inventory

When animals are processed:

1. Select animal(s)
2. Click **Process to Inventory**
3. Enter:
   - Process date
   - Cuts/products created
   - Weights
4. Products automatically added to inventory
5. Animal marked as processed (traceability maintained)

---

## Managing Staff & Permissions

Control who can access what.

### Creating User Accounts

1. Go to **Settings → Users**
2. Click **Add User**
3. Enter:
   - Name
   - Email
   - Role

### User Roles

| Role | Access Level |
|------|--------------|
| **Admin** | Full access to everything |
| **Manager** | Most features, can't change billing |
| **Staff** | Day-to-day operations only |
| **Viewer** | Read-only access to reports |

### Custom Permissions

For fine-grained control:

1. Edit user
2. Go to **Permissions** tab
3. Toggle individual capabilities:
   - View financial data
   - Process refunds
   - Manage inventory
   - Edit website
   - etc.

---

## Processing Payments

### Accepting Credit Cards

Your Stripe account is configured during setup. To process payments:

**Online (Ecommerce):**
- Customers pay at checkout
- Funds deposited to your bank (2-day rolling)

**In Person (POS):**
- Swipe/tap/insert card
- Or enter card number manually

### Payment Methods

| Method | Online | POS |
|--------|--------|-----|
| Credit/Debit Cards | ✓ | ✓ |
| Apple Pay | ✓ | ✓ |
| Google Pay | ✓ | ✓ |
| Cash | — | ✓ |
| Check | — | ✓ |

### Processing Refunds

1. Find the order in **Orders**
2. Click **Refund**
3. Select full or partial refund
4. Enter reason
5. Confirm

Refunds process back to the original payment method.

### Viewing Payouts

1. Go to **Settings → Payments**
2. View payout history
3. See deposit dates and amounts

---

## Reports & Analytics

Understand your business with comprehensive reports.

### Financial Reports

| Report | Description |
|--------|-------------|
| **Profit & Loss** | Revenue minus expenses by period |
| **Balance Sheet** | Assets, liabilities, and equity |
| **Cash Flow** | Money in and out |
| **Sales by Product** | What's selling best |
| **Sales by Category** | Category performance |

### Running a Report

1. Go to **Reports**
2. Select report type
3. Set date range
4. Apply filters (category, location, etc.)
5. Click **Generate**
6. Export to CSV/PDF if needed

### Dashboard KPIs

Your dashboard shows key metrics:

- Today's sales
- Week-over-week comparison
- Top selling products
- Low stock alerts
- Pending orders

---

## Day-to-Day Operations

### Morning Routine

1. **Check Dashboard**
   - New online orders overnight?
   - Low stock alerts?
   - Today's schedule?

2. **Process Orders**
   - Review new orders
   - Print packing lists
   - Prepare for fulfillment

3. **Herds & Flocks (if applicable)**
   - Record morning chores
   - Log any health observations
   - Update pasture rotations

### During Business Hours

**If at Farmers Market/Event:**
1. Use POS Terminal for sales
2. Process card and cash payments
3. Track inventory deductions

**If Running Food Service:**
1. Take orders via Restaurant POS
2. Kitchen views orders on KDS
3. Mark orders complete when served

### Evening Close

1. **End of Day Settlement**
   - Go to POS → End of Day
   - Count cash drawer
   - Review card totals
   - Submit settlement

2. **Review Activity**
   - Check daily sales report
   - Note any issues to address
   - Respond to customer inquiries

3. **Plan Tomorrow**
   - Pending orders to fulfill
   - Low stock to reorder
   - Staff schedule

---

## Getting Help

### In-App Help

Click the **?** icon in any screen for contextual help.

### Documentation

Full documentation at: **https://docs.hoodfamilyfarms.com**

### Support

- **Email**: support@hoodfamilyfarms.com
- **Response Time**: Within 24 hours (business days)

### Feedback

We love hearing from you! Use the **Feedback** button to share:
- Feature requests
- Bug reports
- General comments

---

*Thank you for choosing Hood Family Farms Business Manager. We're here to help your business thrive!*
