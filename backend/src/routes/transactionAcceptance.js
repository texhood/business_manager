/**
 * Simplified Transaction Acceptance Routes
 * Uses categories for income/expense classification
 * Auto-generates journal entries on approval
 */

const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticate, requireRole } = require('../middleware/auth');
const logger = require('../utils/logger');

// All routes require authentication
router.use(authenticate);

// ============================================================================
// HELPER: Get or create GL account for a category
// ============================================================================
async function getOrCreateCategoryAccount(category, client = db) {
  // Check if a GL account already exists for this category
  const existing = await client.query(`
    SELECT id FROM accounts_chart 
    WHERE name = $1 AND account_type = $2 AND is_category_account = true
    LIMIT 1
  `, [category.name, category.type === 'income' ? 'revenue' : 'expense']);
  
  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }
  
  // Create a new GL account for this category
  const accountType = category.type === 'income' ? 'revenue' : 'expense';
  const normalBalance = category.type === 'income' ? 'credit' : 'debit';
  const codePrefix = category.type === 'income' ? '4' : '5';
  const accountCode = `${codePrefix}${String(category.id).padStart(4, '0')}`;
  
  const result = await client.query(`
    INSERT INTO accounts_chart (account_code, name, account_type, normal_balance, is_category_account, is_active)
    VALUES ($1, $2, $3, $4, true, true)
    ON CONFLICT (account_code) DO UPDATE SET name = $2
    RETURNING id
  `, [accountCode, category.name, accountType, normalBalance]);
  
  return result.rows[0].id;
}

// ============================================================================
// HELPER: Generate journal entry for accepted transaction
// ============================================================================
async function createJournalEntry(transaction, categoryId, bankAccountId, classId, client = db) {
  // Get category details
  const categoryResult = await client.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
  if (categoryResult.rows.length === 0) {
    throw new Error('Category not found');
  }
  const category = categoryResult.rows[0];
  
  // Get or create the GL account for this category
  const categoryAccountId = await getOrCreateCategoryAccount(category, client);
  
  // Determine debit/credit based on transaction type
  const isIncome = category.type === 'income';
  const amount = Math.abs(parseFloat(transaction.amount));
  
  // Generate entry number
  const entryNumResult = await client.query(`
    SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM 4) AS INTEGER)), 0) + 1 as next_num
    FROM journal_entries 
    WHERE entry_number LIKE 'JE-%'
  `);
  const entryNumber = `JE-${String(entryNumResult.rows[0].next_num).padStart(6, '0')}`;
  
  // Create journal entry header
  const entryResult = await client.query(`
    INSERT INTO journal_entries (entry_number, entry_date, description, source, source_id, status, created_by)
    VALUES ($1, $2, $3, 'transaction', $4, 'posted', $5)
    RETURNING id
  `, [
    entryNumber,
    transaction.date,
    transaction.description || `${category.type === 'income' ? 'Income' : 'Expense'}: ${category.name}`,
    transaction.id,
    transaction.created_by || 1
  ]);
  
  const entryId = entryResult.rows[0].id;
  
  // Create journal entry lines
  if (isIncome) {
    // Income: Debit Bank, Credit Revenue
    await client.query(`
      INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, description, class_id)
      VALUES 
        ($1, $2, $3, 0, $4, $5),
        ($1, $6, 0, $3, $4, $5)
    `, [entryId, bankAccountId, amount, transaction.description, classId, categoryAccountId]);
  } else {
    // Expense: Debit Expense, Credit Bank
    await client.query(`
      INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, description, class_id)
      VALUES 
        ($1, $2, $3, 0, $4, $5),
        ($1, $6, 0, $3, $4, $5)
    `, [entryId, categoryAccountId, amount, transaction.description, classId, bankAccountId]);
  }
  
  // Update account balances
  await client.query(`
    UPDATE accounts_chart 
    SET current_balance = current_balance + $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `, [isIncome ? amount : -amount, bankAccountId]);
  
  await client.query(`
    UPDATE accounts_chart 
    SET current_balance = current_balance + $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `, [isIncome ? amount : amount, categoryAccountId]);
  
  return { entryId, entryNumber };
}

