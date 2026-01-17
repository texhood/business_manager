/**
 * DataImportView Component
 * Tenant data population tool with CSV import functionality
 */

import React, { useState, useEffect, useRef } from 'react';
import { dataImportService } from '../../services/api';
import { Icons } from '../common/Icons';
import './DataImportView.css';

const DataImportView = () => {
  // State
  const [importTypes, setImportTypes] = useState({ types: [], grouped: {} });
  const [selectedType, setSelectedType] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Load import types on mount
  useEffect(() => {
    loadImportTypes();
  }, []);

  const loadImportTypes = async () => {
    setLoading(true);
    try {
      const data = await dataImportService.getTypes();
      setImportTypes(data);
      // Expand all categories by default
      setExpandedCategories(Object.keys(data.grouped || {}));
    } catch (err) {
      console.error('Failed to load import types:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setFile(null);
    setValidationResults(null);
    setImportResults(null);
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleDownloadTemplate = () => {
    if (selectedType) {
      dataImportService.downloadTemplate(selectedType.id);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationResults(null);
      setImportResults(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
      setValidationResults(null);
      setImportResults(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setValidationResults(null);
    setImportResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleValidate = async () => {
    if (!file || !selectedType) return;

    setValidating(true);
    setValidationResults(null);
    try {
      const results = await dataImportService.validate(selectedType.id, file);
      setValidationResults(results);
    } catch (err) {
      console.error('Validation failed:', err);
      setValidationResults({
        error: err.response?.data?.error || 'Validation failed. Please check your file format.'
      });
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    if (!file || !selectedType) return;

    setImporting(true);
    setImportResults(null);
    try {
      const results = await dataImportService.execute(selectedType.id, file);
      setImportResults(results);
      // Clear file after successful import
      if (results.imported > 0) {
        setFile(null);
        setValidationResults(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      console.error('Import failed:', err);
      setImportResults({
        error: err.response?.data?.error || 'Import failed. Please try again.'
      });
    } finally {
      setImporting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getCategoryClass = (category) => {
    const categoryMap = {
      'Livestock Reference': 'livestock',
      'Livestock': 'livestock',
      'Inventory': 'inventory',
      'Accounting': 'accounting',
      'Operations': 'operations',
      'Food Service': 'food-service'
    };
    return categoryMap[category] || 'default';
  };

  const getTypeIcon = (typeId) => {
    const iconMap = {
      'animal_types': Icons.Tag,
      'animal_categories': Icons.List,
      'breeds': Icons.Tag,
      'animal_owners': Icons.Users,
      'pastures': Icons.MapPin,
      'buyers': Icons.Users,
      'sale_fee_types': Icons.DollarSign,
      'herds_flocks': Icons.List,
      'animals': Icons.Truck,
      'categories': Icons.Tag,
      'tags': Icons.Tag,
      'items': Icons.Package,
      'delivery_zones': Icons.MapPin,
      'accounts_chart': Icons.Book,
      'classes': Icons.List,
      'vendors': Icons.Users,
      'transactions': Icons.DollarSign,
      'journal_entries': Icons.FileText,
      'menu_items': Icons.Menu,
      'modifications': Icons.Edit
    };
    const IconComponent = iconMap[typeId] || Icons.FileText;
    return <IconComponent size={16} />;
  };

  // Render import type selector
  const renderTypeSelector = () => (
    <div className="import-type-selector">
      <h2>Import Types</h2>
      {Object.entries(importTypes.grouped || {}).map(([category, types]) => (
        <div key={category} className={`import-category category-${getCategoryClass(category)}`}>
          <div className="category-header" onClick={() => toggleCategory(category)}>
            <h3>
              <span className="category-dot"></span>
              {category}
            </h3>
            <span className={`chevron ${expandedCategories.includes(category) ? 'expanded' : ''}`}>
              <Icons.ChevronDown size={16} />
            </span>
          </div>
          {expandedCategories.includes(category) && (
            <div className="category-items">
              {types.map((type) => (
                <button
                  key={type.id}
                  className={`import-type-btn ${selectedType?.id === type.id ? 'active' : ''}`}
                  onClick={() => handleTypeSelect(type)}
                >
                  <div className="type-icon">
                    {getTypeIcon(type.id)}
                  </div>
                  <div className="type-info">
                    <div className="type-name">{type.label}</div>
                    <div className="type-cols">{type.columns.length} columns</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Render workspace
  const renderWorkspace = () => {
    if (!selectedType) {
      return (
        <div className="workspace-empty">
          <div className="empty-icon">
            <Icons.FileText size={32} />
          </div>
          <h3>Select an Import Type</h3>
          <p>Choose an import type from the left panel to get started</p>
        </div>
      );
    }

    return (
      <>
        {/* Header */}
        <div className="workspace-header">
          <h2>{selectedType.label}</h2>
          <div className="type-category">{selectedType.category}</div>
        </div>

        {/* Template Download */}
        <div className="template-section">
          <h3>Step 1: Download Template</h3>
          <div className="template-card">
            <div className="template-icon">
              <Icons.Download size={20} />
            </div>
            <div className="template-info">
              <h4>CSV Template</h4>
              <p>Download the template with all required columns and sample data</p>
            </div>
            <button className="download-template-btn" onClick={handleDownloadTemplate}>
              <Icons.Download size={16} />
              Download
            </button>
          </div>
        </div>

        {/* Column Reference */}
        <div className="columns-section">
          <h3>Column Reference</h3>
          <div className="columns-grid">
            {selectedType.columns.map((col) => (
              <div
                key={col}
                className={`column-tag ${selectedType.required?.includes(col) ? 'required' : ''}`}
              >
                <span>{col}</span>
                {selectedType.required?.includes(col) && (
                  <span className="required-badge">Required</span>
                )}
              </div>
            ))}
          </div>
          {selectedType.validations && Object.keys(selectedType.validations).length > 0 && (
            <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: '#6b7280' }}>
              <strong>Allowed values:</strong>
              {Object.entries(selectedType.validations).map(([field, values]) => (
                <div key={field} style={{ marginTop: '0.25rem' }}>
                  <code>{field}</code>: {values.join(', ')}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <h3>Step 2: Upload & Import</h3>

          {file ? (
            <div className="file-selected">
              <div className="file-icon">
                <Icons.FileText size={20} />
              </div>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{formatFileSize(file.size)}</div>
              </div>
              <button className="remove-file-btn" onClick={handleRemoveFile}>
                <Icons.X size={20} />
              </button>
            </div>
          ) : (
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="upload-icon">
                <Icons.Upload size={48} />
              </div>
              <p>Drop your CSV file here or click to browse</p>
              <div className="upload-hint">Only CSV files are accepted (max 10MB)</div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileSelect}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="import-actions">
            <button
              className="validate-btn"
              onClick={handleValidate}
              disabled={!file || validating}
            >
              {validating ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16 }}></span>
                  Validating...
                </>
              ) : (
                <>
                  <Icons.CheckCircle size={16} />
                  Validate
                </>
              )}
            </button>
            <button
              className="import-btn"
              onClick={handleImport}
              disabled={!file || importing}
            >
              {importing ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}></span>
                  Importing...
                </>
              ) : (
                <>
                  <Icons.Upload size={16} />
                  Import Data
                </>
              )}
            </button>
          </div>

          {/* Validation Results */}
          {validationResults && !validationResults.error && (
            <div className={`validation-results ${validationResults.invalidRows > 0 ? 'has-errors' : 'success'}`}>
              <div className="validation-header">
                <div className={`status-icon ${validationResults.invalidRows > 0 ? 'error' : 'success'}`}>
                  {validationResults.invalidRows > 0 ? (
                    <Icons.AlertCircle size={18} />
                  ) : (
                    <Icons.CheckCircle size={18} />
                  )}
                </div>
                <h4>
                  {validationResults.invalidRows > 0
                    ? 'Validation Found Issues'
                    : 'Validation Passed'}
                </h4>
              </div>

              <div className="validation-stats">
                <div className="stat">
                  <div className="stat-value">{validationResults.totalRows}</div>
                  <div className="stat-label">Total Rows</div>
                </div>
                <div className="stat">
                  <div className="stat-value success">{validationResults.validRows}</div>
                  <div className="stat-label">Valid</div>
                </div>
                {validationResults.invalidRows > 0 && (
                  <div className="stat">
                    <div className="stat-value error">{validationResults.invalidRows}</div>
                    <div className="stat-label">Invalid</div>
                  </div>
                )}
              </div>

              {/* Preview Table */}
              {validationResults.preview && validationResults.preview.length > 0 && (
                <div className="preview-section">
                  <h5>Preview (First {validationResults.preview.length} valid rows)</h5>
                  <div className="preview-table-wrapper">
                    <table className="preview-table">
                      <thead>
                        <tr>
                          {Object.keys(validationResults.preview[0]).map((col) => (
                            <th key={col}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {validationResults.preview.map((row, idx) => (
                          <tr key={idx}>
                            {Object.values(row).map((val, vidx) => (
                              <td key={vidx}>{val || '-'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Errors */}
              {validationResults.errors && validationResults.errors.length > 0 && (
                <div className="error-list">
                  <h5>Errors ({validationResults.errors.length})</h5>
                  <ul>
                    {validationResults.errors.slice(0, 20).map((err, idx) => (
                      <li key={idx}>
                        <strong>Row {err.row}:</strong> {err.errors.join('; ')}
                      </li>
                    ))}
                    {validationResults.errors.length > 20 && (
                      <li>... and {validationResults.errors.length - 20} more errors</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Validation Error */}
          {validationResults?.error && (
            <div className="validation-results has-errors">
              <div className="validation-header">
                <div className="status-icon error">
                  <Icons.AlertCircle size={18} />
                </div>
                <h4>Validation Failed</h4>
              </div>
              <p style={{ margin: 0, color: '#991b1b' }}>{validationResults.error}</p>
            </div>
          )}

          {/* Import Results */}
          {importResults && !importResults.error && (
            <div className={`import-results ${importResults.errors > 0 ? 'has-errors' : ''}`}>
              <h4>
                <Icons.CheckCircle size={20} />
                Import Complete
              </h4>
              <div className="results-summary">
                <div className="result-stat">
                  <div className="result-value">{importResults.totalRows}</div>
                  <div className="result-label">Total</div>
                </div>
                <div className="result-stat">
                  <div className="result-value imported">{importResults.imported}</div>
                  <div className="result-label">Imported</div>
                </div>
                {importResults.errors > 0 && (
                  <div className="result-stat">
                    <div className="result-value errors">{importResults.errors}</div>
                    <div className="result-label">Errors</div>
                  </div>
                )}
                {importResults.skipped > 0 && (
                  <div className="result-stat">
                    <div className="result-value skipped">{importResults.skipped}</div>
                    <div className="result-label">Skipped</div>
                  </div>
                )}
              </div>

              {/* Details */}
              {importResults.details && (
                <details className="results-details">
                  <summary>View Details</summary>
                  <div className="detail-list">
                    {importResults.details.success?.slice(0, 20).map((item, idx) => (
                      <div key={`s-${idx}`} className="detail-item success">
                        Row {item.row}: Imported {JSON.stringify(item.record)}
                      </div>
                    ))}
                    {importResults.details.errors?.slice(0, 20).map((item, idx) => (
                      <div key={`e-${idx}`} className="detail-item error">
                        Row {item.row}: {item.error}
                      </div>
                    ))}
                    {importResults.details.skipped?.slice(0, 10).map((item, idx) => (
                      <div key={`k-${idx}`} className="detail-item">
                        Row {item.row}: Skipped - {item.reason}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Import Error */}
          {importResults?.error && (
            <div className="import-results has-errors">
              <h4>
                <Icons.AlertCircle size={20} />
                Import Failed
              </h4>
              <p style={{ margin: 0, color: '#991b1b' }}>{importResults.error}</p>
            </div>
          )}
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="data-import-view">
        <div className="loading-overlay">
          <div className="spinner"></div>
          <span>Loading import types...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="data-import-view">
      <h1>Data Import</h1>
      <p className="subtitle">Import CSV data to populate tenant tables</p>

      <div className="import-layout">
        {renderTypeSelector()}
        <div className="import-workspace">
          {renderWorkspace()}
        </div>
      </div>
    </div>
  );
};

export default DataImportView;
