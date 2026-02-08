# Site Builder — User Guide

**Application:** Site Builder (within Back Office)  
**URL Pattern:** `{slug}.office.busmgr.com` → Site Management → Site Builder  
**Required Tier:** Enterprise (design tools); page display works at Professional+  
**Version:** 1.1  
**Last Updated:** February 2026

A complete guide to building and customizing your website using the Site Builder system.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Understanding the Basics](#understanding-the-basics)
3. [Page Templates](#page-templates)
4. [Content Blocks](#content-blocks)
5. [Building Your First Page](#building-your-first-page)
6. [Adding New Pages](#adding-new-pages)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Introduction

The Site Builder is a tool that lets you create and customize web pages without writing any code. Instead of dealing with technical details, you work with **pages** and **blocks**—simple building components that snap together to create your website.

Think of it like building with blocks:
- A **page** is like a blank canvas where you arrange your content
- **Blocks** are the individual pieces of content you place on that canvas (text, images, buttons, etc.)
- **Templates** are pre-made page layouts that give you a head start

### What You Can Build

With the Site Builder, you can create:
- A welcoming home page for your business
- An "About Us" page telling your story
- A contact page with your information and a message form
- A FAQ page answering common questions
- Photo galleries showcasing your work
- Custom pages for any other purpose

---

## Understanding the Basics

Before diving in, let's clarify some terms you'll encounter:

### Key Terms

| Term | What It Means |
|------|---------------|
| **Page** | A single screen on your website (like the Home page or Contact page) |
| **Block** | A section of content on a page (like a paragraph of text or a photo) |
| **Template** | A pre-designed page layout with suggested areas for content |
| **Zone** | A designated area on a template where you can place blocks |
| **Slug** | The web address for a page (e.g., "about-us" creates yoursite.com/about-us) |
| **Published** | When a page is visible to visitors (unpublished pages are hidden) |
| **Hero** | The large, eye-catching section at the top of a page |
| **CTA** | "Call to Action" — a button or message encouraging visitors to do something |

### How Pages Are Structured

Every page follows this general structure from top to bottom:

```
┌─────────────────────────────────────┐
│           HEADER                    │  ← Your logo and navigation menu
├─────────────────────────────────────┤
│                                     │
│           HERO ZONE                 │  ← Large banner area (optional)
│                                     │
├─────────────────────────────────────┤
│                                     │
│                                     │
│         CONTENT ZONE                │  ← Main content area
│      (Your blocks go here)          │
│                                     │
│                                     │
├─────────────────────────────────────┤
│         CTA ZONE                    │  ← Final call-to-action (optional)
├─────────────────────────────────────┤
│           FOOTER                    │  ← Contact info, links, copyright
└─────────────────────────────────────┘
```

The Header and Footer are consistent across all pages and are controlled by your site settings. The zones in between are where you add your blocks.

---

## Page Templates

Templates give you a starting structure for different types of pages. Each template has pre-defined zones optimized for specific purposes.

### Standard Page

**Best for:** General-purpose pages, blog posts, policies, terms of service

**Structure:**
- **Hero Zone** — One large banner block at the top
- **Content Zone** — Unlimited blocks for your main content
- **CTA Zone** — One call-to-action or newsletter signup at the bottom

**When to use:** Choose this template when you need flexibility. It works for almost any type of content.

---

### Landing Page

**Best for:** Marketing pages, promotional campaigns, product launches

**Structure:**
- **Hero Zone** — Eye-catching banner with headline and buttons
- **Features Zone** — Highlight key benefits (up to 2 blocks)
- **Social Proof Zone** — Customer testimonials and reviews (up to 2 blocks)
- **Content Zone** — Additional information (unlimited blocks)
- **CTA Zone** — Strong closing call-to-action

**When to use:** Choose this when you want to convince visitors to take a specific action, like signing up, purchasing, or contacting you.

---

### About Page

**Best for:** Company history, team introductions, mission statements

**Structure:**
- **Hero Zone** — Page header with title
- **Story Zone** — Your main narrative with images (up to 3 blocks)
- **Values Zone** — Core values or principles (up to 2 blocks)
- **Team Zone** — Team member profiles (1 block)
- **CTA Zone** — Invitation to connect

**When to use:** Choose this to tell your story and help visitors understand who you are.

---

### Contact Page

**Best for:** Contact information, location details, inquiry forms

**Structure:**
- **Hero Zone** — Simple page header
- **Contact Zone** — Contact form and information (up to 3 blocks)
- **FAQ Zone** — Common questions (optional, 1 block)

**When to use:** Choose this when you want visitors to reach out to you.

---

### Minimal Page

**Best for:** Simple pages, legal documents, single-purpose content

**Structure:**
- **Content Zone** — One flexible zone for any blocks (unlimited)

**When to use:** Choose this when you want complete control with no pre-defined structure.

---

## Content Blocks

Blocks are the building pieces you arrange on your pages. Each block type serves a specific purpose.

### Layout Blocks

These blocks control the overall structure and visual impact of your page.

---

#### Hero Banner

**What it does:** Creates a large, attention-grabbing section typically used at the top of a page. Usually includes a background image, headline text, and buttons.

**Best placement:** Top of the page, in the Hero zone

**Settings you can customize:**
- Headline (main title)
- Subheadline (supporting text)
- Background image or video
- Overlay darkness (how much the background is dimmed)
- Text alignment (left, center, or right)
- Minimum height
- Primary button (text and link)
- Secondary button (text and link)

**Tips:**
- Use high-quality images that are at least 1920 pixels wide
- Keep headlines short and impactful (under 10 words)
- If using a busy background image, increase the overlay darkness so text remains readable

---

#### Two Column Layout

**What it does:** Splits the content area into two side-by-side columns. Great for pairing text with an image.

**Best placement:** Content zone, for storytelling sections

**Settings you can customize:**
- Left column content (text or image)
- Right column content (text or image)
- Split ratio (50-50, 60-40, 40-60, 70-30, or 30-70)
- Vertical alignment (top, center, or bottom)
- Whether columns stack on mobile devices

**Tips:**
- On mobile phones, columns automatically stack vertically
- Use the "reverse on mobile" option to control which column appears first on small screens
- The 60-40 split works well when you have more text than image

---

#### Spacer

**What it does:** Adds vertical space between other blocks. Can optionally include a decorative divider line.

**Settings you can customize:**
- Height (how much space to add)
- Show divider line (yes/no)
- Divider style (solid, dashed, or dotted)
- Divider width (25%, 50%, 75%, or 100%)

---

#### Call to Action (CTA)

**What it does:** Creates a prominent banner that encourages visitors to take a specific action.

**Best placement:** End of the page (CTA zone) or between content sections

**Settings you can customize:**
- Headline
- Subheadline
- Button text and link
- Secondary button (optional)
- Background color or image
- Text alignment
- Padding

**Tips:**
- Use action words in your button text: "Get Started," "Learn More," "Shop Now"
- Limit to one or two CTAs per page to avoid overwhelming visitors

---

### Content Blocks

---

#### Text Content

**What it does:** Displays formatted text with support for headings, paragraphs, bold, italic, links, and lists.

**Settings you can customize:**
- Content (your text with formatting)
- Text alignment (left, center, right, or justified)
- Maximum width (to control line length)
- Number of columns (1, 2, or 3)

---

#### Image

**What it does:** Displays a single image with optional caption and link.

**Settings you can customize:**
- Image file
- Alt text (description for accessibility and search engines)
- Caption (optional text below the image)
- Link (make the image clickable)
- Size (small, medium, large, or full width)
- Alignment (left, center, or right)
- Rounded corners (yes/no)
- Drop shadow (yes/no)

---

#### Image Gallery

**What it does:** Displays multiple images in a grid, masonry, carousel, or lightbox layout.

**Settings you can customize:**
- Gallery title
- Layout style (grid, masonry, carousel, or lightbox)
- Number of columns (2, 3, 4, or 5)
- Gap between images
- Aspect ratio (square, 4:3, 16:9, or original)
- Individual images with alt text and captions

---

#### Video

**What it does:** Embeds a video from YouTube, Vimeo, or an uploaded file.

**Settings you can customize:**
- Video source (YouTube, Vimeo, or upload)
- Video URL
- Poster image (thumbnail shown before playing)
- Autoplay, Muted, Loop, Show controls
- Aspect ratio (16:9, 4:3, 1:1, or 9:16)
- Maximum width and Caption

---

#### Feature Cards

**What it does:** Displays a grid of cards, each with an icon or image, title, and description.

**Settings you can customize:**
- Section title and subtitle
- Number of columns (2, 3, or 4)
- Card style (simple, bordered, shadowed, or filled)
- Icon position (top or left)
- Individual cards with icon, title, description, optional link

---

#### FAQ Accordion

**What it does:** Displays a list of questions and answers that expand/collapse when clicked.

**Settings you can customize:**
- Section title and subtitle
- Allow multiple open (yes/no)
- Default open item
- Style (simple, bordered, or separated)
- Individual FAQ items with question and answer

---

#### Contact Information

**What it does:** Displays your business contact details in a clean, organized format.

**Settings you can customize:**
- Show/hide phone, email, address, hours, map
- Map height
- Layout style (vertical, horizontal, or cards)
- Override contact details

---

#### Contact Form

**What it does:** Creates a form where visitors can send you messages directly from your website.

**Settings you can customize:**
- Form title and description
- Recipient email
- Submit button text
- Success message
- Form fields (text, email, phone, textarea, select, checkbox)

---

#### Newsletter Signup

> **⚠️ Note:** The Newsletter Signup block type is available in the Site Builder interface but does not yet have a renderer on the live ecommerce site. Blocks of this type will be silently skipped when the page is displayed to visitors. This will be addressed in a future update.

**What it does:** Creates a simple email signup form to collect subscriber addresses.

---

### Social Proof Blocks

---

#### Testimonial

**What it does:** Displays a single customer quote with attribution.

**Settings you can customize:**
- Quote text, Author name, Author title/role, Author photo
- Company logo, Star rating (0-5)
- Style (simple, card, or featured)

---

#### Testimonials Carousel

> **⚠️ Note:** The Testimonials Carousel block type (`testimonials-carousel`) is available in the Site Builder admin but the ecommerce site renderer only maps `testimonial` and `testimonials` types. Use the standard "Testimonial" block type instead until this is resolved.

---

### Commerce Blocks

---

#### Product Grid

**What it does:** Displays products from your store in a grid format.

**Settings you can customize:**
- Product source (featured, category, hand-picked, recent)
- Number of products (1-24)
- Number of columns (2, 3, or 4)
- Show prices, show Add to Cart button
- "View All" link

---

### Advanced Blocks

---

#### Custom HTML

**What it does:** Lets you add raw HTML code for custom functionality or third-party embeds.

**Tips:**
- Only use if you understand HTML
- Use sandboxed mode when embedding third-party content

---

## Building Your First Page

### Step 1: Create the Page

1. Navigate to **Site Builder** in your admin dashboard
2. Click **+ New Page**
3. Enter: Title, Slug, Template
4. Click **Create Page**

### Step 2: Add Blocks

1. Find a zone in the page editor
2. Click **+ Add Block**
3. Select the block type
4. Configure settings
5. Click **Save Block**

### Step 3: Publish

1. Review your page in the preview
2. Click **Publish** to make it visible to visitors

---

## Best Practices

### Content Guidelines

- **Headlines:** Short and clear (under 10 words), use action words
- **Body Text:** Short paragraphs, put important info first, simple language
- **Images:** High quality (1200px+ wide), optimized file sizes, always include alt text

### Page Structure

- **Above the Fold:** Clear headline, compelling image, clear next step
- **Content Flow:** Hook → Value → Proof → Action
- **Mobile:** All templates responsive by default; preview before publishing

### Performance

- Compress images before uploading
- Don't overload pages with too many blocks
- Use video sparingly
- Remove unused blocks rather than hiding them

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "This page has no content yet" | Add blocks to the page; verify blocks are saved; check page is published |
| Page not in navigation | Ensure page is published with correct title and slug |
| Images not displaying | Re-upload the image; verify URL is correct |
| Changes not showing | Save changes; clear browser cache; refresh |
| Blocks in wrong order | Check display order numbers; drag to reorder; save after reordering |

---

## Quick Reference — Block Types

| Block | Best For | Typical Position |
|-------|----------|------------------|
| Hero Banner | Page headers, welcome messages | Top of page |
| Text Content | Articles, descriptions | Content zone |
| Image | Single photos, illustrations | Content zone |
| Two Column | Text with image pairings | Content zone |
| Feature Cards | Benefits, services, features | Near top, after hero |
| Image Gallery | Photo collections | Content zone |
| Video | Demonstrations, messages | Content zone |
| Testimonial | Single customer quote | Content zone |
| Testimonials Carousel | Multiple reviews | Content zone |
| Product Grid | Store products | Content zone |
| Contact Info | Business details | Contact page |
| Contact Form | Message collection | Contact page |
| FAQ Accordion | Q&A content | FAQ page or bottom |
| Newsletter | Email signups | Bottom of page |
| CTA | Conversion prompts | Bottom of page |
| Spacer | Visual breaks | Between sections |
| Custom HTML | Advanced embeds | Anywhere |

---

*See also: `ECOMMERCE_WEBSITE.md` for the customer-facing site, and `USER_GUIDE_TENANT_ADMIN.md` for the complete Back Office guide.*
