# Hood Family Farms - Site Content Decomposition
## Mapping to Farm Fresh Theme Template

This document extracts all content from the current `site_website_ecommerce` React application
and maps it to the Farm Fresh theme's section structure for use in Site Settings → Site Builder.

---

## SITE-WIDE SETTINGS (tenant_site_settings)

```json
{
  "site_name": "Hood Family Farms",
  "tagline": "Regenerative farming in East Texas",
  "logo_url": null,
  "favicon_url": null,
  "color_overrides": {
    "primary": "#4a6741",
    "secondary": "#8b7355",
    "accent": "#d4a574",
    "background": "#fdfbf7"
  },
  "contact_info": {
    "phone": "",
    "email": "sara@hoodfamilyfarms.com",
    "address": "3950 County Road 3802, Bullard, TX 75757"
  },
  "social_links": {
    "facebook": "https://www.facebook.com/hoodfamilyfarms",
    "instagram": "https://www.instagram.com/hoodfamilyfarms/"
  },
  "business_hours": [
    {"day": "Delivery - Bullard", "hours": "Fridays"},
    {"day": "Delivery - Tyler", "hours": "Saturdays"},
    {"day": "Delivery - Dallas", "hours": "By appointment"},
    {"day": "Delivery - Houston", "hours": "By appointment"}
  ],
  "default_seo_title": "Hood Family Farms | Regenerative Farming in East Texas",
  "default_seo_description": "We're a small East Texas regenerative farming operation raising pastured poultry and eggs plus grass-fed sheep and cattle with the goal of providing the healthiest, highest quality product to our local community."
}
```

---

## IMAGE ASSETS

### Hero/Banner Images
| Image | URL | Used On |
|-------|-----|---------|
| Chickens in Pasture | `https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/73db0cf1-b04f-443d-b391-666c7fed9cc6/3+copy.jpg` | Home Hero |
| Farm Sunset | `https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555900163717-AYN5T9AUW61HX4WYDX8K/wide+shot+sunset.jpg` | About Hero, Gallery |
| Cows Grazing | `https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555901227734-ORPBLUM5NXSYF9BHG2DV/lazy+cows.jpg` | FAQ Hero |

### Content Images
| Image | URL | Used On |
|-------|-----|---------|
| Cow at Sunset (Yoda) | `https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/920bc2fc-bb1c-4069-99bc-335475e74cba/Yoda+at+sunset.jpg` | Home Mission Section |
| Farm Morning Mist | `https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1577170369127-IBXEQUXW5SK5ZLQULDAG/farm+mist+jpg.jpg` | Home Welcome Section |
| Instagram/Catering | `https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1716822411813-V6HY1XQEI0JVL1SONZ5G/image-asset.jpeg` | Home Instagram |

### Food Trailer Images
| Image | URL |
|-------|-----|
| Farm to Fork Logo | `https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/7aa38ec7-bf17-43f2-90dd-867b4e81e2f9/Farm+to+Fork+Food+TREE+logo+green.png` |
| Trailer Photo 1 | `https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197280315-XR0BSJJC51JDAZ5LJ40Q/022824-HOOD+2.jpg` |
| Trailer Photo 2 | `https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816671281-6HRSD5C7D5KKAQ6Y7TQF/20240323_112219.jpeg` |
| Trailer Photo 3 | `https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816670429-Q286VIVUPWNOQ9HQBEQK/20240323_113439.jpeg` |
| Trailer Photo 4 | `https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816675016-4KI49TCSYD4Y1AL9MZDU/IMG_1739.jpeg` |
| Trailer Photo 5 | `https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197283561-G1ZM48P91C7RVL23M2ZX/022824-HOOD+6.jpg` |
| Trailer Photo 6 | `https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197286322-TF0ZRM4RA3NBSIX6BLNA/022824-HOOD+12.jpg` |

---

## PAGE: HOME (/)

### Section: hero
```json
{
  "headline": "",
  "subheadline": "",
  "backgroundImage": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/73db0cf1-b04f-443d-b391-666c7fed9cc6/3+copy.jpg",
  "buttonText": "Shop Now",
  "buttonLink": "/shopping",
  "secondaryButtonText": "Learn More",
  "secondaryButtonLink": "/frequently-asked-questions",
  "overlayOpacity": 0.3,
  "alignment": "center"
}
```

