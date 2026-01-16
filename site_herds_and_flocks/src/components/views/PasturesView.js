/**
 * Pastures View Component
 * List view with detail/subtab view for pasture management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../common/Icons';
import { pasturesService } from '../../services/api';

// ============================================================================
// PASTURE LIST VIEW
// ============================================================================

const PastureListView = ({ pastures, loading, onSelect, onAdd, onRefresh }) => {
  const [search, setSearch] = useState('');

  const filtered = pastures.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.location && p.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header">
        <h1>Pastures</h1>
        <p className="subtitle">Manage your paddocks and fields</p>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Icons.Search />
          <input
            type="text"
            placeholder="Search pastures..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={onAdd}>
          <Icons.Plus /> Add Pasture
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-state">
            <Icons.Loader className="animate-spin" />
            <p>Loading pastures...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Icons.Fence />
            <h3>No pastures found</h3>
            <p>Add your first pasture to get started</p>
            <button className="btn btn-primary" onClick={onAdd}>
              <Icons.Plus /> Add Pasture
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Size (Acres)</th>
                  <th>Location</th>
                  <th>Animals</th>
                  <th>Herds</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pasture) => (
                  <tr 
                    key={pasture.id} 
                    className="clickable"
                    onClick={() => onSelect(pasture)}
                  >
                    <td><strong>{pasture.name}</strong></td>
                    <td>{pasture.size_acres ? `${pasture.size_acres} ac` : '—'}</td>
                    <td>{pasture.location || '—'}</td>
                    <td>{pasture.animal_count || 0}</td>
                    <td>{pasture.herd_count || 0}</td>
                    <td>
                      <span className={`badge ${pasture.is_active ? 'badge-green' : 'badge-gray'}`}>
                        {pasture.is_active ? 'Active' : 'Inactive'}
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
// PASTURE DETAIL VIEW WITH SUBTABS
// ============================================================================

const PastureDetailView = ({ pasture, onBack, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState('grazing');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...pasture });
  const [saving, setSaving] = useState(false);

  // Child records state
  const [grazingEvents, setGrazingEvents] = useState([]);
  const [soilSamples, setSoilSamples] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [childLoading, setChildLoading] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  // Load child records based on active tab
  const loadChildRecords = useCallback(async () => {
    setChildLoading(true);
    try {
      switch (activeTab) {
        case 'grazing':
          const grazingData = await pasturesService.getGrazingEvents(pasture.id);
          setGrazingEvents(grazingData || []);
          break;
        case 'soil':
          const soilData = await pasturesService.getSoilSamples(pasture.id);
          setSoilSamples(soilData || []);
          break;
        case 'tasks':
          const taskData = await pasturesService.getTasks(pasture.id, showCompleted);
          setTasks(taskData || []);
          break;
        case 'treatments':
          const treatmentData = await pasturesService.getTreatments(pasture.id);
          setTreatments(treatmentData || []);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Failed to load child records:', err);
    } finally {
      setChildLoading(false);
    }
  }, [pasture.id, activeTab, showCompleted]);

  useEffect(() => {
    loadChildRecords();
  }, [loadChildRecords]);

  const handleSaveHeader = async () => {
    setSaving(true);
    try {
      await onUpdate(pasture.id, editForm);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save pasture:', err);
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
      switch (modalType) {
        case 'grazing':
          if (editingRecord) {
            await pasturesService.updateGrazingEvent(editingRecord.id, data);
          } else {
            await pasturesService.createGrazingEvent(pasture.id, data);
          }
          break;
        case 'soil':
          if (editingRecord) {
            await pasturesService.updateSoilSample(editingRecord.id, data);
          } else {
            await pasturesService.createSoilSample(pasture.id, data);
          }
          break;
        case 'task':
          if (editingRecord) {
            await pasturesService.updateTask(editingRecord.id, data);
          } else {
            await pasturesService.createTask(pasture.id, data);
          }
          break;
        case 'treatment':
          if (editingRecord) {
            await pasturesService.updateTreatment(editingRecord.id, data);
          } else {
            await pasturesService.createTreatment(pasture.id, data);
          }
          break;
        default:
          break;
      }
      setShowModal(false);
      loadChildRecords();
    } catch (err) {
      console.error('Failed to save record:', err);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      switch (type) {
        case 'grazing':
          await pasturesService.deleteGrazingEvent(id);
          break;
        case 'soil':
          await pasturesService.deleteSoilSample(id);
          break;
        case 'task':
          await pasturesService.deleteTask(id);
          break;
        case 'treatment':
          await pasturesService.deleteTreatment(id);
          break;
        default:
          break;
      }
      loadChildRecords();
    } catch (err) {
      console.error('Failed to delete record:', err);
    }
  };

  const handleToggleTaskComplete = async (task) => {
    try {
      await pasturesService.updateTask(task.id, {
        ...task,
        is_completed: !task.is_completed,
        completed_date: !task.is_completed ? new Date().toISOString().split('T')[0] : null
      });
      loadChildRecords();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div>
      {/* Header with back button */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="btn btn-icon" onClick={onBack}>
          <Icons.ArrowLeft />
        </button>
        <div style={{ flex: 1 }}>
          <h1>{pasture.name}</h1>
          <p className="subtitle">Pasture Details</p>
        </div>
        <button 
          className="btn btn-danger" 
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this pasture?')) {
              onDelete(pasture.id);
            }
          }}
        >
          <Icons.Trash /> Delete
        </button>
      </div>

      {/* Pasture Header Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2>Pasture Information</h2>
          {!isEditing ? (
            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(true)}>
              <Icons.Edit /> Edit
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setIsEditing(false); setEditForm({ ...pasture }); }}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleSaveHeader} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
        <div className="card-body">
          {isEditing ? (
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Size (Acres)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.size_acres || ''}
                  onChange={(e) => setEditForm({ ...editForm, size_acres: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={editForm.location || ''}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Productivity Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={editForm.productivity_rating || ''}
                  onChange={(e) => setEditForm({ ...editForm, productivity_rating: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Notes</label>
                <textarea
                  rows="3"
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={editForm.is_active !== false}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <div><strong>{pasture.name}</strong></div>
              </div>
              <div className="form-group">
                <label>Size</label>
                <div>{pasture.size_acres ? `${pasture.size_acres} acres` : '—'}</div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <div>{pasture.location || '—'}</div>
              </div>
              <div className="form-group">
                <label>Productivity Rating</label>
                <div>{pasture.productivity_rating || '—'}</div>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Notes</label>
                <div>{pasture.notes || '—'}</div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <span className={`badge ${pasture.is_active ? 'badge-green' : 'badge-gray'}`}>
                  {pasture.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subtabs */}
      <div className="card">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'grazing' ? 'active' : ''}`}
            onClick={() => setActiveTab('grazing')}
          >
            <Icons.Calendar /> Grazing Events
          </button>
          <button
            className={`tab ${activeTab === 'soil' ? 'active' : ''}`}
            onClick={() => setActiveTab('soil')}
          >
            <Icons.Clipboard /> Soil Samples
          </button>
          <button
            className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <Icons.CheckSquare /> Tasks
          </button>
          <button
            className={`tab ${activeTab === 'treatments' ? 'active' : ''}`}
            onClick={() => setActiveTab('treatments')}
          >
            <Icons.Spray /> Treatments
          </button>
        </div>

        <div className="card-body">
          {/* Grazing Events Tab */}
          {activeTab === 'grazing' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button className="btn btn-primary btn-sm" onClick={() => openAddModal('grazing')}>
                  <Icons.Plus /> Add Grazing Event
                </button>
              </div>
              {childLoading ? (
                <div className="loading-state"><Icons.Loader className="animate-spin" /></div>
              ) : grazingEvents.length === 0 ? (
                <div className="empty-state">
                  <Icons.Calendar />
                  <h3>No grazing events</h3>
                  <p>Record when animals graze this pasture</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Initial Height</th>
                      <th>Final Height</th>
                      <th>Animals</th>
                      <th>Notes</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {grazingEvents.map((event) => (
                      <tr key={event.id}>
                        <td>{formatDate(event.start_date)}</td>
                        <td>{formatDate(event.end_date)}</td>
                        <td>{event.initial_grass_height ? `${event.initial_grass_height}"` : '—'}</td>
                        <td>{event.final_grass_height ? `${event.final_grass_height}"` : '—'}</td>
                        <td>{event.animal_count || 0}</td>
                        <td>{event.notes || '—'}</td>
                        <td>
                          <button className="btn btn-icon btn-sm" onClick={() => openEditModal('grazing', event)}>
                            <Icons.Edit />
                          </button>
                          <button className="btn btn-icon btn-sm" onClick={() => handleDelete('grazing', event.id)}>
                            <Icons.Trash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Soil Samples Tab */}
          {activeTab === 'soil' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button className="btn btn-primary btn-sm" onClick={() => openAddModal('soil')}>
                  <Icons.Plus /> Add Soil Sample
                </button>
              </div>
              {childLoading ? (
                <div className="loading-state"><Icons.Loader className="animate-spin" /></div>
              ) : soilSamples.length === 0 ? (
                <div className="empty-state">
                  <Icons.Clipboard />
                  <h3>No soil samples</h3>
                  <p>Record soil test results</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Sample ID</th>
                      <th>Date</th>
                      <th>Nutrients</th>
                      <th>Notes</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {soilSamples.map((sample) => (
                      <tr key={sample.id}>
                        <td><strong>{sample.sample_id}</strong></td>
                        <td>{formatDate(sample.sample_date)}</td>
                        <td>
                          {sample.nutrients && sample.nutrients.length > 0 ? (
                            <span className="badge badge-blue">{sample.nutrients.length} nutrients</span>
                          ) : '—'}
                        </td>
                        <td>{sample.notes || '—'}</td>
                        <td>
                          <button className="btn btn-icon btn-sm" onClick={() => openEditModal('soil', sample)}>
                            <Icons.Edit />
                          </button>
                          <button className="btn btn-icon btn-sm" onClick={() => handleDelete('soil', sample.id)}>
                            <Icons.Trash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.checked)}
                  />
                  Show completed tasks
                </label>
                <button className="btn btn-primary btn-sm" onClick={() => openAddModal('task')}>
                  <Icons.Plus /> Add Task
                </button>
              </div>
              {childLoading ? (
                <div className="loading-state"><Icons.Loader className="animate-spin" /></div>
              ) : tasks.length === 0 ? (
                <div className="empty-state">
                  <Icons.CheckSquare />
                  <h3>No tasks</h3>
                  <p>Add maintenance tasks for this pasture</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}></th>
                      <th>Task</th>
                      <th>Due Date</th>
                      <th>Completed</th>
                      <th>Notes</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id} style={{ opacity: task.is_completed ? 0.6 : 1 }}>
                        <td>
                          <input
                            type="checkbox"
                            checked={task.is_completed}
                            onChange={() => handleToggleTaskComplete(task)}
                          />
                        </td>
                        <td style={{ textDecoration: task.is_completed ? 'line-through' : 'none' }}>
                          {task.task_description}
                        </td>
                        <td>{formatDate(task.due_date)}</td>
                        <td>{formatDate(task.completed_date)}</td>
                        <td>{task.notes || '—'}</td>
                        <td>
                          <button className="btn btn-icon btn-sm" onClick={() => openEditModal('task', task)}>
                            <Icons.Edit />
                          </button>
                          <button className="btn btn-icon btn-sm" onClick={() => handleDelete('task', task.id)}>
                            <Icons.Trash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Treatments Tab */}
          {activeTab === 'treatments' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button className="btn btn-primary btn-sm" onClick={() => openAddModal('treatment')}>
                  <Icons.Plus /> Add Treatment
                </button>
              </div>
              {childLoading ? (
                <div className="loading-state"><Icons.Loader className="animate-spin" /></div>
              ) : treatments.length === 0 ? (
                <div className="empty-state">
                  <Icons.Spray />
                  <h3>No treatments</h3>
                  <p>Record chemical or mechanical treatments</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Details</th>
                      <th>Notes</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatments.map((treatment) => (
                      <tr key={treatment.id}>
                        <td>{formatDate(treatment.treatment_date)}</td>
                        <td>
                          <span className={`badge ${treatment.treatment_type === 'chemical' ? 'badge-yellow' : 'badge-blue'}`}>
                            {treatment.treatment_type}
                          </span>
                        </td>
                        <td>{treatment.treatment_description || '—'}</td>
                        <td>
                          {treatment.treatment_type === 'chemical' ? (
                            treatment.chemical_used ? `${treatment.chemical_used} @ ${treatment.application_rate || '—'} ${treatment.application_rate_unit || ''}` : '—'
                          ) : (
                            treatment.equipment_used || '—'
                          )}
                        </td>
                        <td>{treatment.notes || '—'}</td>
                        <td>
                          <button className="btn btn-icon btn-sm" onClick={() => openEditModal('treatment', treatment)}>
                            <Icons.Edit />
                          </button>
                          <button className="btn btn-icon btn-sm" onClick={() => handleDelete('treatment', treatment.id)}>
                            <Icons.Trash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
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
// RECORD MODAL (for adding/editing child records)
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

  const getTitle = () => {
    const action = record ? 'Edit' : 'Add';
    switch (type) {
      case 'grazing': return `${action} Grazing Event`;
      case 'soil': return `${action} Soil Sample`;
      case 'task': return `${action} Task`;
      case 'treatment': return `${action} Treatment`;
      default: return action;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{getTitle()}</h2>
          <button className="modal-close" onClick={onClose}><Icons.X /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Grazing Event Form */}
            {type === 'grazing' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      required
                      value={form.start_date || ''}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={form.end_date || ''}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Initial Grass Height (inches)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.initial_grass_height || ''}
                      onChange={(e) => setForm({ ...form, initial_grass_height: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Final Grass Height (inches)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.final_grass_height || ''}
                      onChange={(e) => setForm({ ...form, final_grass_height: e.target.value })}
                    />
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
              </>
            )}

            {/* Soil Sample Form */}
            {type === 'soil' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Sample ID *</label>
                    <input
                      type="text"
                      required
                      value={form.sample_id || ''}
                      onChange={(e) => setForm({ ...form, sample_id: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Sample Date *</label>
                    <input
                      type="date"
                      required
                      value={form.sample_date || ''}
                      onChange={(e) => setForm({ ...form, sample_date: e.target.value })}
                    />
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
                <p className="form-hint">Note: Nutrient data can be added after creating the sample.</p>
              </>
            )}

            {/* Task Form */}
            {type === 'task' && (
              <>
                <div className="form-group">
                  <label>Task Description *</label>
                  <textarea
                    rows="3"
                    required
                    value={form.task_description || ''}
                    onChange={(e) => setForm({ ...form, task_description: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={form.due_date || ''}
                      onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    />
                  </div>
                  {record && (
                    <div className="form-group">
                      <label>Completed Date</label>
                      <input
                        type="date"
                        value={form.completed_date || ''}
                        onChange={(e) => setForm({ ...form, completed_date: e.target.value })}
                      />
                    </div>
                  )}
                </div>
                {record && (
                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={form.is_completed || false}
                        onChange={(e) => setForm({ ...form, is_completed: e.target.checked })}
                      />
                      Completed
                    </label>
                  </div>
                )}
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

            {/* Treatment Form */}
            {type === 'treatment' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Treatment Date *</label>
                    <input
                      type="date"
                      required
                      value={form.treatment_date || ''}
                      onChange={(e) => setForm({ ...form, treatment_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Treatment Type *</label>
                    <select
                      required
                      value={form.treatment_type || ''}
                      onChange={(e) => setForm({ ...form, treatment_type: e.target.value })}
                    >
                      <option value="">Select type...</option>
                      <option value="chemical">Chemical</option>
                      <option value="mechanical">Mechanical</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={form.treatment_description || ''}
                    onChange={(e) => setForm({ ...form, treatment_description: e.target.value })}
                  />
                </div>
                
                {form.treatment_type === 'chemical' && (
                  <>
                    <div className="form-group">
                      <label>Chemical Used</label>
                      <input
                        type="text"
                        value={form.chemical_used || ''}
                        onChange={(e) => setForm({ ...form, chemical_used: e.target.value })}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Application Rate</label>
                        <input
                          type="number"
                          step="0.01"
                          value={form.application_rate || ''}
                          onChange={(e) => setForm({ ...form, application_rate: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Unit</label>
                        <input
                          type="text"
                          placeholder="e.g., oz/acre"
                          value={form.application_rate_unit || ''}
                          onChange={(e) => setForm({ ...form, application_rate_unit: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {form.treatment_type === 'mechanical' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Equipment Used</label>
                      <input
                        type="text"
                        value={form.equipment_used || ''}
                        onChange={(e) => setForm({ ...form, equipment_used: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Fuel Used (gallons)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={form.fuel_used || ''}
                        onChange={(e) => setForm({ ...form, fuel_used: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                
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
// ADD/EDIT PASTURE MODAL
// ============================================================================

const PastureModal = ({ pasture, onSave, onClose }) => {
  const [form, setForm] = useState(pasture || { is_active: true });
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
          <h2>{pasture ? 'Edit Pasture' : 'Add Pasture'}</h2>
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
                <label>Size (Acres)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.size_acres || ''}
                  onChange={(e) => setForm({ ...form, size_acres: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={form.location || ''}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={form.latitude || ''}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={form.longitude || ''}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Map URL</label>
              <input
                type="url"
                value={form.map_url || ''}
                onChange={(e) => setForm({ ...form, map_url: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Productivity Rating (0-10)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={form.productivity_rating || ''}
                onChange={(e) => setForm({ ...form, productivity_rating: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                rows="3"
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
// MAIN PASTURES VIEW COMPONENT
// ============================================================================

const PasturesView = () => {
  const [pastures, setPastures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPasture, setSelectedPasture] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadPastures = async () => {
    setLoading(true);
    try {
      const data = await pasturesService.getAll();
      setPastures(data || []);
    } catch (err) {
      console.error('Failed to load pastures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPastures();
  }, []);

  const handleSelectPasture = async (pasture) => {
    // Load full pasture details
    try {
      const fullPasture = await pasturesService.getById(pasture.id);
      setSelectedPasture(fullPasture);
    } catch (err) {
      console.error('Failed to load pasture details:', err);
      setSelectedPasture(pasture);
    }
  };

  const handleAddPasture = async (data) => {
    try {
      await pasturesService.create(data);
      setShowAddModal(false);
      loadPastures();
    } catch (err) {
      console.error('Failed to create pasture:', err);
    }
  };

  const handleUpdatePasture = async (id, data) => {
    try {
      const updated = await pasturesService.update(id, data);
      setSelectedPasture(updated);
      loadPastures();
    } catch (err) {
      console.error('Failed to update pasture:', err);
      throw err;
    }
  };

  const handleDeletePasture = async (id) => {
    try {
      await pasturesService.delete(id);
      setSelectedPasture(null);
      loadPastures();
    } catch (err) {
      console.error('Failed to delete pasture:', err);
    }
  };

  // Show detail view if a pasture is selected
  if (selectedPasture) {
    return (
      <PastureDetailView
        pasture={selectedPasture}
        onBack={() => setSelectedPasture(null)}
        onUpdate={handleUpdatePasture}
        onDelete={handleDeletePasture}
      />
    );
  }

  // Show list view
  return (
    <>
      <PastureListView
        pastures={pastures}
        loading={loading}
        onSelect={handleSelectPasture}
        onAdd={() => setShowAddModal(true)}
        onRefresh={loadPastures}
      />
      {showAddModal && (
        <PastureModal
          onSave={handleAddPasture}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
};

export default PasturesView;
