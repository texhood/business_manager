import React from 'react';
import { useCart } from '../context/CartContext';

function Cart({ canCheckout, onCashCheckout, onCardCheckout, isReaderConnected }) {
  const { 
    items, 
    subtotal, 
    tax, 
    total, 
    itemCount,
    incrementQuantity, 
    decrementQuantity, 
    removeItem,
    clearCart 
  } = useCart();

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <>
      {/* Cart Header */}
      <div className="cart-header">
        <h2>Current Order ({itemCount})</h2>
        {items.length > 0 && (
          <button className="btn-clear-cart" onClick={clearCart}>
            Clear All
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="cart-items">
        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <div>Cart is empty</div>
            <div style={{ fontSize: '0.875rem', marginTop: '8px' }}>
              Tap items to add them
            </div>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">{formatPrice(item.price)} each</div>
              </div>
              
              <div className="cart-item-quantity">
                <button 
                  className="qty-btn"
                  onClick={() => decrementQuantity(item.id)}
                >
                  −
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button 
                  className="qty-btn"
                  onClick={() => incrementQuantity(item.id)}
                >
                  +
                </button>
              </div>
              
              <div className="cart-item-total">
                {formatPrice(item.price * item.quantity)}
              </div>
              
              <button 
                className="btn-remove-item"
                onClick={() => removeItem(item.id)}
                title="Remove item"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary */}
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
            className="btn-checkout cash"
            onClick={onCashCheckout}
            disabled={!canCheckout}
          >
            💵 Cash
          </button>
          <button
            className="btn-checkout card"
            onClick={onCardCheckout}
            disabled={!canCheckout}
          >
            💳 Card {!isReaderConnected && '(Connect Reader)'}
          </button>
        </div>
      </div>
    </>
  );
}

export default Cart;
