/**
 * Bulk sync menu items to Stripe
 * 
 * Run this to sync all existing menu items to Stripe for POS use.
 * This is safe to run multiple times - it will update existing products
 * and create new prices if prices have changed.
 * 
 * Usage: node scripts/sync-menu-items-stripe.js
 */

require('dotenv').config();
const db = require('../config/database');
const { bulkSyncMenuItemsToStripe } = require('../src/utils/stripeSync');

async function main() {
  console.log('\n🔄 Syncing menu items to Stripe...\n');

  try {
    // Check that Stripe key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY environment variable is not set');
      process.exit(1);
    }

    const result = await bulkSyncMenuItemsToStripe(db);

    console.log('\n✨ Sync complete!');
    console.log(`   ✅ Synced: ${result.synced}`);
    console.log(`   ❌ Failed: ${result.failed}`);
    console.log(`   📦 Total:  ${result.total}\n`);

    if (result.failed > 0) {
      console.log('⚠️  Some items failed to sync. Check the logs for details.\n');
    }

  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    console.error(error.stack);
  } finally {
    await db.close();
  }
}

main();
