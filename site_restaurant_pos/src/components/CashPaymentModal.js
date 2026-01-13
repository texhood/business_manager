import React, { useState } from 'react';

function CashPaymentModal({ order, onComplete, onClose }) {
  const [cashReceived, setCashReceived] = useState('');

  const total = parseFloat(order.total);
  const cashAmount = parseFloat(cashReceived) || 0;
  const change = cashAmount - total;
  const isValid = cashAmount >= total;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleQuickCash = (amount) => {
    setCashReceived(amount.toString());
  };

  const handleSubmit = () => {
    if (isValid) {
      onComplete(cashAmount);
    }
  };

  // Generate quick cash buttons based on total
  const quickAmounts = [];
  const roundedTotal = Math.ceil(total);
  quickAmounts.push(roundedTotal);
  quickAmounts.push(Math.ceil(total / 5) * 5);
  quickAmounts.push(Math.ceil(total / 10) * 10);
  quickAmounts.push(20);
  quickAmounts.push(50);
  quickAmounts.push(100);
  
  // Remove duplicates and sort
  const uniqueAmounts = [...new Set(quickAmounts)].sort((a, b) => a - b).slice(0, 6);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Cash Payment</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="payment-modal-total">
            {formatPrice(total)}
          </div>

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

          <div className={`change-display ${!isValid && cashReceived ? 'error' : ''}`}>
            <div className="label">
              {isValid ? 'Change Due' : 'Amount Short'}
            </div>
            <div className="value">
              {formatPrice(Math.abs(change))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-success" 
            onClick={handleSubmit}
            disabled={!isValid}
          >
            Complete Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default CashPaymentModal;