### Section: about_preview (Mission - "Crowdfund with your Favorite Farm")
```json
{
  "title": "Crowdfund with your Favorite Farm",
  "content": "Our mission is to raise food to the highest standards for our local community. This means we treat our animals humanely. They graze on grass free of pesticides and herbicides as nature intended, and the way the animals rotate across the pastures is designed to add back important nutrients and microbes to support soil health and carbon sequestration.\n\n**Simply put: healthier soil = healthier forage for animals = healthier animals = healthier food for people = healthier people.**\n\nWe are passionate about delicious quality food, the environment, and educating those around us on building a healthier more sustainable food system.\n\nIn order to continue to support our mission, we have to scale up to keep costs down. We've identified multiple ways to increase revenues so that we can make this happen including adding overnight farm stays on Airbnb and offering freshly prepared farm foods for sale in a mobile food trailer.",
  "image": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/920bc2fc-bb1c-4069-99bc-335475e74cba/Yoda+at+sunset.jpg",
  "imagePosition": "left",
  "buttonText": "",
  "buttonLink": ""
}
```

### Section: about_preview (Welcome - second instance)
```json
{
  "title": "Welcome to the Farm!",
  "content": "We're a small East Texas regenerative farming operation raising pastured poultry and eggs plus grass-fed sheep and cattle on a rotational grazing system plus a chemical free garden with the goal of providing the healthiest, highest quality product to our local community and improving the environment while we do it.\n\nFollow along with us on our journey, we can promise, it'll be a wild ride!",
  "image": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1577170369127-IBXEQUXW5SK5ZLQULDAG/farm+mist+jpg.jpg",
  "imagePosition": "right",
  "buttonText": "",
  "buttonLink": ""
}
```

### Section: cta (Regenerative)
```json
{
  "headline": "Going beyond sustainability and supporting a regenerative way of life.",
  "subheadline": "Hood Family Farms operates under the principles of regenerative farming. This means that we use animal impact to improve soil quality and sequester carbon… pretty awesome, right?!",
  "buttonText": "Our Story",
  "buttonLink": "/story",
  "backgroundColor": "#4a6741"
}
```

### Section: newsletter (Instagram CTA)
```json
{
  "title": "Follow Our Journey",
  "description": "Stay connected with us on social media for daily updates from the farm",
  "buttonText": "Follow @hoodfamilyfarms",
  "buttonLink": "https://www.instagram.com/hoodfamilyfarms/"
}
```

---

## PAGE: OUR STORY (/story)

### Section: hero
```json
{
  "title": "Our Story",
  "subtitle": "",
  "backgroundImage": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555900163717-AYN5T9AUW61HX4WYDX8K/wide+shot+sunset.jpg"
}
```

### Section: story
```json
{
  "title": "Welcome to Hood Family Farms",
  "content": "We're a small East Texas regenerative farming operation raising pastured poultry and eggs plus grass-fed sheep and cattle on a rotational grazing system plus a chemical free garden with the goal of providing the healthiest, highest quality product to our local community and improving the environment while we do it.",
  "image": null,
  "imagePosition": "right"
}
```

### Section: values (as content blocks)
```json
{
  "title": "Our Values",
  "values": [
    {
      "icon": "heart",
      "title": "Our Mission",
      "description": "Our mission is to raise food to the highest standards for our local community. This means we treat our animals humanely. They graze on grass free of pesticides and herbicides as nature intended, and the way the animals rotate across the pastures is designed to add back important nutrients and microbes to support soil health and carbon sequestration."
    },
    {
      "icon": "leaf",
      "title": "Regenerative Practices",
      "description": "Hood Family Farms operates under the principles of regenerative farming. This means that we use animal impact to improve soil quality and sequester carbon. Regenerative Agriculture is in essence food production in a manner that cares for the animals, improves soil quality over time, and is profitable."
    },
    {
      "icon": "eye",
      "title": "Our Vision",
      "description": "We are passionate about delicious quality food, the environment, and educating those around us on building a healthier more sustainable food system. We believe that something can be both a healthy food staple and beautiful."
    }
  ]
}
```

### Key Quote (for blockquote styling)
> "Simply put: healthier soil = healthier forage for animals = healthier animals = healthier food for people = healthier people."

### Closing Text
> "Follow along with us on our journey, we can promise, it'll be a wild ride!"

---

## PAGE: CONTACT (/contact)

