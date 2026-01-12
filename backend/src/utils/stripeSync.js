/**
 * Stripe Product/Price Sync Service
 * Handles synchronization of items with Stripe Products and Prices
 */

const Stripe = require('stripe');
const logger = require('./logger');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create or update a Stripe Product for an item
 * @param {Object} item - The item from the database
 * @returns {Object} - Updated Stripe product/price IDs
 */
async function syncItemToStripe(item) {
  try {
    let stripeProductId = item.stripe_product_id;
    let stripePriceId = item.stripe_price_id;
    let stripeMemberPriceId = item.stripe_member_price_id;

    // Prepare product data
    const productData = {
      name: item.name,
      description: item.description || undefined,
      metadata: {
        item_id: item.id,
        sku: item.sku,
        category: item.category_name || '',
        item_type: item.item_type
      },
      active: item.status === 'active',
      tax_code: item.is_taxable ? 'txcd_99999999' : 'txcd_00000000', // General taxable vs non-taxable
    };

    // Add image if available
    if (item.image_url) {
      productData.images = [item.image_url];
    }

    // Create or update the Stripe Product
    if (stripeProductId) {
      // Update existing product
      await stripe.products.update(stripeProductId, productData);
      logger.info('Stripe product updated', { itemId: item.id, stripeProductId });
    } else {
      // Create new product
      const product = await stripe.products.create(productData);
      stripeProductId = product.id;
      logger.info('Stripe product created', { itemId: item.id, stripeProductId });
    }

    // Handle regular price
    const priceAmount = Math.round(item.price * 100); // Convert to cents
    
    if (stripePriceId) {
      // Stripe prices are immutable - check if price changed
      const existingPrice = await stripe.prices.retrieve(stripePriceId);
      if (existingPrice.unit_amount !== priceAmount) {
        // Archive old price and create new one
        await stripe.prices.update(stripePriceId, { active: false });
        const newPrice = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: priceAmount,
          currency: 'usd',
          metadata: {
            item_id: item.id,
            price_type: 'regular'
          }
        });
        stripePriceId = newPrice.id;
        logger.info('Stripe price updated (new price created)', { itemId: item.id, stripePriceId });
      }
    } else {
      // Create new price
      const price = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: priceAmount,
        currency: 'usd',
        metadata: {
          item_id: item.id,
          price_type: 'regular'
        }
      });
      stripePriceId = price.id;
      logger.info('Stripe price created', { itemId: item.id, stripePriceId });
    }

    // Handle member price if different from regular price
    const memberPrice = item.member_price || Math.round(item.price * 0.9 * 100) / 100;
    const memberPriceAmount = Math.round(memberPrice * 100);

    if (memberPriceAmount < priceAmount) {
      if (stripeMemberPriceId) {
        // Check if member price changed
        const existingMemberPrice = await stripe.prices.retrieve(stripeMemberPriceId);
        if (existingMemberPrice.unit_amount !== memberPriceAmount) {
          await stripe.prices.update(stripeMemberPriceId, { active: false });
          const newMemberPrice = await stripe.prices.create({
            product: stripeProductId,
            unit_amount: memberPriceAmount,
            currency: 'usd',
            metadata: {
              item_id: item.id,
              price_type: 'member'
            }
          });
          stripeMemberPriceId = newMemberPrice.id;
          logger.info('Stripe member price updated', { itemId: item.id, stripeMemberPriceId });
        }
      } else {
        // Create member price
        const memberPriceObj = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: memberPriceAmount,
          currency: 'usd',
          metadata: {
            item_id: item.id,
            price_type: 'member'
          }
        });
        stripeMemberPriceId = memberPriceObj.id;
        logger.info('Stripe member price created', { itemId: item.id, stripeMemberPriceId });
      }
    }

    return {
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
      stripe_member_price_id: stripeMemberPriceId
    };

  } catch (error) {
    logger.error('Error syncing item to Stripe', { 
      itemId: item.id, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Archive a Stripe Product (when item is deleted or deactivated)
 * @param {string} stripeProductId - The Stripe Product ID
 */
async function archiveStripeProduct(stripeProductId) {
  try {
    if (!stripeProductId) return;
    
    await stripe.products.update(stripeProductId, { active: false });
    logger.info('Stripe product archived', { stripeProductId });
  } catch (error) {
    logger.error('Error archiving Stripe product', { 
      stripeProductId, 
      error: error.message 
    });
    // Don't throw - archiving is not critical
  }
}

/**
 * Reactivate a Stripe Product
 * @param {string} stripeProductId - The Stripe Product ID
 */
async function reactivateStripeProduct(stripeProductId) {
  try {
    if (!stripeProductId) return;
    
    await stripe.products.update(stripeProductId, { active: true });
    logger.info('Stripe product reactivated', { stripeProductId });
  } catch (error) {
    logger.error('Error reactivating Stripe product', { 
      stripeProductId, 
      error: error.message 
    });
  }
}

/**
 * Bulk sync all active items to Stripe
 * Useful for initial setup or recovery
 * @param {Object} db - Database connection
 */
async function bulkSyncItemsToStripe(db) {
  try {
    const result = await db.query(`
      SELECT i.*, c.name as category_name 
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.status = 'active'
    `);

    const items = result.rows;
    let synced = 0;
    let failed = 0;

    for (const item of items) {
      try {
        const stripeIds = await syncItemToStripe(item);
        
        // Update the database with Stripe IDs
        await db.query(`
          UPDATE items SET
            stripe_product_id = $1,
            stripe_price_id = $2,
            stripe_member_price_id = $3,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $4
        `, [
          stripeIds.stripe_product_id,
          stripeIds.stripe_price_id,
          stripeIds.stripe_member_price_id,
          item.id
        ]);

        synced++;
      } catch (error) {
        failed++;
        logger.error('Failed to sync item', { itemId: item.id, error: error.message });
      }
    }

    logger.info('Bulk Stripe sync complete', { synced, failed, total: items.length });
    return { synced, failed, total: items.length };

  } catch (error) {
    logger.error('Bulk sync failed', { error: error.message });
    throw error;
  }
}

module.exports = {
  syncItemToStripe,
  archiveStripeProduct,
  reactivateStripeProduct,
  bulkSyncItemsToStripe
};
