/**
 * Stripe Terminal Routes - Connect Edition
 * Handles POS terminal operations using Stripe Connect
 * Each tenant's terminals connect to their own connected account
 */

const express = require('express');
const Stripe = require('stripe');
const db = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get tenant's Stripe Connect account ID
 * Throws error if tenant doesn't have Connect set up
 */
async function getTenantStripeAccount(tenantId, requireActive = true) {
  const result = await db.query(`
    SELECT 
      stripe_account_id, 
      stripe_charges_enabled,
      stripe_account_status,
      name
    FROM tenants WHERE id = $1
  `, [tenantId]);
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Tenant not found');
  }
  
  const tenant = result.rows[0];
  
  if (!tenant.stripe_account_id) {
    throw new ApiError(400, 'Stripe Connect not configured for this tenant. Please complete Stripe onboarding in Settings.');
  }
  
  if (requireActive && !tenant.stripe_charges_enabled) {
    throw new ApiError(400, `Stripe account for ${tenant.name} cannot accept payments yet. Please complete Stripe onboarding.`);
  }
  
  return tenant.stripe_account_id;
}

/**
 * Get the platform application fee percentage from settings
 */
async function getPlatformFeePercent() {
  try {
    const result = await db.query(
      "SELECT value FROM platform_settings WHERE key = 'stripe_connect_fee_percent'"
    );
    return result.rows.length > 0 ? parseFloat(result.rows[0].value) : 2.5;
  } catch (error) {
    logger.warn('Could not fetch platform fee setting, using default 2.5%');
    return 2.5;
  }
}

/**
 * Calculate application fee from amount
 */
async function calculateApplicationFee(amount) {
  const feePercent = await getPlatformFeePercent();
  return Math.round(amount * (feePercent / 100));
}

// ============================================================================
// CONNECTION TOKEN - Required by Stripe Terminal SDK
// ============================================================================

/**
 * POST /terminal/connection-token
 * Generate a connection token for the Terminal SDK
 * The token is scoped to the tenant's connected account
 */
router.post('/connection-token', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const stripeAccountId = await getTenantStripeAccount(req.user.tenant_id, false);
  
  // Create connection token on the connected account
  const connectionToken = await stripe.terminal.connectionTokens.create(
    {},
    { stripeAccount: stripeAccountId }
  );
  
  res.json({
    status: 'success',
    secret: connectionToken.secret
  });
}));

// ============================================================================
// LOCATIONS - Stripe Terminal requires registered locations
// ============================================================================

/**
 * GET /terminal/locations
 * List all registered terminal locations for this tenant
 */
router.get('/locations', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const stripeAccountId = await getTenantStripeAccount(req.user.tenant_id, false);
  
  const locations = await stripe.terminal.locations.list(
    { limit: 100 },
    { stripeAccount: stripeAccountId }
  );
  
  // Sync to local database for tracking
  for (const location of locations.data) {
    await db.query(`
      INSERT INTO stripe_terminal_locations 
      (tenant_id, stripe_location_id, display_name, address_line1, address_city, 
       address_state, address_postal_code, address_country)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (tenant_id, stripe_location_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        updated_at = CURRENT_TIMESTAMP
    `, [
      req.user.tenant_id,
      location.id,
      location.display_name,
      location.address?.line1,
      location.address?.city,
      location.address?.state,
      location.address?.postal_code,
      location.address?.country || 'US'
    ]);
  }
  
  res.json({
    status: 'success',
    data: locations.data
  });
}));

/**
 * POST /terminal/locations
 * Register a new terminal location on the connected account
 */
