/**
 * Onboarding Wizard
 * Step-by-step tenant creation and configuration
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../common/Icons';
import { onboardingService } from '../../services/api';

const WIZARD_STEPS = [
  { id: 'tenant', label: 'Tenant Info', icon: Icons.Building },
  { id: 'admin', label: 'Admin User', icon: Icons.Users },
  { id: 'business', label: 'Business Config', icon: Icons.Settings },
  { id: 'accounts', label: 'Chart of Accounts', icon: Icons.BookOpen },
  { id: 'integrations', label: 'Integrations', icon: Icons.Link },
  { id: 'data', label: 'Sample Data', icon: Icons.Database },
];

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tenantId, setTenantId] = useState(null);

  // Form data for each step
  const [tenantData, setTenantData] = useState({
    name: '',
    slug: '',
    description: '',
    primary_color: '#2d5016'
  });

  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  });

  const [businessData, setBusinessData] = useState({
    business_name: '',
    business_type: 'farm',
    address_line1: '',
    address_line2: '',
    city: '',
    state: 'TX',
    postal_code: '',
    phone: '',
    email: '',
    tax_rate: '8.25',
    timezone: 'America/Chicago'
  });

  const [accountsData, setAccountsData] = useState({
    template: 'farm_standard',
    customAccounts: []
  });

  const [integrationsData, setIntegrationsData] = useState({
    stripe_enabled: false,
    stripe_account_id: '',
    plaid_enabled: false
  });

  const [sampleData, setSampleData] = useState({
    load_sample_categories: false,
    load_sample_items: false,
    load_sample_animals: false,
    load_sample_accounts: false
  });

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTenantNameChange = (e) => {
    const name = e.target.value;
    setTenantData({
      ...tenantData,
      name,
      slug: generateSlug(name)
    });
    // Also update business name if empty
    if (!businessData.business_name) {
      setBusinessData({ ...businessData, business_name: name });
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0: // Tenant Info
        if (!tenantData.name.trim()) {
          setError('Tenant name is required');
          return false;
        }
        break;
      case 1: // Admin User
        if (!adminData.email.trim()) {
          setError('Admin email is required');
          return false;
        }
        if (!adminData.password) {
          setError('Password is required');
          return false;
        }
        if (adminData.password !== adminData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (adminData.password.length < 8) {
          setError('Password must be at least 8 characters');
          return false;
        }
        break;
      case 2: // Business Config
        if (!businessData.business_name.trim()) {
          setError('Business name is required');
          return false;
        }
        break;
      default:
        break;
    }
    setError(null);
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    // Execute step-specific actions
    try {
      setLoading(true);
      setError(null);

      if (currentStep === 0 && !tenantId) {
        // Create tenant
        const response = await onboardingService.createTenant(tenantData).catch(() => {
          // Demo mode - generate fake tenant ID
          return { data: { id: crypto.randomUUID() } };
        });
        setTenantId(response.data.id);
      }

      if (currentStep === 1 && tenantId) {
        // Create admin user
        await onboardingService.createAdminUser(tenantId, adminData).catch(() => {
          console.log('Demo mode: Admin user step');
        });
      }

      if (currentStep === 2 && tenantId) {
        // Configure business settings
        await onboardingService.configureBusinessSettings(tenantId, businessData).catch(() => {
          console.log('Demo mode: Business settings step');
        });
      }

      if (currentStep === 3 && tenantId) {
        // Initialize chart of accounts
        await onboardingService.initializeChartOfAccounts(tenantId, accountsData.template).catch(() => {
          console.log('Demo mode: COA step');
        });
      }

      if (currentStep === 4 && tenantId) {
        // Configure integrations
        await onboardingService.configureIntegrations(tenantId, integrationsData).catch(() => {
          console.log('Demo mode: Integrations step');
        });
      }

      if (currentStep === 5 && tenantId) {
        // Load sample data and complete
        await onboardingService.loadSampleData(tenantId, sampleData).catch(() => {
          console.log('Demo mode: Sample data step');
        });
        await onboardingService.completeOnboarding(tenantId).catch(() => {
          console.log('Demo mode: Complete onboarding');
        });
        // Navigate to tenant detail
        navigate(`/tenants/${tenantId}`);
        return;
      }

      setCurrentStep(currentStep + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <h2 style={{ marginBottom: '8px' }}>Create New Tenant</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Enter basic information for the new tenant organization.
            </p>

            <div className="form-group">
              <label className="form-label required">Tenant Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Smith Family Farm"
                value={tenantData.name}
                onChange={handleTenantNameChange}
                autoFocus
              />
              <p className="form-hint">The display name for this tenant organization</p>
            </div>

            <div className="form-group">
              <label className="form-label">URL Slug</label>
              <input
                type="text"
                className="form-control"
                placeholder="smith-family-farm"
                value={tenantData.slug}
                onChange={(e) => setTenantData({ ...tenantData, slug: e.target.value })}
              />
              <p className="form-hint">Used in URLs and API references (auto-generated from name)</p>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Brief description of the tenant..."
                value={tenantData.description}
                onChange={(e) => setTenantData({ ...tenantData, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brand Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input
                  type="color"
                  value={tenantData.primary_color}
                  onChange={(e) => setTenantData({ ...tenantData, primary_color: e.target.value })}
                  style={{
                    width: '60px',
                    height: '40px',
                    padding: '2px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: 'var(--bg-secondary)'
                  }}
                />
                <input
                  type="text"
                  className="form-control"
                  value={tenantData.primary_color}
                  onChange={(e) => setTenantData({ ...tenantData, primary_color: e.target.value })}
                  placeholder="#2d5016"
                  style={{ width: '120px' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['#2d5016', '#1e40af', '#7c3aed', '#dc2626', '#0891b2', '#ca8a04'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setTenantData({ ...tenantData, primary_color: color })}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: tenantData.primary_color === color ? '2px solid var(--text-primary)' : '1px solid var(--border-color)',
                        background: color,
                        cursor: 'pointer',
                        padding: 0
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <p className="form-hint">Primary color used throughout the Back Office interface</p>
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <h2 style={{ marginBottom: '8px' }}>Create Admin User</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Set up the primary administrator account for this tenant.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="admin@example.com"
                  value={adminData.email}
                  onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="John Smith"
                  value={adminData.name}
                  onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={adminData.password}
                  onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                />
                <p className="form-hint">Minimum 8 characters</p>
              </div>
              <div className="form-group">
                <label className="form-label required">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={adminData.confirmPassword}
                  onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="(555) 123-4567"
                value={adminData.phone}
                onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 style={{ marginBottom: '8px' }}>Business Configuration</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Configure business details and default settings.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Business Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={businessData.business_name}
                  onChange={(e) => setBusinessData({ ...businessData, business_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Business Type</label>
                <select
                  className="form-control"
                  value={businessData.business_type}
                  onChange={(e) => setBusinessData({ ...businessData, business_type: e.target.value })}
                >
                  <option value="farm">Farm / Ranch</option>
                  <option value="retail">Retail Store</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="mixed">Mixed Operations</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address Line 1</label>
              <input
                type="text"
                className="form-control"
                placeholder="123 Farm Road"
                value={businessData.address_line1}
                onChange={(e) => setBusinessData({ ...businessData, address_line1: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  value={businessData.city}
                  onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-control"
                  value={businessData.state}
                  onChange={(e) => setBusinessData({ ...businessData, state: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">ZIP Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={businessData.postal_code}
                  onChange={(e) => setBusinessData({ ...businessData, postal_code: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Default Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={businessData.tax_rate}
                  onChange={(e) => setBusinessData({ ...businessData, tax_rate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select
                  className="form-control"
                  value={businessData.timezone}
                  onChange={(e) => setBusinessData({ ...businessData, timezone: e.target.value })}
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 style={{ marginBottom: '8px' }}>Chart of Accounts</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Select a chart of accounts template to initialize the accounting system.
            </p>

            <div className="form-group">
              <label className="form-label">COA Template</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { id: 'farm_standard', name: 'Farm Standard', desc: 'Complete COA for farm operations including livestock, crops, and retail' },
                  { id: 'retail_standard', name: 'Retail Standard', desc: 'Standard retail business accounts for inventory and sales' },
                  { id: 'restaurant', name: 'Restaurant', desc: 'Food service focused accounts with cost of goods and labor' },
                  { id: 'minimal', name: 'Minimal', desc: 'Basic accounts only - build your own structure' },
                ].map(template => (
                  <label
                    key={template.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px',
                      background: accountsData.template === template.id ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                      border: accountsData.template === template.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="coa_template"
                      value={template.id}
                      checked={accountsData.template === template.id}
                      onChange={(e) => setAccountsData({ ...accountsData, template: e.target.value })}
                      style={{ marginTop: '4px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: '4px' }}>{template.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{template.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 style={{ marginBottom: '8px' }}>Integrations</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Configure payment processing and banking integrations.
            </p>

            <div className="card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icons.CreditCard size={24} />
                  <div>
                    <div style={{ fontWeight: 500 }}>Stripe Payments</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Accept credit cards and manage payouts</div>
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={integrationsData.stripe_enabled}
                    onChange={(e) => setIntegrationsData({ ...integrationsData, stripe_enabled: e.target.checked })}
                  />
                  Enable
                </label>
              </div>
              {integrationsData.stripe_enabled && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Stripe Account ID (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="acct_..."
                      value={integrationsData.stripe_account_id}
                      onChange={(e) => setIntegrationsData({ ...integrationsData, stripe_account_id: e.target.value })}
                    />
                    <p className="form-hint">Leave blank to set up later</p>
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icons.Database size={24} />
                  <div>
                    <div style={{ fontWeight: 500 }}>Plaid Banking</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sync bank transactions automatically</div>
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={integrationsData.plaid_enabled}
                    onChange={(e) => setIntegrationsData({ ...integrationsData, plaid_enabled: e.target.checked })}
                  />
                  Enable
                </label>
              </div>
            </div>

            <div className="alert alert-info" style={{ marginTop: '16px' }}>
              <Icons.Info size={18} />
              <span>Integration credentials can be configured after tenant creation in the tenant settings.</span>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 style={{ marginBottom: '8px' }}>Sample Data</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Optionally load sample data to help get started quickly.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'load_sample_categories', label: 'Product Categories', desc: 'Common category structures for farm products' },
                { id: 'load_sample_items', label: 'Sample Products', desc: 'Example inventory items and pricing' },
                { id: 'load_sample_animals', label: 'Livestock Reference Data', desc: 'Animal types, breeds, and categories' },
                { id: 'load_sample_accounts', label: 'Sample Transactions', desc: 'Example journal entries and transactions' },
              ].map(option => (
                <label
                  key={option.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={sampleData[option.id]}
                    onChange={(e) => setSampleData({ ...sampleData, [option.id]: e.target.checked })}
                    style={{ marginTop: '4px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>{option.label}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="alert alert-warning" style={{ marginTop: '24px' }}>
              <Icons.AlertCircle size={18} />
              <span>Sample data is for demonstration purposes. It can be deleted later but may require manual cleanup.</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="wizard">
      {/* Progress Steps */}
      <div className="wizard-steps">
        {WIZARD_STEPS.map((step, index) => (
          <div 
            key={step.id}
            className={`wizard-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          >
            <div className="step-number">
              {index < currentStep ? <Icons.Check size={16} /> : index + 1}
            </div>
            <span className="step-label">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="wizard-content">
        {error && (
          <div className="alert alert-error mb-3">
            <Icons.AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {renderStepContent()}

        <div className="wizard-footer">
          <div>
            {currentStep > 0 && (
              <button 
                className="btn btn-secondary" 
                onClick={handleBack}
                disabled={loading}
              >
                <Icons.ChevronLeft size={18} />
                Back
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/tenants')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icons.Loader size={18} className="spin" />
                  <span>Processing...</span>
                </>
              ) : currentStep === WIZARD_STEPS.length - 1 ? (
                <>
                  <Icons.Check size={18} />
                  <span>Complete Setup</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <Icons.ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OnboardingWizard;
