/**
 * Stripe Bulk Sync Script
 * Run this to sync all active items to Stripe
 * 
 * Usage: node scripts/sync-stripe.js
 */

require('dotenv').config();
const db = require('../config/database');
const { bulkSyncItemsToStripe } = require('../src/utils/stripeSync');

async function main() {
  console.log('🔄 Starting Stripe sync...\n');

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY is not set in .env');
    process.exit(1);
  }

  try {
    const result = await bulkSyncItemsToStripe(db);
    
    console.log('\n✅ Stripe sync complete!');
    console.log(`   Synced: ${result.synced}`);
    console.log(`   Failed: ${result.failed}`);
    console.log(`   Total:  ${result.total}`);
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
  } finally {
    await db.close();
    process.exit(0);
  }
}

main();