router.post('/locations', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { display_name, address } = req.body;
  
  if (!display_name || !address) {
    throw new ApiError(400, 'display_name and address are required');
  }

  const stripeAccountId = await getTenantStripeAccount(req.user.tenant_id, false);

  const location = await stripe.terminal.locations.create(
    {
      display_name,
      address: {
        line1: address.line1,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country || 'US'
      }
    },
    { stripeAccount: stripeAccountId }
  );

  // Save to local database
  await db.query(`
    INSERT INTO stripe_terminal_locations 
    (tenant_id, stripe_location_id, display_name, address_line1, address_city, 
     address_state, address_postal_code, address_country)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [
    req.user.tenant_id,
    location.id,
    location.display_name,
    address.line1,
    address.city,
    address.state,
    address.postal_code,
    address.country || 'US'
  ]);

  logger.info('Terminal location created on connected account', { 
    locationId: location.id, 
    displayName: display_name,
    tenantId: req.user.tenant_id,
    stripeAccountId 
  });

  res.status(201).json({
    status: 'success',
    data: location
  });
}));

/**
 * DELETE /terminal/locations/:locationId
 * Delete a terminal location
 */
router.delete('/locations/:locationId', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { locationId } = req.params;
  const stripeAccountId = await getTenantStripeAccount(req.user.tenant_id, false);

  await stripe.terminal.locations.del(
    locationId,
    { stripeAccount: stripeAccountId }
  );

  // Remove from local database
  await db.query(`
    DELETE FROM stripe_terminal_locations 
    WHERE stripe_location_id = $1 AND tenant_id = $2
  `, [locationId, req.user.tenant_id]);

  logger.info('Terminal location deleted', { locationId, tenantId: req.user.tenant_id });

  res.json({
    status: 'success',
    message: 'Location deleted'
  });
}));

// ============================================================================
// READERS - Manage physical card readers
// ============================================================================

/**
 * GET /terminal/readers
 * List all registered readers for this tenant
 */
router.get('/readers', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { location } = req.query;
  const stripeAccountId = await getTenantStripeAccount(req.user.tenant_id, false);
  
  const params = { limit: 100 };
  if (location) {
    params.location = location;
  }

  const readers = await stripe.terminal.readers.list(
    params,
    { stripeAccount: stripeAccountId }
  );
  
  // Sync to local database
  for (const reader of readers.data) {
    await db.query(`
      INSERT INTO stripe_terminal_readers 
      (tenant_id, stripe_reader_id, stripe_location_id, label, device_type, 
       serial_number, status, last_seen_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (tenant_id, stripe_reader_id) DO UPDATE SET
        label = EXCLUDED.label,
        status = EXCLUDED.status,
        last_seen_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    `, [
      req.user.tenant_id,
      reader.id,
      reader.location,
      reader.label,
      reader.device_type,
      reader.serial_number,
      reader.status
    ]);
  }
  
  res.json({
    status: 'success',
    data: readers.data
  });
}));

/**
 * POST /terminal/readers
 * Register a new reader on the connected account
 */
router.post('/readers', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { registration_code, label, location } = req.body;

  if (!registration_code || !location) {
    throw new ApiError(400, 'registration_code and location are required');
  }

  const stripeAccountId = await getTenantStripeAccount(req.user.tenant_id, false);

  const reader = await stripe.terminal.readers.create(
    {
      registration_code,
      label: label || 'POS Reader',
      location
    },
    { stripeAccount: stripeAccountId }
  );

  // Save to local database
  await db.query(`
    INSERT INTO stripe_terminal_readers 
    (tenant_id, stripe_reader_id, stripe_location_id, label, device_type, serial_number, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [
    req.user.tenant_id,
    reader.id,
    reader.location,
    reader.label,
    reader.device_type,
    reader.serial_number,
    reader.status
  ]);

  logger.info('Terminal reader registered on connected account', { 
    readerId: reader.id, 
    label: reader.label,
    tenantId: req.user.tenant_id,
    stripeAccountId
  });

  res.status(201).json({
    status: 'success',
    data: reader
  });
}));

/**
 * DELETE /terminal/readers/:readerId
 * Delete a reader
 */
router.delete('/readers/:readerId', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { readerId } = req.params;
  const stripeAccountId = await getTenantStripeAccount(req.user.tenant_id, false);

  await stripe.terminal.readers.del(
    readerId,
    { stripeAccount: stripeAccountId }
  );

  // Remove from local database
  await db.query(`
    DELETE FROM stripe_terminal_readers 
    WHERE stripe_reader_id = $1 AND tenant_id = $2
  `, [readerId, req.user.tenant_id]);

  logger.info('Terminal reader deleted', { readerId, tenantId: req.user.tenant_id });

  res.json({
    status: 'success',
    message: 'Reader deleted'
  });
}));

