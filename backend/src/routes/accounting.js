/**
 * Accounting Routes
 * Chart of Accounts, Journal Entries, Financial Reports
 */

const express = require('express');
const { body, validationResult } = require('express-validator');

const db = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// ============================================================================
// CHART OF ACCOUNTS
// ============================================================================

/**
 * GET /accounting/accounts
 * List all accounts in chart of accounts
 */
router.get('/accounts', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { type, subtype, active_only = 'true', with_balances = 'true' } = req.query;

  let queryText = `
    SELECT 
      ac.*,
      parent.name as parent_name,
      parent.account_code as parent_code
    FROM accounts_chart ac
    LEFT JOIN accounts_chart parent ON ac.parent_id = parent.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  if (active_only === 'true') {
    queryText += ` AND ac.is_active = true`;
  }

  if (type) {
    params.push(type);
    queryText += ` AND ac.account_type = $${++paramCount}`;
  }

  if (subtype) {
    params.push(subtype);
    queryText += ` AND ac.account_subtype = $${++paramCount}`;
  }

  queryText += ` ORDER BY ac.account_code`;

  const result = await db.query(queryText, params);

  res.json({
    status: 'success',
    data: result.rows,
  });
}));

/**
 * GET /accounting/accounts/:id
 * Get single account with transaction history
 */
router.get('/accounts/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(`
    SELECT ac.*, parent.name as parent_name
    FROM accounts_chart ac
    LEFT JOIN accounts_chart parent ON ac.parent_id = parent.id
    WHERE ac.id = $1 OR ac.account_code = $1
  `, [id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Account not found');
  }

  // Get recent transactions
  const transactions = await db.query(`
    SELECT 
      je.entry_date,
      je.entry_number,
      je.description,
      jel.debit,
      jel.credit,
      je.status
    FROM journal_entry_lines jel
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    WHERE jel.account_id = $1
    ORDER BY je.entry_date DESC, je.created_at DESC
    LIMIT 50
  `, [result.rows[0].id]);

  res.json({
    status: 'success',
    data: {
      ...result.rows[0],
      recent_transactions: transactions.rows,
    },
  });
}));

/**
 * POST /accounting/accounts
 * Create new account
 */
router.post('/accounts', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const {
    account_code,
    name,
    account_type,
    account_subtype,
    parent_id,
    description,
    opening_balance = 0,
  } = req.body;

  if (!account_code || !name || !account_type) {
    throw new ApiError(400, 'account_code, name, and account_type are required');
  }

  // Determine normal balance based on account type
  const normalBalance = ['asset', 'expense'].includes(account_type) ? 'debit' : 'credit';

  const result = await db.query(`
    INSERT INTO accounts_chart (
      account_code, name, account_type, account_subtype, parent_id,
      description, normal_balance, opening_balance, current_balance
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
    RETURNING *
  `, [
    account_code, name, account_type, account_subtype || null, parent_id || null,
    description || null, normalBalance, opening_balance,
  ]);

  logger.info('Account created', { accountCode: account_code, createdBy: req.user.id });

  res.status(201).json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * PUT /accounting/accounts/:id
 * Update account
 */
router.put('/accounts/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    account_code,
    name, 
    description, 
    account_type,
    account_subtype,
    normal_balance,
    parent_id, 
    is_active 
  } = req.body;

  // Check if account exists
  const existing = await db.query('SELECT * FROM accounts_chart WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Account not found');
  }

  // If changing account_code, check for duplicates
  if (account_code && account_code !== existing.rows[0].account_code) {
    const codeCheck = await db.query(
      'SELECT id FROM accounts_chart WHERE account_code = $1 AND id != $2',
      [account_code, id]
    );
    if (codeCheck.rows.length > 0) {
      throw new ApiError(400, 'Account code already exists');
    }
  }

  const result = await db.query(`
    UPDATE accounts_chart SET
      account_code = COALESCE($1, account_code),
      name = COALESCE($2, name),
      description = COALESCE($3, description),
      account_type = COALESCE($4, account_type),
      account_subtype = COALESCE($5, account_subtype),
      normal_balance = COALESCE($6, normal_balance),
      parent_id = $7,
      is_active = COALESCE($8, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
    RETURNING *
  `, [account_code, name, description, account_type, account_subtype, normal_balance, parent_id, is_active, id]);

  res.json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * DELETE /accounting/accounts/:id
 * Delete account (only if no transactions)
 */
router.delete('/accounts/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if system account
  const existing = await db.query('SELECT is_system, account_code FROM accounts_chart WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Account not found');
  }
  if (existing.rows[0].is_system) {
    throw new ApiError(400, 'Cannot delete system account');
  }

  // Check for existing transactions
  const txnCount = await db.query(
    'SELECT COUNT(*) FROM journal_entry_lines WHERE account_id = $1',
    [id]
  );
  if (parseInt(txnCount.rows[0].count, 10) > 0) {
    throw new ApiError(400, 'Cannot delete account with existing transactions. Deactivate instead.');
  }

  await db.query('DELETE FROM accounts_chart WHERE id = $1', [id]);

  logger.info('Account deleted', { accountId: id, deletedBy: req.user.id });

  res.json({
    status: 'success',
    message: 'Account deleted',
  });
}));

// ============================================================================
// JOURNAL ENTRIES
// ============================================================================

/**
 * GET /accounting/journal-entries
 * List journal entries
 */
router.get('/journal-entries', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const {
    status,
    start_date,
    end_date,
    search,
    page = 1,
    limit = 50,
  } = req.query;

  let queryText = `
    SELECT 
      je.*,
      a.name as created_by_name
    FROM journal_entries je
    LEFT JOIN accounts a ON je.created_by = a.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  if (status) {
    params.push(status);
    queryText += ` AND je.status = $${++paramCount}`;
  }

  if (start_date) {
    params.push(start_date);
    queryText += ` AND je.entry_date >= $${++paramCount}`;
  }

  if (end_date) {
    params.push(end_date);
    queryText += ` AND je.entry_date <= $${++paramCount}`;
  }

  if (search) {
    params.push(`%${search}%`);
    paramCount++;
    queryText += ` AND (je.description ILIKE $${paramCount} OR je.entry_number ILIKE $${paramCount} OR je.reference ILIKE $${paramCount})`;
  }

  // Count
  const countResult = await db.query(`SELECT COUNT(*) FROM (${queryText}) as filtered`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  // Pagination
  queryText += ` ORDER BY je.entry_date DESC, je.created_at DESC`;
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
 * GET /accounting/journal-entries/:id
 * Get single journal entry with lines
 */
router.get('/journal-entries/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const entryResult = await db.query(`
    SELECT je.*, a.name as created_by_name
    FROM journal_entries je
    LEFT JOIN accounts a ON je.created_by = a.id
    WHERE je.id = $1 OR je.entry_number = $1
  `, [id]);

  if (entryResult.rows.length === 0) {
    throw new ApiError(404, 'Journal entry not found');
  }

  const entry = entryResult.rows[0];

  // Get lines
  const linesResult = await db.query(`
    SELECT 
      jel.*,
      ac.account_code,
      ac.name as account_name
    FROM journal_entry_lines jel
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE jel.journal_entry_id = $1
    ORDER BY jel.line_number
  `, [entry.id]);

  res.json({
    status: 'success',
    data: {
      ...entry,
      lines: linesResult.rows,
    },
  });
}));

/**
 * POST /accounting/journal-entries
 * Create new journal entry with lines
 */
router.post('/journal-entries', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const {
    entry_date,
    reference,
    description,
    lines, // Array of { account_id, description, debit, credit }
    auto_post = false,
  } = req.body;

  if (!entry_date || !description || !lines || lines.length < 2) {
    throw new ApiError(400, 'entry_date, description, and at least 2 lines are required');
  }

  // Validate debits = credits
  const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new ApiError(400, `Entry must be balanced. Debits: ${totalDebit.toFixed(2)}, Credits: ${totalCredit.toFixed(2)}`);
  }

  const entry = await db.transaction(async (client) => {
    // Create journal entry
    const entryResult = await client.query(`
      INSERT INTO journal_entries (
        entry_date, reference, description, status, 
        total_debit, total_credit, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      entry_date, reference || null, description,
      auto_post ? 'posted' : 'draft',
      totalDebit, totalCredit, req.user.id,
    ]);

    const newEntry = entryResult.rows[0];

    // Create lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      await client.query(`
        INSERT INTO journal_entry_lines (
          journal_entry_id, line_number, account_id, description, debit, credit
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        newEntry.id, i + 1, line.account_id,
        line.description || null,
        parseFloat(line.debit) || 0,
        parseFloat(line.credit) || 0,
      ]);
    }

    // If auto-posting, update account balances
    if (auto_post) {
      await client.query(`
        UPDATE journal_entries SET posted_at = CURRENT_TIMESTAMP, posted_by = $1
        WHERE id = $2
      `, [req.user.id, newEntry.id]);
    }

    return newEntry;
  });

  // Fetch complete entry with lines
  const fullEntry = await db.query(`
    SELECT je.*, 
      json_agg(json_build_object(
        'id', jel.id,
        'line_number', jel.line_number,
        'account_id', jel.account_id,
        'account_code', ac.account_code,
        'account_name', ac.name,
        'description', jel.description,
        'debit', jel.debit,
        'credit', jel.credit
      ) ORDER BY jel.line_number) as lines
    FROM journal_entries je
    JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE je.id = $1
    GROUP BY je.id
  `, [entry.id]);

  logger.info('Journal entry created', { entryNumber: entry.entry_number, createdBy: req.user.id });

  res.status(201).json({
    status: 'success',
    data: fullEntry.rows[0],
  });
}));

