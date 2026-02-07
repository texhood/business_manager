/**
 * Journal Entries Routes
 * Manual journal entry creation, editing, and management
 * Tenant-aware: all operations scoped to req.user.tenant_id
 */

const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticate, requireRole } = require('../middleware/auth');
const logger = require('../utils/logger');

// All routes require authentication
router.use(authenticate);

// ============================================================================
// GET /journal-entries - List journal entries with pagination
// ============================================================================
router.get('/', async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { 
      limit = 50, 
      offset = 0, 
      status,
      start_date,
      end_date,
      search
    } = req.query;
    
    let query = `
      SELECT 
        je.*,
        a.name as created_by_name
      FROM journal_entries je
      LEFT JOIN accounts a ON je.created_by = a.id
      WHERE je.tenant_id = $1
    `;
    const params = [tenantId];
    
    if (status) {
      params.push(status);
      query += ` AND je.status = $${params.length}`;
    }
    
    if (start_date) {
      params.push(start_date);
      query += ` AND je.entry_date >= $${params.length}`;
    }
    
    if (end_date) {
      params.push(end_date);
      query += ` AND je.entry_date <= $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (je.entry_number ILIKE $${params.length} OR je.description ILIKE $${params.length} OR je.reference ILIKE $${params.length})`;
    }
    
    query += ` ORDER BY je.entry_date DESC, je.entry_number DESC`;
    
    // Count total
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await db.query(countQuery.split('ORDER BY')[0], params);
    
    // Add pagination
    params.push(limit, offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    
    const result = await db.query(query, params);
    
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
    logger.error('Error fetching journal entries:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch journal entries' });
  }
});

// ============================================================================
// GET /journal-entries/:id - Get single entry with lines
// ============================================================================
router.get('/:id', async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { id } = req.params;
    
    // Get header
    const headerResult = await db.query(`
      SELECT 
        je.*,
        a.name as created_by_name,
        pb.name as posted_by_name,
        vb.name as voided_by_name
      FROM journal_entries je
      LEFT JOIN accounts a ON je.created_by = a.id
      LEFT JOIN accounts pb ON je.posted_by = pb.id
      LEFT JOIN accounts vb ON je.voided_by = vb.id
      WHERE je.id = $1 AND je.tenant_id = $2
    `, [id, tenantId]);
    
    if (headerResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }
    
    // Get lines
    const linesResult = await db.query(`
      SELECT 
        jel.*,
        ac.account_code,
        ac.name as account_name,
        ac.account_type,
        cl.name as class_name
      FROM journal_entry_lines jel
      JOIN accounts_chart ac ON jel.account_id = ac.id
      LEFT JOIN classes cl ON jel.class_id = cl.id
      WHERE jel.journal_entry_id = $1 AND jel.tenant_id = $2
      ORDER BY jel.line_number
    `, [id, tenantId]);
    
    res.json({
      success: true,
      data: {
        ...headerResult.rows[0],
        lines: linesResult.rows
      }
    });
  } catch (error) {
    logger.error('Error fetching journal entry:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch journal entry' });
  }
});

