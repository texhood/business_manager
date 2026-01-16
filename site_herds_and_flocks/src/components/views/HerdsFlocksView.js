/**
 * Herds & Flocks View Component
 * Manage herds and flocks with individual or aggregate animal tracking
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../common/Icons';
import { herdsService, pasturesService, animalsService, lookupsService } from '../../services/api';

// ============================================================================
// HELPER FUNCTIONS FOR DAM/SIRE FILTERING
// ============================================================================

// Breeding female categories by species
const DAM_CATEGORIES = ['Cow', 'Ewe', 'Doe', 'Hen', 'Sow'];

// Breeding male categories by species  
const SIRE_CATEGORIES = ['Bull', 'Ram', 'Buck', 'Rooster', 'Tom', 'Boar'];

/**
 * Get species from animal type ID using lookups
 */
const getSpeciesFromTypeId = (typeId, animalTypes) => {
  if (!typeId) return null;
  const type = animalTypes.find(t => t.id === typeId || t.id === parseInt(typeId));
  return type?.species?.toLowerCase() || null;
};

/**
 * Get species from an animal record
 */
const getAnimalSpecies = (animal, animalTypes) => {
  // First try from animal_type_name which might contain species
  if (animal.animal_type_name) {
    const type = animalTypes.find(t => t.name === animal.animal_type_name);
    if (type) return type.species?.toLowerCase();
  }
  // Fall back to animal_type_id
  return getSpeciesFromTypeId(animal.animal_type_id, animalTypes);
};

/**
 * Filter animals for Dam dropdown (same species, breeding female categories)
 * Dam must be: Cow (cattle), Ewe (sheep), Doe (goat), Hen (poultry), Sow (swine)
 */
const filterDamCandidates = (allAnimals, currentAnimalId, currentSpecies, animalTypes) => {
  return allAnimals.filter(a => {
    // Exclude self
    if (a.id === currentAnimalId) return false;
    
    // MUST have a breeding female category - no category means not eligible
    if (!a.category_name || !DAM_CATEGORIES.includes(a.category_name)) return false;
    
    // Must match species if we know it
    if (currentSpecies) {
      const animalSpecies = getAnimalSpecies(a, animalTypes);
      if (animalSpecies && animalSpecies !== currentSpecies) return false;
    }
    
    return true;
  });
};

/**
 * Filter animals for Sire dropdown (same species, breeding male categories)
 * Sire must be: Bull (cattle), Ram (sheep), Buck (goat), Rooster (poultry), Tom/Boar (swine)
 */
const filterSireCandidates = (allAnimals, currentAnimalId, currentSpecies, animalTypes) => {
  return allAnimals.filter(a => {
    // Exclude self
    if (a.id === currentAnimalId) return false;
    
    // MUST have a breeding male category - no category means not eligible
    if (!a.category_name || !SIRE_CATEGORIES.includes(a.category_name)) return false;
    
    // Must match species if we know it
    if (currentSpecies) {
      const animalSpecies = getAnimalSpecies(a, animalTypes);
      if (animalSpecies && animalSpecies !== currentSpecies) return false;
    }
    
    return true;
  });
};

// ============================================================================
// HERD/FLOCK MODAL
// ============================================================================

