/**
 * Financial Reports Routes
 * Income Statement, Balance Sheet, Sales Reports
 * Tenant-aware: all operations scoped to req.user.tenant_id
 */

const express = require('express');
const db = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// ============================================================================
// INCOME STATEMENT
// ============================================================================

/**
 * GET /reports/income-statement
 * Generate Income Statement (P&L) for date range
 */
router.get('/income-statement', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { 
    start_date, 
    end_date, 
    account_ids,
    include_zero = 'false',
    config_id,
  } = req.query;

  // Validate dates
  if (!start_date || !end_date) {
    throw new ApiError(400, 'start_date and end_date are required');
  }

  // Parse account_ids if provided
  let accountIdArray = null;
  if (account_ids) {
    accountIdArray = account_ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    if (accountIdArray.length === 0) accountIdArray = null;
  }

  // If config_id provided, load saved configuration (tenant-scoped)
  if (config_id) {
    const configResult = await db.query(
      'SELECT account_ids FROM report_configurations WHERE id = $1 AND tenant_id = $2',
      [config_id, tenantId]
    );
    if (configResult.rows.length > 0 && configResult.rows[0].account_ids) {
      accountIdArray = configResult.rows[0].account_ids;
    }
  }

  // Generate income statement - tenant-scoped via je.tenant_id and ac.tenant_id
  const result = await db.query(`
    SELECT 
      ac.id AS account_id,
      ac.account_code,
      ac.name AS account_name,
      ac.account_type,
      ac.account_subtype,
      CASE 
        WHEN ac.account_type = 'revenue' THEN COALESCE(totals.credits, 0) - COALESCE(totals.debits, 0)
        WHEN ac.account_type = 'expense' THEN COALESCE(totals.debits, 0) - COALESCE(totals.credits, 0)
        ELSE 0
      END AS balance
    FROM accounts_chart ac
    LEFT JOIN (
      SELECT 
        jel.account_id,
        SUM(jel.debit) as debits,
        SUM(jel.credit) as credits
      FROM journal_entry_lines jel
      INNER JOIN journal_entries je ON jel.journal_entry_id = je.id
      WHERE je.status = 'posted'
        AND je.tenant_id = $3
        AND je.entry_date >= $1 
        AND je.entry_date <= $2
      GROUP BY jel.account_id
    ) totals ON ac.id = totals.account_id
    WHERE ac.account_type IN ('revenue', 'expense')
      AND ac.tenant_id = $3
      AND ac.is_active = true
      AND ($4::integer[] IS NULL OR ac.id = ANY($4))
    ${include_zero === 'false' ? 'AND (COALESCE(totals.debits, 0) != 0 OR COALESCE(totals.credits, 0) != 0)' : ''}
    ORDER BY ac.account_type DESC, ac.account_code
  `, [start_date, end_date, tenantId, accountIdArray]);

  // Group by type and calculate totals
  const revenue = result.rows.filter(r => r.account_type === 'revenue');
  const expenses = result.rows.filter(r => r.account_type === 'expense');
  
  const totalRevenue = revenue.reduce((sum, r) => sum + parseFloat(r.balance || 0), 0);
  const totalExpenses = expenses.reduce((sum, r) => sum + parseFloat(r.balance || 0), 0);
  const netIncome = totalRevenue - totalExpenses;

  res.json({
    status: 'success',
    data: {
      report_type: 'income_statement',
      start_date,
      end_date,
      generated_at: new Date().toISOString(),
      revenue: {
        accounts: revenue,
        total: totalRevenue,
      },
      expenses: {
        accounts: expenses,
        total: totalExpenses,
      },
      net_income: netIncome,
    },
  });
}));

// ============================================================================
// BALANCE SHEET
// ============================================================================

/**
 * GET /reports/balance-sheet
 * Generate Balance Sheet as of a specific date
 */
