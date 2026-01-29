# Site Builder User Guide

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

**Example uses:**
- Welcome message on your home page
- Announcement banner for a sale or event
- Page title with decorative background

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

**Example uses:**
- Company description with a photo
- Product details with product image
- Feature explanation with illustration

**Tips:**
- On mobile phones, columns automatically stack vertically
- Use the "reverse on mobile" option to control which column appears first on small screens
- The 60-40 split works well when you have more text than image

---

#### Spacer

**What it does:** Adds vertical space between other blocks. Can optionally include a decorative divider line.

**Best placement:** Between any blocks where you need visual breathing room

**Settings you can customize:**
- Height (how much space to add)
- Show divider line (yes/no)
- Divider style (solid, dashed, or dotted)
- Divider width (25%, 50%, 75%, or 100%)

**Example uses:**
- Separating different topics on a page
- Creating visual breaks between sections
- Adding a decorative line between content areas

**Tips:**
- Don't overuse spacers—too much empty space can make pages feel disconnected
- A subtle divider line can help organize content without being distracting

---

#### Call to Action (CTA)

**What it does:** Creates a prominent banner that encourages visitors to take a specific action. Typically includes a headline, supporting text, and one or two buttons.

**Best placement:** End of the page (CTA zone) or between content sections

**Settings you can customize:**
- Headline
- Subheadline
- Button text and link
- Secondary button (optional)
- Background color or image
- Text alignment
- Padding (amount of space around the content)

**Example uses:**
- "Ready to get started? Contact us today"
- "Subscribe to our newsletter"
- "Shop our latest collection"

**Tips:**
- Use action words in your button text: "Get Started," "Learn More," "Shop Now"
- Make the button link go somewhere useful—don't make visitors hunt for the next step
- Limit to one or two CTAs per page to avoid overwhelming visitors

---

### Content Blocks

These blocks display your actual content—text, images, and information.

---

#### Text Content

**What it does:** Displays formatted text with support for headings, paragraphs, bold, italic, links, and lists.

**Best placement:** Content zone, anywhere you need written content

**Settings you can customize:**
- Content (your text with formatting)
- Text alignment (left, center, right, or justified)
- Maximum width (to control line length)
- Number of columns (1, 2, or 3)

**Example uses:**
- Main body content on any page
- Detailed descriptions or explanations
- Legal text or policies

**Tips:**
- Break long text into short paragraphs (3-4 sentences each)
- Use headings to organize content and make it scannable
- Avoid centering long paragraphs—it's harder to read

---

#### Image

**What it does:** Displays a single image with optional caption and link.

**Best placement:** Content zone, wherever a visual would enhance your message

**Settings you can customize:**
- Image file
- Alt text (description for accessibility and search engines)
- Caption (optional text below the image)
- Link (make the image clickable)
- Size (small, medium, large, or full width)
- Alignment (left, center, or right)
- Rounded corners (yes/no)
- Drop shadow (yes/no)

**Example uses:**
- Product photos
- Team member portraits
- Decorative images to break up text

**Tips:**
- Always add alt text describing the image
- Optimize images for web (under 500KB when possible)
- Use consistent styling (all rounded corners or all square) throughout your site

---

#### Image Gallery

**What it does:** Displays multiple images in a grid, masonry (Pinterest-style), carousel (slideshow), or lightbox (click to enlarge) layout.

**Best placement:** Content zone, for showcasing multiple images

**Settings you can customize:**
- Gallery title
- Layout style (grid, masonry, carousel, or lightbox)
- Number of columns (2, 3, 4, or 5)
- Gap between images (none, small, medium, or large)
- Aspect ratio (square, 4:3, 16:9, or original)
- Individual images with alt text and captions

**Example uses:**
- Photo gallery of your work
- Product showcase
- Event photos
- Before/after comparisons

**Tips:**
- Use consistent aspect ratios for a cleaner look
- Masonry layout works best with images of varying heights
- Lightbox layout is great when you want visitors to see full-size images

---

#### Video

**What it does:** Embeds a video from YouTube, Vimeo, or an uploaded file.

**Best placement:** Content zone, wherever video content would be valuable

