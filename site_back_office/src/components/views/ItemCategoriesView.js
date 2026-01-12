/**
 * ItemCategoriesView Component
 * Manage item/product categories (Beef, Chicken, Eggs, etc.)
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { categoriesService } from '../../services/api';

const ItemCategoriesView = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 0,
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await categoriesService.getAll(true); // Include inactive
      setCategories(Array.isArray(result) ? result : []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      sort_order: categories.length,
    });
    setEditCategory(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCategory) {
        await categoriesService.update(editCategory.id, formData);
        setMessage({ type: 'success', text: 'Category updated' });
      } else {
        await categoriesService.create(formData);
        setMessage({ type: 'success', text: 'Category created' });
      }
      resetForm();
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save category' });
    }
  };

  const handleEdit = (category) => {
    setEditCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug || '',
      description: category.description || '',
      sort_order: category.sort_order || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await categoriesService.delete(category.id);
      setMessage({ type: 'success', text: 'Category deleted' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete category' });
    }
  };

  const handleToggleActive = async (category) => {
    try {
      await categoriesService.update(category.id, { is_active: !category.is_active });
      setMessage({ type: 'success', text: `Category ${category.is_active ? 'deactivated' : 'activated'}` });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update category status' });
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, name, slug: editCategory ? formData.slug : slug });
  };

  // Auto-clear messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const activeCategories = categories.filter(c => c.is_active);
  const inactiveCategories = categories.filter(c => !c.is_active);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Item Categories</h1>
          <p className="subtitle">Organize products into categories for easy browsing</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => { resetForm(); setFormData({ ...formData, sort_order: categories.length }); setShowForm(true); }}
        >
          <Icons.Plus /> Add Category
        </button>
      </div>

      {message && (
        <div style={{ 
          padding: '12px 16px', 
          borderRadius: 6, 
          marginBottom: 20, 
          backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4', 
          color: message.type === 'error' ? '#dc2626' : '#16a34a',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          {message.type === 'error' ? <Icons.AlertCircle size={18} /> : <Icons.Check size={18} />}
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h2>{editCategory ? 'Edit Category' : 'New Category'}</h2>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                  Name *
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.name} 
                  onChange={(e) => handleNameChange(e.target.value)} 
                  placeholder="e.g., Beef, Chicken, Eggs"
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                  Slug
                  <span style={{ fontWeight: 400, color: '#666', marginLeft: 4 }}>(URL-friendly name)</span>
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.slug} 
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} 
                  placeholder="auto-generated"
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Description</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  placeholder="Optional description for this category"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Sort Order</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={formData.sort_order} 
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} 
                  min="0"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <button type="submit" className="btn btn-primary">
                {editCategory ? 'Update Category' : 'Create Category'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Icons.Loader /> Loading...
        </div>
      ) : (
        <>
          {/* Active Categories */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header" style={{ backgroundColor: '#dbeafe' }}>
              <h2 style={{ color: '#1d4ed8', margin: 0 }}>
                <Icons.Tag style={{ marginRight: 8 }} />
                Active Categories ({activeCategories.length})
              </h2>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Order</th>
                    <th>Category</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th style={{ width: 80 }}>Items</th>
                    <th style={{ width: 140 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#888' }}>
                        No categories found. Click "Add Category" to create one.
                      </td>
                    </tr>
                  ) : (
                    activeCategories.map(category => (
                      <tr key={category.id}>
                        <td style={{ textAlign: 'center', color: '#888' }}>{category.sort_order}</td>
                        <td><strong>{category.name}</strong></td>
                        <td style={{ color: '#666', fontFamily: 'monospace', fontSize: 13 }}>{category.slug}</td>
                        <td style={{ color: '#666' }}>{category.description || '—'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-blue">{category.item_count || 0}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button 
                              className="btn btn-sm" 
                              onClick={() => handleEdit(category)}
                              title="Edit category"
                            >
                              <Icons.Edit />
                            </button>
                            <button 
                              className="btn btn-sm" 
                              onClick={() => handleToggleActive(category)}
                              title="Deactivate category"
                              style={{ color: '#f59e0b' }}
                            >
                              <Icons.Pause />
                            </button>
                            <button 
                              className="btn btn-sm btn-danger" 
                              onClick={() => handleDelete(category)}
                              title="Delete category"
                            >
                              <Icons.Trash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inactive Categories */}
          {inactiveCategories.length > 0 && (
            <div className="card">
              <div className="card-header" style={{ backgroundColor: '#f3f4f6' }}>
                <h2 style={{ color: '#6b7280', margin: 0 }}>
                  Inactive Categories ({inactiveCategories.length})
                </h2>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>Order</th>
                      <th>Category</th>
                      <th>Slug</th>
                      <th>Description</th>
                      <th style={{ width: 80 }}>Items</th>
                      <th style={{ width: 140 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inactiveCategories.map(category => (
                      <tr key={category.id} style={{ opacity: 0.7 }}>
                        <td style={{ textAlign: 'center', color: '#888' }}>{category.sort_order}</td>
                        <td><strong>{category.name}</strong></td>
                        <td style={{ color: '#666', fontFamily: 'monospace', fontSize: 13 }}>{category.slug}</td>
                        <td style={{ color: '#666' }}>{category.description || '—'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-gray">{category.item_count || 0}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button 
                              className="btn btn-sm" 
                              onClick={() => handleEdit(category)}
                              title="Edit category"
                            >
                              <Icons.Edit />
                            </button>
                            <button 
                              className="btn btn-sm" 
                              onClick={() => handleToggleActive(category)}
                              title="Activate category"
                              style={{ color: '#10b981' }}
                            >
                              <Icons.Play />
                            </button>
                            <button 
                              className="btn btn-sm btn-danger" 
                              onClick={() => handleDelete(category)}
                              title="Delete category"
                            >
                              <Icons.Trash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ItemCategoriesView;
