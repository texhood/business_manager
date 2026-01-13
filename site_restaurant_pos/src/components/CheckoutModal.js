import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useTerminal } from '../context/TerminalContext';

function CheckoutModal({ onComplete, onClose, isReaderConnected, onConnectReader }) {
  const { items, subtotal, tax, total, orderType, customerName, phoneNumber, tableNumber } = useCart();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [cashReceived, setCashReceived] = useState('');

  const cashAmount = parseFloat(cashReceived) || 0;
  const change = cashAmount - total;
  const isCashValid = cashAmount >= total;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleQuickCash = (amount) => {
    setCashReceived(amount.toString());
  };

  const handleCashPayment = () => {
    if (isCashValid) {
      onComplete('cash', { cash_received: cashAmount });
    }
  };

  const handleCardPayment = () => {
    if (!isReaderConnected) {
      onConnectReader();
      return;
    }
    onComplete('card', {});
  };

  // Generate quick cash buttons
  const quickAmounts = [];
  const roundedTotal = Math.ceil(total);
  quickAmounts.push(roundedTotal);
  quickAmounts.push(Math.ceil(total / 5) * 5);
  quickAmounts.push(Math.ceil(total / 10) * 10);
  quickAmounts.push(20);
  quickAmounts.push(50);
  quickAmounts.push(100);
  const uniqueAmounts = [...new Set(quickAmounts)].sort((a, b) => a - b).slice(0, 6);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Checkout</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Order Summary */}
          <div className="checkout-summary">
            <div className="checkout-order-info">
              {customerName && <span><strong>{customerName}</strong></span>}
              <span style={{ textTransform: 'capitalize' }}>
                {orderType.replace('_', ' ')}
                {tableNumber && ` • Table ${tableNumber}`}
              </span>
              {phoneNumber && <span>📱 {phoneNumber}</span>}
            </div>

            <div className="checkout-items">
              {items.map((item, index) => (
                <div key={index} className="checkout-item">
                  <span>{item.quantity}× {item.name}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="checkout-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          {!paymentMethod && (
            <div className="payment-method-selection">
              <h3>Select Payment Method</h3>
              <div className="payment-method-buttons">
                <button
                  className="payment-method-btn cash"
                  onClick={() => setPaymentMethod('cash')}
                >
                  <span className="payment-icon">💵</span>
                  <span>Cash</span>
                </button>
                <button
                  className="payment-method-btn card"
                  onClick={() => setPaymentMethod('card')}
                >
                  <span className="payment-icon">💳</span>
                  <span>Card</span>
                  {!isReaderConnected && (
                    <span className="payment-note">Reader not connected</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Cash Payment */}
          {paymentMethod === 'cash' && (
            <div className="cash-payment-section">
              <button 
                className="back-link"
                onClick={() => setPaymentMethod(null)}
              >
                ← Back to payment selection
              </button>

              <div className="cash-input-group">
                <label>Cash Received</label>
                <input
                  type="number"
                  className="cash-input"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  autoFocus
                />
              </div>

              <div className="quick-cash-buttons">
                {uniqueAmounts.map((amount) => (
                  <button
                    key={amount}
                    className="quick-cash-btn"
                    onClick={() => handleQuickCash(amount)}
                  >
                    {formatPrice(amount)}
                  </button>
                ))}
              </div>

              <div className={`change-display ${!isCashValid && cashReceived ? 'error' : ''}`}>
                <div className="label">
                  {isCashValid ? 'Change Due' : 'Amount Short'}
                </div>
                <div className="value">
                  {formatPrice(Math.abs(change))}
                </div>
              </div>

              <button
                className="btn btn-success btn-lg"
                onClick={handleCashPayment}
                disabled={!isCashValid}
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
              >
                Complete Cash Payment
              </button>
            </div>
          )}

          {/* Card Payment */}
          {paymentMethod === 'card' && (
            <div className="card-payment-section">
              <button 
                className="back-link"
                onClick={() => setPaymentMethod(null)}
              >
                ← Back to payment selection
              </button>

              <div className="card-payment-prompt">
                {isReaderConnected ? (
                  <>
                    <div className="payment-status-icon">💳</div>
                    <p>Ready to process card payment</p>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleCardPayment}
                      style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
                    >
                      Process Card Payment
                    </button>
                  </>
                ) : (
                  <>
                    <div className="payment-status-icon">⚠️</div>
                    <p>Card reader not connected</p>
                    <button
                      className="btn btn-primary"
                      onClick={onConnectReader}
                    >
                      Connect Reader
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutModal;
