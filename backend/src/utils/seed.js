/**
 * Database Seed Script
 * Populate database with sample data for development/testing
 */

require('dotenv').config();

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'hoodfamilyfarms',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function seed() {
  console.log('🌱 Business Manager - Database Seeding\n');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // =========================================================================
    // ACCOUNTS
    // =========================================================================
    console.log('Creating accounts...');

    const passwordHash = await bcrypt.hash('password123', 12);

    // Admin account
    await client.query(`
      INSERT INTO accounts (email, password_hash, name, phone, address, city, state, zip_code, role, delivery_zone_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (email) DO NOTHING
    `, [
      'sara@hoodfamilyfarms.com',
      passwordHash,
      'Sara Hood',
      '903-555-0100',
      '3950 County Road 3802',
      'Bullard',
      'TX',
      '75757',
      'admin',
      'bullard'
    ]);

    // Staff account
    await client.query(`
      INSERT INTO accounts (email, password_hash, name, phone, address, city, state, zip_code, role, delivery_zone_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (email) DO NOTHING
    `, [
      'staff@hoodfamilyfarms.com',
      passwordHash,
      'Farm Staff',
      '903-555-0101',
      '123 Farm Lane',
      'Tyler',
      'TX',
      '75701',
      'staff',
      'tyler'
    ]);

    // Sample customers
    const customers = [
      { email: 'jane@example.com', name: 'Jane Smith', phone: '214-555-0102', address: '456 Oak Ave', city: 'Dallas', state: 'TX', zip: '75201', zone: 'dallas', member: true },
      { email: 'john@example.com', name: 'John Davis', phone: '281-555-0103', address: '789 Pine St', city: 'The Woodlands', state: 'TX', zip: '77380', zone: 'houston', member: true },
      { email: 'mary@example.com', name: 'Mary Johnson', phone: '903-555-0104', address: '321 Elm Dr', city: 'Tyler', state: 'TX', zip: '75702', zone: 'tyler', member: false },
      { email: 'bob@example.com', name: 'Bob Wilson', phone: '903-555-0105', address: '654 Cedar Ln', city: 'Bullard', state: 'TX', zip: '75757', zone: 'bullard', member: false },
      { email: 'sarah@example.com', name: 'Sarah Brown', phone: '214-555-0106', address: '987 Maple Ct', city: 'Plano', state: 'TX', zip: '75024', zone: 'dallas', member: true },
    ];

    for (const c of customers) {
      await client.query(`
        INSERT INTO accounts (email, password_hash, name, phone, address, city, state, zip_code, role, delivery_zone_id, is_farm_member, member_since)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'customer', $9, $10, $11)
        ON CONFLICT (email) DO NOTHING
      `, [
        c.email,
        passwordHash,
        c.name,
        c.phone,
        c.address,
        c.city,
        c.state,
        c.zip,
        c.zone,
        c.member,
        c.member ? '2024-01-15' : null
      ]);
    }

    console.log('✓ Accounts created\n');

    // =========================================================================
    // ITEMS
    // =========================================================================
    console.log('Creating items...');

    const items = [
      // Chicken
      { sku: 'CHK-001', name: 'Pasture Raised Whole Chicken', desc: 'Farm-raised whole chicken, approximately 4-5 lbs', type: 'inventory', cat: 2, price: 23.00, inv: 0, tax: true, ship: 'in-state' },
      { sku: 'CHK-002', name: 'Chicken Breast', desc: 'Boneless skinless chicken breast, 2 per pack', type: 'inventory', cat: 2, price: 16.00, inv: 15, tax: true, ship: 'in-state' },
      { sku: 'CHK-003', name: 'Chicken Thighs', desc: 'Bone-in chicken thighs, approximately 2 lbs', type: 'inventory', cat: 2, price: 14.00, inv: 12, tax: true, ship: 'in-state' },
      { sku: 'CHK-004', name: 'Chicken Wings', desc: 'Party-ready chicken wings, 2 lb bag', type: 'inventory', cat: 2, price: 12.00, inv: 8, tax: true, ship: 'in-state' },
      { sku: 'CHK-005', name: 'Chicken Livers', desc: 'Nutrient-rich chicken livers, 1 lb', type: 'inventory', cat: 2, price: 6.00, inv: 5, tax: true, ship: 'in-state' },
      
      // Beef
      { sku: 'BEF-001', name: 'Grass Fed Ground Beef', desc: '100% grass-fed ground beef, 1 lb', type: 'inventory', cat: 1, price: 10.00, inv: 20, tax: true, ship: 'in-country' },
      { sku: 'BEF-002', name: 'Ribeye Steak', desc: 'Grass-fed ribeye, approximately 12 oz', type: 'inventory', cat: 1, price: 28.00, inv: 6, tax: true, ship: 'in-country' },
      { sku: 'BEF-003', name: 'NY Strip Steak', desc: 'Grass-fed NY strip, approximately 10 oz', type: 'inventory', cat: 1, price: 24.00, inv: 8, tax: true, ship: 'in-country' },
      { sku: 'BEF-004', name: 'Beef Chuck Roast', desc: 'Perfect for slow cooking, 3 lb', type: 'inventory', cat: 1, price: 32.00, inv: 4, tax: true, ship: 'in-country' },
      
      // Lamb
      { sku: 'LMB-001', name: 'Grass Fed Ground Lamb', desc: 'Ground lamb, 1 lb package', type: 'inventory', cat: 3, price: 12.00, inv: 10, tax: true, ship: 'in-country' },
      { sku: 'LMB-002', name: 'Lamb Chops', desc: 'Tender lamb chops, 4 per pack', type: 'inventory', cat: 3, price: 22.00, inv: 6, tax: true, ship: 'in-country' },
      { sku: 'LMB-003', name: 'Lamb Leg Roast', desc: 'Bone-in lamb leg, approximately 4 lbs', type: 'inventory', cat: 3, price: 48.00, inv: 2, tax: true, ship: 'in-country' },
      
      // Eggs
      { sku: 'EGG-001', name: 'Pasture Raised Eggs - Dozen', desc: 'Farm fresh eggs from free-range hens', type: 'inventory', cat: 4, price: 8.00, inv: 24, tax: false, ship: 'not-shippable' },
      { sku: 'EGG-002', name: 'Pasture Raised Eggs - Half Dozen', desc: 'Farm fresh eggs, 6 count', type: 'inventory', cat: 4, price: 4.50, inv: 18, tax: false, ship: 'not-shippable' },
      
      // Farm Fresh (Cottage Food)
      { sku: 'FF-001', name: 'Strawberry Jam', desc: 'Homemade strawberry jam, 8 oz jar', type: 'inventory', cat: 5, price: 8.00, inv: 12, tax: false, ship: 'not-shippable' },
      { sku: 'FF-002', name: 'Peach Preserves', desc: 'Texas peach preserves, 8 oz jar', type: 'inventory', cat: 5, price: 8.00, inv: 10, tax: false, ship: 'not-shippable' },
      { sku: 'FF-003', name: 'Fire Roasted Salsa', desc: 'Homemade salsa, 16 oz', type: 'inventory', cat: 5, price: 7.00, inv: 8, tax: false, ship: 'not-shippable' },
      { sku: 'FF-004', name: 'Bread & Butter Pickles', desc: 'Classic pickles, 16 oz jar', type: 'inventory', cat: 5, price: 6.00, inv: 15, tax: false, ship: 'not-shippable' },
      
      // Gear
      { sku: 'GR-001', name: 'Farm Logo T-Shirt', desc: 'Cotton t-shirt with farm logo', type: 'inventory', cat: 6, price: 25.00, inv: 30, tax: true, ship: 'in-country' },
      { sku: 'GR-002', name: 'Farm Coffee Mug', desc: 'Ceramic mug, 12 oz', type: 'inventory', cat: 6, price: 15.00, inv: 20, tax: true, ship: 'in-country' },
      { sku: 'GR-003', name: 'Farm Hat', desc: 'Embroidered baseball cap', type: 'inventory', cat: 6, price: 22.00, inv: 15, tax: true, ship: 'in-country' },
      
      // Membership & Digital
      { sku: 'MEM-001', name: 'Farm Membership - Annual', desc: 'Annual farm membership with 10% discount, free farm visits, and early access', type: 'non-inventory', cat: 9, price: 99.00, inv: null, tax: false, ship: 'no-restrictions' },
      { sku: 'GC-001', name: 'Gift Card - $50', desc: '$50 gift card for Hood Family Farms', type: 'non-inventory', cat: 6, price: 50.00, inv: null, tax: false, ship: 'no-restrictions' },
      { sku: 'GC-002', name: 'Gift Card - $100', desc: '$100 gift card for Hood Family Farms', type: 'non-inventory', cat: 6, price: 100.00, inv: null, tax: false, ship: 'no-restrictions' },
      { sku: 'DIG-001', name: 'Farm Recipe Collection', desc: 'Downloadable PDF with 25 farm-to-table recipes', type: 'digital', cat: 10, price: 9.99, inv: null, tax: false, ship: 'no-restrictions' },
    ];

    for (const item of items) {
      await client.query(`
        INSERT INTO items (sku, name, description, item_type, category_id, price, member_price, inventory_quantity, is_taxable, shipping_zone)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (sku) DO NOTHING
      `, [
        item.sku,
        item.name,
        item.desc,
        item.type,
        item.cat,
        item.price,
        item.price * 0.9, // 10% member discount
        item.inv,
        item.tax,
        item.ship
      ]);
    }

    // Add tags to items
    const itemTags = [
      { sku: 'CHK-001', tags: [1, 2] }, // Meats, Poultry
      { sku: 'CHK-002', tags: [1, 2] },
      { sku: 'CHK-003', tags: [1, 2] },
      { sku: 'BEF-001', tags: [1, 8] }, // Meats, Best Seller
      { sku: 'BEF-002', tags: [1] },
      { sku: 'LMB-001', tags: [1] },
      { sku: 'EGG-001', tags: [3, 8] }, // Farm Fresh, Best Seller
      { sku: 'FF-001', tags: [3, 7] }, // Farm Fresh, Seasonal
      { sku: 'MEM-001', tags: [4] }, // Subscription
      { sku: 'DIG-001', tags: [5] }, // Downloads
    ];

    for (const it of itemTags) {
      const itemResult = await client.query('SELECT id FROM items WHERE sku = $1', [it.sku]);
      if (itemResult.rows.length > 0) {
        for (const tagId of it.tags) {
          await client.query(
            'INSERT INTO item_tags (item_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [itemResult.rows[0].id, tagId]
          );
        }
      }
    }

    console.log('✓ Items created\n');

    // =========================================================================
    // TRANSACTIONS (Bookkeeping)
    // =========================================================================
    console.log('Creating sample transactions...');

    const transactions = [
      // December income
      { date: '2024-12-01', type: 'income', cat: 1, desc: 'Farmers Market - Tyler', amount: 847.50, acct: 1, ref: 'FM-1201' },
      { date: '2024-12-03', type: 'income', cat: 1, desc: 'Online Orders - Weekly Delivery', amount: 523.00, acct: 1, ref: 'ORD-1203' },
      { date: '2024-12-05', type: 'income', cat: 2, desc: 'New Annual Membership - J. Smith', amount: 99.00, acct: 1, ref: 'MEM-0034' },
      { date: '2024-12-07', type: 'income', cat: 3, desc: 'Food Trailer - Saturday Market', amount: 1125.00, acct: 1, ref: 'FT-1207' },
      { date: '2024-12-08', type: 'income', cat: 1, desc: 'Farmers Market - Tyler', amount: 932.00, acct: 1, ref: 'FM-1208' },
      { date: '2024-12-10', type: 'income', cat: 1, desc: 'Online Orders - Weekly Delivery', amount: 678.50, acct: 1, ref: 'ORD-1210' },
      { date: '2024-12-12', type: 'income', cat: 4, desc: 'Wedding Catering - Johnson Event', amount: 2500.00, acct: 1, ref: 'CAT-1212' },
      { date: '2024-12-14', type: 'income', cat: 3, desc: 'Food Trailer - Holiday Festival', amount: 1875.00, acct: 1, ref: 'FT-1214' },
      { date: '2024-12-15', type: 'income', cat: 1, desc: 'Farmers Market - Tyler', amount: 1156.00, acct: 1, ref: 'FM-1215' },
      { date: '2024-12-17', type: 'income', cat: 1, desc: 'Online Orders - Weekly Delivery', amount: 892.00, acct: 1, ref: 'ORD-1217' },
      { date: '2024-12-19', type: 'income', cat: 2, desc: 'New Annual Membership - S. Brown', amount: 99.00, acct: 1, ref: 'MEM-0035' },
      { date: '2024-12-20', type: 'income', cat: 5, desc: 'Farm Visit Group - School Tour', amount: 150.00, acct: 2, ref: 'FV-1220' },
      
      // December expenses
      { date: '2024-12-02', type: 'expense', cat: 8, desc: 'Tractor Supply - Chicken Feed', amount: 234.00, acct: 1, ref: 'TS-8847', vendor: 'Tractor Supply' },
      { date: '2024-12-04', type: 'expense', cat: 9, desc: 'Electric Bill - December', amount: 187.50, acct: 1, ref: 'ONCOR-1204', vendor: 'Oncor' },
      { date: '2024-12-06', type: 'expense', cat: 10, desc: 'Fence Posts & Wire', amount: 445.00, acct: 1, ref: 'ACE-1206', vendor: 'Ace Hardware' },
      { date: '2024-12-09', type: 'expense', cat: 8, desc: 'Cattle Feed - Monthly', amount: 520.00, acct: 1, ref: 'TS-8901', vendor: 'Tractor Supply' },
      { date: '2024-12-11', type: 'expense', cat: 11, desc: 'Part-time Help - Week 1', amount: 320.00, acct: 1, ref: 'PAY-1211' },
      { date: '2024-12-13', type: 'expense', cat: 12, desc: 'Diesel Fuel', amount: 175.00, acct: 1, ref: 'FUEL-1213', vendor: 'Brookshires' },
      { date: '2024-12-16', type: 'expense', cat: 13, desc: 'Credit Card Processing - November', amount: 89.50, acct: 1, ref: 'SQ-1116', vendor: 'Square' },
      { date: '2024-12-18', type: 'expense', cat: 11, desc: 'Part-time Help - Week 2', amount: 320.00, acct: 1, ref: 'PAY-1218' },
      { date: '2024-12-20', type: 'expense', cat: 14, desc: 'Facebook Ads - December', amount: 150.00, acct: 1, ref: 'FB-1220', vendor: 'Meta' },
      { date: '2024-12-21', type: 'expense', cat: 8, desc: 'Hay Bales - Winter Stock', amount: 380.00, acct: 1, ref: 'HAY-1221', vendor: 'Local Supplier' },
      { date: '2024-12-22', type: 'expense', cat: 9, desc: 'Water Bill - December', amount: 95.00, acct: 1, ref: 'H2O-1222', vendor: 'City of Bullard' },
      
      // November samples
      { date: '2024-11-15', type: 'income', cat: 1, desc: 'Farmers Market - Tyler', amount: 765.00, acct: 1, ref: 'FM-1115' },
      { date: '2024-11-20', type: 'income', cat: 3, desc: 'Food Trailer - Thanksgiving Prep', amount: 2100.00, acct: 1, ref: 'FT-1120' },
      { date: '2024-11-10', type: 'expense', cat: 8, desc: 'Monthly Feed Order', amount: 680.00, acct: 1, ref: 'TS-7654', vendor: 'Tractor Supply' },
      { date: '2024-11-25', type: 'expense', cat: 16, desc: 'Cooler Repair', amount: 275.00, acct: 1, ref: 'REP-1125', vendor: 'Tyler Appliance' },
    ];

    for (const t of transactions) {
      await client.query(`
        INSERT INTO transactions (date, type, category_id, description, amount, bank_account_id, reference, vendor)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [t.date, t.type, t.cat, t.desc, t.amount, t.acct, t.ref, t.vendor || null]);
    }

    console.log('✓ Transactions created\n');

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Seeding failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seeding
seed().catch(err => {
  console.error(err);
  process.exit(1);
});