// ============================================================================
// PAYMENT INTENTS - Create and manage payments with application fees
// ============================================================================

/**
 * POST /terminal/payment-intents
 * Create a payment intent for terminal collection with application fee
 */
router.post('/payment-intents', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { amount, description, metadata } = req.body;

  if (!amount || amount < 50) {
    throw new ApiError(400, 'Amount must be at least 50 cents');
  }

  const stripeAccountId = await getTenantStripeAccount(req.user.tenant_id, true);
  
  // Calculate platform application fee
  const applicationFee = await calculateApplicationFee(amount);

  // Create payment intent on connected account with direct charges
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: Math.round(amount),
      currency: 'usd',
      payment_method_types: ['card_present'],
      capture_method: 'automatic',
      description: description || 'POS Sale',
      application_fee_amount: applicationFee,
      metadata: {
        ...metadata,
        source: 'pos_terminal',
        tenant_id: req.user.tenant_id,
        created_by: req.user.id
      }
    },
    { stripeAccount: stripeAccountId }
  );

  logger.info('Payment intent created for terminal on connected account', { 
    paymentIntentId: paymentIntent.id, 
    amount,
    applicationFee,
    createdBy: req.user.id,
    tenantId: req.user.tenant_id,
    stripeAccountId
  });

  res.status(201).json({
    status: 'success',
    data: {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
      application_fee_amount: applicationFee
    }
  });
}));

/**
 * POST /terminal/payment-intents/:paymentIntentId/process
 * Process payment on a specific reader
 */
router.post('/payment-intents/:paymentIntentId/process', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.params;
  const { readerId } = req.body;

  if (!readerId) {
    throw new ApiError(400, 'readerId is required');
  }

  const stripeAccountId = await getTenantStripeAccount(req.user.tenant_id, true);

  const reader = await stripe.terminal.readers.processPaymentIntent(
    readerId,
    { payment_intent: paymentIntentId },
    { stripeAccount: stripeAccountId }
  );

  logger.info('Payment processing on reader', { 
    paymentIntentId, 
    readerId,
    tenantId: req.user.tenant_id 
  });

  res.json({
    status: 'success',
    data: reader
  });
}));

/**
 * POST /terminal/payment-intents/:paymentIntentId/cancel
 * Cancel a payment intent
 */
router.post('/payment-intents/:paymentIntentId/cancel', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.params;
  const stripeAccountId = await getTenantStripeAccount(req.user.tenant_id, true);

  const paymentIntent = await stripe.paymentIntents.cancel(
    paymentIntentId,
    { stripeAccount: stripeAccountId }
  );

  logger.info('Payment intent cancelled', { paymentIntentId, tenantId: req.user.tenant_id });

  res.json({
    status: 'success',
    data: paymentIntent
  });
}));

/**
 * GET /terminal/payment-intents/:paymentIntentId
 * Retrieve a payment intent status
 */
router.get('/payment-intents/:paymentIntentId', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.params;
  const stripeAccountId = await getTenantStripeAccount(req.user.tenant_id, true);

  const paymentIntent = await stripe.paymentIntents.retrieve(
    paymentIntentId,
    { stripeAccount: stripeAccountId }
  );

  res.json({
    status: 'success',
    data: {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
      charges: paymentIntent.charges?.data || []
    }
  });
}));

/**
 * POST /terminal/readers/:readerId/cancel-action
 * Cancel the current action on a reader
 */
router.post('/readers/:readerId/cancel-action', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { readerId } = req.params;
  const stripeAccountId = await getTenantStripeAccount(req.user.tenant_id, true);

  const reader = await stripe.terminal.readers.cancelAction(
    readerId,
    { stripeAccount: stripeAccountId }
  );

  logger.info('Reader action cancelled', { readerId, tenantId: req.user.tenant_id });

  res.json({
    status: 'success',
    data: reader
  });
}));

// ============================================================================
// CONNECT STATUS CHECK
// ============================================================================

