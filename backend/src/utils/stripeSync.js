/**
 * Stripe Product/Price Sync Service
 * Handles synchronization of items with Stripe Products and Prices.
 *
 * Supports Stripe Connect: pass { stripeAccountId } in options to create
 * products/prices on a tenant's connected account instead of the platform.
 */

const Stripe = require('stripe');
const logger = require('./logger');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Build Stripe request options for Connect.
 * Returns { stripeAccount: id } when a connected account is specified,
 * or undefined (platform account) otherwise.
 */
function connectOpts(stripeAccountId) {
  return stripeAccountId ? { stripeAccount: stripeAccountId } : undefined;
}

// ============================================================================
// ITEMS (ecommerce products)
// ============================================================================

/**
 * Create or update a Stripe Product for an item
 * @param {Object} item - The item from the database
 * @param {Object} [options] - { stripeAccountId }
 * @returns {Object} - Updated Stripe product/price IDs
 */
async function syncItemToStripe(item, options = {}) {
  const { stripeAccountId } = options;
  const opts = connectOpts(stripeAccountId);

  try {
    let stripeProductId = item.stripe_product_id;
    let stripePriceId = item.stripe_price_id;
    let stripeMemberPriceId = item.stripe_member_price_id;

    // Prepare product data
    const productData = {
      name: item.name,
      description: item.description || undefined,
      metadata: {
        item_id: String(item.id),
        sku: item.sku || '',
        category: item.category_name || '',
        item_type: item.item_type || '',
      },
      active: item.status === 'active',
      tax_code: item.is_taxable ? 'txcd_99999999' : 'txcd_00000000',
    };

    // Add image if available
    if (item.image_url) {
      productData.images = [item.image_url];
    }

    // Create or update the Stripe Product
    if (stripeProductId) {
      await stripe.products.update(stripeProductId, productData, opts);
      logger.info('Stripe product updated', { itemId: item.id, stripeProductId, stripeAccountId });
    } else {
      const product = await stripe.products.create(productData, opts);
      stripeProductId = product.id;
      logger.info('Stripe product created', { itemId: item.id, stripeProductId, stripeAccountId });
    }

    // Handle regular price
    const priceAmount = Math.round(item.price * 100); // Convert to cents

    if (stripePriceId) {
      // Stripe prices are immutable - check if price changed
      const existingPrice = await stripe.prices.retrieve(stripePriceId, opts);
      if (existingPrice.unit_amount !== priceAmount) {
        await stripe.prices.update(stripePriceId, { active: false }, opts);
        const newPrice = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: priceAmount,
          currency: 'usd',
          metadata: { item_id: String(item.id), price_type: 'regular' },
        }, opts);
        stripePriceId = newPrice.id;
        logger.info('Stripe price updated (new price created)', { itemId: item.id, stripePriceId, stripeAccountId });
      }
    } else {
      const price = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: priceAmount,
        currency: 'usd',
        metadata: { item_id: String(item.id), price_type: 'regular' },
      }, opts);
      stripePriceId = price.id;
      logger.info('Stripe price created', { itemId: item.id, stripePriceId, stripeAccountId });
    }

    // Handle member price if different from regular price
    const memberPrice = item.member_price || Math.round(item.price * 0.9 * 100) / 100;
    const memberPriceAmount = Math.round(memberPrice * 100);

    if (memberPriceAmount < priceAmount) {
      if (stripeMemberPriceId) {
        const existingMemberPrice = await stripe.prices.retrieve(stripeMemberPriceId, opts);
        if (existingMemberPrice.unit_amount !== memberPriceAmount) {
          await stripe.prices.update(stripeMemberPriceId, { active: false }, opts);
          const newMemberPrice = await stripe.prices.create({
            product: stripeProductId,
            unit_amount: memberPriceAmount,
            currency: 'usd',
            metadata: { item_id: String(item.id), price_type: 'member' },
          }, opts);
          stripeMemberPriceId = newMemberPrice.id;
          logger.info('Stripe member price updated', { itemId: item.id, stripeMemberPriceId, stripeAccountId });
        }
      } else {
        const memberPriceObj = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: memberPriceAmount,
          currency: 'usd',
          metadata: { item_id: String(item.id), price_type: 'member' },
        }, opts);
        stripeMemberPriceId = memberPriceObj.id;
        logger.info('Stripe member price created', { itemId: item.id, stripeMemberPriceId, stripeAccountId });
      }
    }

    return {
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
      stripe_member_price_id: stripeMemberPriceId,
    };
  } catch (error) {
    logger.error('Error syncing item to Stripe', {
      itemId: item.id,
      stripeAccountId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Archive a Stripe Product (when item is deleted or deactivated)
 * @param {string} stripeProductId - The Stripe Product ID
 * @param {Object} [options] - { stripeAccountId }
 */
async function archiveStripeProduct(stripeProductId, options = {}) {
  try {
    if (!stripeProductId) return;
    const opts = connectOpts(options.stripeAccountId);
    await stripe.products.update(stripeProductId, { active: false }, opts);
    logger.info('Stripe product archived', { stripeProductId, stripeAccountId: options.stripeAccountId });
  } catch (error) {
    logger.error('Error archiving Stripe product', {
      stripeProductId,
      error: error.message,
    });
  }
}

/**
 * Reactivate a Stripe Product
 * @param {string} stripeProductId - The Stripe Product ID
 * @param {Object} [options] - { stripeAccountId }
 */
async function reactivateStripeProduct(stripeProductId, options = {}) {
  try {
    if (!stripeProductId) return;
    const opts = connectOpts(options.stripeAccountId);
    await stripe.products.update(stripeProductId, { active: true }, opts);
    logger.info('Stripe product reactivated', { stripeProductId, stripeAccountId: options.stripeAccountId });
  } catch (error) {
    logger.error('Error reactivating Stripe product', {
      stripeProductId,
      error: error.message,
    });
  }
}

// ============================================================================
// MENU ITEMS (restaurant / POS products)
// ============================================================================

/**
 * Create or update a Stripe Product for a menu item
 * @param {Object} menuItem - The menu item from the database
 * @param {Object} [options] - { stripeAccountId }
 * @returns {Object} - Updated Stripe product/price IDs
 */
async function syncMenuItemToStripe(menuItem, options = {}) {
  const { stripeAccountId } = options;
  const opts = connectOpts(stripeAccountId);

  try {
    // Skip items without a price
    if (!menuItem.price) {
      logger.info('Skipping menu item sync - no price set', { menuItemId: menuItem.id, name: menuItem.name });
      return { stripe_product_id: null, stripe_price_id: null };
    }

    let stripeProductId = menuItem.stripe_product_id;
    let stripePriceId = menuItem.stripe_price_id;

    // Build dietary info for description
    const dietaryFlags = [];
    if (menuItem.is_vegetarian) dietaryFlags.push('Vegetarian');
    if (menuItem.is_vegan) dietaryFlags.push('Vegan');
    if (menuItem.is_gluten_free) dietaryFlags.push('Gluten-Free');
    if (menuItem.is_dairy_free) dietaryFlags.push('Dairy-Free');
    if (menuItem.is_spicy) dietaryFlags.push('Spicy');

    let description = menuItem.description || '';
    if (dietaryFlags.length > 0) {
      description = description ? `${description} (${dietaryFlags.join(', ')})` : dietaryFlags.join(', ');
    }

    // Prepare product data
    const productData = {
      name: menuItem.name,
      description: description || undefined,
      metadata: {
        menu_item_id: String(menuItem.id),
        source: 'menu_items',
        is_vegetarian: menuItem.is_vegetarian ? 'true' : 'false',
        is_vegan: menuItem.is_vegan ? 'true' : 'false',
        is_gluten_free: menuItem.is_gluten_free ? 'true' : 'false',
        is_dairy_free: menuItem.is_dairy_free ? 'true' : 'false',
        is_spicy: menuItem.is_spicy ? 'true' : 'false',
      },
      active: menuItem.is_available !== false,
    };

    // Add image if available
    if (menuItem.image_url) {
      productData.images = [menuItem.image_url];
    }

    // Create or update the Stripe Product
    if (stripeProductId) {
      await stripe.products.update(stripeProductId, productData, opts);
      logger.info('Stripe product updated for menu item', { menuItemId: menuItem.id, stripeProductId, stripeAccountId });
    } else {
      const product = await stripe.products.create(productData, opts);
      stripeProductId = product.id;
      logger.info('Stripe product created for menu item', { menuItemId: menuItem.id, stripeProductId, stripeAccountId });
    }

    // Handle price
    const priceAmount = Math.round(menuItem.price * 100);

    if (stripePriceId) {
      try {
        const existingPrice = await stripe.prices.retrieve(stripePriceId, opts);
        if (existingPrice.unit_amount !== priceAmount) {
          await stripe.prices.update(stripePriceId, { active: false }, opts);
          const newPrice = await stripe.prices.create({
            product: stripeProductId,
            unit_amount: priceAmount,
            currency: 'usd',
            metadata: { menu_item_id: String(menuItem.id), source: 'menu_items' },
          }, opts);
          stripePriceId = newPrice.id;
          logger.info('Stripe price updated for menu item', {
            menuItemId: menuItem.id, stripePriceId, stripeAccountId,
            oldAmount: existingPrice.unit_amount, newAmount: priceAmount,
          });
        }
      } catch (priceError) {
        // Price may have been deleted, create new one
        const newPrice = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: priceAmount,
          currency: 'usd',
          metadata: { menu_item_id: String(menuItem.id), source: 'menu_items' },
        }, opts);
        stripePriceId = newPrice.id;
        logger.info('Stripe price recreated for menu item', { menuItemId: menuItem.id, stripePriceId, stripeAccountId });
      }
    } else {
      const price = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: priceAmount,
        currency: 'usd',
        metadata: { menu_item_id: String(menuItem.id), source: 'menu_items' },
      }, opts);
      stripePriceId = price.id;
      logger.info('Stripe price created for menu item', { menuItemId: menuItem.id, stripePriceId, stripeAccountId });
    }

    return {
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
    };
  } catch (error) {
    logger.error('Error syncing menu item to Stripe', {
      menuItemId: menuItem.id,
      name: menuItem.name,
      stripeAccountId,
      error: error.message,
    });
    throw error;
  }
}

