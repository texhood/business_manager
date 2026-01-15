import React from 'react';

const DoneOrdersPanel = ({ orders, onReissue, onClose }) => {
  // Format elapsed time from seconds
  const formatElapsedTime = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format order type
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

  return (
    <div className="done-panel">
      <div className="done-panel-header">
        <h2>Done Orders</h2>
        <button className="done-panel-close" onClick={onClose}>×</button>
      </div>

      <div className="done-panel-list">
        {orders.length === 0 ? (
          <div className="done-panel-empty">
            <p>No completed orders yet</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="done-order-item">
              <div className="done-order-main">
                <div className="done-order-ticket">#{order.ticket_number}</div>
                <div className="done-order-info">
                  {order.customer_name && (
                    <span className="done-order-name">{order.customer_name}</span>
                  )}
                  <span className="done-order-type">{formatOrderType(order.order_type)}</span>
                  {order.phone_number && <span className="done-order-phone">📱</span>}
                </div>
              </div>
              <div className="done-order-times">
                <div className="done-order-elapsed">
                  <span className="label">Prep:</span>
                  <span className="value">{formatElapsedTime(order.elapsed_seconds)}</span>
                </div>
                <div className="done-order-completed">
                  <span className="label">Done:</span>
                  <span className="value">{formatTime(order.status_updated_at)}</span>
                </div>
              </div>
              <button
                className="done-order-reissue"
                onClick={() => onReissue(order.id)}
                title="Reissue order with new timer"
              >
                ↻ Reissue
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoneOrdersPanel;