/**
 * GET /terminal/connect-status
 * Check if tenant's Stripe Connect is properly configured for terminal use
 */
router.get('/connect-status', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT 
      stripe_account_id, 
      stripe_charges_enabled,
      stripe_payouts_enabled,
      stripe_account_status,
      stripe_onboarding_complete
    FROM tenants WHERE id = $1
  `, [req.user.tenant_id]);
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Tenant not found');
  }
  
  const tenant = result.rows[0];
  
  const status = {
    connected: !!tenant.stripe_account_id,
    account_id: tenant.stripe_account_id,
    charges_enabled: tenant.stripe_charges_enabled || false,
    payouts_enabled: tenant.stripe_payouts_enabled || false,
    onboarding_complete: tenant.stripe_onboarding_complete || false,
    status: tenant.stripe_account_status || 'not_connected',
    terminal_ready: tenant.stripe_charges_enabled === true
  };
  
  // Check for locations and readers if connected
  if (status.connected) {
    const locationsResult = await db.query(
      'SELECT COUNT(*) FROM stripe_terminal_locations WHERE tenant_id = $1',
      [req.user.tenant_id]
    );
    const readersResult = await db.query(
      'SELECT COUNT(*) FROM stripe_terminal_readers WHERE tenant_id = $1',
      [req.user.tenant_id]
    );
    
    status.locations_count = parseInt(locationsResult.rows[0].count);
    status.readers_count = parseInt(readersResult.rows[0].count);
  }

  res.json({
    status: 'success',
    data: status
  });
}));

// ============================================================================
// ORDERS - Record completed sales (unchanged, but now with Connect context)
// ============================================================================

/**
 * POST /terminal/orders
 * Record a completed sale (card or cash)
 */
router.post('/orders', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { 
    items, 
    subtotal, 
    tax_amount, 
    total, 
    payment_method,
    payment_intent_id,
    cash_received,
    change_given,
    notes
  } = req.body;

  if (!items || items.length === 0) {
    throw new ApiError(400, 'Order must have at least one item');
  }

  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');

    const orderResult = await client.query(`
      INSERT INTO pos_orders (
        order_number, subtotal, tax_amount, total, 
        payment_method, payment_intent_id, 
        cash_received, change_given, notes,
        status, created_by, tenant_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, 'completed', $10, $11
      )
      RETURNING *
    `, [
      await generateOrderNumber(client, req.user.tenant_id),
      subtotal,
      tax_amount || 0,
      total,
      payment_method,
      payment_intent_id,
      cash_received,
      change_given,
      notes,
      req.user.id,
      req.user.tenant_id
    ]);

    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(`
        INSERT INTO pos_order_items (
          order_id, item_id, name, quantity, unit_price, total_price
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        order.id,
        item.item_id,
        item.name,
        item.quantity,
        item.unit_price,
        item.total_price
      ]);

      if (item.item_id) {
        await client.query(`
          UPDATE items 
          SET inventory_quantity = inventory_quantity - $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2 AND item_type = 'inventory' AND tenant_id = $3
        `, [item.quantity, item.item_id, req.user.tenant_id]);
      }
    }

    await client.query('COMMIT');

    logger.info('POS order created', { 
      orderId: order.id, 
      orderNumber: order.order_number,
      total,
      paymentMethod: payment_method,
      paymentIntentId: payment_intent_id,
      createdBy: req.user.id,
      tenantId: req.user.tenant_id
    });

    res.status(201).json({
      status: 'success',
      data: order
    });

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}));

/**
 * GET /terminal/orders
 * List orders with optional date filtering (tenant-scoped)
 */
