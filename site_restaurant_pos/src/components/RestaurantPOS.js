import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTerminal } from '../context/TerminalContext';
import { apiFetch } from '../services/api';
import MenuSelector from './MenuSelector';
import MenuItemGrid from './MenuItemGrid';
import Cart from './Cart';
import OrdersSidebar from './OrdersSidebar';
import OrderDetailModal from './OrderDetailModal';
import CheckoutModal from './CheckoutModal';
import CardPaymentProcessingModal from './CardPaymentProcessingModal';
import ReaderModal from './ReaderModal';
import SalesReview from './SalesReview';

const ORDER_POLL_INTERVAL = 5000; // 5 seconds to match KDS

function RestaurantPOS() {
  const { user, token, logout } = useAuth();
  const { items, orderType, customerName, phoneNumber, tableNumber, kitchenNotes, clearCart } = useCart();
  const { isConnected, reader, connectionStatus } = useTerminal();
  
  // Track ready orders for notification
  const prevReadyOrderIdsRef = useRef(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const readyAudioRef = useRef(null);

  // Initialize audio for ready notification
  useEffect(() => {
    readyAudioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAQ7jM7C/nB6B0COyt1xgx4qUqC3woZGJEaKpK6cXj1Nhp2jlGhXVWSGlZeJblhbfpaVgXxmaH6MjIR3a29/hYOCeXF0fYKBfXdzdHuBgn56dXR3fYCAfnl2dHd7f399eXZ1eH1/fnx5dnV4fH9+fHl2dXh8f358eXZ1eHx/fnx5dnV4fH5+fHl2dnh8fn18eHZ2eHx+fXx5dnZ4fH59fHl2dnh8fn18eXZ2eHx+fXx5dnZ4fH5+');
  }, []);

  // Menus
  const [menus, setMenus] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  
  const [loadingMenus, setLoadingMenus] = useState(true);

  // Orders
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState({});

  // Modals
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCardProcessing, setShowCardProcessing] = useState(false);
  const [showReaderModal, setShowReaderModal] = useState(false);
  const [showSalesReview, setShowSalesReview] = useState(false);

  // Fetch menus
  const fetchMenus = useCallback(async () => {
    try {
      const response = await apiFetch('/restaurant-pos/menus');

      if (response.ok) {
        const data = await response.json();
        setMenus(data.data);
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
    } finally {
      setLoadingMenus(false);
    }
  }, []);

  // Fetch selected menu details
  const fetchMenu = useCallback(async (menuId) => {
    try {
      const response = await apiFetch(`/restaurant-pos/menus/${menuId}`);

      if (response.ok) {
        const data = await response.json();
        setSelectedMenu(data.data);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  }, []);

  // Play ready sound
  const playReadySound = useCallback(() => {
    if (soundEnabled && readyAudioRef.current) {
      readyAudioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  }, [soundEnabled]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const response = await apiFetch('/restaurant-pos/orders?active_only=true');

      if (response.ok) {
        const data = await response.json();
        const newOrders = data.data;
        
        // Check for newly ready orders (status = done)
        const currentReadyIds = new Set(
          newOrders.filter(o => o.status === 'done').map(o => o.id)
        );
        
        // Find orders that just became ready
        const newlyReady = [...currentReadyIds].filter(id => !prevReadyOrderIdsRef.current.has(id));
        
        if (newlyReady.length > 0 && prevReadyOrderIdsRef.current.size > 0) {
          // Only play sound if this isn't the initial load
          playReadySound();
        }
        
        prevReadyOrderIdsRef.current = currentReadyIds;
        setOrders(newOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }, [playReadySound]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiFetch('/restaurant-pos/stats');

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Use refs to avoid useEffect dependencies on callbacks
  const fetchMenusRef = useRef(fetchMenus);
  const fetchOrdersRef = useRef(fetchOrders);
  const fetchStatsRef = useRef(fetchStats);
  
  useEffect(() => {
    fetchMenusRef.current = fetchMenus;
    fetchOrdersRef.current = fetchOrders;
    fetchStatsRef.current = fetchStats;
  });

  // Initial load - only runs once on mount
  useEffect(() => {
    fetchMenusRef.current();
    fetchOrdersRef.current();
    fetchStatsRef.current();

    // Poll for order updates
    const interval = setInterval(() => {
      fetchOrdersRef.current();
      fetchStatsRef.current();
    }, ORDER_POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []); // Empty deps - only run on mount

  // Fetch menu when selected
  useEffect(() => {
    if (selectedMenuId) {
      fetchMenu(selectedMenuId);
    } else {
      setSelectedMenu(null);
    }
  }, [selectedMenuId, fetchMenu]);

  // Handle menu selection from header
  const handleMenuChange = (e) => {
    const menuId = e.target.value;
    setSelectedMenuId(menuId || null);
  };

  // Prevent double-submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle checkout - user selected payment method
  const handleCheckoutComplete = async (paymentMethod, paymentData) => {
    if (isSubmitting) return;

    if (paymentMethod === 'card') {
      // Close checkout modal and open card processing modal
      setShowCheckoutModal(false);
      setShowCardProcessing(true);
    } else if (paymentMethod === 'cash') {
      // Process cash payment and create order immediately
      setIsSubmitting(true);
      try {
        const orderItems = items.map(item => ({
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          modifications: item.modifications,
          special_instructions: item.special_instructions
        }));

        const response = await apiFetch('/restaurant-pos/orders', {
          method: 'POST',
          body: JSON.stringify({
            menu_id: selectedMenuId,
            items: orderItems,
            customer_name: customerName,
            phone_number: phoneNumber,
            table_number: tableNumber,
            order_type: orderType,
            kitchen_notes: kitchenNotes,
            payment_method: 'cash',
            cash_received: paymentData.cash_received
          })
        });

        if (response.ok) {
          const { data: order } = await response.json();
          setShowCheckoutModal(false);
          clearCart();
          fetchOrders();
          fetchStats();
          
          // Show success briefly
          const changeAmount = parseFloat(order.change_given || 0).toFixed(2);
          alert('Order #' + order.ticket_number + ' sent to kitchen!\nChange due: $' + changeAmount);
        } else {
          const error = await response.json();
          alert('Failed to create order: ' + error.message);
        }
      } catch (error) {
        console.error('Error creating order:', error);
        alert('Failed to create order');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle card payment complete
  const handleCardPaymentComplete = (order) => {
    setShowCardProcessing(false);
    clearCart();
    fetchOrders();
    fetchStats();
  };

  // Mark order complete
  const handleCompleteOrder = async (orderId) => {
    try {
      const response = await apiFetch(`/restaurant-pos/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'complete' })
      });

      if (response.ok) {
        fetchOrders();
        fetchStats();
        setShowOrderDetail(false);
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Failed to complete order');
    }
  };

  // Handle order click
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const getReaderStatusText = () => {
    if (isConnected && reader) {
      return reader.label || 'Connected';
    }
    switch (connectionStatus) {
      case 'initialized':
        return 'Ready';
      case 'discovering':
        return 'Discovering...';
      case 'connecting':
        return 'Connecting...';
      default:
        return 'Not connected';
    }
  };

  const canCheckout = items.length > 0 && selectedMenuId;

  return (
    <>
      {/* Header */}
      <header className="pos-header">
        <h1>🍽️ Restaurant POS</h1>
        
        <div className="pos-header-center">
          <select
            className="menu-selector-dropdown"
            value={selectedMenuId || ''}
            onChange={handleMenuChange}
          >
            <option value="">Select a Menu</option>
            {menus.map(menu => (
              <option key={menu.id} value={menu.id}>
                {menu.name} {menu.is_featured && '⭐'}
              </option>
            ))}
          </select>
        </div>
        
        <div className="pos-header-right">
          <button 
            className="reader-status"
            onClick={() => setShowReaderModal(true)}
            title="Manage card reader"
          >
            <span className={`indicator ${isConnected ? 'connected' : ''}`}></span>
            <span>{getReaderStatusText()}</span>
          </button>

          <button
            className="sales-review-btn"
            onClick={() => setShowSalesReview(true)}
            title="Sales Review"
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            📊 Sales
          </button>

          <button
            className={`sound-toggle ${!soundEnabled ? 'muted' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute ready notifications' : 'Enable ready notifications'}
          >
            {soundEnabled ? '🔔' : '🔕'}
          </button>
          
          <span className="user-info">{user?.name}</span>
          
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="pos-layout">
        {/* Orders Sidebar */}
        <OrdersSidebar
          orders={orders}
          stats={stats}
          onOrderClick={handleOrderClick}
          onCompleteOrder={handleCompleteOrder}
        />

        {/* Products Panel */}
        <div className="products-panel">
          {!selectedMenuId ? (
            <MenuSelector
              menus={menus}
              loading={loadingMenus}
              onSelectMenu={(menuId) => setSelectedMenuId(menuId)}
            />
          ) : (
            <MenuItemGrid menu={selectedMenu} />
          )}
        </div>

        {/* Cart Panel */}
        <Cart
          canCheckout={canCheckout}
          onCheckout={() => setShowCheckoutModal(true)}
        />
      </div>

      {/* Modals */}
      {showOrderDetail && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetail(false);
            setSelectedOrder(null);
          }}
          onComplete={handleCompleteOrder}
        />
      )}

      {showCheckoutModal && (
        <CheckoutModal
          onComplete={handleCheckoutComplete}
          onClose={() => setShowCheckoutModal(false)}
          isReaderConnected={isConnected}
          isSubmitting={isSubmitting}
          onConnectReader={() => {
            setShowCheckoutModal(false);
            setShowReaderModal(true);
          }}
        />
      )}

      {showCardProcessing && (
        <CardPaymentProcessingModal
          menuId={selectedMenuId}
          onComplete={handleCardPaymentComplete}
          onClose={() => setShowCardProcessing(false)}
        />
      )}

      {showReaderModal && (
        <ReaderModal onClose={() => setShowReaderModal(false)} />
      )}

      {showSalesReview && (
        <SalesReview onClose={() => setShowSalesReview(false)} />
      )}
    </>
  );
}

export default RestaurantPOS;