### Section: hero
```json
{
  "title": "Contact Us",
  "subtitle": "We'd love to hear from you!"
}
```

### Section: contact_info
```json
{
  "showPhone": false,
  "showEmail": true,
  "showAddress": true,
  "showHours": true,
  "customContent": {
    "address": {
      "label": "Address",
      "value": "3950 County Road 3802\nBullard, TX 75757"
    },
    "email": {
      "label": "Email",
      "value": "sara@hoodfamilyfarms.com"
    },
    "deliverySchedule": {
      "label": "Delivery Schedule",
      "items": [
        "Bullard: Fridays",
        "Tyler: Saturdays",
        "Dallas: By appointment",
        "Houston: By appointment"
      ]
    }
  }
}
```

### Section: contact_form
```json
{
  "title": "Send a Message",
  "description": "Have questions about our products, delivery, or farm membership? We're here to help!",
  "recipientEmail": "sara@hoodfamilyfarms.com",
  "showPhone": false,
  "showSubject": true,
  "subjectOptions": [
    "Product Questions",
    "Delivery Inquiries",
    "Farm Membership",
    "Food Trailer / Catering",
    "Farm Visits",
    "Other"
  ],
  "fields": [
    {"name": "firstName", "label": "First Name", "type": "text", "required": true},
    {"name": "lastName", "label": "Last Name", "type": "text", "required": true},
    {"name": "email", "label": "Email", "type": "email", "required": true},
    {"name": "subject", "label": "Subject", "type": "select", "required": false},
    {"name": "message", "label": "Message", "type": "textarea", "required": true}
  ],
  "submitButtonText": "Send Message",
  "successMessage": "Thank you! Your message has been sent. We'll get back to you soon!"
}
```

### Section: map
```json
{
  "showMap": false,
  "mapHeight": 400
}
```

### Social Links
```json
{
  "instagram": "https://www.instagram.com/hoodfamilyfarms/",
  "facebook": "https://www.facebook.com/hoodfamilyfarms"
}
```

---

## PAGE: FAQ (/frequently-asked-questions)

### Section: hero
```json
{
  "title": "Frequently Asked Questions",
  "subtitle": "",
  "backgroundImage": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555901227734-ORPBLUM5NXSYF9BHG2DV/lazy+cows.jpg"
}
```

### Section: faq_list
```json
{
  "items": [
    {
      "question": "How will I receive my products?",
      "answer": "We offer regular deliveries in Bullard every Friday, Tyler every Saturday, and Dallas/Houston alternating Wednesdays. Our delivery zones are within 20 miles of Bullard/Tyler/Dallas proper, and for Houston within 20 miles of The Woodlands Mall.\n\nIf you live inside these areas we will drop off to your front door (don't worry if you're not home, just leave a cooler out and we'll pop your items inside for safe keeping). If you live outside of the delivery zone, we are happy to work out a location to meet you, just ask! Very often people live in suburbs we drive through anyway to get to our delivery zone!\n\nYou can place your order any time you like, and it will be delivered on our next scheduled delivery date. We'll shoot you a text message the day prior to remind you that we're coming."
    },
    {
      "question": "Can I get my products shipped?",
      "answer": "All of our meats are processed in USDA inspected facilities, and thus available to ship nationwide. We ship exclusively to customers who have our farm membership.\n\nWe have worked out a shipping system mostly free of single use packaging. Your farm membership is essentially an annual deposit for the continued use of the insulated shipping totes (so rather than having the cost of shipping materials added in to the price of each item, it is an optional add on for those who choose to use this service), that also comes with additional perks like early access to our new harvest quantities, subscription services and more.\n\nThe shipping totes are packed with a return label that you can easily slap on and send back to us for the next shipment - no wasted cardboard, styrofoam or ice packs.\n\nUnfortunately TX cottage food laws prohibit us from shipping baked goods, pickles, or jams (basically any food item prepared in our home kitchen). In the spirit of our supporting our local communities rather than trying to be a multi-state operation, we prefer to do deliveries."
    },
    {
      "question": "Why do your chickens lay different colored eggs?",
      "answer": "Different breeds lay different colors, shapes (some are more round, others more conical), and sizes.\n\nWe believe that something can be both a healthy food staple and beautiful, so the more variety the better! All of the edible egg parts look the same once they're cracked and in your frying pan!"
    }
  ]
}
```

