/**
 * Admin Routes
 * System administration and tenant management
 * These routes require super_admin role
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../../config/database');
const { authenticate, requireRole } = require('../middleware/auth');
const logger = require('../utils/logger');

// Helper to get pool
const pool = db.pool || db;

// All routes require super_admin role
router.use(authenticate);
router.use(requireRole('super_admin'));

// ============================================================================
// DASHBOARD / SYSTEM
// ============================================================================

/**
 * GET /admin/system/dashboard - Get system dashboard stats
 */
router.get('/system/dashboard', async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      // Get tenant counts
      const tenantsResult = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE is_active = true) as active
        FROM tenants
      `);

      // Get user count
      const usersResult = await client.query('SELECT COUNT(*) as total FROM accounts');

      // Get transaction count (last 30 days)
      const txnResult = await client.query(`
        SELECT COUNT(*) as total 
        FROM transactions 
        WHERE created_at >= NOW() - INTERVAL '30 days'
      `);

      res.json({
        success: true,
        data: {
          totalTenants: parseInt(tenantsResult.rows[0]?.total || 1),
          activeTenants: parseInt(tenantsResult.rows[0]?.active || 1),
          totalUsers: parseInt(usersResult.rows[0]?.total || 0),
          totalTransactions: parseInt(txnResult.rows[0]?.total || 0),
          systemHealth: 'healthy'
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
});

/**
 * GET /admin/system/settings - Get system settings
 */
router.get('/system/settings', async (req, res) => {
  try {
    // For now, return default settings
    // Later this can be stored in a system_settings table
    res.json({
      success: true,
      data: {
        system_name: 'Business Manager',
        default_timezone: 'America/Chicago',
        default_tax_rate: 8.25,
        maintenance_mode: false,
        allow_self_registration: false,
        require_email_verification: true,
        session_timeout_minutes: 480,
        max_file_upload_mb: 10
      }
    });
  } catch (error) {
    logger.error('Error fetching system settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

/**
 * PUT /admin/system/settings - Update system settings
 */
router.put('/system/settings', async (req, res) => {
  try {
    // For now, just acknowledge the update
    // Later this can persist to a system_settings table
    logger.info('System settings updated:', req.body);
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    logger.error('Error updating system settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

/**
 * GET /admin/system/health - System health check
 */
router.get('/system/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message
      }
    });
  }
});

// ============================================================================
// TENANTS
// ============================================================================

/**
 * GET /admin/tenants - List all tenants
 */
router.get('/tenants', async (req, res) => {
  try {
    const { limit = 50, offset = 0, search, status } = req.query;

    let query = `
      SELECT t.*,
             (SELECT COUNT(*) FROM accounts a WHERE a.tenant_id = t.id) as user_count
      FROM tenants t
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (t.name ILIKE $${params.length} OR t.slug ILIKE $${params.length})`;
    }

    if (status === 'active') {
      query += ' AND t.is_active = true';
    } else if (status === 'inactive') {
      query += ' AND t.is_active = false';
    }

    query += ' ORDER BY t.created_at DESC';
    
    params.push(limit, offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching tenants:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tenants' });
  }
});

/**
 * GET /admin/tenants/:id - Get tenant details
 */
router.get('/tenants/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT t.*,
             (SELECT COUNT(*) FROM accounts a WHERE a.tenant_id = t.id) as user_count
      FROM tenants t
      WHERE t.id = $1
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

/**
 * POST /admin/tenants - Create new tenant
 */
router.post('/tenants', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { name, slug, description, settings } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Tenant name is required' });
    }

    const tenantSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    await client.query('BEGIN');

    const result = await client.query(`
      INSERT INTO tenants (name, slug, description, settings, is_active, onboarding_complete)
      VALUES ($1, $2, $3, $4, true, false)
      RETURNING *
    `, [name, tenantSlug, description || null, settings ? JSON.stringify(settings) : null]);

    await client.query('COMMIT');

    logger.info(`Tenant created: ${name} (${result.rows[0].id})`);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'A tenant with this name or slug already exists' });
    }
    
    logger.error('Error creating tenant:', error);
    res.status(500).json({ success: false, message: 'Failed to create tenant' });
  } finally {
    client.release();
  }
});

/**
 * PUT /admin/tenants/:id - Update tenant
 */
router.put('/tenants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, settings, is_active } = req.body;

    const result = await pool.query(`
      UPDATE tenants
      SET name = COALESCE($1, name),
          slug = COALESCE($2, slug),
          description = COALESCE($3, description),
          settings = COALESCE($4, settings),
          is_active = COALESCE($5, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [name, slug, description, settings ? JSON.stringify(settings) : null, is_active, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    logger.info(`Tenant updated: ${id}`);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating tenant:', error);
    res.status(500).json({ success: false, message: 'Failed to update tenant' });
  }
});

