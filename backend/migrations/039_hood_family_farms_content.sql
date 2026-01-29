-- Hood Family Farms Content Migration
-- Migration: 039_hood_family_farms_content.sql
-- Populates site content for Hood Family Farms tenant (e25602ab-7869-4f28-81d5-d6a78a6f1be1)
-- Content decomposed from hardcoded React components

-- ============================================================================
-- TENANT SITE SETTINGS
-- ============================================================================
INSERT INTO tenant_site_settings (
    tenant_id,
    theme_id,
    site_name,
    tagline,
    logo_url,
    favicon_url,
    color_overrides,
    font_overrides,
    contact_info,
    social_links,
    business_hours,
    default_seo_title,
    default_seo_description
) VALUES (
    'e25602ab-7869-4f28-81d5-d6a78a6f1be1',
    'a0000000-0000-0000-0000-000000000001', -- Farm Fresh theme
    'Hood Family Farms',
    'Bringing clean, fresh, sustainably raised food to our local community',
    NULL, -- Logo URL (can be set later via media upload)
    NULL, -- Favicon URL
    '{}', -- Use default Farm Fresh colors
    '{}', -- Use default Farm Fresh fonts
    '{
        "phone": "",
        "email": "sara@hoodfamilyfarms.com",
        "address": "3950 County Road 3802, Bullard, TX 75757"
    }',
    '{
        "facebook": "https://www.facebook.com/hoodfamilyfarms/",
        "instagram": "https://www.instagram.com/hoodfamilyfarms/",
        "twitter": "",
        "linkedin": ""
    }',
    '[
        {"day": "Delivery - Bullard", "hours": "Fridays"},
        {"day": "Delivery - Tyler", "hours": "Saturdays"},
        {"day": "Delivery - Dallas", "hours": "By appointment"},
        {"day": "Delivery - Houston", "hours": "By appointment"}
    ]',
    'Hood Family Farms | Regenerative Farming in East Texas',
    'We''re a small East Texas regenerative farming operation raising pastured poultry, eggs, grass-fed sheep and cattle.'
)
ON CONFLICT (tenant_id) DO UPDATE SET
    theme_id = EXCLUDED.theme_id,
    site_name = EXCLUDED.site_name,
    tagline = EXCLUDED.tagline,
    contact_info = EXCLUDED.contact_info,
    social_links = EXCLUDED.social_links,
    business_hours = EXCLUDED.business_hours,
    default_seo_title = EXCLUDED.default_seo_title,
    default_seo_description = EXCLUDED.default_seo_description,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- DELETE EXISTING PAGES FOR THIS TENANT (to ensure clean insert with known IDs)
-- Must delete blocks first due to foreign key constraint
-- ============================================================================
DELETE FROM page_blocks WHERE page_id IN (
    SELECT id FROM site_pages WHERE tenant_id = 'e25602ab-7869-4f28-81d5-d6a78a6f1be1'
);

DELETE FROM site_pages WHERE tenant_id = 'e25602ab-7869-4f28-81d5-d6a78a6f1be1';

-- ============================================================================
-- SITE PAGES
-- ============================================================================

-- Home Page
INSERT INTO site_pages (
    id, tenant_id, page_type, title, slug, is_system_page, is_published, published_at,
    seo_title, seo_description, template_id, is_homepage
) VALUES (
    'b0000001-0000-0000-0000-000000000001',
    'e25602ab-7869-4f28-81d5-d6a78a6f1be1',
    'home',
    'Home',
    '',
    true,
    true,
    CURRENT_TIMESTAMP,
    'Hood Family Farms | Regenerative Farming in East Texas',
    'We''re a small East Texas regenerative farming operation raising pastured poultry, eggs, grass-fed sheep and cattle.',
    'a0000000-0000-0000-0000-000000000002', -- Landing Page template
    true
);

-- Our Story Page
INSERT INTO site_pages (
    id, tenant_id, page_type, title, slug, is_system_page, is_published, published_at,
    seo_title, seo_description, template_id
) VALUES (
    'b0000001-0000-0000-0000-000000000002',
    'e25602ab-7869-4f28-81d5-d6a78a6f1be1',
    'about',
    'Our Story',
    'story',
    false,
    true,
    CURRENT_TIMESTAMP,
    'Our Story | Hood Family Farms',
    'Learn about our mission to raise food to the highest standards through regenerative farming practices.',
    'a0000000-0000-0000-0000-000000000003' -- About Page template
);