/**
 * POST /accounting/journal-entries/:id/post
 * Post a draft journal entry
 */
router.post('/journal-entries/:id/post', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(`
    UPDATE journal_entries 
    SET status = 'posted', posted_at = CURRENT_TIMESTAMP, posted_by = $1
    WHERE id = $2 AND status = 'draft' AND is_balanced = true
    RETURNING *
  `, [req.user.id, id]);

  if (result.rows.length === 0) {
    throw new ApiError(400, 'Entry not found, already posted, or not balanced');
  }

  logger.info('Journal entry posted', { entryId: id, postedBy: req.user.id });

  res.json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * POST /accounting/journal-entries/:id/void
 * Void a posted journal entry
 */
router.post('/journal-entries/:id/void', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new ApiError(400, 'Void reason is required');
  }

  const result = await db.query(`
    UPDATE journal_entries 
    SET status = 'void', voided_at = CURRENT_TIMESTAMP, voided_by = $1, void_reason = $2
    WHERE id = $3 AND status = 'posted'
    RETURNING *
  `, [req.user.id, reason, id]);

  if (result.rows.length === 0) {
    throw new ApiError(400, 'Entry not found or not posted');
  }

  logger.info('Journal entry voided', { entryId: id, reason, voidedBy: req.user.id });

  res.json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * DELETE /accounting/journal-entries/:id
 * Delete a draft journal entry
 */
router.delete('/journal-entries/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    `DELETE FROM journal_entries WHERE id = $1 AND status = 'draft' RETURNING id`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new ApiError(400, 'Entry not found or not in draft status');
  }

  logger.info('Journal entry deleted', { entryId: id, deletedBy: req.user.id });

  res.json({
    status: 'success',
    message: 'Journal entry deleted',
  });
}));

