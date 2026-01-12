/**
 * Quick script to check menu_items table
 */
require('dotenv').config();
const db = require('../config/database');

async function checkMenuItems() {
  try {
    console.log('\n📋 Checking menu_items table...\n');

    // Count all items
    const countAll = await db.query('SELECT COUNT(*) FROM menu_items');
    console.log(`Total menu items: ${countAll.rows[0].count}`);

    // Count available items
    const countAvailable = await db.query('SELECT COUNT(*) FROM menu_items WHERE is_available = true');
    console.log(`Available items (is_available = true): ${countAvailable.rows[0].count}`);

    // Count unavailable items
    const countUnavailable = await db.query('SELECT COUNT(*) FROM menu_items WHERE is_available = false');
    console.log(`Unavailable items (is_available = false): ${countUnavailable.rows[0].count}`);

    // Count null items
    const countNull = await db.query('SELECT COUNT(*) FROM menu_items WHERE is_available IS NULL');
    console.log(`Null items (is_available IS NULL): ${countNull.rows[0].count}`);

    // List all items with their availability
    const allItems = await db.query('SELECT id, name, is_available FROM menu_items ORDER BY name');
    console.log('\n📝 All menu items:');
    for (const item of allItems.rows) {
      console.log(`   ${item.is_available ? '✅' : '❌'} ${item.name} (is_available: ${item.is_available})`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.close();
  }
}

checkMenuItems();
