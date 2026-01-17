/**
 * Vendors Routes
 * CRUD operations for vendor/supplier management
 */

const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticate, requireRole } = require('../middleware/auth');
const logger = require('../utils/logger');

// All routes require authentication
router.use(authenticate);

// ============================================================================
// GET /vendors - List all vendors
// ============================================================================
router.get('/', async (req, res) => {
  try {
    const { include_inactive, search } = req.query;
    const tenantId = req.user?.tenant_id || '00000000-0000-0000-0000-000000000001';

    let query = `
      SELECT v.*,
             ac.name as default_expense_account_name,
             ac.account_code as default_expense_account_code,
             cl.name as default_class_name,
             (SELECT COUNT(*) FROM transactions t WHERE t.vendor_id = v.id) as transaction_count
      FROM vendors v
      LEFT JOIN accounts_chart ac ON v.default_expense_account_id = ac.id
      LEFT JOIN classes cl ON v.default_class_id = cl.id
      WHERE v.tenant_id = $1
    `;
    const params = [tenantId];

    if (include_inactive !== 'true') {
      query += ' AND v.is_active = true';
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (v.name ILIKE $${params.length} OR v.display_name ILIKE $${params.length} OR v.contact_name ILIKE $${params.length})`;
    }

    query += ' ORDER BY v.name ASC';

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching vendors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vendors' });
  }
});

// ============================================================================
// GET /vendors/:id - Get single vendor
// ============================================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenant_id || '00000000-0000-0000-0000-000000000001';

    const result = await db.query(`
      SELECT v.*,
             ac.name as default_expense_account_name,
             ac.account_code as default_expense_account_code,
             cl.name as default_class_name
      FROM vendors v
      LEFT JOIN accounts_chart ac ON v.default_expense_account_id = ac.id
      LEFT JOIN classes cl ON v.default_class_id = cl.id
      WHERE v.id = $1 AND v.tenant_id = $2
    `, [id, tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching vendor:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vendor' });
  }
});

// ============================================================================
// POST /vendors - Create new vendor
// ============================================================================
router.post('/', requireRole('admin', 'manager', 'staff'), async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || '00000000-0000-0000-0000-000000000001';
    const {
      name,
      display_name,
      contact_name,
      email,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      website,
      tax_id,
      payment_terms,
      notes,
      default_expense_account_id,
      default_class_id,
      is_active
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Vendor name is required' });
    }

    const result = await db.query(`
      INSERT INTO vendors (
        tenant_id, name, display_name, contact_name, email, phone,
        address_line1, address_line2, city, state, postal_code, country,
        website, tax_id, payment_terms, notes,
        default_expense_account_id, default_class_id, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, COALESCE($19, true))
      RETURNING *
    `, [
      tenantId, name, display_name || name, contact_name, email, phone,
      address_line1, address_line2, city, state, postal_code, country || 'USA',
      website, tax_id, payment_terms, notes,
      default_expense_account_id || null, default_class_id || null, is_active
    ]);

    logger.info(`Vendor created: ${name}`);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ success: false, message: 'A vendor with this name already exists' });
    }
    logger.error('Error creating vendor:', error);
    res.status(500).json({ success: false, message: 'Failed to create vendor' });
  }
});

// ============================================================================
// PUT /vendors/:id - Update vendor
// ============================================================================
router.put('/:id', requireRole('admin', 'manager', 'staff'), async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenant_id || '00000000-0000-0000-0000-000000000001';
    const {
      name,
      display_name,
      contact_name,
      email,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      website,
      tax_id,
      payment_terms,
      notes,
      default_expense_account_id,
      default_class_id,
      is_active
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Vendor name is required' });
    }

    const result = await db.query(`
      UPDATE vendors SET
        name = $1,
        display_name = $2,
        contact_name = $3,
        email = $4,
        phone = $5,
        address_line1 = $6,
        address_line2 = $7,
        city = $8,
        state = $9,
        postal_code = $10,
        country = $11,
        website = $12,
        tax_id = $13,
        payment_terms = $14,
        notes = $15,
        default_expense_account_id = $16,
        default_class_id = $17,
        is_active = $18,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $19 AND tenant_id = $20
      RETURNING *
    `, [
      name, display_name || name, contact_name, email, phone,
      address_line1, address_line2, city, state, postal_code, country,
      website, tax_id, payment_terms, notes,
      default_expense_account_id || null, default_class_id || null, is_active,
      id, tenantId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    logger.info(`Vendor updated: ${name}`);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'A vendor with this name already exists' });
    }
    logger.error('Error updating vendor:', error);
    res.status(500).json({ success: false, message: 'Failed to update vendor' });
  }
});

// ============================================================================
// DELETE /vendors/:id - Delete vendor (soft delete by setting inactive)
// ============================================================================
router.delete('/:id', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { hard } = req.query;
    const tenantId = req.user?.tenant_id || '00000000-0000-0000-0000-000000000001';

    // Check if vendor has transactions
    const txnCheck = await db.query(
      'SELECT COUNT(*) as count FROM transactions WHERE vendor_id = $1',
      [id]
    );

    if (parseInt(txnCheck.rows[0].count) > 0) {
      if (hard === 'true') {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot delete vendor with existing transactions. Remove transactions first or deactivate instead.' 
        });
      }
      // Soft delete
      await db.query(
        'UPDATE vendors SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND tenant_id = $2',
        [id, tenantId]
      );
      return res.json({ success: true, message: 'Vendor deactivated (has existing transactions)' });
    }

    if (hard === 'true') {
      // Hard delete
      const result = await db.query(
        'DELETE FROM vendors WHERE id = $1 AND tenant_id = $2 RETURNING id, name',
        [id, tenantId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Vendor not found' });
      }

      logger.info(`Vendor deleted: ${result.rows[0].name}`);
      return res.json({ success: true, message: 'Vendor deleted' });
    }

    // Soft delete
    const result = await db.query(
      'UPDATE vendors SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND tenant_id = $2 RETURNING *',
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    res.json({ success: true, message: 'Vendor deactivated', data: result.rows[0] });
  } catch (error) {
    logger.error('Error deleting vendor:', error);
    res.status(500).json({ success: false, message: 'Failed to delete vendor' });
  }
});

// ============================================================================
// GET /vendors/:id/transactions - Get transactions for a vendor
// ============================================================================
router.get('/:id/transactions', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await db.query(`
      SELECT t.*,
             ac.name as accepted_gl_account_name,
             cl.name as class_name
      FROM transactions t
      LEFT JOIN accounts_chart ac ON t.accepted_gl_account_id = ac.id
      LEFT JOIN classes cl ON t.class_id = cl.id
      WHERE t.vendor_id = $1
      ORDER BY t.date DESC
      LIMIT $2 OFFSET $3
    `, [id, limit, offset]);

    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM transactions WHERE vendor_id = $1',
      [id]
    );

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
    logger.error('Error fetching vendor transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vendor transactions' });
  }
});

// ============================================================================
// POST /vendors/quick-create - Quick create vendor (minimal fields)
// ============================================================================
router.post('/quick-create', requireRole('admin', 'manager', 'staff'), async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || '00000000-0000-0000-0000-000000000001';
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Vendor name is required' });
    }

    // Check if vendor already exists
    const existing = await db.query(
      'SELECT id, name FROM vendors WHERE tenant_id = $1 AND LOWER(name) = LOWER($2)',
      [tenantId, name]
    );

    if (existing.rows.length > 0) {
      return res.json({
        success: true,
        data: existing.rows[0],
        message: 'Existing vendor found'
      });
    }

    // Create new vendor
    const result = await db.query(`
      INSERT INTO vendors (tenant_id, name, display_name, is_active)
      VALUES ($1, $2, $2, true)
      RETURNING *
    `, [tenantId, name]);

    logger.info(`Vendor quick-created: ${name}`);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error quick-creating vendor:', error);
    res.status(500).json({ success: false, message: 'Failed to create vendor' });
  }
});

module.exports = router;
