/**
 * StripeConnectView Component
 * Manages Stripe Connect account setup and status
 */

import React, { useState, useEffect, useCallback } from 'react';
import { connectService } from '../../services/api';
import './StripeConnectView.css';

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

function StatusBadge({ status, enabled }) {
  const getStatusConfig = () => {
    if (enabled) {
      return { label: 'Active', className: 'status-active' };
    }
    switch (status) {
      case 'active':
        return { label: 'Active', className: 'status-active' };
      case 'onboarding':
        return { label: 'Onboarding', className: 'status-pending' };
      case 'pending':
        return { label: 'Pending', className: 'status-pending' };
      case 'restricted':
        return { label: 'Restricted', className: 'status-error' };
      case 'not_connected':
      default:
        return { label: 'Not Connected', className: 'status-inactive' };
    }
  };

  const config = getStatusConfig();
  return <span className={`status-badge ${config.className}`}>{config.label}</span>;
}

// ============================================================================
// REQUIREMENTS LIST COMPONENT
// ============================================================================

function RequirementsList({ requirements }) {
  if (!requirements) return null;

  const { currently_due, eventually_due, past_due } = requirements;
  const hasRequirements = 
    (currently_due?.length > 0) || 
    (eventually_due?.length > 0) || 
    (past_due?.length > 0);

  if (!hasRequirements) return null;

  const formatRequirement = (req) => {
    // Convert Stripe requirement keys to human-readable text
    const mapping = {
      'business_profile.url': 'Business website URL',
      'business_profile.mcc': 'Business category',
      'company.address.city': 'Business city',
      'company.address.line1': 'Business address',
      'company.address.postal_code': 'Business postal code',
      'company.address.state': 'Business state',
      'company.phone': 'Business phone number',
      'company.tax_id': 'Tax ID (EIN)',
      'individual.address.city': 'Owner city',
      'individual.address.line1': 'Owner address',
      'individual.address.postal_code': 'Owner postal code',
      'individual.address.state': 'Owner state',
      'individual.dob.day': 'Owner date of birth',
      'individual.dob.month': 'Owner date of birth',
      'individual.dob.year': 'Owner date of birth',
      'individual.email': 'Owner email',
      'individual.first_name': 'Owner first name',
      'individual.last_name': 'Owner last name',
      'individual.phone': 'Owner phone number',
      'individual.ssn_last_4': 'Last 4 digits of SSN',
      'external_account': 'Bank account for payouts',
      'tos_acceptance.date': 'Terms of service acceptance',
      'tos_acceptance.ip': 'Terms of service acceptance',
    };
    return mapping[req] || req.replace(/_/g, ' ').replace(/\./g, ' → ');
  };

  return (
    <div className="requirements-section">
      {past_due?.length > 0 && (
        <div className="requirements-group requirements-urgent">
          <h4>⚠️ Past Due (Action Required)</h4>
          <ul>
            {past_due.map((req, i) => (
              <li key={i}>{formatRequirement(req)}</li>
            ))}
          </ul>
        </div>
      )}
      {currently_due?.length > 0 && (
        <div className="requirements-group requirements-current">
          <h4>📋 Currently Due</h4>
          <ul>
            {currently_due.map((req, i) => (
              <li key={i}>{formatRequirement(req)}</li>
            ))}
          </ul>
        </div>
      )}
      {eventually_due?.length > 0 && (
        <div className="requirements-group requirements-eventual">
          <h4>📝 Eventually Due</h4>
          <ul>
            {eventually_due.map((req, i) => (
              <li key={i}>{formatRequirement(req)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StripeConnectView() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Check for URL params (return from Stripe onboarding)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setMessage({ type: 'success', text: 'Stripe account setup completed! Refreshing status...' });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('refresh') === 'true') {
      setMessage({ type: 'info', text: 'Onboarding was interrupted. You can continue where you left off.' });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await connectService.getStatus();
      setStatus(data);
    } catch (err) {
      console.error('Error loading Connect status:', err);
      setMessage({ type: 'error', text: 'Failed to load Stripe Connect status' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleCreateAccount = async () => {
    try {
      setActionLoading(true);
      setMessage({ type: 'info', text: 'Creating Stripe account...' });
      
      await connectService.createAccount();
      setMessage({ type: 'success', text: 'Stripe account created! Starting onboarding...' });
      
      // Immediately start onboarding
      await handleStartOnboarding();
    } catch (err) {
      console.error('Error creating account:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create Stripe account' });
      setActionLoading(false);
    }
  };

  const handleStartOnboarding = async () => {
    try {
      setActionLoading(true);
      const currentUrl = window.location.href.split('?')[0];
      const data = await connectService.getOnboardingLink(
        `${currentUrl}?success=true`,
        `${currentUrl}?refresh=true`
      );
      
      // Redirect to Stripe
      window.location.href = data.url;
    } catch (err) {
      console.error('Error getting onboarding link:', err);
      setMessage({ type: 'error', text: 'Failed to start onboarding. Please try again.' });
      setActionLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    try {
      setActionLoading(true);
      const data = await connectService.getLoginLink();
      window.open(data.url, '_blank');
    } catch (err) {
      console.error('Error getting dashboard link:', err);
      setMessage({ type: 'error', text: 'Failed to open Stripe dashboard' });
    } finally {
      setActionLoading(false);
    }
  };

  // Auto-clear messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="stripe-connect-view">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading Stripe Connect status...</p>
        </div>
      </div>
    );
  }

  const isConnected = status?.connected;
  const isFullyActive = status?.charges_enabled && status?.payouts_enabled;
  const needsOnboarding = isConnected && !status?.details_submitted;
  const hasRequirements = status?.requirements?.currently_due?.length > 0 || 
                          status?.requirements?.past_due?.length > 0;

  return (
    <div className="stripe-connect-view">
      <div className="view-header">
        <div>
          <h1>Stripe Connect</h1>
          <p className="view-subtitle">Manage your payment processing account</p>
        </div>
        {isConnected && (
          <button
            onClick={loadStatus}
            className="btn btn-secondary"
            disabled={actionLoading}
          >
            Refresh Status
          </button>
        )}
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Not Connected State */}
      {!isConnected && (
        <div className="connect-card connect-card-empty">
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <h2>Connect Your Stripe Account</h2>
            <p>
              Set up Stripe Connect to accept credit card payments directly into your own bank account.
              You'll have full control over your payment processing with your own Stripe dashboard.
            </p>
            <div className="benefits-list">
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span>Accept card payments in-person and online</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span>Automatic deposits to your bank account</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span>Access to Stripe's dashboard and reporting</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span>Industry-leading security and fraud protection</span>
              </div>
            </div>
            <button
              onClick={handleCreateAccount}
              className="btn btn-primary btn-large"
              disabled={actionLoading}
            >
              {actionLoading ? 'Setting up...' : 'Get Started with Stripe'}
            </button>
            <p className="setup-note">
              Setup takes about 5-10 minutes. You'll need your business information and bank account details.
            </p>
          </div>
        </div>
      )}

      {/* Connected State */}
      {isConnected && (
        <>
          {/* Status Overview Card */}
          <div className="connect-card">
            <div className="card-header">
              <h2>Account Status</h2>
              <StatusBadge status={status.account_status} enabled={isFullyActive} />
            </div>
            
            <div className="status-grid">
              <div className="status-item">
                <span className="status-label">Account ID</span>
                <span className="status-value mono">{status.account_id}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Accept Payments</span>
                <span className={`status-value ${status.charges_enabled ? 'text-success' : 'text-warning'}`}>
                  {status.charges_enabled ? '✓ Enabled' : '✗ Not Yet'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Receive Payouts</span>
                <span className={`status-value ${status.payouts_enabled ? 'text-success' : 'text-warning'}`}>
                  {status.payouts_enabled ? '✓ Enabled' : '✗ Not Yet'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Onboarding</span>
                <span className={`status-value ${status.details_submitted ? 'text-success' : 'text-warning'}`}>
                  {status.details_submitted ? '✓ Complete' : '○ Incomplete'}
                </span>
              </div>
            </div>

            {/* Requirements */}
            {hasRequirements && (
              <RequirementsList requirements={status.requirements} />
            )}

            {/* Action Buttons */}
            <div className="card-actions">
              {(needsOnboarding || hasRequirements) && (
                <button
                  onClick={handleStartOnboarding}
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Loading...' : needsOnboarding ? 'Complete Onboarding' : 'Update Information'}
                </button>
              )}
              {status.details_submitted && (
                <button
                  onClick={handleOpenDashboard}
                  className="btn btn-secondary"
                  disabled={actionLoading}
                >
                  Open Stripe Dashboard
                </button>
              )}
            </div>
          </div>

          {/* Fully Active Info */}
          {isFullyActive && (
            <div className="connect-card connect-card-success">
              <h3>🎉 Your account is fully active!</h3>
              <p>
                You can now accept card payments through your POS terminals and online store.
                All payments will be deposited directly into your connected bank account.
              </p>
              <div className="info-grid">
                <div className="info-item">
                  <strong>POS Terminals</strong>
                  <span>Card readers are automatically connected to your Stripe account</span>
                </div>
                <div className="info-item">
                  <strong>Online Payments</strong>
                  <span>E-commerce checkout uses your Stripe account</span>
                </div>
                <div className="info-item">
                  <strong>Platform Fee</strong>
                  <span>A small platform fee is collected on each transaction</span>
                </div>
              </div>
            </div>
          )}

          {/* Business Profile */}
          {status.business_profile && (
            <div className="connect-card">
              <h3>Business Profile</h3>
              <div className="profile-grid">
                {status.business_profile.name && (
                  <div className="profile-item">
                    <span className="profile-label">Business Name</span>
                    <span className="profile-value">{status.business_profile.name}</span>
                  </div>
                )}
                {status.business_profile.url && (
                  <div className="profile-item">
                    <span className="profile-label">Website</span>
                    <span className="profile-value">{status.business_profile.url}</span>
                  </div>
                )}
                {status.business_profile.support_email && (
                  <div className="profile-item">
                    <span className="profile-label">Support Email</span>
                    <span className="profile-value">{status.business_profile.support_email}</span>
                  </div>
                )}
                {status.business_profile.support_phone && (
                  <div className="profile-item">
                    <span className="profile-label">Support Phone</span>
                    <span className="profile-value">{status.business_profile.support_phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
