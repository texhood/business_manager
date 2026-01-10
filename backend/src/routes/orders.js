/**
 * Orders Routes
 * Order management for eCommerce (Phase 2)
 */

const express = require('express');
const db = require('../../config/database');
const { authenticate, optionalAuth, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * GET /orders
 * List orders (staff sees all, customers see their own)
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const {
    status,
    account_id,
    delivery_zone_id,
    start_date,
    end_date,
    page = 1,
    limit = 50,
  } = req.query;

  let queryText = `
    SELECT 
      o.*,
      a.name as account_name,
      dz.name as delivery_zone_name
    FROM orders o
    LEFT JOIN accounts a ON o.account_id = a.id
    LEFT JOIN delivery_zones dz ON o.delivery_zone_id = dz.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  // Non-staff can only see their own orders
  if (!['admin', 'staff'].includes(req.user.role)) {
    params.push(req.user.id);
    queryText += ` AND o.account_id = $${++paramCount}`;
  } else if (account_id) {
    params.push(account_id);
    queryText += ` AND o.account_id = $${++paramCount}`;
  }

  if (status) {
    params.push(status);
    queryText += ` AND o.status = $${++paramCount}`;
  }

  if (delivery_zone_id) {
    params.push(delivery_zone_id);
    queryText += ` AND o.delivery_zone_id = $${++paramCount}`;
  }

  if (start_date) {
    params.push(start_date);
    queryText += ` AND o.ordered_at >= $${++paramCount}`;
  }

  if (end_date) {
    params.push(end_date);
    queryText += ` AND o.ordered_at <= $${++paramCount}`;
  }

  // Count
  const countResult = await db.query(
    `SELECT COUNT(*) FROM (${queryText}) as filtered`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Pagination
  queryText += ' ORDER BY o.ordered_at DESC';
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  params.push(parseInt(limit, 10), offset);
  queryText += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;

  const result = await db.query(queryText, params);

  res.json({
    status: 'success',
    data: result.rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10)),
    },
  });
}));

/**
 * GET /orders/:id
 * Get single order with line items
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get order
  const orderResult = await db.query(`
    SELECT 
      o.*,
      a.name as account_name,
      a.email as account_email,
      dz.name as delivery_zone_name,
      dz.schedule as delivery_schedule
    FROM orders o
    LEFT JOIN accounts a ON o.account_id = a.id
    LEFT JOIN delivery_zones dz ON o.delivery_zone_id = dz.id
    WHERE o.id = $1 OR o.order_number = $1
  `, [id]);

  if (orderResult.rows.length === 0) {
    throw new ApiError(404, 'Order not found');
  }

  const order = orderResult.rows[0];

  // Check permission
  if (!['admin', 'staff'].includes(req.user.role) && order.account_id !== req.user.id) {
    throw new ApiError(403, 'Access denied');
  }

  // Get line items
  const itemsResult = await db.query(`
    SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at
  `, [order.id]);

  res.json({
    status: 'success',
    data: {
      ...order,
      items: itemsResult.rows,
    },
  });
}));

/**
 * POST /orders
 * Create new order
 */
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const {
    items, // Array of { item_id, quantity }
    shipping_address,
    shipping_city,
    shipping_state,
    shipping_zip,
    delivery_zone_id,
    delivery_date,
    delivery_notes,
    notes,
  } = req.body;

  if (!items || items.length === 0) {
    throw new ApiError(400, 'At least one item is required');
  }

  const order = await db.transaction(async (client) => {
    // Get account info
    const accountResult = await client.query(
      'SELECT * FROM accounts WHERE id = $1',
      [req.user.id]
    );
    const account = accountResult.rows[0];

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;
    const orderItems = [];

    for (const orderItem of items) {
      const itemResult = await client.query(
        'SELECT * FROM items WHERE id = $1 AND is_active = true',
        [orderItem.item_id]
      );

      if (itemResult.rows.length === 0) {
        throw new ApiError(400, `Item ${orderItem.item_id} not found`);
      }

      const item = itemResult.rows[0];

      // Check inventory
      if (item.item_type === 'inventory' && item.inventory_quantity < orderItem.quantity) {
        throw new ApiError(400, `Insufficient inventory for ${item.name}`);
      }

      // Calculate price
      const priceUsed = account.is_farm_member && item.member_price 
        ? item.member_price 
        : (account.is_farm_member ? item.price * 0.9 : item.price);
      
      const lineTotal = priceUsed * orderItem.quantity;
      const itemTax = item.is_taxable ? lineTotal * item.tax_rate : 0;

      subtotal += lineTotal;
      taxAmount += itemTax;

      orderItems.push({
        item_id: item.id,
        sku: item.sku,
        name: item.name,
        description: item.description,
        quantity: orderItem.quantity,
        unit_price: item.price,
        member_price: item.member_price,
        price_used: priceUsed,
        is_taxable: item.is_taxable,
        tax_rate: item.tax_rate,
        tax_amount: itemTax,
        line_total: lineTotal,
      });
    }

    const total = subtotal + taxAmount;

    // Create order
    const orderResult = await client.query(`
      INSERT INTO orders (
        account_id, customer_name, customer_email, customer_phone,
        shipping_address, shipping_city, shipping_state, shipping_zip,
        delivery_zone_id, delivery_date, delivery_notes,
        subtotal, tax_amount, total,
        is_member_order, member_discount_percent,
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      account.id,
      account.name,
      account.email,
      account.phone,
      shipping_address || account.address,
      shipping_city || account.city,
      shipping_state || account.state,
      shipping_zip || account.zip_code,
      delivery_zone_id || account.delivery_zone_id,
      delivery_date,
      delivery_notes,
      subtotal,
      taxAmount,
      total,
      account.is_farm_member,
      account.is_farm_member ? account.member_discount_percent : 0,
      notes,
    ]);

    const newOrder = orderResult.rows[0];

    // Create order items
    for (const item of orderItems) {
      await client.query(`
        INSERT INTO order_items (
          order_id, item_id, sku, name, description,
          quantity, unit_price, member_price, price_used,
          is_taxable, tax_rate, tax_amount, line_total
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        newOrder.id,
        item.item_id,
        item.sku,
        item.name,
        item.description,
        item.quantity,
        item.unit_price,
        item.member_price,
        item.price_used,
        item.is_taxable,
        item.tax_rate,
        item.tax_amount,
        item.line_total,
      ]);
    }

    return newOrder;
  });

  logger.info('Order created', { orderId: order.id, orderNumber: order.order_number, accountId: req.user.id });

  res.status(201).json({
    status: 'success',
    data: order,
  });
}));

/**
 * PATCH /orders/:id/status
 * Update order status (staff+)
 */
router.patch('/:id/status', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  // Build dynamic timestamp update
  let timestampField = '';
  switch (status) {
    case 'confirmed': timestampField = 'confirmed_at = CURRENT_TIMESTAMP,'; break;
    case 'ready': timestampField = 'ready_at = CURRENT_TIMESTAMP,'; break;
    case 'delivered': timestampField = 'delivered_at = CURRENT_TIMESTAMP,'; break;
    case 'cancelled': timestampField = 'cancelled_at = CURRENT_TIMESTAMP,'; break;
  }

  const result = await db.query(`
    UPDATE orders SET
      status = $1,
      ${timestampField}
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `, [status, id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Order not found');
  }

  logger.info('Order status updated', { orderId: id, status, updatedBy: req.user.id });

  res.json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * DELETE /orders/:id
 * Cancel/delete order (admin only for hard delete)
 */
router.delete('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { hard = false } = req.query;

  if (hard === 'true' && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can permanently delete orders');
  }

  if (hard === 'true') {
    const result = await db.query('DELETE FROM orders WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Order not found');
    }
    logger.info('Order deleted', { orderId: id, deletedBy: req.user.id });
  } else {
    const result = await db.query(`
      UPDATE orders SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Order not found');
    }
    logger.info('Order cancelled', { orderId: id, cancelledBy: req.user.id });
  }

  res.json({
    status: 'success',
    message: hard === 'true' ? 'Order permanently deleted' : 'Order cancelled',
  });
}));

module.exports = router;
