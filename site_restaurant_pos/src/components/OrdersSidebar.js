import React from 'react';

function OrdersSidebar({ orders, stats, onOrderClick, onCompleteOrder }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getTimeSince = (timestamp) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  // Group orders by status
  const readyOrders = orders.filter(o => o.status === 'done');
  const inKitchenOrders = orders.filter(o => o.status === 'entered');
  
  // Further split ready orders by type
  const readyForPickup = readyOrders.filter(o => o.order_type !== 'delivery');
  const readyForDelivery = readyOrders.filter(o => o.order_type === 'delivery');

  const totalActiveOrders = readyOrders.length + inKitchenOrders.length;

  return (
    <div className="orders-sidebar">
      <div className="orders-sidebar-header">
        <h2>Active Orders</h2>
        <span className="orders-count">{totalActiveOrders}</span>
      </div>

      <div className="orders-list">
        {totalActiveOrders === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">📋</div>
            <p>No active orders</p>
          </div>
        ) : (
          <>
            {/* Ready for Pickup */}
            {readyForPickup.length > 0 && (
              <div className="orders-group">
                <div className="orders-group-header ready">
                  <span className="status-dot ready"></span>
                  <span>Ready for Pickup ({readyForPickup.length})</span>
                </div>
                {readyForPickup.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    status="ready"
                    statusLabel="READY"
                    onClick={() => onOrderClick(order)}
                    onDeliver={() => onCompleteOrder(order.id)}
                    formatPrice={formatPrice}
                    getTimeSince={getTimeSince}
                  />
                ))}
              </div>
            )}

            {/* Ready for Delivery */}
            {readyForDelivery.length > 0 && (
              <div className="orders-group">
                <div className="orders-group-header delivery">
                  <span className="status-dot delivery"></span>
                  <span>Ready for Delivery ({readyForDelivery.length})</span>
                </div>
                {readyForDelivery.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    status="delivery"
                    statusLabel="READY FOR DELIVERY"
                    onClick={() => onOrderClick(order)}
                    onDeliver={() => onCompleteOrder(order.id)}
                    formatPrice={formatPrice}
                    getTimeSince={getTimeSince}
                  />
                ))}
              </div>
            )}

            {/* In Kitchen */}
            {inKitchenOrders.length > 0 && (
              <div className="orders-group">
                <div className="orders-group-header entered">
                  <span className="status-dot entered"></span>
                  <span>In Kitchen ({inKitchenOrders.length})</span>
                </div>
                {inKitchenOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    status="kitchen"
                    statusLabel="IN KITCHEN"
                    onClick={() => onOrderClick(order)}
                    formatPrice={formatPrice}
                    getTimeSince={getTimeSince}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Daily Stats */}
      <div className="orders-sidebar-footer">
        <div className="daily-stats">
          <div className="stat-item">
            <span className="stat-value">{stats.complete_count || 0}</span>
            <span className="stat-label">Delivered</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{formatPrice(stats.total_sales || 0)}</span>
            <span className="stat-label">Today's Sales</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, status, statusLabel, onClick, onDeliver, formatPrice, getTimeSince }) {
  const formatOrderType = (type) => {
    switch (type) {
      case 'dine_in': return 'Dine In';
      case 'takeout': return 'Takeout';
      case 'delivery': return 'Delivery';
      default: return type;
    }
  };

  const isReady = status === 'ready' || status === 'delivery';

  return (
    <div
      className={`order-card ${isReady ? 'ready-highlight' : ''}`}
      onClick={onClick}
    >
      <div className="order-card-header">
        <span className="order-ticket">#{order.ticket_number}</span>
        <span className={`order-status-badge ${status}`}>{statusLabel}</span>
      </div>
      
      <div className="order-card-info">
        {order.customer_name && (
          <div className="order-customer">{order.customer_name}</div>
        )}
        <div className="order-meta">
          <span className="order-type">
            {formatOrderType(order.order_type)}
          </span>
          {order.table_number && (
            <span className="order-table">Table {order.table_number}</span>
          )}
          {order.phone_number && (
            <span className="order-phone">📱</span>
          )}
        </div>
      </div>

      <div className="order-card-footer">
        <span className="order-total">{formatPrice(order.total)}</span>
        <span className="order-time-ago">{getTimeSince(order.created_at)}</span>
      </div>

      {isReady && onDeliver && (
        <button
          className="btn-delivered"
          onClick={(e) => {
            e.stopPropagation();
            onDeliver();
          }}
        >
          ✓ Delivered
        </button>
      )}
    </div>
  );
}

export default OrdersSidebar;