const HerdFlockModal = ({ herd, pastures, onSave, onClose }) => {
  const [form, setForm] = useState(herd || { 
    species: 'cattle', 
    management_mode: 'individual',
    is_active: true 
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{herd ? 'Edit Herd/Flock' : 'Add Herd/Flock'}</h2>
          <button className="modal-close" onClick={onClose}><Icons.X /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  required
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Species *</label>
                <select
                  required
                  value={form.species || 'cattle'}
                  onChange={(e) => setForm({ ...form, species: e.target.value })}
                >
                  <option value="cattle">Cattle</option>
                  <option value="sheep">Sheep</option>
                  <option value="goat">Goat</option>
                  <option value="poultry">Poultry</option>
                  <option value="swine">Swine</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Management Mode *</label>
              <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                <label className="form-checkbox">
                  <input
                    type="radio"
                    name="management_mode"
                    value="individual"
                    checked={form.management_mode === 'individual'}
                    onChange={(e) => setForm({ ...form, management_mode: e.target.value })}
                  />
                  Individual (track each animal)
                </label>
                <label className="form-checkbox">
                  <input
                    type="radio"
                    name="management_mode"
                    value="aggregate"
                    checked={form.management_mode === 'aggregate'}
                    onChange={(e) => setForm({ ...form, management_mode: e.target.value })}
                  />
                  Aggregate (track count only)
                </label>
              </div>
              <p className="form-hint" style={{ marginTop: '8px' }}>
                {form.management_mode === 'individual' 
                  ? 'Animals will be tracked individually and assigned to this herd/flock.'
                  : 'Only the total count is tracked. Individual animals are not recorded.'}
              </p>
            </div>

            {form.management_mode === 'aggregate' && (
              <div className="form-group">
                <label>Animal Count</label>
                <input
                  type="number"
                  min="0"
                  value={form.animal_count || 0}
                  onChange={(e) => setForm({ ...form, animal_count: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}

            <div className="form-group">
              <label>Current Pasture</label>
              <select
                value={form.current_pasture_id || ''}
                onChange={(e) => setForm({ ...form, current_pasture_id: e.target.value || null })}
              >
                <option value="">No pasture assigned</option>
                {pastures.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                rows="3"
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={form.is_active !== false}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Active
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// ASSIGN ANIMALS MODAL
// ============================================================================

const AssignAnimalsModal = ({ herd, onSave, onClose }) => {
  const [allAnimals, setAllAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('unassigned'); // 'unassigned', 'all', 'other'

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    setLoading(true);
    try {
      const data = await animalsService.getAll({ limit: 1000, status: 'Active' });
      setAllAnimals(data.data || []);
    } catch (err) {
      console.error('Failed to load animals:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimals = allAnimals.filter(a => {
    // Search filter
    const matchesSearch = !search || 
      a.ear_tag?.toLowerCase().includes(search.toLowerCase()) ||
      a.name?.toLowerCase().includes(search.toLowerCase());
    
    // Assignment filter
    let matchesFilter = true;
    if (filterMode === 'unassigned') {
      matchesFilter = !a.herd_id;
    } else if (filterMode === 'other') {
      matchesFilter = a.herd_id && a.herd_id !== herd.id;
    }
    // 'all' shows everything
    
    return matchesSearch && matchesFilter;
  });

  const toggleSelect = (id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredAnimals.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredAnimals.map(a => a.id)));
    }
  };

  const handleAssign = async () => {
    if (selected.size === 0) return;
    
    setSaving(true);
    try {
      // Update each selected animal's herd_id
      const promises = Array.from(selected).map(id => 
        animalsService.update(id, { herd_id: herd.id })
      );
      await Promise.all(promises);
      onSave();
    } catch (err) {
      console.error('Failed to assign animals:', err);
      alert('Failed to assign some animals. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assign Animals to {herd.name}</h2>
          <button className="modal-close" onClick={onClose}><Icons.X /></button>
        </div>
        
        <div className="modal-body" style={{ padding: 0 }}>
          {/* Toolbar */}
          <div className="assign-toolbar">
            <div className="search-box">
              <Icons.Search />
              <input
                type="text"
                placeholder="Search by tag or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-pills">
              <button 
                className={`filter-pill ${filterMode === 'unassigned' ? 'active' : ''}`}
                onClick={() => setFilterMode('unassigned')}
              >
                Unassigned
              </button>
              <button 
                className={`filter-pill ${filterMode === 'other' ? 'active' : ''}`}
                onClick={() => setFilterMode('other')}
              >
                Other Herds
              </button>
              <button 
                className={`filter-pill ${filterMode === 'all' ? 'active' : ''}`}
                onClick={() => setFilterMode('all')}
              >
                All Active
              </button>
            </div>
            <div className="selection-info">
              {selected.size} selected
            </div>
          </div>

          {/* Animals List */}
          <div className="assign-list-container">
            {loading ? (
              <div className="loading-state">
                <Icons.Loader className="animate-spin" />
                <p>Loading animals...</p>
              </div>
            ) : filteredAnimals.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px' }}>
                <Icons.Tag />
                <h3>No animals found</h3>
                <p>{filterMode === 'unassigned' ? 'All active animals are already assigned to herds' : 'No animals match your search'}</p>
              </div>
            ) : (
              <table className="assign-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input 
                        type="checkbox" 
                        checked={selected.size === filteredAnimals.length && filteredAnimals.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>Tag</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Current Herd</th>
                    <th>Birth Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnimals.map((animal) => (
                    <tr 
                      key={animal.id} 
                      className={selected.has(animal.id) ? 'selected' : ''}
                      onClick={() => toggleSelect(animal.id)}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selected.has(animal.id)}
                          onChange={() => toggleSelect(animal.id)}
                        />
                      </td>
                      <td><strong style={{ color: '#7A8B6E' }}>{animal.ear_tag}</strong></td>
                      <td>{animal.name || '—'}</td>
                      <td>{animal.animal_type_name || '—'}</td>
                      <td>
                        {animal.herd_name ? (
                          <span className="badge badge-gray">{animal.herd_name}</span>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>Unassigned</span>
                        )}
                      </td>
                      <td>{formatDate(animal.birth_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            type="button" 
            className="btn btn-primary" 
            disabled={saving || selected.size === 0}
            onClick={handleAssign}
          >
            {saving ? 'Assigning...' : `Assign ${selected.size} Animal${selected.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ANIMAL DETAIL VIEW (Embedded version for herd context)
// ============================================================================

const AnimalDetailView = ({ animal, onBack, onUpdate, onDelete, lookups, allAnimals, backLabel }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...animal });
  const [saving, setSaving] = useState(false);
  const [activeSubtab, setActiveSubtab] = useState('health');

  // Child records
  const [healthRecords, setHealthRecords] = useState([]);
  const [weights, setWeights] = useState([]);
  const [offspring, setOffspring] = useState([]);
  const [childLoading, setChildLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  // Load child records based on active subtab
  const loadChildRecords = useCallback(async () => {
    setChildLoading(true);
    try {
      if (activeSubtab === 'health') {
        const data = await animalsService.getHealthRecords(animal.id);
        setHealthRecords(data || []);
      } else if (activeSubtab === 'weights') {
        const data = await animalsService.getWeights(animal.id);
        setWeights(data || []);
      } else if (activeSubtab === 'offspring') {
        const offspringList = allAnimals.filter(a => 
          a.dam_id === animal.id || a.sire_id === animal.id
        );
        setOffspring(offspringList);
      }
    } catch (err) {
      console.error('Failed to load child records:', err);
    } finally {
      setChildLoading(false);
    }
  }, [animal.id, activeSubtab, allAnimals]);

  useEffect(() => {
    loadChildRecords();
  }, [loadChildRecords]);

  const handleSaveHeader = async () => {
    setSaving(true);
    try {
      await onUpdate(animal.id, editForm);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save animal:', err);
    } finally {
      setSaving(false);
    }
  };

  const openAddModal = (type) => {
    setModalType(type);
    setEditingRecord(null);
    setShowModal(true);
  };

  const openEditModal = (type, record) => {
    setModalType(type);
    setEditingRecord(record);
    setShowModal(true);
  };

  const handleModalSave = async (data) => {
    try {
      if (modalType === 'health') {
        if (editingRecord) {
          await animalsService.updateHealthRecord(editingRecord.id, data);
        } else {
          await animalsService.createHealthRecord(animal.id, data);
        }
      } else if (modalType === 'weight') {
        if (editingRecord) {
          await animalsService.updateWeight(editingRecord.id, data);
        } else {
          await animalsService.createWeight(animal.id, data);
        }
      }
      setShowModal(false);
      loadChildRecords();
    } catch (err) {
      console.error('Failed to save record:', err);
    }
  };

  const handleDeleteRecord = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      if (type === 'health') {
        await animalsService.deleteHealthRecord(id);
      } else if (type === 'weight') {
        await animalsService.deleteWeight(id);
      }
      loadChildRecords();
    } catch (err) {
      console.error('Failed to delete record:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '—';
    const birth = new Date(birthDate);
    const now = new Date();
    const years = Math.floor((now - birth) / (365.25 * 24 * 60 * 60 * 1000));
    const months = Math.floor(((now - birth) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
    if (years > 0) return `${years}y ${months}m`;
    return `${months}m`;
  };

  return (
    <div className="netsuite-record">
      {/* ===== RECORD HEADER BAR ===== */}
      <div className="record-header-bar">
        <button className="btn btn-icon" onClick={onBack} title={backLabel || 'Back'}>
          <Icons.ArrowLeft />
        </button>
        <div className="record-title">
          <div className="breadcrumb-title">
            {backLabel && <span className="breadcrumb-label">{backLabel} /</span>}
            <h1>{animal.ear_tag}{animal.name ? ` - ${animal.name}` : ''}</h1>
          </div>
          <span className={`status-badge status-${animal.status?.toLowerCase()}`}>
            {animal.status}
          </span>
        </div>
        <div className="record-actions">
          {!isEditing ? (
            <>
              <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                <Icons.Edit /> Edit
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this animal?')) {
                    onDelete(animal.id);
                  }
                }}
              >
                <Icons.Trash /> Delete
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => { setIsEditing(false); setEditForm({ ...animal }); }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveHeader} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===== PRIMARY INFORMATION ===== */}
      <div className="record-primary-info">
        {isEditing ? (
          <div className="primary-fields-grid editing">
            <div className="field-group">
              <label>Ear Tag <span className="required">*</span></label>
              <input
                type="text"
                required
                value={editForm.ear_tag || ''}
                onChange={(e) => setEditForm({ ...editForm, ear_tag: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label>Name</label>
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label>Animal Type</label>
              <select
                value={editForm.animal_type_id || ''}
                onChange={(e) => setEditForm({ ...editForm, animal_type_id: e.target.value || null })}
              >
                <option value="">Select type...</option>
                {lookups.animalTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.species})</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>Breed</label>
              <select
                value={editForm.breed_id || ''}
                onChange={(e) => setEditForm({ ...editForm, breed_id: e.target.value || null })}
              >
                <option value="">Select breed...</option>
                {lookups.breeds.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>Category</label>
              <select
                value={editForm.category_id || ''}
                onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value || null })}
              >
                <option value="">Select category...</option>
                {lookups.categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>Status</label>
              <select
                value={editForm.status || 'Active'}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Sold">Sold</option>
                <option value="Dead">Dead</option>
                <option value="Processed">Processed</option>
                <option value="Reference">Reference</option>
              </select>
            </div>
            <div className="field-group">
              <label>Herd/Flock</label>
              <select
                value={editForm.herd_id || ''}
                onChange={(e) => setEditForm({ ...editForm, herd_id: e.target.value || null })}
              >
                <option value="">No herd assigned</option>
                {lookups.herds.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>Current Pasture</label>
              <select
                value={editForm.current_pasture_id || ''}
                onChange={(e) => setEditForm({ ...editForm, current_pasture_id: e.target.value || null })}
              >
                <option value="">No pasture assigned</option>
                {lookups.pastures.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>Birth Date</label>
              <input
                type="date"
                value={editForm.birth_date ? editForm.birth_date.split('T')[0] : ''}
                onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value || null })}
              />
            </div>
            <div className="field-group">
              <label>Color/Markings</label>
              <input
                type="text"
                value={editForm.color_markings || ''}
                onChange={(e) => setEditForm({ ...editForm, color_markings: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label>Owner</label>
              <select
                value={editForm.owner_id || ''}
                onChange={(e) => setEditForm({ ...editForm, owner_id: e.target.value || null })}
              >
                <option value="">Select owner...</option>
                {lookups.owners.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>Dam</label>
              <select
                value={editForm.dam_id || ''}
                onChange={(e) => setEditForm({ ...editForm, dam_id: e.target.value || null })}
              >
                <option value="">Select dam...</option>
                {filterDamCandidates(
                  allAnimals, 
                  animal.id, 
                  getSpeciesFromTypeId(editForm.animal_type_id, lookups.animalTypes),
                  lookups.animalTypes
                ).map((a) => (
                  <option key={a.id} value={a.id}>{a.ear_tag} {a.name ? `(${a.name})` : ''} - {a.category_name || 'Unknown'}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>Sire</label>
              <select
                value={editForm.sire_id || ''}
                onChange={(e) => setEditForm({ ...editForm, sire_id: e.target.value || null })}
              >
                <option value="">Select sire...</option>
                {filterSireCandidates(
                  allAnimals, 
                  animal.id, 
                  getSpeciesFromTypeId(editForm.animal_type_id, lookups.animalTypes),
                  lookups.animalTypes
                ).map((a) => (
                  <option key={a.id} value={a.id}>{a.ear_tag} {a.name ? `(${a.name})` : ''} - {a.category_name || 'Unknown'}</option>
                ))}
              </select>
            </div>
            <div className="field-group full-width">
              <label>Notes</label>
              <textarea
                rows="2"
                value={editForm.notes || ''}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
          </div>
        ) : (
          <div className="primary-fields-grid">
            <div className="field-group">
              <label>Ear Tag</label>
              <div className="field-value primary">{animal.ear_tag}</div>
            </div>
            <div className="field-group">
              <label>Name</label>
              <div className="field-value">{animal.name || '—'}</div>
            </div>
            <div className="field-group">
              <label>Type</label>
              <div className="field-value">{animal.animal_type_name || '—'}</div>
            </div>
            <div className="field-group">
              <label>Breed</label>
              <div className="field-value">{animal.breed_name || '—'}</div>
            </div>
            <div className="field-group">
              <label>Category</label>
              <div className="field-value">{animal.category_name || '—'}</div>
            </div>
            <div className="field-group">
              <label>Owner</label>
              <div className="field-value">{animal.owner_name || '—'}</div>
            </div>
            <div className="field-group">
              <label>Herd/Flock</label>
              <div className="field-value">{animal.herd_name || '—'}</div>
            </div>
            <div className="field-group">
              <label>Pasture</label>
              <div className="field-value">{animal.pasture_name || '—'}</div>
            </div>
            <div className="field-group">
              <label>Birth Date</label>
              <div className="field-value">{formatDate(animal.birth_date)}</div>
            </div>
            <div className="field-group">
              <label>Age</label>
              <div className="field-value">{calculateAge(animal.birth_date)}</div>
            </div>
            <div className="field-group">
              <label>Color/Markings</label>
              <div className="field-value">{animal.color_markings || '—'}</div>
            </div>
            <div className="field-group">
              <label>Dam</label>
              <div className="field-value">
                {animal.dam_ear_tag ? (
                  <span className="link-text">{animal.dam_ear_tag} {animal.dam_name ? `(${animal.dam_name})` : ''}</span>
                ) : '—'}
              </div>
            </div>
            <div className="field-group">
              <label>Sire</label>
              <div className="field-value">
                {animal.sire_ear_tag ? (
                  <span className="link-text">{animal.sire_ear_tag} {animal.sire_name ? `(${animal.sire_name})` : ''}</span>
                ) : '—'}
              </div>
            </div>
            {animal.notes && (
              <div className="field-group full-width">
                <label>Notes</label>
                <div className="field-value">{animal.notes}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== SUBTABS SECTION ===== */}
      <div className="record-subtabs-section">
        <div className="subtabs-header">
          <div className="subtabs-nav">
            <button 
              className={`subtab ${activeSubtab === 'health' ? 'active' : ''}`}
              onClick={() => setActiveSubtab('health')}
            >
              <Icons.Stethoscope />
              Health Records
              <span className="subtab-count">{healthRecords.length}</span>
            </button>
            <button 
              className={`subtab ${activeSubtab === 'weights' ? 'active' : ''}`}
              onClick={() => setActiveSubtab('weights')}
            >
              <Icons.Scale />
              Weight Tracking
              <span className="subtab-count">{weights.length}</span>
            </button>
            <button 
              className={`subtab ${activeSubtab === 'offspring' ? 'active' : ''}`}
              onClick={() => setActiveSubtab('offspring')}
            >
              <Icons.Users />
              Offspring
              <span className="subtab-count">{offspring.length}</span>
            </button>
          </div>
          {(activeSubtab === 'health' || activeSubtab === 'weights') && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => openAddModal(activeSubtab === 'health' ? 'health' : 'weight')}
            >
              <Icons.Plus /> Add {activeSubtab === 'health' ? 'Health Record' : 'Weight'}
            </button>
          )}
        </div>

        <div className="subtab-content">
          {childLoading ? (
            <div className="loading-state">
              <Icons.Loader className="animate-spin" />
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {/* Health Records Subtab */}
              {activeSubtab === 'health' && (
                healthRecords.length === 0 ? (
                  <div className="empty-subtab">
                    <Icons.Stethoscope />
                    <p>No health records found</p>
                    <button className="btn btn-secondary btn-sm" onClick={() => openAddModal('health')}>
                      <Icons.Plus /> Add First Record
                    </button>
                  </div>
                ) : (
                  <table className="subtab-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Administered By</th>
                        <th>Next Due</th>
                        <th className="actions-col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {healthRecords.map((record) => (
                        <tr key={record.id}>
                          <td>{formatDate(record.record_date)}</td>
                          <td>
                            <span className={`badge badge-${
                              record.record_type === 'vaccination' ? 'green' : 
                              record.record_type === 'treatment' ? 'yellow' : 
                              record.record_type === 'illness' ? 'red' : 'blue'
                            }`}>
                              {record.record_type}
                            </span>
                          </td>
                          <td>{record.description}</td>
                          <td>{record.administered_by || '—'}</td>
                          <td>
                            {record.next_due_date ? (
                              <span className={new Date(record.next_due_date) < new Date() ? 'overdue' : ''}>
                                {formatDate(record.next_due_date)}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="actions-col">
                            <button className="btn btn-icon btn-sm" onClick={() => openEditModal('health', record)} title="Edit">
                              <Icons.Edit />
                            </button>
                            <button className="btn btn-icon btn-sm" onClick={() => handleDeleteRecord('health', record.id)} title="Delete">
                              <Icons.Trash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}

              {/* Weight Tracking Subtab */}
              {activeSubtab === 'weights' && (
                weights.length === 0 ? (
                  <div className="empty-subtab">
                    <Icons.Scale />
                    <p>No weight records found</p>
                    <button className="btn btn-secondary btn-sm" onClick={() => openAddModal('weight')}>
                      <Icons.Plus /> Add First Weight
                    </button>
                  </div>
                ) : (
                  <table className="subtab-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Weight (lbs)</th>
                        <th>Change</th>
                        <th>Notes</th>
                        <th className="actions-col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weights.map((record, index) => {
                        const prevWeight = weights[index + 1]?.weight_lbs;
                        const change = prevWeight ? (record.weight_lbs - prevWeight).toFixed(1) : null;
                        return (
                          <tr key={record.id}>
                            <td>{formatDate(record.weight_date)}</td>
                            <td><strong>{record.weight_lbs} lbs</strong></td>
                            <td>
                              {change !== null ? (
                                <span className={`weight-change ${parseFloat(change) >= 0 ? 'gain' : 'loss'}`}>
                                  {parseFloat(change) >= 0 ? '+' : ''}{change} lbs
                                </span>
                              ) : '—'}
                            </td>
                            <td>{record.notes || '—'}</td>
                            <td className="actions-col">
                              <button className="btn btn-icon btn-sm" onClick={() => openEditModal('weight', record)} title="Edit">
                                <Icons.Edit />
                              </button>
                              <button className="btn btn-icon btn-sm" onClick={() => handleDeleteRecord('weight', record.id)} title="Delete">
                                <Icons.Trash />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )
              )}

              {/* Offspring Subtab */}
              {activeSubtab === 'offspring' && (
                offspring.length === 0 ? (
                  <div className="empty-subtab">
                    <Icons.Users />
                    <p>No offspring recorded</p>
                    <span className="hint">Offspring are linked via Dam or Sire fields on animal records</span>
                  </div>
                ) : (
                  <table className="subtab-table">
                    <thead>
                      <tr>
                        <th>Tag</th>
                        <th>Name</th>
                        <th>Relationship</th>
                        <th>Type</th>
                        <th>Birth Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offspring.map((child) => (
                        <tr key={child.id}>
                          <td><strong className="link-text">{child.ear_tag}</strong></td>
                          <td>{child.name || '—'}</td>
                          <td>
                            <span className={`badge ${child.dam_id === animal.id ? 'badge-pink' : 'badge-blue'}`}>
                              {child.dam_id === animal.id ? 'Dam' : 'Sire'}
                            </span>
                          </td>
                          <td>{child.animal_type_name || '—'}</td>
                          <td>{formatDate(child.birth_date)}</td>
                          <td>
                            <span className={`badge badge-${child.status === 'Active' ? 'green' : child.status === 'Sold' ? 'blue' : child.status === 'Dead' ? 'red' : child.status === 'Processed' ? 'purple' : 'gray'}`}>
                              {child.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* Record Modal */}
      {showModal && (
        <RecordModal
          type={modalType}
          record={editingRecord}
          onSave={handleModalSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

// ============================================================================
// RECORD MODAL (for health/weight)
// ============================================================================

const RecordModal = ({ type, record, onSave, onClose }) => {
  const [form, setForm] = useState(record || {});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{record ? 'Edit' : 'Add'} {type === 'health' ? 'Health Record' : 'Weight'}</h2>
          <button className="modal-close" onClick={onClose}><Icons.X /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {type === 'health' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date <span className="required">*</span></label>
                    <input
                      type="date"
                      required
                      value={form.record_date ? form.record_date.split('T')[0] : ''}
                      onChange={(e) => setForm({ ...form, record_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Type <span className="required">*</span></label>
                    <select
                      required
                      value={form.record_type || ''}
                      onChange={(e) => setForm({ ...form, record_type: e.target.value })}
                    >
                      <option value="">Select type...</option>
                      <option value="vaccination">Vaccination</option>
                      <option value="treatment">Treatment</option>
                      <option value="illness">Illness</option>
                      <option value="checkup">Checkup</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description <span className="required">*</span></label>
                  <textarea
                    rows="3"
                    required
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Administered By</label>
                    <input
                      type="text"
                      value={form.administered_by || ''}
                      onChange={(e) => setForm({ ...form, administered_by: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Next Due Date</label>
                    <input
                      type="date"
                      value={form.next_due_date ? form.next_due_date.split('T')[0] : ''}
                      onChange={(e) => setForm({ ...form, next_due_date: e.target.value || null })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    rows="2"
                    value={form.notes || ''}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </>
            )}

            {type === 'weight' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date <span className="required">*</span></label>
                    <input
                      type="date"
                      required
                      value={form.weight_date ? form.weight_date.split('T')[0] : ''}
                      onChange={(e) => setForm({ ...form, weight_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Weight (lbs) <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={form.weight_lbs || ''}
                      onChange={(e) => setForm({ ...form, weight_lbs: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    rows="2"
                    value={form.notes || ''}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// HERD DETAIL VIEW - Shows animals in the herd
// ============================================================================

const HerdDetailView = ({ herd, onBack, onEdit, onDelete, onSelectAnimal, onRefresh }) => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  const loadAnimals = useCallback(async () => {
    setLoading(true);
    try {
      const params = { herd_id: herd.id, limit: 1000 };
      const data = await animalsService.getAll(params);
      setAnimals(data.data || []);
    } catch (err) {
      console.error('Failed to load animals:', err);
    } finally {
      setLoading(false);
    }
  }, [herd.id]);

  useEffect(() => {
    loadAnimals();
  }, [loadAnimals]);

  const getSpeciesIcon = (species) => {
    switch (species?.toLowerCase()) {
      case 'cattle': return <Icons.Cow />;
      case 'sheep': return <Icons.Sheep />;
      case 'poultry': return <Icons.Chicken />;
      default: return <Icons.Tag />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
  };

  // Count animals by status
  const statusCounts = animals.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const filteredAnimals = animals.filter(a => {
    const matchesStatus = !statusFilter || a.status === statusFilter;
    const matchesSearch = !search || 
      a.ear_tag?.toLowerCase().includes(search.toLowerCase()) ||
      a.name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAssignComplete = () => {
    setShowAssignModal(false);
    loadAnimals();
    if (onRefresh) onRefresh();
  };

  return (
    <div className="netsuite-record">
      {/* Header Bar */}
      <div className="record-header-bar">
        <button className="btn btn-icon" onClick={onBack} title="Back to list">
          <Icons.ArrowLeft />
        </button>
        <div className="record-title">
          <h1>{herd.name}</h1>
          <span className={`badge ${herd.is_active ? 'badge-green' : 'badge-gray'}`}>
            {herd.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="record-actions">
          <button className="btn btn-secondary" onClick={() => onEdit(herd)}>
            <Icons.Edit /> Edit
          </button>
          <button className="btn btn-danger" onClick={() => onDelete(herd)}>
            <Icons.Trash /> Delete
          </button>
        </div>
      </div>

      {/* Herd Info Card */}
      <div className="record-primary-info">
        <div className="primary-fields-grid">
          <div className="field-group">
            <label>Species</label>
            <div className="field-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getSpeciesIcon(herd.species)}
              <span style={{ textTransform: 'capitalize' }}>{herd.species}</span>
            </div>
          </div>
          <div className="field-group">
            <label>Management Mode</label>
            <div className="field-value">
              <span className={`badge ${herd.management_mode === 'individual' ? 'badge-blue' : 'badge-yellow'}`}>
                {herd.management_mode === 'individual' ? 'Individual' : 'Aggregate'}
              </span>
            </div>
          </div>
          <div className="field-group">
            <label>Current Pasture</label>
            <div className="field-value">{herd.pasture_name || '—'}</div>
          </div>
          <div className="field-group">
            <label>Animal Count</label>
            <div className="field-value primary">{animals.length} head</div>
          </div>
          {herd.description && (
            <div className="field-group full-width">
              <label>Description</label>
              <div className="field-value">{herd.description}</div>
            </div>
          )}
        </div>
      </div>

      {/* Animals Section */}
      <div className="record-subtabs-section">
        <div className="subtabs-header">
          <div className="subtabs-nav">
            <button className="subtab active">
              <Icons.Tag />
              Animals
              <span className="subtab-count">{animals.length}</span>
            </button>
          </div>
          {herd.management_mode === 'individual' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAssignModal(true)}>
              <Icons.Plus /> Assign Animals
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="status-filter-bar">
          <button 
            className={`status-pill-btn ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => setStatusFilter('')}
          >
            All <span className="count">{animals.length}</span>
          </button>
          <button 
            className={`status-pill-btn status-active ${statusFilter === 'Active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Active')}
          >
            Active <span className="count">{statusCounts['Active'] || 0}</span>
          </button>
          <button 
            className={`status-pill-btn status-sold ${statusFilter === 'Sold' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Sold')}
          >
            Sold <span className="count">{statusCounts['Sold'] || 0}</span>
          </button>
          <button 
            className={`status-pill-btn status-dead ${statusFilter === 'Dead' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Dead')}
          >
            Dead <span className="count">{statusCounts['Dead'] || 0}</span>
          </button>
          <button 
            className={`status-pill-btn status-processed ${statusFilter === 'Processed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Processed')}
          >
            Processed <span className="count">{statusCounts['Processed'] || 0}</span>
          </button>
          <button 
            className={`status-pill-btn status-reference ${statusFilter === 'Reference' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Reference')}
          >
            Reference <span className="count">{statusCounts['Reference'] || 0}</span>
          </button>
          
          <div className="search-box" style={{ marginLeft: 'auto', flex: '0 0 200px' }}>
            <Icons.Search />
            <input
              type="text"
              placeholder="Search animals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="subtab-content">
          {loading ? (
            <div className="loading-state">
              <Icons.Loader className="animate-spin" />
              <p>Loading animals...</p>
            </div>
          ) : herd.management_mode === 'aggregate' ? (
            <div className="empty-subtab">
              <Icons.Grid />
              <p>Aggregate Tracking Mode</p>
              <span className="hint">This herd tracks animal count only. Individual animals are not recorded.</span>
            </div>
          ) : filteredAnimals.length === 0 ? (
            <div className="empty-subtab">
              <Icons.Tag />
              <p>{statusFilter ? `No ${statusFilter.toLowerCase()} animals found` : 'No animals in this herd'}</p>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAssignModal(true)}>
                <Icons.Plus /> Assign Animals
              </button>
            </div>
          ) : (
            <table className="subtab-table">
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Breed</th>
                  <th>Birth Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnimals.map((animal) => (
                  <tr 
                    key={animal.id} 
                    className="clickable"
                    onClick={() => onSelectAnimal(animal)}
                  >
                    <td><strong style={{ color: '#7A8B6E' }}>{animal.ear_tag}</strong></td>
                    <td>{animal.name || '—'}</td>
                    <td>{animal.animal_type_name || '—'}</td>
                    <td>{animal.breed_name || '—'}</td>
                    <td>{formatDate(animal.birth_date)}</td>
                    <td>
                      <span className={`badge badge-${
                        animal.status === 'Active' ? 'green' : 
                        animal.status === 'Sold' ? 'blue' : 
                        animal.status === 'Dead' ? 'red' : 
                        animal.status === 'Processed' ? 'purple' : 'gray'
                      }`}>
                        {animal.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Assign Animals Modal */}
      {showAssignModal && (
        <AssignAnimalsModal
          herd={herd}
          onSave={handleAssignComplete}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </div>
  );
};

// ============================================================================
// HERDS LIST VIEW
// ============================================================================

const HerdsListView = ({ herds, loading, search, setSearch, speciesFilter, setSpeciesFilter, onAdd, onSelect }) => {
  const getSpeciesIcon = (species) => {
    switch (species?.toLowerCase()) {
      case 'cattle': return <Icons.Cow />;
      case 'sheep': return <Icons.Sheep />;
      case 'poultry': return <Icons.Chicken />;
      default: return <Icons.Tag />;
    }
  };

  const filtered = herds.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
      (h.description && h.description.toLowerCase().includes(search.toLowerCase()));
    const matchesSpecies = !speciesFilter || h.species?.toLowerCase() === speciesFilter.toLowerCase();
    return matchesSearch && matchesSpecies;
  });

  return (
    <div>
      <div className="page-header">
        <h1>Herds & Flocks</h1>
        <p className="subtitle">Manage your animal groups &nbsp;&nbsp; <span style={{ color: '#9ca3af' }}>Click a card to view animals</span></p>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Icons.Search />
          <input
            type="text"
            placeholder="Search herds & flocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
        >
          <option value="">All Species</option>
          <option value="cattle">Cattle</option>
          <option value="sheep">Sheep</option>
          <option value="goat">Goat</option>
          <option value="poultry">Poultry</option>
          <option value="swine">Swine</option>
          <option value="other">Other</option>
        </select>
        <button className="btn btn-primary" onClick={onAdd}>
          <Icons.Plus /> Add Herd/Flock
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-state">
            <Icons.Loader className="animate-spin" />
            <p>Loading herds & flocks...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Icons.Grid />
            <h3>No herds or flocks found</h3>
            <p>Create your first herd or flock to organize your animals</p>
            <button className="btn btn-primary" onClick={onAdd}>
              <Icons.Plus /> Add Herd/Flock
            </button>
          </div>
        ) : (
          <div className="herd-grid" style={{ padding: '20px' }}>
            {filtered.map((herd) => (
              <div 
                key={herd.id} 
                className={`herd-card mode-${herd.management_mode}`}
                onClick={() => onSelect(herd)}
              >
                <div className="herd-card-header">
                  <div>
                    <h3>{herd.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      {getSpeciesIcon(herd.species)}
                      <span style={{ textTransform: 'capitalize', color: '#666' }}>{herd.species}</span>
                    </div>
                  </div>
                  <div className="herd-count">
                    {herd.current_count || 0}
                    <span>head</span>
                  </div>
                </div>
                
                <div className="herd-meta">
                  <span className={`badge ${herd.management_mode === 'individual' ? 'badge-blue' : 'badge-yellow'}`}>
                    {herd.management_mode === 'individual' ? 'Individual' : 'Aggregate'}
                  </span>
                  {herd.pasture_name && (
                    <span className="badge badge-green">
                      <Icons.MapPin style={{ width: '12px', height: '12px' }} /> {herd.pasture_name}
                    </span>
                  )}
                  {!herd.is_active && (
                    <span className="badge badge-gray">Inactive</span>
                  )}
                </div>

                {herd.description && (
                  <p style={{ marginTop: '12px', fontSize: '0.9rem', color: '#666' }}>
                    {herd.description.length > 80 ? herd.description.substring(0, 80) + '...' : herd.description}
                  </p>
                )}

                <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#7A8B6E' }}>
                  Click to view animals →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN HERDS & FLOCKS VIEW
// ============================================================================

const HerdsFlocksView = () => {
  const [herds, setHerds] = useState([]);
  const [pastures, setPastures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingHerd, setEditingHerd] = useState(null);
  const [selectedHerd, setSelectedHerd] = useState(null);
  
  // For animal detail view
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [allAnimals, setAllAnimals] = useState([]);
  const [lookups, setLookups] = useState({
    animalTypes: [],
    breeds: [],
    categories: [],
    owners: [],
    herds: [],
    pastures: []
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [herdsData, pasturesData] = await Promise.all([
        herdsService.getAll(),
        pasturesService.getAll({ active_only: true })
      ]);
      setHerds(herdsData || []);
      setPastures(pasturesData || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    try {
      const [types, breeds, categories, owners, herdsData, pasturesData, animalsData] = await Promise.all([
        lookupsService.getAnimalTypes(),
        lookupsService.getBreeds(),
        lookupsService.getAnimalCategories(),
        lookupsService.getOwners(),
        herdsService.getAll(),
        pasturesService.getAll({ active_only: true }),
        animalsService.getAll({ limit: 1000 })
      ]);
      setLookups({
        animalTypes: types || [],
        breeds: breeds || [],
        categories: categories || [],
        owners: owners || [],
        herds: herdsData || [],
        pastures: pasturesData || []
      });
      setAllAnimals(animalsData.data || []);
    } catch (err) {
      console.error('Failed to load lookups:', err);
    }
  };

  useEffect(() => {
    loadData();
    loadLookups();
  }, []);

  const handleSave = async (data) => {
    try {
      if (editingHerd) {
        await herdsService.update(editingHerd.id, data);
      } else {
        await herdsService.create(data);
      }
      setShowModal(false);
      setEditingHerd(null);
      loadData();
      
      // Refresh selected herd if we're viewing it
      if (selectedHerd && editingHerd && selectedHerd.id === editingHerd.id) {
        setSelectedHerd({ ...selectedHerd, ...data });
      }
    } catch (err) {
      console.error('Failed to save herd/flock:', err);
    }
  };

  const handleDelete = async (herd) => {
    if (!window.confirm(`Are you sure you want to delete "${herd.name}"?`)) return;
    
    try {
      await herdsService.delete(herd.id);
      loadData();
      if (selectedHerd && selectedHerd.id === herd.id) {
        setSelectedHerd(null);
      }
    } catch (err) {
      console.error('Failed to delete herd/flock:', err);
      alert(err.response?.data?.message || 'Failed to delete. There may be animals assigned to this herd/flock.');
    }
  };

  const openEditModal = (herd) => {
    setEditingHerd(herd);
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingHerd(null);
    setShowModal(true);
  };

  const handleSelectAnimal = async (animal) => {
    try {
      const fullAnimal = await animalsService.getById(animal.id);
      setSelectedAnimal(fullAnimal);
    } catch (err) {
      console.error('Failed to load animal details:', err);
      setSelectedAnimal(animal);
    }
  };

  const handleUpdateAnimal = async (id, data) => {
    try {
      const updated = await animalsService.update(id, data);
      setSelectedAnimal(updated);
      loadLookups(); // Refresh all animals list
    } catch (err) {
      console.error('Failed to update animal:', err);
      throw err;
    }
  };

  const handleDeleteAnimal = async (id) => {
    try {
      await animalsService.delete(id);
      setSelectedAnimal(null);
      loadLookups(); // Refresh all animals list
    } catch (err) {
      console.error('Failed to delete animal:', err);
    }
  };

  // If viewing an animal from within a herd
  if (selectedAnimal && selectedHerd) {
    return (
      <>
        <AnimalDetailView
          animal={selectedAnimal}
          onBack={() => setSelectedAnimal(null)}
          onUpdate={handleUpdateAnimal}
          onDelete={handleDeleteAnimal}
          lookups={lookups}
          allAnimals={allAnimals}
          backLabel={selectedHerd.name}
        />
        {showModal && (
          <HerdFlockModal
            herd={editingHerd}
            pastures={pastures}
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditingHerd(null); }}
          />
        )}
      </>
    );
  }

  // If a herd is selected, show the detail view
  if (selectedHerd) {
    return (
      <>
        <HerdDetailView
          herd={selectedHerd}
          onBack={() => setSelectedHerd(null)}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onSelectAnimal={handleSelectAnimal}
          onRefresh={loadData}
        />
        {showModal && (
          <HerdFlockModal
            herd={editingHerd}
            pastures={pastures}
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditingHerd(null); }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <HerdsListView
        herds={herds}
        loading={loading}
        search={search}
        setSearch={setSearch}
        speciesFilter={speciesFilter}
        setSpeciesFilter={setSpeciesFilter}
        onAdd={openAddModal}
        onSelect={setSelectedHerd}
      />
      {showModal && (
        <HerdFlockModal
          herd={editingHerd}
          pastures={pastures}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingHerd(null); }}
        />
      )}
    </>
  );
};

export default HerdsFlocksView;
