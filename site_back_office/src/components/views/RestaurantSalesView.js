/**
 * RestaurantSalesView - Back Office
 * Full sales reporting for restaurant POS orders with date range,
 * summary cards, payment breakdown, top items, and order detail table.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../common/Icons';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const tenantId = localStorage.getItem('tenant_id_override');
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  return headers;
};

function RestaurantSalesView() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/restaurant-pos/sales-report?start_date=${startDate}&end_date=${endDate}`,
        { headers: getHeaders(), credentials: 'include' }
      );
      if (res.ok) {
        const data = await res.json();
        setReport(data.data);
      }
    } catch (err) {
      console.error('Error fetching sales report:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const fetchOrderItems = async (orderId) => {
    if (orderItems[orderId]) {
      setExpandedOrder(expandedOrder === orderId ? null : orderId);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/restaurant-pos/orders/${orderId}`, {
        headers: getHeaders(), credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setOrderItems(prev => ({ ...prev, [orderId]: data.data.items }));
        setExpandedOrder(orderId);
      }
    } catch (err) {
      console.error('Error fetching order items:', err);
    }
  };

  const setQuickRange = (label) => {
    const d = new Date();
    switch (label) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'yesterday': {
        const y = new Date(d);
        y.setDate(y.getDate() - 1);
        const ys = y.toISOString().slice(0, 10);
        setStartDate(ys);
        setEndDate(ys);
        break;
      }
      case 'week': {
        const w = new Date(d);
        w.setDate(w.getDate() - 6);
        setStartDate(w.toISOString().slice(0, 10));
        setEndDate(today);
        break;
      }
      case 'month': {
        setStartDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
        setEndDate(today);
        break;
      }
      default:
        break;
    }
  };

  const isMultiDay = startDate !== endDate;
  const s = report?.summary || {};

  const statusColor = (status) => ({
    entered: '#f0ad4e', in_process: '#5bc0de', done: '#5cb85c',
    complete: '#4a90d9', cancelled: '#d9534f'
  }[status] || '#999');

  return (
    <div className="view-container" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ margin: 0 }}>🍽️ Restaurant Sales</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {['today', 'yesterday', 'week', 'month'].map(label => (
            <button
              key={label}
              onClick={() => setQuickRange(label)}
              style={{
                padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd',
                background: '#fff', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'capitalize'
              }}
            >
              {label === 'week' ? 'Last 7 Days' : label === 'month' ? 'This Month' : label}
            </button>
          ))}
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem' }} />
          <span style={{ color: '#999' }}>to</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          <Icons.Loader /> Loading sales data...
        </div>
      ) : parseInt(s.total_orders) === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🍽️</p>
          <p style={{ fontSize: '1.1rem' }}>No orders found for this date range.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Gross Sales', value: formatPrice(s.gross_sales), color: '#2c3e50' },
              { label: 'Completed Sales', value: formatPrice(s.completed_sales), color: '#27ae60' },
              { label: 'Total Orders', value: parseInt(s.total_orders), color: '#2980b9' },
              { label: 'Avg Ticket', value: formatPrice(s.avg_ticket), color: '#8e44ad' },
              { label: 'Tax Collected', value: formatPrice(s.total_tax), color: '#e67e22' },
              { label: 'Active / Cancelled', value: `${parseInt(s.active_orders || 0)} / ${parseInt(s.cancelled_orders || 0)}`, color: '#95a5a6' },
            ].map((card, i) => (
              <div key={i} style={{
                padding: '16px', borderRadius: '8px', backgroundColor: '#fff',
                border: '1px solid #eee', textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: card.color }}>{card.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Payment Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#27ae60', color: '#fff', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '700' }}>{formatPrice(s.cash_total)}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Cash — {parseInt(s.cash_count)} orders</div>
              {parseFloat(s.total_change_given) > 0 && (
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>Change given: {formatPrice(s.total_change_given)}</div>
              )}
            </div>
            <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#2980b9', color: '#fff', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '700' }}>{formatPrice(s.card_total)}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Card — {parseInt(s.card_count)} orders</div>
            </div>
          </div>

          {/* Middle section: Top Items + Order Types + Hourly */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* Top Items */}
            {report.top_items?.length > 0 && (
              <div style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#333' }}>Top Selling Items</h4>
                <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '4px 8px', borderBottom: '1px solid #eee', color: '#888' }}>Item</th>
                      <th style={{ textAlign: 'right', padding: '4px 8px', borderBottom: '1px solid #eee', color: '#888' }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '4px 8px', borderBottom: '1px solid #eee', color: '#888' }}>Rev</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.top_items.map((item, i) => (
                      <tr key={i}>
                        <td style={{ padding: '4px 8px' }}>{item.name}</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right' }}>{parseInt(item.qty_sold)}</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right' }}>{formatPrice(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Order Types */}
            {report.order_types?.length > 0 && (
              <div style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#333' }}>Order Types</h4>
                <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '4px 8px', borderBottom: '1px solid #eee', color: '#888' }}>Type</th>
                      <th style={{ textAlign: 'right', padding: '4px 8px', borderBottom: '1px solid #eee', color: '#888' }}>Cnt</th>
                      <th style={{ textAlign: 'right', padding: '4px 8px', borderBottom: '1px solid #eee', color: '#888' }}>Rev</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.order_types.map((t, i) => (
                      <tr key={i}>
                        <td style={{ padding: '4px 8px', textTransform: 'capitalize' }}>{(t.order_type || '').replace('_', ' ')}</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right' }}>{parseInt(t.count)}</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right' }}>{formatPrice(t.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Hourly */}
            {report.hourly?.length > 0 && (
              <div style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#333' }}>Hourly Breakdown</h4>
                <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '4px 8px', borderBottom: '1px solid #eee', color: '#888' }}>Hour</th>
                      <th style={{ textAlign: 'right', padding: '4px 8px', borderBottom: '1px solid #eee', color: '#888' }}>Ord</th>
                      <th style={{ textAlign: 'right', padding: '4px 8px', borderBottom: '1px solid #eee', color: '#888' }}>Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.hourly.map((h, i) => {
                      const hr = parseInt(h.hour);
                      const label = hr === 0 ? '12 AM' : hr < 12 ? `${hr} AM` : hr === 12 ? '12 PM' : `${hr - 12} PM`;
                      return (
                        <tr key={i}>
                          <td style={{ padding: '4px 8px' }}>{label}</td>
                          <td style={{ padding: '4px 8px', textAlign: 'right' }}>{parseInt(h.order_count)}</td>
                          <td style={{ padding: '4px 8px', textAlign: 'right' }}>{formatPrice(h.hourly_sales)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Orders Table */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#333' }}>
              All Orders ({report.orders?.length || 0})
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    {['#', 'Time', 'Customer', 'Type', 'Status', 'Payment', 'Items', 'Total'].map(h => (
                      <th key={h} style={{
                        textAlign: h === 'Total' || h === 'Items' ? 'right' : 'left',
                        padding: '8px 10px', color: '#888', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(report.orders || []).map(order => (
                    <React.Fragment key={order.id}>
                      <tr
                        onClick={() => fetchOrderItems(order.id)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: expandedOrder === order.id ? '#f0f7ff' : 'transparent',
                          borderBottom: '1px solid #f0f0f0'
                        }}
                        onMouseEnter={e => { if (expandedOrder !== order.id) e.currentTarget.style.backgroundColor = '#fafafa'; }}
                        onMouseLeave={e => { if (expandedOrder !== order.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <td style={{ padding: '8px 10px', fontWeight: '600' }}>{order.ticket_number}</td>
                        <td style={{ padding: '8px 10px' }}>{isMultiDay ? formatDate(order.created_at) : formatTime(order.created_at)}</td>
                        <td style={{ padding: '8px 10px' }}>{order.customer_name || '-'}</td>
                        <td style={{ padding: '8px 10px', textTransform: 'capitalize' }}>
                          {(order.order_type || '').replace('_', ' ')}
                          {order.table_number ? ` · T${order.table_number}` : ''}
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{
                            backgroundColor: statusColor(order.status), color: '#fff',
                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem',
                            fontWeight: '600', textTransform: 'capitalize'
                          }}>{order.status}</span>
                        </td>
                        <td style={{ padding: '8px 10px', textTransform: 'capitalize' }}>{order.payment_method || '-'}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{parseInt(order.item_count)}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600' }}>{formatPrice(order.total)}</td>
                      </tr>
                      {expandedOrder === order.id && orderItems[order.id] && (
                        <tr>
                          <td colSpan="8" style={{ padding: '12px 24px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                            <div style={{ fontSize: '0.8rem' }}>
                              <strong>Order #{order.order_number}</strong>
                              {order.created_by_name && <span style={{ color: '#888' }}> — placed by {order.created_by_name}</span>}
                              <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
                                {orderItems[order.id].map((item, i) => (
                                  <li key={i} style={{ marginBottom: '3px' }}>
                                    {item.quantity}× {item.name} — {formatPrice(item.total_price)}
                                    {item.modifications?.length > 0 && (
                                      <span style={{ color: '#888' }}> ({item.modifications.join(', ')})</span>
                                    )}
                                    {item.special_instructions && (
                                      <span style={{ color: '#c9302c', fontStyle: 'italic' }}> — {item.special_instructions}</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                              {order.payment_method === 'cash' && order.cash_received && (
                                <div style={{ marginTop: '6px', color: '#666' }}>
                                  Cash received: {formatPrice(order.cash_received)} · Change: {formatPrice(order.change_given)}
                                </div>
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
          </div>

          {/* Footer */}
          {s.first_order_time && (
            <div style={{ textAlign: 'center', color: '#999', fontSize: '0.8rem', marginTop: '16px' }}>
              First order: {formatDate(s.first_order_time)} · Last order: {formatDate(s.last_order_time)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RestaurantSalesView;
