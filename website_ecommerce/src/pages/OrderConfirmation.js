import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './OrderConfirmation.css';

function OrderConfirmation() {
  const location = useLocation();
  const { orderId, email, deliveryMethod } = location.state || {};

  return (
    <div className="confirmation-page">
      <section className="confirmation-content section">
        <div className="container">
          <div className="confirmation-card">
            <div className="confirmation-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            
            <h1>Thank You!</h1>
            <p className="confirmation-subtitle">Your order has been placed successfully.</p>
            
            {orderId && (
              <div className="order-number">
                <span>Order Number:</span>
                <strong>{orderId.slice(-8).toUpperCase()}</strong>
              </div>
            )}

            <div className="confirmation-details">
              <p>
                A confirmation email has been sent to <strong>{email || 'your email address'}</strong>.
              </p>
              
              {deliveryMethod === 'pickup' ? (
                <div className="pickup-info">
                  <h3>Pickup Information</h3>
                  <p>
                    Your order will be ready for pickup at:
                  </p>
                  <address>
                    <strong>Hood Family Farms</strong><br />
                    3950 County Road 3802<br />
                    Bullard, TX 75757
                  </address>
                  <p>
                    We'll send you a text or email when your order is ready!
                  </p>
                </div>
              ) : (
                <div className="delivery-info">
                  <h3>Delivery Information</h3>
                  <p>
                    We'll contact you to arrange delivery. Typical delivery windows are:
                  </p>
                  <ul>
                    <li>Bullard: Fridays</li>
                    <li>Tyler: Saturdays</li>
                    <li>Other areas: By appointment</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="confirmation-actions">
              <Link to="/shopping" className="btn btn-primary btn-lg">
                Continue Shopping
              </Link>
              <Link to="/" className="btn btn-secondary btn-lg">
                Return Home
              </Link>
            </div>

            <div className="confirmation-contact">
              <p>
                Questions about your order? Contact us at{' '}
                <a href="mailto:sara@hoodfamilyfarms.com">sara@hoodfamilyfarms.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OrderConfirmation;
