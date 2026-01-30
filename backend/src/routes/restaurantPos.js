/**
 * Restaurant POS Routes
 * Handles restaurant point-of-sale operations with menu-based ordering
 * and kitchen workflow status tracking
 */

const express = require('express');
const Stripe = require('stripe');
const db = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Default tenant ID (should come from user context in production)
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

// Helper to get tenant ID from request
const getTenantId = (req) => {
  return req.user?.tenant_id || DEFAULT_TENANT_ID;
};

// ============================================================================
// STRIPE CONNECT HELPERS
// ============================================================================

/**
 * Get tenant's Stripe Connect account ID
 * Returns null if tenant doesn't have Connect set up (falls back to platform)
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
    return null;
  }
  
  const tenant = result.rows[0];
  
  if (!tenant.stripe_account_id) {
    return null;
  }
  
  if (requireActive && !tenant.stripe_charges_enabled) {
    logger.warn('Tenant Connect account not fully active', { 
      tenantId, 
      status: tenant.stripe_account_status 
    });
    return null;
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

// Valid order statuses
const ORDER_STATUSES = ['entered', 'in_process', 'done', 'complete', 'cancelled'];

// ============================================================================
// MENUS - Get available menus for POS
// ============================================================================

/**
 * GET /restaurant-pos/menus
 * Get all active menus for the restaurant POS selector
 */
router.get('/menus', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);

  const result = await db.query(`
    SELECT 
      m.id, m.name, m.description, m.menu_type, m.season, m.is_featured,
      (SELECT COUNT(*) FROM menu_sections ms WHERE ms.menu_id = m.id) as section_count,
      (SELECT COUNT(*) FROM menu_sections ms2 
       JOIN menu_section_items msi ON ms2.id = msi.section_id 
       WHERE ms2.menu_id = m.id) as item_count
    FROM menus m
    WHERE m.status = 'active' AND m.tenant_id = $1
    ORDER BY m.is_featured DESC, m.name
  `, [tenantId]);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

/**
 * GET /restaurant-pos/menus/:menuId
 * Get a menu with all sections and items for the POS
 */
router.get('/menus/:menuId', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { menuId } = req.params;
  const tenantId = getTenantId(req);

  // Get menu
  const menuResult = await db.query(`
    SELECT id, name, description, menu_type, season
    FROM menus 
    WHERE id = $1 AND status = 'active' AND tenant_id = $2
  `, [menuId, tenantId]);

  if (menuResult.rows.length === 0) {
    throw new ApiError(404, 'Menu not found');
  }

  const menu = menuResult.rows[0];

  // Get sections with items
  const sectionsResult = await db.query(`
    SELECT 
      ms.id, ms.name, ms.description, ms.sort_order,
      COALESCE(
        json_agg(
          json_build_object(
            'id', mi.id,
            'name', mi.name,
            'description', COALESCE(msi.override_description, mi.description),
            'price', COALESCE(msi.override_price, mi.price),
            'price_label', mi.price_label,
            'image_url', mi.image_url,
            'is_vegetarian', mi.is_vegetarian,
            'is_vegan', mi.is_vegan,
            'is_gluten_free', mi.is_gluten_free,
            'is_dairy_free', mi.is_dairy_free,
            'is_spicy', mi.is_spicy,
            'is_available', COALESCE(msi.is_available, mi.is_available),
            'sort_order', msi.sort_order
          ) ORDER BY msi.sort_order
        ) FILTER (WHERE mi.id IS NOT NULL AND COALESCE(msi.is_available, mi.is_available) = true),
        '[]'
      ) as items
    FROM menu_sections ms
    LEFT JOIN menu_section_items msi ON ms.id = msi.section_id
    LEFT JOIN menu_items mi ON msi.menu_item_id = mi.id
    WHERE ms.menu_id = $1
    GROUP BY ms.id, ms.name, ms.description, ms.sort_order
    ORDER BY ms.sort_order
  `, [menuId]);

  menu.sections = sectionsResult.rows;

  res.json({
    status: 'success',
    data: menu
  });
}));