// ============================================================================
// BULK SYNC
// ============================================================================

/**
 * Bulk sync all active items to Stripe
 * @param {Object} db - Database connection
 * @param {Object} [options] - { stripeAccountId, tenantId }
 */
async function bulkSyncItemsToStripe(db, options = {}) {
  try {
    let queryText = `
      SELECT i.*, c.name as category_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.status = 'active'
    `;
    const params = [];

    if (options.tenantId) {
      params.push(options.tenantId);
      queryText += ` AND i.tenant_id = $${params.length}`;
    }

    const result = await db.query(queryText, params);
    const items = result.rows;
    let synced = 0;
    let failed = 0;

    for (const item of items) {
      try {
        const stripeIds = await syncItemToStripe(item, options);

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
          item.id,
        ]);

        synced++;
      } catch (error) {
        failed++;
        logger.error('Failed to sync item', { itemId: item.id, error: error.message });
      }
    }

    logger.info('Bulk Stripe sync complete', { synced, failed, total: items.length, stripeAccountId: options.stripeAccountId });
    return { synced, failed, total: items.length };
  } catch (error) {
    logger.error('Bulk sync failed', { error: error.message });
    throw error;
  }
}

/**
 * Bulk sync all available menu items to Stripe
 * @param {Object} db - Database connection
 * @param {Object} [options] - { stripeAccountId, tenantId }
 */
