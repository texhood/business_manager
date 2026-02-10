/**
 * OAuthRedirect Component
 * 
 * Handles the Plaid OAuth return flow for multi-tenant setups.
 * 
 * This page lives at the shared (non-tenant) URL:
 *   https://office.busmgr.com/oauth-redirect
 * 
 * Flow:
 *   1. Plaid redirects here after bank OAuth with ?oauth_state_id=xxx
 *   2. We read the tenant slug from a cookie set before Plaid Link opened
 *   3. We store the full receivedRedirectUri in another cookie
 *   4. We redirect to the tenant-specific URL to complete the flow
 * 
 * This component renders BEFORE any auth/tenant checks in App.js.
 */

import React, { useEffect, useState } from 'react';

// ============================================================================
// Cookie helpers
// ============================================================================

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name, value, domain, maxAge = 300) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; domain=${domain}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

// ============================================================================
// Component
// ============================================================================

export default function OAuthRedirect() {
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const oauthStateId = params.get('oauth_state_id');

      if (!oauthStateId) {
        setError('Missing oauth_state_id parameter. This page is only used during bank connection OAuth flows.');
        return;
      }

      // Read tenant slug from cookie (set by BankConnectionsView before opening Plaid Link)
      const tenantSlug = getCookie('plaid_oauth_tenant');

      if (!tenantSlug) {
        setError('Could not determine which account initiated this bank connection. Please return to your dashboard and try again.');
        return;
      }

      // Capture the full URL Plaid redirected to — Plaid Link needs this as receivedRedirectUri
      const receivedRedirectUri = window.location.href;

      // Determine the parent domain for cookie sharing
      // office.busmgr.com → .busmgr.com
      // office.hoodfamilyfarms.com → .hoodfamilyfarms.com
      const hostParts = window.location.hostname.split('.');
      const parentDomain = '.' + hostParts.slice(-2).join('.');

      // Store the receivedRedirectUri in a cookie so the tenant page can pick it up
      setCookie('plaid_oauth_redirect_uri', receivedRedirectUri, parentDomain, 300);

      // Build tenant-specific URL: crhood.office.busmgr.com
      const tenantHost = `${tenantSlug}.${window.location.hostname}`;
      const targetUrl = `${window.location.protocol}//${tenantHost}/?plaid_oauth=1`;

      // Redirect to the tenant page
      window.location.replace(targetUrl);
    } catch (err) {
      console.error('OAuth redirect error:', err);
      setError('An error occurred while completing the bank connection. Please try again.');
    }
  }, []);

  // Minimal UI shown briefly during redirect (or on error)
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f9fafb',
      padding: '20px',
    }}>
      {error ? (
        <div style={{
          maxWidth: '480px',
          textAlign: 'center',
          padding: '32px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #fecaca',
        }}>
          <h2 style={{ color: '#dc2626', marginTop: 0 }}>Bank Connection Issue</h2>
          <p style={{ color: '#6b7280', lineHeight: 1.6 }}>{error}</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Completing bank connection...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}