// ============================================================================
// FINANCIAL REPORTS
// ============================================================================

/**
 * GET /accounting/reports/trial-balance
 * Get trial balance
 */
router.get('/reports/trial-balance', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { as_of_date } = req.query;

  // If as_of_date provided, calculate balances up to that date
  let result;
  if (as_of_date) {
    result = await db.query(`
      SELECT 
        ac.account_code,
        ac.name,
        ac.account_type,
        ac.normal_balance,
        ac.opening_balance,
        COALESCE(SUM(jel.debit), 0) as total_debits,
        COALESCE(SUM(jel.credit), 0) as total_credits,
        ac.opening_balance + 
          CASE 
            WHEN ac.normal_balance = 'debit' THEN COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0)
            ELSE COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)
          END as balance
      FROM accounts_chart ac
      LEFT JOIN journal_entry_lines jel ON ac.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id 
        AND je.status = 'posted' 
        AND je.entry_date <= $1
      WHERE ac.is_active = true
      GROUP BY ac.id, ac.account_code, ac.name, ac.account_type, ac.normal_balance, ac.opening_balance
      HAVING ac.opening_balance != 0 
        OR COALESCE(SUM(jel.debit), 0) != 0 
        OR COALESCE(SUM(jel.credit), 0) != 0
      ORDER BY ac.account_code
    `, [as_of_date]);
  } else {
    result = await db.query(`
      SELECT 
        account_code,
        name,
        account_type,
        normal_balance,
        current_balance as balance,
        CASE WHEN normal_balance = 'debit' THEN current_balance ELSE 0 END as debit_balance,
        CASE WHEN normal_balance = 'credit' THEN current_balance ELSE 0 END as credit_balance
      FROM accounts_chart
      WHERE is_active = true AND current_balance != 0
      ORDER BY account_code
    `);
  }

  // Calculate totals
  const totals = result.rows.reduce((acc, row) => {
    const balance = parseFloat(row.balance) || 0;
    if (row.normal_balance === 'debit') {
      acc.debits += balance;
    } else {
      acc.credits += balance;
    }
    return acc;
  }, { debits: 0, credits: 0 });

  res.json({
    status: 'success',
    data: {
      as_of_date: as_of_date || new Date().toISOString().split('T')[0],
      accounts: result.rows,
      totals: {
        total_debits: totals.debits,
        total_credits: totals.credits,
        is_balanced: Math.abs(totals.debits - totals.credits) < 0.01,
      },
    },
  });
}));

