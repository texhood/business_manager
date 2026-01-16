/**
 * Animals View Component
 * Individual animal registry with health records, weight tracking, and offspring
 * Styled in NetSuite format with header and subtabs
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../common/Icons';
import { animalsService, herdsService, pasturesService, lookupsService } from '../../services/api';

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
// ANIMAL LIST VIEW
// ============================================================================

const AnimalListView = ({ animals, loading, onSelect, onAdd, filters, setFilters, lookups }) => {
  return (
    <div>
      <div className="page-header">
        <h1>Animals</h1>
        <p className="subtitle">Individual animal registry &nbsp;&nbsp; <span style={{ color: '#9ca3af' }}>Click a row to view details</span></p>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Icons.Search />
          <input
            type="text"
            placeholder="Search by tag, name..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Sold">Sold</option>
          <option value="Dead">Dead</option>
          <option value="Processed">Processed</option>
          <option value="Reference">Reference</option>
        </select>
        <select
          className="filter-select"
          value={filters.herd_id}
          onChange={(e) => setFilters({ ...filters, herd_id: e.target.value })}
        >
          <option value="">All Herds</option>
          {lookups.herds.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={onAdd}>
          <Icons.Plus /> Add Animal
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-state">
            <Icons.Loader className="animate-spin" />
            <p>Loading animals...</p>
          </div>
        ) : animals.length === 0 ? (
          <div className="empty-state">
            <Icons.Tag />
            <h3>No animals found</h3>
            <p>Add your first animal to the registry</p>
            <button className="btn btn-primary" onClick={onAdd}>
              <Icons.Plus /> Add Animal
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Breed</th>
                  <th>Herd/Flock</th>
                  <th>Birth Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {animals.map((animal) => (
                  <tr 
                    key={animal.id} 
                    className="clickable"
                    onClick={() => onSelect(animal)}
                  >
                    <td><strong style={{ color: '#7A8B6E' }}>{animal.ear_tag}</strong></td>
                    <td>{animal.name || '—'}</td>
                    <td>{animal.animal_type_name || '—'}</td>
                    <td>{animal.breed_name || '—'}</td>
                    <td>{animal.herd_name || '—'}</td>
                    <td>{animal.birth_date ? new Date(animal.birth_date).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`badge badge-${animal.status === 'Active' ? 'green' : animal.status === 'Sold' ? 'blue' : animal.status === 'Dead' ? 'red' : animal.status === 'Processed' ? 'purple' : 'gray'}`}>
                        {animal.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// NETSUITE-STYLE ANIMAL DETAIL VIEW
// ============================================================================

const AnimalDetailView = ({ animal, onBack, onUpdate, onDelete, lookups, allAnimals }) => {
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
        // Filter allAnimals for offspring (where this animal is dam or sire)
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
        <button className="btn btn-icon" onClick={onBack} title="Back to list">
          <Icons.ArrowLeft />
        </button>
        <div className="record-title">
          <div className="breadcrumb-title">
            <span className="breadcrumb-label">Animals /</span>
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

      {/* ===== PRIMARY INFORMATION (Header Fields) ===== */}
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
                  <div className="weights-content">
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
                  </div>
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

      {/* Modal */}
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
// RECORD MODAL
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
// ADD ANIMAL MODAL
// ============================================================================

