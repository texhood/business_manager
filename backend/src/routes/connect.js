/**
 * Stripe Connect Routes
 * Handles connected account onboarding, management, and webhooks
 */

const express = require('express');
const Stripe = require('stripe');
const db = require('../../config/database');
const { authenticate, requireAdmin, requireSuperAdmin } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the platform application fee percentage from settings
 */
async function getPlatformFeePercent() {
  try {
    const result = await db.query(
      "SELECT value FROM platform_settings WHERE key = 'stripe_connect_fee_percent'"
    );
    return result.rows.length > 0 ? parseFloat(result.rows[0].value) : 2.5;
  } catch (error) {
    logger.warn('Could not fetch platform fee setting, using default 2.5%');
    return 2.5;
  }
}

/**
 * Calculate application fee from amount
 */
async function calculateApplicationFee(amount) {
  const feePercent = await getPlatformFeePercent();
  return Math.round(amount * (feePercent / 100));
}

/**
 * Update tenant's Stripe status from account object
 */
async function updateTenantStripeStatus(tenantId, account) {
  let status = 'pending';
  
  if (account.charges_enabled && account.payouts_enabled) {
    status = 'active';
  } else if (account.details_submitted) {
    status = account.requirements?.disabled_reason ? 'restricted' : 'onboarding';
  }

  await db.query(`
    UPDATE tenants SET
      stripe_account_status = $1,
      stripe_onboarding_complete = $2,
      stripe_payouts_enabled = $3,
      stripe_charges_enabled = $4,
      stripe_details_submitted = $5,
      stripe_requirements = $6,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
  `, [
    status,
    account.details_submitted || false,
    account.payouts_enabled || false,
    account.charges_enabled || false,
    account.details_submitted || false,
    JSON.stringify(account.requirements || {}),
    tenantId
  ]);

  return status;
}

// ============================================================================
// ACCOUNT CREATION & ONBOARDING
// ============================================================================

/**
 * POST /connect/accounts
 * Create a connected account for a tenant
 */
router.post('/accounts', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  
  // Get tenant details
  const tenantResult = await db.query(
    'SELECT * FROM tenants WHERE id = $1',
    [tenantId]
  );
  
  if (tenantResult.rows.length === 0) {
    throw new ApiError(404, 'Tenant not found');
  }
  
  const tenant = tenantResult.rows[0];
  
  // Check if tenant already has a connected account
  if (tenant.stripe_account_id) {
    throw new ApiError(400, 'Tenant already has a Stripe Connect account');
  }

  // Determine MCC based on business type (could be stored in tenant settings)
  const businessType = tenant.settings?.business_type || 'farm';
  const mccCodes = {
    farm: '5812',       // Restaurants/eating places (covers farm stores, food service)
    restaurant: '5812', // Restaurants
    retail: '5411',     // Grocery stores
    default: '5812'
  };
  const mcc = mccCodes[businessType] || mccCodes.default;

  // Create Express connected account
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    email: tenant.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'company',
    business_profile: {
      name: tenant.name,
      mcc: mcc,
      url: tenant.domain ? `https://${tenant.domain}` : undefined,
      support_email: tenant.email,
      support_phone: tenant.phone,
    },
    company: {
      name: tenant.name,
      address: tenant.address ? {
        line1: tenant.address,
        city: tenant.city,
        state: tenant.state,
        postal_code: tenant.zip_code,
        country: 'US',
      } : undefined,
      phone: tenant.phone,
    },
    metadata: {
      tenant_id: tenantId,
      tenant_slug: tenant.slug,
      platform: 'hood_family_farms_business_manager'
    }
  });

  // Update tenant with new account ID
  await db.query(`
    UPDATE tenants SET
      stripe_account_id = $1,
      stripe_account_status = 'pending',
      stripe_account_type = 'express',
      stripe_connected_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `, [account.id, tenantId]);

  logger.info('Stripe Connect account created', { 
    tenantId, 
    accountId: account.id,
    tenantName: tenant.name
  });

  res.status(201).json({
    status: 'success',
    data: {
      account_id: account.id,
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    }
  });
}));

