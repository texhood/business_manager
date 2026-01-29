/**
 * ReportBuilderView Component
 * CattleMax-style dynamic report builder with record selection,
 * field picker, constraint builder, and live preview
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../common/Icons';
import { reportBuilderService } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import './ReportBuilderView.css';

// ============================================================================
// CATEGORY ICONS AND LABELS
// ============================================================================

const CATEGORY_CONFIG = {
  livestock: { icon: '🐄', label: 'Livestock', color: '#16a34a' },
  pastures: { icon: '🌿', label: 'Pastures', color: '#65a30d' },
  financial: { icon: '💰', label: 'Financial', color: '#2563eb' },
  restaurant: { icon: '🍔', label: 'Restaurant', color: '#ea580c' },
  customers: { icon: '👥', label: 'Customers', color: '#7c3aed' },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Record Selector - Dropdown to pick table/view
 */
const RecordSelector = ({ records, grouped, selectedRecord, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredGrouped = Object.entries(grouped || {}).reduce((acc, [category, items]) => {
    const filtered = items.filter(r => 
      r.display_name.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
    );
    if (filtered.length > 0) acc[category] = filtered;
    return acc;
  }, {});

  const selectedRecordData = records?.find(r => r.record_name === selectedRecord);

  return (
    <div className="record-selector">
      <label>Select Record Type</label>
      <div className="record-dropdown" onClick={() => setIsOpen(!isOpen)}>
        {selectedRecordData ? (
          <div className="selected-record">
            <span className="category-icon">{CATEGORY_CONFIG[selectedRecordData.category]?.icon}</span>
            <span>{selectedRecordData.display_name}</span>
          </div>
        ) : (
          <span className="placeholder">Choose a record type...</span>
        )}
        <Icons.ChevronDown className={`chevron ${isOpen ? 'open' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="record-dropdown-menu">
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
          <div className="record-list">
            {Object.entries(filteredGrouped).map(([category, items]) => (
              <div key={category} className="record-category">
                <div className="category-header" style={{ borderLeftColor: CATEGORY_CONFIG[category]?.color }}>
                  <span className="category-icon">{CATEGORY_CONFIG[category]?.icon}</span>
                  {CATEGORY_CONFIG[category]?.label || category}
                </div>
                {items.map(record => (
                  <div
                    key={record.record_name}
                    className={`record-option ${selectedRecord === record.record_name ? 'selected' : ''}`}
                    onClick={() => { onSelect(record.record_name); setIsOpen(false); setSearch(''); }}
                  >
                    <div className="record-name">{record.display_name}</div>
                    <div className="record-desc">{record.description}</div>
                  </div>
                ))}
              </div>
            ))}
            {Object.keys(filteredGrouped).length === 0 && (
              <div className="no-results">No matching records found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Field Picker - Checkbox list of available columns
 */
const FieldPicker = ({ fields, selectedColumns, onToggle, onSelectAll, onSelectNone, onSelectDefaults }) => {
  const [search, setSearch] = useState('');
  
  const filteredFields = fields.filter(f => 
    f.display_name.toLowerCase().includes(search.toLowerCase()) ||
    f.field_name.toLowerCase().includes(search.toLowerCase())
  );

  const dataTypeIcons = {
    text: '📝',
    number: '#️⃣',
    currency: '💵',
    date: '📅',
    datetime: '🕐',
    boolean: '✓',
    enum: '📋',
  };

  return (
    <div className="field-picker">
      <div className="field-picker-header">
        <label>Select Columns ({selectedColumns.length} selected)</label>
        <div className="field-picker-actions">
          <button type="button" onClick={onSelectDefaults}>Defaults</button>
          <button type="button" onClick={onSelectAll}>All</button>
          <button type="button" onClick={onSelectNone}>None</button>
        </div>
      </div>
      <input
        type="text"
        placeholder="Search fields..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="field-search"
      />
      <div className="field-list">
        {filteredFields.map(field => (
          <label key={field.field_name} className={`field-item ${selectedColumns.includes(field.field_name) ? 'selected' : ''}`}>
            <input
              type="checkbox"
              checked={selectedColumns.includes(field.field_name)}
              onChange={() => onToggle(field.field_name)}
            />
            <span className="field-type-icon" title={field.data_type}>{dataTypeIcons[field.data_type] || '?'}</span>
            <span className="field-label">{field.display_name}</span>
          </label>
        ))}
        {filteredFields.length === 0 && (
          <div className="no-results">No matching fields</div>
        )}
      </div>
    </div>
  );
};

/**
 * Constraint Builder - Add/remove filter conditions
 */
const ConstraintBuilder = ({ fields, constraints, onChange }) => {
  const addConstraint = () => {
    const firstFilterable = fields.find(f => f.is_filterable);
    if (firstFilterable) {
      onChange([
        ...constraints,
        {
          id: Date.now().toString(),
          field: firstFilterable.field_name,
          operator: firstFilterable.operators[0]?.value || 'equals',
          value: '',
          value2: '',
        }
      ]);
    }
  };

  const updateConstraint = (id, updates) => {
    onChange(constraints.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeConstraint = (id) => {
    onChange(constraints.filter(c => c.id !== id));
  };

  const fieldMap = new Map(fields.map(f => [f.field_name, f]));

  return (
    <div className="constraint-builder">
      <div className="constraint-header">
        <label>Filters</label>
        <button type="button" className="add-constraint-btn" onClick={addConstraint}>
          <Icons.Plus /> Add Filter
        </button>
      </div>
      
      {constraints.length === 0 ? (
        <div className="no-constraints">No filters applied - showing all records</div>
      ) : (
        <div className="constraint-list">
          {constraints.map((constraint, index) => {
            const field = fieldMap.get(constraint.field);
            const operators = field?.operators || [];
            const selectedOp = operators.find(op => op.value === constraint.operator);
            
            return (
              <div key={constraint.id} className="constraint-row">
                {index > 0 && <span className="constraint-connector">AND</span>}
                
                <select
                  value={constraint.field}
                  onChange={(e) => {
                    const newField = fieldMap.get(e.target.value);
                    updateConstraint(constraint.id, {
                      field: e.target.value,
                      operator: newField?.operators[0]?.value || 'equals',
                      value: '',
                      value2: '',
                    });
                  }}
                >
                  {fields.filter(f => f.is_filterable).map(f => (
                    <option key={f.field_name} value={f.field_name}>{f.display_name}</option>
                  ))}
                </select>

                <select
                  value={constraint.operator}
                  onChange={(e) => updateConstraint(constraint.id, { operator: e.target.value, value: '', value2: '' })}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>

                {!selectedOp?.noValue && (
                  <>
                    {field?.data_type === 'enum' && field?.enum_values ? (
                      <select
                        value={constraint.value}
                        onChange={(e) => updateConstraint(constraint.id, { value: e.target.value })}
                      >
                        <option value="">Select...</option>
                        {field.enum_values.map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    ) : field?.data_type === 'boolean' ? (
                      <select
                        value={constraint.value}
                        onChange={(e) => updateConstraint(constraint.id, { value: e.target.value })}
                      >
                        <option value="">Select...</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : field?.data_type === 'date' || field?.data_type === 'datetime' ? (
                      <input
                        type="date"
                        value={constraint.value}
                        onChange={(e) => updateConstraint(constraint.id, { value: e.target.value })}
                      />
                    ) : (
                      <input
                        type={field?.data_type === 'number' || field?.data_type === 'currency' ? 'number' : 'text'}
                        value={constraint.value}
                        onChange={(e) => updateConstraint(constraint.id, { value: e.target.value })}
                        placeholder="Value..."
                      />
                    )}

                    {selectedOp?.twoValues && (
                      <>
                        <span className="between-and">and</span>
                        {field?.data_type === 'date' || field?.data_type === 'datetime' ? (
                          <input
                            type="date"
                            value={constraint.value2}
                            onChange={(e) => updateConstraint(constraint.id, { value2: e.target.value })}
                          />
                        ) : (
                          <input
                            type={field?.data_type === 'number' || field?.data_type === 'currency' ? 'number' : 'text'}
                            value={constraint.value2}
                            onChange={(e) => updateConstraint(constraint.id, { value2: e.target.value })}
                            placeholder="Value..."
                          />
                        )}
                      </>
                    )}
                  </>
                )}

                <button type="button" className="remove-constraint-btn" onClick={() => removeConstraint(constraint.id)}>
                  <Icons.X />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Sort Configurator - Set sort order
 */
const SortConfigurator = ({ fields, sortConfig, onChange }) => {
  const addSort = () => {
    const firstSortable = fields.find(f => f.is_sortable && !sortConfig.some(s => s.field === f.field_name));
    if (firstSortable) {
      onChange([...sortConfig, { field: firstSortable.field_name, direction: 'asc' }]);
    }
  };

  const updateSort = (index, updates) => {
    const newConfig = [...sortConfig];
    newConfig[index] = { ...newConfig[index], ...updates };
    onChange(newConfig);
  };

  const removeSort = (index) => {
    onChange(sortConfig.filter((_, i) => i !== index));
  };

  return (
    <div className="sort-configurator">
      <div className="sort-header">
        <label>Sort Order</label>
        <button type="button" className="add-sort-btn" onClick={addSort} disabled={sortConfig.length >= 3}>
          <Icons.Plus /> Add Sort
        </button>
      </div>
      
      {sortConfig.length === 0 ? (
        <div className="no-sort">No sorting applied</div>
      ) : (
        <div className="sort-list">
          {sortConfig.map((sort, index) => (
            <div key={index} className="sort-row">
              {index > 0 && <span className="sort-connector">then by</span>}
              <select
                value={sort.field}
                onChange={(e) => updateSort(index, { field: e.target.value })}
              >
                {fields.filter(f => f.is_sortable).map(f => (
                  <option key={f.field_name} value={f.field_name}>{f.display_name}</option>
                ))}
              </select>
              <select
                value={sort.direction}
                onChange={(e) => updateSort(index, { direction: e.target.value })}
              >
                <option value="asc">Ascending ↑</option>
                <option value="desc">Descending ↓</option>
              </select>
              <button type="button" className="remove-sort-btn" onClick={() => removeSort(index)}>
                <Icons.X />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Preview Table - Display query results
 */
const PreviewTable = ({ data, columns, fields, pagination, onPageChange, loading }) => {
  const fieldMap = new Map(fields.map(f => [f.field_name, f]));

  const formatValue = (value, field) => {
    if (value === null || value === undefined) return <span className="null-value">—</span>;
    
    if (field?.format_hint === 'currency' || field?.data_type === 'currency') {
      return formatCurrency(value);
    }
    if (field?.data_type === 'boolean') {
      return value ? '✓ Yes' : '✗ No';
    }
    if (field?.data_type === 'date') {
      return new Date(value).toLocaleDateString();
    }
    if (field?.data_type === 'datetime') {
      return new Date(value).toLocaleString();
    }
    if (field?.format_hint?.startsWith('decimal:')) {
      const decimals = parseInt(field.format_hint.split(':')[1]);
      return parseFloat(value).toFixed(decimals);
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className="preview-loading">
        <Icons.Loader className="spinner" /> Loading preview...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="preview-empty">
        <Icons.FileText />
        <p>No data to display</p>
        <span>Adjust your filters or select different columns</span>
      </div>
    );
  }

  return (
    <div className="preview-table-container">
      <div className="preview-table-wrapper">
        <table className="preview-table">
          <thead>
            <tr>
              {columns.map(col => {
                const field = fieldMap.get(col);
                return <th key={col}>{field?.display_name || col}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map(col => {
                  const field = fieldMap.get(col);
                  return (
                    <td key={col} className={field?.data_type === 'currency' || field?.data_type === 'number' ? 'numeric' : ''}>
                      {formatValue(row[col], field)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {pagination && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.totalRows)} of {pagination.totalRows} rows
          </div>
          <div className="pagination-controls">
            <button 
              disabled={!pagination.hasPrevPage} 
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <Icons.ChevronLeft /> Previous
            </button>
            <span className="page-indicator">Page {pagination.page} of {pagination.totalPages}</span>
            <button 
              disabled={!pagination.hasNextPage} 
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next <Icons.ChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Saved Reports Panel
 */
const SavedReportsPanel = ({ reports, onLoad, onDelete, onToggleFavorite, loading }) => {
  if (loading) {
    return <div className="saved-reports-loading"><Icons.Loader className="spinner" /> Loading reports...</div>;
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="saved-reports-empty">
        <Icons.FileText />
        <p>No saved reports yet</p>
        <span>Build a report and save it for quick access</span>
      </div>
    );
  }

  return (
    <div className="saved-reports-list">
      {reports.map(report => (
        <div key={report.id} className={`saved-report-item ${report.is_favorite ? 'favorite' : ''}`}>
          <div className="report-info" onClick={() => onLoad(report)}>
            <div className="report-name">
              {report.is_favorite && <span className="star">⭐</span>}
              {report.name}
            </div>
            <div className="report-meta">
              <span className="report-category">{CATEGORY_CONFIG[report.record_category]?.icon} {report.record_display_name}</span>
              {report.run_count > 0 && <span className="run-count">Run {report.run_count}x</span>}
            </div>
          </div>
          <div className="report-actions">
            <button title="Toggle Favorite" onClick={() => onToggleFavorite(report.id)}>
              {report.is_favorite ? '⭐' : '☆'}
            </button>
            <button title="Delete Report" onClick={() => onDelete(report.id)}>
              <Icons.Trash />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ReportBuilderView = () => {
  // State for record/field metadata
  const [records, setRecords] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [fields, setFields] = useState([]);
  
  // State for report configuration
  const [selectedRecord, setSelectedRecord] = useState('');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [sortConfig, setSortConfig] = useState([]);
  
  // State for preview
  const [previewData, setPreviewData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // State for saved reports
  const [savedReports, setSavedReports] = useState([]);
  const [savedReportsLoading, setSavedReportsLoading] = useState(false);
  const [loadedReportId, setLoadedReportId] = useState(null);
  
  // State for save modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  
  // UI state
  const [activeTab, setActiveTab] = useState('build'); // 'build' or 'saved'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [recordsRes] = await Promise.all([
          reportBuilderService.getRecords(),
        ]);
        setRecords(recordsRes.records || []);
        setGrouped(recordsRes.grouped || {});
        setError(null);
      } catch (err) {
        console.error('Failed to load report builder data:', err);
        setError('Failed to load report builder. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Load fields when record changes
  useEffect(() => {
    if (!selectedRecord) {
      setFields([]);
      setSelectedColumns([]);
      setConstraints([]);
      setSortConfig([]);
      setPreviewData([]);
      setPagination(null);
      return;
    }

    const loadFields = async () => {
      try {
        const fieldsRes = await reportBuilderService.getFields(selectedRecord);
        setFields(fieldsRes);
        
        // Auto-select default columns
        const defaults = fieldsRes.filter(f => f.default_selected).map(f => f.field_name);
        setSelectedColumns(defaults.length > 0 ? defaults : fieldsRes.slice(0, 5).map(f => f.field_name));
        
        // Reset other state
        setConstraints([]);
        setSortConfig([]);
        setPreviewData([]);
        setPagination(null);
        setLoadedReportId(null);
      } catch (err) {
        console.error('Failed to load fields:', err);
        setError('Failed to load fields for this record type.');
      }
    };
    loadFields();
  }, [selectedRecord]);

  // Load saved reports
  const loadSavedReports = useCallback(async () => {
    try {
      setSavedReportsLoading(true);
      const reports = await reportBuilderService.getReports();
      setSavedReports(reports);
    } catch (err) {
      console.error('Failed to load saved reports:', err);
    } finally {
      setSavedReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedReports();
  }, [loadSavedReports]);

  // Run preview
  const runPreview = async (page = 1) => {
    if (!selectedRecord || selectedColumns.length === 0) return;

    try {
      setPreviewLoading(true);
      setError(null);
      
      // Prepare constraints - filter out incomplete ones
      const validConstraints = constraints
        .filter(c => {
          const field = fields.find(f => f.field_name === c.field);
          const op = field?.operators?.find(o => o.value === c.operator);
          if (op?.noValue) return true;
          if (op?.twoValues) return c.value && c.value2;
          return c.value !== '';
        })
        .map(c => ({
          field: c.field,
          operator: c.operator,
          value: c.value,
          value2: c.value2,
        }));

      const result = await reportBuilderService.preview({
        recordName: selectedRecord,
        columns: selectedColumns,
        constraints: validConstraints,
        sortConfig,
        page,
        pageSize: 50,
      });

      setPreviewData(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Preview failed:', err);
      setError(err.response?.data?.error || 'Failed to run preview');
      setPreviewData([]);
      setPagination(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Column toggle handlers
  const toggleColumn = (fieldName) => {
    setSelectedColumns(prev => 
      prev.includes(fieldName) 
        ? prev.filter(c => c !== fieldName)
        : [...prev, fieldName]
    );
  };

  const selectAllColumns = () => setSelectedColumns(fields.map(f => f.field_name));
  const selectNoColumns = () => setSelectedColumns([]);
  const selectDefaultColumns = () => {
    const defaults = fields.filter(f => f.default_selected).map(f => f.field_name);
    setSelectedColumns(defaults.length > 0 ? defaults : fields.slice(0, 5).map(f => f.field_name));
  };

  // Save report
  const handleSaveReport = async () => {
    if (!reportName.trim()) {
      setError('Please enter a report name');
      return;
    }

    try {
      const validConstraints = constraints
        .filter(c => {
          const field = fields.find(f => f.field_name === c.field);
          const op = field?.operators?.find(o => o.value === c.operator);
          if (op?.noValue) return true;
          return c.value !== '';
        })
        .map(c => ({
          field: c.field,
          operator: c.operator,
          value: c.value,
          value2: c.value2,
        }));

      if (loadedReportId) {
        await reportBuilderService.updateReport(loadedReportId, {
          name: reportName,
          description: reportDescription,
          selectedColumns,
          constraints: validConstraints,
          sortConfig,
        });
      } else {
        const saved = await reportBuilderService.saveReport({
          name: reportName,
          description: reportDescription,
          recordType: selectedRecord,
          selectedColumns,
          constraints: validConstraints,
          sortConfig,
        });
        setLoadedReportId(saved.id);
      }

      setShowSaveModal(false);
      loadSavedReports();
      setError(null);
    } catch (err) {
      console.error('Failed to save report:', err);
      setError(err.response?.data?.error || 'Failed to save report');
    }
  };

  // Load saved report
  const handleLoadReport = async (report) => {
    setSelectedRecord(report.record_type);
    setLoadedReportId(report.id);
    setReportName(report.name);
    setReportDescription(report.description || '');
    setActiveTab('build');

    // Wait for fields to load, then set columns/constraints
    setTimeout(async () => {
      try {
        const fullReport = await reportBuilderService.getReport(report.id);
        setSelectedColumns(fullReport.selected_columns || []);
        setConstraints((fullReport.constraints || []).map((c, i) => ({ ...c, id: `loaded-${i}` })));
        setSortConfig(fullReport.sort_config || []);
      } catch (err) {
        console.error('Failed to load full report:', err);
      }
    }, 500);
  };

  // Delete report
  const handleDeleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await reportBuilderService.deleteReport(id);
      loadSavedReports();
      if (loadedReportId === id) {
        setLoadedReportId(null);
        setReportName('');
        setReportDescription('');
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
      setError('Failed to delete report');
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (id) => {
    try {
      await reportBuilderService.toggleFavorite(id);
      loadSavedReports();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      setError(null);
      
      const validConstraints = constraints
        .filter(c => {
          const field = fields.find(f => f.field_name === c.field);
          const op = field?.operators?.find(o => o.value === c.operator);
          if (op?.noValue) return true;
          return c.value !== '';
        })
        .map(c => ({
          field: c.field,
          operator: c.operator,
          value: c.value,
          value2: c.value2,
        }));

      const response = await reportBuilderService.exportPreview({
        recordName: selectedRecord,
        columns: selectedColumns,
        constraints: validConstraints,
        sortConfig,
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response header or generate one
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'report.csv';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export report');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="page report-builder-view">
        <div className="loading-container">
          <Icons.Loader className="spinner" />
          <p>Loading Report Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page report-builder-view">
      <div className="page-header">
        <h1><Icons.BarChart /> Report Builder</h1>
        <p>Create custom reports from your data</p>
      </div>

      {error && (
        <div className="error-banner">
          <Icons.AlertCircle /> {error}
          <button onClick={() => setError(null)}><Icons.X /></button>
        </div>
      )}

      <div className="report-builder-tabs">
        <button 
          className={activeTab === 'build' ? 'active' : ''} 
          onClick={() => setActiveTab('build')}
        >
          <Icons.Edit /> Build Report
        </button>
        <button 
          className={activeTab === 'saved' ? 'active' : ''} 
          onClick={() => setActiveTab('saved')}
        >
          <Icons.Save /> Saved Reports ({savedReports.length})
        </button>
      </div>

      {activeTab === 'saved' ? (
        <div className="saved-reports-panel card">
          <SavedReportsPanel
            reports={savedReports}
            loading={savedReportsLoading}
            onLoad={handleLoadReport}
            onDelete={handleDeleteReport}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      ) : (
        <div className="report-builder-layout">
          {/* Left Panel - Configuration */}
          <div className="config-panel">
            <div className="card">
              <RecordSelector
                records={records}
                grouped={grouped}
                selectedRecord={selectedRecord}
                onSelect={setSelectedRecord}
              />
            </div>

            {selectedRecord && fields.length > 0 && (
              <>
                <div className="card">
                  <FieldPicker
                    fields={fields}
                    selectedColumns={selectedColumns}
                    onToggle={toggleColumn}
                    onSelectAll={selectAllColumns}
                    onSelectNone={selectNoColumns}
                    onSelectDefaults={selectDefaultColumns}
                  />
                </div>

                <div className="card">
                  <ConstraintBuilder
                    fields={fields}
                    constraints={constraints}
                    onChange={setConstraints}
                  />
                </div>

                <div className="card">
                  <SortConfigurator
                    fields={fields}
                    sortConfig={sortConfig}
                    onChange={setSortConfig}
                  />
                </div>

                <div className="action-buttons">
                  <button 
                    className="btn btn-primary run-btn"
                    onClick={() => runPreview(1)}
                    disabled={selectedColumns.length === 0}
                  >
                    <Icons.Play /> Run Preview
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setReportName(loadedReportId ? reportName : '');
                      setShowSaveModal(true);
                    }}
                    disabled={selectedColumns.length === 0}
                  >
                    <Icons.Save /> {loadedReportId ? 'Update' : 'Save'} Report
                  </button>
                  {previewData.length > 0 && (
                    <button className="btn btn-secondary" onClick={handleExport}>
                      <Icons.Download /> Export CSV
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="preview-panel card">
            <div className="preview-header">
              <h3>Preview</h3>
              {pagination && (
                <span className="row-count">{pagination.totalRows} rows</span>
              )}
            </div>
            <PreviewTable
              data={previewData}
              columns={selectedColumns}
              fields={fields}
              pagination={pagination}
              onPageChange={runPreview}
              loading={previewLoading}
            />
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal save-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{loadedReportId ? 'Update Report' : 'Save Report'}</h2>
              <button className="close-btn" onClick={() => setShowSaveModal(false)}><Icons.X /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Report Name *</label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="My Custom Report"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSaveModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveReport}>
                {loadedReportId ? 'Update' : 'Save'} Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportBuilderView;
