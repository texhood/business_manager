/**
 * Transactions Routes
 * Bookkeeping - Income and Expense tracking
 */

const express = require('express');
const { body, query, validationResult } = require('express-validator');

const db = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// ============================================================================
// VALIDATION
// ============================================================================

const transactionValidation = [
  body('date').isISO8601().withMessage('Valid date required'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }
  next();
};

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /transactions
 * List all transactions (staff+ only)
 */
router.get('/', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const {
    type,
    category_id,
    bank_account_id,
    start_date,
    end_date,
    search,
    is_reconciled,
    page = 1,
    limit = 50,
    sort = 'date',
    order = 'desc',
  } = req.query;

  let queryText = `
    SELECT 
      t.*,
      tc.name as category_name,
      tc.type as category_type,
      ba.name as bank_account_name,
      a.name as created_by_name
    FROM transactions t
    LEFT JOIN transaction_categories tc ON t.category_id = tc.id
    LEFT JOIN bank_accounts ba ON t.bank_account_id = ba.id
    LEFT JOIN accounts a ON t.created_by = a.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  // Apply filters
  if (type) {
    params.push(type);
    queryText += ` AND t.type = $${++paramCount}`;
  }

  if (category_id) {
    params.push(category_id);
    queryText += ` AND t.category_id = $${++paramCount}`;
  }

  if (bank_account_id) {
    params.push(bank_account_id);
    queryText += ` AND t.bank_account_id = $${++paramCount}`;
  }

  if (start_date) {
    params.push(start_date);
    queryText += ` AND t.date >= $${++paramCount}`;
  }

  if (end_date) {
    params.push(end_date);
    queryText += ` AND t.date <= $${++paramCount}`;
  }

  if (search) {
    params.push(`%${search}%`);
    paramCount++;
    queryText += ` AND (t.description ILIKE $${paramCount} OR t.reference ILIKE $${paramCount} OR t.vendor ILIKE $${paramCount})`;
  }

  if (is_reconciled !== undefined) {
    params.push(is_reconciled === 'true');
    queryText += ` AND t.is_reconciled = $${++paramCount}`;
  }

  // Count total
  const countResult = await db.query(
    `SELECT COUNT(*) FROM (${queryText}) as filtered`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Calculate totals for filtered results
  const totalsQuery = `
    SELECT 
      COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expenses
    FROM transactions t
    LEFT JOIN transaction_categories tc ON t.category_id = tc.id
    WHERE 1=1 ${queryText.split('WHERE 1=1')[1]?.split('ORDER BY')[0] || ''}
  `;
  const totalsResult = await db.query(totalsQuery, params);
  const totals = totalsResult.rows[0];

  // Apply sorting
  const validSortColumns = ['date', 'amount', 'created_at', 'description'];
  const sortColumn = validSortColumns.includes(sort) ? sort : 'date';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  queryText += ` ORDER BY t.${sortColumn} ${sortOrder}`;

  // Pagination
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  params.push(parseInt(limit, 10), offset);
  queryText += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;

  const result = await db.query(queryText, params);

  res.json({
    status: 'success',
    data: result.rows,
    summary: {
      total_income: parseFloat(totals.total_income),
      total_expenses: parseFloat(totals.total_expenses),
      net: parseFloat(totals.total_income) - parseFloat(totals.total_expenses),
    },
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10)),
    },
  });
}));

/**
 * GET /transactions/summary
 * Get financial summary for a date range
 */
router.get('/summary', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const {
    start_date,
    end_date,
    group_by = 'month', // month, week, day, category
  } = req.query;

  let dateFilter = '';
  const params = [];

  if (start_date) {
    params.push(start_date);
    dateFilter += ` AND date >= $${params.length}`;
  }

  if (end_date) {
    params.push(end_date);
    dateFilter += ` AND date <= $${params.length}`;
  }

  // Overall totals
  const totalsResult = await db.query(`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
      COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
      COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
    FROM transactions
    WHERE 1=1 ${dateFilter}
  `, params);

  // By category
  const categoryResult = await db.query(`
    SELECT 
      tc.name as category,
      t.type,
      SUM(t.amount) as total,
      COUNT(*) as count
    FROM transactions t
    JOIN transaction_categories tc ON t.category_id = tc.id
    WHERE 1=1 ${dateFilter}
    GROUP BY tc.name, t.type
    ORDER BY total DESC
  `, params);

  // By time period
  let periodQuery;
  if (group_by === 'day') {
    periodQuery = `DATE_TRUNC('day', date)`;
  } else if (group_by === 'week') {
    periodQuery = `DATE_TRUNC('week', date)`;
  } else {
    periodQuery = `DATE_TRUNC('month', date)`;
  }

  const periodResult = await db.query(`
    SELECT 
      ${periodQuery} as period,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
    FROM transactions
    WHERE 1=1 ${dateFilter}
    GROUP BY ${periodQuery}
    ORDER BY period DESC
    LIMIT 12
  `, params);

  const totals = totalsResult.rows[0];

  res.json({
    status: 'success',
    data: {
      totals: {
        income: parseFloat(totals.total_income),
        expenses: parseFloat(totals.total_expenses),
        net: parseFloat(totals.total_income) - parseFloat(totals.total_expenses),
        income_count: parseInt(totals.income_count, 10),
        expense_count: parseInt(totals.expense_count, 10),
      },
      by_category: categoryResult.rows.map(row => ({
        ...row,
        total: parseFloat(row.total),
      })),
      by_period: periodResult.rows.map(row => ({
        period: row.period,
        income: parseFloat(row.income),
        expenses: parseFloat(row.expenses),
        net: parseFloat(row.income) - parseFloat(row.expenses),
      })),
    },
  });
}));

/**
 * GET /transactions/categories
 * List transaction categories
 */
router.get('/categories', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { type } = req.query;

  let queryText = 'SELECT * FROM transaction_categories WHERE is_active = true';
  const params = [];

  if (type) {
    params.push(type);
    queryText += ` AND type = $1`;
  }

  queryText += ' ORDER BY type, name';

  const result = await db.query(queryText, params);

  res.json({
    status: 'success',
    data: result.rows,
  });
}));

/**
 * GET /transactions/bank-accounts
 * List bank accounts
 */
router.get('/bank-accounts', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const result = await db.query(
    'SELECT * FROM bank_accounts WHERE is_active = true ORDER BY name'
  );

  res.json({
    status: 'success',
    data: result.rows,
  });
}));

/**
 * GET /transactions/:id
 * Get single transaction
 */
router.get('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(`
    SELECT 
      t.*,
      tc.name as category_name,
      ba.name as bank_account_name,
      a.name as created_by_name
    FROM transactions t
    LEFT JOIN transaction_categories tc ON t.category_id = tc.id
    LEFT JOIN bank_accounts ba ON t.bank_account_id = ba.id
    LEFT JOIN accounts a ON t.created_by = a.id
    WHERE t.id = $1
  `, [id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Transaction not found');
  }

  res.json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * POST /transactions
 * Create new transaction
 */
router.post('/', authenticate, requireStaff, transactionValidation, validate, asyncHandler(async (req, res) => {
  const {
    date,
    type,
    category_id,
    description,
    amount,
    bank_account_id,
    reference,
    vendor,
    notes,
  } = req.body;

  const result = await db.query(`
    INSERT INTO transactions (
      date, type, category_id, description, amount, 
      bank_account_id, reference, vendor, notes, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `, [
    date, type, category_id || null, description, amount,
    bank_account_id || null, reference || null, vendor || null, notes || null, req.user.id,
  ]);

  // Fetch with joins
  const fullResult = await db.query(`
    SELECT 
      t.*,
      tc.name as category_name,
      ba.name as bank_account_name
    FROM transactions t
    LEFT JOIN transaction_categories tc ON t.category_id = tc.id
    LEFT JOIN bank_accounts ba ON t.bank_account_id = ba.id
    WHERE t.id = $1
  `, [result.rows[0].id]);

  logger.info('Transaction created', { 
    transactionId: result.rows[0].id, 
    type, 
    amount, 
    createdBy: req.user.id 
  });

  res.status(201).json({
    status: 'success',
    data: fullResult.rows[0],
  });
}));

/**
 * PUT /transactions/:id
 * Update transaction
 */
router.put('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    date,
    type,
    category_id,
    description,
    amount,
    bank_account_id,
    reference,
    vendor,
    is_reconciled,
    notes,
  } = req.body;

  const result = await db.query(`
    UPDATE transactions SET
      date = COALESCE($1, date),
      type = COALESCE($2, type),
      category_id = $3,
      description = COALESCE($4, description),
      amount = COALESCE($5, amount),
      bank_account_id = $6,
      reference = $7,
      vendor = $8,
      is_reconciled = COALESCE($9, is_reconciled),
      notes = $10,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $11
    RETURNING *
  `, [
    date, type,
    category_id !== undefined ? category_id : null,
    description, amount,
    bank_account_id !== undefined ? bank_account_id : null,
    reference !== undefined ? reference : null,
    vendor !== undefined ? vendor : null,
    is_reconciled,
    notes !== undefined ? notes : null,
    id,
  ]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Transaction not found');
  }

  // Fetch with joins
  const fullResult = await db.query(`
    SELECT 
      t.*,
      tc.name as category_name,
      ba.name as bank_account_name
    FROM transactions t
    LEFT JOIN transaction_categories tc ON t.category_id = tc.id
    LEFT JOIN bank_accounts ba ON t.bank_account_id = ba.id
    WHERE t.id = $1
  `, [id]);

  logger.info('Transaction updated', { transactionId: id, updatedBy: req.user.id });

  res.json({
    status: 'success',
    data: fullResult.rows[0],
  });
}));

/**
 * DELETE /transactions/:id
 * Delete transaction
 */
router.delete('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    'DELETE FROM transactions WHERE id = $1 RETURNING id',
    [id]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Transaction not found');
  }

  logger.info('Transaction deleted', { transactionId: id, deletedBy: req.user.id });

  res.json({
    status: 'success',
    message: 'Transaction deleted successfully',
  });
}));

/**
 * POST /transactions/bulk
 * Create multiple transactions (for imports)
 */
router.post('/bulk', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { transactions } = req.body;

  if (!Array.isArray(transactions) || transactions.length === 0) {
    throw new ApiError(400, 'Transactions array is required');
  }

  if (transactions.length > 100) {
    throw new ApiError(400, 'Maximum 100 transactions per request');
  }

  const results = await db.transaction(async (client) => {
    const inserted = [];

    for (const t of transactions) {
      const result = await client.query(`
        INSERT INTO transactions (
          date, type, category_id, description, amount, 
          bank_account_id, reference, vendor, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        t.date, t.type, t.category_id || null, t.description, t.amount,
        t.bank_account_id || null, t.reference || null, t.vendor || null, 
        t.notes || null, req.user.id,
      ]);
      inserted.push(result.rows[0]);
    }

    return inserted;
  });

  logger.info('Bulk transactions created', { count: results.length, createdBy: req.user.id });

  res.status(201).json({
    status: 'success',
    data: results,
    message: `${results.length} transactions created`,
  });
}));

