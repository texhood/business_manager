/**
 * Stripe Terminal Routes
 * Handles POS terminal operations including reader management and payments
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
// CONNECTION TOKEN - Required by Stripe Terminal SDK
// ============================================================================

/**
 * POST /terminal/connection-token
 * Generate a connection token for the Terminal SDK
 */
router.post('/connection-token', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const connectionToken = await stripe.terminal.connectionTokens.create();
  
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
 * List all registered terminal locations
 */
router.get('/locations', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const locations = await stripe.terminal.locations.list({ limit: 100 });
  
  res.json({
    status: 'success',
    data: locations.data
  });
}));

/**
 * POST /terminal/locations
 * Register a new terminal location
 */
router.post('/locations', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { display_name, address } = req.body;
  
  if (!display_name || !address) {
    throw new ApiError(400, 'display_name and address are required');
  }

  const location = await stripe.terminal.locations.create({
    display_name,
    address: {
      line1: address.line1,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country || 'US'
    }
  });

  logger.info('Terminal location created', { locationId: location.id, displayName: display_name });

  res.status(201).json({
    status: 'success',
    data: location
  });
}));

// ============================================================================
// READERS - Manage physical card readers
// ============================================================================

/**
 * GET /terminal/readers
 * List all registered readers
 */
router.get('/readers', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { location } = req.query;
  
  const params = { limit: 100 };
  if (location) {
    params.location = location;
  }

  const readers = await stripe.terminal.readers.list(params);
  
  res.json({
    status: 'success',
    data: readers.data
  });
}));

/**
 * POST /terminal/readers
 * Register a new reader (using registration code from reader screen)
 */
router.post('/readers', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { registration_code, label, location } = req.body;

  if (!registration_code || !location) {
    throw new ApiError(400, 'registration_code and location are required');
  }

  const reader = await stripe.terminal.readers.create({
    registration_code,
    label: label || 'POS Reader',
    location
  });

  logger.info('Terminal reader registered', { readerId: reader.id, label: reader.label });

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

  await stripe.terminal.readers.del(readerId);

  logger.info('Terminal reader deleted', { readerId });

  res.json({
    status: 'success',
    message: 'Reader deleted'
  });
}));

// ============================================================================
// PAYMENT INTENTS - Create and manage payments
// ============================================================================

/**
 * POST /terminal/payment-intents
 * Create a payment intent for terminal collection
 */
router.post('/payment-intents', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { amount, description, metadata } = req.body;

  if (!amount || amount < 50) {
    throw new ApiError(400, 'Amount must be at least 50 cents');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount), // Amount in cents
    currency: 'usd',
    payment_method_types: ['card_present'],
    capture_method: 'automatic',
    description: description || 'POS Sale',
    metadata: {
      ...metadata,
      source: 'pos_terminal',
      created_by: req.user.id
    }
  });

  logger.info('Payment intent created for terminal', { 
    paymentIntentId: paymentIntent.id, 
    amount,
    createdBy: req.user.id 
  });

  res.status(201).json({
    status: 'success',
    data: {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      status: paymentIntent.status
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

  const reader = await stripe.terminal.readers.processPaymentIntent(readerId, {
    payment_intent: paymentIntentId
  });

  logger.info('Payment processing on reader', { paymentIntentId, readerId });

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

  const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

  logger.info('Payment intent cancelled', { paymentIntentId });

  res.json({
    status: 'success',
    data: paymentIntent
  });
}));

/**
 * POST /terminal/readers/:readerId/cancel-action
 * Cancel the current action on a reader
 */
router.post('/readers/:readerId/cancel-action', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { readerId } = req.params;

  const reader = await stripe.terminal.readers.cancelAction(readerId);

  logger.info('Reader action cancelled', { readerId });

  res.json({
    status: 'success',
    data: reader
  });
}));

// ============================================================================
// ORDERS - Record completed sales
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
    payment_method, // 'card' or 'cash'
    payment_intent_id,
    cash_received,
    change_given,
    notes
  } = req.body;

  if (!items || items.length === 0) {
    throw new ApiError(400, 'Order must have at least one item');
  }

  // Start transaction
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');

    // Create the order
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

    // Insert order items
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

      // Optionally update inventory for inventory-type items
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
// PRODUCTS - Get items for POS display
// ============================================================================

/**
 * GET /terminal/products
 * Get all active products for POS display (tenant-scoped)
 */
router.get('/products', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { category_id, search } = req.query;
  const tenantId = req.user.tenant_id;

  let queryText = `
    SELECT 
      i.id, i.name, i.description, i.sku,
      i.price, i.member_price, i.cost,
      i.image_url, i.inventory_quantity, i.item_type,
      i.low_stock_threshold,
      i.stripe_product_id, i.stripe_price_id,
      c.id as category_id, c.name as category_name
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
    data: result.rows
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

  let dateFilter = '';
  const params = [tenantId];
  let paramCount = 1;

  if (date) {
    paramCount++;
    params.push(date);
    dateFilter = `DATE(created_at) = $${paramCount}`;
  } else if (start_date && end_date) {
    paramCount++;
    params.push(start_date);
    const startParam = paramCount;
    paramCount++;
    params.push(end_date);
    dateFilter = `DATE(created_at) BETWEEN $${startParam} AND $${paramCount}`;
  } else {
    // Default to today
    dateFilter = 'DATE(created_at) = CURRENT_DATE';
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

// Helper to generate order number (tenant-scoped)
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
