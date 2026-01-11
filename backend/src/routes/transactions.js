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
// FILTER OPTIONS ENDPOINTS
// ============================================================================

/**
 * GET /transactions/filter-options
 * Get all filter options (GL accounts, classes, vendors) for transactions
 */
router.get('/filter-options', authenticate, requireStaff, asyncHandler(async (req, res) => {
  // Get GL accounts that have been used in transactions
  const glAccountsResult = await db.query(`
    SELECT DISTINCT ac.id, ac.account_code, ac.name, ac.account_type
    FROM transactions t
    JOIN accounts_chart ac ON t.accepted_gl_account_id = ac.id
    WHERE t.accepted_gl_account_id IS NOT NULL
    ORDER BY ac.account_code, ac.name
  `);

  // Get classes that have been used in transactions
  const classesResult = await db.query(`
    SELECT DISTINCT c.id, c.name
    FROM transactions t
    JOIN classes c ON t.class_id = c.id
    WHERE t.class_id IS NOT NULL
    ORDER BY c.name
  `);

  // Get distinct vendors from transactions
  const vendorsResult = await db.query(`
    SELECT DISTINCT vendor
    FROM transactions
    WHERE vendor IS NOT NULL AND vendor != ''
    ORDER BY vendor
  `);

  res.json({
    status: 'success',
    data: {
      gl_accounts: glAccountsResult.rows,
      classes: classesResult.rows,
      vendors: vendorsResult.rows.map(r => r.vendor),
    },
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

// ============================================================================
// MAIN ROUTES
// ============================================================================

/**
 * GET /transactions
 * List all transactions (staff+ only)
 */
router.get('/', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const {
    type,
    bank_account_id,
    accepted_gl_account_id,
    class_id,
    vendor,
    start_date,
    end_date,
    search,
    is_reconciled,
    page = 1,
    limit = 500,
    sort = 'date',
    order = 'desc',
  } = req.query;

  let queryText = `
    SELECT 
      t.*,
      ba.name as bank_account_name,
      ac.name as gl_account_name,
      ac.account_code as gl_account_code,
      cl.name as class_name,
      a.name as created_by_name
    FROM transactions t
    LEFT JOIN bank_accounts ba ON t.bank_account_id = ba.id
    LEFT JOIN accounts_chart ac ON t.accepted_gl_account_id = ac.id
    LEFT JOIN classes cl ON t.class_id = cl.id
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

  if (bank_account_id) {
    params.push(bank_account_id);
    queryText += ` AND t.bank_account_id = $${++paramCount}`;
  }

  if (accepted_gl_account_id) {
    params.push(accepted_gl_account_id);
    queryText += ` AND t.accepted_gl_account_id = $${++paramCount}`;
  }

  if (class_id) {
    params.push(class_id);
    queryText += ` AND t.class_id = $${++paramCount}`;
  }

  if (vendor) {
    params.push(vendor);
    queryText += ` AND t.vendor = $${++paramCount}`;
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
    LEFT JOIN accounts_chart ac ON t.accepted_gl_account_id = ac.id
    LEFT JOIN classes cl ON t.class_id = cl.id
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
    group_by = 'month', // month, week, day
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
 * GET /transactions/:id
 * Get single transaction
 */
router.get('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(`
    SELECT 
      t.*,
      ba.name as bank_account_name,
      ac.name as gl_account_name,
      ac.account_code as gl_account_code,
      cl.name as class_name,
      a.name as created_by_name
    FROM transactions t
    LEFT JOIN bank_accounts ba ON t.bank_account_id = ba.id
    LEFT JOIN accounts_chart ac ON t.accepted_gl_account_id = ac.id
    LEFT JOIN classes cl ON t.class_id = cl.id
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
    description,
    amount,
    bank_account_id,
    reference,
    vendor,
    notes,
  } = req.body;

  const result = await db.query(`
    INSERT INTO transactions (
      date, type, description, amount, 
      bank_account_id, reference, vendor, notes, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `, [
    date, type, description, amount,
    bank_account_id || null, reference || null, vendor || null, notes || null, req.user.id,
  ]);

  // Fetch with joins
  const fullResult = await db.query(`
    SELECT 
      t.*,
      ba.name as bank_account_name
    FROM transactions t
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
      description = COALESCE($3, description),
      amount = COALESCE($4, amount),
      bank_account_id = $5,
      reference = $6,
      vendor = $7,
      is_reconciled = COALESCE($8, is_reconciled),
      notes = $9,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $10
    RETURNING *
  `, [
    date, type, description, amount,
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
      ba.name as bank_account_name
    FROM transactions t
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
          date, type, description, amount, 
          bank_account_id, reference, vendor, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        t.date, t.type, t.description, t.amount,
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
 * GET /transactions/export/csv
 * Export transactions as CSV
 */
router.get('/export/csv', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { start_date, end_date, type } = req.query;

  let queryText = `
    SELECT 
      t.date,
      t.type,
      t.description,
      t.amount,
      ba.name as account,
      ac.name as gl_account,
      cl.name as class,
      t.reference,
      t.vendor,
      t.is_reconciled,
      t.notes
    FROM transactions t
    LEFT JOIN bank_accounts ba ON t.bank_account_id = ba.id
    LEFT JOIN accounts_chart ac ON t.accepted_gl_account_id = ac.id
    LEFT JOIN classes cl ON t.class_id = cl.id
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
  const headers = ['Date', 'Type', 'Description', 'Amount', 'Bank Account', 'GL Account', 'Class', 'Reference', 'Vendor', 'Reconciled', 'Notes'];
  const rows = result.rows.map(row => [
    row.date,
    row.type,
    `"${(row.description || '').replace(/"/g, '""')}"`,
    row.amount,
    row.account || '',
    row.gl_account || '',
    row.class || '',
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