-- Contact Page
INSERT INTO site_pages (
    id, tenant_id, page_type, title, slug, is_system_page, is_published, published_at,
    seo_title, seo_description, template_id
) VALUES (
    'b0000001-0000-0000-0000-000000000003',
    'e25602ab-7869-4f28-81d5-d6a78a6f1be1',
    'contact',
    'Contact Us',
    'contact',
    false,
    true,
    CURRENT_TIMESTAMP,
    'Contact Us | Hood Family Farms',
    'Get in touch with Hood Family Farms. We deliver to Bullard, Tyler, Dallas, and Houston.',
    'a0000000-0000-0000-0000-000000000004' -- Contact Page template
);

-- FAQ Page
INSERT INTO site_pages (
    id, tenant_id, page_type, title, slug, is_system_page, is_published, published_at,
    seo_title, seo_description, template_id
) VALUES (
    'b0000001-0000-0000-0000-000000000004',
    'e25602ab-7869-4f28-81d5-d6a78a6f1be1',
    'faq',
    'Frequently Asked Questions',
    'frequently-asked-questions',
    false,
    true,
    CURRENT_TIMESTAMP,
    'FAQ | Hood Family Farms',
    'Answers to common questions about our products, delivery, and regenerative farming practices.',
    'a0000000-0000-0000-0000-000000000001' -- Standard Page template
);

-- Gallery Page
INSERT INTO site_pages (
    id, tenant_id, page_type, title, slug, is_system_page, is_published, published_at,
    seo_title, seo_description, template_id
) VALUES (
    'b0000001-0000-0000-0000-000000000005',
    'e25602ab-7869-4f28-81d5-d6a78a6f1be1',
    'custom',
    'Gallery',
    'gallery',
    false,
    true,
    CURRENT_TIMESTAMP,
    'Gallery | Hood Family Farms',
    'Photos from around the farm - see our pastures, animals, and regenerative farming in action.',
    'a0000000-0000-0000-0000-000000000001' -- Standard Page template
);

-- Food Trailer Page
INSERT INTO site_pages (
    id, tenant_id, page_type, title, slug, is_system_page, is_published, published_at,
    seo_title, seo_description, template_id
) VALUES (
    'b0000001-0000-0000-0000-000000000006',
    'e25602ab-7869-4f28-81d5-d6a78a6f1be1',
    'custom',
    'Farm to Fork Food Trailer',
    'food-trailer',
    false,
    true,
    CURRENT_TIMESTAMP,
    'Farm to Fork Food Trailer | Hood Family Farms',
    'Our mobile food trailer brings farm-fresh prepared foods to East Texas events and markets.',
    'a0000000-0000-0000-0000-000000000001' -- Standard Page template
);

-- ============================================================================
-- DELETE EXISTING BLOCKS FOR THESE PAGES (to allow re-running)
-- ============================================================================
DELETE FROM page_blocks WHERE page_id IN (
    'b0000001-0000-0000-0000-000000000001',
    'b0000001-0000-0000-0000-000000000002',
    'b0000001-0000-0000-0000-000000000003',
    'b0000001-0000-0000-0000-000000000004',
    'b0000001-0000-0000-0000-000000000005',
    'b0000001-0000-0000-0000-000000000006'
);

-- ============================================================================
-- HOME PAGE BLOCKS
-- ============================================================================

-- Block 1: Hero Banner
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000001',
    'hero',
    'hero',
    1,
    '{
        "headline": "",
        "subheadline": "",
        "backgroundImage": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/73db0cf1-b04f-443d-b391-666c7fed9cc6/3+copy.jpg",
        "overlayOpacity": 0.3,
        "alignment": "center",
        "minHeight": "80vh",
        "primaryButton": {
            "text": "Shop Now",
            "link": "/shopping",
            "style": "solid"
        },
        "secondaryButton": {
            "text": "Learn More",
            "link": "/frequently-asked-questions",
            "style": "outline"
        }
    }',
    '{}'
);

