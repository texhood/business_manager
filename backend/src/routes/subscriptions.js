/**
 * Subscription Routes
 * Handles SaaS subscription billing for tenants
 */

const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const db = require('../../config/database');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');
const logger = require('../utils/logger');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * GET /subscriptions/plans
 * List available subscription plans (public)
 */
router.get('/plans', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, slug, name, description, price_monthly, price_yearly, 
             features, limits, is_featured, sort_order
      FROM subscription_plans
      WHERE is_active = true
      ORDER BY sort_order ASC
    `);

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching subscription plans:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch plans' });
  }
});

/**
 * GET /subscriptions/plans/:slug
 * Get a specific plan by slug
 */
router.get('/plans/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const result = await db.query(`
      SELECT id, slug, name, description, price_monthly, price_yearly, 
             features, limits, is_featured
      FROM subscription_plans
      WHERE slug = $1 AND is_active = true
    `, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Plan not found' });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching plan:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch plan' });
  }
});

// ============================================================================
// SUPER ADMIN ROUTES - Onboarding Flow
// ============================================================================

/**
 * POST /subscriptions/create-setup-intent
 * Create a Stripe SetupIntent for collecting payment method
 * Used during onboarding before subscription is created
 */
router.post('/create-setup-intent', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { tenant_id, customer_email, customer_name } = req.body;

    if (!tenant_id) {
      return res.status(400).json({ status: 'error', message: 'tenant_id is required' });
    }

    // Get tenant
    const tenantResult = await db.query(
      'SELECT id, name, email, stripe_customer_id FROM tenants WHERE id = $1',
      [tenant_id]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Tenant not found' });
    }

    const tenant = tenantResult.rows[0];
    let customerId = tenant.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: customer_email || tenant.email,
        name: customer_name || tenant.name,
        metadata: {
          tenant_id: tenant.id
        }
      });
      customerId = customer.id;

      // Save customer ID
      await db.query(
        'UPDATE tenants SET stripe_customer_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [customerId, tenant_id]
      );
    }

    // Create SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      metadata: {
        tenant_id: tenant_id
      }
    });

    res.json({
      status: 'success',
      data: {
        client_secret: setupIntent.client_secret,
        customer_id: customerId
      }
    });
  } catch (error) {
    logger.error('Error creating setup intent:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * POST /subscriptions/create
 * Create a subscription for a tenant
 * Used after payment method is collected via SetupIntent
 */
router.post('/create', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { 
      tenant_id, 
      plan_slug, 
      billing_interval = 'monthly',
      payment_method_id,
      trial_days = 14,
      billing_email
    } = req.body;

    if (!tenant_id || !plan_slug) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'tenant_id and plan_slug are required' 
      });
    }

    // Get tenant
    const tenantResult = await db.query(
      'SELECT * FROM tenants WHERE id = $1',
      [tenant_id]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Tenant not found' });
    }

    const tenant = tenantResult.rows[0];

    // Get plan
    const planResult = await db.query(
      'SELECT * FROM subscription_plans WHERE slug = $1 AND is_active = true',
      [plan_slug]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Plan not found' });
    }

    const plan = planResult.rows[0];

    // Ensure we have Stripe price IDs
    let priceId;
    if (billing_interval === 'yearly') {
      priceId = plan.stripe_price_yearly_id || await createStripePrice(plan, 'year');
    } else {
      priceId = plan.stripe_price_monthly_id || await createStripePrice(plan, 'month');
    }

    if (!priceId) {
      return res.status(500).json({ status: 'error', message: 'Failed to get Stripe price' });
    }

    // Get or create customer
    let customerId = tenant.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: billing_email || tenant.email,
        name: tenant.name,
        metadata: { tenant_id: tenant.id }
      });
      customerId = customer.id;
      
      await db.query(
        'UPDATE tenants SET stripe_customer_id = $1 WHERE id = $2',
        [customerId, tenant_id]
      );
    }

    // Attach payment method if provided
    if (payment_method_id) {
      await stripe.paymentMethods.attach(payment_method_id, {
        customer: customerId
      });

      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: payment_method_id
        }
      });
    }

    // Build subscription parameters
    const subscriptionParams = {
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        tenant_id: tenant_id,
        plan_slug: plan_slug
      },
      expand: ['latest_invoice.payment_intent']
    };

    // Add trial if requested
    if (trial_days > 0) {
      subscriptionParams.trial_period_days = trial_days;
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create(subscriptionParams);

    // Determine status
    let status = 'active';
    if (subscription.status === 'trialing') status = 'trialing';
    else if (subscription.status === 'incomplete') status = 'incomplete';
    else if (subscription.status === 'past_due') status = 'past_due';

    // Update tenant
    await db.query(`
      UPDATE tenants SET
        subscription_plan_id = $1,
        stripe_subscription_id = $2,
        subscription_status = $3,
        billing_interval = $4,
        billing_email = $5,
        subscription_started_at = CURRENT_TIMESTAMP,
        trial_ends_at = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `, [
      plan.id,
      subscription.id,
      status,
      billing_interval,
      billing_email || tenant.email,
      subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      tenant_id
    ]);

    logger.info(`Subscription created for tenant ${tenant_id}`, {
      subscription_id: subscription.id,
      plan: plan_slug,
      status
    });

    res.json({
      status: 'success',
      data: {
        subscription_id: subscription.id,
        subscription_status: status,
        plan: {
          name: plan.name,
          slug: plan.slug
        },
        billing_interval,
        trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        current_period_end: new Date(subscription.current_period_end * 1000),
        client_secret: subscription.latest_invoice?.payment_intent?.client_secret
      }
    });
  } catch (error) {
    logger.error('Error creating subscription:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * POST /subscriptions/create-trial
 * Create a subscription with trial (no payment method required initially)
 */
router.post('/create-trial', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { 
      tenant_id, 
      plan_slug, 
      billing_interval = 'monthly',
      trial_days = 14,
      billing_email
    } = req.body;

    if (!tenant_id || !plan_slug) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'tenant_id and plan_slug are required' 
      });
    }

    // Get tenant
    const tenantResult = await db.query(
      'SELECT * FROM tenants WHERE id = $1',
      [tenant_id]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Tenant not found' });
    }

    const tenant = tenantResult.rows[0];

    // Get plan
    const planResult = await db.query(
      'SELECT * FROM subscription_plans WHERE slug = $1 AND is_active = true',
      [plan_slug]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Plan not found' });
    }

    const plan = planResult.rows[0];

    // Ensure we have Stripe price IDs
    let priceId;
    if (billing_interval === 'yearly') {
      priceId = plan.stripe_price_yearly_id || await createStripePrice(plan, 'year');
    } else {
      priceId = plan.stripe_price_monthly_id || await createStripePrice(plan, 'month');
    }

    // Get or create customer
    let customerId = tenant.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: billing_email || tenant.email,
        name: tenant.name,
        metadata: { tenant_id: tenant.id }
      });
      customerId = customer.id;
      
      await db.query(
        'UPDATE tenants SET stripe_customer_id = $1 WHERE id = $2',
        [customerId, tenant_id]
      );
    }

    // Create subscription with trial (payment_behavior allows no payment method)
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: trial_days,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription'
      },
      metadata: {
        tenant_id: tenant_id,
        plan_slug: plan_slug
      }
    });

    // Update tenant
    await db.query(`
      UPDATE tenants SET
        subscription_plan_id = $1,
        stripe_subscription_id = $2,
        subscription_status = 'trialing',
        billing_interval = $3,
        billing_email = $4,
        subscription_started_at = CURRENT_TIMESTAMP,
        trial_ends_at = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `, [
      plan.id,
      subscription.id,
      billing_interval,
      billing_email || tenant.email,
      new Date(subscription.trial_end * 1000),
      tenant_id
    ]);

    logger.info(`Trial subscription created for tenant ${tenant_id}`, {
      subscription_id: subscription.id,
      plan: plan_slug,
      trial_ends: new Date(subscription.trial_end * 1000)
    });

    res.json({
      status: 'success',
      data: {
        subscription_id: subscription.id,
        subscription_status: 'trialing',
        plan: {
          name: plan.name,
          slug: plan.slug
        },
        billing_interval,
        trial_ends_at: new Date(subscription.trial_end * 1000)
      }
    });
  } catch (error) {
    logger.error('Error creating trial subscription:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * GET /subscriptions/tenant/:tenantId
 * Get subscription status for a tenant (super admin)
 */
router.get('/tenant/:tenantId', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { tenantId } = req.params;

    const result = await db.query(`
      SELECT 
        t.id,
        t.name,
        t.subscription_status,
        t.billing_interval,
        t.billing_email,
        t.subscription_started_at,
        t.subscription_ends_at,
        t.trial_ends_at,
        t.stripe_customer_id,
        t.stripe_subscription_id,
        sp.name as plan_name,
        sp.slug as plan_slug,
        sp.price_monthly,
        sp.price_yearly,
        sp.features,
        sp.limits
      FROM tenants t
      LEFT JOIN subscription_plans sp ON t.subscription_plan_id = sp.id
      WHERE t.id = $1
    `, [tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Tenant not found' });
    }

    const tenant = result.rows[0];
    let stripeData = null;

    // Fetch current data from Stripe if subscription exists
    if (tenant.stripe_subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(tenant.stripe_subscription_id);
        stripeData = {
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null
        };
      } catch (err) {
        logger.warn('Could not fetch Stripe subscription:', err.message);
      }
    }

    res.json({
      status: 'success',
      data: {
        ...tenant,
        stripe: stripeData
      }
    });
  } catch (error) {
    logger.error('Error fetching tenant subscription:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * POST /subscriptions/skip
 * Mark tenant as not having a subscription (for testing/internal tenants)
 */
router.post('/skip', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { tenant_id } = req.body;

    if (!tenant_id) {
      return res.status(400).json({ status: 'error', message: 'tenant_id is required' });
    }

    await db.query(`
      UPDATE tenants SET
        subscription_status = 'active',
        subscription_started_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [tenant_id]);

    logger.info(`Subscription skipped for tenant ${tenant_id}`);

    res.json({
      status: 'success',
      data: { message: 'Subscription requirement skipped' }
    });
  } catch (error) {
    logger.error('Error skipping subscription:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

/**
 * POST /subscriptions/webhook
 * Handle Stripe subscription webhooks
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.warn('STRIPE_SUBSCRIPTION_WEBHOOK_SECRET not configured');
    return res.status(400).json({ error: 'Webhook secret not configured' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  logger.info(`Subscription webhook received: ${event.type}`);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.trial_will_end':
        // TODO: Send trial ending notification
        logger.info('Trial will end soon for subscription:', event.data.object.id);
        break;
    }
  } catch (error) {
    logger.error('Error processing webhook:', error);
  }

  res.json({ received: true });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create Stripe product and price for a plan
 */
async function createStripePrice(plan, interval) {
  try {
    // Create or get product
    let productId = plan.stripe_product_id;
    
    if (!productId) {
      const product = await stripe.products.create({
        name: `${plan.name} Plan`,
        description: plan.description,
        metadata: {
          plan_id: plan.id,
          plan_slug: plan.slug
        }
      });
      productId = product.id;

      await db.query(
        'UPDATE subscription_plans SET stripe_product_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [productId, plan.id]
      );
    }

    // Create price
    const amount = interval === 'year' ? plan.price_yearly : plan.price_monthly;
    
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: amount,
      currency: 'usd',
      recurring: { interval },
      metadata: {
        plan_id: plan.id,
        plan_slug: plan.slug
      }
    });

    // Save price ID
    const column = interval === 'year' ? 'stripe_price_yearly_id' : 'stripe_price_monthly_id';
    await db.query(
      `UPDATE subscription_plans SET ${column} = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [price.id, plan.id]
    );

    logger.info(`Created Stripe price for plan ${plan.slug}`, { priceId: price.id, interval });

    return price.id;
  } catch (error) {
    logger.error('Error creating Stripe price:', error);
    return null;
  }
}

/**
 * Handle subscription update webhook
 */
async function handleSubscriptionUpdate(subscription) {
  const tenantId = subscription.metadata?.tenant_id;
  
  if (!tenantId) {
    // Try to find by subscription ID
    const result = await db.query(
      'SELECT id FROM tenants WHERE stripe_subscription_id = $1',
      [subscription.id]
    );
    if (result.rows.length === 0) {
      logger.warn('No tenant found for subscription:', subscription.id);
      return;
    }
  }

  const statusMap = {
    'trialing': 'trialing',
    'active': 'active',
    'past_due': 'past_due',
    'canceled': 'canceled',
    'unpaid': 'unpaid',
    'incomplete': 'incomplete',
    'incomplete_expired': 'incomplete_expired',
    'paused': 'paused'
  };

  const status = statusMap[subscription.status] || 'active';

  await db.query(`
    UPDATE tenants SET
      subscription_status = $1,
      trial_ends_at = $2,
      subscription_ends_at = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE stripe_subscription_id = $4
  `, [
    status,
    subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
    subscription.id
  ]);

  logger.info('Subscription updated via webhook', {
    subscription_id: subscription.id,
    status
  });
}

/**
 * Handle subscription deleted webhook
 */
async function handleSubscriptionDeleted(subscription) {
  await db.query(`
    UPDATE tenants SET
      subscription_status = 'canceled',
      subscription_ends_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE stripe_subscription_id = $1
  `, [subscription.id]);

  logger.info('Subscription canceled via webhook', { subscription_id: subscription.id });
}

/**
 * Handle successful payment webhook
 */
async function handlePaymentSucceeded(invoice) {
  if (!invoice.subscription) return;

  await db.query(`
    UPDATE tenants SET
      subscription_status = 'active',
      updated_at = CURRENT_TIMESTAMP
    WHERE stripe_subscription_id = $1 AND subscription_status IN ('past_due', 'incomplete')
  `, [invoice.subscription]);

  logger.info('Payment succeeded for subscription', { 
    subscription_id: invoice.subscription,
    amount: invoice.amount_paid 
  });
}

/**
 * Handle failed payment webhook
 */
async function handlePaymentFailed(invoice) {
  if (!invoice.subscription) return;

  await db.query(`
    UPDATE tenants SET
      subscription_status = 'past_due',
      updated_at = CURRENT_TIMESTAMP
    WHERE stripe_subscription_id = $1
  `, [invoice.subscription]);

  logger.warn('Payment failed for subscription', { 
    subscription_id: invoice.subscription,
    amount: invoice.amount_due 
  });
}

module.exports = router;
