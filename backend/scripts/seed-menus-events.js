/**
 * Seed Menu and Events Data
 * 
 * Creates sample menus and events for testing
 * 
 * Usage: node scripts/seed-menus-events.js
 */

require('dotenv').config();
const db = require('../config/database');

async function seedData() {
  console.log('\n🌱 Seeding Menus and Events...\n');

  try {
    // ========================================================================
    // CREATE MENU ITEMS (reusable across menus)
    // ========================================================================
    console.log('Creating menu items...');

    const menuItems = [
      // Mains
      { name: 'Smash Burger', description: 'Two 1/4 lb grass-fed beef patties, American cheese, special sauce, pickles, onions on a brioche bun', price: 14.00, is_gluten_free: false },
      { name: 'Pulled Pork Sandwich', description: 'Slow-smoked heritage pork, house-made coleslaw, pickles on a brioche bun', price: 12.00, is_gluten_free: false },
      { name: 'Chicken Sandwich', description: 'Grilled or fried pastured chicken breast, lettuce, tomato, garlic aioli', price: 13.00, is_gluten_free: false },
      { name: 'Beef Tacos', description: 'Three grass-fed beef tacos with fresh salsa, cilantro, onions, lime', price: 12.00, is_gluten_free: true },
      { name: 'Pork Belly Tacos', description: 'Three crispy pork belly tacos with pickled onions, cilantro crema', price: 13.00, is_gluten_free: true },
      
      // Sides
      { name: 'Hand-Cut Fries', description: 'Crispy fries with sea salt', price: 5.00, is_vegetarian: true, is_vegan: true, is_gluten_free: true },
      { name: 'Sweet Potato Fries', description: 'With chipotle aioli', price: 6.00, is_vegetarian: true, is_gluten_free: true },
      { name: 'Coleslaw', description: 'House-made creamy coleslaw', price: 4.00, is_vegetarian: true, is_gluten_free: true },
      { name: 'Side Salad', description: 'Mixed greens, cherry tomatoes, ranch or vinaigrette', price: 5.00, is_vegetarian: true, is_gluten_free: true },
      
      // Drinks
      { name: 'Fresh Lemonade', description: 'House-made with local honey', price: 4.00, is_vegetarian: true, is_vegan: true, is_gluten_free: true },
      { name: 'Iced Tea', description: 'Sweet or unsweet', price: 3.00, is_vegetarian: true, is_vegan: true, is_gluten_free: true },
      { name: 'Bottled Water', description: null, price: 2.00, is_vegetarian: true, is_vegan: true, is_gluten_free: true },
      
      // Desserts
      { name: 'Brownie', description: 'Rich chocolate brownie made with farm eggs', price: 4.00, is_vegetarian: true },
      { name: 'Cookie', description: 'Fresh-baked chocolate chip cookie', price: 3.00, is_vegetarian: true },
    ];

    const itemIds = {};
    for (const item of menuItems) {
      const result = await db.query(`
        INSERT INTO menu_items (name, description, price, is_vegetarian, is_vegan, is_gluten_free, is_dairy_free, is_spicy)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT DO NOTHING
        RETURNING id, name
      `, [
        item.name,
        item.description,
        item.price,
        item.is_vegetarian || false,
        item.is_vegan || false,
        item.is_gluten_free || false,
        item.is_dairy_free || false,
        item.is_spicy || false
      ]);
      
      if (result.rows.length > 0) {
        itemIds[item.name] = result.rows[0].id;
        console.log(`   ✅ ${item.name}`);
      } else {
        // Item already exists, get its ID
        const existing = await db.query('SELECT id FROM menu_items WHERE name = $1', [item.name]);
        if (existing.rows.length > 0) {
          itemIds[item.name] = existing.rows[0].id;
        }
      }
    }

    // ========================================================================
    // CREATE SUMMER MENU
    // ========================================================================
    console.log('\nCreating Summer Menu...');

    const summerMenuResult = await db.query(`
      INSERT INTO menus (name, slug, description, season, menu_type, status, is_featured, footer_text)
      VALUES (
        'Summer 2026 Menu',
        'summer-2026',
        'Fresh from the farm to your fork! All meats are pasture-raised on our farm in Bullard, TX.',
        'summer',
        'food_trailer',
        'active',
        true,
        'All our meats are pasture-raised without antibiotics or hormones. Prices subject to change based on availability.'
      )
      ON CONFLICT (tenant_id, slug) DO UPDATE SET is_featured = true
      RETURNING id
    `);

    const summerMenuId = summerMenuResult.rows[0].id;
    console.log(`   ✅ Summer 2026 Menu created`);

    // Create sections for summer menu
    const sections = [
      { name: 'Mains', description: 'All sandwiches served with your choice of side', sort_order: 1 },
      { name: 'Tacos', description: 'Served with chips and salsa', sort_order: 2 },
      { name: 'Sides', description: null, sort_order: 3 },
      { name: 'Drinks', description: null, sort_order: 4 },
      { name: 'Desserts', description: 'Made fresh daily', sort_order: 5 },
    ];

    const sectionIds = {};
    for (const section of sections) {
      const result = await db.query(`
        INSERT INTO menu_sections (menu_id, name, description, sort_order)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [summerMenuId, section.name, section.description, section.sort_order]);
      sectionIds[section.name] = result.rows[0].id;
      console.log(`   ✅ Section: ${section.name}`);
    }

    // Link items to sections
    const sectionItems = {
      'Mains': ['Smash Burger', 'Pulled Pork Sandwich', 'Chicken Sandwich'],
      'Tacos': ['Beef Tacos', 'Pork Belly Tacos'],
      'Sides': ['Hand-Cut Fries', 'Sweet Potato Fries', 'Coleslaw', 'Side Salad'],
      'Drinks': ['Fresh Lemonade', 'Iced Tea', 'Bottled Water'],
      'Desserts': ['Brownie', 'Cookie'],
    };

    for (const [sectionName, items] of Object.entries(sectionItems)) {
      let sortOrder = 0;
      for (const itemName of items) {
        if (itemIds[itemName] && sectionIds[sectionName]) {
          await db.query(`
            INSERT INTO menu_section_items (section_id, menu_item_id, sort_order)
            VALUES ($1, $2, $3)
            ON CONFLICT (section_id, menu_item_id) DO NOTHING
          `, [sectionIds[sectionName], itemIds[itemName], sortOrder++]);
        }
      }
    }
    console.log('   ✅ Menu items linked to sections');

    // ========================================================================
    // CREATE EVENTS
    // ========================================================================
    console.log('\nCreating Events...');

    const events = [
      {
        title: 'Sorelle Farms @ Bob Wells Nursery Night Market',
        event_date: '2026-01-16',
        start_time: '17:00',
        end_time: '20:00',
        location_name: 'Sorelle Tree Farm',
        address: '975 County Road 2220',
        city: 'Mineola',
        state: 'TX',
        zip_code: '75773',
      },
      {
        title: 'Sorelle Farms @ Bob Wells Nursery Night Market',
        event_date: '2026-01-23',
        start_time: '17:00',
        end_time: '20:00',
        location_name: 'Sorelle Tree Farm',
        address: '975 County Road 2220',
        city: 'Mineola',
        state: 'TX',
        zip_code: '75773',
      },
      {
        title: '1650 Market',
        event_date: '2026-01-25',
        start_time: '10:00',
        end_time: '15:00',
        location_name: 'Refining Dust',
        address: '12468 FM 1650',
        city: 'Gilmer',
        state: 'TX',
        zip_code: '75645',
        description: 'Shop small, eat local, cultivate community!',
      },
      {
        title: 'Sorelle Farms @ Bob Wells Nursery Night Market',
        event_date: '2026-01-30',
        start_time: '17:00',
        end_time: '20:00',
        location_name: 'Sorelle Tree Farm',
        address: '975 County Road 2220',
        city: 'Mineola',
        state: 'TX',
        zip_code: '75773',
      },
      {
        title: 'Tyler Farmers Market',
        event_date: '2026-02-01',
        start_time: '08:00',
        end_time: '12:00',
        location_name: 'Tyler Farmers Market',
        address: '100 E Erwin St',
        city: 'Tyler',
        state: 'TX',
        zip_code: '75702',
        description: 'Come see us at our booth!',
      },
    ];

    for (const event of events) {
      const slug = `${event.title}-${event.event_date}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const mapUrl = `https://maps.google.com?q=${encodeURIComponent([event.address, event.city, event.state, event.zip_code].join(', '))}`;

      await db.query(`
        INSERT INTO events (
          title, slug, description, event_date, start_time, end_time,
          location_name, address, city, state, zip_code, map_url,
          menu_id, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'scheduled')
        ON CONFLICT (tenant_id, slug) DO NOTHING
      `, [
        event.title,
        slug,
        event.description || null,
        event.event_date,
        event.start_time,
        event.end_time,
        event.location_name,
        event.address,
        event.city,
        event.state,
        event.zip_code,
        mapUrl,
        summerMenuId
      ]);

      console.log(`   ✅ ${event.title} (${event.event_date})`);
    }

    console.log('\n✨ Seeding complete!\n');
    console.log('View your menu at: http://localhost:3002/menu');
    console.log('View events at: http://localhost:3002/farm-to-fork-food-trailer\n');

  } catch (error) {
    console.error('\n❌ Error seeding data:', error.message);
    console.error(error.stack);
  } finally {
    await db.close();
  }
}

seedData();
