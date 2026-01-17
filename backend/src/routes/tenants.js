/**
 * Tenants Routes
 * Public tenant information (for branding, etc.)
 */

const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

// Helper to get pool
const pool = db.pool || db;

/**
 * GET /tenants/:id/branding - Get tenant branding (PUBLIC - no auth required)
 * Returns only non-sensitive branding info
 */
router.get('/:id/branding', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT id, slug, name, logo_url, primary_color
      FROM tenants
      WHERE id = $1 AND is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching tenant branding:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tenant branding' });
  }
});

/**
 * GET /tenants/current - Get current user's tenant
 * Returns tenant info for the logged-in user
 */
router.get('/current', authenticate, async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    
    if (!tenantId) {
      return res.status(404).json({ 
        success: false, 
        message: 'No tenant associated with this account' 
      });
    }

    const result = await pool.query(`
      SELECT id, slug, name, logo_url, primary_color, domain, 
             email, phone, address, city, state, zip_code,
             settings, is_active, created_at
      FROM tenants
      WHERE id = $1 AND is_active = true
    `, [tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching current tenant:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tenant' });
  }
});

/**
 * GET /tenants/slug/:slug - Get tenant by slug (public for login page branding)
 * Limited public info only
 */
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(`
      SELECT id, slug, name, logo_url, primary_color
      FROM tenants
      WHERE slug = $1 AND is_active = true
    `, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching tenant by slug:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tenant' });
  }
});

/**
 * GET /tenants/:id - Get tenant by ID
 * Only returns data if user belongs to this tenant or is super_admin
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user has access to this tenant
    const hasAccess = req.user.role === 'super_admin' || req.user.tenant_id === id;
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied to this tenant' 
      });
    }

    const result = await pool.query(`
      SELECT id, slug, name, logo_url, primary_color, domain, 
             email, phone, address, city, state, zip_code,
             settings, is_active, created_at
      FROM tenants
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching tenant:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tenant' });
  }
});

module.exports = router;