router.get('/balance-sheet', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { 
    as_of_date, 
    account_ids,
    include_zero = 'false',
    config_id,
  } = req.query;

  // Validate date
  if (!as_of_date) {
    throw new ApiError(400, 'as_of_date is required');
  }

  // Parse account_ids if provided
  let accountIdArray = null;
  if (account_ids) {
    accountIdArray = account_ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    if (accountIdArray.length === 0) accountIdArray = null;
  }

  // If config_id provided, load saved configuration (tenant-scoped)
  if (config_id) {
    const configResult = await db.query(
      'SELECT account_ids FROM report_configurations WHERE id = $1 AND tenant_id = $2',
      [config_id, tenantId]
    );
    if (configResult.rows.length > 0 && configResult.rows[0].account_ids) {
      accountIdArray = configResult.rows[0].account_ids;
    }
  }

  // Generate balance sheet - tenant-scoped
  const result = await db.query(`
    SELECT 
      ac.id AS account_id,
      ac.account_code,
      ac.name AS account_name,
      ac.account_type,
      ac.account_subtype,
      CASE 
        WHEN ac.account_type = 'asset' THEN COALESCE(totals.debits, 0) - COALESCE(totals.credits, 0)
        ELSE COALESCE(totals.credits, 0) - COALESCE(totals.debits, 0)
      END AS balance
    FROM accounts_chart ac
    LEFT JOIN (
      SELECT 
        jel.account_id,
        SUM(jel.debit) as debits,
        SUM(jel.credit) as credits
      FROM journal_entry_lines jel
      INNER JOIN journal_entries je ON jel.journal_entry_id = je.id
      WHERE je.status = 'posted'
        AND je.tenant_id = $2
        AND je.entry_date <= $1
      GROUP BY jel.account_id
    ) totals ON ac.id = totals.account_id
    WHERE ac.account_type IN ('asset', 'liability', 'equity')
      AND ac.tenant_id = $2
      AND ac.is_active = true
      AND ($3::integer[] IS NULL OR ac.id = ANY($3))
    ${include_zero === 'false' ? 'AND (COALESCE(totals.debits, 0) != 0 OR COALESCE(totals.credits, 0) != 0)' : ''}
    ORDER BY 
      CASE ac.account_type 
        WHEN 'asset' THEN 1 
        WHEN 'liability' THEN 2 
        WHEN 'equity' THEN 3 
      END,
      ac.account_code
  `, [as_of_date, tenantId, accountIdArray]);

  // Group by type and calculate totals
  const assets = result.rows.filter(r => r.account_type === 'asset');
  const liabilities = result.rows.filter(r => r.account_type === 'liability');
  const equity = result.rows.filter(r => r.account_type === 'equity');
  
  const totalAssets = assets.reduce((sum, r) => sum + parseFloat(r.balance || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, r) => sum + parseFloat(r.balance || 0), 0);
  const totalEquity = equity.reduce((sum, r) => sum + parseFloat(r.balance || 0), 0);

  // Calculate retained earnings (net income to date) if not explicitly tracked
  const retainedEarnings = totalAssets - totalLiabilities - totalEquity;

  res.json({
    status: 'success',
    data: {
      report_type: 'balance_sheet',
      as_of_date,
      generated_at: new Date().toISOString(),
      assets: {
        accounts: assets,
        total: totalAssets,
      },
      liabilities: {
        accounts: liabilities,
        total: totalLiabilities,
      },
      equity: {
        accounts: equity,
        total: totalEquity,
        retained_earnings_adjustment: retainedEarnings,
      },
      total_liabilities_and_equity: totalLiabilities + totalEquity + retainedEarnings,
      is_balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity + retainedEarnings)) < 0.01,
    },
  });
}));

// ============================================================================
// SALES BY CUSTOMER
// ============================================================================

/**
 * GET /reports/sales-by-customer
 * Revenue breakdown by customer/vendor
 */
router.get('/sales-by-customer', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { 
    start_date, 
    end_date, 
    limit = 50,
  } = req.query;

  // Validate dates
  if (!start_date || !end_date) {
    throw new ApiError(400, 'start_date and end_date are required');
  }

  const result = await db.query(`
    SELECT 
      COALESCE(NULLIF(TRIM(SPLIT_PART(je.description, ' - ', 1)), ''), 'Unknown') AS customer_name,
      COUNT(DISTINCT je.id) AS transaction_count,
      SUM(jel.credit) AS total_amount
    FROM journal_entries je
    JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE je.status = 'posted'
      AND je.tenant_id = $3
      AND je.entry_date >= $1
      AND je.entry_date <= $2
      AND ac.account_type = 'revenue'
      AND jel.credit > 0
    GROUP BY SPLIT_PART(je.description, ' - ', 1)
    ORDER BY SUM(jel.credit) DESC
    LIMIT $4
  `, [start_date, end_date, tenantId, parseInt(limit)]);

  const totalSales = result.rows.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);

  res.json({
    status: 'success',
    data: {
      report_type: 'sales_by_customer',
      start_date,
      end_date,
      generated_at: new Date().toISOString(),
      customers: result.rows.map(r => ({
        ...r,
        total_amount: parseFloat(r.total_amount || 0),
        percentage: totalSales > 0 ? (parseFloat(r.total_amount || 0) / totalSales * 100).toFixed(2) : 0,
      })),
      total_sales: totalSales,
    },
  });
}));