-- Block 2: Mission Section (Two Column)
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000001',
    'content',
    'two-column',
    2,
    '{
        "title": "Crowdfund with your Favorite Farm",
        "leftImage": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/920bc2fc-bb1c-4069-99bc-335475e74cba/Yoda+at+sunset.jpg",
        "rightContent": "<p>Our mission is to raise food to the highest standards for our local community. This means we treat our animals humanely. They graze on grass free of pesticides and herbicides as nature intended, and the way the animals rotate across the pastures is designed to add back important nutrients and microbes to support soil health and carbon sequestration.</p><p><strong>Simply put: healthier soil = healthier forage for animals = healthier animals = healthier food for people = healthier people.</strong></p><p>We are passionate about delicious quality food, the environment, and educating those around us on building a healthier more sustainable food system.</p><p>In order to continue to support our mission, we have to scale up to keep costs down. We''ve identified multiple ways to increase revenues so that we can make this happen including adding overnight farm stays on Airbnb and offering freshly prepared farm foods for sale in a mobile food trailer.</p>",
        "imagePosition": "left",
        "splitRatio": "50-50",
        "verticalAlign": "center"
    }',
    '{"padding": "large"}'
);

-- Block 3: Welcome Section (Two Column with Image on Top)
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000001',
    'content',
    'two-column',
    3,
    '{
        "title": "Welcome to the Farm!",
        "leftImage": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1577170369127-IBXEQUXW5SK5ZLQULDAG/farm+mist+jpg.jpg",
        "rightContent": "<p>We''re a small East Texas regenerative farming operation raising pastured poultry and eggs plus grass-fed sheep and cattle on a rotational grazing system plus a chemical free garden with the goal of providing the healthiest, highest quality product to our local community and improving the environment while we do it.</p><p>Follow along with us on our journey, we can promise, it''ll be a wild ride!</p>",
        "imagePosition": "left",
        "splitRatio": "50-50",
        "verticalAlign": "center"
    }',
    '{"backgroundColor": "#f5f1eb", "padding": "large"}'
);

-- Block 4: Gallery Preview CTA
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000001',
    'content',
    'cta',
    4,
    '{
        "headline": "Gallery",
        "subheadline": "Photos from around the farm",
        "buttonText": "View Gallery",
        "buttonLink": "/gallery",
        "backgroundImage": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555900163717-AYN5T9AUW61HX4WYDX8K/wide+shot+sunset.jpg",
        "alignment": "center",
        "padding": "large"
    }',
    '{}'
);

-- Block 5: Regenerative Section CTA
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000001',
    'content',
    'cta',
    5,
    '{
        "headline": "Going beyond sustainability and supporting a regenerative way of life.",
        "subheadline": "Hood Family Farms operates under the principles of regenerative farming. This means that we use animal impact to improve soil quality and sequester carbon… pretty awesome, right?!",
        "buttonText": "Our Story",
        "buttonLink": "/story",
        "backgroundColor": "#4a6741",
        "alignment": "center",
        "padding": "large"
    }',
    '{"textColor": "#ffffff"}'
);

-- Block 6: Instagram/Social Section
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000001',
    'content',
    'two-column',
    6,
    '{
        "title": "Follow Our Journey",
        "leftContent": "<p>Stay connected with us on social media for daily updates from the farm</p>",
        "rightImage": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1716822411813-V6HY1XQEI0JVL1SONZ5G/image-asset.jpeg",
        "imagePosition": "right",
        "splitRatio": "40-60",
        "verticalAlign": "center",
        "primaryButton": {
            "text": "Follow @hoodfamilyfarms",
            "link": "https://www.instagram.com/hoodfamilyfarms/",
            "style": "solid"
        }
    }',
    '{"padding": "large"}'
);

-- ============================================================================
-- OUR STORY PAGE BLOCKS
-- ============================================================================

-- Block 1: Hero
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000002',
    'hero',
    'hero',
    1,
    '{
        "headline": "Our Story",
        "subheadline": "",
        "backgroundImage": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555900163717-AYN5T9AUW61HX4WYDX8K/wide+shot+sunset.jpg",
        "overlayOpacity": 0.4,
        "alignment": "center",
        "minHeight": "50vh"
    }',
    '{}'
);

