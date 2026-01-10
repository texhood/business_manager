/**
 * Reports Routes
 * Financial and business reporting endpoints
 */

const express = require('express');
const db = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * GET /reports/dashboard
 * Dashboard summary data
 */
router.get('/dashboard', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  // Monthly financials
  const financials = await db.query(`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as month_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as month_expenses
    FROM transactions
    WHERE date >= $1 AND date <= $2
  `, [startOfMonth, endOfMonth]);

  // Account stats
  const accountStats = await db.query(`
    SELECT 
      COUNT(*) FILTER (WHERE role = 'customer') as total_customers,
      COUNT(*) FILTER (WHERE is_farm_member = true) as farm_members,
      COUNT(*) FILTER (WHERE role = 'customer' AND created_at >= $1) as new_customers_this_month
    FROM accounts
    WHERE is_active = true
  `, [startOfMonth]);

  // Inventory alerts
  const inventoryAlerts = await db.query(`
    SELECT 
      COUNT(*) FILTER (WHERE inventory_quantity = 0) as out_of_stock,
      COUNT(*) FILTER (WHERE inventory_quantity > 0 AND inventory_quantity <= low_stock_threshold) as low_stock
    FROM items
    WHERE item_type = 'inventory' AND is_active = true
  `);

  // Recent transactions
  const recentTransactions = await db.query(`
    SELECT 
      t.id, t.date, t.type, t.description, t.amount,
      tc.name as category_name
    FROM transactions t
    LEFT JOIN transaction_categories tc ON t.category_id = tc.id
    ORDER BY t.date DESC, t.created_at DESC
    LIMIT 10
  `);

  // Order stats (if orders exist)
  const orderStats = await db.query(`
    SELECT 
      COUNT(*) as total_orders,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
      COUNT(*) FILTER (WHERE status = 'ready') as ready_orders,
      COALESCE(SUM(total), 0) as total_revenue
    FROM orders
    WHERE ordered_at >= $1
  `, [startOfMonth]);

  const fin = financials.rows[0];
  const acc = accountStats.rows[0];
  const inv = inventoryAlerts.rows[0];
  const ord = orderStats.rows[0];

  res.json({
    status: 'success',
    data: {
      financials: {
        month_income: parseFloat(fin.month_income),
        month_expenses: parseFloat(fin.month_expenses),
        net_profit: parseFloat(fin.month_income) - parseFloat(fin.month_expenses),
      },
      customers: {
        total: parseInt(acc.total_customers, 10),
        farm_members: parseInt(acc.farm_members, 10),
        new_this_month: parseInt(acc.new_customers_this_month, 10),
      },
      inventory: {
        out_of_stock: parseInt(inv.out_of_stock, 10),
        low_stock: parseInt(inv.low_stock, 10),
      },
      orders: {
        total: parseInt(ord.total_orders, 10),
        pending: parseInt(ord.pending_orders, 10),
        ready: parseInt(ord.ready_orders, 10),
        revenue: parseFloat(ord.total_revenue),
      },
      recent_transactions: recentTransactions.rows,
    },
  });
}));

/**
 * GET /reports/profit-loss
 * Profit & Loss statement
 */
