/**
 * AnimalCategoriesView - Manage animal category definitions
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { lookupsService } from '../../services/api';

const AnimalCategoriesView = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await lookupsService.getAnimalCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await lookupsService.createAnimalCategory(form);
      setShowForm(false);
      setForm({ name: '', description: '' });
      loadCategories();
    } catch (err) {
      setError('Failed to save category');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm({ name: '', description: '' });
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Icons.Loader className="animate-spin" />
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Animal Categories</h1>
          <p className="subtitle">Categorize animals by purpose: Breeders, For Sale, Harvested, etc.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Icons.Plus /> Add Category
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <Icons.AlertCircle />
          {error}
          <button onClick={() => setError(null)}><Icons.X /></button>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2>Add Category</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Breeder, For Sale, Harvested"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description of this category"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          {categories.length === 0 ? (
            <div className="empty-state">
              <Icons.Grid />
              <h3>No categories defined</h3>
              <p>Add categories to organize your animals by purpose</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <Icons.Plus /> Add First Category
              </button>
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map((category) => (
                <div key={category.id} className="category-card">
                  <div className="category-icon">
                    <Icons.Tag />
                  </div>
                  <div className="category-content">
                    <h4>{category.name}</h4>
                    {category.description && <p>{category.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .category-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: var(--gray-50);
          border-radius: 8px;
          border: 1px solid var(--gray-200);
        }
        .category-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary-light);
          color: var(--primary);
          border-radius: 8px;
        }
        .category-icon svg {
          width: 20px;
          height: 20px;
        }
        .category-content h4 {
          margin: 0 0 4px 0;
          font-size: 15px;
          font-weight: 600;
        }
        .category-content p {
          margin: 0;
          font-size: 13px;
          color: var(--gray-600);
        }
      `}</style>
    </div>
  );
};

export default AnimalCategoriesView;
