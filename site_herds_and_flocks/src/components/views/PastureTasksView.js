/**
 * Pasture Tasks View Component
 * Aggregate view of all tasks across all pastures
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { pasturesService } from '../../services/api';

// ============================================================================
// TASK MODAL
// ============================================================================

const TaskModal = ({ task, pastures, onSave, onClose }) => {
  const [form, setForm] = useState(task || { priority: 'medium', is_completed: false });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pasture_id) {
      alert('Please select a pasture');
      return;
    }
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
          <h2>{task ? 'Edit Task' : 'Add Task'}</h2>
          <button className="modal-close" onClick={onClose}><Icons.X /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Task Title <span className="required">*</span></label>
              <input
                type="text"
                required
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="What needs to be done?"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Pasture <span className="required">*</span></label>
                <select
                  required
                  value={form.pasture_id || ''}
                  onChange={(e) => setForm({ ...form, pasture_id: e.target.value })}
                  disabled={!!task}
                >
                  <option value="">Select pasture...</option>
                  {pastures.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={form.priority || 'medium'}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={form.due_date ? form.due_date.split('T')[0] : ''}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value || null })}
                />
              </div>
              <div className="form-group">
                <label>Assigned To</label>
                <input
                  type="text"
                  value={form.assigned_to || ''}
                  onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                  placeholder="Person responsible"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                rows="3"
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Additional details..."
              />
            </div>
            {task && (
              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.is_completed || false}
                    onChange={(e) => setForm({ ...form, is_completed: e.target.checked })}
                  />
                  Mark as completed
                </label>
              </div>
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
// MAIN TASKS VIEW
// ============================================================================

const PastureTasksView = () => {
  const [tasks, setTasks] = useState([]);
  const [pastures, setPastures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    pasture_id: '',
    priority: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const pasturesData = await pasturesService.getAll({ active_only: true });
      const pasturesList = pasturesData || [];
      setPastures(pasturesList);

      const allTasks = [];
      for (const pasture of pasturesList) {
        try {
          const tasksData = await pasturesService.getTasks(pasture.id, showCompleted);
          if (tasksData && tasksData.length > 0) {
            const tasksWithPasture = tasksData.map(t => ({
              ...t,
              pasture_name: pasture.name,
              pasture_id: pasture.id
            }));
            allTasks.push(...tasksWithPasture);
          }
        } catch (err) {
          // Skip pastures with no tasks
        }
      }
      
      // Sort by due date (nulls last), then by priority
      allTasks.sort((a, b) => {
        if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      });
      setTasks(allTasks);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [showCompleted]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
  };

  const isOverdue = (dueDate, isCompleted) => {
    if (!dueDate || isCompleted) return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTasks = tasks.filter(t => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        t.title?.toLowerCase().includes(searchLower) ||
        t.pasture_name?.toLowerCase().includes(searchLower) ||
        t.assigned_to?.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (filters.pasture_id && t.pasture_id !== parseInt(filters.pasture_id)) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    return true;
  });

  const pendingCount = tasks.filter(t => !t.is_completed).length;
  const overdueCount = tasks.filter(t => isOverdue(t.due_date, t.is_completed)).length;
  const highPriorityCount = tasks.filter(t => t.priority === 'high' && !t.is_completed).length;

  const handleSave = async (data) => {
    try {
      if (editingTask) {
        await pasturesService.updateTask(editingTask.id, data);
      } else {
        await pasturesService.createTask(data.pasture_id, data);
      }
      setShowModal(false);
      setEditingTask(null);
      loadData();
    } catch (err) {
      console.error('Failed to save task:', err);
      alert('Failed to save task');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await pasturesService.updateTask(task.id, { is_completed: !task.is_completed });
      loadData();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await pasturesService.deleteTask(task.id);
      loadData();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high': return 'badge-red';
      case 'medium': return 'badge-yellow';
      case 'low': return 'badge-gray';
      default: return 'badge-gray';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Pasture Tasks</h1>
        <p className="subtitle">Manage maintenance and improvement tasks</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-icon"><Icons.CheckSquare /></div>
          <div className="stat-content">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{pendingCount}</span>
          </div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilters({ ...filters, priority: filters.priority === 'high' ? '' : 'high' })}>
          <div className="stat-icon" style={{ color: '#dc2626' }}><Icons.AlertTriangle /></div>
          <div className="stat-content">
            <span className="stat-label">High Priority</span>
            <span className="stat-value" style={{ color: '#dc2626' }}>{highPriorityCount}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: overdueCount > 0 ? '#dc2626' : '#6b7280' }}><Icons.Calendar /></div>
          <div className="stat-content">
            <span className="stat-label">Overdue</span>
            <span className="stat-value" style={{ color: overdueCount > 0 ? '#dc2626' : 'inherit' }}>{overdueCount}</span>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Icons.Search />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className="filter-select"
          value={filters.pasture_id}
          onChange={(e) => setFilters({ ...filters, pasture_id: e.target.value })}
        >
          <option value="">All Pastures</option>
          {pastures.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <label className="form-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
          Show completed
        </label>
        <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowModal(true); }}>
          <Icons.Plus /> Add Task
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-state">
            <Icons.Loader className="animate-spin" />
            <p>Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <Icons.CheckSquare />
            <h3>No tasks found</h3>
            <p>{filters.search || filters.pasture_id || filters.priority ? 'Try adjusting your filters' : 'Add your first task'}</p>
            <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowModal(true); }}>
              <Icons.Plus /> Add Task
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Task</th>
                  <th>Pasture</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Assigned To</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id} className={task.is_completed ? 'completed-row' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={task.is_completed || false}
                        onChange={() => handleToggleComplete(task)}
                        title={task.is_completed ? 'Mark incomplete' : 'Mark complete'}
                      />
                    </td>
                    <td>
                      <div style={{ textDecoration: task.is_completed ? 'line-through' : 'none', color: task.is_completed ? '#9ca3af' : 'inherit' }}>
                        <strong>{task.title}</strong>
                        {task.description && (
                          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '2px' }}>
                            {task.description.length > 50 ? task.description.substring(0, 50) + '...' : task.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td><span style={{ color: '#7A8B6E' }}>{task.pasture_name}</span></td>
                    <td>
                      <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      {task.due_date ? (
                        <span className={isOverdue(task.due_date, task.is_completed) ? 'overdue' : ''}>
                          {formatDate(task.due_date)}
                          {isOverdue(task.due_date, task.is_completed) && (
                            <Icons.AlertTriangle style={{ width: '14px', marginLeft: '4px', color: '#dc2626' }} />
                          )}
                        </span>
                      ) : '—'}
                    </td>
                    <td>{task.assigned_to || '—'}</td>
                    <td className="actions-col">
                      <button className="btn btn-icon btn-sm" onClick={() => { setEditingTask(task); setShowModal(true); }} title="Edit">
                        <Icons.Edit />
                      </button>
                      <button className="btn btn-icon btn-sm" onClick={() => handleDelete(task)} title="Delete">
                        <Icons.Trash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <TaskModal
          task={editingTask}
          pastures={pastures}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
};

export default PastureTasksView;
