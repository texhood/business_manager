import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTerminal } from '../context/TerminalContext';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

function CardPaymentModal({ total, onComplete, onClose }) {
  const { token } = useAuth();
  const { collectPayment, processPayment, cancelCollectPayment } = useTerminal();
  
  const [status, setStatus] = useState('creating'); // creating, waiting, processing, success, error
  const [message, setMessage] = useState('Creating payment...');
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    startPayment();
    
    return () => {
      // Cancel if modal is closed during collection
      if (status === 'waiting') {
        cancelCollectPayment();
      }
    };
  }, []);

  const startPayment = async () => {
    try {
      // Create payment intent
      setStatus('creating');
      setMessage('Creating payment...');
      
      const response = await fetch(`${API_URL}/terminal/payment-intents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to cents
          description: 'POS Sale'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const data = await response.json();
      setPaymentIntentId(data.data.id);

      // Collect payment method from reader
      setStatus('waiting');
      setMessage('Present card on reader...');
      
      const paymentIntent = await collectPayment(data.data.client_secret);
      
      // Process the payment
      setStatus('processing');
      setMessage('Processing payment...');
      
      const processedPayment = await processPayment(paymentIntent);
      
      if (processedPayment.status === 'succeeded') {
        setStatus('success');
        setMessage('Payment successful!');
        
        // Small delay to show success message
        setTimeout(() => {
          onComplete(processedPayment.id);
        }, 1000);
      } else {
        throw new Error('Payment was not successful');
      }

    } catch (err) {
      console.error('Payment error:', err);
      setStatus('error');
      setError(err.message);
      setMessage('Payment failed');
      
      // Cancel the payment intent if it was created
      if (paymentIntentId) {
        try {
          await fetch(`${API_URL}/terminal/payment-intents/${paymentIntentId}/cancel`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (cancelErr) {
          console.error('Failed to cancel payment intent:', cancelErr);
        }
      }
    }
  };

  const handleCancel = async () => {
    if (status === 'waiting') {
      await cancelCollectPayment();
    }
    
    // Cancel payment intent
    if (paymentIntentId) {
      try {
        await fetch(`${API_URL}/terminal/payment-intents/${paymentIntentId}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error('Failed to cancel payment intent:', err);
      }
    }
    
    onClose();
  };

  const handleRetry = () => {
    setError(null);
    setPaymentIntentId(null);
    startPayment();
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'creating':
      case 'waiting':
      case 'processing':
        return '💳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '💳';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>💳 Card Payment</h2>
          {status !== 'success' && (
            <button className="modal-close" onClick={handleCancel}>×</button>
          )}
        </div>

        <div className="modal-body">
          <div className="card-payment">
            <div className="payment-total" style={{ marginBottom: '30px' }}>
              {formatPrice(total)}
            </div>

            <div className="payment-status">
              <div className={`payment-status-icon ${status === 'waiting' || status === 'processing' || status === 'creating' ? 'processing' : ''}`}>
                {getStatusIcon()}
              </div>
              <div className="payment-status-message">{message}</div>
              
              {status === 'waiting' && (
                <div className="payment-status-detail">
                  Tap, insert, or swipe card
                </div>
              )}
              
              {error && (
                <div className="payment-status-detail" style={{ color: '#dc3545' }}>
                  {error}
                </div>
              )}
            </div>

            {status === 'error' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={handleRetry}
                >
                  Retry
                </button>
              </div>
            )}

            {(status === 'waiting' || status === 'processing' || status === 'creating') && (
              <button
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '20px' }}
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardPaymentModal;
