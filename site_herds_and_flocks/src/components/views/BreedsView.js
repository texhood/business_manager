/**
 * BreedsView - Manage breed definitions
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { lookupsService } from '../../services/api';

const BreedsView = () => {
  const [breeds, setBreeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterSpecies, setFilterSpecies] = useState('');
  const [form, setForm] = useState({
    name: '',
    species: 'Cattle',
    description: ''
  });

  const speciesList = ['Cattle', 'Sheep', 'Goat', 'Poultry', 'Swine', 'Other'];

  useEffect(() => {
    loadBreeds();
  }, [filterSpecies]);

  const loadBreeds = async () => {
    try {
      setLoading(true);
      const data = await lookupsService.getBreeds(filterSpecies || undefined);
      setBreeds(data);
    } catch (err) {
      setError('Failed to load breeds');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await lookupsService.createBreed(form);
      setShowForm(false);
      setForm({ name: '', species: 'Cattle', description: '' });
      loadBreeds();
    } catch (err) {
      setError('Failed to save breed');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm({ name: '', species: 'Cattle', description: '' });
  };

  // Group breeds by species
  const breedsBySpecies = breeds.reduce((acc, breed) => {
    const species = breed.species || 'Other';
    if (!acc[species]) acc[species] = [];
    acc[species].push(breed);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="loading-state">
        <Icons.Loader className="animate-spin" />
        <p>Loading breeds...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Breeds</h1>
          <p className="subtitle">Manage breed definitions for your livestock</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Icons.Plus /> Add Breed
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
            <h2>Add Breed</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Breed Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Angus, Suffolk, Leghorn"
                  />
                </div>
                <div className="form-group">
                  <label>Species *</label>
                  <select
                    required
                    value={form.species}
                    onChange={(e) => setForm({ ...form, species: e.target.value })}
                  >
                    {speciesList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Optional description of this breed"
                    rows={2}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Breed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ margin: 0, fontWeight: 500 }}>Filter by Species:</label>
            <select
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
              style={{ width: '200px' }}
            >
              <option value="">All Species</option>
              {speciesList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {breeds.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <Icons.Tag />
              <h3>No breeds defined</h3>
              <p>Add breeds to categorize your livestock</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <Icons.Plus /> Add First Breed
              </button>
            </div>
          </div>
        </div>
      ) : filterSpecies ? (
        // Single species view
        <div className="card">
          <div className="card-header">
            <h2>{filterSpecies} Breeds</h2>
            <span className="badge">{breeds.length}</span>
          </div>
          <div className="card-body">
            <div className="breeds-grid">
              {breeds.map((breed) => (
                <div key={breed.id} className="breed-card">
                  <h4>{breed.name}</h4>
                  {breed.description && <p className="text-muted">{breed.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // All species grouped view
        Object.entries(breedsBySpecies).map(([species, speciesBreeds]) => (
          <div key={species} className="card" style={{ marginBottom: '16px' }}>
            <div className="card-header">
              <h2>{species}</h2>
              <span className="badge">{speciesBreeds.length}</span>
            </div>
            <div className="card-body">
              <div className="breeds-grid">
                {speciesBreeds.map((breed) => (
                  <div key={breed.id} className="breed-card">
                    <h4>{breed.name}</h4>
                    {breed.description && <p className="text-muted">{breed.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}

      <style>{`
        .breeds-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }
        .breed-card {
          padding: 12px 16px;
          background: var(--gray-50);
          border-radius: 8px;
          border: 1px solid var(--gray-200);
        }
        .breed-card h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
        }
        .breed-card p {
          margin: 0;
          font-size: 12px;
        }
        .card-header .badge {
          background: var(--gray-200);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default BreedsView;
