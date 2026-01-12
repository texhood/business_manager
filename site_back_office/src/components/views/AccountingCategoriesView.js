/**
 * AccountingCategoriesView Component
 * Manage accounting categories for transaction classification
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { accountingCategoriesService } from '../../services/api';

const AccountingCategoriesView = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    description: '',
    is_active: true,
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await accountingCategoriesService.getAll();
      setCategories(Array.isArray(result) ? result : result.data || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCategory) {
        await accountingCategoriesService.update(editCategory.id, formData);
        setMessage({ type: 'success', text: 'Category updated' });
      } else {
        await accountingCategoriesService.create(formData);
        setMessage({ type: 'success', text: 'Category created' });
      }
      setShowForm(false);
      setEditCategory(null);
      setFormData({ name: '', type: 'expense', description: '', is_active: true });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save category' });
    }
  };

  const handleEdit = (category) => {
    setEditCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      description: category.description || '',
      is_active: category.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await accountingCategoriesService.delete(id);
      setMessage({ type: 'success', text: 'Category deleted' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete category' });
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="page">
      <div className="page-header">
        <h1>Accounting Categories</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditCategory(null); setFormData({ name: '', type: 'expense', description: '', is_active: true }); }}>
          <Icons.Plus /> Add Category
        </button>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', borderRadius: 6, marginBottom: 20, backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4', color: message.type === 'error' ? '#dc2626' : '#16a34a' }}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h2>{editCategory ? 'Edit Category' : 'New Category'}</h2>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Name *</label>
                <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Type *</label>
                <select className="form-control" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Description</label>
                <input type="text" className="form-control" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditCategory(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Icons.Loader /> Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#d1fae5' }}>
              <h2 style={{ color: '#059669' }}>Income Categories</h2>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Name</th><th>Description</th><th style={{ width: 100 }}>Actions</th></tr>
                </thead>
                <tbody>
                  {incomeCategories.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#888' }}>No income categories</td></tr>
                  ) : (
                    incomeCategories.map(cat => (
                      <tr key={cat.id}>
                        <td>{cat.name}</td>
                        <td style={{ color: '#666' }}>{cat.description || '—'}</td>
                        <td>
                          <button className="btn btn-sm" onClick={() => handleEdit(cat)}><Icons.Edit /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cat.id)}><Icons.Trash /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#fee2e2' }}>
              <h2 style={{ color: '#dc2626' }}>Expense Categories</h2>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Name</th><th>Description</th><th style={{ width: 100 }}>Actions</th></tr>
                </thead>
                <tbody>
                  {expenseCategories.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#888' }}>No expense categories</td></tr>
                  ) : (
                    expenseCategories.map(cat => (
                      <tr key={cat.id}>
                        <td>{cat.name}</td>
                        <td style={{ color: '#666' }}>{cat.description || '—'}</td>
                        <td>
                          <button className="btn btn-sm" onClick={() => handleEdit(cat)}><Icons.Edit /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cat.id)}><Icons.Trash /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingCategoriesView;
