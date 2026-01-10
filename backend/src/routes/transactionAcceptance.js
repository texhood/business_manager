/**
 * Transaction Acceptance Routes
 * Handles categorization and acceptance of bank transactions
 * 
 * Flow:
 * 1. Plaid imports transactions with plaid_account_id
 * 2. User categorizes: selects GL account (expense/revenue) and class
 * 3. System derives bank GL account from plaid_accounts.linked_account_id
 * 4. Journal entry is auto-generated on acceptance
 */

const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticate, requireRole } = require('../middleware/auth');
const logger = require('../utils/logger');

// All routes require authentication
router.use(authenticate);

// ============================================================================
// HELPER: Get bank GL account from transaction's Plaid account
// ============================================================================
async function getBankGLAccountId(transaction, client = db) {
  if (!transaction.plaid_account_id) {
    throw new Error('Transaction has no linked Plaid account. Cannot determine bank GL account.');
  }
  
  const result = await client.query(`
    SELECT pa.linked_account_id, pa.name as plaid_name, ac.name as gl_name
    FROM plaid_accounts pa
    LEFT JOIN accounts_chart ac ON pa.linked_account_id = ac.id
    WHERE pa.id = $1
  `, [transaction.plaid_account_id]);
  
  if (result.rows.length === 0) {
    throw new Error('Plaid account not found.');
  }
  
  const plaidAccount = result.rows[0];
  
  if (!plaidAccount.linked_account_id) {
    throw new Error(`Plaid account "${plaidAccount.plaid_name}" is not linked to a GL account. Please configure in Bank Connections.`);
  }
  
  return plaidAccount.linked_account_id;
}