**Settings you can customize:**
- Video source (YouTube, Vimeo, or upload)
- Video URL
- Poster image (thumbnail shown before playing)
- Autoplay (yes/no)
- Muted (yes/no)
- Loop (yes/no)
- Show controls (yes/no)
- Aspect ratio (16:9, 4:3, 1:1, or 9:16)
- Maximum width
- Caption

**Example uses:**
- Product demonstrations
- Welcome message from the owner
- Tutorial or how-to content
- Customer testimonials

**Tips:**
- Don't autoplay videos with sound—it startles visitors
- Always provide a poster image so the video area isn't blank
- 16:9 is the standard aspect ratio for most videos

---

#### Feature Cards

**What it does:** Displays a grid of cards, each with an icon or image, title, and description. Perfect for highlighting key points or services.

**Best placement:** Content zone, near the top of the page after the hero

**Settings you can customize:**
- Section title and subtitle
- Number of columns (2, 3, or 4)
- Card style (simple, bordered, shadowed, or filled)
- Icon position (top or left)
- Individual cards with:
  - Icon or image
  - Title
  - Description
  - Optional link

**Example uses:**
- "Why Choose Us" benefits
- Services offered
- Product features
- Process steps

**Tips:**
- Use 3 or 6 cards for balanced layouts
- Keep descriptions brief (1-2 sentences)
- Use consistent icons from the same style family

---

#### FAQ Accordion

**What it does:** Displays a list of questions and answers that expand/collapse when clicked. Visitors can find answers without scrolling through everything.

**Best placement:** Content zone on FAQ pages, or near the bottom of other pages

**Settings you can customize:**
- Section title and subtitle
- Allow multiple open (yes/no)
- Default open item (which question starts expanded)
- Style (simple, bordered, or separated)
- Individual FAQ items with question and answer

**Example uses:**
- Frequently Asked Questions page
- Product Q&A section
- Shipping and return policies
- Common concerns

**Tips:**
- Put the most common questions at the top
- Keep answers concise—link to other pages for detailed information
- Use formatting in answers (bold, lists) to make them scannable

---

#### Contact Information

**What it does:** Displays your business contact details in a clean, organized format. Can pull information from your site settings automatically.

**Best placement:** Contact zone on Contact page, or footer area of other pages

**Settings you can customize:**
- Section title
- Show/hide phone number
- Show/hide email address
- Show/hide physical address
- Show/hide business hours
- Show/hide map
- Map height
- Layout style (vertical, horizontal, or cards)
- Override contact details (use different info than site settings)

**Example uses:**
- Contact page main content
- Location information
- Store hours display

**Tips:**
- Make phone numbers and email addresses clickable
- Include a map if you have a physical location visitors can find
- Keep business hours up to date

---

#### Contact Form

**What it does:** Creates a form where visitors can send you messages directly from your website.

**Best placement:** Contact zone on Contact page

**Settings you can customize:**
- Form title and description
- Recipient email (where messages are sent)
- Submit button text
- Success message (shown after submission)
- Form fields:
  - Field type (text, email, phone, textarea, select dropdown, checkbox)
  - Field label
  - Placeholder text
  - Required (yes/no)
  - Options (for dropdown fields)

**Example uses:**
- General contact form
- Quote request form
- Event inquiry form
- Feedback form

**Tips:**
- Only ask for information you actually need
- Mark required fields clearly
- Write a friendly success message confirming receipt

---

#### Newsletter Signup

**What it does:** Creates a simple email signup form to collect subscriber addresses.

**Best placement:** CTA zone at the bottom of pages, or as a standalone section

**Settings you can customize:**
- Title
- Description
- Email placeholder text
- Button text
- Success message
- Background color
- Compact style (yes/no)

**Example uses:**
- "Stay Updated" section
- "Get Our Newsletter" signup
- Early access or waitlist signup

**Tips:**
- Explain what subscribers will receive
- Keep the form simple—just email is usually enough
- Consider offering an incentive (discount, free guide, etc.)

---

### Social Proof Blocks

These blocks help build trust by showing what others think of your business.

---

#### Testimonial

**What it does:** Displays a single customer quote with attribution.

**Best placement:** Content zone, especially on landing pages and home page

**Settings you can customize:**
- Quote text
- Author name
- Author title/role
- Author photo
- Company logo
- Star rating (0-5)
- Style (simple, card, or featured)

