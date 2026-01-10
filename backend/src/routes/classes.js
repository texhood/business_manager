/**
 * Classes Routes
 * CRUD operations for business segment/class tracking
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
    const { include_inactive } = req.query;
    
    let query = `SELECT * FROM classes`;
    
    if (include_inactive !== 'true') {
      query += ` WHERE is_active = true`;
    }
    
    query += ` ORDER BY name`;
    
    const result = await db.query(query);
    
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
    const { id } = req.params;
    
    const result = await db.query(`SELECT * FROM classes WHERE id = $1`, [id]);
    
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
    const { name, description, is_active } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Class name is required'
      });
    }
    
    const result = await db.query(`
      INSERT INTO classes (name, description, is_active)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [
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
      WHERE id = $4
      RETURNING *
    `, [
      name.trim(),
      description || null,
      is_active !== false,
      id
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
    const { id } = req.params;
    
    const result = await db.query(`DELETE FROM classes WHERE id = $1 RETURNING id`, [id]);
    
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