// ============================================================================
// SALES BY CLASS (Account/Category)
// ============================================================================

/**
 * GET /reports/sales-by-class
 * Revenue breakdown by account category
 */
router.get('/sales-by-class', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { start_date, end_date } = req.query;

  // Validate dates
  if (!start_date || !end_date) {
    throw new ApiError(400, 'start_date and end_date are required');
  }

  const result = await db.query(`
    SELECT 
      ac.name AS class_name,
      ac.account_code,
      COUNT(DISTINCT je.id) AS transaction_count,
      SUM(jel.credit) AS total_amount
    FROM journal_entries je
    JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE je.status = 'posted'
      AND je.tenant_id = $3
      AND je.entry_date >= $1
      AND je.entry_date <= $2
      AND ac.account_type = 'revenue'
      AND jel.credit > 0
    GROUP BY ac.id, ac.name, ac.account_code
    ORDER BY SUM(jel.credit) DESC
  `, [start_date, end_date, tenantId]);

  const totalSales = result.rows.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);

  res.json({
    status: 'success',
    data: {
      report_type: 'sales_by_class',
      start_date,
      end_date,
      generated_at: new Date().toISOString(),
      classes: result.rows.map(r => ({
        ...r,
        total_amount: parseFloat(r.total_amount || 0),
        percentage: totalSales > 0 ? (parseFloat(r.total_amount || 0) / totalSales * 100).toFixed(2) : 0,
      })),
      total_sales: totalSales,
    },
  });
}));

// ============================================================================
// REPORT CONFIGURATIONS
// ============================================================================

/**
 * GET /reports/configurations
 * List all saved report configurations
 */
router.get('/configurations', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { report_type } = req.query;

  let query = 'SELECT * FROM report_configurations WHERE tenant_id = $1';
  const params = [tenantId];

  if (report_type) {
    params.push(report_type);
    query += ` AND report_type = $${params.length}`;
  }

  query += ' ORDER BY is_default DESC, name';

  const result = await db.query(query, params);

  res.json({
    status: 'success',
    data: result.rows,
  });
}));

/**
 * POST /reports/configurations
 * Save a new report configuration
 */
