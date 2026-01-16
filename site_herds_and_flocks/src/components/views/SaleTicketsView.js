/**
 * SaleTicketsView - Manage livestock sale tickets
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { saleTicketsService, buyersService, animalsService, saleFeeTypesService } from '../../services/api';

// ============================================================================
// SALE TICKET DETAIL VIEW
// ============================================================================

const SaleTicketDetail = ({ ticket, onBack, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('animals');

  const totalWeight = (ticket.items || []).reduce((sum, item) => sum + parseFloat(item.weight_lbs || 0), 0);
  const grossTotal = parseFloat(ticket.gross_amount || 0);
  const totalFees = parseFloat(ticket.total_fees || 0);
  const netTotal = parseFloat(ticket.net_amount || 0);

  return (
    <div className="netsuite-record">
      {/* Record Header Bar */}
      <div className="record-page-header">
        <button className="btn btn-icon" onClick={onBack} title="Back to list">
          <Icons.ArrowLeft />
        </button>
        <div className="record-title">
          <h1>Sale Ticket {ticket.ticket_number ? `#${ticket.ticket_number}` : ''}</h1>
          <span className="status-badge status-active">
            {ticket.payment_received ? 'Paid' : 'Unpaid'}
          </span>
        </div>
        <div className="record-actions">
          <button className="btn btn-secondary" onClick={onEdit}>
            <Icons.Edit2 /> Edit
          </button>
          <button className="btn btn-danger" onClick={() => onDelete(ticket.id)}>
            <Icons.Trash2 /> Delete
          </button>
        </div>
      </div>

      {/* Primary Info Card */}
      <div className="record-header-card">
        <div className="header-display">
          <div className="header-primary">
            <div className="header-main-info">
              <div className="ticket-avatar">
                <Icons.Receipt />
              </div>
              <div className="ticket-identity">
                <h2>{ticket.sold_to}</h2>
                <p className="ticket-subtitle">
                  {new Date(ticket.sale_date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="header-fields">
            <div className="header-field">
              <label>Ticket Number</label>
              <span>{ticket.ticket_number || '-'}</span>
            </div>
            <div className="header-field">
              <label>Buyer Phone</label>
              <span>{ticket.buyer_contact || '-'}</span>
            </div>
            <div className="header-field">
              <label>Total Weight</label>
              <span>{totalWeight.toLocaleString()} lbs</span>
            </div>
            <div className="header-field">
              <label>Animals</label>
              <span>{(ticket.items || []).length}</span>
            </div>
            <div className="header-field">
              <label>Gross Amount</label>
              <span>${grossTotal.toFixed(2)}</span>
            </div>
            <div className="header-field">
              <label>Total Fees</label>
              <span className="text-danger">-${totalFees.toFixed(2)}</span>
            </div>
            <div className="header-field">
              <label>Net Amount</label>
              <span className="net-amount">${netTotal.toFixed(2)}</span>
            </div>
            <div className="header-field">
              <label>Payment Status</label>
              <span>{ticket.payment_received ? 'Received' : 'Pending'}</span>
            </div>
          </div>

          {ticket.notes && (
            <div className="header-notes">
              <label>Notes</label>
              <p>{ticket.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Subtabs Section */}
      <div className="record-subtabs-section">
        <div className="subtabs-header">
          <div className="subtabs-nav">
            <button 
              className={`subtab ${activeTab === 'animals' ? 'active' : ''}`}
              onClick={() => setActiveTab('animals')}
            >
              <Icons.Tag />
              Animals
              <span className="subtab-count">{(ticket.items || []).length}</span>
            </button>
            <button 
              className={`subtab ${activeTab === 'fees' ? 'active' : ''}`}
              onClick={() => setActiveTab('fees')}
            >
              <Icons.DollarSign />
              Fees
              <span className="subtab-count">{(ticket.fees || []).length}</span>
            </button>
          </div>
        </div>

        <div className="subtab-content">
          {/* Animals Tab */}
          {activeTab === 'animals' && (
            <div className="subtab-panel">
              {(ticket.items || []).length === 0 ? (
                <div className="empty-subtab">
                  <Icons.Tag />
                  <p>No animals on this ticket</p>
                </div>
              ) : (
                <table className="subtab-table">
                  <thead>
                    <tr>
                      <th>Ear Tag</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Breed</th>
                      <th className="text-right">Weight (lbs)</th>
                      <th className="text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ticket.items || []).map((item, index) => (
                      <tr key={index}>
                        <td><strong>{item.ear_tag}</strong></td>
                        <td>{item.animal_name || '-'}</td>
                        <td>{item.animal_type || '-'}</td>
                        <td>{item.breed || '-'}</td>
                        <td className="text-right">{parseFloat(item.weight_lbs || 0).toLocaleString()}</td>
                        <td className="text-right"><strong>${parseFloat(item.line_total || item.price || 0).toFixed(2)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="totals-row">
                      <td colSpan="4"><strong>Totals</strong></td>
                      <td className="text-right"><strong>{totalWeight.toLocaleString()} lbs</strong></td>
                      <td className="text-right"><strong>${grossTotal.toFixed(2)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          )}

          {/* Fees Tab */}
          {activeTab === 'fees' && (
            <div className="subtab-panel">
              {(ticket.fees || []).length === 0 ? (
                <div className="empty-subtab">
                  <Icons.DollarSign />
                  <p>No fees on this ticket</p>
                </div>
              ) : (
                <table className="subtab-table">
                  <thead>
                    <tr>
                      <th>Fee Type</th>
                      <th>Description</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ticket.fees || []).map((fee, index) => (
                      <tr key={index}>
                        <td><strong>{fee.fee_type}</strong></td>
                        <td>{fee.description || '-'}</td>
                        <td className="text-right text-danger">-${parseFloat(fee.amount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="totals-row">
                      <td colSpan="2"><strong>Total Fees</strong></td>
                      <td className="text-right text-danger"><strong>-${totalFees.toFixed(2)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* NetSuite Record View Styles */
        .netsuite-record {
          padding: 0;
        }
        .record-page-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--gray-200);
        }
        .record-page-header .btn-icon {
          padding: 8px;
          border-radius: 8px;
          background: var(--gray-100);
        }
        .record-page-header .btn-icon:hover {
          background: var(--gray-200);
        }
        .record-title {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .record-title h1 {
          margin: 0;
          font-size: 1.5rem;
        }
        .record-actions {
          display: flex;
          gap: 8px;
        }
        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-badge.status-active {
          background: #dcfce7;
          color: #166534;
        }
        
        .record-header-card {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--gray-200);
          margin-bottom: 24px;
          overflow: hidden;
        }
        .header-display {
          padding: 24px;
        }
        .header-primary {
          margin-bottom: 24px;
        }
        .header-main-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .header-fields {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px 24px;
          padding-top: 20px;
          border-top: 1px solid var(--gray-100);
        }
        .header-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .header-field label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--gray-500);
          letter-spacing: 0.5px;
        }
        .header-field span {
          font-size: 14px;
          color: var(--gray-900);
        }
        .header-notes {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--gray-100);
        }
        .header-notes label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--gray-500);
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .header-notes p {
          margin: 0;
          color: var(--gray-700);
          line-height: 1.5;
        }
        
        /* Subtabs Section */
        .record-subtabs-section {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--gray-200);
          overflow: hidden;
        }
        .subtabs-header {
          background: var(--gray-50);
          border-bottom: 1px solid var(--gray-200);
          padding: 0 16px;
        }
        .subtabs-nav {
          display: flex;
          gap: 0;
        }
        .subtab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 20px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-600);
          transition: all 0.15s ease;
        }
        .subtab:hover {
          color: var(--gray-900);
          background: rgba(0,0,0,0.02);
        }
        .subtab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        .subtab svg {
          width: 16px;
          height: 16px;
        }
        .subtab-count {
          background: var(--gray-200);
          color: var(--gray-700);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
        }
        .subtab.active .subtab-count {
          background: var(--primary);
          color: white;
        }
        
        .subtab-content {
          padding: 0;
        }
        .subtab-panel {
          padding: 0;
        }
        .subtab-table {
          width: 100%;
          border-collapse: collapse;
        }
        .subtab-table th,
        .subtab-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid var(--gray-100);
        }
        .subtab-table th {
          background: var(--gray-50);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--gray-500);
          letter-spacing: 0.5px;
        }
        .subtab-table tbody tr:hover {
          background: var(--gray-50);
        }
        .subtab-table tfoot tr {
          background: var(--gray-100);
        }
        .subtab-table tfoot td {
          border-bottom: none;
        }
        
        .empty-subtab {
          text-align: center;
          padding: 48px 24px;
          color: var(--gray-500);
        }
        .empty-subtab svg {
          width: 40px;
          height: 40px;
          opacity: 0.4;
          margin-bottom: 12px;
        }
        .empty-subtab p {
          margin: 0;
        }
        
        .ticket-avatar {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #7A8B6E, #5a6b4e);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .ticket-avatar svg {
          width: 28px;
          height: 28px;
        }
        .ticket-identity h2 {
          font-size: 1.4rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px;
        }
        .ticket-subtitle {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 0;
        }
        .net-amount {
          font-weight: 700;
          color: #065f46;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// SALE TICKET FORM MODAL
// ============================================================================

const SaleTicketForm = ({ ticket, onSave, onCancel }) => {
  // Normalize ticket data - ensure items have 'price' field from line_total
  const normalizeTicket = (t) => {
    if (!t) return null;
    return {
      ...t,
      items: (t.items || []).map(item => ({
        ...item,
        price: parseFloat(item.price || item.line_total || item.price_per_head || 0)
      }))
    };
  };

  const normalizedTicket = normalizeTicket(ticket);
  
  const [form, setForm] = useState(normalizedTicket || {
    ticket_number: '',
    sale_date: new Date().toISOString().split('T')[0],
    sold_to: '',
    buyer_contact: '',
    notes: '',
    items: [],
    fees: []
  });
  const [buyers, setBuyers] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Selected animal for adding
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [itemWeight, setItemWeight] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  // New fee state
  const [selectedFeeTypeId, setSelectedFeeTypeId] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [feeDescription, setFeeDescription] = useState('');

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [buyersData, animalsData, feeTypesData] = await Promise.all([
        buyersService.getAll(true),
        animalsService.getAll({ status: 'Active', limit: 500 }),
        saleFeeTypesService.getAll()
      ]);
      setBuyers(buyersData);
      const animalsList = animalsData.data || animalsData;
      setAnimals(animalsList.filter(a => a.status === 'Active'));
      setFeeTypes(feeTypesData);
      
      // If editing existing ticket, lookup buyer phone if not already set
      if (normalizedTicket && normalizedTicket.sold_to && !normalizedTicket.buyer_contact) {
        const buyer = buyersData.find(b => b.name === normalizedTicket.sold_to);
        if (buyer && buyer.phone) {
          setForm(prev => ({ ...prev, buyer_contact: buyer.phone }));
        }
      }
    } catch (err) {
      console.error('Failed to load form data:', err);
    } finally {
      setLoading(false);
    }
  };

  const availableAnimals = animals.filter(
    a => !form.items.some(item => String(item.animal_id) === String(a.id))
  );

  const handleBuyerChange = (buyerName) => {
    const buyer = buyers.find(b => b.name === buyerName);
    if (buyer && buyer.phone) {
      setForm(prev => ({ ...prev, sold_to: buyerName, buyer_contact: buyer.phone }));
    } else {
      setForm(prev => ({ ...prev, sold_to: buyerName }));
    }
  };

  const handleAnimalSelect = (animalId) => {
    setSelectedAnimalId(animalId);
    if (animalId) {
      setTimeout(() => {
        const weightInput = document.getElementById('item-weight-input');
        if (weightInput) weightInput.focus();
      }, 50);
    }
  };

  const addAnimalToTicket = () => {
    if (!selectedAnimalId) return;
    const animal = animals.find(a => String(a.id) === String(selectedAnimalId));
    if (!animal) return;

    const weight = parseFloat(itemWeight) || 0;
    const price = parseFloat(itemPrice) || 0;
    
    const newItem = {
      animal_id: animal.id,
      ear_tag: animal.ear_tag,
      animal_name: animal.name || '',
      animal_type: animal.animal_type_name || animal.species || '',
      breed: animal.breed_name || '',
      weight_lbs: weight,
      price: price,
      line_total: price
    };

    setForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setSelectedAnimalId('');
    setItemWeight('');
    setItemPrice('');
    
    // Focus back to animal selector
    setTimeout(() => {
      const animalSelect = document.getElementById('animal-select');
      if (animalSelect) animalSelect.focus();
    }, 50);
  };

  const removeItem = (index) => {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleFeeTypeSelect = (feeTypeId) => {
    setSelectedFeeTypeId(feeTypeId);
    const feeType = feeTypes.find(ft => String(ft.id) === String(feeTypeId));
    if (feeType) {
      setFeeDescription(feeType.name);
      if (feeType.is_percentage && feeType.percentage_rate) {
        const grossTotal = form.items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
        setFeeAmount(((grossTotal * feeType.percentage_rate) / 100).toFixed(2));
      } else if (feeType.default_amount) {
        setFeeAmount(parseFloat(feeType.default_amount).toFixed(2));
      } else {
        setFeeAmount('');
      }
    }
  };

  const addFee = () => {
    if (!feeDescription || !feeAmount) return;
    setForm(prev => ({
      ...prev,
      fees: [...prev.fees, { fee_type: feeDescription, description: '', amount: parseFloat(feeAmount) }]
    }));
    setSelectedFeeTypeId('');
    setFeeDescription('');
    setFeeAmount('');
  };

  const removeFee = (index) => {
    setForm(prev => ({ ...prev, fees: prev.fees.filter((_, i) => i !== index) }));
  };

  const totalWeight = form.items.reduce((sum, item) => sum + parseFloat(item.weight_lbs || 0), 0);
  const grossTotal = form.items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
  const totalFees = form.fees.reduce((sum, fee) => sum + parseFloat(fee.amount || 0), 0);
  const netTotal = grossTotal - totalFees;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) {
      setError('Please add at least one animal to the ticket');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message || 'Failed to save ticket');
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedAnimalId && itemWeight && itemPrice) {
        addAnimalToTicket();
      }
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content modal-xl">
          <div className="loading-state">
            <Icons.Loader className="animate-spin" />
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-xl" style={{ maxHeight: '90vh', overflowY: 'auto', overflowX: 'hidden' }}>
        <div className="modal-header">
          <h2>{ticket ? 'Edit Sale Ticket' : 'New Sale Ticket'}</h2>
          <button className="modal-close" onClick={onCancel}><Icons.X /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                <Icons.AlertCircle />
                {error}
              </div>
            )}

            <div className="ticket-summary-header">
              <div className="summary-stat">
                <span className="summary-label">Animals</span>
                <span className="summary-value">{form.items.length}</span>
              </div>
              <div className="summary-stat">
                <span className="summary-label">Total Weight</span>
                <span className="summary-value">{totalWeight.toLocaleString()} lbs</span>
              </div>
              <div className="summary-stat">
                <span className="summary-label">Gross Total</span>
                <span className="summary-value">${grossTotal.toFixed(2)}</span>
              </div>
              <div className="summary-stat">
                <span className="summary-label">Fees</span>
                <span className="summary-value text-danger">-${totalFees.toFixed(2)}</span>
              </div>
              <div className="summary-stat highlight">
                <span className="summary-label">Net Total</span>
                <span className="summary-value">${netTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="form-section">
              <h3>Ticket Information</h3>
              <div className="ticket-info-grid">
                <div className="form-group">
                  <label>Ticket Number</label>
                  <input
                    type="text"
                    value={form.ticket_number}
                    onChange={(e) => setForm({ ...form, ticket_number: e.target.value })}
                    placeholder="Optional reference number"
                  />
                </div>
                <div className="form-group">
                  <label>Sale Date *</label>
                  <input
                    type="date"
                    required
                    value={form.sale_date}
                    onChange={(e) => setForm({ ...form, sale_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Sold To *</label>
                  <input
                    type="text"
                    required
                    list="buyers-list"
                    value={form.sold_to}
                    onChange={(e) => handleBuyerChange(e.target.value)}
                    placeholder="Buyer name or business"
                  />
                  <datalist id="buyers-list">
                    {buyers.map(b => <option key={b.id} value={b.name} />)}
                  </datalist>
                </div>
                <div className="form-group">
                  <label>Buyer Phone</label>
                  <input
                    type="tel"
                    value={form.buyer_contact}
                    onChange={(e) => setForm({ ...form, buyer_contact: e.target.value })}
                    placeholder="(555) 555-5555"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Add Animals to Sale</h3>
              <div className="add-animal-form">
                <div className="add-animal-row">
                  <div className="form-group animal-select-group">
                    <label>Select Animal</label>
                    <select id="animal-select" value={selectedAnimalId} onChange={(e) => handleAnimalSelect(e.target.value)}>
                      <option value="">-- Select an active animal --</option>
                      {availableAnimals.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.ear_tag} {a.name ? `- ${a.name}` : ''} ({a.species || a.animal_type_name || 'Unknown'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group weight-group">
                    <label>Weight (lbs)</label>
                    <input
                      id="item-weight-input"
                      type="number"
                      step="0.1"
                      min="0"
                      value={itemWeight}
                      onChange={(e) => setItemWeight(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group price-group">
                    <label>Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group add-btn-group">
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={addAnimalToTicket}
                      disabled={!selectedAnimalId || !itemWeight || !itemPrice}
                    >
                      <Icons.Plus /> Add
                    </button>
                  </div>
                </div>
              </div>

              {form.items.length > 0 && (
                <div className="items-table-container">
                  <table className="data-table" style={{ tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '100px' }}>Ear Tag</th>
                        <th style={{ width: '120px' }}>Name</th>
                        <th>Type/Breed</th>
                        <th style={{ width: '120px' }} className="text-right">Weight (lbs)</th>
                        <th style={{ width: '120px' }} className="text-right">Price</th>
                        <th style={{ width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((item, index) => (
                        <tr key={index}>
                          <td><strong>{item.ear_tag}</strong></td>
                          <td>{item.animal_name || '-'}</td>
                          <td>
                            {item.animal_type}
                            {item.breed && <span className="text-muted"> / {item.breed}</span>}
                          </td>
                          <td className="text-right">{parseFloat(item.weight_lbs).toLocaleString()}</td>
                          <td className="text-right"><strong>${parseFloat(item.price).toFixed(2)}</strong></td>
                          <td className="text-center">
                            <button type="button" className="btn btn-sm btn-icon btn-danger" onClick={() => removeItem(index)} title="Remove">
                              <Icons.Trash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="totals-row">
                        <td colSpan="3"><strong>Totals</strong></td>
                        <td className="text-right"><strong>{totalWeight.toLocaleString()} lbs</strong></td>
                        <td className="text-right"><strong>${grossTotal.toFixed(2)}</strong></td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {form.items.length === 0 && (
                <div className="empty-items-message">
                  <Icons.Tag />
                  <p>No animals added yet. Select an animal above to add it to this sale.</p>
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>Fees & Deductions</h3>
              <div className="add-fee-form">
                <div className="add-fee-row">
                  <div className="form-group fee-type-group">
                    <label>Fee Type</label>
                    <select value={selectedFeeTypeId} onChange={(e) => handleFeeTypeSelect(e.target.value)}>
                      <option value="">-- Select fee type --</option>
                      {feeTypes.map(ft => (
                        <option key={ft.id} value={ft.id}>
                          {ft.name} {ft.is_percentage ? `(${ft.percentage_rate}%)` : ft.default_amount ? `($${ft.default_amount})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group fee-desc-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={feeDescription}
                      onChange={(e) => setFeeDescription(e.target.value)}
                      placeholder="Fee name"
                    />
                  </div>
                  <div className="form-group fee-amount-group">
                    <label>Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={feeAmount}
                      onChange={(e) => setFeeAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group add-btn-group">
                    <button type="button" className="btn btn-secondary" onClick={addFee} disabled={!feeDescription || !feeAmount}>
                      <Icons.Plus /> Add Fee
                    </button>
                  </div>
                </div>
              </div>

              {form.fees.length > 0 && (
                <div className="fees-table-container">
                  <table className="data-table" style={{ tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        <th>Fee Type</th>
                        <th style={{ width: '150px' }} className="text-right">Amount</th>
                        <th style={{ width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.fees.map((fee, index) => (
                        <tr key={index}>
                          <td><strong>{fee.fee_type}</strong></td>
                          <td className="text-right text-danger">-${parseFloat(fee.amount).toFixed(2)}</td>
                          <td className="text-center">
                            <button type="button" className="btn btn-sm btn-icon btn-danger" onClick={() => removeFee(index)} title="Remove">
                              <Icons.Trash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="totals-row">
                        <td><strong>Total Fees</strong></td>
                        <td className="text-right text-danger"><strong>-${totalFees.toFixed(2)}</strong></td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional notes about this sale"
                rows={2}
              />
            </div>
          </div>

          <div className="modal-footer">
            <div className="footer-totals">
              <span>Net Total: <strong>${netTotal.toFixed(2)}</strong></span>
            </div>
            <div className="footer-actions">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving || form.items.length === 0}>
                {saving ? 'Saving...' : (ticket ? 'Update Ticket' : 'Create Ticket')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN VIEW
// ============================================================================

const SaleTicketsView = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'detail', 'form'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterYear, setFilterYear] = useState('all');

  useEffect(() => {
    loadTickets();
  }, [filterYear]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params = filterYear === 'all' ? {} : { year: filterYear };
      const data = await saleTicketsService.getAll(params);
      const ticketsList = Array.isArray(data) ? data : (data.data || []);
      setTickets(ticketsList);
    } catch (err) {
      setError('Failed to load sale tickets');
      console.error('Load tickets error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedTicket) {
        await saleTicketsService.update(selectedTicket.id, formData);
      } else {
        await saleTicketsService.create(formData);
      }
      setView('list');
      setSelectedTicket(null);
      await loadTickets();
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sale ticket?')) return;
    try {
      await saleTicketsService.delete(id);
      setView('list');
      setSelectedTicket(null);
      await loadTickets();
    } catch (err) {
      setError('Failed to delete ticket');
      console.error(err);
    }
  };

  const viewTicket = async (id) => {
    try {
      const ticket = await saleTicketsService.getById(id);
      setSelectedTicket(ticket);
      setView('detail');
    } catch (err) {
      setError('Failed to load ticket details');
      console.error(err);
    }
  };

  const editTicket = () => {
    setView('form');
  };

  const newTicket = () => {
    setSelectedTicket(null);
    setView('form');
  };

  const backToList = () => {
    setView('list');
    setSelectedTicket(null);
  };

  // Calculate totals
  const totalGross = tickets.reduce((sum, t) => sum + parseFloat(t.gross_amount || 0), 0);
  const totalNet = tickets.reduce((sum, t) => sum + parseFloat(t.net_amount || 0), 0);
  const totalHead = tickets.reduce((sum, t) => sum + parseInt(t.total_head || t.item_count || 0), 0);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Show detail view
  if (view === 'detail' && selectedTicket) {
    return (
      <SaleTicketDetail 
        ticket={selectedTicket} 
        onBack={backToList} 
        onEdit={editTicket}
        onDelete={handleDelete}
      />
    );
  }

  // Show form modal over list or detail
  const showFormModal = view === 'form';

  if (loading) {
    return (
      <div className="loading-state">
        <Icons.Loader className="animate-spin" />
        <p>Loading sale tickets...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Sale Tickets</h1>
          <p className="subtitle">Record and track livestock sales</p>
        </div>
        <button className="btn btn-primary" onClick={newTicket}>
          <Icons.Plus /> New Sale Ticket
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <Icons.AlertCircle />
          {error}
          <button onClick={() => setError(null)}><Icons.X /></button>
        </div>
      )}

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Tickets</span>
            <span className="stat-value">{tickets.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Animals</span>
            <span className="stat-value">{totalHead}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Gross Sales</span>
            <span className="stat-value">${totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Net Sales</span>
            <span className="stat-value">${totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ margin: 0, fontWeight: 500 }}>Year:</label>
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ width: '120px' }}>
              <option value="all">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {tickets.length === 0 ? (
            <div className="empty-state">
              <Icons.Receipt />
              <h3>No sale tickets{filterYear !== 'all' ? ` for ${filterYear}` : ''}</h3>
              <p>Create a sale ticket to record livestock sales</p>
              <button className="btn btn-primary" onClick={newTicket}>
                <Icons.Plus /> Create First Ticket
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Ticket #</th>
                    <th>Sold To</th>
                    <th>Phone</th>
                    <th className="text-right">Animals</th>
                    <th className="text-right">Gross</th>
                    <th className="text-right">Fees</th>
                    <th className="text-right">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="clickable" onClick={() => viewTicket(ticket.id)}>
                      <td>{new Date(ticket.sale_date).toLocaleDateString()}</td>
                      <td>{ticket.ticket_number || '-'}</td>
                      <td><strong>{ticket.sold_to}</strong></td>
                      <td>{ticket.buyer_contact || '-'}</td>
                      <td className="text-right">{ticket.item_count || 0}</td>
                      <td className="text-right">${parseFloat(ticket.gross_amount || 0).toFixed(2)}</td>
                      <td className="text-right text-danger">-${parseFloat(ticket.total_fees || 0).toFixed(2)}</td>
                      <td className="text-right"><strong>${parseFloat(ticket.net_amount || 0).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showFormModal && (
        <SaleTicketForm
          ticket={selectedTicket}
          onSave={handleSave}
          onCancel={backToList}
        />
      )}

      <style>{`
        .ticket-summary-header {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid var(--gray-200);
        }
        .summary-stat {
          flex: 1;
          text-align: center;
          padding: 8px;
        }
        .summary-stat.highlight {
          background: var(--primary);
          color: white;
          border-radius: 8px;
        }
        .summary-label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 600;
          opacity: 0.7;
          margin-bottom: 4px;
        }
        .summary-value {
          display: block;
          font-size: 18px;
          font-weight: 700;
        }
        .summary-stat.highlight .summary-label {
          opacity: 0.9;
        }
        
        .form-section {
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--gray-200);
        }
        .form-section:last-of-type {
          border-bottom: none;
          margin-bottom: 16px;
        }
        .form-section h3 {
          margin: 0 0 16px 0;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--gray-500);
          letter-spacing: 0.5px;
        }
        
        .ticket-info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        
        .add-animal-form, .add-fee-form {
          background: var(--gray-50);
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          border: 1px solid var(--gray-200);
        }
        .add-animal-row, .add-fee-row {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }
        
        .animal-select-group { flex: 1 1 auto; min-width: 250px; }
        .weight-group { flex: 0 0 100px; }
        .price-group { flex: 0 0 100px; }
        .add-btn-group { flex: 0 0 auto; }
        .fee-type-group { flex: 0 0 180px; }
        .fee-desc-group { flex: 1 1 auto; min-width: 150px; }
        .fee-amount-group { flex: 0 0 100px; }
        
        .items-table-container, .fees-table-container {
          margin-top: 16px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--gray-200);
        }
        .items-table-container .data-table,
        .fees-table-container .data-table { margin: 0; }
        .totals-row { background: var(--gray-100); }
        .totals-row td { font-weight: 600; }
        
        .empty-items-message {
          text-align: center;
          padding: 32px;
          color: var(--gray-500);
        }
        .empty-items-message svg {
          width: 40px;
          height: 40px;
          margin-bottom: 12px;
          opacity: 0.5;
        }
        .empty-items-message p { margin: 0; }
        
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-danger { color: #dc2626; }
        
        .clickable {
          cursor: pointer;
        }
        .clickable:hover {
          background: var(--gray-50);
        }
        .text-muted { color: var(--gray-500); font-size: 12px; }
        
        .btn-icon { padding: 6px; min-width: auto; }
        .btn-icon svg { width: 14px; height: 14px; }
        
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--gray-200);
        }
        .modal-header h2 { margin: 0; font-size: 18px; }
        .modal-close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: var(--gray-500);
        }
        .modal-close:hover { color: var(--gray-700); }
        .modal-body { padding: 20px; padding-bottom: 24px; }
        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-top: 1px solid var(--gray-200);
          background: var(--gray-50);
          border-radius: 0 0 12px 12px;
        }
        .footer-totals { font-size: 16px; }
        .footer-totals strong { font-size: 20px; color: var(--primary); }
        .footer-actions { display: flex; gap: 12px; }
        
        @media (max-width: 900px) {
          .ticket-info-grid { grid-template-columns: repeat(2, 1fr); }
          .add-animal-row, .add-fee-row { flex-wrap: wrap; }
          .animal-select-group, .fee-desc-group { flex: 1 1 100%; }
          .weight-group, .price-group, .fee-type-group, .fee-amount-group { flex: 1 1 calc(50% - 6px); }
          .add-btn-group { flex: 1 1 100%; }
          .add-btn-group button { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SaleTicketsView;
