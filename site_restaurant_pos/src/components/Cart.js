import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import ItemModificationsModal from './ItemModificationsModal';

function Cart({ canCheckout, onCheckout }) {
  const {
    items,
    orderType,
    customerName,
    phoneNumber,
    tableNumber,
    kitchenNotes,
    subtotal,
    tax,
    total,
    getItemPrice,
    updateQuantity,
    updateItemModifications,
    removeItem,
    clearCart,
    setOrderType,
    setCustomerName,
    setPhoneNumber,
    setTableNumber,
    setKitchenNotes
  } = useCart();

  const [editingItemIndex, setEditingItemIndex] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleSaveModifications = (index, modifications, specialInstructions) => {
    updateItemModifications(index, modifications, specialInstructions);
  };

  const itemHasMods = (item) => {
    return (item.modifications?.length > 0) || item.special_instructions;
  };

  const getModsPrice = (item) => {
    return (item.modifications || []).reduce((sum, mod) => {
      if (typeof mod === 'object' && mod.price) {
        return sum + parseFloat(mod.price);
      }
      return sum;
    }, 0);
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
          items.map((item, index) => {
            const modsPrice = getModsPrice(item);
            const itemPrice = getItemPrice(item);
            const lineTotal = itemPrice * item.quantity;

            return (
              <div 
                key={index} 
                className={`cart-item ${itemHasMods(item) ? 'has-mods' : ''}`}
              >
                {/* Clickable area for modifications */}
                <div 
                  className="cart-item-main"
                  onClick={() => setEditingItemIndex(index)}
                  title="Click to modify"
                >
                  <div className="cart-item-info">
                    <div className="cart-item-name">
                      {item.name}
                      <span className="cart-item-edit-hint">✏️</span>
                    </div>
                    <div className="cart-item-price">
                      {formatPrice(item.price)} each
                      {modsPrice !== 0 && (
                        <span className="cart-item-mods-price">
                          {modsPrice > 0 ? ' +' : ' '}{formatPrice(modsPrice)} mods
                        </span>
                      )}
                    </div>
                    {item.modifications?.length > 0 && (
                      <div className="cart-item-mods">
                        {item.modifications.map((mod, i) => {
                          const modName = typeof mod === 'string' ? mod : mod.display_name;
                          const modPrice = typeof mod === 'object' ? mod.price : 0;
                          return (
                            <span key={i} className={`cart-item-mod-tag ${mod.is_custom ? 'custom' : ''}`}>
                              {modName}
                              {modPrice !== 0 && (
                                <span className="mod-price">
                                  {modPrice > 0 ? '+' : ''}{formatPrice(modPrice)}
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {item.special_instructions && (
                      <div className="cart-item-instructions">
                        ⚠ {item.special_instructions}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity controls - separate from clickable area */}
                <div className="cart-item-controls">
                  <div className="cart-item-quantity">
                    <button
                      className="qty-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(index, item.quantity - 1);
                      }}
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(index, item.quantity + 1);
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-item-total">
                    {formatPrice(lineTotal)}
                  </div>
                  <button
                    className="btn-remove-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(index);
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Kitchen Notes */}
      {items.length > 0 && (
        <div className="cart-kitchen-notes">
          <input
            type="text"
            placeholder="Kitchen notes for entire order..."
            value={kitchenNotes}
            onChange={(e) => setKitchenNotes(e.target.value)}
          />
        </div>
      )}

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

      {/* Modifications Modal */}
      {editingItemIndex !== null && (
        <ItemModificationsModal
          item={items[editingItemIndex]}
          itemIndex={editingItemIndex}
          onSave={handleSaveModifications}
          onClose={() => setEditingItemIndex(null)}
        />
      )}
    </div>
  );
}

export default Cart;
