import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import OrderCard from './OrderCard';
import DoneOrdersPanel from './DoneOrdersPanel';

const REFRESH_INTERVAL = 5000; // 5 seconds

const KitchenDisplay = () => {
  const { user, token, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [doneOrders, setDoneOrders] = useState([]);
  const [stats, setStats] = useState({ pending: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showDonePanel, setShowDonePanel] = useState(false);
  const prevOrderCountRef = useRef(0);
  const audioRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAQ7jM7C/nB6B0COyt1xgx4qUqC3woZGJEaKpK6cXj1Nhp2jlGhXVWSGlZeJblhbfpaVgXxmaH6MjIR3a29/hYOCeXF0fYKBfXdzdHuBgn56dXR3fYCAfnl2dHd7f399eXZ1eH1/fnx5dnV4fH9+fHl2dXh8f358eXZ1eHx/fnx5dnV4fH5+fHl2dnh8fn18eHZ2eHx+fXx5dnZ4fH59fHl2dnh8fn18eXZ2eHx+fXx5dnZ4fH5+');
  }, []);

  // Play sound for new orders
  const playNewOrderSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  }, [soundEnabled]);

  // Fetch pending orders from API
  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/kds/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      const newOrders = data.data || [];

      // Check for new orders
      if (newOrders.length > prevOrderCountRef.current) {
        playNewOrderSound();
      }
      prevOrderCountRef.current = newOrders.length;

      setOrders(newOrders);
      setError(null);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, playNewOrderSound]);

  // Fetch done orders
  const fetchDoneOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/kds/orders/done', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDoneOrders(data.data || []);
      }
    } catch (err) {
      console.error('Fetch done orders error:', err);
    }
  }, [token]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/kds/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  }, [token]);

  // Initial fetch and polling
  useEffect(() => {
    fetchOrders();
    fetchDoneOrders();
    fetchStats();

    const ordersInterval = setInterval(() => {
      fetchOrders();
      fetchDoneOrders();
      fetchStats();
    }, REFRESH_INTERVAL);

    return () => clearInterval(ordersInterval);
  }, [fetchOrders, fetchDoneOrders, fetchStats]);

  // Update clock every second
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  // Handle marking order as done
  const handleMarkDone = async (orderId) => {
    try {
      const response = await fetch(`/api/v1/kds/orders/${orderId}/done`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to mark order as done');
      }

      const result = await response.json();
      
      // Show SMS confirmation if sent
      if (result.data.sms_sent) {
        console.log('SMS sent:', result.data.sms_message);
      }

      // Refresh all data
      fetchOrders();
      fetchDoneOrders();
      fetchStats();
    } catch (err) {
      console.error('Mark done error:', err);
      alert(err.message);
    }
  };

  // Handle reissuing an order
  const handleReissue = async (orderId) => {
    try {
      const response = await fetch(`/api/v1/kds/orders/${orderId}/reissue`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reissue order');
      }

      // Refresh all data
      fetchOrders();
      fetchDoneOrders();
      fetchStats();
    } catch (err) {
      console.error('Reissue error:', err);
      alert(err.message);
    }
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="kds-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading kitchen display...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="kds-container">
      {/* Header */}
      <header className="kds-header">
        <div className="kds-header-left">
          <h1 className="kds-title">Kitchen Display</h1>
          <div className="kds-stats">
            <div className="kds-stat pending">
              <span className="kds-stat-label">Pending:</span>
              <span className="kds-stat-count">{stats.pending}</span>
            </div>
            <button 
              className={`kds-stat done clickable ${showDonePanel ? 'active' : ''}`}
              onClick={() => setShowDonePanel(!showDonePanel)}
            >
              <span className="kds-stat-label">Done:</span>
              <span className="kds-stat-count">{stats.done}</span>
            </button>
          </div>
        </div>

        <div className="kds-header-right">
          <div className="kds-time">{formatTime(currentTime)}</div>
          
          <button
            className={`sound-toggle ${!soundEnabled ? 'muted' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute notifications' : 'Enable notifications'}
          >
            {soundEnabled ? '🔔' : '🔕'}
          </button>

          <div className="kds-user">
            <span>{user?.name || 'Kitchen'}</span>
          </div>

          <button className="kds-logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="kds-error">
          {error} - Retrying...
        </div>
      )}

      {/* Main Content */}
      <div className="kds-main">
        {/* Orders Queue - scrolls right to left, oldest on left */}
        <div className="kds-queue-wrapper">
          {orders.length === 0 ? (
            <div className="kds-empty-state">
              <div className="kds-empty-icon">🍳</div>
              <div className="kds-empty-text">No pending orders</div>
              <div className="kds-empty-subtext">New orders will appear here automatically</div>
            </div>
          ) : (
            <div className="kds-queue-container">
              {orders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onMarkDone={handleMarkDone}
                />
              ))}
            </div>
          )}
        </div>

        {/* Done Orders Panel - slides in from right */}
        {showDonePanel && (
          <DoneOrdersPanel
            orders={doneOrders}
            onReissue={handleReissue}
            onClose={() => setShowDonePanel(false)}
          />
        )}
      </div>
    </div>
  );
};

export default KitchenDisplay;
