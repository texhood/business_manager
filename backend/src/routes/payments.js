const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const logger = require('../utils/logger');

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/v1/payments/create-intent
 * Create a payment intent for Stripe checkout
 */
router.post('/create-intent', async (req, res) => {
  try {
    const { amount, currency, customer, items, deliveryMethod, deliveryNotes } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create or retrieve Stripe customer
    let stripeCustomer;
    try {
      // Search for existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: customer.email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        stripeCustomer = existingCustomers.data[0];
        // Update customer info
        await stripe.customers.update(stripeCustomer.id, {
          name: customer.name,
          phone: customer.phone,
          address: customer.address
        });
      } else {
        // Create new customer
        stripeCustomer = await stripe.customers.create({
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          metadata: {
            source: 'hood_family_farms_website'
          }
        });
      }
    } catch (customerError) {
      logger.error('Error managing Stripe customer:', customerError);
      // Continue without customer - payment will still work
    }

    // Create payment intent
    const paymentIntentData = {
      amount: amount, // Amount in cents
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
        customerName: customer.name
      },
      receipt_email: customer.email,
      description: `Hood Family Farms Order - ${items.length} item(s)`
    };

    // Add customer if we have one
    if (stripeCustomer) {
      paymentIntentData.customer = stripeCustomer.id;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    logger.info(`Payment intent created: ${paymentIntent.id}`, {
      amount: amount,
      customer: customer.email
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
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
 * Handle Stripe webhook events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
      logger.info(`Payment succeeded: ${paymentIntent.id}`);
      
      // TODO: Create order in database
      // TODO: Send confirmation email
      // TODO: Update inventory
      
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      logger.warn(`Payment failed: ${failedPayment.id}`, {
        error: failedPayment.last_payment_error?.message
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
 */
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

module.exports = router;
