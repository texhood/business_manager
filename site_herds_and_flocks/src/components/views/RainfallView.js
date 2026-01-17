/**
 * RainfallView - Track and visualize rainfall records
 * Supports year-over-year comparison with line charts
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { rainfallService } from '../../services/api';

// ============================================================================
// RAINFALL COMPARISON CHART COMPONENT
// ============================================================================

const RainfallComparisonChart = ({ data, selectedYears }) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Colors for different years
  const yearColors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
  ];

  // Group data by year and month
  const yearlyData = {};
  selectedYears.forEach(year => {
    yearlyData[year] = Array(12).fill(0);
  });

  data.forEach(record => {
    const date = new Date(record.record_date);
    const year = date.getFullYear().toString();
    if (selectedYears.includes(year)) {
      const month = date.getMonth();
      yearlyData[year][month] += parseFloat(record.amount_inches || 0);
    }
  });

  // Find max for scaling
  let maxAmount = 1;
  selectedYears.forEach(year => {
    const yearMax = Math.max(...yearlyData[year]);
    if (yearMax > maxAmount) maxAmount = yearMax;
  });

  // Round up to nice number for grid lines
  const gridMax = Math.ceil(maxAmount);
  const gridLines = [0, gridMax * 0.25, gridMax * 0.5, gridMax * 0.75, gridMax];

  // Calculate totals for each year
  const yearTotals = {};
  selectedYears.forEach(year => {
    yearTotals[year] = yearlyData[year].reduce((sum, val) => sum + val, 0);
  });

  // Chart dimensions
  const chartWidth = 800;
  const chartHeight = 300;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  // Generate SVG path for each year
  const generatePath = (yearData) => {
    const points = yearData.map((value, index) => {
      const x = paddingLeft + (index / 11) * graphWidth;
      const y = paddingTop + graphHeight - (value / gridMax) * graphHeight;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="rainfall-chart-container">
      <div className="chart-header">
        <h3>Rainfall Comparison</h3>
        <div className="chart-legend">
          {selectedYears.map((year, index) => (
            <div key={year} className="legend-item">
              <span 
                className="legend-color" 
                style={{ backgroundColor: yearColors[index % yearColors.length] }}
              />
              <span className="legend-label">{year}</span>
              <span className="legend-total">{yearTotals[year].toFixed(2)}"</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="chart-wrapper">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="line-chart-svg">
          {/* Grid lines */}
          {gridLines.map((value, index) => {
            const y = paddingTop + graphHeight - (value / gridMax) * graphHeight;
            return (
              <g key={index}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#6b7280"
                >
                  {value.toFixed(1)}"
                </text>
              </g>
            );
          })}

          {/* Month labels */}
          {monthNames.map((month, index) => {
            const x = paddingLeft + (index / 11) * graphWidth;
            return (
              <text
                key={month}
                x={x}
                y={chartHeight - 10}
                textAnchor="middle"
                fontSize="11"
                fill="#6b7280"
              >
                {month}
              </text>
            );
          })}

          {/* Data lines */}
          {selectedYears.map((year, yearIndex) => (
            <g key={year}>
              {/* Line */}
              <path
                d={generatePath(yearlyData[year])}
                fill="none"
                stroke={yearColors[yearIndex % yearColors.length]}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Data points */}
              {yearlyData[year].map((value, monthIndex) => {
                const x = paddingLeft + (monthIndex / 11) * graphWidth;
                const y = paddingTop + graphHeight - (value / gridMax) * graphHeight;
                return (
                  <circle
                    key={monthIndex}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={yearColors[yearIndex % yearColors.length]}
                    stroke="white"
                    strokeWidth="2"
                  >
                    <title>{monthNames[monthIndex]} {year}: {value.toFixed(2)}"</title>
                  </circle>
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      <style>{`
        .rainfall-chart-container {
          background: white;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e5e7eb;
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .chart-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: #374151;
        }
        .chart-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }
        .legend-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
        }
        .legend-total {
          font-size: 0.85rem;
          color: #6b7280;
        }
        .chart-wrapper {
          overflow-x: auto;
        }
        .line-chart-svg {
          width: 100%;
          min-width: 600px;
          height: auto;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// YEAR SELECTOR COMPONENT
// ============================================================================

const YearSelector = ({ availableYears, selectedYears, onChange }) => {
  const toggleYear = (year) => {
    if (selectedYears.includes(year)) {
      if (selectedYears.length > 1) {
        onChange(selectedYears.filter(y => y !== year));
      }
    } else {
      onChange([...selectedYears, year].sort((a, b) => b - a));
    }
  };

  return (
    <div className="year-selector">
      <span className="year-selector-label">Compare Years:</span>
      <div className="year-chips">
        {availableYears.map(year => (
          <button
            key={year}
            className={`year-chip ${selectedYears.includes(year) ? 'selected' : ''}`}
            onClick={() => toggleYear(year)}
          >
            {year}
          </button>
        ))}
      </div>
      <style>{`
        .year-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .year-selector-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #374151;
        }
        .year-chips {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .year-chip {
          padding: 4px 12px;
          border-radius: 16px;
          border: 1px solid #d1d5db;
          background: white;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .year-chip:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }
        .year-chip.selected {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// RAINFALL MODAL
// ============================================================================

const RainfallModal = ({ record, onSave, onClose }) => {
  const [form, setForm] = useState(record || {
    record_date: new Date().toISOString().split('T')[0],
    amount_inches: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount_inches || parseFloat(form.amount_inches) < 0) {
      alert('Please enter a valid rainfall amount');
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
          <h2>{record ? 'Edit Rainfall Record' : 'Add Rainfall Record'}</h2>
          <button className="modal-close" onClick={onClose}><Icons.X /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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
                <label>Amount (inches) <span className="required">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.amount_inches}
                  onChange={(e) => setForm({ ...form, amount_inches: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                rows="3"
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Storm type, duration, conditions, etc."
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
// MAIN RAINFALL VIEW
// ============================================================================

const RainfallView = () => {
  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]); // For chart - all years
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'chart'
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [selectedChartYears, setSelectedChartYears] = useState([new Date().getFullYear().toString()]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  const loadData = async () => {
    setLoading(true);
    try {
      // Load filtered data for list view
      const data = await rainfallService.getAll({ year: filterYear !== 'all' ? filterYear : undefined });
      setRecords(Array.isArray(data) ? data : []);
      
      // Load all data for chart view
      const allData = await rainfallService.getAll();
      setAllRecords(Array.isArray(allData) ? allData : []);
    } catch (err) {
      console.error('Failed to load rainfall data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterYear]);

  // Get years that have data
  const yearsWithData = [...new Set(allRecords.map(r => new Date(r.record_date).getFullYear().toString()))].sort((a, b) => b - a);

  const handleSave = async (data) => {
    try {
      if (editingRecord) {
        await rainfallService.update(editingRecord.id, data);
      } else {
        await rainfallService.create(data);
      }
      setShowModal(false);
      setEditingRecord(null);
      loadData();
    } catch (err) {
      console.error('Failed to save rainfall record:', err);
      alert('Failed to save rainfall record');
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm('Are you sure you want to delete this rainfall record?')) return;
    try {
      await rainfallService.delete(record.id);
      loadData();
    } catch (err) {
      console.error('Failed to delete rainfall record:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
  };

  // Calculate stats for filtered records
  const totalRainfall = records.reduce((sum, r) => sum + parseFloat(r.amount_inches || 0), 0);
  const avgRainfall = records.length > 0 ? totalRainfall / records.length : 0;
  const maxRainfall = records.length > 0 ? Math.max(...records.map(r => parseFloat(r.amount_inches || 0))) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Rainfall Records</h1>
          <p className="subtitle">Track precipitation for pasture and land management</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingRecord(null); setShowModal(true); }}>
          <Icons.Plus /> Add Rainfall
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#1e40af' }}><Icons.CloudRain /></div>
          <div className="stat-content">
            <span className="stat-label">Records{filterYear !== 'all' ? ` (${filterYear})` : ''}</span>
            <span className="stat-value">{records.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#065f46' }}><Icons.Droplet /></div>
          <div className="stat-content">
            <span className="stat-label">Total Rainfall</span>
            <span className="stat-value">{totalRainfall.toFixed(2)}"</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#92400e' }}><Icons.TrendingUp /></div>
          <div className="stat-content">
            <span className="stat-label">Average</span>
            <span className="stat-value">{avgRainfall.toFixed(2)}"</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#5b21b6' }}><Icons.Activity /></div>
          <div className="stat-content">
            <span className="stat-label">Max Single Event</span>
            <span className="stat-value">{maxRainfall.toFixed(2)}"</span>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="view-toggle">
          <button 
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('list')}
          >
            <Icons.List /> List
          </button>
          <button 
            className={`btn btn-sm ${viewMode === 'chart' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('chart')}
          >
            <Icons.BarChart /> Chart
          </button>
        </div>
        {viewMode === 'list' && (
          <select
            className="filter-select"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="all">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
      </div>

      {viewMode === 'chart' && (
        <div style={{ marginBottom: '16px' }}>
          <YearSelector
            availableYears={yearsWithData.length > 0 ? yearsWithData : years}
            selectedYears={selectedChartYears}
            onChange={setSelectedChartYears}
          />
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <Icons.Loader className="animate-spin" />
          <p>Loading rainfall data...</p>
        </div>
      ) : viewMode === 'chart' ? (
        allRecords.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <Icons.CloudRain />
              <h3>No rainfall data for chart</h3>
              <p>Add rainfall records to see year-over-year comparison</p>
              <button className="btn btn-primary" onClick={() => { setEditingRecord(null); setShowModal(true); }}>
                <Icons.Plus /> Add First Record
              </button>
            </div>
          </div>
        ) : (
          <RainfallComparisonChart data={allRecords} selectedYears={selectedChartYears} />
        )
      ) : (
        <div className="card">
          {records.length === 0 ? (
            <div className="empty-state">
              <Icons.CloudRain />
              <h3>No rainfall records{filterYear !== 'all' ? ` for ${filterYear}` : ''}</h3>
              <p>Start tracking rainfall to monitor precipitation patterns</p>
              <button className="btn btn-primary" onClick={() => { setEditingRecord(null); setShowModal(true); }}>
                <Icons.Plus /> Add First Record
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th className="text-right">Amount (inches)</th>
                    <th>Notes</th>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td><strong>{formatDate(record.record_date)}</strong></td>
                      <td className="text-right">
                        <span className="rainfall-amount">{parseFloat(record.amount_inches).toFixed(2)}"</span>
                      </td>
                      <td className="notes-cell">
                        {record.notes ? (record.notes.length > 60 ? record.notes.substring(0, 60) + '...' : record.notes) : '—'}
                      </td>
                      <td className="actions-col">
                        <button 
                          className="btn btn-icon btn-sm" 
                          onClick={() => { setEditingRecord(record); setShowModal(true); }} 
                          title="Edit"
                        >
                          <Icons.Edit />
                        </button>
                        <button 
                          className="btn btn-icon btn-sm" 
                          onClick={() => handleDelete(record)} 
                          title="Delete"
                        >
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
      )}

      {showModal && (
        <RainfallModal
          record={editingRecord}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingRecord(null); }}
        />
      )}

      <style>{`
        .view-toggle {
          display: flex;
          gap: 4px;
        }
        .rainfall-amount {
          font-weight: 600;
          color: #3b82f6;
        }
        .notes-cell {
          max-width: 300px;
          color: #6b7280;
        }
        .text-right {
          text-align: right;
        }
        .actions-col {
          width: 100px;
          text-align: right;
        }
        .actions-col button {
          margin-left: 4px;
        }
      `}</style>
    </div>
  );
};

export default RainfallView;