router.get('/profit-loss', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { start_date, end_date, compare_previous = false } = req.query;

  // Default to current month
  const today = new Date();
  const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const defaultEnd = today.toISOString().split('T')[0];

  const startDate = start_date || defaultStart;
  const endDate = end_date || defaultEnd;

  // Income by category
  const income = await db.query(`
    SELECT 
      tc.name as category,
      SUM(t.amount) as total,
      COUNT(*) as count
    FROM transactions t
    JOIN transaction_categories tc ON t.category_id = tc.id
    WHERE t.type = 'income' AND t.date >= $1 AND t.date <= $2
    GROUP BY tc.name
    ORDER BY total DESC
  `, [startDate, endDate]);

  // Expenses by category
  const expenses = await db.query(`
    SELECT 
      tc.name as category,
      SUM(t.amount) as total,
      COUNT(*) as count
    FROM transactions t
    JOIN transaction_categories tc ON t.category_id = tc.id
    WHERE t.type = 'expense' AND t.date >= $1 AND t.date <= $2
    GROUP BY tc.name
    ORDER BY total DESC
  `, [startDate, endDate]);

  // Totals
  const totals = await db.query(`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
    FROM transactions
    WHERE date >= $1 AND date <= $2
  `, [startDate, endDate]);

  const totalIncome = parseFloat(totals.rows[0].total_income);
  const totalExpenses = parseFloat(totals.rows[0].total_expenses);

  let comparison = null;
  if (compare_previous === 'true') {
    // Calculate previous period
    const daysDiff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const prevEnd = new Date(new Date(startDate).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const prevStart = new Date(new Date(prevEnd).getTime() - daysDiff * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const prevTotals = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
      FROM transactions
      WHERE date >= $1 AND date <= $2
    `, [prevStart, prevEnd]);

    const prevIncome = parseFloat(prevTotals.rows[0].total_income);
    const prevExpenses = parseFloat(prevTotals.rows[0].total_expenses);

    comparison = {
      period: { start: prevStart, end: prevEnd },
      total_income: prevIncome,
      total_expenses: prevExpenses,
      net_profit: prevIncome - prevExpenses,
      income_change: prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome * 100).toFixed(1) : null,
      expense_change: prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses * 100).toFixed(1) : null,
    };
  }

  res.json({
    status: 'success',
    data: {
      period: { start: startDate, end: endDate },
      income: {
        categories: income.rows.map(r => ({ ...r, total: parseFloat(r.total) })),
        total: totalIncome,
      },
      expenses: {
        categories: expenses.rows.map(r => ({ ...r, total: parseFloat(r.total) })),
        total: totalExpenses,
      },
      net_profit: totalIncome - totalExpenses,
      comparison,
    },
  });
}));

/**
 * GET /reports/sales
 * Sales report by product, category, time period
 */
router.get('/sales', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { start_date, end_date, group_by = 'item' } = req.query;

  const today = new Date();
  const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const defaultEnd = today.toISOString().split('T')[0];

  const startDate = start_date || defaultStart;
  const endDate = end_date || defaultEnd;

  let salesQuery;
  if (group_by === 'category') {
    salesQuery = `
      SELECT 
        i.category_id,
        c.name as category_name,
        SUM(oi.quantity) as units_sold,
        SUM(oi.line_total) as revenue,
        COUNT(DISTINCT o.id) as order_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      LEFT JOIN items i ON oi.item_id = i.id
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE o.ordered_at >= $1 AND o.ordered_at <= $2 AND o.status != 'cancelled'
      GROUP BY i.category_id, c.name
      ORDER BY revenue DESC
    `;
  } else if (group_by === 'day') {
    salesQuery = `
      SELECT 
        DATE(o.ordered_at) as date,
        SUM(oi.quantity) as units_sold,
        SUM(oi.line_total) as revenue,
        COUNT(DISTINCT o.id) as order_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.ordered_at >= $1 AND o.ordered_at <= $2 AND o.status != 'cancelled'
      GROUP BY DATE(o.ordered_at)
      ORDER BY date DESC
    `;
  } else {
    // Default: by item
    salesQuery = `
      SELECT 
        oi.item_id,
        oi.sku,
        oi.name as item_name,
        SUM(oi.quantity) as units_sold,
        SUM(oi.line_total) as revenue,
        AVG(oi.price_used) as avg_price,
        COUNT(DISTINCT o.id) as order_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.ordered_at >= $1 AND o.ordered_at <= $2 AND o.status != 'cancelled'
      GROUP BY oi.item_id, oi.sku, oi.name
      ORDER BY revenue DESC
    `;
  }

  const sales = await db.query(salesQuery, [startDate, endDate]);

  // Summary
  const summary = await db.query(`
    SELECT 
      COUNT(DISTINCT o.id) as total_orders,
      SUM(o.subtotal) as gross_revenue,
      SUM(o.tax_amount) as tax_collected,
      SUM(o.total) as total_revenue,
      AVG(o.total) as avg_order_value
    FROM orders o
    WHERE o.ordered_at >= $1 AND o.ordered_at <= $2 AND o.status != 'cancelled'
  `, [startDate, endDate]);

  const sum = summary.rows[0];

  res.json({
    status: 'success',
    data: {
      period: { start: startDate, end: endDate },
      summary: {
        total_orders: parseInt(sum.total_orders, 10) || 0,
        gross_revenue: parseFloat(sum.gross_revenue) || 0,
        tax_collected: parseFloat(sum.tax_collected) || 0,
        total_revenue: parseFloat(sum.total_revenue) || 0,
        avg_order_value: parseFloat(sum.avg_order_value) || 0,
      },
      breakdown: sales.rows.map(row => ({
        ...row,
        revenue: parseFloat(row.revenue) || 0,
        units_sold: parseInt(row.units_sold, 10) || 0,
        avg_price: row.avg_price ? parseFloat(row.avg_price) : undefined,
      })),
    },
  });
}));

/**
 * GET /reports/inventory
 * Inventory status report
 */
router.get('/inventory', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const inventory = await db.query(`
    SELECT 
      i.id,
      i.sku,
      i.name,
      i.inventory_quantity,
      i.low_stock_threshold,
      i.price,
      i.cost,
      c.name as category_name,
      CASE 
        WHEN i.inventory_quantity = 0 THEN 'out_of_stock'
        WHEN i.inventory_quantity <= i.low_stock_threshold THEN 'low_stock'
        ELSE 'in_stock'
      END as stock_status,
      (i.inventory_quantity * COALESCE(i.cost, i.price * 0.6)) as inventory_value
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.id
    WHERE i.item_type = 'inventory' AND i.is_active = true
    ORDER BY 
      CASE WHEN i.inventory_quantity = 0 THEN 0
           WHEN i.inventory_quantity <= i.low_stock_threshold THEN 1
           ELSE 2 END,
      i.name
  `);

  // Summary
  const summary = await db.query(`
    SELECT 
      COUNT(*) as total_items,
      COUNT(*) FILTER (WHERE inventory_quantity = 0) as out_of_stock,
      COUNT(*) FILTER (WHERE inventory_quantity > 0 AND inventory_quantity <= low_stock_threshold) as low_stock,
      COUNT(*) FILTER (WHERE inventory_quantity > low_stock_threshold) as in_stock,
      SUM(inventory_quantity * COALESCE(cost, price * 0.6)) as total_value
    FROM items
    WHERE item_type = 'inventory' AND is_active = true
  `);

  const sum = summary.rows[0];

  res.json({
    status: 'success',
    data: {
      summary: {
        total_items: parseInt(sum.total_items, 10),
        out_of_stock: parseInt(sum.out_of_stock, 10),
        low_stock: parseInt(sum.low_stock, 10),
        in_stock: parseInt(sum.in_stock, 10),
        total_value: parseFloat(sum.total_value) || 0,
      },
      items: inventory.rows.map(row => ({
        ...row,
        inventory_value: parseFloat(row.inventory_value) || 0,
      })),
    },
  });
}));

/**
 * GET /reports/customers
 * Customer analytics
 */
router.get('/customers', authenticate, requireStaff, asyncHandler(async (req, res) => {
  // Customer summary
  const summary = await db.query(`
    SELECT 
      COUNT(*) as total_customers,
      COUNT(*) FILTER (WHERE is_farm_member = true) as farm_members,
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_last_30_days
    FROM accounts
    WHERE role = 'customer' AND is_active = true
  `);

  // By delivery zone
  const byZone = await db.query(`
    SELECT 
      dz.id as zone_id,
      dz.name as zone_name,
      dz.schedule,
      COUNT(a.id) as customer_count,
      COUNT(a.id) FILTER (WHERE a.is_farm_member = true) as member_count
    FROM delivery_zones dz
    LEFT JOIN accounts a ON a.delivery_zone_id = dz.id AND a.role = 'customer' AND a.is_active = true
    WHERE dz.is_active = true
    GROUP BY dz.id, dz.name, dz.schedule
    ORDER BY customer_count DESC
  `);

  // Top customers by order value
  const topCustomers = await db.query(`
    SELECT 
      a.id,
      a.name,
      a.email,
      a.is_farm_member,
      COUNT(o.id) as order_count,
      COALESCE(SUM(o.total), 0) as lifetime_value,
      MAX(o.ordered_at) as last_order
    FROM accounts a
    LEFT JOIN orders o ON a.id = o.account_id AND o.status != 'cancelled'
    WHERE a.role = 'customer' AND a.is_active = true
    GROUP BY a.id, a.name, a.email, a.is_farm_member
    HAVING COUNT(o.id) > 0
    ORDER BY lifetime_value DESC
    LIMIT 20
  `);

  // Membership growth
  const membershipGrowth = await db.query(`
    SELECT 
      DATE_TRUNC('month', member_since) as month,
      COUNT(*) as new_members
    FROM accounts
    WHERE is_farm_member = true AND member_since IS NOT NULL
    GROUP BY DATE_TRUNC('month', member_since)
    ORDER BY month DESC
    LIMIT 12
  `);

  const sum = summary.rows[0];

  res.json({
    status: 'success',
    data: {
      summary: {
        total_customers: parseInt(sum.total_customers, 10),
        farm_members: parseInt(sum.farm_members, 10),
        membership_rate: sum.total_customers > 0 
          ? ((sum.farm_members / sum.total_customers) * 100).toFixed(1) 
          : 0,
        new_last_30_days: parseInt(sum.new_last_30_days, 10),
      },
      by_zone: byZone.rows,
      top_customers: topCustomers.rows.map(row => ({
        ...row,
        lifetime_value: parseFloat(row.lifetime_value),
      })),
      membership_growth: membershipGrowth.rows,
    },
  });
}));

/**
 * GET /reports/delivery
 * Delivery schedule and workload report
 */
router.get('/delivery', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  // Orders by delivery zone for the date
  const deliveries = await db.query(`
    SELECT 
      dz.id as zone_id,
      dz.name as zone_name,
      dz.schedule,
      COUNT(o.id) as order_count,
      SUM(o.total) as total_value,
      array_agg(json_build_object(
        'order_number', o.order_number,
        'customer_name', o.customer_name,
        'address', o.shipping_address,
        'total', o.total,
        'status', o.status
      )) as orders
    FROM delivery_zones dz
    LEFT JOIN orders o ON o.delivery_zone_id = dz.id 
      AND o.delivery_date = $1 
      AND o.status NOT IN ('cancelled', 'delivered')
    WHERE dz.is_active = true
    GROUP BY dz.id, dz.name, dz.schedule
    ORDER BY dz.name
  `, [targetDate]);

  // Upcoming deliveries summary
  const upcoming = await db.query(`
    SELECT 
      o.delivery_date,
      COUNT(*) as order_count,
      SUM(o.total) as total_value
    FROM orders o
    WHERE o.delivery_date >= CURRENT_DATE 
      AND o.delivery_date <= CURRENT_DATE + INTERVAL '7 days'
      AND o.status NOT IN ('cancelled', 'delivered')
    GROUP BY o.delivery_date
    ORDER BY o.delivery_date
  `);

  res.json({
    status: 'success',
    data: {
      target_date: targetDate,
      zones: deliveries.rows.map(row => ({
        ...row,
        total_value: parseFloat(row.total_value) || 0,
        orders: row.orders[0] ? row.orders.filter(o => o.order_number) : [],
      })),
      upcoming_week: upcoming.rows.map(row => ({
        ...row,
        total_value: parseFloat(row.total_value),
      })),
    },
  });
}));

module.exports = router;