**Example uses:**
- Customer review
- Client feedback
- Partner endorsement

**Tips:**
- Use real testimonials with permission
- Include photos when possible—they add authenticity
- Keep quotes focused and impactful

---

#### Testimonials Carousel

**What it does:** Displays multiple testimonials in a rotating slideshow.

**Best placement:** Social proof zone on landing pages, content zone on home page

**Settings you can customize:**
- Section title and subtitle
- Autoplay (yes/no)
- Rotation interval (seconds between slides)
- Individual testimonials with:
  - Quote
  - Author name and title
  - Author photo
  - Star rating

**Example uses:**
- Customer reviews section
- Client testimonials
- Press quotes

**Tips:**
- Include at least 3-4 testimonials for a good rotation
- Set the interval long enough for visitors to read (5+ seconds)
- Mix different types of customers for broader appeal

---

### Commerce Blocks

These blocks help you sell products directly on your pages.

---

#### Product Grid

**What it does:** Displays products from your store in a grid format.

**Best placement:** Content zone on home page, dedicated shop pages

**Settings you can customize:**
- Section title and subtitle
- Product source:
  - Featured products
  - Specific category
  - Hand-picked products
  - Recent products
- Number of products to show (1-24)
- Number of columns (2, 3, or 4)
- Show prices (yes/no)
- Show "Add to Cart" button (yes/no)
- "View All" link text and destination

**Example uses:**
- Featured products on home page
- Category showcase
- New arrivals section
- Sale items highlight

**Tips:**
- Don't show too many products—6-8 is often ideal for a preview
- Use consistent product photography
- Make sure "Add to Cart" buttons work as expected

---

### Advanced Blocks

These blocks are for users who need more control or have technical knowledge.

---

#### Custom HTML

**What it does:** Lets you add raw HTML code for custom functionality or third-party embeds.

**Best placement:** Anywhere you need custom functionality

**Settings you can customize:**
- HTML code
- Custom CSS (optional styling)
- Sandboxed (yes/no—isolates the code for security)

**Example uses:**
- Embedding third-party widgets
- Custom interactive elements
- Social media embeds not supported natively

**Tips:**
- Only use if you understand HTML
- Test thoroughly—bad code can break your page
- Use sandboxed mode when embedding third-party content

---

## Building Your First Page

Let's walk through creating a simple About page from start to finish.

### Step 1: Create the Page

1. Navigate to **Site Builder** in your admin dashboard
2. Click **+ New Page**
3. Enter the page details:
   - **Title:** "About Us"
   - **Slug:** "about" (this creates yoursite.com/about)
   - **Template:** Select "About Page"
4. Click **Create Page**

### Step 2: Add the Hero Block

1. Find the **Hero Zone** at the top of the page editor
2. Click **+ Add Block**
3. Select **Hero Banner**
4. Configure the settings:
   - Headline: "Our Story"
   - Subheadline: "Learn about our journey and mission"
   - Upload a background image
   - Set overlay opacity to 0.4 (so text is readable)
5. Click **Save Block**

### Step 3: Add Your Story

1. Find the **Story Zone**
2. Click **+ Add Block**
3. Select **Two Column Layout**
4. Configure:
   - Upload an image of your team or location in one column
   - Write your company history in the other column
   - Set split ratio to 50-50
5. Click **Save Block**

### Step 4: Add Your Values

1. Find the **Values Zone**
2. Click **+ Add Block**
3. Select **Feature Cards**
4. Configure:
   - Title: "Our Values"
   - Add 3 cards with your core values
   - Choose icons that represent each value
5. Click **Save Block**

### Step 5: Add a Call to Action

1. Find the **CTA Zone**
2. Click **+ Add Block**
3. Select **Call to Action**
4. Configure:
   - Headline: "Want to learn more?"
   - Button text: "Contact Us"
   - Button link: "/contact"
5. Click **Save Block**

### Step 6: Publish

1. Review your page in the preview
2. Click **Publish** to make it visible to visitors
3. Visit yoursite.com/about to see the live page

---

## Adding New Pages

Beyond the basic pages (Home, About, Contact, FAQ), you can create unlimited custom pages.

### Creating a Custom Page