router.post('/configurations', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { report_type, name, description, account_ids, settings } = req.body;

  if (!report_type || !name) {
    throw new ApiError(400, 'report_type and name are required');
  }

  const result = await db.query(`
    INSERT INTO report_configurations (tenant_id, report_type, name, description, account_ids, settings, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [tenantId, report_type, name, description, account_ids, settings || {}, req.user.id]);

  res.status(201).json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * PUT /reports/configurations/:id
 * Update a report configuration
 */
router.put('/configurations/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;
  const { name, description, account_ids, settings, is_default } = req.body;

  const result = await db.query(`
    UPDATE report_configurations 
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        account_ids = COALESCE($3, account_ids),
        settings = COALESCE($4, settings),
        is_default = COALESCE($5, is_default),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $6 AND tenant_id = $7
    RETURNING *
  `, [name, description, account_ids, settings, is_default, id, tenantId]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Configuration not found');
  }

  res.json({
    status: 'success',
    data: result.rows[0],
  });
}));

/**
 * DELETE /reports/configurations/:id
 * Delete a report configuration
 */
router.delete('/configurations/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;

  const result = await db.query(
    'DELETE FROM report_configurations WHERE id = $1 AND tenant_id = $2 RETURNING id',
    [id, tenantId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Configuration not found');
  }

  res.json({
    status: 'success',
    message: 'Configuration deleted',
  });
}));

// ============================================================================
// AVAILABLE ACCOUNTS FOR REPORTS
// ============================================================================

/**
 * GET /reports/accounts
 * Get available accounts for report configuration
 */
router.get('/accounts', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { type } = req.query; // 'income_statement' or 'balance_sheet'

  let typeFilter;
  if (type === 'income_statement') {
    typeFilter = "('revenue', 'expense')";
  } else if (type === 'balance_sheet') {
    typeFilter = "('asset', 'liability', 'equity')";
  } else {
    typeFilter = "('asset', 'liability', 'equity', 'revenue', 'expense')";
  }

  const result = await db.query(`
    SELECT id, account_code, name, account_type, account_subtype
    FROM accounts_chart
    WHERE account_type IN ${typeFilter}
      AND tenant_id = $1
    ORDER BY account_type, account_code
  `, [tenantId]);

  res.json({
    status: 'success',
    data: result.rows,
  });
}));

// ============================================================================
// ACCOUNT DRILL-DOWN (Transaction Details)
// ============================================================================

/**
 * GET /reports/account-transactions/:accountId
 * Get all journal entry lines for a specific account within date range
 */
router.get('/account-transactions/:accountId', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { accountId } = req.params;
  const { start_date, end_date } = req.query;

  if (!accountId) {
    throw new ApiError(400, 'accountId is required');
  }

  // Build date filter
  let dateFilter = '';
  const params = [accountId, tenantId];
  
  if (start_date && end_date) {
    dateFilter = 'AND je.entry_date >= $3 AND je.entry_date <= $4';
    params.push(start_date, end_date);
  } else if (end_date) {
    // For balance sheet (as of date)
    dateFilter = 'AND je.entry_date <= $3';
    params.push(end_date);
  }

  // Get account info (tenant-scoped)
  const accountResult = await db.query(
    'SELECT id, account_code, name, account_type, normal_balance FROM accounts_chart WHERE id = $1 AND tenant_id = $2',
    [accountId, tenantId]
  );

  if (accountResult.rows.length === 0) {
    throw new ApiError(404, 'Account not found');
  }

  const account = accountResult.rows[0];

  // Get all journal entry lines for this account (tenant-scoped)
  const result = await db.query(`
    SELECT 
      je.id AS entry_id,
      je.entry_number,
      je.entry_date,
      je.description AS entry_description,
      je.reference,
      je.source_type,
      jel.line_number,
      jel.description AS line_description,
      jel.debit,
      jel.credit,
      CASE 
        WHEN $${params.length + 1} = 'debit' THEN jel.debit - jel.credit
        ELSE jel.credit - jel.debit
      END AS net_amount
    FROM journal_entry_lines jel
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    WHERE jel.account_id = $1
      AND je.tenant_id = $2
      AND je.status = 'posted'
      ${dateFilter}
    ORDER BY je.entry_date DESC, je.entry_number DESC
  `, [...params, account.normal_balance]);

  // Calculate running balance
  let runningBalance = 0;
  const transactions = result.rows.map(row => {
    const netAmount = parseFloat(row.net_amount) || 0;
    runningBalance += netAmount;
    return {
      ...row,
      debit: parseFloat(row.debit) || 0,
      credit: parseFloat(row.credit) || 0,
      net_amount: netAmount,
    };
  });

  // Reverse to show oldest first with running balance, then reverse back for display
  let balance = 0;
  const transactionsWithBalance = [...transactions].reverse().map(t => {
    balance += t.net_amount;
    return { ...t, running_balance: balance };
  }).reverse();

  res.json({
    status: 'success',
    data: {
      account,
      start_date: start_date || null,
      end_date: end_date || null,
      transactions: transactionsWithBalance,
      total_debits: transactions.reduce((sum, t) => sum + t.debit, 0),
      total_credits: transactions.reduce((sum, t) => sum + t.credit, 0),
      ending_balance: balance,
      transaction_count: transactions.length,
    },
  });
}));

// ============================================================================
// CSV EXPORT ENDPOINTS
// ============================================================================

/**
 * GET /reports/income-statement/csv
 * Export Income Statement as CSV
 */
router.get('/income-statement/csv', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    throw new ApiError(400, 'start_date and end_date are required');
  }

  const result = await db.query(`
    SELECT 
      ac.account_code,
      ac.name AS account_name,
      ac.account_type,
      CASE 
        WHEN ac.account_type = 'revenue' THEN COALESCE(totals.credits, 0) - COALESCE(totals.debits, 0)
        WHEN ac.account_type = 'expense' THEN COALESCE(totals.debits, 0) - COALESCE(totals.credits, 0)
        ELSE 0
      END AS balance
    FROM accounts_chart ac
    LEFT JOIN (
      SELECT 
        jel.account_id,
        SUM(jel.debit) as debits,
        SUM(jel.credit) as credits
      FROM journal_entry_lines jel
      INNER JOIN journal_entries je ON jel.journal_entry_id = je.id
      WHERE je.status = 'posted'
        AND je.tenant_id = $3
        AND je.entry_date >= $1 
        AND je.entry_date <= $2
      GROUP BY jel.account_id
    ) totals ON ac.id = totals.account_id
    WHERE ac.account_type IN ('revenue', 'expense')
      AND ac.tenant_id = $3
      AND ac.is_active = true
      AND (COALESCE(totals.debits, 0) != 0 OR COALESCE(totals.credits, 0) != 0)
    ORDER BY ac.account_type DESC, ac.account_code
  `, [start_date, end_date, tenantId]);

  // Build CSV
  let csv = 'Income Statement\n';
  csv += `"Hood Youmans & Hood, LLC"\n`;
  csv += `"${start_date} to ${end_date}"\n\n`;
  csv += 'Account Code,Account Name,Type,Amount\n';

  let totalRevenue = 0;
  let totalExpenses = 0;

  // Revenue section
  csv += '\nRevenue\n';
  result.rows.filter(r => r.account_type === 'revenue').forEach(row => {
    const amount = parseFloat(row.balance) || 0;
    totalRevenue += amount;
    csv += `"${row.account_code}","${row.account_name}","Revenue","${amount.toFixed(2)}"\n`;
  });
  csv += `"","Total Revenue","","${totalRevenue.toFixed(2)}"\n`;

  // Expenses section
  csv += '\nExpenses\n';
  result.rows.filter(r => r.account_type === 'expense').forEach(row => {
    const amount = parseFloat(row.balance) || 0;
    totalExpenses += amount;
    csv += `"${row.account_code}","${row.account_name}","Expense","${amount.toFixed(2)}"\n`;
  });
  csv += `"","Total Expenses","","${totalExpenses.toFixed(2)}"\n`;

  // Net Income
  csv += `\n"","Net Income","","${(totalRevenue - totalExpenses).toFixed(2)}"\n`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="income_statement_${start_date}_${end_date}.csv"`);
  res.send(csv);
}));

