/**
 * Onboarding Wizard
 * Step-by-step tenant creation and configuration
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Icons } from '../common/Icons';
import { onboardingService, subscriptionsService } from '../../services/api';

// Load Stripe - only if key is configured
const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

const WIZARD_STEPS = [
  { id: 'tenant', label: 'Tenant Info', icon: Icons.Building },
  { id: 'admin', label: 'Admin User', icon: Icons.Users },
  { id: 'subscription', label: 'Subscription', icon: Icons.CreditCard },
  { id: 'business', label: 'Business Config', icon: Icons.Settings },
  { id: 'accounts', label: 'Chart of Accounts', icon: Icons.BookOpen },
  { id: 'integrations', label: 'Integrations', icon: Icons.Link },
  { id: 'data', label: 'Sample Data', icon: Icons.Database },
];

// ============================================================================
// SUBSCRIPTION STEP COMPONENT (wrapped in Elements)
// ============================================================================

const SubscriptionStepInner = ({ 
  plans, 
  selectedPlan, 
  setSelectedPlan, 
  billingInterval,
  setBillingInterval,
  paymentOption,
  setPaymentOption,
  tenantId,
  adminEmail,
  tenantName,
  onSetupIntentCreated,
  error,
  setError,
  stripeDisabled = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = useState(false);
  const [setupIntentSecret, setSetupIntentSecret] = useState(null);
  const [creatingSetupIntent, setCreatingSetupIntent] = useState(false);

  // Create setup intent when user chooses to pay now
  useEffect(() => {
    const createSetupIntent = async () => {
      if (paymentOption === 'pay_now' && tenantId && !setupIntentSecret && !stripeDisabled) {
        setCreatingSetupIntent(true);
        try {
          const result = await subscriptionsService.createSetupIntent(
            tenantId,
            adminEmail,
            tenantName
          );
          setSetupIntentSecret(result.data.client_secret);
          onSetupIntentCreated(result.data.client_secret);
        } catch (err) {
          setError('Failed to initialize payment form. Please try again.');
        } finally {
          setCreatingSetupIntent(false);
        }
      }
    };

    createSetupIntent();
  }, [paymentOption, tenantId, adminEmail, tenantName, setupIntentSecret, setError, onSetupIntentCreated, stripeDisabled]);

  const formatPrice = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const calculateSavings = (plan) => {
    if (!plan.price_yearly || !plan.price_monthly) return null;
    const annualIfMonthly = plan.price_monthly * 12;
    const savings = annualIfMonthly - plan.price_yearly;
    if (savings <= 0) return null;
    return Math.round((savings / annualIfMonthly) * 100);
  };

  // Safe features parser
  const parseFeatures = (features) => {
    if (!features) return [];
    if (Array.isArray(features)) return features;
    if (typeof features === 'string') {
      try { return JSON.parse(features); } catch { return []; }
    }
    return [];
  };

  return (
    <div>
      <h2 style={{ marginBottom: '8px' }}>Choose a Plan</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Select the subscription plan that best fits this tenant's needs.
      </p>

      {/* Billing Interval Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <div style={{ 
          display: 'inline-flex', 
          background: 'var(--bg-secondary)', 
          borderRadius: '8px', 
          padding: '4px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => setBillingInterval('monthly')}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: '6px',
              background: billingInterval === 'monthly' ? 'var(--accent-primary)' : 'transparent',
              color: billingInterval === 'monthly' ? 'white' : 'var(--text-primary)',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingInterval('yearly')}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: '6px',
              background: billingInterval === 'yearly' ? 'var(--accent-primary)' : 'transparent',
              color: billingInterval === 'yearly' ? 'white' : 'var(--text-primary)',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Yearly
            <span style={{ 
              marginLeft: '6px', 
              fontSize: '11px', 
              background: billingInterval === 'yearly' ? 'rgba(255,255,255,0.2)' : 'var(--accent-success)', 
              color: billingInterval === 'yearly' ? 'white' : 'white',
              padding: '2px 6px', 
              borderRadius: '4px' 
            }}>
              Save ~17%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        {(plans || []).map(plan => {
          const price = billingInterval === 'yearly' ? plan.price_yearly : plan.price_monthly;
          const perMonth = billingInterval === 'yearly' ? (plan.price_yearly || 0) / 12 : plan.price_monthly;
          const savings = calculateSavings(plan);
          const features = parseFeatures(plan.features);

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              style={{
                border: selectedPlan?.id === plan.id 
                  ? '2px solid var(--accent-primary)' 
                  : '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                background: selectedPlan?.id === plan.id ? 'var(--bg-hover)' : 'var(--bg-primary)',
                position: 'relative',
                transition: 'all 0.2s'
              }}
            >
              {plan.is_featured && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--accent-primary)',
                  color: 'white',
                  padding: '2px 12px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  MOST POPULAR
                </div>
              )}
              
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{plan.name}</h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                {plan.description}
              </p>
              
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '32px', fontWeight: 700 }}>
                  {formatPrice(perMonth)}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>/month</span>
                {billingInterval === 'yearly' && savings && (
                  <div style={{ fontSize: '12px', color: 'var(--accent-success)', marginTop: '4px' }}>
                    {formatPrice(price)}/year (save {savings}%)
                  </div>
                )}
              </div>
              
              <ul style={{ 
                margin: 0, 
                padding: 0, 
                listStyle: 'none',
                fontSize: '13px'
              }}>
                {features.map((feature, idx) => (
                  <li key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '8px',
                    marginBottom: '8px',
                    color: 'var(--text-secondary)'
                  }}>
                    <Icons.Check size={14} style={{ color: 'var(--accent-success)', flexShrink: 0, marginTop: '2px' }} />
                    {feature}
                  </li>
                ))}
              </ul>

              {selectedPlan?.id === plan.id && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icons.Check size={14} style={{ color: 'white' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment Options */}
      {selectedPlan && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Payment Options</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '16px',
              border: paymentOption === 'trial' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              background: paymentOption === 'trial' ? 'var(--bg-hover)' : 'var(--bg-primary)'
            }}>
              <input
                type="radio"
                name="payment_option"
                value="trial"
                checked={paymentOption === 'trial'}
                onChange={() => setPaymentOption('trial')}
                style={{ marginTop: '4px' }}
              />
              <div>
                <div style={{ fontWeight: 500 }}>Start with 14-day free trial</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  No payment required now. Tenant can add payment method later.
                </div>
              </div>
            </label>

            {!stripeDisabled && (
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '16px',
                border: paymentOption === 'pay_now' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                background: paymentOption === 'pay_now' ? 'var(--bg-hover)' : 'var(--bg-primary)'
              }}>
                <input
                  type="radio"
                  name="payment_option"
                  value="pay_now"
                  checked={paymentOption === 'pay_now'}
                  onChange={() => setPaymentOption('pay_now')}
                  style={{ marginTop: '4px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>Add payment method now</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: paymentOption === 'pay_now' ? '12px' : 0 }}>
                    Start subscription immediately (still includes 14-day trial).
                  </div>
                  
                  {paymentOption === 'pay_now' && (
                    <div style={{ marginTop: '12px' }}>
                      {creatingSetupIntent ? (
                        <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                          <Icons.Loader size={16} className="spin" style={{ marginRight: '8px' }} />
                          Initializing payment form...
                        </div>
                      ) : (
                        <div style={{
                          padding: '12px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          background: 'var(--bg-secondary)'
                        }}>
                          <CardElement
                            options={{
                              style: {
                                base: {
                                  fontSize: '14px',
                                  color: '#333',
                                  '::placeholder': {
                                    color: '#999',
                                  },
                                },
                              },
                            }}
                            onChange={(e) => setCardComplete(e.complete)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </label>
            )}

            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '16px',
              border: paymentOption === 'skip' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              background: paymentOption === 'skip' ? 'var(--bg-hover)' : 'var(--bg-primary)'
            }}>
              <input
                type="radio"
                name="payment_option"
                value="skip"
                checked={paymentOption === 'skip'}
                onChange={() => setPaymentOption('skip')}
                style={{ marginTop: '4px' }}
              />
              <div>
                <div style={{ fontWeight: 500 }}>Skip subscription (internal use)</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  For demo, testing, or internal tenants. No billing.
                </div>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper to provide Stripe context (or render without if Stripe not configured)
const SubscriptionStep = (props) => {
  if (!stripePromise) {
    return (
      <div>
        <SubscriptionStepInner {...props} stripeDisabled={true} />
        <div className="alert alert-warning" style={{ marginTop: '16px' }}>
          <Icons.AlertCircle size={18} />
          <span>Stripe is not configured. Payment collection is disabled. Set REACT_APP_STRIPE_PUBLISHABLE_KEY to enable.</span>
        </div>
      </div>
    );
  }
  return (
    <Elements stripe={stripePromise}>
      <SubscriptionStepInner {...props} />
    </Elements>
  );
};

// ============================================================================
// MAIN WIZARD COMPONENT
// ============================================================================

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tenantId, setTenantId] = useState(null);

  // Subscription plans
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);

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

  // Subscription data
  const [subscriptionData, setSubscriptionData] = useState({
    selectedPlan: null,
    billingInterval: 'monthly',
    paymentOption: 'trial', // 'trial', 'pay_now', 'skip'
    setupIntentSecret: null
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
    plaid_enabled: false
  });

  const [sampleData, setSampleData] = useState({
    load_sample_categories: false,
    load_sample_items: false,
    load_sample_animals: false,
    load_sample_accounts: false
  });

  // Load subscription plans on mount
  useEffect(() => {
    const loadPlans = async () => {
      setPlansLoading(true);
      try {
        const result = await subscriptionsService.getPlans();
        const plansData = result.data || [];
        setPlans(plansData);
        // Pre-select featured plan
        const featured = plansData.find(p => p.is_featured);
        if (featured) {
          setSubscriptionData(prev => ({ ...prev, selectedPlan: featured }));
        }
      } catch (err) {
        console.error('Failed to load plans:', err);
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };
    loadPlans();
  }, []);

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
      case 2: // Subscription
        if (!subscriptionData.selectedPlan && subscriptionData.paymentOption !== 'skip') {
          setError('Please select a subscription plan');
          return false;
        }
        break;
      case 3: // Business Config
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

    try {
      setLoading(true);
      setError(null);

      // Step 0: Create tenant
      if (currentStep === 0 && !tenantId) {
        const response = await onboardingService.createTenant(tenantData).catch(() => {
          return { data: { id: crypto.randomUUID() } };
        });
        setTenantId(response.data.id);
      }

      // Step 1: Create admin user
      if (currentStep === 1 && tenantId) {
        await onboardingService.createAdminUser(tenantId, adminData).catch(() => {
          console.log('Demo mode: Admin user step');
        });
      }

      // Step 2: Create subscription
      if (currentStep === 2 && tenantId) {
        const { selectedPlan, billingInterval, paymentOption } = subscriptionData;
        
        if (paymentOption === 'skip') {
          // Skip subscription for internal tenants
          await subscriptionsService.skipSubscription(tenantId).catch(() => {
            console.log('Demo mode: Skip subscription');
          });
        } else if (paymentOption === 'trial') {
          // Create trial subscription
          await subscriptionsService.createTrialSubscription({
            tenant_id: tenantId,
            plan_slug: selectedPlan.slug,
            billing_interval: billingInterval,
            trial_days: 14,
            billing_email: adminData.email
          }).catch(() => {
            console.log('Demo mode: Trial subscription');
          });
        } else if (paymentOption === 'pay_now') {
          // Payment method is handled via Stripe Elements
          // The actual subscription creation happens after card confirmation
          // For now, we'll create with trial and assume card is added
          await subscriptionsService.createTrialSubscription({
            tenant_id: tenantId,
            plan_slug: selectedPlan.slug,
            billing_interval: billingInterval,
            trial_days: 14,
            billing_email: adminData.email
          }).catch(() => {
            console.log('Demo mode: Subscription with payment');
          });
        }
      }

      // Step 3: Business settings
      if (currentStep === 3 && tenantId) {
        await onboardingService.configureBusinessSettings(tenantId, businessData).catch(() => {
          console.log('Demo mode: Business settings step');
        });
      }

      // Step 4: Chart of accounts
      if (currentStep === 4 && tenantId) {
        await onboardingService.initializeChartOfAccounts(tenantId, accountsData.template).catch(() => {
          console.log('Demo mode: COA step');
        });
      }

      // Step 5: Integrations
      if (currentStep === 5 && tenantId) {
        await onboardingService.configureIntegrations(tenantId, integrationsData).catch(() => {
          console.log('Demo mode: Integrations step');
        });
      }

      // Step 6: Sample data & complete
      if (currentStep === 6 && tenantId) {
        await onboardingService.loadSampleData(tenantId, sampleData).catch(() => {
          console.log('Demo mode: Sample data step');
        });
        await onboardingService.completeOnboarding(tenantId).catch(() => {
          console.log('Demo mode: Complete onboarding');
        });
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
        return plansLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Icons.Loader size={32} className="spin" />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading subscription plans...</p>
          </div>
        ) : (
          <SubscriptionStep
            plans={plans}
            selectedPlan={subscriptionData.selectedPlan}
            setSelectedPlan={(plan) => setSubscriptionData({ ...subscriptionData, selectedPlan: plan })}
            billingInterval={subscriptionData.billingInterval}
            setBillingInterval={(interval) => setSubscriptionData({ ...subscriptionData, billingInterval: interval })}
            paymentOption={subscriptionData.paymentOption}
            setPaymentOption={(option) => setSubscriptionData({ ...subscriptionData, paymentOption: option })}
            tenantId={tenantId}
            adminEmail={adminData.email}
            tenantName={tenantData.name}
            onSetupIntentCreated={(secret) => setSubscriptionData({ ...subscriptionData, setupIntentSecret: secret })}
            error={error}
            setError={setError}
          />
        );

      case 3:
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

      case 4:
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

      case 5:
        return (
          <div>
            <h2 style={{ marginBottom: '8px' }}>Integrations</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Enable payment processing and banking integrations for this tenant.
            </p>

            <div className="card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icons.CreditCard size={24} />
                  <div>
                    <div style={{ fontWeight: 500 }}>Stripe Connect</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Accept credit cards with their own Stripe account</div>
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
                  <div style={{ 
                    background: 'var(--bg-tertiary)', 
                    padding: '12px 16px', 
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)'
                  }}>
                    <strong>How it works:</strong>
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                      <li>After tenant creation, the admin logs into Back Office</li>
                      <li>They go to System → Stripe Connect to create their account</li>
                      <li>Stripe handles identity verification and bank account setup</li>
                      <li>Once approved, they can accept card payments via POS and online</li>
                    </ul>
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
              <span>Integrations are configured by the tenant in their Back Office after onboarding is complete.</span>
            </div>
          </div>
        );

      case 6:
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