// ============================================================================
// ORDERS - Create and manage restaurant orders
// ============================================================================

/**
 * POST /restaurant-pos/orders
 * Create a new restaurant order (starts at 'entered' status)
 */
router.post('/orders', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const {
    menu_id,
    items,
    customer_name,
    phone_number,
    table_number,
    order_type = 'dine_in',
    notes,
    kitchen_notes,
    payment_method,
    payment_intent_id,
    cash_received
  } = req.body;

  if (!items || items.length === 0) {
    throw new ApiError(400, 'Order must have at least one item');
  }

  // Calculate totals including modification prices
  const subtotal = items.reduce((sum, item) => {
    const basePrice = parseFloat(item.price) || 0;
    const modsPrice = (item.modifications || []).reduce((modSum, mod) => {
      if (typeof mod === 'object' && mod.price) {
        return modSum + parseFloat(mod.price);
      }
      return modSum;
    }, 0);
    const itemPrice = basePrice + modsPrice;
    return sum + (itemPrice * item.quantity);
  }, 0);
  const taxRate = 0.0825; // 8.25% tax
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Generate order number and ticket number
    const orderNumber = await generateOrderNumber(client, tenantId);
    const ticketNumber = await generateTicketNumber(client, tenantId);

    // Calculate change for cash payments
    let changeGiven = null;
    if (payment_method === 'cash' && cash_received) {
      changeGiven = Math.round((cash_received - total) * 100) / 100;
    }

    // Create the order (already paid)
    const orderResult = await client.query(`
      INSERT INTO restaurant_orders (
        tenant_id, order_number, ticket_number, menu_id,
        customer_name, phone_number, table_number, order_type,
        subtotal, tax_amount, total,
        payment_method, payment_status, payment_intent_id,
        cash_received, change_given,
        notes, kitchen_notes, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'paid', $13, $14, $15, $16, $17, 'entered', $18)
      RETURNING *
    `, [
      tenantId, orderNumber, ticketNumber, menu_id,
      customer_name, phone_number, table_number, order_type,
      subtotal, taxAmount, total,
      payment_method, payment_intent_id,
      cash_received, changeGiven,
      notes, kitchen_notes, req.user.id
    ]);

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of items) {
      // Calculate price including modifications
      const basePrice = parseFloat(item.price) || 0;
      const modsPrice = (item.modifications || []).reduce((modSum, mod) => {
        if (typeof mod === 'object' && mod.price) {
          return modSum + parseFloat(mod.price);
        }
        return modSum;
      }, 0);
      const itemPrice = basePrice + modsPrice;

      // Convert modifications to storage format
      // If column is TEXT[], store as simple strings; if JSONB, store full objects
      const modificationsForDb = (item.modifications || []).map(mod => {
        if (typeof mod === 'string') {
          return mod;
        }
        // Store as display name for TEXT[] compatibility
        return mod.display_name || mod.name || 'Unknown';
      });

      await client.query(`
        INSERT INTO restaurant_order_items (
          tenant_id, order_id, menu_item_id, name, quantity, 
          unit_price, total_price, modifications, special_instructions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        tenantId,
        order.id,
        item.menu_item_id,
        item.name,
        item.quantity,
        itemPrice,
        itemPrice * item.quantity,
        modificationsForDb,
        item.special_instructions
      ]);
    }

    await client.query('COMMIT');

    // Fetch complete order with items
    const completeOrder = await getOrderWithItems(order.id, tenantId);

    logger.info('Restaurant order created', {
      orderId: order.id,
      orderNumber: order.order_number,
      ticketNumber: order.ticket_number,
      total,
      tenantId,
      createdBy: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: completeOrder
    });

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}));

/**
 * GET /restaurant-pos/orders
 * Get orders with optional filtering
 */
router.get('/orders', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { status, date, active_only, limit = 50 } = req.query;

  let queryText = `
    SELECT 
      o.*,
      a.name as created_by_name,
      (SELECT COUNT(*) FROM restaurant_order_items WHERE order_id = o.id) as item_count
    FROM restaurant_orders o
    LEFT JOIN accounts a ON o.created_by = a.id
    WHERE o.tenant_id = $1
  `;
  const params = [tenantId];
  let paramCount = 1;

  // Filter for active orders (not complete or cancelled)
  if (active_only === 'true') {
    queryText += ` AND o.status NOT IN ('complete', 'cancelled')`;
  }

  if (status) {
    paramCount++;
    params.push(status);
    queryText += ` AND o.status = $${paramCount}`;
  }

  if (date) {
    paramCount++;
    params.push(date);
    queryText += ` AND DATE(o.created_at) = $${paramCount}`;
  } else if (active_only !== 'true') {
    // Default to today if not filtering active orders
    queryText += ` AND DATE(o.created_at) = CURRENT_DATE`;
  }

  paramCount++;
  params.push(parseInt(limit));
  queryText += ` ORDER BY 
    CASE o.status 
      WHEN 'entered' THEN 1 
      WHEN 'in_process' THEN 2 
      WHEN 'done' THEN 3 
      WHEN 'complete' THEN 4 
      WHEN 'cancelled' THEN 5 
    END,
    o.created_at DESC
    LIMIT $${paramCount}`;

  const result = await db.query(queryText, params);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

/**
 * GET /restaurant-pos/orders/:orderId
 * Get a single order with items
 */
router.get('/orders/:orderId', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const tenantId = getTenantId(req);

  const order = await getOrderWithItems(orderId, tenantId);
  
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  res.json({
    status: 'success',
    data: order
  });
}));

/**
 * PATCH /restaurant-pos/orders/:orderId/status
 * Update order status (POS can only mark as 'complete')
 */
router.patch('/orders/:orderId/status', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const tenantId = getTenantId(req);

  // POS can only mark orders as complete
  if (status !== 'complete') {
    throw new ApiError(400, 'POS can only mark orders as complete');
  }

  // Verify order exists and is in 'done' status
  const existing = await db.query(
    'SELECT status FROM restaurant_orders WHERE id = $1 AND tenant_id = $2',
    [orderId, tenantId]
  );

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Order not found');
  }

  if (existing.rows[0].status !== 'done') {
    throw new ApiError(400, 'Order must be in "done" status to mark as complete');
  }

  const result = await db.query(`
    UPDATE restaurant_orders SET
      status = 'complete',
      status_updated_at = CURRENT_TIMESTAMP,
      completed_by = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND tenant_id = $3
    RETURNING *
  `, [req.user.id, orderId, tenantId]);

  logger.info('Restaurant order marked complete', {
    orderId,
    tenantId,
    completedBy: req.user.id
  });

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

/**
 * PATCH /restaurant-pos/orders/:orderId/cancel
 * Cancel an order
 */
router.patch('/orders/:orderId/cancel', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const tenantId = getTenantId(req);

  const existing = await db.query(
    'SELECT status FROM restaurant_orders WHERE id = $1 AND tenant_id = $2',
    [orderId, tenantId]
  );

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Order not found');
  }

  if (existing.rows[0].status === 'complete') {
    throw new ApiError(400, 'Cannot cancel a completed order');
  }

  const result = await db.query(`
    UPDATE restaurant_orders SET
      status = 'cancelled',
      status_updated_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND tenant_id = $2
    RETURNING *
  `, [orderId, tenantId]);

  logger.info('Restaurant order cancelled', {
    orderId,
    tenantId,
    cancelledBy: req.user.id
  });

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

// ============================================================================
// PAYMENTS - Handle order payments
// ============================================================================

/**
 * POST /restaurant-pos/orders/:orderId/pay
 * Process payment for an order
 */
router.post('/orders/:orderId/pay', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { payment_method, cash_received, payment_intent_id } = req.body;
  const tenantId = getTenantId(req);

  // Get order
  const orderResult = await db.query(
    'SELECT * FROM restaurant_orders WHERE id = $1 AND tenant_id = $2',
    [orderId, tenantId]
  );

  if (orderResult.rows.length === 0) {
    throw new ApiError(404, 'Order not found');
  }

  const order = orderResult.rows[0];

  if (order.payment_status === 'paid') {
    throw new ApiError(400, 'Order is already paid');
  }

  let changeGiven = null;
  if (payment_method === 'cash' && cash_received) {
    changeGiven = Math.round((cash_received - order.total) * 100) / 100;
    if (changeGiven < 0) {
      throw new ApiError(400, 'Cash received is less than order total');
    }
  }

  const result = await db.query(`
    UPDATE restaurant_orders SET
      payment_method = $1,
      payment_status = 'paid',
      payment_intent_id = $2,
      cash_received = $3,
      change_given = $4,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $5 AND tenant_id = $6
    RETURNING *
  `, [payment_method, payment_intent_id, cash_received, changeGiven, orderId, tenantId]);

  logger.info('Restaurant order paid', {
    orderId,
    tenantId,
    paymentMethod: payment_method,
    total: order.total
  });

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

/**
 * POST /restaurant-pos/payment-intents
 * Create a Stripe payment intent for card payment
 * Uses Stripe Connect if tenant has a connected account
 */
router.post('/payment-intents', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { amount, order_id } = req.body;
  const tenantId = getTenantId(req);

  if (!amount || amount < 50) {
    throw new ApiError(400, 'Amount must be at least 50 cents');
  }

  // Check if tenant has Connect enabled
  const stripeAccountId = await getTenantStripeAccount(tenantId, true);
  
  const paymentIntentData = {
    amount: Math.round(amount),
    currency: 'usd',
    payment_method_types: ['card_present'],
    capture_method: 'automatic',
    description: 'Restaurant POS Sale',
    metadata: {
      source: 'restaurant_pos',
      tenant_id: tenantId,
      order_id,
      created_by: req.user.id
    }
  };

  let paymentIntent;
  let applicationFee = 0;

  if (stripeAccountId) {
    // Use Connect with application fee
    applicationFee = await calculateApplicationFee(amount);
    paymentIntentData.application_fee_amount = applicationFee;
    
    paymentIntent = await stripe.paymentIntents.create(
      paymentIntentData,
      { stripeAccount: stripeAccountId }
    );
    
    logger.info('Payment intent created on connected account', {
      paymentIntentId: paymentIntent.id,
      stripeAccountId,
      applicationFee,
      tenantId
    });
  } else {
    // Fall back to platform account (legacy mode)
    paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
    
    logger.info('Payment intent created on platform account (Connect not enabled)', {
      paymentIntentId: paymentIntent.id,
      tenantId
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
      application_fee_amount: applicationFee,
      connected_account: !!stripeAccountId
    }
  });
}));

// ============================================================================
// TERMINAL - Stripe Terminal for card readers
// ============================================================================

/**
 * POST /restaurant-pos/connection-token
 * Generate connection token for Stripe Terminal
 * Uses connected account if available
 */
router.post('/connection-token', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const stripeAccountId = await getTenantStripeAccount(tenantId, false);
  
  let connectionToken;
  
  if (stripeAccountId) {
    connectionToken = await stripe.terminal.connectionTokens.create(
      {},
      { stripeAccount: stripeAccountId }
    );
  } else {
    connectionToken = await stripe.terminal.connectionTokens.create();
  }

  res.json({
    status: 'success',
    secret: connectionToken.secret,
    connected_account: !!stripeAccountId
  });
}));

/**
 * GET /restaurant-pos/readers
 * List available card readers (from connected account if available)
 */
router.get('/readers', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const stripeAccountId = await getTenantStripeAccount(tenantId, false);
  
  let readers;
  
  if (stripeAccountId) {
    readers = await stripe.terminal.readers.list(
      { limit: 100 },
      { stripeAccount: stripeAccountId }
    );
  } else {
    readers = await stripe.terminal.readers.list({ limit: 100 });
  }

  res.json({
    status: 'success',
    data: readers.data,
    connected_account: !!stripeAccountId
  });
}));

/**
 * POST /restaurant-pos/payment-intents/:paymentIntentId/process
 * Process payment on reader (uses connected account if available)
 */
router.post('/payment-intents/:paymentIntentId/process', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.params;
  const { readerId } = req.body;
  const tenantId = getTenantId(req);

  if (!readerId) {
    throw new ApiError(400, 'readerId is required');
  }

  const stripeAccountId = await getTenantStripeAccount(tenantId, true);
  
  let reader;
  
  if (stripeAccountId) {
    reader = await stripe.terminal.readers.processPaymentIntent(
      readerId,
      { payment_intent: paymentIntentId },
      { stripeAccount: stripeAccountId }
    );
  } else {
    reader = await stripe.terminal.readers.processPaymentIntent(readerId, {
      payment_intent: paymentIntentId
    });
  }

  res.json({
    status: 'success',
    data: reader
  });
}));

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * GET /restaurant-pos/stats
 * Get order statistics for today
 */
router.get('/stats', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);

  const result = await db.query(`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'entered') as entered_count,
      COUNT(*) FILTER (WHERE status = 'in_process') as in_process_count,
      COUNT(*) FILTER (WHERE status = 'done') as done_count,
      COUNT(*) FILTER (WHERE status = 'complete') as complete_count,
      COUNT(*) FILTER (WHERE status != 'cancelled') as total_orders,
      COALESCE(SUM(total) FILTER (WHERE status = 'complete'), 0) as total_sales
    FROM restaurant_orders
    WHERE tenant_id = $1 AND DATE(created_at) = CURRENT_DATE
  `, [tenantId]);

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

// ============================================================================
// HELPERS
// ============================================================================

async function generateOrderNumber(client, tenantId) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const result = await client.query(`
    SELECT order_number FROM restaurant_orders 
    WHERE tenant_id = $1 AND order_number LIKE $2 
    ORDER BY order_number DESC LIMIT 1
  `, [tenantId, today + '%']);

  if (result.rows.length === 0) {
    return today + '-001';
  }

  const lastNumber = parseInt(result.rows[0].order_number.split('-')[1]);
  return today + '-' + String(lastNumber + 1).padStart(3, '0');
}

async function generateTicketNumber(client, tenantId) {
  const result = await client.query(`
    SELECT MAX(ticket_number) as max_ticket
    FROM restaurant_orders
    WHERE tenant_id = $1 AND DATE(created_at) = CURRENT_DATE
  `, [tenantId]);

  const maxTicket = result.rows[0].max_ticket || 0;
  return maxTicket + 1;
}

async function getOrderWithItems(orderId, tenantId) {
  const orderResult = await db.query(`
    SELECT 
      o.*,
      a.name as created_by_name,
      m.name as menu_name
    FROM restaurant_orders o
    LEFT JOIN accounts a ON o.created_by = a.id
    LEFT JOIN menus m ON o.menu_id = m.id
    WHERE o.id = $1 AND o.tenant_id = $2
  `, [orderId, tenantId]);

  if (orderResult.rows.length === 0) {
    return null;
  }

  const order = orderResult.rows[0];

  const itemsResult = await db.query(`
    SELECT * FROM restaurant_order_items 
    WHERE order_id = $1 AND tenant_id = $2
    ORDER BY id
  `, [orderId, tenantId]);

  order.items = itemsResult.rows;

  return order;
}

module.exports = router;