// ============================================================================
// HELPER: Generate journal entry for accepted transaction
// ============================================================================
async function createJournalEntry(transaction, glAccountId, bankGLAccountId, classId, description, client = db) {
  // Get the selected GL account details
  const glAccountResult = await client.query(
    'SELECT * FROM accounts_chart WHERE id = $1',
    [glAccountId]
  );
  
  if (glAccountResult.rows.length === 0) {
    throw new Error('Selected GL account not found');
  }
  
  const glAccount = glAccountResult.rows[0];
  const amount = Math.abs(parseFloat(transaction.amount));
  const txnDescription = description || transaction.description;
  
  // Determine if this is income or expense based on transaction amount and GL account type
  // Positive amount = deposit/income, Negative amount = withdrawal/expense
  const isDeposit = parseFloat(transaction.amount) > 0;
  
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
    txnDescription,
    transaction.id,
    transaction.created_by || null
  ]);
  
  const entryId = entryResult.rows[0].id;
  
  // Create journal entry lines based on transaction direction
  if (isDeposit) {
    // Deposit/Income: Debit Bank, Credit Revenue/Income account
    await client.query(`
      INSERT INTO journal_entry_lines (journal_entry_id, line_number, account_id, debit, credit, description, class_id)
      VALUES 
        ($1, 1, $2, $3, 0, $4, $5),
        ($1, 2, $6, 0, $3, $4, $5)
    `, [entryId, bankGLAccountId, amount, txnDescription, classId, glAccountId]);
    
    // Update balances: Bank increases (debit), Revenue increases (credit)
    await client.query(`
      UPDATE accounts_chart SET current_balance = current_balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
    `, [amount, bankGLAccountId]);
    await client.query(`
      UPDATE accounts_chart SET current_balance = current_balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
    `, [amount, glAccountId]);
  } else {
    // Withdrawal/Expense: Debit Expense account, Credit Bank
    await client.query(`
      INSERT INTO journal_entry_lines (journal_entry_id, line_number, account_id, debit, credit, description, class_id)
      VALUES 
        ($1, 1, $2, $3, 0, $4, $5),
        ($1, 2, $6, 0, $3, $4, $5)
    `, [entryId, glAccountId, amount, txnDescription, classId, bankGLAccountId]);
    
    // Update balances: Expense increases (debit), Bank decreases (credit)
    await client.query(`
      UPDATE accounts_chart SET current_balance = current_balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
    `, [amount, glAccountId]);
    await client.query(`
      UPDATE accounts_chart SET current_balance = current_balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
    `, [amount, bankGLAccountId]);
  }
  
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
             tc.name as category_name,
             tc.type as category_type,
             cl.name as class_name,
             pa.name as plaid_account_name,
             pa.mask as plaid_account_mask,
             pa.linked_account_id as bank_gl_account_id,
             pi.institution_name,
             ac_bank.name as bank_gl_account_name,
             COALESCE(pa.name || ' (...' || pa.mask || ') - ' || pi.institution_name, 'Unknown Source') as source_display
      FROM transactions t
      LEFT JOIN transaction_categories tc ON t.category_id = tc.id
      LEFT JOIN classes cl ON t.class_id = cl.id
      LEFT JOIN plaid_accounts pa ON t.plaid_account_id = pa.id
      LEFT JOIN plaid_items pi ON pa.plaid_item_id = pi.id
      LEFT JOIN accounts_chart ac_bank ON pa.linked_account_id = ac_bank.id
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
             tc.name as category_name,
             tc.type as category_type,
             cl.name as class_name,
             je.entry_number as journal_entry_number,
             pa.name as plaid_account_name,
             pa.mask as plaid_account_mask,
             pi.institution_name,
             ac_gl.name as accepted_gl_account_name,
             ac_bank.name as bank_gl_account_name,
             COALESCE(pa.name || ' (...' || pa.mask || ') - ' || pi.institution_name, 'Unknown Source') as source_display
      FROM transactions t
      LEFT JOIN transaction_categories tc ON t.category_id = tc.id
      LEFT JOIN classes cl ON t.class_id = cl.id
      LEFT JOIN journal_entries je ON je.source = 'transaction' AND je.source_id = t.id
      LEFT JOIN plaid_accounts pa ON t.plaid_account_id = pa.id
      LEFT JOIN plaid_items pi ON pa.plaid_item_id = pi.id
      LEFT JOIN accounts_chart ac_gl ON t.accepted_gl_account_id = ac_gl.id
      LEFT JOIN accounts_chart ac_bank ON pa.linked_account_id = ac_bank.id
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
             pa.name as plaid_account_name,
             pa.mask as plaid_account_mask,
             pi.institution_name,
             COALESCE(pa.name || ' (...' || pa.mask || ') - ' || pi.institution_name, 'Unknown Source') as source_display
      FROM transactions t
      LEFT JOIN plaid_accounts pa ON t.plaid_account_id = pa.id
      LEFT JOIN plaid_items pi ON pa.plaid_item_id = pi.id
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
// POST /transaction-acceptance/:id/accept - Accept a transaction
// ============================================================================
router.post('/:id/accept', requireRole('admin', 'manager', 'staff'), async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const { id } = req.params;
    const { account_id, class_id, description } = req.body;
    
    // account_id is the GL account (expense/revenue) user selected
    if (!account_id) {
      return res.status(400).json({ success: false, message: 'Account is required' });
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
    
    // Derive the bank GL account from the transaction's Plaid account
    const bankGLAccountId = await getBankGLAccountId(transaction, client);
    
    // Update transaction
    const finalDescription = description || transaction.description;
    
    await client.query(`
      UPDATE transactions 
      SET accepted_gl_account_id = $1, 
          class_id = $2, 
          description = $3,
          acceptance_status = 'accepted',
          accepted_at = CURRENT_TIMESTAMP,
          accepted_by = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
    `, [account_id, class_id || null, finalDescription, req.user.id, id]);
    
    // Create journal entry
    const { entryId, entryNumber } = await createJournalEntry(
      transaction, 
      account_id,        // User-selected GL account (expense/revenue)
      bankGLAccountId,   // Derived bank GL account
      class_id || null,
      finalDescription,
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
router.post('/:id/exclude', requireRole('admin', 'manager'), async (req, res) => {
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
router.post('/:id/restore', requireRole('admin', 'manager'), async (req, res) => {
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
router.post('/:id/unaccept', requireRole('admin', 'manager'), async (req, res) => {
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
          accepted_gl_account_id = NULL,
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
router.post('/bulk-accept', requireRole('admin', 'manager'), async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const { transaction_ids, account_id, class_id } = req.body;
    
    if (!Array.isArray(transaction_ids) || transaction_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Transaction IDs required' });
    }
    
    if (!account_id) {
      return res.status(400).json({ success: false, message: 'Account is required' });
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
        
        // Derive bank GL account for each transaction
        const bankGLAccountId = await getBankGLAccountId(transaction, client);
        
        await client.query(`
          UPDATE transactions 
          SET accepted_gl_account_id = $1, 
              class_id = $2, 
              acceptance_status = 'accepted',
              accepted_at = CURRENT_TIMESTAMP,
              accepted_by = $3,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $4
        `, [account_id, class_id || null, req.user.id, txnId]);
        
        await createJournalEntry(
          transaction, 
          account_id, 
          bankGLAccountId, 
          class_id || null, 
          transaction.description,
          client
        );
        
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
