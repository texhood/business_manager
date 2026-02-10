# Plaid Integration — Developer Guide

**Version:** 2.0  
**Last Updated:** February 2026

## Overview

This integration enables automatic importing of bank transactions into the Business Manager accounting system via Plaid's API. Each tenant can link their own bank accounts through Back Office → Accounting → Bank Connections.

## Files Included

```
backend/
├── migrations/
│   ├── 004_plaid_integration.sql      # Database tables
│   └── 004_add_plaid_support.sql      # Additional Plaid support
├── src/routes/
│   └── plaid.js                       # Backend API routes
│
site_back_office/ (Back Office frontend)
├── src/services/
│   └── plaidApi.js                    # API client
└── src/components/views/
    └── BankConnectionsView.js         # React component
```

> **Note:** The Plaid integration is multi-tenant — each tenant's bank connections are isolated via `tenant_id` filtering on all queries.

## Installation

### Step 1: Install Dependencies

**Backend:**
```bash
cd C:\Sandbox\business_manager\backend
npm install plaid
```

**Frontend (Back Office):**
```bash
cd C:\Sandbox\business_manager\site_office
npm install react-plaid-link
```

### Step 2: Add Environment Variables

Add to `backend/.env`:
```env
# Plaid API Configuration
PLAID_CLIENT_ID=your_client_id_here
PLAID_SECRET=your_sandbox_secret_here
PLAID_ENV=sandbox

# Optional: For OAuth banks (Chase, Wells Fargo, etc.)
# PLAID_REDIRECT_URI=http://localhost:3000/oauth-callback
```

### Step 3: Run Database Migration

```bash
cd C:\Sandbox\business_manager\backend
psql -U robin -d business_manager -f migrations/004_plaid_integration.sql
```

Or via pgAdmin: Open Query Tool, paste the SQL, and execute.

### Step 4: Add Backend Route

Copy `routes/plaid.js` to `backend/src/routes/plaid.js`

Add to `backend/src/server.js`:
```javascript
// Add after other route imports
const plaidRoutes = require('./routes/plaid');

// Add after other app.use() statements
app.use('/api/v1/plaid', plaidRoutes);
```

### Step 5: Frontend Integration

The Back Office (`site_office`) already includes Bank Connections in the Accounting sidebar section. The route and navigation are pre-configured:

- **Route:** `/bank-connections` → `BankConnectionsView.js`
- **Sidebar:** Accounting → Bank Connections

### Step 6: Restart Services

```bash
# Backend
cd backend && npm run dev

# Back Office frontend  
cd site_office && npm start
```

## Usage

### Connecting a Bank Account

1. Navigate to **Bank Connections** in the sidebar
2. Click **Connect Bank Account**
3. Select your bank in the Plaid Link dialog
4. Enter credentials:
   - **Sandbox:** user_good / pass_good / 1234
   - **Production:** Use real credentials
5. Transactions automatically sync to the **Bank Feed → Pending** tab

### Syncing Transactions

- **Auto-sync:** Transactions sync automatically when you connect a bank
- **Manual sync:** Click **Sync All Transactions** or **Sync** on individual banks
- **Webhook sync:** In production, Plaid sends webhooks when new transactions are available

### Transaction Flow

```
Bank → Plaid → Sync → Pending Transactions → Categorize → Journal Entry
```