const AnimalModal = ({ animal, lookups, allAnimals, onSave, onClose }) => {
  const [form, setForm] = useState(animal || { status: 'Active' });
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
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{animal ? 'Edit Animal' : 'Add Animal'}</h2>
          <button className="modal-close" onClick={onClose}><Icons.X /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>Ear Tag <span className="required">*</span></label>
                <input
                  type="text"
                  required
                  value={form.ear_tag || ''}
                  onChange={(e) => setForm({ ...form, ear_tag: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Animal Type</label>
                <select
                  value={form.animal_type_id || ''}
                  onChange={(e) => setForm({ ...form, animal_type_id: e.target.value || null })}
                >
                  <option value="">Select type...</option>
                  {lookups.animalTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.species})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Breed</label>
                <select
                  value={form.breed_id || ''}
                  onChange={(e) => setForm({ ...form, breed_id: e.target.value || null })}
                >
                  <option value="">Select breed...</option>
                  {lookups.breeds.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={form.category_id || ''}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}
                >
                  <option value="">Select category...</option>
                  {lookups.categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={form.status || 'Active'}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Sold">Sold</option>
                  <option value="Dead">Dead</option>
                  <option value="Processed">Processed</option>
                  <option value="Reference">Reference</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Herd/Flock</label>
                <select
                  value={form.herd_id || ''}
                  onChange={(e) => setForm({ ...form, herd_id: e.target.value || null })}
                >
                  <option value="">No herd assigned</option>
                  {lookups.herds.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Current Pasture</label>
                <select
                  value={form.current_pasture_id || ''}
                  onChange={(e) => setForm({ ...form, current_pasture_id: e.target.value || null })}
                >
                  <option value="">No pasture assigned</option>
                  {lookups.pastures.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Birth Date</label>
                <input
                  type="date"
                  value={form.birth_date || ''}
                  onChange={(e) => setForm({ ...form, birth_date: e.target.value || null })}
                />
              </div>
              <div className="form-group">
                <label>Color/Markings</label>
                <input
                  type="text"
                  value={form.color_markings || ''}
                  onChange={(e) => setForm({ ...form, color_markings: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Dam</label>
                <select
                  value={form.dam_id || ''}
                  onChange={(e) => setForm({ ...form, dam_id: e.target.value || null })}
                >
                  <option value="">Select dam...</option>
                  {filterDamCandidates(
                    allAnimals, 
                    null, 
                    getSpeciesFromTypeId(form.animal_type_id, lookups.animalTypes),
                    lookups.animalTypes
                  ).map((a) => (
                    <option key={a.id} value={a.id}>{a.ear_tag} {a.name ? `(${a.name})` : ''} - {a.category_name || 'Unknown'}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Sire</label>
                <select
                  value={form.sire_id || ''}
                  onChange={(e) => setForm({ ...form, sire_id: e.target.value || null })}
                >
                  <option value="">Select sire...</option>
                  {filterSireCandidates(
                    allAnimals, 
                    null, 
                    getSpeciesFromTypeId(form.animal_type_id, lookups.animalTypes),
                    lookups.animalTypes
                  ).map((a) => (
                    <option key={a.id} value={a.id}>{a.ear_tag} {a.name ? `(${a.name})` : ''} - {a.category_name || 'Unknown'}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                rows="3"
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
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
// MAIN ANIMALS VIEW
// ============================================================================

const AnimalsView = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '', herd_id: '' });
  const [lookups, setLookups] = useState({
    animalTypes: [],
    breeds: [],
    categories: [],
    owners: [],
    herds: [],
    pastures: []
  });

  const loadLookups = async () => {
    try {
      const [types, breeds, categories, owners, herds, pastures] = await Promise.all([
        lookupsService.getAnimalTypes(),
        lookupsService.getBreeds(),
        lookupsService.getAnimalCategories(),
        lookupsService.getOwners(),
        herdsService.getAll(),
        pasturesService.getAll({ active_only: true })
      ]);
      setLookups({
        animalTypes: types || [],
        breeds: breeds || [],
        categories: categories || [],
        owners: owners || [],
        herds: herds || [],
        pastures: pastures || []
      });
    } catch (err) {
      console.error('Failed to load lookups:', err);
    }
  };

  const loadAnimals = async () => {
    setLoading(true);
    try {
      const params = { limit: 1000 }; // Load all for offspring lookup
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.herd_id) params.herd_id = filters.herd_id;
      
      const data = await animalsService.getAll(params);
      setAnimals(data.data || []);
    } catch (err) {
      console.error('Failed to load animals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    loadAnimals();
  }, [filters]);

  const handleSelectAnimal = async (animal) => {
    try {
      const fullAnimal = await animalsService.getById(animal.id);
      setSelectedAnimal(fullAnimal);
    } catch (err) {
      console.error('Failed to load animal details:', err);
      setSelectedAnimal(animal);
    }
  };

  const handleAddAnimal = async (data) => {
    try {
      await animalsService.create(data);
      setShowAddModal(false);
      loadAnimals();
    } catch (err) {
      console.error('Failed to create animal:', err);
    }
  };

  const handleUpdateAnimal = async (id, data) => {
    try {
      const updated = await animalsService.update(id, data);
      setSelectedAnimal(updated);
      loadAnimals();
    } catch (err) {
      console.error('Failed to update animal:', err);
      throw err;
    }
  };

  const handleDeleteAnimal = async (id) => {
    try {
      await animalsService.delete(id);
      setSelectedAnimal(null);
      loadAnimals();
    } catch (err) {
      console.error('Failed to delete animal:', err);
    }
  };

  if (selectedAnimal) {
    return (
      <AnimalDetailView
        animal={selectedAnimal}
        onBack={() => setSelectedAnimal(null)}
        onUpdate={handleUpdateAnimal}
        onDelete={handleDeleteAnimal}
        lookups={lookups}
        allAnimals={animals}
      />
    );
  }

  return (
    <>
      <AnimalListView
        animals={animals}
        loading={loading}
        onSelect={handleSelectAnimal}
        onAdd={() => setShowAddModal(true)}
        filters={filters}
        setFilters={setFilters}
        lookups={lookups}
      />
      {showAddModal && (
        <AnimalModal
          lookups={lookups}
          allAnimals={animals}
          onSave={handleAddAnimal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
};

export default AnimalsView;
