import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';

function SalesReview({ onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState({});

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price || 0);

  const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/terminal/sales-report?start_date=${selectedDate}&end_date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data.data);
      }
    } catch (error) {
      console.error('Error fetching sales report:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const fetchOrderItems = async (orderId) => {
    if (orderItems[orderId]) {
      setExpandedOrder(expandedOrder === orderId ? null : orderId);
      return;
    }
    try {
      const response = await apiFetch(`/terminal/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderItems(prev => ({ ...prev, [orderId]: data.data.items }));
        setExpandedOrder(orderId);
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
      padding: '20px', overflowY: 'auto'
    },
    container: {
      backgroundColor: '#fff', borderRadius: '12px', width: '100%',
      maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 24px', borderBottom: '1px solid #eee',
      position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1,
      borderRadius: '12px 12px 0 0'
    },
    body: { padding: '24px' },
    dateInput: {
      padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem'
    },
    grid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '12px', marginBottom: '24px'
    },
    statCard: { padding: '16px', borderRadius: '8px', backgroundColor: '#f8f9fa', textAlign: 'center' },
    statValue: { fontSize: '1.5rem', fontWeight: '700', color: '#333' },
    statLabel: { fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' },
    section: { marginBottom: '24px' },
    sectionTitle: { fontSize: '1rem', fontWeight: '600', marginBottom: '12px', color: '#333', borderBottom: '2px solid #eee', paddingBottom: '8px' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
    th: { textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #eee', color: '#666', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' },
    td: { padding: '8px 12px', borderBottom: '1px solid #f0f0f0' },
    closeBtn: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999', padding: '4px 8px' },
    paymentCard: (color) => ({ flex: 1, padding: '16px', borderRadius: '8px', backgroundColor: color, color: '#fff', textAlign: 'center' }),
    emptyState: { textAlign: 'center', padding: '40px', color: '#999' }
  };

  if (loading) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={{ ...styles.container, ...styles.emptyState }} onClick={e => e.stopPropagation()}>
          <p>Loading sales data...</p>
        </div>
      </div>
    );
  }

  const s = report?.summary || {};

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.container} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>📊 Sales Review</h2>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={styles.dateInput} />
          </div>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={styles.body}>
          {parseInt(s.total_orders || 0) === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: '2rem', marginBottom: '8px' }}>🛒</p>
              <p>No sales for this date.</p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div style={styles.grid}>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{formatPrice(s.gross_sales)}</div>
                  <div style={styles.statLabel}>Total Sales</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{parseInt(s.total_orders)}</div>
                  <div style={styles.statLabel}>Orders</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{formatPrice(s.avg_ticket)}</div>
                  <div style={styles.statLabel}>Avg Ticket</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{formatPrice(s.total_tax)}</div>
                  <div style={styles.statLabel}>Tax Collected</div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={styles.paymentCard('#5cb85c')}>
                  <div style={{ fontSize: '1.3rem', fontWeight: '700' }}>{formatPrice(s.cash_total)}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Cash ({parseInt(s.cash_count)} orders)</div>
                  {parseFloat(s.total_change_given) > 0 && (
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>Change given: {formatPrice(s.total_change_given)}</div>
                  )}
                </div>
                <div style={styles.paymentCard('#4a90d9')}>
                  <div style={{ fontSize: '1.3rem', fontWeight: '700' }}>{formatPrice(s.card_total)}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Card ({parseInt(s.card_count)} orders)</div>
                </div>
              </div>

              {/* Top Items */}
              {report.top_items?.length > 0 && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Top Selling Items</div>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Item</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Qty Sold</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.top_items.map((item, i) => (
                        <tr key={i}>
                          <td style={styles.td}>{item.name}</td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>{parseInt(item.qty_sold)}</td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>{formatPrice(item.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Hourly Breakdown */}
              {report.hourly?.length > 0 && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Hourly Breakdown</div>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Hour</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Orders</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Sales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.hourly.map((h, i) => {
                        const hr = parseInt(h.hour);
                        const label = hr === 0 ? '12 AM' : hr < 12 ? `${hr} AM` : hr === 12 ? '12 PM' : `${hr - 12} PM`;
                        return (
                          <tr key={i}>
                            <td style={styles.td}>{label}</td>
                            <td style={{ ...styles.td, textAlign: 'right' }}>{parseInt(h.order_count)}</td>
                            <td style={{ ...styles.td, textAlign: 'right' }}>{formatPrice(h.hourly_sales)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Order List */}
              <div style={styles.section}>
                <div style={styles.sectionTitle}>All Orders ({report.orders?.length || 0})</div>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Order #</th>
                      <th style={styles.th}>Time</th>
                      <th style={styles.th}>Cashier</th>
                      <th style={styles.th}>Payment</th>
                      <th style={styles.th}>Status</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.orders || []).map(order => (
                      <React.Fragment key={order.id}>
                        <tr
                          style={{ cursor: 'pointer', backgroundColor: expandedOrder === order.id ? '#f0f7ff' : 'transparent' }}
                          onClick={() => fetchOrderItems(order.id)}
                          onMouseEnter={e => { if (expandedOrder !== order.id) e.currentTarget.style.backgroundColor = '#fafafa'; }}
                          onMouseLeave={e => { if (expandedOrder !== order.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <td style={{ ...styles.td, fontWeight: '600' }}>{order.order_number}</td>
                          <td style={styles.td}>{formatTime(order.created_at)}</td>
                          <td style={styles.td}>{order.cashier_name || '-'}</td>
                          <td style={{ ...styles.td, textTransform: 'capitalize' }}>{order.payment_method || '-'}</td>
                          <td style={styles.td}>
                            <span style={{
                              backgroundColor: order.status === 'completed' ? '#5cb85c' : order.status === 'voided' ? '#d9534f' : '#999',
                              color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem',
                              fontWeight: '600', textTransform: 'capitalize'
                            }}>{order.status}</span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600' }}>{formatPrice(order.total)}</td>
                        </tr>
                        {expandedOrder === order.id && orderItems[order.id] && (
                          <tr>
                            <td colSpan="6" style={{ ...styles.td, backgroundColor: '#f8f9fa', padding: '12px 24px' }}>
                              <div style={{ fontSize: '0.8rem' }}>
                                <strong>Items:</strong>
                                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                  {orderItems[order.id].map((item, i) => (
                                    <li key={i} style={{ marginBottom: '2px' }}>
                                      {item.quantity}× {item.name} — {formatPrice(item.total_price)}
                                    </li>
                                  ))}
                                </ul>
                                {order.cash_received && (
                                  <div style={{ marginTop: '6px', color: '#666' }}>
                                    Cash received: {formatPrice(order.cash_received)} • Change: {formatPrice(order.change_given)}
                                  </div>
                                )}
                                {order.notes && (
                                  <div style={{ marginTop: '4px', color: '#888', fontStyle: 'italic' }}>Note: {order.notes}</div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {s.first_order_time && (
                <div style={{ textAlign: 'center', color: '#999', fontSize: '0.8rem', marginTop: '16px' }}>
                  First sale: {formatTime(s.first_order_time)} • Last sale: {formatTime(s.last_order_time)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SalesReview;
