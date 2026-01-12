import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import './Checkout.css';

// Initialize Stripe - Replace with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

// Card styling options
const cardStyle = {
  style: {
    base: {
      color: '#333',
      fontFamily: '"Lato", sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#dc3545',
      iconColor: '#dc3545',
    },
  },
};

// Checkout Form Component
function CheckoutForm({ cartItems, cartTotal, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: 'TX',
    zipCode: '',
    deliveryNotes: '',
    deliveryMethod: 'pickup' // pickup, delivery
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateShipping = () => {
    if (formData.deliveryMethod === 'pickup') return 0;
    // Simple flat rate shipping - adjust as needed
    return 10.00;
  };

  const calculateTax = () => {
    // Texas sales tax rate (adjust for your actual rate)
    const taxRate = 0.0825;
    return cartTotal * taxRate;
  };

  const calculateTotal = () => {
    return cartTotal + calculateShipping() + calculateTax();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent on backend
      const response = await fetch('/api/v1/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(calculateTotal() * 100), // Stripe expects cents
          currency: 'usd',
          customer: {
            email: formData.email,
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: 'US'
            }
          },
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            variant: item.variant
          })),
          deliveryMethod: formData.deliveryMethod,
          deliveryNotes: formData.deliveryNotes
        }),
      });

      const { clientSecret, error: backendError } = await response.json();

      if (backendError) {
        setError(backendError);
        setProcessing(false);
        return;
      }

      // Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: 'US'
            }
          }
        }
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
      } else if (paymentIntent.status === 'succeeded') {
        setSucceeded(true);
        onSuccess(paymentIntent.id);
        navigate('/order-confirmation', { 
          state: { 
            orderId: paymentIntent.id,
            email: formData.email,
            deliveryMethod: formData.deliveryMethod
          }
        });
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      {/* Contact Information */}
      <section className="checkout-section">
        <h2>Contact Information</h2>
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your@email.com"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="(903) 555-1234"
          />
        </div>
      </section>

      {/* Delivery Method */}
      <section className="checkout-section">
        <h2>Delivery Method</h2>
        <div className="delivery-options">
          <label className={`delivery-option ${formData.deliveryMethod === 'pickup' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="deliveryMethod"
              value="pickup"
              checked={formData.deliveryMethod === 'pickup'}
              onChange={handleChange}
            />
            <div className="option-content">
              <span className="option-title">Farm Pickup</span>
              <span className="option-subtitle">Free - Pick up at Hood Family Farms</span>
              <span className="option-detail">3950 County Road 3802, Bullard, TX 75757</span>
            </div>
          </label>
          <label className={`delivery-option ${formData.deliveryMethod === 'delivery' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="deliveryMethod"
              value="delivery"
              checked={formData.deliveryMethod === 'delivery'}
              onChange={handleChange}
            />
            <div className="option-content">
              <span className="option-title">Local Delivery</span>
              <span className="option-subtitle">$10.00 - Delivered to your address</span>
              <span className="option-detail">Tyler, Bullard, and surrounding areas</span>
            </div>
          </label>
        </div>
      </section>

      {/* Delivery Address (shown only for delivery) */}
      {formData.deliveryMethod === 'delivery' && (
        <section className="checkout-section">
          <h2>Delivery Address</h2>
          <div className="form-group">
            <label htmlFor="address">Street Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required={formData.deliveryMethod === 'delivery'}
            />
          </div>
          <div className="form-row form-row-3">
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required={formData.deliveryMethod === 'delivery'}
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State *</label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required={formData.deliveryMethod === 'delivery'}
              >
                <option value="TX">Texas</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="zipCode">ZIP Code *</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required={formData.deliveryMethod === 'delivery'}
                maxLength={5}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="deliveryNotes">Delivery Notes (Optional)</label>
            <textarea
              id="deliveryNotes"
              name="deliveryNotes"
              value={formData.deliveryNotes}
              onChange={handleChange}
              rows={3}
              placeholder="Gate code, special instructions, etc."
            />
          </div>
        </section>
      )}

      {/* Payment */}
      <section className="checkout-section">
        <h2>Payment</h2>
        <div className="card-element-container">
          <CardElement options={cardStyle} />
        </div>
        <p className="payment-security">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Your payment information is encrypted and secure.
        </p>
      </section>

      {/* Error Display */}
      {error && (
        <div className="checkout-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button 
        type="submit" 
        className="btn btn-primary btn-lg btn-checkout-submit"
        disabled={!stripe || processing || succeeded}
      >
        {processing ? 'Processing...' : `Pay $${calculateTotal().toFixed(2)}`}
      </button>
    </form>
  );
}

// Main Checkout Page Component
function Checkout() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const cartTotal = getCartTotal();

  useEffect(() => {
    // Redirect to cart if empty
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleSuccess = (paymentIntentId) => {
    clearCart();
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <section className="checkout-hero">
        <div className="checkout-hero-content">
          <h1>Checkout</h1>
        </div>
      </section>

      <section className="checkout-content section">
        <div className="container">
          <div className="checkout-grid">
            {/* Checkout Form */}
            <div className="checkout-main">
              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  cartItems={cartItems} 
                  cartTotal={cartTotal}
                  onSuccess={handleSuccess}
                />
              </Elements>
            </div>

            {/* Order Summary */}
            <div className="checkout-sidebar">
              <div className="order-summary">
                <h2>Order Summary</h2>
                
                <div className="summary-items">
                  {cartItems.map(item => (
                    <div key={item.itemId} className="summary-item">
                      <div className="item-image">
                        <img src={item.image} alt={item.name} />
                        <span className="item-quantity">{item.quantity}</span>
                      </div>
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        {item.variant && <p className="variant">{item.variant}</p>}
                      </div>
                      <div className="item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="summary-totals">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>Calculated above</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax (8.25%)</span>
                    <span>${(cartTotal * 0.0825).toFixed(2)}</span>
                  </div>
                </div>

                <Link to="/cart" className="edit-cart-link">
                  ← Edit Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Checkout;
