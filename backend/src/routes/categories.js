/**
 * Categories Routes
 * Handles income/expense categories for transaction classification
 */

const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticate, requireRole } = require('../middleware/auth');
const logger = require('../utils/logger');

// All routes require authentication
router.use(authenticate);

// ============================================================================
// GET /categories - List all categories
// ============================================================================
router.get('/', async (req, res) => {
  try {
    const { type, include_inactive } = req.query;
    
    let query = `
      SELECT c.*, 
             p.name as parent_name,
             cl.name as default_class_name,
             (SELECT COUNT(*) FROM transactions t WHERE t.category_id = c.id) as transaction_count
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN classes cl ON c.default_class_id = cl.id
      WHERE 1=1
    `;
    const params = [];
    
    if (type) {
      params.push(type);
      query += ` AND c.type = $${params.length}`;
    }
    
    if (include_inactive !== 'true') {
      query += ` AND c.is_active = true`;
    }
    
    query += ` ORDER BY c.type, c.sort_order, c.name`;
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// ============================================================================
// GET /categories/grouped - Get categories grouped by type
// ============================================================================
router.get('/grouped', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, 
             p.name as parent_name,
             cl.name as default_class_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN classes cl ON c.default_class_id = cl.id
      WHERE c.is_active = true
      ORDER BY c.sort_order, c.name
    `);
    
    const grouped = {
      income: result.rows.filter(c => c.type === 'income'),
      expense: result.rows.filter(c => c.type === 'expense')
    };
    
    res.json({
      success: true,
      data: grouped
    });
  } catch (error) {
    logger.error('Error fetching grouped categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// ============================================================================
// GET /categories/:id - Get single category
// ============================================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT c.*, 
             p.name as parent_name,
             cl.name as default_class_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN classes cl ON c.default_class_id = cl.id
      WHERE c.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category' });
  }
});

// ============================================================================
// POST /categories - Create new category
// ============================================================================
router.post('/', requireRole ('admin', 'manager'), async (req, res) => {
  try {
    const { name, type, parent_id, code, description, default_class_id, sort_order } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ success: false, message: 'Name and type are required' });
    }
    
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be income or expense' });
    }
    
    const result = await db.query(`
      INSERT INTO categories (name, type, parent_id, code, description, default_class_id, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [name, type, parent_id || null, code || null, description || null, default_class_id || null, sort_order || 0]);
    
    logger.info(`Category created: ${name} (${type})`);
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});

// ============================================================================
// PUT /categories/:id - Update category
// ============================================================================
router.put('/:id', requireRole ('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, parent_id, code, description, default_class_id, sort_order, is_active } = req.body;
    
    // Prevent self-referencing parent
    if (parent_id && parseInt(parent_id) === parseInt(id)) {
      return res.status(400).json({ success: false, message: 'Category cannot be its own parent' });
    }
    
    const result = await db.query(`
      UPDATE categories 
      SET name = COALESCE($1, name),
          type = COALESCE($2, type),
          parent_id = $3,
          code = $4,
          description = $5,
          default_class_id = $6,
          sort_order = COALESCE($7, sort_order),
          is_active = COALESCE($8, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [name, type, parent_id || null, code || null, description || null, default_class_id || null, sort_order, is_active, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    logger.info(`Category updated: ${result.rows[0].name}`);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
});

// ============================================================================
// DELETE /categories/:id - Delete category (soft delete by deactivating)
// ============================================================================
router.delete('/:id', requireRole ('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has transactions
    const txnCheck = await db.query(
      'SELECT COUNT(*) as count FROM transactions WHERE category_id = $1',
      [id]
    );
    
    if (parseInt(txnCheck.rows[0].count) > 0) {
      // Soft delete - just deactivate
      await db.query(
        'UPDATE categories SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
      
      return res.json({
        success: true,
        message: 'Category deactivated (has associated transactions)'
      });
    }
    
    // Hard delete if no transactions
    await db.query('DELETE FROM categories WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Category deleted'
    });
  } catch (error) {
    logger.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
});

// ============================================================================
// GET /categories/report/summary - Category summary report
// ============================================================================
router.get('/report/summary', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date) {
      params.push(start_date);
      dateFilter += ` AND t.date >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      dateFilter += ` AND t.date <= $${params.length}`;
    }
    
    const result = await db.query(`
      SELECT 
        c.id,
        c.name,
        c.type,
        c.code,
        COUNT(t.id) as transaction_count,
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expense
      FROM categories c
      LEFT JOIN transactions t ON t.category_id = c.id ${dateFilter}
      WHERE c.is_active = true
      GROUP BY c.id, c.name, c.type, c.code
      ORDER BY c.type, c.sort_order, c.name
    `, params);
    
    const summary = {
      income: result.rows.filter(r => r.type === 'income'),
      expense: result.rows.filter(r => r.type === 'expense'),
      totals: {
        income: result.rows.filter(r => r.type === 'income').reduce((sum, r) => sum + parseFloat(r.total_income), 0),
        expense: result.rows.filter(r => r.type === 'expense').reduce((sum, r) => sum + parseFloat(r.total_expense), 0)
      }
    };
    summary.totals.net = summary.totals.income - summary.totals.expense;
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error('Error generating category summary:', error);
    res.status(500).json({ success: false, message: 'Failed to generate summary' });
  }
});

module.exports = router;