/**
 * GET /reports/balance-sheet/csv
 * Export Balance Sheet as CSV
 */
router.get('/balance-sheet/csv', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { as_of_date } = req.query;

  if (!as_of_date) {
    throw new ApiError(400, 'as_of_date is required');
  }

  const result = await db.query(`
    SELECT 
      ac.account_code,
      ac.name AS account_name,
      ac.account_type,
      CASE 
        WHEN ac.account_type = 'asset' THEN COALESCE(totals.debits, 0) - COALESCE(totals.credits, 0)
        ELSE COALESCE(totals.credits, 0) - COALESCE(totals.debits, 0)
      END AS balance
    FROM accounts_chart ac
    LEFT JOIN (
      SELECT 
        jel.account_id,
        SUM(jel.debit) as debits,
        SUM(jel.credit) as credits
      FROM journal_entry_lines jel
      INNER JOIN journal_entries je ON jel.journal_entry_id = je.id
      WHERE je.status = 'posted'
        AND je.tenant_id = $2
        AND je.entry_date <= $1
      GROUP BY jel.account_id
    ) totals ON ac.id = totals.account_id
    WHERE ac.account_type IN ('asset', 'liability', 'equity')
      AND ac.tenant_id = $2
      AND ac.is_active = true
      AND (COALESCE(totals.debits, 0) != 0 OR COALESCE(totals.credits, 0) != 0)
    ORDER BY 
      CASE ac.account_type WHEN 'asset' THEN 1 WHEN 'liability' THEN 2 WHEN 'equity' THEN 3 END,
      ac.account_code
  `, [as_of_date, tenantId]);

  // Build CSV
  let csv = 'Balance Sheet\n';
  csv += `"Hood Youmans & Hood, LLC"\n`;
  csv += `"As of ${as_of_date}"\n\n`;
  csv += 'Account Code,Account Name,Type,Balance\n';

  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalEquity = 0;

  // Assets
  csv += '\nAssets\n';
  result.rows.filter(r => r.account_type === 'asset').forEach(row => {
    const amount = parseFloat(row.balance) || 0;
    totalAssets += amount;
    csv += `"${row.account_code}","${row.account_name}","Asset","${amount.toFixed(2)}"\n`;
  });
  csv += `"","Total Assets","","${totalAssets.toFixed(2)}"\n`;

  // Liabilities
  csv += '\nLiabilities\n';
  result.rows.filter(r => r.account_type === 'liability').forEach(row => {
    const amount = parseFloat(row.balance) || 0;
    totalLiabilities += amount;
    csv += `"${row.account_code}","${row.account_name}","Liability","${amount.toFixed(2)}"\n`;
  });
  csv += `"","Total Liabilities","","${totalLiabilities.toFixed(2)}"\n`;

  // Equity
  csv += '\nEquity\n';
  result.rows.filter(r => r.account_type === 'equity').forEach(row => {
    const amount = parseFloat(row.balance) || 0;
    totalEquity += amount;
    csv += `"${row.account_code}","${row.account_name}","Equity","${amount.toFixed(2)}"\n`;
  });
  
  const retainedEarnings = totalAssets - totalLiabilities - totalEquity;
  if (Math.abs(retainedEarnings) > 0.01) {
    csv += `"","Retained Earnings (calculated)","Equity","${retainedEarnings.toFixed(2)}"\n`;
  }
  csv += `"","Total Equity","","${(totalEquity + retainedEarnings).toFixed(2)}"\n`;

  csv += `\n"","Total Liabilities & Equity","","${(totalLiabilities + totalEquity + retainedEarnings).toFixed(2)}"\n`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="balance_sheet_${as_of_date}.csv"`);
  res.send(csv);
}));

/**
 * GET /reports/sales-by-customer/csv
 * Export Sales by Customer as CSV
 */
router.get('/sales-by-customer/csv', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    throw new ApiError(400, 'start_date and end_date are required');
  }

  const result = await db.query(`
    SELECT 
      COALESCE(NULLIF(TRIM(SPLIT_PART(je.description, ' - ', 1)), ''), 'Unknown') AS customer_name,
      COUNT(DISTINCT je.id) AS transaction_count,
      SUM(jel.credit) AS total_amount
    FROM journal_entries je
    JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE je.status = 'posted'
      AND je.tenant_id = $3
      AND je.entry_date >= $1
      AND je.entry_date <= $2
      AND ac.account_type = 'revenue'
      AND jel.credit > 0
    GROUP BY SPLIT_PART(je.description, ' - ', 1)
    ORDER BY SUM(jel.credit) DESC
  `, [start_date, end_date, tenantId]);

  const totalSales = result.rows.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);

  let csv = 'Sales by Customer\n';
  csv += `"Hood Youmans & Hood, LLC"\n`;
  csv += `"${start_date} to ${end_date}"\n\n`;
  csv += 'Customer,Transactions,Total Sales,Percentage\n';

  result.rows.forEach(row => {
    const amount = parseFloat(row.total_amount) || 0;
    const pct = totalSales > 0 ? (amount / totalSales * 100).toFixed(2) : '0.00';
    csv += `"${row.customer_name}","${row.transaction_count}","${amount.toFixed(2)}","${pct}%"\n`;
  });

  csv += `\n"Total","${result.rows.reduce((s, r) => s + parseInt(r.transaction_count), 0)}","${totalSales.toFixed(2)}","100%"\n`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="sales_by_customer_${start_date}_${end_date}.csv"`);
  res.send(csv);
}));