/**
 * POST /connect/accounts/onboarding-link
 * Generate an Account Link for Stripe onboarding
 */
router.post('/accounts/onboarding-link', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { return_url, refresh_url } = req.body;
  
  // Get tenant's Stripe account ID
  const tenantResult = await db.query(
    'SELECT stripe_account_id, slug FROM tenants WHERE id = $1',
    [tenantId]
  );
  
  if (tenantResult.rows.length === 0) {
    throw new ApiError(404, 'Tenant not found');
  }
  
  const tenant = tenantResult.rows[0];
  
  if (!tenant.stripe_account_id) {
    throw new ApiError(400, 'Tenant does not have a Stripe Connect account. Create one first.');
  }

  // Build URLs - use provided URLs or construct from tenant slug
  const baseUrl = process.env.FRONTEND_URL || `https://${tenant.slug}.office.hoodfamilyfarms.com`;
  const accountLink = await stripe.accountLinks.create({
    account: tenant.stripe_account_id,
    refresh_url: refresh_url || `${baseUrl}/settings/stripe?refresh=true`,
    return_url: return_url || `${baseUrl}/settings/stripe?success=true`,
    type: 'account_onboarding',
  });

  logger.info('Stripe onboarding link generated', { 
    tenantId, 
    accountId: tenant.stripe_account_id 
  });

  res.json({
    status: 'success',
    data: {
      url: accountLink.url,
      expires_at: accountLink.expires_at
    }
  });
}));

/**
 * POST /connect/accounts/login-link
 * Generate a login link for the Express dashboard
 */
router.post('/accounts/login-link', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  
  const tenantResult = await db.query(
    'SELECT stripe_account_id FROM tenants WHERE id = $1',
    [tenantId]
  );
  
  if (tenantResult.rows.length === 0 || !tenantResult.rows[0].stripe_account_id) {
    throw new ApiError(400, 'No Stripe Connect account found');
  }

  const loginLink = await stripe.accounts.createLoginLink(
    tenantResult.rows[0].stripe_account_id
  );

  res.json({
    status: 'success',
    data: {
      url: loginLink.url
    }
  });
}));

/**
 * GET /connect/accounts/status
 * Get current tenant's Connect account status
 */
router.get('/accounts/status', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  
  const tenantResult = await db.query(`
    SELECT 
      stripe_account_id,
      stripe_account_status,
      stripe_onboarding_complete,
      stripe_payouts_enabled,
      stripe_charges_enabled,
      stripe_details_submitted,
      stripe_requirements,
      stripe_account_type,
      stripe_connected_at
    FROM tenants WHERE id = $1
  `, [tenantId]);
  
  if (tenantResult.rows.length === 0) {
    throw new ApiError(404, 'Tenant not found');
  }
  
  const tenant = tenantResult.rows[0];
  
  // If they have an account, fetch fresh status from Stripe
  if (tenant.stripe_account_id) {
    try {
      const account = await stripe.accounts.retrieve(tenant.stripe_account_id);
      
      // Update local status
      const newStatus = await updateTenantStripeStatus(tenantId, account);
      
      return res.json({
        status: 'success',
        data: {
          connected: true,
          account_id: account.id,
          account_status: newStatus,
          details_submitted: account.details_submitted,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          requirements: account.requirements,
          business_profile: account.business_profile,
        }
      });
    } catch (error) {
      logger.error('Failed to fetch Stripe account', { 
        error: error.message, 
        accountId: tenant.stripe_account_id 
      });
      // Return cached data if Stripe call fails
    }
  }
  
  res.json({
    status: 'success',
    data: {
      connected: !!tenant.stripe_account_id,
      account_id: tenant.stripe_account_id,
      account_status: tenant.stripe_account_status,
      details_submitted: tenant.stripe_details_submitted,
      charges_enabled: tenant.stripe_charges_enabled,
      payouts_enabled: tenant.stripe_payouts_enabled,
      requirements: tenant.stripe_requirements,
    }
  });
}));

