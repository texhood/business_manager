import React, { useState, useMemo } from 'react';

function CashPaymentModal({ total, onComplete, onClose }) {
  const [cashReceived, setCashReceived] = useState('');

  const cashReceivedAmount = parseFloat(cashReceived) || 0;
  const change = cashReceivedAmount - total;
  const isValid = cashReceivedAmount >= total;

  const quickAmounts = useMemo(() => {
    // Generate sensible quick amounts based on total
    const amounts = [];
    const roundedUp = Math.ceil(total);
    
    // Exact amount
    amounts.push(total);
    
    // Round up to nearest dollar
    if (roundedUp !== total) {
      amounts.push(roundedUp);
    }
    
    // Common bills
    [5, 10, 20, 50, 100].forEach(amt => {
      if (amt >= total && !amounts.includes(amt)) {
        amounts.push(amt);
      }
    });
    
    return amounts.slice(0, 6).sort((a, b) => a - b);
  }, [total]);

  const handleSubmit = () => {
    if (isValid) {
      onComplete(cashReceivedAmount, Math.round(change * 100) / 100);
    }
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💵 Cash Payment</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="cash-payment">
            <div className="payment-total">
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
              {quickAmounts.map(amount => (
                <button
                  key={amount}
                  className="quick-cash-btn"
                  onClick={() => setCashReceived(amount.toFixed(2))}
                >
                  {formatPrice(amount)}
                </button>
              ))}
            </div>

            <div className={`change-display ${!isValid && cashReceivedAmount > 0 ? 'error' : ''}`}>
              {cashReceivedAmount === 0 ? (
                <span className="label">Enter amount received</span>
              ) : !isValid ? (
                <>
                  <span className="label">Insufficient amount</span>
                  <div className="value">Need {formatPrice(total - cashReceivedAmount)} more</div>
                </>
              ) : (
                <>
                  <span className="label">Change Due</span>
                  <div className="value">{formatPrice(change)}</div>
                </>
              )}
            </div>

            <button
              className="btn btn-success"
              style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
              onClick={handleSubmit}
              disabled={!isValid}
            >
              Complete Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CashPaymentModal;