/**
 * GET /accounting/reports/balance-sheet
 * Get balance sheet
 */
router.get('/reports/balance-sheet', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT 
      account_type,
      account_subtype,
      account_code,
      name,
      current_balance as balance
    FROM accounts_chart
    WHERE is_active = true 
      AND account_type IN ('asset', 'liability', 'equity')
      AND current_balance != 0
    ORDER BY account_type, account_code
  `);

  // Organize by type
  const balanceSheet = {
    assets: result.rows.filter(r => r.account_type === 'asset'),
    liabilities: result.rows.filter(r => r.account_type === 'liability'),
    equity: result.rows.filter(r => r.account_type === 'equity'),
  };

  const totalAssets = balanceSheet.assets.reduce((sum, a) => sum + parseFloat(a.balance), 0);
  const totalLiabilities = balanceSheet.liabilities.reduce((sum, a) => sum + parseFloat(a.balance), 0);
  const totalEquity = balanceSheet.equity.reduce((sum, a) => sum + parseFloat(a.balance), 0);

  res.json({
    status: 'success',
    data: {
      as_of_date: new Date().toISOString().split('T')[0],
      ...balanceSheet,
      totals: {
        total_assets: totalAssets,
        total_liabilities: totalLiabilities,
        total_equity: totalEquity,
        liabilities_plus_equity: totalLiabilities + totalEquity,
        is_balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
      },
    },
  });
}));

/**
 * GET /accounting/reports/income-statement
 * Get income statement (P&L)
 */
router.get('/reports/income-statement', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;

  // Default to current month
  const today = new Date();
  const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const defaultEnd = today.toISOString().split('T')[0];

  const startDate = start_date || defaultStart;
  const endDate = end_date || defaultEnd;

  const result = await db.query(`
    SELECT 
      ac.account_type,
      ac.account_subtype,
      ac.account_code,
      ac.name,
      COALESCE(SUM(
        CASE 
          WHEN ac.normal_balance = 'debit' THEN jel.debit - jel.credit
          ELSE jel.credit - jel.debit
        END
      ), 0) as amount
    FROM accounts_chart ac
    LEFT JOIN journal_entry_lines jel ON ac.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id 
      AND je.status = 'posted'
      AND je.entry_date >= $1 
      AND je.entry_date <= $2
    WHERE ac.is_active = true 
      AND ac.account_type IN ('revenue', 'expense')
    GROUP BY ac.id, ac.account_type, ac.account_subtype, ac.account_code, ac.name
    HAVING COALESCE(SUM(jel.debit), 0) != 0 OR COALESCE(SUM(jel.credit), 0) != 0
    ORDER BY ac.account_type DESC, ac.account_code
  `, [startDate, endDate]);

  const revenue = result.rows.filter(r => r.account_type === 'revenue');
  const expenses = result.rows.filter(r => r.account_type === 'expense');
  const cogs = expenses.filter(r => r.account_subtype === 'cost_of_goods');
  const operating = expenses.filter(r => r.account_subtype === 'operating_expense');
  const otherExp = expenses.filter(r => r.account_subtype === 'other_expense');

  const totalRevenue = revenue.reduce((sum, a) => sum + parseFloat(a.amount), 0);
  const totalCOGS = cogs.reduce((sum, a) => sum + parseFloat(a.amount), 0);
  const totalOperating = operating.reduce((sum, a) => sum + parseFloat(a.amount), 0);
  const totalOtherExp = otherExp.reduce((sum, a) => sum + parseFloat(a.amount), 0);

  res.json({
    status: 'success',
    data: {
      period: { start_date: startDate, end_date: endDate },
      revenue,
      cost_of_goods_sold: cogs,
      operating_expenses: operating,
      other_expenses: otherExp,
      totals: {
        total_revenue: totalRevenue,
        total_cogs: totalCOGS,
        gross_profit: totalRevenue - totalCOGS,
        total_operating_expenses: totalOperating,
        total_other_expenses: totalOtherExp,
        total_expenses: totalCOGS + totalOperating + totalOtherExp,
        net_income: totalRevenue - totalCOGS - totalOperating - totalOtherExp,
      },
    },
  });
}));

/**
 * GET /accounting/reports/general-ledger
 * Get general ledger for an account
 */
router.get('/reports/general-ledger/:account_id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const { account_id } = req.params;
  const { start_date, end_date } = req.query;

  // Get account info
  const accountResult = await db.query(
    'SELECT * FROM accounts_chart WHERE id = $1 OR account_code = $1',
    [account_id]
  );

  if (accountResult.rows.length === 0) {
    throw new ApiError(404, 'Account not found');
  }

  const account = accountResult.rows[0];

  let queryText = `
    SELECT 
      je.entry_date,
      je.entry_number,
      je.description as entry_description,
      jel.description as line_description,
      jel.debit,
      jel.credit,
      je.status
    FROM journal_entry_lines jel
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    WHERE jel.account_id = $1 AND je.status = 'posted'
  `;
  const params = [account.id];
  let paramCount = 1;

  if (start_date) {
    params.push(start_date);
    queryText += ` AND je.entry_date >= $${++paramCount}`;
  }

  if (end_date) {
    params.push(end_date);
    queryText += ` AND je.entry_date <= $${++paramCount}`;
  }

  queryText += ` ORDER BY je.entry_date, je.created_at`;

  const result = await db.query(queryText, params);

  // Calculate running balance
  let runningBalance = parseFloat(account.opening_balance) || 0;
  const entries = result.rows.map(row => {
    const debit = parseFloat(row.debit) || 0;
    const credit = parseFloat(row.credit) || 0;
    
    if (account.normal_balance === 'debit') {
      runningBalance += debit - credit;
    } else {
      runningBalance += credit - debit;
    }

    return {
      ...row,
      running_balance: runningBalance,
    };
  });

  res.json({
    status: 'success',
    data: {
      account,
      entries,
      ending_balance: runningBalance,
    },
  });
}));

module.exports = router;