// ============================================================================
// PLATFORM ADMIN ROUTES (Super Admin Only)
// ============================================================================

/**
 * GET /connect/platform/accounts
 * List all connected accounts (super admin only)
 */
router.get('/platform/accounts', authenticate, requireSuperAdmin, asyncHandler(async (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;
  
  let queryText = `
    SELECT 
      t.id as tenant_id,
      t.name as tenant_name,
      t.slug,
      t.stripe_account_id,
      t.stripe_account_status,
      t.stripe_charges_enabled,
      t.stripe_payouts_enabled,
      t.stripe_connected_at,
      t.email
    FROM tenants t
    WHERE t.stripe_account_id IS NOT NULL
  `;
  const params = [];
  let paramCount = 0;

  if (status) {
    paramCount++;
    params.push(status);
    queryText += ` AND t.stripe_account_status = $${paramCount}`;
  }

  paramCount++;
  params.push(parseInt(limit));
  queryText += ` ORDER BY t.stripe_connected_at DESC LIMIT $${paramCount}`;
  
  paramCount++;
  params.push(parseInt(offset));
  queryText += ` OFFSET $${paramCount}`;

  const result = await db.query(queryText, params);

  // Get total count
  const countResult = await db.query(`
    SELECT COUNT(*) FROM tenants WHERE stripe_account_id IS NOT NULL
    ${status ? 'AND stripe_account_status = $1' : ''}
  `, status ? [status] : []);

  res.json({
    status: 'success',
    data: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    }
  });
}));

/**
 * GET /connect/platform/fees
 * Get platform fee summary (super admin only)
 */
router.get('/platform/fees', authenticate, requireSuperAdmin, asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;
  
  let queryText = `
    SELECT 
      t.name as tenant_name,
      t.slug,
      COUNT(f.id) as transaction_count,
      SUM(f.amount) as total_fees,
      SUM(f.refunded_amount) as total_refunded
    FROM stripe_application_fees f
    JOIN tenants t ON f.tenant_id = t.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  if (start_date) {
    paramCount++;
    params.push(start_date);
    queryText += ` AND f.created_at >= $${paramCount}`;
  }

  if (end_date) {
    paramCount++;
    params.push(end_date);
    queryText += ` AND f.created_at <= $${paramCount}`;
  }

  queryText += ` GROUP BY t.id, t.name, t.slug ORDER BY total_fees DESC`;

  const result = await db.query(queryText, params);

  // Get totals
  const totalsResult = await db.query(`
    SELECT 
      SUM(amount) as total_fees,
      SUM(refunded_amount) as total_refunded,
      COUNT(*) as transaction_count
    FROM stripe_application_fees
    WHERE 1=1
    ${start_date ? 'AND created_at >= $1' : ''}
    ${end_date ? `AND created_at <= $${start_date ? '2' : '1'}` : ''}
  `, params.slice(0, paramCount));

  res.json({
    status: 'success',
    data: {
      by_tenant: result.rows,
      totals: totalsResult.rows[0]
    }
  });
}));

/**
 * GET /connect/platform/settings
 * Get platform settings (super admin only)
 */
router.get('/platform/settings', authenticate, requireSuperAdmin, asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT key, value, description FROM platform_settings 
    WHERE key LIKE 'stripe_connect_%'
    ORDER BY key
  `);

  const settings = {};
  result.rows.forEach(row => {
    settings[row.key] = {
      value: row.value,
      description: row.description
    };
  });

  res.json({
    status: 'success',
    data: settings
  });
}));

/**
 * PUT /connect/platform/settings
 * Update platform settings (super admin only)
 */