-- Block 2: Story Content
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000002',
    'content',
    'text',
    2,
    '{
        "title": "Welcome to Hood Family Farms",
        "content": "<p>We''re a small East Texas regenerative farming operation raising pastured poultry and eggs plus grass-fed sheep and cattle on a rotational grazing system plus a chemical free garden with the goal of providing the healthiest, highest quality product to our local community and improving the environment while we do it.</p><h3>Our Mission</h3><p>Our mission is to raise food to the highest standards for our local community. This means we treat our animals humanely. They graze on grass free of pesticides and herbicides as nature intended, and the way the animals rotate across the pastures is designed to add back important nutrients and microbes to support soil health and carbon sequestration.</p><blockquote>Simply put: healthier soil = healthier forage for animals = healthier animals = healthier food for people = healthier people.</blockquote><h3>Regenerative Practices</h3><p>Hood Family Farms operates under the principles of regenerative farming. This means that we use animal impact to improve soil quality and sequester carbon. Regenerative Agriculture is in essence food production in a manner that cares for the animals, improves soil quality over time, and is profitable.</p><p>It is a system of farming and ranching principles and practices that increases biodiversity, enriches soils, improves watersheds, and enhances ecosystem services. Regenerative Agriculture aims to capture carbon in soil and aboveground biomass, reversing current global trends of atmospheric accumulation.</p><h3>Our Vision</h3><p>We are passionate about delicious quality food, the environment, and educating those around us on building a healthier more sustainable food system. We believe that something can be both a healthy food staple and beautiful, and we''re committed to proving that sustainable farming is not just possible, but profitable and beneficial for everyone involved.</p><p><em>Follow along with us on our journey, we can promise, it''ll be a wild ride!</em></p>",
        "alignment": "left",
        "maxWidth": "800px"
    }',
    '{"padding": "large"}'
);

-- ============================================================================
-- CONTACT PAGE BLOCKS
-- ============================================================================

-- Block 1: Hero
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000003',
    'hero',
    'hero',
    1,
    '{
        "headline": "Contact Us",
        "subheadline": "We''d love to hear from you!",
        "overlayOpacity": 0,
        "alignment": "center",
        "minHeight": "30vh"
    }',
    '{"backgroundColor": "#f5f1eb"}'
);

-- Block 2: Contact Info
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000003',
    'content',
    'contact-info',
    2,
    '{
        "title": "Get in Touch",
        "showPhone": false,
        "showEmail": true,
        "showAddress": true,
        "showHours": true,
        "layout": "vertical",
        "customEmail": "sara@hoodfamilyfarms.com",
        "customAddress": "3950 County Road 3802, Bullard, TX 75757"
    }',
    '{"padding": "medium"}'
);

-- Block 3: Contact Form
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000003',
    'content',
    'form',
    3,
    '{
        "title": "Send a Message",
        "description": "Have questions about our products, delivery, or farm membership? We''re here to help!",
        "submitButtonText": "Send Message",
        "successMessage": "Thank you! Your message has been sent. We''ll get back to you soon!",
        "fields": [
            {"type": "text", "name": "firstName", "label": "First Name", "required": true},
            {"type": "text", "name": "lastName", "label": "Last Name", "required": true},
            {"type": "email", "name": "email", "label": "Email", "required": true},
            {"type": "select", "name": "subject", "label": "Subject", "required": false, "options": ["Product Questions", "Delivery Inquiries", "Farm Membership", "Food Trailer / Catering", "Farm Visits", "Other"]},
            {"type": "textarea", "name": "message", "label": "Message", "required": true}
        ]
    }',
    '{"padding": "large"}'
);

-- ============================================================================
-- FAQ PAGE BLOCKS
-- ============================================================================

-- Block 1: Hero
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000004',
    'hero',
    'hero',
    1,
    '{
        "headline": "Frequently Asked Questions",
        "subheadline": "",
        "backgroundImage": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555901227734-ORPBLUM5NXSYF9BHG2DV/lazy+cows.jpg",
        "overlayOpacity": 0.4,
        "alignment": "center",
        "minHeight": "50vh"
    }',
    '{}'
);

