/**
 * Bulk sync menu items to Stripe (supports Connect)
 *
 * Safe to run multiple times — updates existing products and creates
 * new prices if prices have changed.
 *
 * Usage:
 *   node scripts/sync-menu-items-stripe.js                        # platform account
 *   node scripts/sync-menu-items-stripe.js --tenant=<tenant_id>   # connected account
 */

require('dotenv').config();
const db = require('../config/database');
const { bulkSyncMenuItemsToStripe, getTenantStripeAccount } = require('../src/utils/stripeSync');

async function main() {
  console.log('\n🔄 Syncing menu items to Stripe...\n');

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY environment variable is not set');
    process.exit(1);
  }

  // Parse --tenant argument
  const tenantArg = process.argv.find(a => a.startsWith('--tenant='));
  const tenantId = tenantArg ? tenantArg.split('=')[1] : null;

  let stripeAccountId = null;
  if (tenantId) {
    stripeAccountId = await getTenantStripeAccount(db, tenantId);
    if (stripeAccountId) {
      console.log(`📡 Using Connect account: ${stripeAccountId} (tenant: ${tenantId})`);
    } else {
      console.log(`⚠️  Tenant ${tenantId} has no active Connect account — syncing to platform`);
    }
  } else {
    console.log('📡 Syncing to platform Stripe account');
  }

  try {
    const result = await bulkSyncMenuItemsToStripe(db, { stripeAccountId, tenantId });

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