router.put('/platform/settings', authenticate, requireSuperAdmin, asyncHandler(async (req, res) => {
  const { key, value } = req.body;

  if (!key || value === undefined) {
    throw new ApiError(400, 'key and value are required');
  }

  // Only allow updating stripe_connect_ prefixed settings
  if (!key.startsWith('stripe_connect_')) {
    throw new ApiError(400, 'Invalid setting key');
  }

  await db.query(`
    INSERT INTO platform_settings (key, value, updated_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    ON CONFLICT (key) DO UPDATE SET
      value = EXCLUDED.value,
      updated_at = CURRENT_TIMESTAMP
  `, [key, JSON.stringify(value)]);

  logger.info('Platform setting updated', { key, value, updatedBy: req.user.id });

  res.json({
    status: 'success',
    message: 'Setting updated'
  });
}));

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

/**
 * POST /connect/webhook
 * Handle Stripe Connect webhook events
 * Note: This route should be excluded from JSON body parsing
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('STRIPE_CONNECT_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error('Connect webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  logger.info('Connect webhook received', { type: event.type, id: event.id });

  try {
    switch (event.type) {
      // Account events
      case 'account.updated': {
        const account = event.data.object;
        const tenantResult = await db.query(
          'SELECT id FROM tenants WHERE stripe_account_id = $1',
          [account.id]
        );
        
        if (tenantResult.rows.length > 0) {
          await updateTenantStripeStatus(tenantResult.rows[0].id, account);
          logger.info('Tenant Stripe status updated via webhook', { 
            accountId: account.id,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled
          });
        }
        break;
      }

      // Application fee events
      case 'application_fee.created': {
        const fee = event.data.object;
        const accountId = event.account;
        
        const tenantResult = await db.query(
          'SELECT id FROM tenants WHERE stripe_account_id = $1',
          [accountId]
        );
        
        if (tenantResult.rows.length > 0) {
          await db.query(`
            INSERT INTO stripe_application_fees 
            (tenant_id, stripe_fee_id, stripe_charge_id, amount, currency)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (stripe_fee_id) DO NOTHING
          `, [
            tenantResult.rows[0].id,
            fee.id,
            fee.charge,
            fee.amount,
            fee.currency
          ]);
          
          logger.info('Application fee recorded', { 
            feeId: fee.id, 
            amount: fee.amount,
            accountId 
          });
        }
        break;
      }

      case 'application_fee.refunded': {
        const fee = event.data.object;
        await db.query(`
          UPDATE stripe_application_fees 
          SET refunded_amount = $1 
          WHERE stripe_fee_id = $2
        `, [fee.amount_refunded, fee.id]);
        
        logger.info('Application fee refund recorded', { 
          feeId: fee.id, 
          refundedAmount: fee.amount_refunded 
        });
        break;
      }

      // Payment events from connected accounts
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const accountId = event.account;
        
        logger.info('Connected account payment succeeded', { 
          paymentIntentId: paymentIntent.id,
          accountId,
          amount: paymentIntent.amount
        });
        // Additional processing could be done here
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const accountId = event.account;
        
        logger.warn('Connected account payment failed', { 
          paymentIntentId: paymentIntent.id,
          accountId,
          error: paymentIntent.last_payment_error?.message
        });
        break;
      }

      // Payout events
      case 'payout.paid': {
        const payout = event.data.object;
        const accountId = event.account;
        
        logger.info('Connected account payout completed', { 
          payoutId: payout.id,
          accountId,
          amount: payout.amount
        });
        break;
      }

      case 'payout.failed': {
        const payout = event.data.object;
        const accountId = event.account;
        
        logger.error('Connected account payout failed', { 
          payoutId: payout.id,
          accountId,
          failureCode: payout.failure_code,
          failureMessage: payout.failure_message
        });
        break;
      }

      default:
        logger.info(`Unhandled Connect webhook event: ${event.type}`);
    }
  } catch (error) {
    logger.error('Error processing Connect webhook', { 
      error: error.message, 
      eventType: event.type 
    });
  }

  res.json({ received: true });
});

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

// Export helpers for use in other routes
module.exports = router;
module.exports.calculateApplicationFee = calculateApplicationFee;
module.exports.getPlatformFeePercent = getPlatformFeePercent;
module.exports.updateTenantStripeStatus = updateTenantStripeStatus;
