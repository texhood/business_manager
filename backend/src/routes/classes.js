/**
 * Classes Routes
 * CRUD operations for business segment/class tracking
 * Tenant-aware: all operations scoped to req.user.tenant_id
 */

const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

// ============================================================================
// GET ALL CLASSES
// ============================================================================

router.get('/', authenticate, async (req, res, next) => {
  try {
    const tenantId = req.user.tenant_id;
    const { include_inactive } = req.query;
    
    let query = `SELECT * FROM classes WHERE tenant_id = $1`;
    const params = [tenantId];
    
    if (include_inactive !== 'true') {
      query += ` AND is_active = true`;
    }
    
    query += ` ORDER BY name`;
    
    const result = await db.query(query, params);
    
    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET SINGLE CLASS
// ============================================================================

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const tenantId = req.user.tenant_id;
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT * FROM classes WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Class not found'
      });
    }
    
    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// CREATE CLASS
// ============================================================================

router.post('/', authenticate, requireRole('admin', 'staff'), async (req, res, next) => {
  try {
    const tenantId = req.user.tenant_id;
    const { name, description, is_active } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Class name is required'
      });
    }
    
    const result = await db.query(`
      INSERT INTO classes (tenant_id, name, description, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      tenantId,
      name.trim(),
      description || null,
      is_active !== false
    ]);
    
    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        status: 'error',
        message: 'A class with this name already exists'
      });
    }
    next(error);
  }
});

// ============================================================================
// UPDATE CLASS
// ============================================================================

router.put('/:id', authenticate, requireRole('admin', 'staff'), async (req, res, next) => {
  try {
    const tenantId = req.user.tenant_id;
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Class name is required'
      });
    }
    
    const result = await db.query(`
      UPDATE classes
      SET name = $1, description = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND tenant_id = $5
      RETURNING *
    `, [
      name.trim(),
      description || null,
      is_active !== false,
      id,
      tenantId
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Class not found'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        status: 'error',
        message: 'A class with this name already exists'
      });
    }
    next(error);
  }
});

// ============================================================================
// DELETE CLASS
// ============================================================================

router.delete('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const tenantId = req.user.tenant_id;
    const { id } = req.params;
    
    const result = await db.query(
      `DELETE FROM classes WHERE id = $1 AND tenant_id = $2 RETURNING id`,
      [id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Class not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Class deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