// ============================================================================
// POST /journal-entries - Create new journal entry with lines
// ============================================================================
router.post('/', requireRole('admin', 'manager', 'staff'), async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const tenantId = req.user.tenant_id;
    const { 
      entry_date, 
      reference, 
      description, 
      notes,
      lines,
      post_immediately = false
    } = req.body;
    
    // Validation
    if (!entry_date) {
      return res.status(400).json({ success: false, message: 'Entry date is required' });
    }
    
    if (!description) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }
    
    if (!lines || !Array.isArray(lines) || lines.length < 2) {
      return res.status(400).json({ success: false, message: 'At least two lines are required' });
    }
    
    // Validate debits = credits
    const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({ 
        success: false, 
        message: `Debits (${totalDebit.toFixed(2)}) must equal credits (${totalCredit.toFixed(2)})` 
      });
    }
    
    // Validate each line has an account and either debit or credit
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.account_id) {
        return res.status(400).json({ success: false, message: `Line ${i + 1}: Account is required` });
      }
      
      const debit = parseFloat(line.debit) || 0;
      const credit = parseFloat(line.credit) || 0;
      
      if (debit === 0 && credit === 0) {
        return res.status(400).json({ success: false, message: `Line ${i + 1}: Either debit or credit must be non-zero` });
      }
      
      if (debit > 0 && credit > 0) {
        return res.status(400).json({ success: false, message: `Line ${i + 1}: Cannot have both debit and credit on the same line` });
      }
    }
    
    await client.query('BEGIN');
    
    // Create header
    const status = post_immediately ? 'posted' : 'draft';
    const headerResult = await client.query(`
      INSERT INTO journal_entries (
        tenant_id, entry_date, reference, description, notes, status, 
        source_type, created_by,
        total_debit, total_credit,
        posted_at, posted_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'manual', $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      tenantId,
      entry_date,
      reference || null,
      description,
      notes || null,
      status,
      req.user.id,
      totalDebit,
      totalCredit,
      post_immediately ? new Date() : null,
      post_immediately ? req.user.id : null
    ]);
    
    const entryId = headerResult.rows[0].id;
    const entryNumber = headerResult.rows[0].entry_number;
    
    // Create lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      await client.query(`
        INSERT INTO journal_entry_lines (
          tenant_id, journal_entry_id, line_number, account_id, description, debit, credit, class_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        tenantId,
        entryId,
        i + 1,
        line.account_id,
        line.description || null,
        parseFloat(line.debit) || 0,
        parseFloat(line.credit) || 0,
        line.class_id || null
      ]);
      
      // If posting immediately, update account balances
      if (post_immediately) {
        const debit = parseFloat(line.debit) || 0;
        const credit = parseFloat(line.credit) || 0;
        const netChange = debit - credit;
        
        await client.query(`
          UPDATE accounts_chart 
          SET current_balance = current_balance + $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2 AND tenant_id = $3
        `, [netChange, line.account_id, tenantId]);
      }
    }
    
    await client.query('COMMIT');
    
    logger.info(`Journal entry ${entryNumber} created by user ${req.user.id}, status: ${status}`);
    
    res.status(201).json({
      success: true,
      message: `Journal entry ${entryNumber} created${post_immediately ? ' and posted' : ''}`,
      data: {
        id: entryId,
        entry_number: entryNumber,
        status
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error creating journal entry:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create journal entry' });
  } finally {
    client.release();
  }
});

// ============================================================================
// PUT /journal-entries/:id - Update draft entry
// ============================================================================
router.put('/:id', requireRole('admin', 'manager'), async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const tenantId = req.user.tenant_id;
    const { id } = req.params;
    const { entry_date, reference, description, notes, lines } = req.body;
    
    await client.query('BEGIN');
    
    // Get current entry (tenant-scoped)
    const currentResult = await client.query(
      'SELECT * FROM journal_entries WHERE id = $1 AND tenant_id = $2 FOR UPDATE',
      [id, tenantId]
    );
    
    if (currentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }
    
    if (currentResult.rows[0].status !== 'draft') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Only draft entries can be edited' });
    }
    
    // Validate lines if provided
    if (lines) {
      if (!Array.isArray(lines) || lines.length < 2) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'At least two lines are required' });
      }
      
      const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
      const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
      
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          message: `Debits (${totalDebit.toFixed(2)}) must equal credits (${totalCredit.toFixed(2)})` 
        });
      }
      
      // Delete existing lines (tenant-scoped)
      await client.query(
        'DELETE FROM journal_entry_lines WHERE journal_entry_id = $1 AND tenant_id = $2',
        [id, tenantId]
      );
      
      // Insert new lines with tenant_id
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        await client.query(`
          INSERT INTO journal_entry_lines (
            tenant_id, journal_entry_id, line_number, account_id, description, debit, credit, class_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          tenantId,
          id,
          i + 1,
          line.account_id,
          line.description || null,
          parseFloat(line.debit) || 0,
          parseFloat(line.credit) || 0,
          line.class_id || null
        ]);
      }
      
      // Update totals
      await client.query(`
        UPDATE journal_entries 
        SET total_debit = $1, total_credit = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND tenant_id = $4
      `, [totalDebit, totalCredit, id, tenantId]);
    }
    
    // Update header
    await client.query(`
      UPDATE journal_entries 
      SET 
        entry_date = COALESCE($1, entry_date),
        reference = COALESCE($2, reference),
        description = COALESCE($3, description),
        notes = COALESCE($4, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND tenant_id = $6
    `, [entry_date, reference, description, notes, id, tenantId]);
    
    await client.query('COMMIT');
    
    logger.info(`Journal entry ${id} updated by user ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'Journal entry updated'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error updating journal entry:', error);
    res.status(500).json({ success: false, message: 'Failed to update journal entry' });
  } finally {
    client.release();
  }
});