/**
 * DELETE /admin/tenants/:id - Delete tenant
 */
router.delete('/tenants/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by setting inactive
    const result = await pool.query(`
      UPDATE tenants
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    logger.info(`Tenant deactivated: ${id}`);

    res.json({
      success: true,
      message: 'Tenant deactivated'
    });
  } catch (error) {
    logger.error('Error deleting tenant:', error);
    res.status(500).json({ success: false, message: 'Failed to delete tenant' });
  }
});

/**
 * GET /admin/tenants/:id/stats - Get tenant statistics
 */
router.get('/tenants/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const [users, transactions, chartAccounts] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM accounts WHERE tenant_id = $1', [id]),
      pool.query('SELECT COUNT(*) as count FROM transactions WHERE tenant_id = $1', [id]),
      pool.query('SELECT COUNT(*) as count FROM accounts_chart WHERE tenant_id = $1', [id])
    ]);

    res.json({
      success: true,
      data: {
        userCount: parseInt(users.rows[0].count),
        transactionCount: parseInt(transactions.rows[0].count),
        accountCount: parseInt(chartAccounts.rows[0].count)
      }
    });
  } catch (error) {
    logger.error('Error fetching tenant stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tenant stats' });
  }
});

/**
 * GET /admin/tenants/:id/users - Get tenant users
 */
router.get('/tenants/:id/users', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT id, email, name, role, is_active, created_at, last_login
      FROM accounts
      WHERE tenant_id = $1
      ORDER BY created_at DESC
    `, [id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching tenant users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tenant users' });
  }
});

/**
 * POST /admin/tenants/:id/users - Add user to tenant
 */
router.post('/tenants/:id/users', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(`
      INSERT INTO accounts (tenant_id, email, password_hash, name, role, is_active)
      VALUES ($1, $2, $3, $4, $5::account_role, true)
      RETURNING id, email, name, role, is_active, created_at
    `, [id, email, passwordHash, name || null, role || 'staff']);

    logger.info(`User created for tenant ${id}: ${email}`);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }
    logger.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

// ============================================================================
// ONBOARDING
// ============================================================================

/**
 * POST /admin/onboarding/tenant - Create tenant (onboarding step 1)
 */
router.post('/onboarding/tenant', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { name, slug, description, primary_color } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Tenant name is required' });
    }

    const tenantSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    await client.query('BEGIN');

    const result = await client.query(`
      INSERT INTO tenants (name, slug, description, primary_color, is_active, onboarding_complete)
      VALUES ($1, $2, $3, $4, true, false)
      RETURNING *
    `, [name, tenantSlug, description || null, primary_color || '#2d5016']);

    await client.query('COMMIT');

    logger.info(`Onboarding: Tenant created: ${name}`);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Onboarding error (tenant):', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

/**
 * POST /admin/onboarding/:tenantId/admin-user - Create admin user (step 2)
 */
