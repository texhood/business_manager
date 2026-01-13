import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTerminal } from '../context/TerminalContext';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

function CardPaymentModal({ order, onComplete, onClose }) {
  const { token } = useAuth();
  const { collectPayment, processPayment, cancelCollect } = useTerminal();
  
  const [status, setStatus] = useState('preparing');
  const [error, setError] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  useEffect(() => {
    let cancelled = false;

    const processCardPayment = async () => {
      try {
        // Create payment intent
        setStatus('creating');
        const createResponse = await fetch(`${API_URL}/restaurant-pos/payment-intents`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: Math.round(order.total * 100),
            order_id: order.id
          })
        });

        if (!createResponse.ok) {
          throw new Error('Failed to create payment intent');
        }

        const { data: paymentIntent } = await createResponse.json();

        if (cancelled) return;

        // Collect payment method
        setStatus('collecting');
        const collectedIntent = await collectPayment(paymentIntent.client_secret);

        if (cancelled) return;

        // Process payment
        setStatus('processing');
        const processedIntent = await processPayment(collectedIntent);

        if (cancelled) return;

        // Payment successful
        setStatus('success');
        onComplete(processedIntent.id);

      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setStatus('error');
        }
      }
    };

    processCardPayment();

    return () => {
      cancelled = true;
      cancelCollect();
    };
  }, [token, order, collectPayment, processPayment, cancelCollect, onComplete]);

  const handleCancel = () => {
    cancelCollect();
    onClose();
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'preparing':
        return 'Preparing payment...';
      case 'creating':
        return 'Initializing payment...';
      case 'collecting':
        return 'Present card on reader...';
      case 'processing':
        return 'Processing payment...';
      case 'success':
        return 'Payment successful!';
      case 'error':
        return 'Payment failed';
      default:
        return 'Processing...';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      default:
        return '💳';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Card Payment</h2>
          {status !== 'success' && (
            <button className="modal-close" onClick={handleCancel}>×</button>
          )}
        </div>

        <div className="modal-body">
          <div className="payment-modal-total">
            {formatPrice(order.total)}
          </div>

          <div className="card-payment-status">
            <div className={`payment-status-icon ${status === 'collecting' || status === 'processing' ? 'processing' : ''}`}>
              {getStatusIcon()}
            </div>
            <div className="payment-status-message">
              {getStatusMessage()}
            </div>
            {error && (
              <div className="payment-status-detail" style={{ color: '#dc3545' }}>
                {error}
              </div>
            )}
            {status === 'collecting' && (
              <div className="payment-status-detail">
                Tap, insert, or swipe card
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {status === 'error' && (
            <button className="btn btn-secondary" onClick={handleCancel}>
              Close
            </button>
          )}
          {status !== 'success' && status !== 'error' && (
            <button className="btn btn-danger" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CardPaymentModal;
