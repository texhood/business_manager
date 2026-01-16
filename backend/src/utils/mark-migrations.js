/**
 * Mark migrations as executed (for databases set up outside migration system)
 * Run: node src/utils/mark-migrations.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'hoodfamilyfarms',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

// All migrations to mark as executed (everything before 028)
const migrationsToMark = [
  '003_add_categories.sql',
  '003_report_configurations.sql',
  '004_add_plaid_support.sql',
  '004_plaid_integration.sql',
  '005_add_classes.sql',
  '006_transaction_acceptance_gl_account.sql',
  '007_remove_transaction_categories.sql',
  '008_item_status.sql',
  '010_add_stripe_fields.sql',
  '011_blog_posts.sql',
  '012_social_media.sql',
  '012_tenants.sql',
  '013_menus.sql',
  '014_events.sql',
  '015_media.sql',
  '016_menu_items_stripe.sql',
  '017_pos_orders.sql',
  '018_restaurant_orders.sql',
  '019_add_tenant_to_order_items.sql',
  '019_restaurant_orders_phone.sql',
  '020_add_reissue_count.sql',
  '020_restaurant_order_items_tenant.sql',
  '021_modifications_system.sql',
  '024_social_media.sql',
  '025_site_designer.sql',
  '026_herds_flocks_pastures.sql',
  '027_herds_flocks_seed_data.sql',
];

async function markMigrations() {
  console.log('Marking migrations as executed...\n');
  
  try {
    for (const migration of migrationsToMark) {
      try {
        await pool.query(
          'INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
          [migration]
        );
        console.log(`✓ Marked: ${migration}`);
      } catch (err) {
        console.log(`⏭ Already marked: ${migration}`);
      }
    }
    
    console.log('\n✓ Done! Now run: npm run migrate');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

markMigrations();
