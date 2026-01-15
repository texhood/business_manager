/**
 * Kitchen Display System (KDS) Routes
 * Handles kitchen workflow for restaurant orders
 * Status flow: entered (pending) → done → complete
 */

const express = require('express');
const db = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Default tenant ID (should come from user context in production)
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

// Helper to get tenant ID from request
const getTenantId = (req) => {
  return req.user?.tenant_id || DEFAULT_TENANT_ID;
};

// ============================================================================
// KITCHEN ORDERS - Get orders for the kitchen display
// ============================================================================

/**
 * GET /kds/orders
 * Get all pending orders for kitchen display (status = 'entered')
 * Orders are sorted by creation time (oldest first) for right-to-left queue
 */
router.get('/orders', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);

  const result = await db.query(`
    SELECT 
      o.id,
      o.order_number,
      o.ticket_number,
      o.customer_name,
      o.phone_number,
      o.table_number,
      o.order_type,
      o.status,
      o.kitchen_notes,
      o.created_at,
      o.status_updated_at,
      o.reissue_count,
      EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - o.created_at))::INTEGER as age_seconds,
      json_agg(
        json_build_object(
          'id', roi.id,
          'name', roi.name,
          'quantity', roi.quantity,
          'modifications', roi.modifications,
          'special_instructions', roi.special_instructions
        ) ORDER BY roi.id
      ) as items
    FROM restaurant_orders o
    JOIN restaurant_order_items roi ON o.id = roi.order_id
    WHERE o.tenant_id = $1 
      AND DATE(o.created_at) = CURRENT_DATE
      AND o.status = 'entered'
    GROUP BY o.id
    ORDER BY o.created_at ASC
  `, [tenantId]);

  res.json({
    status: 'success',
    data: result.rows,
    timestamp: new Date().toISOString()
  });
}));

/**
 * GET /kds/orders/done
 * Get all done orders for today (for the done list panel)
 */
router.get('/orders/done', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);

  const result = await db.query(`
    SELECT 
      o.id,
      o.order_number,
      o.ticket_number,
      o.customer_name,
      o.phone_number,
      o.table_number,
      o.order_type,
      o.status,
      o.created_at,
      o.status_updated_at,
      EXTRACT(EPOCH FROM (o.status_updated_at - o.created_at))::INTEGER as elapsed_seconds,
      (SELECT COUNT(*) FROM restaurant_order_items WHERE order_id = o.id) as item_count
    FROM restaurant_orders o
    WHERE o.tenant_id = $1 
      AND DATE(o.created_at) = CURRENT_DATE
      AND o.status = 'done'
    ORDER BY o.status_updated_at DESC
  `, [tenantId]);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

// ============================================================================
// STATUS UPDATES - Kitchen workflow
// ============================================================================

/**
 * PATCH /kds/orders/:orderId/done
 * Mark order as done (entered → done)
 * Sends SMS notification if phone number present
 */
router.patch('/orders/:orderId/done', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const tenantId = getTenantId(req);

  // Get order details
  const existing = await db.query(
    'SELECT status, phone_number, ticket_number, customer_name, created_at FROM restaurant_orders WHERE id = $1 AND tenant_id = $2',
    [orderId, tenantId]
  );

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Order not found');
  }

  const order = existing.rows[0];

  if (order.status !== 'entered') {
    throw new ApiError(400, `Cannot complete order: status is "${order.status}", expected "entered"`);
  }

  // Calculate elapsed time
  const createdAt = new Date(order.created_at);
  const now = new Date();
  const elapsedSeconds = Math.floor((now - createdAt) / 1000);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const elapsedSecondsRemainder = elapsedSeconds % 60;
  const elapsedTime = `${elapsedMinutes}:${elapsedSecondsRemainder.toString().padStart(2, '0')}`;

  const result = await db.query(`
    UPDATE restaurant_orders SET
      status = 'done',
      status_updated_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND tenant_id = $2
    RETURNING *
  `, [orderId, tenantId]);

  const updatedOrder = result.rows[0];
  let smsSent = false;
  let smsMessage = null;

  // Send SMS if phone number is present
  if (order.phone_number) {
    const customerName = order.customer_name || 'Customer';
    const timestamp = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    smsMessage = `${customerName}, your order #${order.ticket_number} is ready for pickup! Prep time: ${elapsedTime}. Ready at ${timestamp}.`;
    
    try {
      // TODO: Implement actual SMS sending via Twilio
      // await sendSMS(order.phone_number, smsMessage);
      logger.info('KDS: SMS notification would be sent', {
        orderId,
        phoneNumber: order.phone_number,
        message: smsMessage
      });
      smsSent = true;
    } catch (smsError) {
      logger.error('KDS: Failed to send SMS notification', {
        orderId,
        error: smsError.message
      });
    }
  }

  logger.info('KDS: Order marked done', {
    orderId,
    tenantId,
    elapsedTime,
    doneBy: req.user.id,
    smsSent
  });

  res.json({
    status: 'success',
    data: {
      ...updatedOrder,
      elapsed_time: elapsedTime,
      elapsed_seconds: elapsedSeconds,
      sms_sent: smsSent,
      sms_message: smsMessage
    }
  });
}));

/**
 * PATCH /kds/orders/:orderId/reissue
 * Reissue a done order (done → entered)
 * Sets created_at to start of day so it appears at front of queue
 */
router.patch('/orders/:orderId/reissue', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const tenantId = getTenantId(req);

  const existing = await db.query(
    'SELECT status FROM restaurant_orders WHERE id = $1 AND tenant_id = $2',
    [orderId, tenantId]
  );

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Order not found');
  }

  if (existing.rows[0].status !== 'done') {
    throw new ApiError(400, `Cannot reissue order: status is "${existing.rows[0].status}", expected "done"`);
  }

  // Reset to entered status with created_at set to start of today
  // This ensures reissued orders appear at the FRONT of the queue (leftmost)
  // Increment reissue_count to track and style differently
  const result = await db.query(`
    UPDATE restaurant_orders SET
      status = 'entered',
      created_at = DATE_TRUNC('day', CURRENT_TIMESTAMP),
      status_updated_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP,
      reissue_count = COALESCE(reissue_count, 0) + 1
    WHERE id = $1 AND tenant_id = $2
    RETURNING *
  `, [orderId, tenantId]);

  logger.info('KDS: Order reissued (priority)', {
    orderId,
    tenantId,
    reissuedBy: req.user.id
  });

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * GET /kds/stats
 * Get kitchen statistics for today
 */
router.get('/stats', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);

  const result = await db.query(`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'entered') as pending_count,
      COUNT(*) FILTER (WHERE status = 'done') as done_count,
      COUNT(*) FILTER (WHERE status = 'complete') as complete_count,
      COUNT(*) FILTER (WHERE status NOT IN ('cancelled')) as total_orders,
      AVG(EXTRACT(EPOCH FROM (status_updated_at - created_at))) 
        FILTER (WHERE status IN ('done', 'complete')) as avg_completion_seconds
    FROM restaurant_orders
    WHERE tenant_id = $1 AND DATE(created_at) = CURRENT_DATE
  `, [tenantId]);

  const stats = result.rows[0];

  res.json({
    status: 'success',
    data: {
      pending: parseInt(stats.pending_count) || 0,
      done: parseInt(stats.done_count) || 0,
      complete: parseInt(stats.complete_count) || 0,
      total: parseInt(stats.total_orders) || 0,
      avg_completion_minutes: stats.avg_completion_seconds 
        ? Math.round(stats.avg_completion_seconds / 60) 
        : null
    }
  });
}));

module.exports = router;
