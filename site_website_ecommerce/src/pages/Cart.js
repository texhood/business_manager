import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();

  return (
    <div className="cart-page">
      <section className="cart-hero">
        <div className="cart-hero-content">
          <h1>Your Cart</h1>
        </div>
      </section>

      <section className="cart-content section">
        <div className="container">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <Link to="/shopping" className="btn btn-primary btn-lg">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="cart-grid">
              <div className="cart-items">
                <div className="cart-header">
                  <span className="cart-header-product">Product</span>
                  <span className="cart-header-price">Price</span>
                  <span className="cart-header-quantity">Quantity</span>
                  <span className="cart-header-total">Total</span>
                  <span className="cart-header-remove"></span>
                </div>

                {cartItems.map(item => (
                  <div key={item.itemId} className="cart-item">
                    <div className="cart-item-product">
                      <div className="cart-item-image">
                        <img src={item.image || '/placeholder.jpg'} alt={item.name} />
                      </div>
                      <div className="cart-item-info">
                        <h3>{item.name}</h3>
                        {item.variant && <p className="variant">{item.variant}</p>}
                      </div>
                    </div>

                    <div className="cart-item-price">
                      ${Number(item.price).toFixed(2)}
                    </div>

                    <div className="cart-item-quantity">
                      <button 
                        onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)}>
                        +
                      </button>
                    </div>

                    <div className="cart-item-total">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </div>

                    <button 
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item.itemId)}
                      aria-label="Remove item"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <h2>Order Summary</h2>
                
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className="summary-row">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className="summary-total">
                  <span>Estimated Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>

                <Link to="/checkout" className="btn btn-primary btn-lg btn-checkout">
                  Proceed to Checkout
                </Link>

                <Link to="/shopping" className="continue-shopping">
                  ← Continue Shopping
                </Link>

                <div className="cart-note">
                  <p>
                    <strong>Farm Members</strong> receive discounted pricing and free 
                    shipping totes. <Link to="/frequently-asked-questions">Learn more</Link>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Cart;