-- Block 2: FAQ Accordion
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000004',
    'content',
    'faq',
    2,
    '{
        "title": "",
        "allowMultiple": false,
        "style": "bordered",
        "items": [
            {
                "question": "How will I receive my products?",
                "answer": "<p>We offer regular deliveries in Bullard every Friday, Tyler every Saturday, and Dallas/Houston alternating Wednesdays. Our delivery zones are within 20 miles of Bullard/Tyler/Dallas proper, and for Houston within 20 miles of The Woodlands Mall.</p><p>If you live inside these areas we will drop off to your front door (don''t worry if you''re not home, just leave a cooler out and we''ll pop your items inside for safe keeping). If you live outside of the delivery zone, we are happy to work out a location to meet you, just ask! Very often people live in suburbs we drive through anyway to get to our delivery zone!</p><p>You can place your order any time you like, and it will be delivered on our next scheduled delivery date. We''ll shoot you a text message the day prior to remind you that we''re coming.</p>"
            },
            {
                "question": "Can I get my products shipped?",
                "answer": "<p>All of our meats are processed in USDA inspected facilities, and thus available to ship nationwide. We ship exclusively to customers who have our farm membership.</p><p>We have worked out a shipping system mostly free of single use packaging. Your farm membership is essentially an annual deposit for the continued use of the insulated shipping totes (so rather than having the cost of shipping materials added in to the price of each item, it is an optional add on for those who choose to use this service), that also comes with additional perks like early access to our new harvest quantities, subscription services and more.</p><p>The shipping totes are packed with a return label that you can easily slap on and send back to us for the next shipment - no wasted cardboard, styrofoam or ice packs.</p><p>Unfortunately TX cottage food laws prohibit us from shipping baked goods, pickles, or jams (basically any food item prepared in our home kitchen). In the spirit of our supporting our local communities rather than trying to be a multi-state operation, we prefer to do deliveries.</p>"
            },
            {
                "question": "Why do your chickens lay different colored eggs?",
                "answer": "<p>Different breeds lay different colors, shapes (some are more round, others more conical), and sizes.</p><p>We believe that something can be both a healthy food staple and beautiful, so the more variety the better! All of the edible egg parts look the same once they''re cracked and in your frying pan!</p>"
            }
        ]
    }',
    '{"padding": "large"}'
);

-- Block 3: Glossary Section
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000004',
    'content',
    'text',
    3,
    '{
        "title": "Glossary",
        "content": "<dl><dt><strong>Continuous grazing</strong></dt><dd>A grazing system in which livestock are turned into a pasture or grassland and left for an extended period of time. It is characterized by low stocking densities, selective grazing, and no specific rest period for forage recovery.</dd><dt><strong>Non-selective rotational grazing</strong></dt><dd>A grazing system in which livestock are held on restricted areas of forage at high stocking densities. It is characterized by sub-day livestock movements to new grazing areas, near total forage removal, and longer rest periods for forage recovery. Sometimes called mob grazing.</dd><dt><strong>Regenerative farming/ranching</strong></dt><dd>Regenerative Agriculture is in essence food production in a manner that cares for the animals, improves soil quality over time, and is profitable. It is a system of farming and ranching principles and practices that increases biodiversity, enriches soils, improves watersheds, and enhances ecosystem services.</dd><dt><strong>Selective rotational grazing</strong></dt><dd>A grazing system in which livestock are held on restricted areas of forage. It is characterized by multi-day livestock movements to new grazing areas, 1/3 to 1/2 forage removal, and rest periods for forage recovery.</dd><dt><strong>Stocking rate</strong></dt><dd>The number of livestock per unit area. Livestock counts are usually normalized to \"animal units\" (AU). This term is usually associated with continuous grazing.</dd><dt><strong>Stocking density</strong></dt><dd>The weight of livestock per unit area. Occasionally expressed as number of animals per unit area. This term is usually associated with non-selective or mob grazing systems.</dd></dl>",
        "alignment": "left",
        "maxWidth": "800px"
    }',
    '{"padding": "large"}'
);

-- ============================================================================
-- GALLERY PAGE BLOCKS
-- ============================================================================

-- Block 1: Hero
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000005',
    'hero',
    'hero',
    1,
    '{
        "headline": "Gallery",
        "subheadline": "Photos from around the farm",
        "overlayOpacity": 0,
        "alignment": "center",
        "minHeight": "25vh"
    }',
    '{"backgroundColor": "#f5f1eb"}'
);

-- Block 2: Gallery Grid
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000005',
    'content',
    'gallery',
    2,
    '{
        "title": "",
        "layout": "masonry",
        "columns": 3,
        "gap": "medium",
        "aspectRatio": "original",
        "images": [
            {
                "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555900163717-AYN5T9AUW61HX4WYDX8K/wide+shot+sunset.jpg",
                "alt": "Farm sunset view",
                "caption": ""
            },
            {
                "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/920bc2fc-bb1c-4069-99bc-335475e74cba/Yoda+at+sunset.jpg",
                "alt": "Cow at sunset",
                "caption": ""
            },
            {
                "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1577170369127-IBXEQUXW5SK5ZLQULDAG/farm+mist+jpg.jpg",
                "alt": "Farm in morning mist",
                "caption": ""
            },
            {
                "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/73db0cf1-b04f-443d-b391-666c7fed9cc6/3+copy.jpg",
                "alt": "Chickens in pasture",
                "caption": ""
            },
            {
                "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197280315-XR0BSJJC51JDAZ5LJ40Q/022824-HOOD+2.jpg",
                "alt": "Food trailer",
                "caption": ""
            },
            {
                "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197283561-G1ZM48P91C7RVL23M2ZX/022824-HOOD+6.jpg",
                "alt": "Farm food preparation",
                "caption": ""
            }
        ]
    }',
    '{"padding": "large"}'
);

