import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTerminal } from '../context/TerminalContext';
import ProductGrid from './ProductGrid';
import Cart from './Cart';
import CashPaymentModal from './CashPaymentModal';
import CardPaymentModal from './CardPaymentModal';
import OrderCompleteModal from './OrderCompleteModal';
import ReaderModal from './ReaderModal';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

function POS() {
  const { user, token, logout } = useAuth();
  const { items, subtotal, tax, total, clearCart } = useCart();
  const { isConnected, reader, connectionStatus } = useTerminal();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const searchTimeoutRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);
  
  const [showCashModal, setShowCashModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showOrderComplete, setShowOrderComplete] = useState(false);
  const [showReaderModal, setShowReaderModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (debouncedSearch) params.append('search', debouncedSearch);

      const response = await fetch(`${API_URL}/terminal/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [token, selectedCategory, debouncedSearch]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/terminal/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Record order to database
  const recordOrder = async (paymentMethod, paymentIntentId = null, cashReceived = null, changeGiven = null) => {
    try {
      const response = await fetch(`${API_URL}/terminal/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: items.map(item => ({
            item_id: item.id,
            name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity
          })),
          subtotal,
          tax_amount: tax,
          total,
          payment_method: paymentMethod,
          payment_intent_id: paymentIntentId,
          cash_received: cashReceived,
          change_given: changeGiven
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        throw new Error('Failed to record order');
      }
    } catch (error) {
      console.error('Error recording order:', error);
      throw error;
    }
  };

  // Handle cash payment completion
  const handleCashPaymentComplete = async (cashReceived, changeGiven) => {
    try {
      const order = await recordOrder('cash', null, cashReceived, changeGiven);
      setCompletedOrder(order);
      setShowCashModal(false);
      setShowOrderComplete(true);
      clearCart();
    } catch (error) {
      alert('Failed to complete order: ' + error.message);
    }
  };

  // Handle card payment completion
  const handleCardPaymentComplete = async (paymentIntentId) => {
    try {
      const order = await recordOrder('card', paymentIntentId);
      setCompletedOrder(order);
      setShowCardModal(false);
      setShowOrderComplete(true);
      clearCart();
    } catch (error) {
      alert('Failed to complete order: ' + error.message);
    }
  };

  // Handle order complete modal close
  const handleOrderCompleteClose = () => {
    setShowOrderComplete(false);
    setCompletedOrder(null);
  };

  // Check if cart has items
  const canCheckout = items.length > 0;

  const getReaderStatusText = () => {
    if (isConnected && reader) {
      return reader.label || 'Connected';
    }
    switch (connectionStatus) {
      case 'initialized':
        return 'Ready to connect';
      case 'discovering':
        return 'Discovering...';
      case 'connecting':
        return 'Connecting...';
      default:
        return 'Not connected';
    }
  };

  return (
    <>
      {/* Header */}
      <header className="pos-header">
        <h1>🌱 Hood Family Farms POS</h1>
        
        <div className="pos-header-right">
          <button 
            className="reader-status"
            onClick={() => setShowReaderModal(true)}
            title="Click to manage reader"
          >
            <span className={`indicator ${isConnected ? 'connected' : ''}`}></span>
            <span>{getReaderStatusText()}</span>
          </button>
          
          <span className="user-info">{user?.name}</span>
          
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="pos-layout">
        {/* Products Panel */}
        <div className="products-panel">
          {/* Search */}
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className="category-tabs">
            <button
              className={`category-tab ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              All Items
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name} ({category.item_count})
              </button>
            ))}
          </div>

          {/* Products */}
          <ProductGrid products={products} loading={loading} />
        </div>

        {/* Cart Panel */}
        <div className="cart-panel">
          <Cart
            canCheckout={canCheckout}
            onCashCheckout={() => setShowCashModal(true)}
            onCardCheckout={() => {
              if (!isConnected) {
                setShowReaderModal(true);
              } else {
                setShowCardModal(true);
              }
            }}
            isReaderConnected={isConnected}
          />
        </div>
      </div>

      {/* Modals */}
      {showCashModal && (
        <CashPaymentModal
          total={total}
          onComplete={handleCashPaymentComplete}
          onClose={() => setShowCashModal(false)}
        />
      )}

      {showCardModal && (
        <CardPaymentModal
          total={total}
          onComplete={handleCardPaymentComplete}
          onClose={() => setShowCardModal(false)}
        />
      )}

      {showOrderComplete && completedOrder && (
        <OrderCompleteModal
          order={completedOrder}
          onClose={handleOrderCompleteClose}
        />
      )}

      {showReaderModal && (
        <ReaderModal onClose={() => setShowReaderModal(false)} />
      )}
    </>
  );
}

export default POS;