/**
 * GET /transactions/export
 * Export transactions as CSV
 */
router.get('/export/csv', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { start_date, end_date, type } = req.query;

  let queryText = `
    SELECT 
      t.date,
      t.type,
      tc.name as category,
      t.description,
      t.amount,
      ba.name as account,
      t.reference,
      t.vendor,
      t.is_reconciled,
      t.notes
    FROM transactions t
    LEFT JOIN transaction_categories tc ON t.category_id = tc.id
    LEFT JOIN bank_accounts ba ON t.bank_account_id = ba.id
    WHERE 1=1
  `;
  const params = [];

  if (start_date) {
    params.push(start_date);
    queryText += ` AND t.date >= $${params.length}`;
  }

  if (end_date) {
    params.push(end_date);
    queryText += ` AND t.date <= $${params.length}`;
  }

  if (type) {
    params.push(type);
    queryText += ` AND t.type = $${params.length}`;
  }

  queryText += ' ORDER BY t.date DESC, t.created_at DESC';

  const result = await db.query(queryText, params);

  // Generate CSV
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Account', 'Reference', 'Vendor', 'Reconciled', 'Notes'];
  const rows = result.rows.map(row => [
    row.date,
    row.type,
    row.category || '',
    `"${(row.description || '').replace(/"/g, '""')}"`,
    row.amount,
    row.account || '',
    row.reference || '',
    row.vendor || '',
    row.is_reconciled ? 'Yes' : 'No',
    `"${(row.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
}));

module.exports = router;