1. Navigate to **Site Builder**
2. Click **+ New Page**
3. Fill in the details:
   - **Title:** The name shown in navigation and browser tabs
   - **Slug:** The URL-friendly version (e.g., "our-services" for yoursite.com/our-services)
   - **Page Type:** Select "Custom"
   - **Template:** Choose based on your content needs

### Choosing the Right Template

| If you need... | Choose this template |
|----------------|---------------------|
| Maximum flexibility | Minimal Page |
| A marketing/sales focus | Landing Page |
| A structured content page | Standard Page |
| Team or history content | About Page |
| Inquiry forms | Contact Page |

### Common Custom Pages

Here are ideas for additional pages you might create:

**Services Page**
- Template: Landing Page
- Blocks: Hero, Feature Cards (services), Testimonials, CTA

**Portfolio/Gallery Page**
- Template: Standard Page
- Blocks: Hero, Image Gallery, CTA

**Pricing Page**
- Template: Landing Page
- Blocks: Hero, Feature Cards (pricing tiers), FAQ, CTA

**Events Page**
- Template: Standard Page
- Blocks: Hero, Text Content (upcoming events), Image Gallery (past events)

**Team Page**
- Template: About Page
- Blocks: Hero, Feature Cards (team members), CTA

**Location/Visit Us Page**
- Template: Contact Page
- Blocks: Hero, Two Column (directions + map), Contact Info, FAQ

### Tips for Custom Pages

1. **Keep navigation manageable** — Too many pages can overwhelm visitors. Aim for 5-7 main navigation items.

2. **Use consistent styling** — Your custom pages should feel like part of the same website. Use similar hero styles, color schemes, and block arrangements.

3. **Think about the visitor journey** — Where will visitors come from? Where should they go next? Add appropriate CTAs.

4. **Set SEO information** — Fill in the SEO title and description for each page to help search engines understand your content.

---

## Best Practices

### Content Guidelines

**Headlines**
- Keep them short and clear (under 10 words)
- Use action words when appropriate
- Make them specific, not generic

**Body Text**
- Write for scanning (short paragraphs, bullet points)
- Put the most important information first
- Use simple, everyday language

**Images**
- Use high-quality photos (at least 1200px wide for full-width images)
- Optimize file sizes for fast loading
- Always include alt text for accessibility

### Page Structure

**Above the Fold**
The content visitors see before scrolling is crucial. Include:
- A clear headline explaining what the page is about
- A compelling image or visual
- A clear next step (button or link)

**Content Flow**
Organize content in a logical order:
1. Hook (grab attention)
2. Value (explain the benefit)
3. Proof (show evidence/testimonials)
4. Action (tell them what to do next)

**Mobile Considerations**
- All templates are mobile-responsive by default
- Preview your pages on mobile before publishing
- Keep touch targets (buttons) large enough to tap easily

### Performance Tips

- Compress images before uploading
- Don't overload pages with too many blocks
- Use video sparingly—it slows page loading
- Remove unused blocks rather than hiding them

---

## Troubleshooting

### Common Issues

**"This page has no content yet"**
- Make sure you've added blocks to the page
- Check that blocks are saved properly
- Verify the page is published

**Page not appearing in navigation**
- Ensure the page is published
- Check that the page title and slug are set correctly
- The navigation updates automatically for published pages

**Images not displaying**
- Verify the image was uploaded successfully
- Check that the image URL is correct
- Try re-uploading the image

**Changes not showing on the live site**
- Make sure you saved your changes
- Clear your browser cache
- Wait a moment and refresh the page

**Blocks appearing in wrong order**
- Check the display order numbers
- Drag blocks to reorder them (if drag-and-drop is enabled)
- Save the page after reordering

### Getting Help

If you encounter issues not covered here:

1. Check that your browser is up to date
2. Try a different browser to rule out browser-specific issues
3. Clear your browser cache and cookies
4. Contact support with:
   - The page URL where the issue occurs
   - What you expected to happen
   - What actually happened
   - Screenshots if possible

---

## Quick Reference

### Block Type Summary

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

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | Ctrl/Cmd + S |
| Undo | Ctrl/Cmd + Z |
| Redo | Ctrl/Cmd + Shift + Z |
| Preview | Ctrl/Cmd + P |

---

*Last updated: January 2026*