### Section: Glossary (custom content block)
```json
{
  "title": "Glossary",
  "terms": [
    {
      "term": "Continuous grazing",
      "definition": "A grazing system in which livestock are turned into a pasture or grassland and left for an extended period of time. It is characterized by low stocking densities, selective grazing, and no specific rest period for forage recovery."
    },
    {
      "term": "Non-selective rotational grazing",
      "definition": "A grazing system in which livestock are held on restricted areas of forage at high stocking densities. It is characterized by sub-day livestock movements to new grazing areas, near total forage removal, and longer rest periods for forage recovery. Sometimes called mob grazing."
    },
    {
      "term": "Regenerative farming/ranching",
      "definition": "Regenerative Agriculture is in essence food production in a manner that cares for the animals, improves soil quality over time, and is profitable. It is a system of farming and ranching principles and practices that increases biodiversity, enriches soils, improves watersheds, and enhances ecosystem services."
    },
    {
      "term": "Selective rotational grazing",
      "definition": "A grazing system in which livestock are held on restricted areas of forage. It is characterized by multi-day livestock movements to new grazing areas, 1/3 to 1/2 forage removal, and rest periods for forage recovery."
    },
    {
      "term": "Stocking rate",
      "definition": "The number of livestock per unit area. Livestock counts are usually normalized to 'animal units' (AU). This term is usually associated with continuous grazing."
    },
    {
      "term": "Stocking density",
      "definition": "The weight of livestock per unit area. Occasionally expressed as number of animals per unit area. This term is usually associated with non-selective or mob grazing systems."
    }
  ]
}
```

### Section: Links (Educational Resources)
Note: The FAQ page has an extensive links section with categories. This would be a custom content block or separate page.

```json
{
  "categories": [
    {
      "title": "Movies and Books",
      "links": [
        {"title": "Kiss the Ground", "type": "film", "url": "https://kissthegroundmovie.com/"},
        {"title": "Sacred Cow", "type": "book", "url": "https://www.sacredcow.info/book"},
        {"title": "Sacred Cow", "type": "film", "url": "https://www.sacredcow.info/film"},
        {"title": "Carbon Cowboys", "type": "film series", "url": "https://carboncowboys.org/"},
        {"title": "Biggest Little Farm", "type": "film", "url": "https://www.biggestlittlefarmmovie.com/"}
      ]
    },
    {
      "title": "Regenerative Ranching",
      "links": [
        {"title": "Allan Savory on Reversing Desertification", "url": "https://www.ted.com/talks/allan_savory_how_to_fight_desertification_and_reverse_climate_change"}
      ]
    },
    {
      "title": "Commercial Success Stories",
      "links": [
        {"title": "Polyface Farms", "url": "https://www.polyfacefarms.com/"},
        {"title": "White Oak Pastures", "url": "https://whiteoakpastures.com/"},
        {"title": "Seven Sons", "url": "https://sevensons.net/"}
      ]
    }
  ]
}
```

### Section: contact_cta
```json
{
  "title": "Still have questions?",
  "description": "We're happy to help! Reach out and we'll get back to you as soon as we can.",
  "buttonText": "Contact Us",
  "buttonLink": "/contact"
}
```

---

## PAGE: GALLERY (/gallery)

### Section: hero
```json
{
  "title": "Gallery",
  "subtitle": "Photos from around the farm"
}
```

### Section: gallery (custom)
```json
{
  "layout": "masonry",
  "images": [
    {
      "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555900163717-AYN5T9AUW61HX4WYDX8K/wide+shot+sunset.jpg",
      "alt": "Farm sunset view"
    },
    {
      "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/920bc2fc-bb1c-4069-99bc-335475e74cba/Yoda+at+sunset.jpg",
      "alt": "Cow at sunset"
    },
    {
      "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1577170369127-IBXEQUXW5SK5ZLQULDAG/farm+mist+jpg.jpg",
      "alt": "Farm in morning mist"
    },
    {
      "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/73db0cf1-b04f-443d-b391-666c7fed9cc6/3+copy.jpg",
      "alt": "Chickens in pasture"
    },
    {
      "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197280315-XR0BSJJC51JDAZ5LJ40Q/022824-HOOD+2.jpg",
      "alt": "Food trailer"
    },
    {
      "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197283561-G1ZM48P91C7RVL23M2ZX/022824-HOOD+6.jpg",
      "alt": "Farm food preparation"
    }
  ]
}
```

