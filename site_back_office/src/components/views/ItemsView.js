/**
 * ItemsView Component
 * Full CRUD for products and inventory management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../common/Icons';
import { formatCurrency } from '../../utils/formatters';
import { itemsService, categoriesService, tagsService } from '../../services/api';

const ITEM_STATUSES = [
  { value: 'active', label: 'Active', description: 'Can be sold, visible on eCommerce/POS' },
  { value: 'inactive', label: 'Inactive', description: 'Cannot be sold, hidden from all sites' },
  { value: 'draft', label: 'Draft', description: 'Work in progress, not ready for use' },
];

const ItemsView = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Inventory adjustment modal
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryItem, setInventoryItem] = useState(null);
  const [inventoryAdjustment, setInventoryAdjustment] = useState({ type: 'set', value: 0, reason: '' });

  // Form state
  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    item_type: 'inventory',
    category_id: '',
    price: '',
    member_price: '',
    cost: '',
    inventory_quantity: 0,
    low_stock_threshold: 5,
    is_taxable: true,
    tax_rate: 0.0825,
    shipping_zone: 'in-state',
    weight_oz: '',
    status: 'draft',
    is_featured: false,
    image_url: '',
    digital_file_url: '',
    tags: [],
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, catsRes, tagsRes] = await Promise.all([
        itemsService.getAll({ include_all_statuses: 'true' }),
        categoriesService.getAll(true),
        tagsService.getAll(),
      ]);
      setItems(itemsRes.data || []);
      setCategories(catsRes || []);
      setTags(tagsRes || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setMessage({ type: 'error', text: 'Failed to load items' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const filtered = items.filter(item => {
    const matchSearch = !search || 
      item.name?.toLowerCase().includes(search.toLowerCase()) || 
      item.sku?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || item.item_type === typeFilter;
    const matchCategory = !categoryFilter || String(item.category_id) === categoryFilter;
    const matchStock = !stockFilter || 
      (stockFilter === 'in' && item.stock_status === 'in') ||
      (stockFilter === 'low' && item.stock_status === 'low') ||
      (stockFilter === 'out' && item.stock_status === 'out');
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchType && matchCategory && matchStock && matchStatus;
  });

  const resetForm = () => {
    setForm({
      sku: '',
      name: '',
      description: '',
      item_type: 'inventory',
      category_id: '',
      price: '',
      member_price: '',
      cost: '',
      inventory_quantity: 0,
      low_stock_threshold: 5,
      is_taxable: true,
      tax_rate: 0.0825,
      shipping_zone: 'in-state',
      weight_oz: '',
      status: 'draft',
      is_featured: false,
      image_url: '',
      digital_file_url: '',
      tags: [],
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingItem(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      sku: item.sku || '',
      name: item.name || '',
      description: item.description || '',
      item_type: item.item_type || 'inventory',
      category_id: item.category_id ? String(item.category_id) : '',
      price: item.price || '',
      member_price: item.member_price || '',
      cost: item.cost || '',
      inventory_quantity: item.inventory_quantity || 0,
      low_stock_threshold: item.low_stock_threshold || 5,
      is_taxable: item.is_taxable ?? true,
      tax_rate: item.tax_rate || 0.0825,
      shipping_zone: item.shipping_zone || 'in-state',
      weight_oz: item.weight_oz || '',
      status: item.status || 'draft',
      is_featured: item.is_featured ?? false,
      image_url: item.image_url || '',
      digital_file_url: item.digital_file_url || '',
      tags: item.tags?.map(t => t.id || t) || [],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.sku.trim() || !form.name.trim() || !form.price) {
      setMessage({ type: 'error', text: 'SKU, Name, and Price are required' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        price: parseFloat(form.price),
        member_price: form.member_price ? parseFloat(form.member_price) : null,
        cost: form.cost ? parseFloat(form.cost) : null,
        inventory_quantity: form.item_type === 'inventory' ? parseInt(form.inventory_quantity) : null,
        low_stock_threshold: parseInt(form.low_stock_threshold),
        tax_rate: parseFloat(form.tax_rate),
        weight_oz: form.weight_oz ? parseFloat(form.weight_oz) : null,
      };

      if (editingItem) {
        await itemsService.update(editingItem.id, payload);
        setMessage({ type: 'success', text: 'Item updated successfully' });
      } else {
        await itemsService.create(payload);
        setMessage({ type: 'success', text: 'Item created successfully' });
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Save error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save item' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (item, newStatus) => {
    try {
      await itemsService.updateStatus(item.id, newStatus);
      setMessage({ type: 'success', text: `Item status changed to ${newStatus}` });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to set "${item.name}" to inactive?`)) return;
    
    try {
      await itemsService.delete(item.id);
      setMessage({ type: 'success', text: 'Item set to inactive' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update item' });
    }
  };

  const openInventoryModal = (item) => {
    setInventoryItem(item);
    setInventoryAdjustment({ type: 'set', value: item.inventory_quantity || 0, reason: '' });
    setShowInventoryModal(true);
  };

  const handleInventoryAdjust = async () => {
    if (!inventoryItem) return;
    
    try {
      const payload = inventoryAdjustment.type === 'set' 
        ? { quantity: parseInt(inventoryAdjustment.value), reason: inventoryAdjustment.reason || 'Manual adjustment' }
        : { adjustment: parseInt(inventoryAdjustment.value), reason: inventoryAdjustment.reason || 'Manual adjustment' };
      
      await itemsService.adjustInventory(inventoryItem.id, payload);
      setMessage({ type: 'success', text: 'Inventory updated' });
      setShowInventoryModal(false);
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update inventory' });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-green">Active</span>;
      case 'inactive':
        return <span className="badge badge-red">Inactive</span>;
      case 'draft':
        return <span className="badge badge-yellow">Draft</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const getStockBadge = (item) => {
    if (item.item_type !== 'inventory') return <span className="badge badge-blue">Digital/Service</span>;
    if (item.stock_status === 'out' || item.inventory_quantity === 0) return <span className="badge badge-red">Out of Stock</span>;
    if (item.stock_status === 'low') return <span className="badge badge-yellow">Low Stock</span>;
    return <span className="badge badge-green">In Stock</span>;
  };

  // Count items by status
  const statusCounts = {
    active: items.filter(i => i.status === 'active').length,
    inactive: items.filter(i => i.status === 'inactive').length,
    draft: items.filter(i => i.status === 'draft').length,
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Items</h1>
          <p className="subtitle">Manage products and inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Icons.Plus /> Add Item
        </button>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 16,
          background: message.type === 'error' ? '#ffebee' : '#e8f5e9',
          color: message.type === 'error' ? '#c62828' : '#2e7d32',
        }}>
          {message.text}
        </div>
      )}

      {/* Status Summary Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div 
          style={{ 
            flex: 1, background: statusFilter === 'active' ? '#c8e6c9' : '#e8f5e9', 
            padding: 16, borderRadius: 8, cursor: 'pointer',
            border: statusFilter === 'active' ? '2px solid #2e7d32' : '2px solid transparent'
          }}
          onClick={() => setStatusFilter(statusFilter === 'active' ? '' : 'active')}
        >
          <div style={{ fontSize: 12, color: '#2e7d32', textTransform: 'uppercase', marginBottom: 4 }}>Active</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#2e7d32' }}>{statusCounts.active}</div>
          <div style={{ fontSize: 11, color: '#666' }}>Visible & available</div>
        </div>
        <div 
          style={{ 
            flex: 1, background: statusFilter === 'draft' ? '#fff3cd' : '#fff8e1', 
            padding: 16, borderRadius: 8, cursor: 'pointer',
            border: statusFilter === 'draft' ? '2px solid #f57c00' : '2px solid transparent'
          }}
          onClick={() => setStatusFilter(statusFilter === 'draft' ? '' : 'draft')}
        >
          <div style={{ fontSize: 12, color: '#f57c00', textTransform: 'uppercase', marginBottom: 4 }}>Draft</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#f57c00' }}>{statusCounts.draft}</div>
          <div style={{ fontSize: 11, color: '#666' }}>Work in progress</div>
        </div>
        <div 
          style={{ 
            flex: 1, background: statusFilter === 'inactive' ? '#ffcdd2' : '#ffebee', 
            padding: 16, borderRadius: 8, cursor: 'pointer',
            border: statusFilter === 'inactive' ? '2px solid #c62828' : '2px solid transparent'
          }}
          onClick={() => setStatusFilter(statusFilter === 'inactive' ? '' : 'inactive')}
        >
          <div style={{ fontSize: 12, color: '#c62828', textTransform: 'uppercase', marginBottom: 4 }}>Inactive</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#c62828' }}>{statusCounts.inactive}</div>
          <div style={{ fontSize: 11, color: '#666' }}>Hidden & disabled</div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="toolbar" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div className="search-box">
          <Icons.Search />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="inventory">Inventory</option>
          <option value="non-inventory">Non-Inventory</option>
          <option value="digital">Digital</option>
        </select>

        <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select className="filter-select" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
          <option value="">All Stock Levels</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>

        {statusFilter && (
          <button className="btn btn-secondary" onClick={() => setStatusFilter('')}>
            <Icons.X /> Clear Status Filter
          </button>
        )}
      </div>

      {/* Items Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'right' }}>Qty</th>
                <th>Stock</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: 40 }}>
                    <Icons.Loader /> Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: 40, color: '#888' }}>
                    No items found
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} style={{ opacity: item.status === 'inactive' ? 0.6 : 1 }}>
                    <td style={{ fontFamily: 'monospace' }}>{item.sku}</td>
                    <td>
                      <strong>{item.name}</strong>
                      {item.is_featured && <span className="badge badge-yellow" style={{ marginLeft: 8 }}>Featured</span>}
                    </td>
                    <td>{item.category_name || '—'}</td>
                    <td>
                      <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>
                        {item.item_type}
                      </span>
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {item.item_type === 'inventory' ? (
                        <button
                          onClick={() => openInventoryModal(item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            color: '#1565c0',
                            fontWeight: 600,
                          }}
                        >
                          {item.inventory_quantity}
                        </button>
                      ) : '—'}
                    </td>
                    <td>{getStockBadge(item)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: 12 }}
                          onClick={() => openEditModal(item)}
                          title="Edit"
                        >
                          <Icons.Edit />
                        </button>
                        {item.status === 'draft' && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: 12, color: '#2e7d32' }}
                            onClick={() => handleStatusChange(item, 'active')}
                            title="Activate"
                          >
                            <Icons.Check />
                          </button>
                        )}
                        {item.status === 'active' && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: 12, color: '#c62828' }}
                            onClick={() => handleStatusChange(item, 'inactive')}
                            title="Deactivate"
                          >
                            <Icons.X />
                          </button>
                        )}
                        {item.status === 'inactive' && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: 12, color: '#2e7d32' }}
                            onClick={() => handleStatusChange(item, 'active')}
                            title="Reactivate"
                          >
                            <Icons.RefreshCw />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: 700 }} 
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Item' : 'Create Item'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <Icons.X />
              </button>
            </div>
            <div className="modal-body">
              {/* Basic Info */}
              <div className="form-row">
                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="e.g., CHK-001"
                  />
                </div>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Product name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Product description..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Item Type *</label>
                  <select
                    className="form-control"
                    value={form.item_type}
                    onChange={(e) => setForm({ ...form, item_type: e.target.value })}
                  >
                    <option value="inventory">Inventory</option>
                    <option value="non-inventory">Non-Inventory</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  >
                    <option value="">No Category</option>
                    {categories.filter(c => c.is_active).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div className="form-group">
                <label>Status *</label>
                <select
                  className="form-control"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {ITEM_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label} - {s.description}</option>
                  ))}
                </select>
              </div>

              {/* Pricing */}
              <h3 style={{ fontSize: 16, marginTop: 20, marginBottom: 12, color: '#555' }}>Pricing</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Member Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={form.member_price}
                    onChange={(e) => setForm({ ...form, member_price: e.target.value })}
                    placeholder="Leave blank for 10% discount"
                  />
                </div>
                <div className="form-group">
                  <label>Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    placeholder="Cost of goods"
                  />
                </div>
              </div>

              {/* Inventory (only for inventory type) */}
              {form.item_type === 'inventory' && (
                <>
                  <h3 style={{ fontSize: 16, marginTop: 20, marginBottom: 12, color: '#555' }}>Inventory</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Quantity</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={form.inventory_quantity}
                        onChange={(e) => setForm({ ...form, inventory_quantity: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Low Stock Threshold</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={form.low_stock_threshold}
                        onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Tax & Shipping */}
              <h3 style={{ fontSize: 16, marginTop: 20, marginBottom: 12, color: '#555' }}>Tax & Shipping</h3>
              <div className="form-row">
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={form.is_taxable}
                      onChange={(e) => setForm({ ...form, is_taxable: e.target.checked })}
                    />
                    Taxable
                  </label>
                </div>
                <div className="form-group">
                  <label>Tax Rate</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    max="1"
                    className="form-control"
                    value={form.tax_rate}
                    onChange={(e) => setForm({ ...form, tax_rate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Shipping Zone</label>
                  <select
                    className="form-control"
                    value={form.shipping_zone}
                    onChange={(e) => setForm({ ...form, shipping_zone: e.target.value })}
                  >
                    <option value="not-shippable">Not Shippable</option>
                    <option value="in-state">In-State Only</option>
                    <option value="in-country">US Only</option>
                    <option value="no-restrictions">No Restrictions</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Weight (oz)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={form.weight_oz}
                    onChange={(e) => setForm({ ...form, weight_oz: e.target.value })}
                    placeholder="For shipping calculations"
                  />
                </div>
              </div>

              {/* Featured & Media */}
              <h3 style={{ fontSize: 16, marginTop: 20, marginBottom: 12, color: '#555' }}>Display Options</h3>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  />
                  Featured Item
                </label>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              {form.item_type === 'digital' && (
                <div className="form-group">
                  <label>Digital File URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={form.digital_file_url}
                    onChange={(e) => setForm({ ...form, digital_file_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Icons.Loader /> Saving...</> : (editingItem ? 'Update Item' : 'Create Item')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Adjustment Modal */}
      {showInventoryModal && inventoryItem && (
        <div className="modal-overlay" onClick={() => setShowInventoryModal(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: 400 }} 
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Adjust Inventory</h2>
              <button className="modal-close" onClick={() => setShowInventoryModal(false)}>
                <Icons.X />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16 }}>
                <strong>{inventoryItem.name}</strong><br />
                <span style={{ color: '#666' }}>Current quantity: {inventoryItem.inventory_quantity}</span>
              </p>

              <div className="form-group">
                <label>Adjustment Type</label>
                <select
                  className="form-control"
                  value={inventoryAdjustment.type}
                  onChange={(e) => setInventoryAdjustment({ 
                    ...inventoryAdjustment, 
                    type: e.target.value,
                    value: e.target.value === 'set' ? inventoryItem.inventory_quantity : 0
                  })}
                >
                  <option value="set">Set to specific quantity</option>
                  <option value="adjust">Add/Remove quantity</option>
                </select>
              </div>

              <div className="form-group">
                <label>{inventoryAdjustment.type === 'set' ? 'New Quantity' : 'Adjustment (use negative to remove)'}</label>
                <input
                  type="number"
                  className="form-control"
                  value={inventoryAdjustment.value}
                  onChange={(e) => setInventoryAdjustment({ ...inventoryAdjustment, value: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Reason</label>
                <input
                  type="text"
                  className="form-control"
                  value={inventoryAdjustment.reason}
                  onChange={(e) => setInventoryAdjustment({ ...inventoryAdjustment, reason: e.target.value })}
                  placeholder="e.g., Restock, Damaged, Sold offline"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowInventoryModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleInventoryAdjust}>
                Update Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsView;