// ============================================================================
// GET /transaction-acceptance/pending - Get pending transactions
// ============================================================================
router.get('/pending', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    const result = await db.query(`
      SELECT t.*, 
             a.name as account_name,
             c.name as category_name,
             c.type as category_type,
             cl.name as class_name
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN classes cl ON t.class_id = cl.id
      WHERE t.acceptance_status = 'pending'
      ORDER BY t.date DESC, t.id DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    const countResult = await db.query(`
      SELECT COUNT(*) as total FROM transactions WHERE acceptance_status = 'pending'
    `);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    logger.error('Error fetching pending transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending transactions' });
  }
});

// ============================================================================
// GET /transaction-acceptance/accepted - Get accepted transactions
// ============================================================================
router.get('/accepted', async (req, res) => {
  try {
    const { limit = 100, offset = 0, start_date, end_date } = req.query;
    
    let query = `
      SELECT t.*, 
             a.name as account_name,
             c.name as category_name,
             c.type as category_type,
             cl.name as class_name,
             je.entry_number as journal_entry_number
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN classes cl ON t.class_id = cl.id
      LEFT JOIN journal_entries je ON je.source = 'transaction' AND je.source_id = t.id
      WHERE t.acceptance_status = 'accepted'
    `;
    const params = [];
    
    if (start_date) {
      params.push(start_date);
      query += ` AND t.date >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      query += ` AND t.date <= $${params.length}`;
    }
    
    query += ` ORDER BY t.date DESC, t.id DESC`;
    params.push(limit, offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching accepted transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch accepted transactions' });
  }
});

// ============================================================================
// GET /transaction-acceptance/excluded - Get excluded transactions
// ============================================================================
router.get('/excluded', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    const result = await db.query(`
      SELECT t.*, 
             a.name as account_name
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.acceptance_status = 'excluded'
      ORDER BY t.date DESC, t.id DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching excluded transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch excluded transactions' });
  }
});

// ============================================================================
// GET /transaction-acceptance/summary - Get counts by status
// ============================================================================
router.get('/summary', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        acceptance_status,
        COUNT(*) as count,
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as total_expense
      FROM transactions
      GROUP BY acceptance_status
    `);
    
    const summary = {
      pending: { count: 0, total_income: 0, total_expense: 0 },
      accepted: { count: 0, total_income: 0, total_expense: 0 },
      excluded: { count: 0, total_income: 0, total_expense: 0 }
    };
    
    result.rows.forEach(row => {
      if (summary[row.acceptance_status]) {
        summary[row.acceptance_status] = {
          count: parseInt(row.count),
          total_income: parseFloat(row.total_income),
          total_expense: parseFloat(row.total_expense)
        };
      }
    });
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error('Error fetching transaction summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
});

// ============================================================================
// GET /transaction-acceptance/bank-accounts - Get available bank accounts
// ============================================================================
router.get('/bank-accounts', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, account_code, name, current_balance
      FROM accounts_chart
      WHERE account_subtype IN ('cash', 'bank', 'credit_card')
        AND is_active = true
      ORDER BY account_code
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching bank accounts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bank accounts' });
  }
});

// ============================================================================
// POST /transaction-acceptance/:id/accept - Accept a transaction
// ============================================================================
router.post('/:id/accept', requireRole ('admin', 'manager', 'staff'), async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const { id } = req.params;
    const { category_id, bank_account_id, class_id, description } = req.body;
    
    if (!category_id) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }
    
    if (!bank_account_id) {
      return res.status(400).json({ success: false, message: 'Bank account is required' });
    }
    
    await client.query('BEGIN');
    
    // Get the transaction
    const txnResult = await client.query(
      'SELECT * FROM transactions WHERE id = $1 FOR UPDATE',
      [id]
    );
    
    if (txnResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    const transaction = txnResult.rows[0];
    
    if (transaction.acceptance_status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: `Transaction is already ${transaction.acceptance_status}` 
      });
    }
    
    // Update transaction with category and class
    if (description) {
      transaction.description = description;
    }
    
    await client.query(`
      UPDATE transactions 
      SET category_id = $1, 
          class_id = $2, 
          description = COALESCE($3, description),
          acceptance_status = 'accepted',
          accepted_at = CURRENT_TIMESTAMP,
          accepted_by = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
    `, [category_id, class_id || null, description, req.user.id, id]);
    
    // Create journal entry
    const { entryId, entryNumber } = await createJournalEntry(
      transaction, 
      category_id, 
      bank_account_id, 
      class_id || null,
      client
    );
    
    await client.query('COMMIT');
    
    logger.info(`Transaction ${id} accepted, journal entry ${entryNumber} created`);
    
    res.json({
      success: true,
      message: 'Transaction accepted',
      data: {
        transaction_id: id,
        journal_entry_id: entryId,
        journal_entry_number: entryNumber
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error accepting transaction:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to accept transaction' });
  } finally {
    client.release();
  }
});