-- ============================================================================
-- FOOD TRAILER PAGE BLOCKS
-- ============================================================================

-- Block 1: Logo/Hero Image
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000006',
    'hero',
    'image',
    1,
    '{
        "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/7aa38ec7-bf17-43f2-90dd-867b4e81e2f9/Farm+to+Fork+Food+TREE+logo+green.png",
        "alt": "Farm to Fork Food Logo",
        "size": "medium",
        "alignment": "center"
    }',
    '{"padding": "large", "backgroundColor": "#fdfbf7"}'
);

-- Block 2: Food Trailer Gallery
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000006',
    'content',
    'gallery',
    2,
    '{
        "title": "",
        "layout": "grid",
        "columns": 3,
        "gap": "small",
        "aspectRatio": "4:3",
        "images": [
            {
                "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197280315-XR0BSJJC51JDAZ5LJ40Q/022824-HOOD+2.jpg",
                "alt": "Food trailer exterior"
            },
            {
                "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816671281-6HRSD5C7D5KKAQ6Y7TQF/20240323_112219.jpeg",
                "alt": "Food preparation"
            },
            {
                "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816670429-Q286VIVUPWNOQ9HQBEQK/20240323_113439.jpeg",
                "alt": "Fresh ingredients"
            },
            {
                "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816675016-4KI49TCSYD4Y1AL9MZDU/IMG_1739.jpeg",
                "alt": "Cooking"
            },
            {
                "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197283561-G1ZM48P91C7RVL23M2ZX/022824-HOOD+6.jpg",
                "alt": "Prepared food"
            },
            {
                "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197286322-TF0ZRM4RA3NBSIX6BLNA/022824-HOOD+12.jpg",
                "alt": "Farm to Fork service"
            }
        ]
    }',
    '{"padding": "medium"}'
);

-- Block 3: About Section
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000006',
    'content',
    'text',
    3,
    '{
        "title": "Farm to Fork Food",
        "content": "<p>This trailer is an extension of our Farm''s mission to strengthen our local food system and provide delicious and clean food to our community. Many of the images above were taken by the uber talented Les Hassell for ETX View Magazine. They did a beautiful write up on the farm to fork food trailer launch.</p><p><a href=\"https://www.etxview.com/food/bullard-couple-brings-farm-fresh-food-to-streets-of-east-texas/article_b8739dd6-d4f4-11ee-b723-675928041599.html\" target=\"_blank\">Read the Full Article</a></p><p>Be sure to follow us on <a href=\"https://www.facebook.com/hoodfamilyfarms/\" target=\"_blank\">Facebook</a> or <a href=\"https://www.instagram.com/hoodfamilyfarms/\" target=\"_blank\">Instagram</a> to keep up with our current menu offerings and set up locations. We rotate our menu based on the seasons and local availability!</p>",
        "alignment": "center",
        "maxWidth": "800px"
    }',
    '{"padding": "large", "backgroundColor": "#f5f1eb"}'
);

-- Block 4: Action Buttons CTA
INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES (
    'b0000001-0000-0000-0000-000000000006',
    'content',
    'cta',
    4,
    '{
        "headline": "",
        "subheadline": "",
        "buttonText": "View Current Menu",
        "buttonLink": "/menu",
        "secondaryButtonText": "Event Inquiry",
        "secondaryButtonLink": "/contact",
        "alignment": "center",
        "padding": "medium"
    }',
    '{}'
);

-- ============================================================================
-- VERIFY INSERTION
-- ============================================================================
-- Run this query to verify:
-- SELECT p.title, p.slug, COUNT(pb.id) as block_count 
-- FROM site_pages p 
-- LEFT JOIN page_blocks pb ON p.id = pb.page_id 
-- WHERE p.tenant_id = 'e25602ab-7869-4f28-81d5-d6a78a6f1be1'
-- GROUP BY p.id, p.title, p.slug
-- ORDER BY p.title;
