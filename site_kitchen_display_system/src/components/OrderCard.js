import React, { useState, useEffect } from 'react';

const OrderCard = ({ order, onMarkDone }) => {
  const [timer, setTimer] = useState('0:00');
  const [timerClass, setTimerClass] = useState('');
  const [updating, setUpdating] = useState(false);

  // Calculate and update timer
  useEffect(() => {
    const calculateTimer = () => {
      const orderTime = new Date(order.created_at);
      const now = new Date();
      const diffSeconds = Math.floor((now - orderTime) / 1000);
      
      const minutes = Math.floor(diffSeconds / 60);
      const seconds = diffSeconds % 60;
      
      setTimer(`${minutes}:${seconds.toString().padStart(2, '0')}`);

      // Set warning/urgent classes based on time
      if (minutes >= 15) {
        setTimerClass('urgent');
      } else if (minutes >= 10) {
        setTimerClass('warning');
      } else {
        setTimerClass('');
      }
    };

    calculateTimer();
    const interval = setInterval(calculateTimer, 1000);

    return () => clearInterval(interval);
  }, [order.created_at]);

  // Handle Done button click
  const handleDoneClick = async () => {
    setUpdating(true);
    try {
      await onMarkDone(order.id);
    } finally {
      setUpdating(false);
    }
  };

  // Format order type for display
  const formatOrderType = (type) => {
    switch (type) {
      case 'dine_in':
        return 'Dine In';
      case 'takeout':
        return 'Takeout';
      case 'delivery':
        return 'Delivery';
      default:
        return type;
    }
  };

  // Get modification display name - handles both string and object formats
  const getModDisplay = (mod) => {
    if (typeof mod === 'string') {
      return mod;
    }
    // Object format from database
    return mod.display_name || mod.name || 'Unknown';
  };

  // Check if modification is an allergy alert
  const isAllergyMod = (mod) => {
    if (typeof mod === 'string') {
      return mod.toLowerCase().includes('allergy');
    }
    return mod.category === 'allergy' || mod.name === 'allergy_alert';
  };

  // Parse modifications from JSON string if needed
  const parseModifications = (mods) => {
    if (!mods) return [];
    if (typeof mods === 'string') {
      try {
        return JSON.parse(mods);
      } catch {
        return [];
      }
    }
    return mods;
  };

  // Check if order is urgent (> 15 min)
  const isUrgent = timerClass === 'urgent';
  
  // Check if order was reissued
  const isReissued = order.reissue_count > 0;

  // Check if any item has allergy alert
  const hasAllergyAlert = order.items?.some(item => {
    const mods = parseModifications(item.modifications);
    return mods.some(isAllergyMod);
  });

  return (
    <div className={`order-card ${isUrgent ? 'is-urgent' : ''} ${isReissued ? 'is-reissued' : ''} ${hasAllergyAlert ? 'has-allergy' : ''}`}>
      {/* Allergy Alert Banner */}
      {hasAllergyAlert && (
        <div className="allergy-banner">
          ⚠️ ALLERGY ALERT
        </div>
      )}

      {/* Reissued Badge */}
      {isReissued && (
        <div className="reissued-badge">
          ⚠ REISSUED {order.reissue_count > 1 ? `(${order.reissue_count}x)` : ''}
        </div>
      )}
      
      {/* Header */}
      <div className="order-card-header">
        <div className="order-ticket-number">#{order.ticket_number}</div>
        <div className="order-meta">
          <span className={`order-type-badge ${order.order_type}`}>
            {formatOrderType(order.order_type)}
          </span>
          <span className={`order-timer ${timerClass}`}>{timer}</span>
        </div>
      </div>

      {/* Body */}
      <div className="order-card-body">
        {order.customer_name && (
          <div className="order-customer">{order.customer_name}</div>
        )}
        {order.table_number && (
          <div className="order-table">Table: {order.table_number}</div>
        )}
        {order.phone_number && (
          <div className="order-phone">📱 {order.phone_number}</div>
        )}

        {/* Items */}
        <div className="order-items-list">
          {order.items && order.items.map((item, index) => {
            const modifications = parseModifications(item.modifications);
            const hasItemAllergy = modifications.some(isAllergyMod);

            return (
              <div key={item.id || index} className={`order-item ${hasItemAllergy ? 'has-allergy' : ''}`}>
                <div className="order-item-main">
                  <span className="order-item-qty">{item.quantity}</span>
                  <span className="order-item-name">{item.name}</span>
                </div>
                {modifications.length > 0 && (
                  <div className="order-item-mods">
                    {modifications.map((mod, i) => (
                      <div 
                        key={i} 
                        className={`order-item-mod ${isAllergyMod(mod) ? 'allergy-mod' : ''}`}
                      >
                        • {getModDisplay(mod)}
                      </div>
                    ))}
                  </div>
                )}
                {item.special_instructions && (
                  <div className="order-item-mods">
                    <div className="order-item-instructions">
                      ⚠ {item.special_instructions}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Kitchen Notes */}
        {order.kitchen_notes && (
          <div className="order-kitchen-notes">
            <div className="order-kitchen-notes-label">Kitchen Notes</div>
            <div className="order-kitchen-notes-text">{order.kitchen_notes}</div>
          </div>
        )}
      </div>

      {/* Footer with Done button */}
      <div className="order-card-footer">
        <button
          className="order-done-btn"
          onClick={handleDoneClick}
          disabled={updating}
        >
          {updating ? 'Updating...' : 'DONE'}
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
