/**
 * Stripe Bulk Sync Script
 * Syncs all active items to Stripe (supports Connect)
 *
 * Usage:
 *   node scripts/sync-stripe.js                        # platform account
 *   node scripts/sync-stripe.js --tenant=<tenant_id>   # connected account
 */

require('dotenv').config();
const db = require('../config/database');
const { bulkSyncItemsToStripe, getTenantStripeAccount } = require('../src/utils/stripeSync');

async function main() {
  console.log('🔄 Starting Stripe item sync...\n');

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY is not set in .env');
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
    const result = await bulkSyncItemsToStripe(db, { stripeAccountId, tenantId });

    console.log('\n✅ Stripe item sync complete!');
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
