/**
 * ItemsView Component
 * Manage inventory items
 */

import React, { useState } from 'react';
import { Icons } from '../common/Icons';
import { formatCurrency } from '../../utils/formatters';

const ItemsView = ({ items, loading }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = items.filter(item => {
    const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase()) || 
                        item.sku?.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || item.item_type === typeFilter;
    return matchSearch && matchType;
  });

  const getStockBadge = (item) => {
    if (item.item_type !== 'inventory') return null;
    if (item.inventory_quantity === 0) return <span className="badge badge-red">Out of Stock</span>;
    if (item.inventory_quantity <= 5) return <span className="badge badge-yellow">Low Stock</span>;
    return <span className="badge badge-green">In Stock</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Items</h1>
        <p className="subtitle">Manage products and inventory</p>
      </div>
      
      <div className="toolbar">
        <div className="search-box">
          <Icons.Search />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <select 
          className="filter-select" 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="inventory">Inventory</option>
          <option value="non-inventory">Non-Inventory</option>
          <option value="digital">Digital</option>
        </select>
      </div>
      
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Type</th>
                <th style={{textAlign: 'right'}}>Price</th>
                <th style={{textAlign: 'right'}}>Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>
                    <Icons.Loader /> Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#888'}}>
                    No items found
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id}>
                    <td style={{fontFamily: 'monospace'}}>{item.sku}</td>
                    <td><strong>{item.name}</strong></td>
                    <td>
                      <span className="badge badge-gray" style={{textTransform: 'capitalize'}}>
                        {item.item_type}
                      </span>
                    </td>
                    <td style={{textAlign: 'right'}}>{formatCurrency(item.price)}</td>
                    <td style={{textAlign: 'right'}}>
                      {item.item_type === 'inventory' ? item.inventory_quantity : '—'}
                    </td>
                    <td>{getStockBadge(item)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ItemsView;
