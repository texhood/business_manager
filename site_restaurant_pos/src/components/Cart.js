import React from 'react';
import { useCart } from '../context/CartContext';

function Cart({ canCheckout, onCheckout }) {
  const {
    items,
    orderType,
    customerName,
    phoneNumber,
    tableNumber,
    subtotal,
    tax,
    total,
    updateQuantity,
    removeItem,
    clearCart,
    setOrderType,
    setCustomerName,
    setPhoneNumber,
    setTableNumber
  } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="cart-panel">
      {/* Header */}
      <div className="cart-header">
        <h2>Current Order</h2>
        {items.length > 0 && (
          <button className="btn-clear-cart" onClick={clearCart}>
            Clear
          </button>
        )}
      </div>

      {/* Order Info */}
      <div className="cart-order-info">
        <div className="order-type-selector">
          <button
            className={`order-type-btn ${orderType === 'dine_in' ? 'active' : ''}`}
            onClick={() => setOrderType('dine_in')}
          >
            Dine In
          </button>
          <button
            className={`order-type-btn ${orderType === 'takeout' ? 'active' : ''}`}
            onClick={() => setOrderType('takeout')}
          >
            Takeout
          </button>
          <button
            className={`order-type-btn ${orderType === 'delivery' ? 'active' : ''}`}
            onClick={() => setOrderType('delivery')}
          >
            Delivery
          </button>
        </div>
        <div className="order-info-inputs">
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          {orderType === 'dine_in' && (
            <input
              type="text"
              placeholder="Table #"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              style={{ maxWidth: '80px' }}
            />
          )}
        </div>
        <div className="order-info-inputs" style={{ marginTop: '8px' }}>
          <input
            type="tel"
            placeholder="Phone (for order ready SMS)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
      </div>

      {/* Items */}
      <div className="cart-items">
        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <p>No items yet</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">{formatPrice(item.price)} each</div>
                {item.modifications?.length > 0 && (
                  <div className="cart-item-mods">
                    {item.modifications.join(', ')}
                  </div>
                )}
              </div>
              <div className="cart-item-quantity">
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(index, item.quantity - 1)}
                >
                  −
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(index, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <div className="cart-item-total">
                {formatPrice(item.price * item.quantity)}
              </div>
              <button
                className="btn-remove-item"
                onClick={() => removeItem(index)}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="summary-row">
          <span>Tax (8.25%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        <div className="checkout-buttons">
          <button
            className="btn-checkout checkout"
            disabled={!canCheckout}
            onClick={onCheckout}
          >
            💳 Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
