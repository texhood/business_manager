-- Hood Family Farms Content Seed Data
-- Migration: 038_hood_family_farms_content_seed.sql
-- 
-- This migration seeds the site_pages and page_blocks tables with
-- content extracted from the existing Hood Family Farms ecommerce website.
-- 
-- NOTE: Run this AFTER creating a tenant and initializing pages via Site Settings.
-- This script updates existing pages with block content.

-- ============================================================================
-- TENANT SITE SETTINGS - Hood Family Farms
-- (Update if settings record already exists for the tenant)
-- ============================================================================

-- First, ensure we have the Farm Fresh theme ID
DO $$
DECLARE
    v_theme_id UUID;
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000001'; -- Replace with actual tenant ID
BEGIN
    -- Get Farm Fresh theme ID
    SELECT id INTO v_theme_id FROM site_themes WHERE slug = 'farm-fresh' LIMIT 1;
    
    -- Update or insert tenant settings
    INSERT INTO tenant_site_settings (
        tenant_id,
        theme_id,
        site_name,
        tagline,
        contact_info,
        social_links,
        default_seo_title,
        default_seo_description
    ) VALUES (
        v_tenant_id,
        v_theme_id,
        'Hood Family Farms',
        'Regenerative farming in East Texas',
        '{
            "phone": "",
            "email": "sara@hoodfamilyfarms.com",
            "address": "3950 County Road 3802, Bullard, TX 75757"
        }',
        '{
            "facebook": "https://www.facebook.com/hoodfamilyfarms",
            "instagram": "https://www.instagram.com/hoodfamilyfarms/"
        }',
        'Hood Family Farms | Regenerative Farming in East Texas',
        'We''re a small East Texas regenerative farming operation raising pastured poultry and eggs plus grass-fed sheep and cattle with the goal of providing the healthiest, highest quality product to our local community.'
    )
    ON CONFLICT (tenant_id) DO UPDATE SET
        theme_id = EXCLUDED.theme_id,
        site_name = EXCLUDED.site_name,
        tagline = EXCLUDED.tagline,
        contact_info = EXCLUDED.contact_info,
        social_links = EXCLUDED.social_links,
        default_seo_title = EXCLUDED.default_seo_title,
        default_seo_description = EXCLUDED.default_seo_description,
        updated_at = NOW();
END $$;

-- ============================================================================
-- HELPER: Content Data as JSON
-- This section documents all the content extracted from the website
-- ============================================================================

/*
=== IMAGES ===
Hero/Banner Images:
- https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/73db0cf1-b04f-443d-b391-666c7fed9cc6/3+copy.jpg (Chickens in pasture)
- https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555900163717-AYN5T9AUW61HX4WYDX8K/wide+shot+sunset.jpg (Farm sunset)
- https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555901227734-ORPBLUM5NXSYF9BHG2DV/lazy+cows.jpg (Cows grazing)

Content Images:
- https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/920bc2fc-bb1c-4069-99bc-335475e74cba/Yoda+at+sunset.jpg (Cow at sunset)
- https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1577170369127-IBXEQUXW5SK5ZLQULDAG/farm+mist+jpg.jpg (Farm in morning mist)
- https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1716822411813-V6HY1XQEI0JVL1SONZ5G/image-asset.jpeg (Instagram/Catering)

Food Trailer Images:
- https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/7aa38ec7-bf17-43f2-90dd-867b4e81e2f9/Farm+to+Fork+Food+TREE+logo+green.png (Logo)
- https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197280315-XR0BSJJC51JDAZ5LJ40Q/022824-HOOD+2.jpg
- https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816671281-6HRSD5C7D5KKAQ6Y7TQF/20240323_112219.jpeg
- https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816670429-Q286VIVUPWNOQ9HQBEQK/20240323_113439.jpeg
- https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816675016-4KI49TCSYD4Y1AL9MZDU/IMG_1739.jpeg
- https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197283561-G1ZM48P91C7RVL23M2ZX/022824-HOOD+6.jpg
- https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197286322-TF0ZRM4RA3NBSIX6BLNA/022824-HOOD+12.jpg

=== KEY TEXT CONTENT ===

Mission Statement:
"Our mission is to raise food to the highest standards for our local community. This means we treat our animals humanely. They graze on grass free of pesticides and herbicides as nature intended, and the way the animals rotate across the pastures is designed to add back important nutrients and microbes to support soil health and carbon sequestration."

Tagline/Quote:
"Simply put: healthier soil = healthier forage for animals = healthier animals = healthier food for people = healthier people."

Welcome Text:
"We're a small East Texas regenerative farming operation raising pastured poultry and eggs plus grass-fed sheep and cattle on a rotational grazing system plus a chemical free garden with the goal of providing the healthiest, highest quality product to our local community and improving the environment while we do it."

Regenerative Section:
"Going beyond sustainability and supporting a regenerative way of life. Hood Family Farms operates under the principles of regenerative farming. This means that we use animal impact to improve soil quality and sequester carbon… pretty awesome, right?!"

=== CONTACT INFO ===
Address: 3950 County Road 3802, Bullard, TX 75757
Email: sara@hoodfamilyfarms.com
Delivery Schedule:
- Bullard: Fridays
- Tyler: Saturdays
- Dallas: By appointment
- Houston: By appointment

=== FAQ CONTENT ===
See full FAQ.js for 3 main questions + glossary + extensive links section
*/