router.get('/orders', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { date, start_date, end_date, limit = 50 } = req.query;
  const tenantId = req.user.tenant_id;

  let queryText = `
    SELECT o.*, a.name as cashier_name
    FROM pos_orders o
    LEFT JOIN accounts a ON o.created_by = a.id
    WHERE o.tenant_id = $1
  `;
  const params = [tenantId];
  let paramCount = 1;

  if (date) {
    paramCount++;
    params.push(date);
    queryText += ' AND DATE(o.created_at) = $' + paramCount;
  } else if (start_date && end_date) {
    paramCount++;
    params.push(start_date);
    queryText += ' AND DATE(o.created_at) >= $' + paramCount;
    paramCount++;
    params.push(end_date);
    queryText += ' AND DATE(o.created_at) <= $' + paramCount;
  }

  paramCount++;
  params.push(parseInt(limit));
  queryText += ' ORDER BY o.created_at DESC LIMIT $' + paramCount;

  const result = await db.query(queryText, params);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

/**
 * GET /terminal/orders/:orderId
 * Get a single order with items (tenant-scoped)
 */
router.get('/orders/:orderId', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const tenantId = req.user.tenant_id;

  const orderResult = await db.query(`
    SELECT o.*, a.name as cashier_name
    FROM pos_orders o
    LEFT JOIN accounts a ON o.created_by = a.id
    WHERE o.id = $1 AND o.tenant_id = $2
  `, [orderId, tenantId]);

  if (orderResult.rows.length === 0) {
    throw new ApiError(404, 'Order not found');
  }

  const itemsResult = await db.query(`
    SELECT * FROM pos_order_items WHERE order_id = $1 ORDER BY id
  `, [orderId]);

  const order = orderResult.rows[0];
  order.items = itemsResult.rows;

  res.json({
    status: 'success',
    data: order
  });
}));

// ============================================================================
// LAYOUTS - Get available layouts for this terminal
// ============================================================================

/**
 * GET /terminal/layouts
 * Get available POS layouts for this tenant
 */
router.get('/layouts', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;

  try {
    const result = await db.query(`
      SELECT id, name, description, is_default, grid_columns
      FROM pos_layouts
      WHERE tenant_id = $1 AND is_active = true
      ORDER BY is_default DESC, name
    `, [tenantId]);

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (err) {
    logger.info('pos_layouts table not available', { error: err.message });
    res.json({
      status: 'success',
      data: []
    });
  }
}));

// ============================================================================
// PRODUCTS - Get items for POS display
// ============================================================================

/**
 * GET /terminal/products
 * Get products for POS display based on layout
 */
router.get('/products', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { layout_id, category_id, search } = req.query;
  const tenantId = req.user.tenant_id;

  let effectiveLayoutId = layout_id || null;
  let useLayouts = false;
  
  if (!effectiveLayoutId) {
    try {
      const defaultLayout = await db.query(`
        SELECT id FROM pos_layouts 
        WHERE tenant_id = $1 AND is_default = true AND is_active = true
        LIMIT 1
      `, [tenantId]);
      
      if (defaultLayout.rows.length > 0) {
        effectiveLayoutId = defaultLayout.rows[0].id;
        useLayouts = true;
      }
    } catch (err) {
      logger.info('pos_layouts table not available, using all active items');
    }
  } else {
    useLayouts = true;
  }

  if (useLayouts && effectiveLayoutId) {
    try {
      let queryText = `
        SELECT 
          i.id, i.name, i.description, i.sku,
          i.price, i.member_price, i.cost,
          i.image_url, i.inventory_quantity, i.item_type,
          i.low_stock_threshold,
          i.stripe_product_id, i.stripe_price_id,
          c.id as category_id, c.name as category_name,
          li.display_order,
          li.grid_row,
          li.grid_column,
          COALESCE(li.display_name, i.name) as display_name,
          li.display_color
        FROM pos_layout_items li
        JOIN items i ON li.item_id = i.id AND i.tenant_id = $2
        LEFT JOIN categories c ON i.category_id = c.id
        JOIN pos_layouts pl ON li.layout_id = pl.id
        WHERE li.layout_id = $1 
          AND pl.tenant_id = $2
          AND i.status = 'active'
      `;
      const params = [effectiveLayoutId, tenantId];
      let paramCount = 2;

      if (category_id) {
        paramCount++;
        params.push(category_id);
        queryText += ' AND i.category_id = $' + paramCount;
      }

      if (search) {
        paramCount++;
        params.push('%' + search + '%');
        queryText += ' AND (i.name ILIKE $' + paramCount + ' OR i.sku ILIKE $' + paramCount + ')';
      }

      queryText += ' ORDER BY li.display_order, i.name';

      const result = await db.query(queryText, params);

      return res.json({
        status: 'success',
        data: result.rows,
        layout_id: effectiveLayoutId
      });
    } catch (err) {
      logger.warn('Layout query failed, falling back to all items', { error: err.message });
    }
  }

  // Fallback: Return all active items
  let queryText = `
    SELECT 
      i.id, i.name, i.description, i.sku,
      i.price, i.member_price, i.cost,
      i.image_url, i.inventory_quantity, i.item_type,
      i.low_stock_threshold,
      i.stripe_product_id, i.stripe_price_id,
      c.id as category_id, c.name as category_name,
      0 as display_order,
      NULL as grid_row,
      NULL as grid_column,
      i.name as display_name,
      NULL as display_color
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.id
    WHERE i.status = 'active' AND i.tenant_id = $1
  `;
  const params = [tenantId];
  let paramCount = 1;

  if (category_id) {
    paramCount++;
    params.push(category_id);
    queryText += ' AND i.category_id = $' + paramCount;
  }

  if (search) {
    paramCount++;
    params.push('%' + search + '%');
    queryText += ' AND (i.name ILIKE $' + paramCount + ' OR i.sku ILIKE $' + paramCount + ')';
  }

  queryText += ' ORDER BY c.name NULLS LAST, i.name';

  const result = await db.query(queryText, params);

  res.json({
    status: 'success',
    data: result.rows,
    layout_id: null
  });
}));

