/**
 * Payment Routes - Stripe Connect Edition
 * Handles online payment processing using Stripe Connect
 * Payments are created on connected accounts with application fees
 */

const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const db = require('../../config/database');
const logger = require('../utils/logger');

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get tenant by slug or ID, including Stripe account info
 */
async function getTenantByIdentifier(identifier) {
  const result = await db.query(`
    SELECT 
      id, slug, name, email,
      stripe_account_id, 
      stripe_charges_enabled,
      stripe_account_status
    FROM tenants 
    WHERE slug = $1 OR id::text = $1
  `, [identifier]);
  
  return result.rows[0] || null;
}

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

// ============================================================================
// PAYMENT INTENTS
// ============================================================================

/**
 * POST /api/v1/payments/create-intent
 * Create a payment intent for Stripe checkout
 * Supports both Connect (tenant-specific) and legacy (platform) modes
 */
router.post('/create-intent', async (req, res) => {
  try {
    const { 
      amount, 
      currency, 
      customer, 
      items, 
      deliveryMethod, 
      deliveryNotes,
      tenant_slug,  // New: specify which tenant this payment is for
      tenant_id     // Alternative: use tenant ID
    } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Determine tenant context
    let tenant = null;
    let stripeAccountId = null;
    let applicationFee = 0;

    if (tenant_slug || tenant_id) {
      tenant = await getTenantByIdentifier(tenant_slug || tenant_id);
      
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      if (tenant.stripe_account_id && tenant.stripe_charges_enabled) {
        stripeAccountId = tenant.stripe_account_id;
        applicationFee = await calculateApplicationFee(amount);
        logger.info('Using Connect mode for payment', { 
          tenantSlug: tenant.slug, 
          stripeAccountId,
          applicationFee 
        });
      } else {
        logger.warn('Tenant does not have active Connect account, using platform mode', { 
          tenantSlug: tenant?.slug,
          hasAccountId: !!tenant?.stripe_account_id,
          chargesEnabled: tenant?.stripe_charges_enabled
        });
      }
    }

    // Build payment intent data
    const paymentIntentData = {
      amount: amount,
      currency: currency || 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        items: JSON.stringify(items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          variant: item.variant
        }))),
        deliveryMethod,
        deliveryNotes: deliveryNotes || '',
        customerEmail: customer.email,
        customerName: customer.name,
        source: 'ecommerce_website',
        tenant_id: tenant?.id || 'platform',
        tenant_slug: tenant?.slug || 'platform'
      },
      receipt_email: customer.email,
      description: tenant 
        ? `${tenant.name} Order - ${items.length} item(s)`
        : `Hood Family Farms Order - ${items.length} item(s)`
    };

    // Add application fee for Connect payments
    if (stripeAccountId && applicationFee > 0) {
      paymentIntentData.application_fee_amount = applicationFee;
    }

    // Handle customer creation/lookup
    let stripeCustomer;
    try {
      const customerSearchParams = {
        email: customer.email,
        limit: 1
      };

      // Search on connected account if using Connect
      const existingCustomers = stripeAccountId
        ? await stripe.customers.list(customerSearchParams, { stripeAccount: stripeAccountId })
        : await stripe.customers.list(customerSearchParams);

      if (existingCustomers.data.length > 0) {
        stripeCustomer = existingCustomers.data[0];
        // Update customer info
        const updateParams = {
          name: customer.name,
          phone: customer.phone,
          address: customer.address
        };
        
        stripeCustomer = stripeAccountId
          ? await stripe.customers.update(stripeCustomer.id, updateParams, { stripeAccount: stripeAccountId })
          : await stripe.customers.update(stripeCustomer.id, updateParams);
      } else {
        // Create new customer
        const createParams = {
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          metadata: {
            source: tenant ? tenant.slug : 'hood_family_farms_website'
          }
        };

        stripeCustomer = stripeAccountId
          ? await stripe.customers.create(createParams, { stripeAccount: stripeAccountId })
          : await stripe.customers.create(createParams);
      }

      paymentIntentData.customer = stripeCustomer.id;
    } catch (customerError) {
      logger.error('Error managing Stripe customer:', customerError);
      // Continue without customer - payment will still work
    }

    // Create payment intent (on connected account if applicable)
    const paymentIntent = stripeAccountId
      ? await stripe.paymentIntents.create(paymentIntentData, { stripeAccount: stripeAccountId })
      : await stripe.paymentIntents.create(paymentIntentData);

    logger.info(`Payment intent created: ${paymentIntent.id}`, {
      amount: amount,
      customer: customer.email,
      tenant: tenant?.slug || 'platform',
      stripeAccountId: stripeAccountId || 'platform',
      applicationFee: applicationFee
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      applicationFee: applicationFee // Include for transparency
    });

  } catch (error) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      message: error.message 
    });
  }
});

/**
 * POST /api/v1/payments/webhook
 * Handle Stripe webhook events (platform-level)
 * Note: Connect-specific webhooks are handled in /connect/webhook
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      logger.info(`Payment succeeded: ${paymentIntent.id}`, {
        amount: paymentIntent.amount,
        tenant: paymentIntent.metadata?.tenant_slug || 'platform'
      });
      
      // TODO: Create order in database
      // TODO: Send confirmation email
      // TODO: Update inventory
      
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      logger.warn(`Payment failed: ${failedPayment.id}`, {
        error: failedPayment.last_payment_error?.message,
        tenant: failedPayment.metadata?.tenant_slug || 'platform'
      });
      break;

    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * GET /api/v1/payments/config
 * Get Stripe publishable key for frontend
 * Optionally returns tenant-specific configuration
 */
router.get('/config', async (req, res) => {
  const { tenant_slug } = req.query;

  const config = {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  };

  // If tenant specified, check their Connect status
  if (tenant_slug) {
    const tenant = await getTenantByIdentifier(tenant_slug);
    
    if (tenant) {
      config.tenant = {
        slug: tenant.slug,
        name: tenant.name,
        connectEnabled: !!(tenant.stripe_account_id && tenant.stripe_charges_enabled),
        stripeAccountId: tenant.stripe_charges_enabled ? tenant.stripe_account_id : null
      };
    }
  }

  res.json(config);
});

/**
 * GET /api/v1/payments/intent/:intentId
 * Retrieve payment intent status
 */
router.get('/intent/:intentId', async (req, res) => {
  try {
    const { intentId } = req.params;
    const { tenant_slug } = req.query;

    let stripeAccountId = null;

    // If tenant specified, retrieve from their connected account
    if (tenant_slug) {
      const tenant = await getTenantByIdentifier(tenant_slug);
      if (tenant?.stripe_account_id && tenant?.stripe_charges_enabled) {
        stripeAccountId = tenant.stripe_account_id;
      }
    }

    const paymentIntent = stripeAccountId
      ? await stripe.paymentIntents.retrieve(intentId, { stripeAccount: stripeAccountId })
      : await stripe.paymentIntents.retrieve(intentId);

    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata
    });

  } catch (error) {
    logger.error('Error retrieving payment intent:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve payment intent',
      message: error.message 
    });
  }
});

module.exports = router;
