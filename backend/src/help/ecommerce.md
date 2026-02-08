# Ecommerce Website (Online Store) — User Guide

**Application:** Customer-Facing Ecommerce Website  
**URL Pattern:** `{slug}.app.busmgr.com`  
**Required Tier:** Professional and above  
**Version:** 1.0  
**Last Updated:** February 2026

---

## Overview

The Ecommerce Website is your public-facing online store. Customers visit it to browse products, read your blog, view your food trailer menu, place orders, and complete checkout with Stripe payment. All content is managed from the Back Office.

**URL:** `{slug}.app.busmgr.com` (e.g., `hood-family-farms.app.busmgr.com`)

---

## Customer-Facing Pages

The website includes these pages, all customizable through the Back Office:

| Page | Route | Description |
|------|-------|-------------|
| **Home** | `/` | Landing page built with Site Builder blocks |
| **Shop** | `/shop` | Product catalog with category filtering and search |
| **Product Detail** | `/shop/:slug` | Individual product page with images, description, variants, and Add to Cart |
| **Food Trailer** | `/food-trailer` | Food trailer information and event schedule |
| **Menu** | `/menu` | Food service menu display for browsing or online ordering |
| **Blog** | `/blog` | Published blog posts list |
| **Blog Post** | `/blog/:slug` | Individual blog article |
| **Gallery** | `/gallery` | Photo gallery showcasing your business |
| **Our Story** | `/our-story` | About page with your business narrative |
| **Contact** | `/contact` | Contact form and business information |
| **FAQ** | `/faq` | Frequently asked questions |
| **Cart** | `/cart` | Shopping cart with item management |
| **Checkout** | `/checkout` | Order placement and Stripe payment |
| **Order Confirmation** | `/order-confirmation` | Post-purchase confirmation and order details |
| **Login** | `/login` | Customer account login (if enabled) |
| **Dynamic Pages** | `/:slug` | Custom pages created in Site Builder |

---

## Managing Content (from Back Office)

All website content is controlled from the **Back Office** at `{slug}.office.busmgr.com`:

### Products & Shop

- **Inventory → Products** — Add products with name, description, price, images, and variants
- **Inventory → Categories** — Organize products into browsable categories
- Products marked as active appear automatically in the Shop page

### Food Trailer & Menu

- **Food Trailer → Menus** — Create menus that appear on the Menu page
- **Food Trailer → Menu Items** — Add items with descriptions, prices, and images
- **Food Trailer → Events** — Upcoming events shown on the Food Trailer page

### Blog

- **Site Management → Blog Posts** — Write, edit, and publish blog articles
- Published posts appear on the `/blog` page with newest first
- Each post has its own URL at `/blog/{post-slug}`

### Website Pages & Design

- **Site Management → Site Builder** — Design and edit page layouts using blocks
- **Site Management → Site Settings** — Configure site-wide settings (name, tagline, hours, social links)
- **Site Management → Branding Assets** — Upload logo, favicon, social image, brand colors
- **Site Management → Media Library** — Manage all uploaded images and files

### Delivery & Shipping

- **Delivery Zones** — Configure geographic delivery areas with fees
- Zones appear during customer checkout for delivery orders

---

## Customer Shopping Flow

```
Customer visits          Browses shop /      Adds items        Reviews cart
{slug}.app.busmgr.com → category pages  →   to cart      →   at /cart
                                                                   │
                                                                   ▼
                                                            Proceeds to
                                                            /checkout
                                                                   │
                                                                   ▼
                                                            Enters shipping/
                                                            delivery info &
                                                            selects delivery zone
                                                                   │
                                                                   ▼
                                                            Pays via Stripe
                                                            (card payment)
                                                                   │
                                                                   ▼
                                                            Order confirmation
                                                            shown + email sent
```

### Cart

- Customers add products from the Shop or Product Detail pages
- Cart displays items with quantities, prices, and totals
- Quantities can be adjusted or items removed
- Cart persists during the browser session

### Checkout

- Customer enters contact information and delivery/pickup preferences
- If delivery zones are configured, the applicable zone and fee are applied
- Tax calculated based on configured rates
- Payment processed securely through Stripe
- Upon success, the order confirmation page displays with order details

---

## Website Header & Footer

### Header

The site header appears on every page and includes:

- **Logo** — Pulled from Branding Assets
- **Navigation** — Links to main pages (Home, Shop, Menu, Blog, etc.)
- **Cart Icon** — Shows item count, links to cart page

### Footer

The footer appears on every page and includes:

- **Business Information** — Name, address, phone, email
- **Quick Links** — Navigation to key pages
- **Social Media Links** — Icons linking to configured social profiles
- **Business Hours** — From site settings
- **Copyright** — Auto-generated

Both are controlled via Site Settings and Branding Assets in the Back Office.

---

## SEO & Discoverability

For each page and blog post, configure SEO from the Back Office:

- **Page Title** — 50-60 characters including keywords
- **Meta Description** — 150-160 characters, compelling summary
- **URL Slug** — Short, descriptive, hyphenated
- **Social Image** — Image shown when shared on social media

### Tips

- Use descriptive product names and descriptions with relevant keywords
- Write compelling meta descriptions for the Home and Shop pages
- Keep blog posts regular to drive organic traffic
- Use high-quality product photos

---

## Mobile Experience

The website is fully responsive:

- Navigation collapses into a mobile menu on small screens
- Product grids adapt to single or double columns
- Checkout is optimized for mobile entry
- Images are responsive and load appropriate sizes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Products not showing in Shop | Verify products are active and have a category assigned in Back Office |
| Page showing "Not Found" | Check that the page is published in Site Builder |
| Images not loading | Re-upload in Media Library. Check that URLs are valid. |
| Checkout failing | Verify Stripe Connect is set up in Back Office → System → Stripe Connect |
| Menu page empty | Ensure menus and items are created in Back Office → Food Trailer |
| Blog posts not appearing | Verify posts are published (not draft) in Site Management → Blog Posts |
| Cart items disappearing | Cart uses browser session storage. Clearing cookies/storage resets the cart. |
| Delivery fee not applied | Check Delivery Zones configuration in Back Office |

---

*See also: `USER_GUIDE_TENANT_ADMIN.md` for Back Office content management, and `SITE_BUILDER.md` for detailed page building instructions.*
