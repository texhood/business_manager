import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

function OrderDetailModal({ order, onClose, onComplete }) {
  const { token } = useAuth();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/restaurant-pos/orders/${order.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setOrderDetails(data.data);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [order.id, token]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'entered':
        return { label: 'New', color: '#17a2b8' };
      case 'in_process':
        return { label: 'Being Prepared', color: '#ffc107' };
      case 'done':
        return { label: 'Ready for Pickup', color: '#28a745' };
      case 'complete':
        return { label: 'Complete', color: '#6c757d' };
      case 'cancelled':
        return { label: 'Cancelled', color: '#dc3545' };
      default:
        return { label: status, color: '#6c757d' };
    }
  };

  const data = orderDetails || order;
  const statusConfig = getStatusConfig(data.status);
  const canComplete = data.status === 'done';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <span>Loading...</span>
            </div>
          ) : (
            <>
              <div className="order-detail-header">
                <div>
                  <div className="order-detail-ticket">#{data.ticket_number}</div>
                  <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                    Order {data.order_number}
                  </div>
                </div>
                <span 
                  className="order-status-badge"
                  style={{ 
                    backgroundColor: statusConfig.color,
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}
                >
                  {statusConfig.label}
                </span>
              </div>

              <div className="order-detail-info">
                {data.customer_name && (
                  <p><strong>Customer:</strong> {data.customer_name}</p>
                )}
                {data.phone_number && (
                  <p><strong>Phone:</strong> {data.phone_number}</p>
                )}
                <p>
                  <strong>Type:</strong>{' '}
                  <span style={{ textTransform: 'capitalize' }}>
                    {data.order_type?.replace('_', ' ')}
                  </span>
                  {data.table_number && ` • Table ${data.table_number}`}
                </p>
                <p><strong>Created:</strong> {formatDateTime(data.created_at)}</p>
                <p>
                  <strong>Payment:</strong>{' '}
                  <span style={{ color: '#28a745', textTransform: 'capitalize' }}>
                    Paid ({data.payment_method})
                  </span>
                </p>
                {data.notes && (
                  <p><strong>Notes:</strong> {data.notes}</p>
                )}
                {data.kitchen_notes && (
                  <p><strong>Kitchen Notes:</strong> {data.kitchen_notes}</p>
                )}
              </div>

              <div className="order-detail-items">
                <h4>Items</h4>
                {data.items?.map((item, index) => (
                  <div key={index} className="order-detail-item">
                    <div>
                      <span className="order-detail-item-name">{item.name}</span>
                      <span className="order-detail-item-qty"> × {item.quantity}</span>
                      {item.modifications?.length > 0 && (
                        <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                          {item.modifications.join(', ')}
                        </div>
                      )}
                      {item.special_instructions && (
                        <div style={{ fontSize: '0.8rem', color: '#856404', fontStyle: 'italic' }}>
                          Note: {item.special_instructions}
                        </div>
                      )}
                    </div>
                    <span>{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>

              <div className="order-detail-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(data.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <span>{formatPrice(data.tax_amount)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatPrice(data.total)}</span>
                </div>
                {data.payment_method === 'cash' && data.cash_received && (
                  <>
                    <div className="summary-row" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #dee2e6' }}>
                      <span>Cash Received</span>
                      <span>{formatPrice(data.cash_received)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Change Given</span>
                      <span>{formatPrice(data.change_given)}</span>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          {canComplete && (
            <button 
              className="btn btn-success" 
              onClick={() => onComplete(data.id)}
              style={{ padding: '12px 24px' }}
            >
              ✓ Mark as Delivered
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailModal;
