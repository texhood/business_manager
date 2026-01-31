/**
 * Tenant Settings Routes
 * Allows tenant admins to manage their own tenant configuration
 * 
 * Location: backend/src/routes/tenantSettings.js
 */

const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * GET /tenant-settings
 * Get current tenant's settings
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    
    if (!tenantId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No tenant associated with user' 
      });
    }

    const result = await db.query(`
      SELECT 
        id, name, slug, description, 
        email, phone, address, city, state, zip_code,
        domain, primary_color, secondary_color,
        tax_rate, currency, timezone,
        business_hours, plan, is_active,
        created_at, updated_at
      FROM tenants 
      WHERE id = $1
    `, [tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Tenant not found' 
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching tenant settings:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch tenant settings' 
    });
  }
});

/**
 * PUT /tenant-settings
 * Update current tenant's settings
 * Only allows updating non-critical fields (not slug, plan, is_active)
 */
router.put('/', authenticate, async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    
    if (!tenantId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No tenant associated with user' 
      });
    }

    // Only admin roles can update tenant settings
    if (!['admin', 'owner', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Insufficient permissions to update tenant settings' 
      });
    }

    const {
      name,
      description,
      email,
      phone,
      address,
      city,
      state,
      zip_code,
      primary_color,
      secondary_color,
      tax_rate,
      currency,
      timezone,
      business_hours
    } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      values.push(address);
    }
    if (city !== undefined) {
      updates.push(`city = $${paramIndex++}`);
      values.push(city);
    }
    if (state !== undefined) {
      updates.push(`state = $${paramIndex++}`);
      values.push(state);
    }
    if (zip_code !== undefined) {
      updates.push(`zip_code = $${paramIndex++}`);
      values.push(zip_code);
    }
    if (primary_color !== undefined) {
      updates.push(`primary_color = $${paramIndex++}`);
      values.push(primary_color);
    }
    if (secondary_color !== undefined) {
      updates.push(`secondary_color = $${paramIndex++}`);
      values.push(secondary_color);
    }
    if (tax_rate !== undefined) {
      updates.push(`tax_rate = $${paramIndex++}`);
      values.push(tax_rate);
    }
    if (currency !== undefined) {
      updates.push(`currency = $${paramIndex++}`);
      values.push(currency);
    }
    if (timezone !== undefined) {
      updates.push(`timezone = $${paramIndex++}`);
      values.push(timezone);
    }
    if (business_hours !== undefined) {
      updates.push(`business_hours = $${paramIndex++}`);
      values.push(JSON.stringify(business_hours));
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No valid fields to update' 
      });
    }

    // Add updated_at
    updates.push(`updated_at = NOW()`);
    
    // Add tenant ID as final parameter
    values.push(tenantId);

    const query = `
      UPDATE tenants 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, name, slug, description, 
        email, phone, address, city, state, zip_code,
        domain, primary_color, secondary_color,
        tax_rate, currency, timezone,
        business_hours, plan, is_active,
        created_at, updated_at
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Tenant not found' 
      });
    }

    logger.info(`Tenant settings updated: ${tenantId} by user ${req.user.id}`);

    res.json({
      status: 'success',
      data: result.rows[0],
      message: 'Settings updated successfully'
    });
  } catch (error) {
    logger.error('Error updating tenant settings:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to update tenant settings' 
    });
  }
});

/**
 * GET /tenant-settings/business-hours
 * Get just the business hours (useful for customer-facing sites)
 */
router.get('/business-hours', authenticate, async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    
    const result = await db.query(`
      SELECT business_hours FROM tenants WHERE id = $1
    `, [tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Tenant not found' 
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0].business_hours || getDefaultBusinessHours()
    });
  } catch (error) {
    logger.error('Error fetching business hours:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch business hours' 
    });
  }
});

/**
 * PUT /tenant-settings/business-hours
 * Update just the business hours
 */
router.put('/business-hours', authenticate, async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { business_hours } = req.body;

    if (!['admin', 'owner', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Insufficient permissions' 
      });
    }

    const result = await db.query(`
      UPDATE tenants 
      SET business_hours = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING business_hours
    `, [JSON.stringify(business_hours), tenantId]);

    res.json({
      status: 'success',
      data: result.rows[0].business_hours,
      message: 'Business hours updated successfully'
    });
  } catch (error) {
    logger.error('Error updating business hours:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to update business hours' 
    });
  }
});

// Helper function for default business hours
function getDefaultBusinessHours() {
  return {
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '10:00', close: '14:00', closed: false },
    sunday: { open: '', close: '', closed: true }
  };
}

module.exports = router;