async function bulkSyncMenuItemsToStripe(db, options = {}) {
  try {
    let queryText = `
      SELECT * FROM menu_items
      WHERE is_available = true AND price IS NOT NULL
    `;
    const params = [];

    if (options.tenantId) {
      params.push(options.tenantId);
      queryText += ` AND tenant_id = $${params.length}`;
    }

    queryText += ` ORDER BY name`;

    const result = await db.query(queryText, params);
    const items = result.rows;
    let synced = 0;
    let failed = 0;

    for (const item of items) {
      try {
        const stripeIds = await syncMenuItemToStripe(item, options);

        await db.query(`
          UPDATE menu_items SET
            stripe_product_id = $1,
            stripe_price_id = $2,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `, [
          stripeIds.stripe_product_id,
          stripeIds.stripe_price_id,
          item.id,
        ]);

        synced++;
      } catch (error) {
        failed++;
        logger.error('Failed to sync menu item', { menuItemId: item.id, name: item.name, error: error.message });
      }
    }

    logger.info('Bulk menu item Stripe sync complete', { synced, failed, total: items.length, stripeAccountId: options.stripeAccountId });
    return { synced, failed, total: items.length };
  } catch (error) {
    logger.error('Bulk menu item sync failed', { error: error.message });
    throw error;
  }
}

// ============================================================================
// HELPER - Resolve tenant's connected Stripe account
// ============================================================================

/**
 * Look up the tenant's Stripe Connect account ID.
 * Returns null if the tenant has no active connected account.
 * @param {Object} db - Database connection
 * @param {string} tenantId - Tenant UUID
 * @returns {string|null} - Stripe connected account ID or null
 */
async function getTenantStripeAccount(db, tenantId) {
  if (!tenantId) return null;
  try {
    const result = await db.query(
      `SELECT stripe_account_id FROM tenants
       WHERE id = $1 AND stripe_charges_enabled = true AND stripe_account_id IS NOT NULL`,
      [tenantId]
    );
    return result.rows[0]?.stripe_account_id || null;
  } catch (error) {
    logger.warn('Could not look up tenant Stripe account', { tenantId, error: error.message });
    return null;
  }
}

module.exports = {
  syncItemToStripe,
  syncMenuItemToStripe,
  archiveStripeProduct,
  reactivateStripeProduct,
  bulkSyncItemsToStripe,
  bulkSyncMenuItemsToStripe,
  getTenantStripeAccount,
};
