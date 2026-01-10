# Plaid Integration for Hood Family Farms

## Overview

This integration allows automatic importing of bank transactions into the Hood Family Farms expense management system via Plaid's API.

## Files Included

```
plaid-integration/
├── migrations/
│   └── 004_plaid_integration.sql    # Database tables
├── routes/
│   └── plaid.js                     # Backend API routes
└── frontend/
    ├── services/
    │   └── plaidApi.js              # API client
    └── components/
        └── BankConnectionsView.jsx   # React component
```

## Installation

### Step 1: Install Dependencies

**Backend:**
```bash
cd C:\Sandbox\business_manager\backend
npm install plaid
```

**Frontend:**
```bash
cd C:\Sandbox\business_manager\frontend
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

### Step 5: Add Frontend Files

1. Copy `frontend/services/plaidApi.js` to `frontend/src/services/plaidApi.js`
2. Copy `frontend/components/BankConnectionsView.jsx` to `frontend/src/components/BankConnectionsView.jsx`

### Step 6: Add to Navigation

In your `App.jsx`, add the route and navigation:

```jsx
import BankConnectionsView from './components/BankConnectionsView';

// Add to routes
<Route path="/bank-connections" element={<BankConnectionsView />} />

// Add to sidebar navigation (after Bank Feed)
<NavItem to="/bank-connections" icon={<BankIcon />}>Bank Connections</NavItem>
```

### Step 7: Restart Services

```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm start
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
| POST | `/api/v1/plaid/sync-transactions` | Pull new transactions |
| GET | `/api/v1/plaid/accounts` | List linked accounts |
| GET | `/api/v1/plaid/items` | List bank connections |
| PUT | `/api/v1/plaid/accounts/:id/link` | Link to GL account |
| DELETE | `/api/v1/plaid/items/:item_id` | Remove bank connection |
| POST | `/api/v1/plaid/webhook` | Receive Plaid webhooks |

## Production Checklist

Before going live:

- [ ] Apply for Production access at https://dashboard.plaid.com
- [ ] Change `PLAID_ENV` to `production`
- [ ] Use Production API secret
- [ ] **Encrypt access_tokens** in database (critical!)
- [ ] Set up webhook endpoint with HTTPS
- [ ] Register webhook URL in Plaid Dashboard
- [ ] Add PLAID_REDIRECT_URI for OAuth banks
- [ ] Test with real bank accounts in Development first

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

### OAuth banks not working (Chase, Wells Fargo)
- Add PLAID_REDIRECT_URI to .env
- Register redirect URI in Plaid Dashboard
- Requires Production access for most OAuth banks