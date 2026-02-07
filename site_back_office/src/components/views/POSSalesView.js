/**
 * POSSalesView - Back Office
 * Combined sales reporting for both Restaurant POS and Terminal POS.
 * Tabs differentiate between the two systems, with a Combined view.
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

const apiFetch = async (endpoint) => {
  const res = await fetch(`${API_URL}${endpoint}`, { headers: getHeaders(), credentials: 'include' });
  if (res.ok) return (await res.json()).data;
  return null;
};

// ============================================================================
// Shared helpers
// ============================================================================

const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price || 0);

const formatTime = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  });
};

const statusColor = (status) => ({
  entered: '#f0ad4e', in_process: '#5bc0de', done: '#5cb85c',
  complete: '#4a90d9', completed: '#4a90d9', cancelled: '#d9534f', voided: '#d9534f'
}[status] || '#999');

const hourLabel = (h) => {
  const hr = parseInt(h);
  return hr === 0 ? '12 AM' : hr < 12 ? `${hr} AM` : hr === 12 ? '12 PM' : `${hr - 12} PM`;
};

// ============================================================================
// Summary Cards Component
// ============================================================================

function SummaryCards({ summary, source }) {
  const s = summary || {};
  const cards = [
    { label: 'Gross Sales', value: formatPrice(s.gross_sales), color: '#2c3e50' },
    { label: 'Orders', value: parseInt(s.total_orders || 0), color: '#2980b9' },
    { label: 'Avg Ticket', value: formatPrice(s.avg_ticket), color: '#8e44ad' },
    { label: 'Tax Collected', value: formatPrice(s.total_tax), color: '#e67e22' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
      {cards.map((card, i) => (
        <div key={i} style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #eee', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: card.color }}>{card.value}</div>
          <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>{card.label}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Payment Breakdown Component
// ============================================================================

function PaymentBreakdown({ summary }) {
  const s = summary || {};
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
      <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#27ae60', color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: '1.4rem', fontWeight: '700' }}>{formatPrice(s.cash_total)}</div>
        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Cash — {parseInt(s.cash_count || 0)} orders</div>
        {parseFloat(s.total_change_given || 0) > 0 && (
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>Change given: {formatPrice(s.total_change_given)}</div>
        )}
      </div>
      <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#2980b9', color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: '1.4rem', fontWeight: '700' }}>{formatPrice(s.card_total)}</div>
        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Card — {parseInt(s.card_count || 0)} orders</div>
      </div>
    </div>
  );
}

// ============================================================================
// Small Table Component
// ============================================================================

function SmallTable({ title, headers, rows }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '16px' }}>
      <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#333' }}>{title}</h4>
      <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ textAlign: h.align || 'left', padding: '4px 8px', borderBottom: '1px solid #eee', color: '#888' }}>{h.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '4px 8px', textAlign: headers[j]?.align || 'left', textTransform: headers[j]?.capitalize ? 'capitalize' : 'none' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Order Table Component
// ============================================================================

function OrderTable({ orders, source, isMultiDay, expandedOrder, orderItems, onToggleOrder }) {
  if (!orders || orders.length === 0) return null;

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '16px' }}>
      <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#333' }}>
        All Orders ({orders.length})
      </h4>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              {source === 'combined' && <th style={thStyle}>Source</th>}
              <th style={thStyle}>#</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>{source === 'terminal' ? 'Cashier' : 'Customer'}</th>
              {source !== 'terminal' && <th style={thStyle}>Type</th>}
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Payment</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <React.Fragment key={`${order._source || source}-${order.id}`}>
                <tr
                  onClick={() => onToggleOrder(order)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: expandedOrder === `${order._source}-${order.id}` ? '#f0f7ff' : 'transparent',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                  onMouseEnter={e => { if (expandedOrder !== `${order._source}-${order.id}`) e.currentTarget.style.backgroundColor = '#fafafa'; }}
                  onMouseLeave={e => { if (expandedOrder !== `${order._source}-${order.id}`) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {source === 'combined' && (
                    <td style={tdStyle}>
                      <span style={{
                        backgroundColor: order._source === 'rpos' ? '#e74c3c' : '#3498db',
                        color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600'
                      }}>
                        {order._source === 'rpos' ? 'RPOS' : 'POS'}
                      </span>
                    </td>
                  )}
                  <td style={{ ...tdStyle, fontWeight: '600' }}>{order.ticket_number || order.order_number}</td>
                  <td style={tdStyle}>{isMultiDay ? formatDate(order.created_at) : formatTime(order.created_at)}</td>
                  <td style={tdStyle}>{order.customer_name || order.cashier_name || '-'}</td>
                  {source !== 'terminal' && (
                    <td style={{ ...tdStyle, textTransform: 'capitalize' }}>
                      {(order.order_type || '-').replace('_', ' ')}
                      {order.table_number ? ` · T${order.table_number}` : ''}
                    </td>
                  )}
                  <td style={tdStyle}>
                    <span style={{
                      backgroundColor: statusColor(order.status), color: '#fff',
                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem',
                      fontWeight: '600', textTransform: 'capitalize'
                    }}>{order.status}</span>
                  </td>
                  <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{order.payment_method || '-'}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '600' }}>{formatPrice(order.total)}</td>
                </tr>
                {expandedOrder === `${order._source}-${order.id}` && orderItems[`${order._source}-${order.id}`] && (
                  <tr>
                    <td colSpan={source === 'combined' ? 8 : source === 'terminal' ? 6 : 7} style={{ padding: '12px 24px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                      <div style={{ fontSize: '0.8rem' }}>
                        <strong>Order #{order.order_number || order.ticket_number}</strong>
                        {(order.created_by_name || order.cashier_name) && (
                          <span style={{ color: '#888' }}> — {order.created_by_name || order.cashier_name}</span>
                        )}
                        <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
                          {orderItems[`${order._source}-${order.id}`].map((item, i) => (
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
    </div>
  );
}

const thStyle = { textAlign: 'left', padding: '8px 10px', color: '#888', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' };
const tdStyle = { padding: '8px 10px' };

// ============================================================================
// Merge helpers for combined view
// ============================================================================

function mergeSummaries(rSummary, tSummary) {
  const r = rSummary || {};
  const t = tSummary || {};
  const num = (v) => parseFloat(v) || 0;
  return {
    gross_sales: num(r.gross_sales) + num(t.gross_sales),
    total_orders: parseInt(r.total_orders || 0) + parseInt(t.total_orders || 0),
    total_tax: num(r.total_tax) + num(t.total_tax),
    avg_ticket: ((num(r.gross_sales) + num(t.gross_sales)) / (parseInt(r.total_orders || 0) + parseInt(t.total_orders || 0))) || 0,
    cash_count: parseInt(r.cash_count || 0) + parseInt(t.cash_count || 0),
    card_count: parseInt(r.card_count || 0) + parseInt(t.card_count || 0),
    cash_total: num(r.cash_total) + num(t.cash_total),
    card_total: num(r.card_total) + num(t.card_total),
    total_change_given: num(r.total_change_given) + num(t.total_change_given),
  };
}

function mergeTopItems(rItems, tItems) {
  const map = {};
  for (const item of [...(rItems || []), ...(tItems || [])]) {
    if (!map[item.name]) map[item.name] = { name: item.name, qty_sold: 0, revenue: 0 };
    map[item.name].qty_sold += parseInt(item.qty_sold);
    map[item.name].revenue += parseFloat(item.revenue);
  }
  return Object.values(map).sort((a, b) => b.qty_sold - a.qty_sold).slice(0, 10);
}

function mergeHourly(rHourly, tHourly) {
  const map = {};
  for (const h of [...(rHourly || []), ...(tHourly || [])]) {
    const hr = parseInt(h.hour);
    if (!map[hr]) map[hr] = { hour: hr, order_count: 0, hourly_sales: 0 };
    map[hr].order_count += parseInt(h.order_count);
    map[hr].hourly_sales += parseFloat(h.hourly_sales);
  }
  return Object.values(map).sort((a, b) => a.hour - b.hour);
}

function mergeOrders(rOrders, tOrders) {
  const tagged = [
    ...(rOrders || []).map(o => ({ ...o, _source: 'rpos' })),
    ...(tOrders || []).map(o => ({ ...o, _source: 'terminal' })),
  ];
  return tagged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// ============================================================================
// Main Component
// ============================================================================

function POSSalesView() {
  const today = new Date().toISOString().slice(0, 10);
  const [source, setSource] = useState('rpos'); // 'rpos' | 'terminal' | 'combined'
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [rposReport, setRposReport] = useState(null);
  const [terminalReport, setTerminalReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState({});

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setExpandedOrder(null);
    setOrderItems({});
    const qs = `start_date=${startDate}&end_date=${endDate}`;

    const [rpos, terminal] = await Promise.all([
      (source === 'rpos' || source === 'combined') ? apiFetch(`/restaurant-pos/sales-report?${qs}`) : Promise.resolve(null),
      (source === 'terminal' || source === 'combined') ? apiFetch(`/terminal/sales-report?${qs}`) : Promise.resolve(null),
    ]);

    setRposReport(rpos);
    setTerminalReport(terminal);
    setLoading(false);
  }, [startDate, endDate, source]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const setQuickRange = (label) => {
    const d = new Date();
    switch (label) {
      case 'today': setStartDate(today); setEndDate(today); break;
      case 'yesterday': {
        const y = new Date(d); y.setDate(y.getDate() - 1);
        const ys = y.toISOString().slice(0, 10);
        setStartDate(ys); setEndDate(ys); break;
      }
      case 'week': {
        const w = new Date(d); w.setDate(w.getDate() - 6);
        setStartDate(w.toISOString().slice(0, 10)); setEndDate(today); break;
      }
      case 'month': {
        setStartDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
        setEndDate(today); break;
      }
      default: break;
    }
  };

  // Resolve active data based on source
  let summary, topItems, hourly, orders, orderTypes;
  if (source === 'combined') {
    summary = mergeSummaries(rposReport?.summary, terminalReport?.summary);
    topItems = mergeTopItems(rposReport?.top_items, terminalReport?.top_items);
    hourly = mergeHourly(rposReport?.hourly, terminalReport?.hourly);
    orders = mergeOrders(rposReport?.orders, terminalReport?.orders);
    orderTypes = rposReport?.order_types || [];
  } else if (source === 'rpos') {
    summary = rposReport?.summary || {};
    topItems = rposReport?.top_items || [];
    hourly = rposReport?.hourly || [];
    orders = (rposReport?.orders || []).map(o => ({ ...o, _source: 'rpos' }));
    orderTypes = rposReport?.order_types || [];
  } else {
    summary = terminalReport?.summary || {};
    topItems = terminalReport?.top_items || [];
    hourly = terminalReport?.hourly || [];
    orders = (terminalReport?.orders || []).map(o => ({ ...o, _source: 'terminal' }));
    orderTypes = [];
  }

  const isMultiDay = startDate !== endDate;
  const totalOrders = parseInt(summary?.total_orders || 0);

  const handleToggleOrder = async (order) => {
    const key = `${order._source}-${order.id}`;
    if (orderItems[key]) {
      setExpandedOrder(expandedOrder === key ? null : key);
      return;
    }
    try {
      const endpoint = order._source === 'rpos'
        ? `/restaurant-pos/orders/${order.id}`
        : `/terminal/orders/${order.id}`;
      const data = await apiFetch(endpoint);
      if (data) {
        setOrderItems(prev => ({ ...prev, [key]: data.items }));
        setExpandedOrder(key);
      }
    } catch (err) {
      console.error('Error fetching order items:', err);
    }
  };

  const sourceTabStyle = (active) => ({
    padding: '8px 20px', borderRadius: '6px', border: 'none',
    cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
    backgroundColor: active ? 'var(--brand-color, #2c3e50)' : '#f0f0f0',
    color: active ? '#fff' : '#555',
    transition: 'all 0.15s'
  });

  return (
    <div className="view-container" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ margin: 0 }}>📊 POS Sales Report</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {['today', 'yesterday', 'week', 'month'].map(label => (
            <button key={label} onClick={() => setQuickRange(label)} style={{
              padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd',
              background: '#fff', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'capitalize'
            }}>
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

      {/* Source Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button style={sourceTabStyle(source === 'rpos')} onClick={() => setSource('rpos')}>
          🍽️ Restaurant POS
        </button>
        <button style={sourceTabStyle(source === 'terminal')} onClick={() => setSource('terminal')}>
          🛒 Terminal POS
        </button>
        <button style={sourceTabStyle(source === 'combined')} onClick={() => setSource('combined')}>
          📋 Combined
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          <Icons.Loader /> Loading sales data...
        </div>
      ) : totalOrders === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{source === 'terminal' ? '🛒' : '🍽️'}</p>
          <p style={{ fontSize: '1.1rem' }}>No orders found for this date range.</p>
        </div>
      ) : (
        <>
          {/* Combined banner showing per-source totals */}
          {source === 'combined' && rposReport?.summary && terminalReport?.summary && (
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px'
            }}>
              <div style={{ padding: '12px 16px', backgroundColor: '#fdf2f2', border: '1px solid #f5c6c6', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', color: '#c0392b' }}>🍽️ Restaurant POS</span>
                <span style={{ fontWeight: '700', color: '#c0392b' }}>
                  {formatPrice(rposReport.summary.gross_sales)} · {parseInt(rposReport.summary.total_orders || 0)} orders
                </span>
              </div>
              <div style={{ padding: '12px 16px', backgroundColor: '#eef6fc', border: '1px solid #b8d4e8', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', color: '#2471a3' }}>🛒 Terminal POS</span>
                <span style={{ fontWeight: '700', color: '#2471a3' }}>
                  {formatPrice(terminalReport.summary.gross_sales)} · {parseInt(terminalReport.summary.total_orders || 0)} orders
                </span>
              </div>
            </div>
          )}

          <SummaryCards summary={summary} source={source} />
          <PaymentBreakdown summary={summary} />

          {/* Middle section */}
          <div style={{ display: 'grid', gridTemplateColumns: orderTypes.length > 0 ? '1fr 1fr 1fr' : '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <SmallTable
              title="Top Selling Items"
              headers={[{ label: 'Item' }, { label: 'Qty', align: 'right' }, { label: 'Revenue', align: 'right' }]}
              rows={topItems.map(item => [item.name, parseInt(item.qty_sold), formatPrice(item.revenue)])}
            />
            {orderTypes.length > 0 && (
              <SmallTable
                title="Order Types"
                headers={[{ label: 'Type', capitalize: true }, { label: 'Count', align: 'right' }, { label: 'Revenue', align: 'right' }]}
                rows={orderTypes.map(t => [(t.order_type || '').replace('_', ' '), parseInt(t.count), formatPrice(t.total)])}
              />
            )}
            <SmallTable
              title="Hourly Breakdown"
              headers={[{ label: 'Hour' }, { label: 'Orders', align: 'right' }, { label: 'Sales', align: 'right' }]}
              rows={hourly.map(h => [hourLabel(h.hour), parseInt(h.order_count), formatPrice(h.hourly_sales)])}
            />
          </div>

          <OrderTable
            orders={orders}
            source={source}
            isMultiDay={isMultiDay}
            expandedOrder={expandedOrder}
            orderItems={orderItems}
            onToggleOrder={handleToggleOrder}
          />
        </>
      )}
    </div>
  );
}

export default POSSalesView;