router.post('/onboarding/:tenantId/admin-user', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { email, password, name, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(`
      INSERT INTO accounts (tenant_id, email, password_hash, name, phone, role, is_active)
      VALUES ($1, $2, $3, $4, $5, 'admin'::account_role, true)
      RETURNING id, email, name, role
    `, [tenantId, email, passwordHash, name || null, phone || null]);

    logger.info(`Onboarding: Admin user created for tenant ${tenantId}`);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Onboarding error (admin user):', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /admin/onboarding/:tenantId/business-settings - Configure business (step 3)
 */
router.post('/onboarding/:tenantId/business-settings', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const settings = req.body;

    await pool.query(`
      UPDATE tenants
      SET settings = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [JSON.stringify(settings), tenantId]);

    logger.info(`Onboarding: Business settings configured for tenant ${tenantId}`);

    res.json({ success: true, message: 'Business settings saved' });
  } catch (error) {
    logger.error('Onboarding error (business settings):', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /admin/onboarding/:tenantId/chart-of-accounts - Initialize COA (step 4)
 */
router.post('/onboarding/:tenantId/chart-of-accounts', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { tenantId } = req.params;
    const { template } = req.body;

    await client.query('BEGIN');

    // Get template accounts based on selected template
    const templateAccounts = getChartOfAccountsTemplate(template);

    // Insert accounts
    for (const account of templateAccounts) {
      await client.query(`
        INSERT INTO accounts_chart (tenant_id, account_code, name, account_type, account_subtype, description, is_active, normal_balance)
        VALUES ($1, $2, $3, $4::account_type, $5::account_subtype, $6, true, $7)
        ON CONFLICT (tenant_id, account_code) DO NOTHING
      `, [tenantId, account.code, account.name, account.type, account.subtype, account.description, account.normal_balance]);
    }

    await client.query('COMMIT');

    logger.info(`Onboarding: Chart of accounts initialized for tenant ${tenantId} (template: ${template})`);

    res.json({ 
      success: true, 
      message: 'Chart of accounts initialized',
      data: { accountsCreated: templateAccounts.length }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Onboarding error (COA):', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

/**
 * POST /admin/onboarding/:tenantId/integrations - Configure integrations (step 5)
 */
router.post('/onboarding/:tenantId/integrations', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { stripe_enabled, stripe_account_id, plaid_enabled } = req.body;

    // Store integration settings in tenant settings
    const currentSettings = await pool.query('SELECT settings FROM tenants WHERE id = $1', [tenantId]);
    const settings = currentSettings.rows[0]?.settings || {};
    
    settings.integrations = {
      stripe: { enabled: stripe_enabled, account_id: stripe_account_id || null },
      plaid: { enabled: plaid_enabled }
    };

    await pool.query(`
      UPDATE tenants SET settings = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
    `, [JSON.stringify(settings), tenantId]);

    logger.info(`Onboarding: Integrations configured for tenant ${tenantId}`);

    res.json({ success: true, message: 'Integrations configured' });
  } catch (error) {
    logger.error('Onboarding error (integrations):', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /admin/onboarding/:tenantId/sample-data - Load sample data (step 6)
 */
router.post('/onboarding/:tenantId/sample-data', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const options = req.body;

    // For now, just log the request
    // Sample data loading can be implemented based on needs
    logger.info(`Onboarding: Sample data requested for tenant ${tenantId}:`, options);

    res.json({ success: true, message: 'Sample data loading configured' });
  } catch (error) {
    logger.error('Onboarding error (sample data):', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /admin/onboarding/:tenantId/complete - Complete onboarding
 */
router.post('/onboarding/:tenantId/complete', async (req, res) => {
  try {
    const { tenantId } = req.params;

    await pool.query(`
      UPDATE tenants 
      SET onboarding_complete = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [tenantId]);

    logger.info(`Onboarding completed for tenant ${tenantId}`);

    res.json({ success: true, message: 'Onboarding completed' });
  } catch (error) {
    logger.error('Onboarding error (complete):', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /admin/onboarding/coa-templates - Get available COA templates
 */
router.get('/onboarding/coa-templates', async (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'farm_standard', name: 'Farm Standard', description: 'Complete COA for farm operations' },
      { id: 'retail_standard', name: 'Retail Standard', description: 'Standard retail business accounts' },
      { id: 'restaurant', name: 'Restaurant', description: 'Food service focused accounts' },
      { id: 'minimal', name: 'Minimal', description: 'Basic accounts only' }
    ]
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getChartOfAccountsTemplate(template) {
  const baseAccounts = [
    // Assets
    { code: '1000', name: 'Cash', type: 'asset', subtype: 'cash', normal_balance: 'debit', description: 'Cash on hand' },
    { code: '1010', name: 'Checking Account', type: 'asset', subtype: 'bank', normal_balance: 'debit', description: 'Primary checking' },
    { code: '1020', name: 'Savings Account', type: 'asset', subtype: 'bank', normal_balance: 'debit', description: 'Savings account' },
    { code: '1100', name: 'Accounts Receivable', type: 'asset', subtype: 'accounts_receivable', normal_balance: 'debit', description: 'Customer receivables' },
    { code: '1200', name: 'Inventory', type: 'asset', subtype: 'inventory', normal_balance: 'debit', description: 'Product inventory' },
    
    // Liabilities
    { code: '2000', name: 'Accounts Payable', type: 'liability', subtype: 'accounts_payable', normal_balance: 'credit', description: 'Vendor payables' },
    { code: '2100', name: 'Credit Card', type: 'liability', subtype: 'credit_card', normal_balance: 'credit', description: 'Credit card balance' },
    { code: '2200', name: 'Sales Tax Payable', type: 'liability', subtype: 'current_liability', normal_balance: 'credit', description: 'Sales tax collected' },
    
    // Equity
    { code: '3000', name: 'Owner\'s Equity', type: 'equity', subtype: 'owners_equity', normal_balance: 'credit', description: 'Owner investment' },
    { code: '3100', name: 'Retained Earnings', type: 'equity', subtype: 'retained_earnings', normal_balance: 'credit', description: 'Accumulated earnings' },
    
    // Revenue
    { code: '4000', name: 'Sales Revenue', type: 'revenue', subtype: 'sales', normal_balance: 'credit', description: 'Product sales' },
    { code: '4100', name: 'Service Revenue', type: 'revenue', subtype: 'other_income', normal_balance: 'credit', description: 'Service income' },
    
    // Expenses
    { code: '5000', name: 'Cost of Goods Sold', type: 'expense', subtype: 'cost_of_goods', normal_balance: 'debit', description: 'Direct product costs' },
    { code: '6000', name: 'Payroll Expense', type: 'expense', subtype: 'operating_expense', normal_balance: 'debit', description: 'Employee wages' },
    { code: '6100', name: 'Rent Expense', type: 'expense', subtype: 'operating_expense', normal_balance: 'debit', description: 'Facility rent' },
    { code: '6200', name: 'Utilities', type: 'expense', subtype: 'operating_expense', normal_balance: 'debit', description: 'Utility bills' },
    { code: '6300', name: 'Insurance', type: 'expense', subtype: 'operating_expense', normal_balance: 'debit', description: 'Insurance premiums' },
    { code: '6400', name: 'Office Supplies', type: 'expense', subtype: 'operating_expense', normal_balance: 'debit', description: 'Office supplies' },
  ];

  if (template === 'minimal') {
    return baseAccounts;
  }

  // Add farm-specific accounts
  if (template === 'farm_standard') {
    return [
      ...baseAccounts,
      { code: '1300', name: 'Livestock Inventory', type: 'asset', subtype: 'inventory', normal_balance: 'debit', description: 'Livestock value' },
      { code: '1400', name: 'Feed Inventory', type: 'asset', subtype: 'inventory', normal_balance: 'debit', description: 'Feed and supplies' },
      { code: '1500', name: 'Equipment', type: 'asset', subtype: 'fixed_asset', normal_balance: 'debit', description: 'Farm equipment' },
      { code: '4200', name: 'Livestock Sales', type: 'revenue', subtype: 'sales', normal_balance: 'credit', description: 'Livestock sales revenue' },
      { code: '4300', name: 'Meat Sales', type: 'revenue', subtype: 'sales', normal_balance: 'credit', description: 'Processed meat sales' },
      { code: '5100', name: 'Feed Expense', type: 'expense', subtype: 'cost_of_goods', normal_balance: 'debit', description: 'Animal feed costs' },
      { code: '5200', name: 'Veterinary Expense', type: 'expense', subtype: 'cost_of_goods', normal_balance: 'debit', description: 'Vet services' },
      { code: '5300', name: 'Processing Fees', type: 'expense', subtype: 'cost_of_goods', normal_balance: 'debit', description: 'Meat processing' },
      { code: '6500', name: 'Fuel & Equipment', type: 'expense', subtype: 'operating_expense', normal_balance: 'debit', description: 'Fuel and equipment maintenance' },
    ];
  }

  if (template === 'restaurant') {
    return [
      ...baseAccounts,
      { code: '1300', name: 'Food Inventory', type: 'asset', subtype: 'inventory', normal_balance: 'debit', description: 'Food supplies' },
      { code: '1400', name: 'Beverage Inventory', type: 'asset', subtype: 'inventory', normal_balance: 'debit', description: 'Beverage supplies' },
      { code: '4200', name: 'Food Sales', type: 'revenue', subtype: 'sales', normal_balance: 'credit', description: 'Food revenue' },
      { code: '4300', name: 'Beverage Sales', type: 'revenue', subtype: 'sales', normal_balance: 'credit', description: 'Beverage revenue' },
      { code: '5100', name: 'Food Cost', type: 'expense', subtype: 'cost_of_goods', normal_balance: 'debit', description: 'Food ingredients' },
      { code: '5200', name: 'Beverage Cost', type: 'expense', subtype: 'cost_of_goods', normal_balance: 'debit', description: 'Beverage supplies' },
      { code: '6500', name: 'Kitchen Supplies', type: 'expense', subtype: 'operating_expense', normal_balance: 'debit', description: 'Kitchen consumables' },
    ];
  }

  return baseAccounts;
}

module.exports = router;
