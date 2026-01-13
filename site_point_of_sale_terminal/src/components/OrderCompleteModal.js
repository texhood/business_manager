import React from 'react';

function OrderCompleteModal({ order, onClose }) {
  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-body">
          <div className="order-complete">
            <div className="order-complete-icon">✅</div>
            
            <h2 style={{ marginBottom: '10px' }}>Order Complete!</h2>
            
            <div className="order-number">
              #{order.order_number}
            </div>

            <div className="order-summary">
              <div className="order-summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="order-summary-row">
                <span>Tax</span>
                <span>{formatPrice(order.tax_amount)}</span>
              </div>
              <div className="order-summary-row total">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="order-summary-row" style={{ marginTop: '12px' }}>
                <span>Payment</span>
                <span style={{ textTransform: 'capitalize' }}>
                  {order.payment_method === 'card' ? '💳 Card' : '💵 Cash'}
                </span>
              </div>
              {order.payment_method === 'cash' && order.change_given > 0 && (
                <div className="order-summary-row">
                  <span>Change Given</span>
                  <span>{formatPrice(order.change_given)}</span>
                </div>
              )}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              onClick={onClose}
            >
              New Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderCompleteModal;