/**
 * GET /terminal/categories
 * Get all categories for filtering (tenant-scoped)
 */
router.get('/categories', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  
  const result = await db.query(`
    SELECT c.id, c.name, COUNT(i.id) as item_count
    FROM categories c
    LEFT JOIN items i ON c.id = i.category_id AND i.status = 'active' AND i.tenant_id = $1
    WHERE c.tenant_id = $1
    GROUP BY c.id, c.name
    HAVING COUNT(i.id) > 0
    ORDER BY c.name
  `, [tenantId]);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

// ============================================================================
// DAILY SUMMARY
// ============================================================================

/**
 * GET /terminal/summary
 * Get sales summary for a date range (tenant-scoped)
 */
router.get('/summary', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { date, start_date, end_date } = req.query;
  const tenantId = req.user.tenant_id;

  let dateFilter = 'DATE(created_at) = CURRENT_DATE';
  const params = [tenantId];
  let paramCount = 1;

  if (date) {
    paramCount++;
    params.push(date);
    dateFilter = 'DATE(created_at) = $' + paramCount;
  } else if (start_date && end_date) {
    paramCount++;
    params.push(start_date);
    const startParam = paramCount;
    paramCount++;
    params.push(end_date);
    dateFilter = 'DATE(created_at) BETWEEN $' + startParam + ' AND $' + paramCount;
  }

  const result = await db.query(`
    SELECT 
      COUNT(*) as order_count,
      COALESCE(SUM(subtotal), 0) as subtotal,
      COALESCE(SUM(tax_amount), 0) as tax_total,
      COALESCE(SUM(total), 0) as total,
      COALESCE(SUM(CASE WHEN payment_method = 'card' THEN total ELSE 0 END), 0) as card_total,
      COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total ELSE 0 END), 0) as cash_total,
      SUM(CASE WHEN payment_method = 'card' THEN 1 ELSE 0 END) as card_count,
      SUM(CASE WHEN payment_method = 'cash' THEN 1 ELSE 0 END) as cash_count
    FROM pos_orders
    WHERE tenant_id = $1 AND status = 'completed' AND ${dateFilter}
  `, params);

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function generateOrderNumber(client, tenantId) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  const result = await client.query(`
    SELECT order_number FROM pos_orders 
    WHERE order_number LIKE $1 AND tenant_id = $2
    ORDER BY order_number DESC LIMIT 1
  `, [today + '%', tenantId]);

  if (result.rows.length === 0) {
    return today + '-001';
  }

  const lastNumber = parseInt(result.rows[0].order_number.split('-')[1]);
  return today + '-' + String(lastNumber + 1).padStart(3, '0');
}

module.exports = router;