// ============================================================================
// POST /journal-entries/:id/post - Post a draft entry
// ============================================================================
router.post('/:id/post', requireRole('admin', 'manager'), async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const tenantId = req.user.tenant_id;
    const { id } = req.params;
    
    await client.query('BEGIN');
    
    // Get entry (tenant-scoped)
    const entryResult = await client.query(
      'SELECT * FROM journal_entries WHERE id = $1 AND tenant_id = $2 FOR UPDATE',
      [id, tenantId]
    );
    
    if (entryResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }
    
    const entry = entryResult.rows[0];
    
    if (entry.status !== 'draft') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: `Entry is already ${entry.status}` });
    }
    
    if (!entry.is_balanced) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Entry is not balanced' });
    }
    
    // Update account balances (tenant-scoped lines)
    const linesResult = await client.query(
      'SELECT * FROM journal_entry_lines WHERE journal_entry_id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    
    for (const line of linesResult.rows) {
      const netChange = parseFloat(line.debit) - parseFloat(line.credit);
      await client.query(`
        UPDATE accounts_chart 
        SET current_balance = current_balance + $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND tenant_id = $3
      `, [netChange, line.account_id, tenantId]);
    }
    
    // Update entry status
    await client.query(`
      UPDATE journal_entries 
      SET status = 'posted', posted_at = CURRENT_TIMESTAMP, posted_by = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND tenant_id = $3
    `, [req.user.id, id, tenantId]);
    
    await client.query('COMMIT');
    
    logger.info(`Journal entry ${entry.entry_number} posted by user ${req.user.id}`);
    
    res.json({
      success: true,
      message: `Journal entry ${entry.entry_number} posted`
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error posting journal entry:', error);
    res.status(500).json({ success: false, message: 'Failed to post journal entry' });
  } finally {
    client.release();
  }
});

// ============================================================================
// POST /journal-entries/:id/void - Void a posted entry
// ============================================================================
router.post('/:id/void', requireRole('admin', 'manager'), async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const tenantId = req.user.tenant_id;
    const { id } = req.params;
    const { reason } = req.body;
    
    await client.query('BEGIN');
    
    // Get entry (tenant-scoped)
    const entryResult = await client.query(
      'SELECT * FROM journal_entries WHERE id = $1 AND tenant_id = $2 FOR UPDATE',
      [id, tenantId]
    );
    
    if (entryResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }
    
    const entry = entryResult.rows[0];
    
    if (entry.status !== 'posted') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Only posted entries can be voided' });
    }
    
    // Reverse account balances (tenant-scoped lines)
    const linesResult = await client.query(
      'SELECT * FROM journal_entry_lines WHERE journal_entry_id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    
    for (const line of linesResult.rows) {
      const netChange = parseFloat(line.debit) - parseFloat(line.credit);
      await client.query(`
        UPDATE accounts_chart 
        SET current_balance = current_balance - $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND tenant_id = $3
      `, [netChange, line.account_id, tenantId]);
    }
    
    // Update entry status
    await client.query(`
      UPDATE journal_entries 
      SET status = 'voided', voided_at = CURRENT_TIMESTAMP, voided_by = $1, void_reason = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND tenant_id = $4
    `, [req.user.id, reason || null, id, tenantId]);
    
    await client.query('COMMIT');
    
    logger.info(`Journal entry ${entry.entry_number} voided by user ${req.user.id}: ${reason}`);
    
    res.json({
      success: true,
      message: `Journal entry ${entry.entry_number} voided`
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error voiding journal entry:', error);
    res.status(500).json({ success: false, message: 'Failed to void journal entry' });
  } finally {
    client.release();
  }
});

// ============================================================================
// DELETE /journal-entries/:id - Delete a draft entry
// ============================================================================
router.delete('/:id', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { id } = req.params;
    
    const result = await db.query(`
      DELETE FROM journal_entries 
      WHERE id = $1 AND tenant_id = $2 AND status = 'draft'
      RETURNING entry_number
    `, [id, tenantId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Draft entry not found' });
    }
    
    logger.info(`Journal entry ${result.rows[0].entry_number} deleted by user ${req.user.id}`);
    
    res.json({
      success: true,
      message: `Journal entry ${result.rows[0].entry_number} deleted`
    });
  } catch (error) {
    logger.error('Error deleting journal entry:', error);
    res.status(500).json({ success: false, message: 'Failed to delete journal entry' });
  }
});

module.exports = router;