1. Transactions import with status `pending` and source `plaid`
2. Review in Bank Feed → Pending tab
3. Categorize using your existing workflow
4. Journal entries are created automatically

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/plaid/create-link-token` | Initialize Plaid Link |
| POST | `/api/v1/plaid/exchange-token` | Complete Link, store tokens |
| POST | `/api/v1/plaid/create-update-link-token` | Init Link in update mode (re-auth) |
| POST | `/api/v1/plaid/update-complete` | Mark re-auth complete, trigger sync |
| POST | `/api/v1/plaid/sync-transactions` | Pull new transactions |
| POST | `/api/v1/plaid/refresh-accounts` | Refresh account data from Plaid |
| GET | `/api/v1/plaid/accounts` | List linked accounts |
| GET | `/api/v1/plaid/items` | List bank connections |
| PUT | `/api/v1/plaid/accounts/:id/link` | Link to GL account |
| DELETE | `/api/v1/plaid/items/:item_id` | Remove bank connection (offboarding) |
| POST | `/api/v1/plaid/encrypt-tokens` | Encrypt plaintext tokens (admin, one-time) |
| POST | `/api/v1/plaid/log-link-event` | Log frontend Link events for conversion tracking |
| POST | `/api/v1/plaid/webhook` | Receive Plaid webhooks |

## Item Status Values

| Status | Meaning | User Action |
|--------|---------|-------------|
| `active` | Connection healthy | None |
| `login_required` | Bank credentials changed (ITEM_LOGIN_REQUIRED) | Re-authenticate |
| `pending_reauth` | Access consent expiring (PENDING_EXPIRATION) | Re-authenticate |
| `pending_disconnect` | Plaid will disconnect soon (PENDING_DISCONNECT) | Re-authenticate |
| `revoked` | User revoked access at bank | Reconnect |
| `error` | Other Plaid error | Check error_message |

## Access Token Encryption

Access tokens are encrypted at rest using AES-256-GCM.

- Set `PLAID_TOKEN_ENCRYPTION_KEY` environment variable (generate with `openssl rand -hex 32`)
- New tokens are encrypted automatically on exchange
- Legacy plaintext tokens still work (backward compatible)
- Run `POST /api/v1/plaid/encrypt-tokens` once to encrypt existing tokens
- Encrypted tokens are stored as `enc:iv:authTag:ciphertext`

## Production Checklist

Before going live:

- [ ] Apply for Production access at https://dashboard.plaid.com
- [ ] Change `PLAID_ENV` to `production`
- [ ] Use Production API secret
- [x] **Encrypt access_tokens** in database — AES-256-GCM via PLAID_TOKEN_ENCRYPTION_KEY
- [x] **Build update mode** — re-authentication UI for broken connections
- [x] **Detect ITEM_LOGIN_REQUIRED, PENDING_EXPIRATION, PENDING_DISCONNECT** webhooks
- [x] **User offboarding** — DELETE /items/:item_id calls itemRemove()
- [ ] Set up webhook endpoint with HTTPS
- [ ] Register webhook URL in Plaid Dashboard
- [x] **Duplicate item detection** — warns user when connecting an already-linked institution
- [x] **Link event logging** — frontend onEvent → backend structured logs for conversion tracking
- [x] **Structured logging** — all backend routes log [Plaid] prefixed entries with request_id, item_id, tenant
- [x] **OAuth redirect flow** — shared redirect URI for multi-tenant OAuth banks
- [ ] Set `PLAID_REDIRECT_URI=https://office.busmgr.com/oauth-redirect` in Railway
- [ ] Register `https://office.busmgr.com/oauth-redirect` in Plaid Dashboard → API → Allowed redirect URIs
- [ ] Verify `office.busmgr.com` (bare, no tenant prefix) is added as a domain in Vercel back_office project
- [ ] Test with real bank accounts in Development first

## OAuth Redirect Flow (Multi-Tenant)

OAuth banks (Chase, Wells Fargo, etc.) redirect users to their bank's website for authentication. Plaid requires a registered redirect URI to return users after OAuth. Since Plaid doesn't support wildcard URIs, we use a single shared redirect URI that bridges the multi-tenant subdomains.

### Redirect URI

`https://office.busmgr.com/oauth-redirect`

### Flow

```
Tenant Page                    Shared Redirect              Tenant Page
(crhood.office.busmgr.com)     (office.busmgr.com)          (crhood.office.busmgr.com)
─────────────────────────      ──────────────────           ─────────────────────────
 1. Set tenant cookie on
    .busmgr.com domain
 2. Open Plaid Link
 3. User → Bank OAuth
 4. Bank → Plaid
                               5. Plaid redirects here
                                  with ?oauth_state_id
                               6. Read tenant cookie
                               7. Store receivedRedirectUri
                                  in cookie
                               8. Redirect to tenant URL
                                  with ?plaid_oauth=1
                                                            9.  App auto-navigates to
                                                                Bank Connections
                                                            10. Read redirect URI cookie
                                                            11. Create new link token
                                                            12. Open Plaid Link with
                                                                receivedRedirectUri
                                                            13. Flow completes normally
```

### Key Components

- `OAuthRedirect.js` — Standalone component rendered at `/oauth-redirect` before auth checks
- `OAuthReturnHandler` — Sub-component in BankConnectionsView that resumes Plaid Link
- Cookies on `.busmgr.com` — `plaid_oauth_tenant` (tenant slug) and `plaid_oauth_redirect_uri` (full return URL)

### Environment Setup

1. Set `PLAID_REDIRECT_URI=https://office.busmgr.com/oauth-redirect` in Railway env vars
2. Register `https://office.busmgr.com/oauth-redirect` in Plaid Dashboard → API → Allowed redirect URIs
3. Ensure `office.busmgr.com` is configured as a domain in the Vercel back_office project

## Troubleshooting

### "Failed to create link token"
- Check PLAID_CLIENT_ID and PLAID_SECRET in .env
- Verify Plaid credentials at dashboard.plaid.com/developers/keys

### "Connectivity not supported"
- The selected bank doesn't support the requested products
- Try a different institution or check products in .env

### No transactions appearing
- Click "Sync All Transactions" manually
- Check browser console for errors
- Verify transactions exist in Plaid Dashboard sandbox

### OAuth banks not completing (Chase, Wells Fargo)
- Verify `PLAID_REDIRECT_URI` is set in Railway env vars
- Verify the redirect URI is registered in Plaid Dashboard
- Verify `office.busmgr.com` (bare) is added to Vercel back_office domains
- Check browser console for cookie-related errors
- Requires Production access for most OAuth banks