-- ============================================================================
-- CREATE DEFAULT PAGES (if not exist)
-- ============================================================================
DO $$
DECLARE
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000001'; -- Replace with actual tenant ID
    v_home_id UUID;
    v_about_id UUID;
    v_contact_id UUID;
    v_faq_id UUID;
    v_gallery_id UUID;
    v_foodtrailer_id UUID;
    v_template_standard UUID;
    v_template_landing UUID;
    v_template_about UUID;
    v_template_contact UUID;
BEGIN
    -- Get template IDs
    SELECT id INTO v_template_standard FROM site_templates WHERE slug = 'standard-page' LIMIT 1;
    SELECT id INTO v_template_landing FROM site_templates WHERE slug = 'landing-page' LIMIT 1;
    SELECT id INTO v_template_about FROM site_templates WHERE slug = 'about-page' LIMIT 1;
    SELECT id INTO v_template_contact FROM site_templates WHERE slug = 'contact-page' LIMIT 1;

    -- HOME PAGE
    INSERT INTO site_pages (tenant_id, page_type, title, slug, is_system_page, is_published, template_id, is_homepage,
        seo_title, seo_description)
    VALUES (v_tenant_id, 'home', 'Home', '', true, true, v_template_landing, true,
        'Hood Family Farms | Regenerative Farming in East Texas',
        'We''re a small East Texas regenerative farming operation raising pastured poultry, eggs, grass-fed sheep and cattle.')
    ON CONFLICT (tenant_id, slug) DO UPDATE SET 
        template_id = EXCLUDED.template_id,
        is_homepage = true,
        seo_title = EXCLUDED.seo_title,
        seo_description = EXCLUDED.seo_description
    RETURNING id INTO v_home_id;
    
    IF v_home_id IS NULL THEN
        SELECT id INTO v_home_id FROM site_pages WHERE tenant_id = v_tenant_id AND slug = '';
    END IF;

    -- ABOUT PAGE (Our Story)
    INSERT INTO site_pages (tenant_id, page_type, title, slug, is_system_page, is_published, template_id,
        seo_title, seo_description)
    VALUES (v_tenant_id, 'about', 'Our Story', 'story', false, true, v_template_about,
        'Our Story | Hood Family Farms',
        'Learn about our mission to raise food to the highest standards through regenerative farming practices.')
    ON CONFLICT (tenant_id, slug) DO UPDATE SET 
        template_id = EXCLUDED.template_id,
        title = 'Our Story',
        seo_title = EXCLUDED.seo_title,
        seo_description = EXCLUDED.seo_description
    RETURNING id INTO v_about_id;
    
    IF v_about_id IS NULL THEN
        SELECT id INTO v_about_id FROM site_pages WHERE tenant_id = v_tenant_id AND slug = 'story';
    END IF;

    -- CONTACT PAGE
    INSERT INTO site_pages (tenant_id, page_type, title, slug, is_system_page, is_published, template_id,
        seo_title, seo_description)
    VALUES (v_tenant_id, 'contact', 'Contact Us', 'contact', false, true, v_template_contact,
        'Contact Us | Hood Family Farms',
        'Get in touch with Hood Family Farms. We deliver to Bullard, Tyler, Dallas, and Houston.')
    ON CONFLICT (tenant_id, slug) DO UPDATE SET 
        template_id = EXCLUDED.template_id,
        seo_title = EXCLUDED.seo_title,
        seo_description = EXCLUDED.seo_description
    RETURNING id INTO v_contact_id;
    
    IF v_contact_id IS NULL THEN
        SELECT id INTO v_contact_id FROM site_pages WHERE tenant_id = v_tenant_id AND slug = 'contact';
    END IF;

    -- FAQ PAGE
    INSERT INTO site_pages (tenant_id, page_type, title, slug, is_system_page, is_published, template_id,
        seo_title, seo_description)
    VALUES (v_tenant_id, 'faq', 'Frequently Asked Questions', 'frequently-asked-questions', false, true, v_template_standard,
        'FAQ | Hood Family Farms',
        'Answers to common questions about our products, delivery, and regenerative farming practices.')
    ON CONFLICT (tenant_id, slug) DO UPDATE SET 
        template_id = EXCLUDED.template_id,
        seo_title = EXCLUDED.seo_title,
        seo_description = EXCLUDED.seo_description
    RETURNING id INTO v_faq_id;
    
    IF v_faq_id IS NULL THEN
        SELECT id INTO v_faq_id FROM site_pages WHERE tenant_id = v_tenant_id AND slug = 'frequently-asked-questions';
    END IF;

    -- GALLERY PAGE
    INSERT INTO site_pages (tenant_id, page_type, title, slug, is_system_page, is_published, template_id,
        seo_title, seo_description)
    VALUES (v_tenant_id, 'custom', 'Gallery', 'gallery', false, true, v_template_standard,
        'Gallery | Hood Family Farms',
        'Photos from around the farm - see our pastures, animals, and regenerative farming in action.')
    ON CONFLICT (tenant_id, slug) DO UPDATE SET 
        template_id = EXCLUDED.template_id,
        seo_title = EXCLUDED.seo_title,
        seo_description = EXCLUDED.seo_description
    RETURNING id INTO v_gallery_id;
    
    IF v_gallery_id IS NULL THEN
        SELECT id INTO v_gallery_id FROM site_pages WHERE tenant_id = v_tenant_id AND slug = 'gallery';
    END IF;

    -- FOOD TRAILER PAGE
    INSERT INTO site_pages (tenant_id, page_type, title, slug, is_system_page, is_published, template_id,
        seo_title, seo_description)
    VALUES (v_tenant_id, 'custom', 'Farm to Fork Food', 'food-trailer', false, true, v_template_standard,
        'Farm to Fork Food Trailer | Hood Family Farms',
        'Our mobile food trailer brings farm-fresh prepared foods to East Texas events and markets.')
    ON CONFLICT (tenant_id, slug) DO UPDATE SET 
        template_id = EXCLUDED.template_id,
        seo_title = EXCLUDED.seo_title,
        seo_description = EXCLUDED.seo_description
    RETURNING id INTO v_foodtrailer_id;
    
    IF v_foodtrailer_id IS NULL THEN
        SELECT id INTO v_foodtrailer_id FROM site_pages WHERE tenant_id = v_tenant_id AND slug = 'food-trailer';
    END IF;

    -- ========================================================================
    -- HOME PAGE BLOCKS
    -- ========================================================================
    
    -- Clear existing blocks for home page
    DELETE FROM page_blocks WHERE page_id = v_home_id;
    
    -- Hero Block
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_home_id, 'hero', 'hero', 0, '{
        "headline": "",
        "subheadline": "",
        "backgroundImage": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/73db0cf1-b04f-443d-b391-666c7fed9cc6/3+copy.jpg",
        "overlayOpacity": 0.3,
        "alignment": "center",
        "minHeight": "90vh",
        "primaryButton": {"text": "Shop Now", "link": "/shopping", "style": "solid"},
        "secondaryButton": {"text": "Learn More", "link": "/frequently-asked-questions", "style": "outline"}
    }', '{}');

    -- Mission Section (Two Column)
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_home_id, 'features', 'two-column', 0, '{
        "leftImage": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/920bc2fc-bb1c-4069-99bc-335475e74cba/Yoda+at+sunset.jpg",
        "rightContent": "<h2>Crowdfund with your Favorite Farm</h2><p>Our mission is to raise food to the highest standards for our local community. This means we treat our animals humanely. They graze on grass free of pesticides and herbicides as nature intended, and the way the animals rotate across the pastures is designed to add back important nutrients and microbes to support soil health and carbon sequestration.</p><p><strong>Simply put: healthier soil = healthier forage for animals = healthier animals = healthier food for people = healthier people.</strong></p><p>We are passionate about delicious quality food, the environment, and educating those around us on building a healthier more sustainable food system.</p>",
        "imagePosition": "left",
        "splitRatio": "50-50",
        "verticalAlign": "center"
    }', '{"backgroundColor": "#fdfbf7"}');

    -- Welcome Section (Text with Image)
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_home_id, 'social-proof', 'two-column', 0, '{
        "leftContent": "<h2>Welcome to the Farm!</h2><p>We''re a small East Texas regenerative farming operation raising pastured poultry and eggs plus grass-fed sheep and cattle on a rotational grazing system plus a chemical free garden with the goal of providing the healthiest, highest quality product to our local community and improving the environment while we do it.</p><p>Follow along with us on our journey, we can promise, it''ll be a wild ride!</p>",
        "rightImage": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1577170369127-IBXEQUXW5SK5ZLQULDAG/farm+mist+jpg.jpg",
        "imagePosition": "right",
        "splitRatio": "50-50",
        "verticalAlign": "center"
    }', '{"backgroundColor": "#f5f5f0"}');

    -- Gallery Preview
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_home_id, 'content', 'gallery', 0, '{
        "title": "Life on the Farm",
        "layout": "grid",
        "columns": 3,
        "gap": "medium",
        "aspectRatio": "4:3",
        "images": [
            {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555900163717-AYN5T9AUW61HX4WYDX8K/wide+shot+sunset.jpg", "alt": "Farm sunset view"},
            {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/920bc2fc-bb1c-4069-99bc-335475e74cba/Yoda+at+sunset.jpg", "alt": "Cow at sunset"},
            {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1577170369127-IBXEQUXW5SK5ZLQULDAG/farm+mist+jpg.jpg", "alt": "Farm in morning mist"}
        ]
    }', '{}');

    -- Regenerative CTA
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_home_id, 'cta', 'cta', 0, '{
        "headline": "Going beyond sustainability",
        "subheadline": "Hood Family Farms operates under the principles of regenerative farming. This means that we use animal impact to improve soil quality and sequester carbon… pretty awesome, right?!",
        "buttonText": "Our Story",
        "buttonLink": "/story",
        "alignment": "center",
        "padding": "large"
    }', '{"backgroundColor": "#4a6741", "textColor": "#ffffff"}');

    -- ========================================================================
    -- ABOUT PAGE BLOCKS (Our Story)
    -- ========================================================================
    
    DELETE FROM page_blocks WHERE page_id = v_about_id;
    
    -- Hero
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_about_id, 'hero', 'hero', 0, '{
        "headline": "Our Story",
        "subheadline": "",
        "backgroundImage": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555900163717-AYN5T9AUW61HX4WYDX8K/wide+shot+sunset.jpg",
        "overlayOpacity": 0.4,
        "alignment": "center",
        "minHeight": "50vh"
    }', '{}');

    -- Welcome Text
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_about_id, 'story', 'text', 0, '{
        "content": "<h2>Welcome to Hood Family Farms</h2><p>We''re a small East Texas regenerative farming operation raising pastured poultry and eggs plus grass-fed sheep and cattle on a rotational grazing system plus a chemical free garden with the goal of providing the healthiest, highest quality product to our local community and improving the environment while we do it.</p>",
        "alignment": "left",
        "maxWidth": "800px"
    }', '{}');

    -- Mission Section
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_about_id, 'story', 'text', 1, '{
        "content": "<h3>Our Mission</h3><p>Our mission is to raise food to the highest standards for our local community. This means we treat our animals humanely. They graze on grass free of pesticides and herbicides as nature intended, and the way the animals rotate across the pastures is designed to add back important nutrients and microbes to support soil health and carbon sequestration.</p><blockquote>Simply put: healthier soil = healthier forage for animals = healthier animals = healthier food for people = healthier people.</blockquote>",
        "alignment": "left",
        "maxWidth": "800px"
    }', '{}');

    -- Regenerative Practices
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_about_id, 'values', 'text', 0, '{
        "content": "<h3>Regenerative Practices</h3><p>Hood Family Farms operates under the principles of regenerative farming. This means that we use animal impact to improve soil quality and sequester carbon. Regenerative Agriculture is in essence food production in a manner that cares for the animals, improves soil quality over time, and is profitable.</p><p>It is a system of farming and ranching principles and practices that increases biodiversity, enriches soils, improves watersheds, and enhances ecosystem services. Regenerative Agriculture aims to capture carbon in soil and aboveground biomass, reversing current global trends of atmospheric accumulation.</p>",
        "alignment": "left",
        "maxWidth": "800px"
    }', '{}');

    -- Vision
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_about_id, 'values', 'text', 1, '{
        "content": "<h3>Our Vision</h3><p>We are passionate about delicious quality food, the environment, and educating those around us on building a healthier more sustainable food system. We believe that something can be both a healthy food staple and beautiful, and we''re committed to proving that sustainable farming is not just possible, but profitable and beneficial for everyone involved.</p><p><em>Follow along with us on our journey, we can promise, it''ll be a wild ride!</em></p>",
        "alignment": "left",
        "maxWidth": "800px"
    }', '{}');

    -- ========================================================================
    -- CONTACT PAGE BLOCKS
    -- ========================================================================
    
    DELETE FROM page_blocks WHERE page_id = v_contact_id;
    
    -- Hero
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_contact_id, 'hero', 'hero', 0, '{
        "headline": "Contact Us",
        "subheadline": "We''d love to hear from you!",
        "overlayOpacity": 0.5,
        "alignment": "center",
        "minHeight": "30vh"
    }', '{"backgroundColor": "#4a6741"}');

    -- Contact Info
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_contact_id, 'contact', 'contact-info', 0, '{
        "title": "Get in Touch",
        "showPhone": false,
        "showEmail": true,
        "showAddress": true,
        "showHours": true,
        "showMap": false,
        "layout": "vertical",
        "customEmail": "sara@hoodfamilyfarms.com",
        "customAddress": "3950 County Road 3802, Bullard, TX 75757"
    }', '{}');

    -- Delivery Schedule as Feature Cards
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_contact_id, 'contact', 'feature-cards', 1, '{
        "title": "Delivery Schedule",
        "columns": 4,
        "cardStyle": "bordered",
        "cards": [
            {"icon": "calendar", "title": "Bullard", "description": "Fridays"},
            {"icon": "calendar", "title": "Tyler", "description": "Saturdays"},
            {"icon": "calendar", "title": "Dallas", "description": "By appointment"},
            {"icon": "calendar", "title": "Houston", "description": "By appointment"}
        ]
    }', '{}');

    -- Contact Form
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_contact_id, 'contact', 'form', 2, '{
        "title": "Send a Message",
        "description": "Have questions about our products, delivery, or farm membership? We''re here to help!",
        "recipientEmail": "sara@hoodfamilyfarms.com",
        "submitButtonText": "Send Message",
        "successMessage": "Thank you! Your message has been sent. We''ll get back to you soon!",
        "fields": [
            {"type": "text", "name": "firstName", "label": "First Name", "required": true},
            {"type": "text", "name": "lastName", "label": "Last Name", "required": true},
            {"type": "email", "name": "email", "label": "Email", "required": true},
            {"type": "select", "name": "subject", "label": "Subject", "options": ["Product Questions", "Delivery Inquiries", "Farm Membership", "Food Trailer / Catering", "Farm Visits", "Other"]},
            {"type": "textarea", "name": "message", "label": "Message", "required": true}
        ]
    }', '{}');

    -- ========================================================================
    -- FAQ PAGE BLOCKS
    -- ========================================================================
    
    DELETE FROM page_blocks WHERE page_id = v_faq_id;
    
    -- Hero
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_faq_id, 'hero', 'hero', 0, '{
        "headline": "Frequently Asked Questions",
        "subheadline": "",
        "backgroundImage": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555901227734-ORPBLUM5NXSYF9BHG2DV/lazy+cows.jpg",
        "overlayOpacity": 0.4,
        "alignment": "center",
        "minHeight": "40vh"
    }', '{}');

    -- FAQ Accordion
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_faq_id, 'content', 'faq', 0, '{
        "title": "",
        "allowMultiple": false,
        "style": "bordered",
        "items": [
            {
                "question": "How will I receive my products?",
                "answer": "We offer regular deliveries in Bullard every Friday, Tyler every Saturday, and Dallas/Houston alternating Wednesdays. Our delivery zones are within 20 miles of Bullard/Tyler/Dallas proper, and for Houston within 20 miles of The Woodlands Mall.\n\nIf you live inside these areas we will drop off to your front door (don''t worry if you''re not home, just leave a cooler out and we''ll pop your items inside for safe keeping). If you live outside of the delivery zone, we are happy to work out a location to meet you, just ask!\n\nYou can place your order any time you like, and it will be delivered on our next scheduled delivery date. We''ll shoot you a text message the day prior to remind you that we''re coming."
            },
            {
                "question": "Can I get my products shipped?",
                "answer": "All of our meats are processed in USDA inspected facilities, and thus available to ship nationwide. We ship exclusively to customers who have our farm membership.\n\nWe have worked out a shipping system mostly free of single use packaging. Your farm membership is essentially an annual deposit for the continued use of the insulated shipping totes, that also comes with additional perks like early access to our new harvest quantities, subscription services and more.\n\nThe shipping totes are packed with a return label that you can easily slap on and send back to us for the next shipment - no wasted cardboard, styrofoam or ice packs.\n\nUnfortunately TX cottage food laws prohibit us from shipping baked goods, pickles, or jams. In the spirit of supporting our local communities, we prefer to do deliveries."
            },
            {
                "question": "Why do your chickens lay different colored eggs?",
                "answer": "Different breeds lay different colors, shapes (some are more round, others more conical), and sizes.\n\nWe believe that something can be both a healthy food staple and beautiful, so the more variety the better! All of the edible egg parts look the same once they''re cracked and in your frying pan!"
            }
        ]
    }', '{}');

    -- Glossary Section
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_faq_id, 'content', 'text', 1, '{
        "content": "<h2>Glossary</h2><dl><dt><strong>Continuous grazing</strong></dt><dd>A grazing system in which livestock are turned into a pasture or grassland and left for an extended period of time. It is characterized by low stocking densities, selective grazing, and no specific rest period for forage recovery.</dd><dt><strong>Non-selective rotational grazing</strong></dt><dd>A grazing system in which livestock are held on restricted areas of forage at high stocking densities. It is characterized by sub-day livestock movements to new grazing areas, near total forage removal, and longer rest periods for forage recovery. Sometimes called mob grazing.</dd><dt><strong>Regenerative farming/ranching</strong></dt><dd>Regenerative Agriculture is in essence food production in a manner that cares for the animals, improves soil quality over time, and is profitable. It is a system of farming and ranching principles and practices that increases biodiversity, enriches soils, improves watersheds, and enhances ecosystem services.</dd><dt><strong>Selective rotational grazing</strong></dt><dd>A grazing system in which livestock are held on restricted areas of forage. It is characterized by multi-day livestock movements to new grazing areas, 1/3 to 1/2 forage removal, and rest periods for forage recovery.</dd></dl>",
        "alignment": "left",
        "maxWidth": "800px"
    }', '{"padding": "large"}');

    -- CTA
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_faq_id, 'cta', 'cta', 0, '{
        "headline": "Still have questions?",
        "subheadline": "We''re happy to help! Reach out and we''ll get back to you as soon as we can.",
        "buttonText": "Contact Us",
        "buttonLink": "/contact",
        "alignment": "center"
    }', '{}');

    -- ========================================================================
    -- GALLERY PAGE BLOCKS
    -- ========================================================================
    
    DELETE FROM page_blocks WHERE page_id = v_gallery_id;
    
    -- Hero
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_gallery_id, 'hero', 'hero', 0, '{
        "headline": "Gallery",
        "subheadline": "Photos from around the farm",
        "overlayOpacity": 0.5,
        "alignment": "center",
        "minHeight": "30vh"
    }', '{"backgroundColor": "#4a6741"}');

    -- Gallery Grid
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_gallery_id, 'content', 'gallery', 0, '{
        "title": "",
        "layout": "masonry",
        "columns": 3,
        "gap": "medium",
        "aspectRatio": "original",
        "images": [
            {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555900163717-AYN5T9AUW61HX4WYDX8K/wide+shot+sunset.jpg", "alt": "Farm sunset view", "caption": "Sunset over the pastures"},
            {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/920bc2fc-bb1c-4069-99bc-335475e74cba/Yoda+at+sunset.jpg", "alt": "Cow at sunset", "caption": ""},
            {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1577170369127-IBXEQUXW5SK5ZLQULDAG/farm+mist+jpg.jpg", "alt": "Farm in morning mist", "caption": "Morning mist on the farm"},
            {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/73db0cf1-b04f-443d-b391-666c7fed9cc6/3+copy.jpg", "alt": "Chickens in pasture", "caption": "Pastured poultry"},
            {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197280315-XR0BSJJC51JDAZ5LJ40Q/022824-HOOD+2.jpg", "alt": "Food trailer", "caption": "Farm to Fork Food Trailer"},
            {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197283561-G1ZM48P91C7RVL23M2ZX/022824-HOOD+6.jpg", "alt": "Farm food preparation", "caption": ""}
        ]
    }', '{}');

    -- ========================================================================
    -- FOOD TRAILER PAGE BLOCKS
    -- ========================================================================
    
    DELETE FROM page_blocks WHERE page_id = v_foodtrailer_id;
    
    -- Hero with Logo
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_foodtrailer_id, 'hero', 'image', 0, '{
        "src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/7aa38ec7-bf17-43f2-90dd-867b4e81e2f9/Farm+to+Fork+Food+TREE+logo+green.png",
        "alt": "Farm to Fork Food Logo",
        "alignment": "center",
        "size": "medium"
    }', '{"backgroundColor": "#fdfbf7", "padding": "large"}');

    -- Food Trailer Gallery
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_foodtrailer_id, 'content', 'gallery', 0, '{
        "title": "",
        "layout": "grid",
        "columns": 3,
        "gap": "small",
        "aspectRatio": "square",
        "images": [
            {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197280315-XR0BSJJC51JDAZ5LJ40Q/022824-HOOD+2.jpg", "alt": "Food trailer"},
            {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816671281-6HRSD5C7D5KKAQ6Y7TQF/20240323_112219.jpeg", "alt": "Food preparation"},
            {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816670429-Q286VIVUPWNOQ9HQBEQK/20240323_113439.jpeg", "alt": "Food trailer service"},
            {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816675016-4KI49TCSYD4Y1AL9MZDU/IMG_1739.jpeg", "alt": "Food trailer menu"},
            {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197283561-G1ZM48P91C7RVL23M2ZX/022824-HOOD+6.jpg", "alt": "Farm fresh food"},
            {"src": "https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197286322-TF0ZRM4RA3NBSIX6BLNA/022824-HOOD+12.jpg", "alt": "Food trailer event"}
        ]
    }', '{}');

    -- About Section
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_foodtrailer_id, 'content', 'text', 1, '{
        "content": "<h2>Farm to Fork Food</h2><p>This trailer is an extension of our Farm''s mission to strengthen our local food system and provide delicious and clean food to our community.</p><p>Be sure to follow us on <a href=\"https://www.facebook.com/hoodfamilyfarms/\" target=\"_blank\">Facebook</a> or <a href=\"https://www.instagram.com/hoodfamilyfarms/\" target=\"_blank\">Instagram</a> to keep up with our current menu offerings and set up locations. We rotate our menu based on the seasons and local availability!</p>",
        "alignment": "center",
        "maxWidth": "800px"
    }', '{"backgroundColor": "#f5f5f0", "padding": "large"}');

    -- CTA Buttons
    INSERT INTO page_blocks (page_id, zone_key, block_type, display_order, content, settings) VALUES
    (v_foodtrailer_id, 'cta', 'cta', 0, '{
        "headline": "Ready to book us for your event?",
        "subheadline": "We cater weddings, corporate events, farmers markets, and more!",
        "buttonText": "Event Inquiry",
        "buttonLink": "/contact",
        "secondaryButtonText": "View Current Menu",
        "secondaryButtonLink": "/menu",
        "alignment": "center"
    }', '{}');

    RAISE NOTICE 'Hood Family Farms content seed completed successfully';
    RAISE NOTICE 'Pages created/updated: Home, Our Story, Contact, FAQ, Gallery, Food Trailer';
    
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================
/*
This migration creates the following content structure:

PAGES:
1. Home (/) - Landing page template
   - Hero with farm image and Shop Now / Learn More buttons
   - Mission section (two-column with cow image)
   - Welcome section (two-column with mist image)
   - Gallery preview (3 images)
   - Regenerative CTA

2. Our Story (/story) - About page template
   - Hero with sunset image
   - Welcome text
   - Mission section with blockquote
   - Regenerative practices explanation
   - Vision statement

3. Contact (/contact) - Contact page template
   - Hero (simple)
   - Contact info block
   - Delivery schedule as feature cards
   - Contact form

4. FAQ (/frequently-asked-questions) - Standard page template
   - Hero with cows image
   - FAQ accordion (3 questions)
   - Glossary section
   - Contact CTA

5. Gallery (/gallery) - Standard page template
   - Hero (simple)
   - Masonry gallery (6 images)

6. Food Trailer (/food-trailer) - Standard page template
   - Logo image
   - Photo gallery (6 images)
   - About text with social links
   - Event booking CTA

IMAGES USED:
- All images are currently hosted on Squarespace CDN
- Consider migrating to local hosting or dedicated CDN

NEXT STEPS:
1. Update tenant_id if using a different tenant
2. Run this migration
3. Review pages in Site Builder
4. Adjust content/styling as needed
5. Migrate images to permanent hosting
*/
