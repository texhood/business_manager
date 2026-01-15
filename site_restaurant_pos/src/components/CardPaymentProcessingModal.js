import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTerminal } from '../context/TerminalContext';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

function CardPaymentProcessingModal({ menuId, onComplete, onClose }) {
  const { token } = useAuth();
  const { items, total, orderType, customerName, phoneNumber, tableNumber, kitchenNotes } = useCart();
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
            amount: Math.round(total * 100)
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

        // Payment successful - now create the order
        setStatus('creating_order');
        
        const orderItems = items.map(item => ({
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          modifications: item.modifications,
          special_instructions: item.special_instructions
        }));

        const orderResponse = await fetch(`${API_URL}/restaurant-pos/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            menu_id: menuId,
            items: orderItems,
            customer_name: customerName,
            phone_number: phoneNumber,
            table_number: tableNumber,
            order_type: orderType,
            kitchen_notes: kitchenNotes,
            payment_method: 'card',
            payment_intent_id: processedIntent.id
          })
        });

        if (!orderResponse.ok) {
          throw new Error('Failed to create order');
        }

        const { data: order } = await orderResponse.json();

        if (cancelled) return;

        // Complete!
        setStatus('success');
        setTimeout(() => {
          onComplete(order);
        }, 1500);

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
  }, [token, menuId, items, total, orderType, customerName, phoneNumber, tableNumber, kitchenNotes, collectPayment, processPayment, cancelCollect, onComplete]);

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
      case 'creating_order':
        return 'Creating order...';
      case 'success':
        return 'Order sent to kitchen!';
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
      case 'collecting':
        return '💳';
      default:
        return '⏳';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Card Payment</h2>
          {status !== 'success' && status !== 'creating_order' && (
            <button className="modal-close" onClick={handleCancel}>×</button>
          )}
        </div>

        <div className="modal-body">
          <div className="payment-modal-total">
            {formatPrice(total)}
          </div>

          <div className="card-payment-status">
            <div className={`payment-status-icon ${['collecting', 'processing', 'creating_order'].includes(status) ? 'processing' : ''}`}>
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
            {status === 'success' && (
              <div className="payment-status-detail" style={{ color: '#28a745' }}>
                Order has been sent to the kitchen
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
          {!['success', 'error', 'creating_order'].includes(status) && (
            <button className="btn btn-danger" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CardPaymentProcessingModal;