/**
 * GET /reports/sales-by-class/csv
 * Export Sales by Class as CSV
 */
router.get('/sales-by-class/csv', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    throw new ApiError(400, 'start_date and end_date are required');
  }

  const result = await db.query(`
    SELECT 
      ac.name AS class_name,
      ac.account_code,
      COUNT(DISTINCT je.id) AS transaction_count,
      SUM(jel.credit) AS total_amount
    FROM journal_entries je
    JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE je.status = 'posted'
      AND je.tenant_id = $3
      AND je.entry_date >= $1
      AND je.entry_date <= $2
      AND ac.account_type = 'revenue'
      AND jel.credit > 0
    GROUP BY ac.id, ac.name, ac.account_code
    ORDER BY SUM(jel.credit) DESC
  `, [start_date, end_date, tenantId]);

  const totalSales = result.rows.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);

  let csv = 'Sales by Class\n';
  csv += `"Hood Youmans & Hood, LLC"\n`;
  csv += `"${start_date} to ${end_date}"\n\n`;
  csv += 'Account Code,Class/Category,Transactions,Total Sales,Percentage\n';

  result.rows.forEach(row => {
    const amount = parseFloat(row.total_amount) || 0;
    const pct = totalSales > 0 ? (amount / totalSales * 100).toFixed(2) : '0.00';
    csv += `"${row.account_code}","${row.class_name}","${row.transaction_count}","${amount.toFixed(2)}","${pct}%"\n`;
  });

  csv += `\n"","Total","${result.rows.reduce((s, r) => s + parseInt(r.transaction_count), 0)}","${totalSales.toFixed(2)}","100%"\n`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="sales_by_class_${start_date}_${end_date}.csv"`);
  res.send(csv);
}));

module.exports = router;