---

## PAGE: FOOD TRAILER (/food-trailer)

### Section: hero (Logo display)
```json
{
  "title": "",
  "subtitle": "",
  "logoImage": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/7aa38ec7-bf17-43f2-90dd-867b4e81e2f9/Farm+to+Fork+Food+TREE+logo+green.png",
  "backgroundColor": "#fdfbf7"
}
```

### Section: gallery (Food Trailer Photos)
```json
{
  "layout": "grid",
  "columns": 3,
  "images": [
    {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197280315-XR0BSJJC51JDAZ5LJ40Q/022824-HOOD+2.jpg", "alt": "Food trailer"},
    {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816671281-6HRSD5C7D5KKAQ6Y7TQF/20240323_112219.jpeg", "alt": "Food preparation"},
    {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816670429-Q286VIVUPWNOQ9HQBEQK/20240323_113439.jpeg", "alt": "Food trailer service"},
    {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816675016-4KI49TCSYD4Y1AL9MZDU/IMG_1739.jpeg", "alt": "Food trailer menu"},
    {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197283561-G1ZM48P91C7RVL23M2ZX/022824-HOOD+6.jpg", "alt": "Farm fresh food"},
    {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197286322-TF0ZRM4RA3NBSIX6BLNA/022824-HOOD+12.jpg", "alt": "Food trailer event"}
  ]
}
```

### Section: about_preview
```json
{
  "title": "Farm to Fork Food",
  "content": "This trailer is an extension of our Farm's mission to strengthen our local food system and provide delicious and clean food to our community. Many of the images above were taken by the uber talented Les Hassell for ETX View Magazine. They did a beautiful write up on the farm to fork food trailer launch.\n\nBe sure to follow us on Facebook or Instagram to keep up with our current menu offerings and set up locations. We rotate our menu based on the seasons and local availability!",
  "externalLink": {
    "text": "Read the Full Article",
    "url": "https://www.etxview.com/food/bullard-couple-brings-farm-fresh-food-to-streets-of-east-texas/article_b8739dd6-d4f4-11ee-b723-675928041599.html"
  }
}
```

### Section: cta (Action Buttons)
```json
{
  "headline": "Ready to book us for your event?",
  "subheadline": "We cater weddings, corporate events, farmers markets, and more!",
  "buttons": [
    {"text": "View Current Menu", "link": "/menu", "style": "primary"},
    {"text": "Browse Items for Your Event", "link": "#items", "style": "secondary"},
    {"text": "Event Inquiry", "link": "/contact", "style": "outline"}
  ]
}
```

### Section: events (Dynamic from database)
```json
{
  "title": "Upcoming Events",
  "emptyMessage": "No upcoming events scheduled. Check back soon!",
  "showMenuLink": true,
  "dataSource": "api/events/upcoming"
}
```

---

## ADDITIONAL PAGES (Functional - Not Content Pages)

These pages are functional ecommerce pages that don't need Site Builder content:

| Page | Path | Notes |
|------|------|-------|
| Shop | /shopping | Product listing from database |
| Product Detail | /product/:id | Dynamic product page |
| Cart | /cart | Shopping cart |
| Checkout | /checkout | Checkout flow |
| Order Confirmation | /order-confirmation | Post-purchase |
| Menu | /menu | Food trailer menu from database |
| Blog | /blog | Blog listing from database |
| Blog Post | /blog/:slug | Individual blog post |
| Login | /login | Authentication |

---

## SUMMARY

### Pages Needing Site Builder Content:
1. **Home** - 5 sections (hero, mission, welcome, CTA, newsletter)
2. **Our Story** - 3 sections (hero, story, values)
3. **Contact** - 4 sections (hero, contact_info, form, social)
4. **FAQ** - 4 sections (hero, faq_list, glossary, contact_cta)
5. **Gallery** - 2 sections (hero, gallery)
6. **Food Trailer** - 5 sections (hero/logo, gallery, about, cta, events)

### Total Content Blocks: ~23 sections across 6 pages

### Images to Migrate: 13 unique images (currently on Squarespace CDN)

### Recommended Next Steps:
1. Upload images to Media Library
2. Update image URLs in content
3. Configure Site Settings with theme and contact info
4. Use Site Builder to create/edit pages with the extracted content