// ============================================================================
// POST /transaction-acceptance/:id/exclude - Exclude a transaction
// ============================================================================
router.post('/:id/exclude', requireRole ('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const result = await db.query(`
      UPDATE transactions 
      SET acceptance_status = 'excluded',
          exclusion_reason = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND acceptance_status = 'pending'
      RETURNING *
    `, [reason || null, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found or not pending' });
    }
    
    logger.info(`Transaction ${id} excluded: ${reason || 'No reason given'}`);
    
    res.json({
      success: true,
      message: 'Transaction excluded',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error excluding transaction:', error);
    res.status(500).json({ success: false, message: 'Failed to exclude transaction' });
  }
});

// ============================================================================
// POST /transaction-acceptance/:id/restore - Restore excluded transaction
// ============================================================================
router.post('/:id/restore', requireRole ('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      UPDATE transactions 
      SET acceptance_status = 'pending',
          exclusion_reason = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND acceptance_status = 'excluded'
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found or not excluded' });
    }
    
    logger.info(`Transaction ${id} restored to pending`);
    
    res.json({
      success: true,
      message: 'Transaction restored to pending',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error restoring transaction:', error);
    res.status(500).json({ success: false, message: 'Failed to restore transaction' });
  }
});

// ============================================================================
// POST /transaction-acceptance/:id/unaccept - Unaccept and void journal entry
// ============================================================================
router.post('/:id/unaccept', requireRole ('admin', 'manager'), async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const { id } = req.params;
    
    await client.query('BEGIN');
    
    // Get transaction
    const txnResult = await client.query(
      'SELECT * FROM transactions WHERE id = $1 FOR UPDATE',
      [id]
    );
    
    if (txnResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    const transaction = txnResult.rows[0];
    
    if (transaction.acceptance_status !== 'accepted') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Transaction is not accepted' });
    }
    
    // Find and void the journal entry
    const jeResult = await client.query(`
      SELECT id FROM journal_entries 
      WHERE source = 'transaction' AND source_id = $1 AND status = 'posted'
    `, [id]);
    
    if (jeResult.rows.length > 0) {
      const jeId = jeResult.rows[0].id;
      
      // Reverse account balances from journal entry lines
      const linesResult = await client.query(`
        SELECT account_id, debit, credit FROM journal_entry_lines WHERE journal_entry_id = $1
      `, [jeId]);
      
      for (const line of linesResult.rows) {
        const netChange = parseFloat(line.debit) - parseFloat(line.credit);
        await client.query(`
          UPDATE accounts_chart 
          SET current_balance = current_balance - $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [netChange, line.account_id]);
      }
      
      // Void the journal entry
      await client.query(`
        UPDATE journal_entries 
        SET status = 'voided', 
            voided_at = CURRENT_TIMESTAMP,
            void_reason = 'Transaction unaccepted'
        WHERE id = $1
      `, [jeId]);
    }
    
    // Reset transaction status
    await client.query(`
      UPDATE transactions 
      SET acceptance_status = 'pending',
          category_id = NULL,
          class_id = NULL,
          accepted_at = NULL,
          accepted_by = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [id]);
    
    await client.query('COMMIT');
    
    logger.info(`Transaction ${id} unaccepted, journal entry voided`);
    
    res.json({
      success: true,
      message: 'Transaction unaccepted and journal entry voided'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error unaccepting transaction:', error);
    res.status(500).json({ success: false, message: 'Failed to unaccept transaction' });
  } finally {
    client.release();
  }
});

// ============================================================================
// POST /transaction-acceptance/bulk-accept - Bulk accept transactions
// ============================================================================
router.post('/bulk-accept', requireRole ('admin', 'manager'), async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const { transaction_ids, category_id, bank_account_id, class_id } = req.body;
    
    if (!Array.isArray(transaction_ids) || transaction_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Transaction IDs required' });
    }
    
    if (!category_id || !bank_account_id) {
      return res.status(400).json({ success: false, message: 'Category and bank account required' });
    }
    
    await client.query('BEGIN');
    
    const results = { accepted: 0, failed: 0, errors: [] };
    
    for (const txnId of transaction_ids) {
      try {
        const txnResult = await client.query(
          'SELECT * FROM transactions WHERE id = $1 AND acceptance_status = $2 FOR UPDATE',
          [txnId, 'pending']
        );
        
        if (txnResult.rows.length === 0) {
          results.failed++;
          results.errors.push({ id: txnId, error: 'Not found or not pending' });
          continue;
        }
        
        const transaction = txnResult.rows[0];
        
        await client.query(`
          UPDATE transactions 
          SET category_id = $1, 
              class_id = $2, 
              acceptance_status = 'accepted',
              accepted_at = CURRENT_TIMESTAMP,
              accepted_by = $3,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $4
        `, [category_id, class_id || null, req.user.id, txnId]);
        
        await createJournalEntry(transaction, category_id, bank_account_id, class_id || null, client);
        
        results.accepted++;
      } catch (err) {
        results.failed++;
        results.errors.push({ id: txnId, error: err.message });
      }
    }
    
    await client.query('COMMIT');
    
    logger.info(`Bulk accept: ${results.accepted} accepted, ${results.failed} failed`);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error in bulk accept:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk accept transactions' });
  } finally {
    client.release();
  }
});

module.exports = router;
