/**
 * routes/plaid.js
 * Plaid Integration Routes (Multi-Tenant)
 * Handles bank account linking and transaction sync
 * 
 * Add to server.js:
 *   const plaidRoutes = require('./routes/plaid');
 *   app.use('/api/v1/plaid', plaidRoutes);
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Configuration, PlaidApi, PlaidEnvironments, Products } = require('plaid');
const db = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');

// ============================================================================
// ACCESS TOKEN ENCRYPTION
// Plaid requires secure storage of access tokens in production.
// Uses AES-256-GCM with a key derived from PLAID_TOKEN_ENCRYPTION_KEY env var.
// ============================================================================

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey() {
  const key = process.env.PLAID_TOKEN_ENCRYPTION_KEY;
  if (!key) {
    console.warn('WARNING: PLAID_TOKEN_ENCRYPTION_KEY not set. Access tokens stored unencrypted.');
    return null;
  }
  // Derive a 32-byte key from the secret using SHA-256
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Encrypt a Plaid access token for storage
 * Returns "enc:iv:authTag:ciphertext" or plaintext if no key configured
 */
function encryptAccessToken(plaintext) {
  const key = getEncryptionKey();
  if (!key) return plaintext;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `enc:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt a Plaid access token from storage
 * Handles both encrypted ("enc:...") and legacy plaintext tokens
 */
function decryptAccessToken(stored) {
  if (!stored || !stored.startsWith('enc:')) {
    return stored; // Legacy plaintext token or null
  }

  const key = getEncryptionKey();
  if (!key) {
    throw new Error('Cannot decrypt access token: PLAID_TOKEN_ENCRYPTION_KEY not set');
  }

  const parts = stored.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted token format');
  }

  const [, ivHex, authTagHex, ciphertext] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Helper: get decrypted access token for a plaid_items row
 */
function getAccessToken(item) {
  return decryptAccessToken(item.access_token);
}

// ============================================================================
// PLAID CLIENT SETUP
// ============================================================================

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Helper to get tenant_id from authenticated user
const getTenantId = (req) => {
  return req.user?.tenant_id || null;
};

// ============================================================================
// LINK TOKEN - Start the Plaid Link flow
// ============================================================================

/**
 * POST /api/v1/plaid/create-link-token
 * Creates a link token to initialize Plaid Link on the frontend
 */
router.post('/create-link-token', authenticate, requireStaff, async (req, res) => {
  const tenantId = getTenantId(req);

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant context required' });
  }

  try {
    // Get tenant business name for Plaid Link display
    let clientName = 'Business Manager';
    const tenantResult = await db.query(
      'SELECT business_name, name FROM tenants WHERE id = $1',
      [tenantId]
    );
    if (tenantResult.rows.length > 0) {
      clientName = tenantResult.rows[0].business_name || tenantResult.rows[0].name || clientName;
    }

    const request = {
      user: {
        client_user_id: `${tenantId}-${req.user.id}`,
      },
      client_name: clientName,
      products: [Products.Transactions],
      country_codes: ['US'],
      language: 'en',
    };

    // Add redirect URI if configured (for OAuth banks)
    if (process.env.PLAID_REDIRECT_URI) {
      request.redirect_uri = process.env.PLAID_REDIRECT_URI;
    }

    const response = await plaidClient.linkTokenCreate(request);
    
    res.json({
      link_token: response.data.link_token,
      expiration: response.data.expiration,
    });
  } catch (error) {
    console.error('Error creating link token:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to create link token',
      details: error.response?.data?.error_message || error.message,
    });
  }
});

// ============================================================================
// UPDATE MODE - Re-authenticate a broken bank connection
// ============================================================================

/**
 * POST /api/v1/plaid/create-update-link-token
 * Creates a link token in update mode for re-authenticating an existing Item.
 * Used when status is 'pending_reauth', 'login_required', or 'pending_disconnect'.
 * Body: { item_id: string }
 */
router.post('/create-update-link-token', authenticate, requireStaff, async (req, res) => {
  const tenantId = getTenantId(req);
  const { item_id } = req.body;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant context required' });
  }

  if (!item_id) {
    return res.status(400).json({ error: 'item_id is required' });
  }

  try {
    // Look up the item - must belong to this tenant
    const itemResult = await db.query(
      'SELECT * FROM plaid_items WHERE item_id = $1 AND tenant_id = $2',
      [item_id, tenantId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bank connection not found' });
    }

    const item = itemResult.rows[0];
    const accessToken = getAccessToken(item);

    // Get tenant business name
    let clientName = 'Business Manager';
    const tenantResult = await db.query(
      'SELECT business_name, name FROM tenants WHERE id = $1',
      [tenantId]
    );
    if (tenantResult.rows.length > 0) {
      clientName = tenantResult.rows[0].business_name || tenantResult.rows[0].name || clientName;
    }

    // Create link token in update mode (pass access_token instead of products)
    const request = {
      user: {
        client_user_id: `${tenantId}-${req.user.id}`,
      },
      client_name: clientName,
      access_token: accessToken,
      country_codes: ['US'],
      language: 'en',
    };

    if (process.env.PLAID_REDIRECT_URI) {
      request.redirect_uri = process.env.PLAID_REDIRECT_URI;
    }

    const response = await plaidClient.linkTokenCreate(request);

    res.json({
      link_token: response.data.link_token,
      expiration: response.data.expiration,
      item_id: item_id,
      institution: item.institution_name,
    });
  } catch (error) {
    console.error('Error creating update link token:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to create update link token',
      details: error.response?.data?.error_message || error.message,
    });
  }
});

/**
 * POST /api/v1/plaid/update-complete
 * Called after user completes update mode in Plaid Link.
 * Resets the item status back to active since credentials are now refreshed.
 * Body: { item_id: string }
 */
router.post('/update-complete', authenticate, requireStaff, async (req, res) => {
  const tenantId = getTenantId(req);
  const { item_id } = req.body;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant context required' });
  }

  if (!item_id) {
    return res.status(400).json({ error: 'item_id is required' });
  }

  try {
    const result = await db.query(
      `UPDATE plaid_items 
       SET status = 'active', error_code = NULL, error_message = NULL, updated_at = NOW()
       WHERE item_id = $1 AND tenant_id = $2
       RETURNING id, institution_name`,
      [item_id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bank connection not found' });
    }

    // Trigger a fresh transaction sync now that the connection is restored
    const itemResult = await db.query(
      'SELECT * FROM plaid_items WHERE item_id = $1 AND tenant_id = $2',
      [item_id, tenantId]
    );
    if (itemResult.rows.length > 0) {
      const item = itemResult.rows[0];
      const syncResults = { added: 0, modified: 0, removed: 0 };
      try {
        await syncItemTransactions(item, syncResults, tenantId);
      } catch (syncErr) {
        console.warn('Post-update sync failed:', syncErr.message);
      }
    }

    res.json({
      success: true,
      institution: result.rows[0].institution_name,
      message: 'Bank connection restored',
    });
  } catch (error) {
    console.error('Error completing update:', error);
    res.status(500).json({ error: 'Failed to complete update' });
  }
});

// ============================================================================
// TOKEN EXCHANGE - Complete the Link flow
// ============================================================================

/**
 * POST /api/v1/plaid/exchange-token
 * Exchanges a public_token from Link for an access_token
 * Body: { public_token: string }
 */
router.post('/exchange-token', authenticate, requireStaff, async (req, res) => {
  const tenantId = getTenantId(req);
  const { public_token } = req.body;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant context required' });
  }

  if (!public_token) {
    return res.status(400).json({ error: 'public_token is required' });
  }

  try {
    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const { access_token, item_id } = exchangeResponse.data;

    // Get institution info
    const itemResponse = await plaidClient.itemGet({ access_token });
    const institutionId = itemResponse.data.item.institution_id;

    let institutionName = 'Unknown Bank';
    if (institutionId) {
      try {
        const instResponse = await plaidClient.institutionsGetById({
          institution_id: institutionId,
          country_codes: ['US'],
        });
        institutionName = instResponse.data.institution.name;
      } catch (e) {
        console.warn('Could not fetch institution name:', e.message);
      }
    }

    // Store the Plaid Item with tenant_id (encrypt access token)
    const encryptedToken = encryptAccessToken(access_token);
    const itemResult = await db.query(
      `INSERT INTO plaid_items (access_token, item_id, institution_id, institution_name, tenant_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (item_id) DO UPDATE SET
         access_token = EXCLUDED.access_token,
         institution_name = EXCLUDED.institution_name,
         status = 'active',
         error_code = NULL,
         error_message = NULL,
         updated_at = NOW()
       RETURNING id`,
      [encryptedToken, item_id, institutionId, institutionName, tenantId]
    );
    const plaidItemId = itemResult.rows[0].id;

    // Get and store accounts with tenant_id
    const accountsResponse = await plaidClient.accountsGet({ access_token });
    const accounts = accountsResponse.data.accounts;

    for (const account of accounts) {
      await db.query(
        `INSERT INTO plaid_accounts (
          plaid_item_id, account_id, name, official_name, type, subtype, mask,
          current_balance, available_balance, iso_currency_code, tenant_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (account_id) DO UPDATE SET
          name = EXCLUDED.name,
          official_name = EXCLUDED.official_name,
          current_balance = EXCLUDED.current_balance,
          available_balance = EXCLUDED.available_balance,
          updated_at = NOW()`,
        [
          plaidItemId,
          account.account_id,
          account.name,
          account.official_name,
          account.type,
          account.subtype,
          account.mask,
          account.balances.current,
          account.balances.available,
          account.balances.iso_currency_code || 'USD',
          tenantId,
        ]
      );
    }

    res.json({
      success: true,
      item_id,
      institution: institutionName,
      accounts: accounts.map(a => ({
        id: a.account_id,
        name: a.name,
        type: a.type,
        subtype: a.subtype,
        mask: a.mask,
      })),
    });
  } catch (error) {
    console.error('Error exchanging token:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to exchange token',
      details: error.response?.data?.error_message || error.message,
    });
  }
});

// ============================================================================
// SYNC TRANSACTIONS - Pull new transactions from Plaid
// ============================================================================

/**
 * POST /api/v1/plaid/sync-transactions
 * Syncs transactions for all linked accounts or a specific item
 * Body: { item_id?: string } - optional, syncs all if not provided
 */
router.post('/sync-transactions', authenticate, requireStaff, async (req, res) => {
  const tenantId = getTenantId(req);
  const { item_id } = req.body;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant context required' });
  }

  try {
    // Get Plaid items to sync - filtered by tenant
    let itemsQuery = 'SELECT * FROM plaid_items WHERE status = $1 AND tenant_id = $2';
    const queryParams = ['active', tenantId];
    
    if (item_id) {
      itemsQuery += ' AND item_id = $3';
      queryParams.push(item_id);
    }

    const itemsResult = await db.query(itemsQuery, queryParams);
    const items = itemsResult.rows;

    if (items.length === 0) {
      return res.status(404).json({ error: 'No active Plaid items found' });
    }

    const results = {
      synced: 0,
      added: 0,
      modified: 0,
      removed: 0,
      errors: [],
    };

    for (const item of items) {
      try {
        await syncItemTransactions(item, results, tenantId);
        results.synced++;
      } catch (error) {
        console.error(`Error syncing item ${item.item_id}:`, error.message);
        results.errors.push({
          item_id: item.item_id,
          institution: item.institution_name,
          error: error.message,
        });

        // Detect ITEM_LOGIN_REQUIRED from API error response
        const errorCode = error.response?.data?.error_code || 'UNKNOWN';
        const itemStatus = errorCode === 'ITEM_LOGIN_REQUIRED' ? 'login_required' : 'error';
        await db.query(
          `UPDATE plaid_items SET status = $1, error_code = $2, error_message = $3, updated_at = NOW()
           WHERE id = $4 AND tenant_id = $5`,
          [itemStatus, errorCode, error.message, item.id, tenantId]
        );
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error in sync-transactions:', error);
    res.status(500).json({
      error: 'Failed to sync transactions',
      details: error.message,
    });
  }
});

/**
 * Sync transactions for a single Plaid item using cursor-based pagination
 * @param {object} item - plaid_items row
 * @param {object} results - accumulator for counts
 * @param {string} tenantId - tenant UUID
 */
async function syncItemTransactions(item, results, tenantId) {
  let cursor = item.cursor;
  let hasMore = true;

  // Get account mapping (plaid_account_id -> our plaid_accounts.id)
  const accountsResult = await db.query(
    'SELECT id, account_id FROM plaid_accounts WHERE plaid_item_id = $1 AND tenant_id = $2',
    [item.id, tenantId]
  );
  const accountMap = {};
  for (const acc of accountsResult.rows) {
    accountMap[acc.account_id] = acc.id;
  }

  while (hasMore) {
    const request = {
      access_token: getAccessToken(item),
    };
    if (cursor) {
      request.cursor = cursor;
    }

    const response = await plaidClient.transactionsSync(request);
    const data = response.data;

    // Process added transactions
    for (const txn of data.added) {
      await upsertTransaction(txn, accountMap, item.id, tenantId);
      results.added++;
    }

    // Process modified transactions
    for (const txn of data.modified) {
      await upsertTransaction(txn, accountMap, item.id, tenantId);
      results.modified++;
    }

    // Process removed transactions - scope to tenant
    for (const removed of data.removed) {
      await db.query(
        `UPDATE transactions SET acceptance_status = 'excluded', exclusion_reason = 'Removed by bank'
         WHERE plaid_transaction_id = $1 AND tenant_id = $2`,
        [removed.transaction_id, tenantId]
      );
      results.removed++;
    }

    cursor = data.next_cursor;
    hasMore = data.has_more;
  }

  // Update cursor for next sync
  await db.query(
    'UPDATE plaid_items SET cursor = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3',
    [cursor, item.id, tenantId]
  );
}

/**
 * Insert or update a transaction from Plaid
 */
async function upsertTransaction(txn, accountMap, plaidItemId, tenantId) {
  const plaidAccountId = accountMap[txn.account_id];
  
  // Determine transaction type based on amount
  // Plaid: positive = money out (expense), negative = money in (income)
  const isExpense = txn.amount > 0;
  const transactionType = isExpense ? 'expense' : 'income';
  const normalizedAmount = Math.abs(txn.amount);

  // Build description from available fields
  const description = txn.merchant_name || txn.name || 'Unknown';
  
  await db.query(
    `INSERT INTO transactions (
      date, type, description, amount, acceptance_status, source,
      plaid_transaction_id, plaid_account_id, notes, tenant_id
    ) VALUES ($1, $2, $3, $4, 'pending', 'plaid', $5, $6, $7, $8)
    ON CONFLICT (plaid_transaction_id) DO UPDATE SET
      date = EXCLUDED.date,
      description = EXCLUDED.description,
      amount = EXCLUDED.amount,
      notes = EXCLUDED.notes,
      plaid_account_id = COALESCE(EXCLUDED.plaid_account_id, transactions.plaid_account_id),
      updated_at = NOW()`,
    [
      txn.date,
      transactionType,
      description.substring(0, 500),
      normalizedAmount,
      txn.transaction_id,
      plaidAccountId,
      `Plaid: ${txn.name} | ${txn.personal_finance_category?.detailed || ''}`.trim(),
      tenantId,
    ]
  );
}

// ============================================================================
// REFRESH ACCOUNTS - Fetch accounts for existing items
// ============================================================================

/**
 * POST /api/v1/plaid/refresh-accounts
 * Fetches accounts from Plaid for all items (or a specific item) and saves them
 */
router.post('/refresh-accounts', authenticate, requireStaff, async (req, res) => {
  const tenantId = getTenantId(req);
  const { item_id } = req.body;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant context required' });
  }

  try {
    let query = 'SELECT * FROM plaid_items WHERE status = $1 AND tenant_id = $2';
    const params = ['active', tenantId];
    
    if (item_id) {
      query += ' AND item_id = $3';
      params.push(item_id);
    }

    const itemsResult = await db.query(query, params);
    const items = itemsResult.rows;

    if (items.length === 0) {
      return res.status(404).json({ error: 'No active Plaid items found' });
    }

    const results = {
      items_processed: 0,
      accounts_added: 0,
      accounts_updated: 0,
      errors: []
    };

    for (const item of items) {
      try {
        console.log(`Fetching accounts for item ${item.item_id} (${item.institution_name})...`);
        
        const accountsResponse = await plaidClient.accountsGet({ 
          access_token: getAccessToken(item) 
        });
        const accounts = accountsResponse.data.accounts;
        
        console.log(`Found ${accounts.length} accounts`);

        for (const account of accounts) {
          const upsertResult = await db.query(
            `INSERT INTO plaid_accounts (
              plaid_item_id, account_id, name, official_name, type, subtype, mask,
              current_balance, available_balance, iso_currency_code, tenant_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (account_id) DO UPDATE SET
              name = EXCLUDED.name,
              official_name = EXCLUDED.official_name,
              current_balance = EXCLUDED.current_balance,
              available_balance = EXCLUDED.available_balance,
              updated_at = NOW()
            RETURNING (xmax = 0) AS inserted`,
            [
              item.id,
              account.account_id,
              account.name,
              account.official_name,
              account.type,
              account.subtype,
              account.mask,
              account.balances.current,
              account.balances.available,
              account.balances.iso_currency_code || 'USD',
              tenantId,
            ]
          );
          
          if (upsertResult.rows[0].inserted) {
            results.accounts_added++;
          } else {
            results.accounts_updated++;
          }
        }

        results.items_processed++;
      } catch (error) {
        console.error(`Error fetching accounts for item ${item.item_id}:`, error.response?.data || error.message);
        results.errors.push({
          item_id: item.item_id,
          institution: item.institution_name,
          error: error.response?.data?.error_message || error.message
        });
      }
    }

    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('Error in refresh-accounts:', error);
    res.status(500).json({
      error: 'Failed to refresh accounts',
      details: error.message
    });
  }
});

// ============================================================================
// GET LINKED ACCOUNTS
// ============================================================================

/**
 * GET /api/v1/plaid/accounts
 * Returns all linked bank accounts for the tenant
 */
router.get('/accounts', authenticate, requireStaff, async (req, res) => {
  const tenantId = getTenantId(req);

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant context required' });
  }

  try {
    const result = await db.query(
      `SELECT 
        pa.id,
        pa.account_id,
        pa.name,
        pa.official_name,
        pa.type,
        pa.subtype,
        pa.mask,
        pa.current_balance,
        pa.available_balance,
        pa.is_active,
        pi.institution_name,
        pi.status as item_status,
        ac.name as linked_account_name,
        pa.linked_account_id
       FROM plaid_accounts pa
       JOIN plaid_items pi ON pa.plaid_item_id = pi.id
       LEFT JOIN accounts_chart ac ON pa.linked_account_id = ac.id
       WHERE pa.tenant_id = $1
       ORDER BY pi.institution_name, pa.name`,
      [tenantId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

/**
 * GET /api/v1/plaid/items
 * Returns all Plaid items (bank connections) for the tenant
 */
router.get('/items', authenticate, requireStaff, async (req, res) => {
  const tenantId = getTenantId(req);

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant context required' });
  }

  try {
    const result = await db.query(
      `SELECT 
        pi.id,
        pi.item_id,
        pi.institution_name,
        pi.status,
        pi.error_code,
        pi.error_message,
        pi.created_at,
        pi.updated_at,
        COUNT(pa.id) as account_count
       FROM plaid_items pi
       LEFT JOIN plaid_accounts pa ON pa.plaid_item_id = pi.id
       WHERE pi.tenant_id = $1
       GROUP BY pi.id
       ORDER BY pi.created_at DESC`,
      [tenantId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// ============================================================================
// LINK PLAID ACCOUNT TO GL ACCOUNT
// ============================================================================

/**
 * PUT /api/v1/plaid/accounts/:id/link
 * Links a Plaid account to a GL account for automatic categorization
 * Body: { linked_account_id: number }
 */
router.put('/accounts/:id/link', authenticate, requireStaff, async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { linked_account_id } = req.body;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant context required' });
  }

  try {
    // Verify this Plaid account belongs to the tenant
    const ownerCheck = await db.query(
      'SELECT id FROM plaid_accounts WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Plaid account not found' });
    }

    // If linking (not unlinking), check if GL account is already linked to another Plaid account within this tenant
    if (linked_account_id) {
      const existingLink = await db.query(
        `SELECT pa.id, pa.name, pa.mask, pi.institution_name
         FROM plaid_accounts pa
         JOIN plaid_items pi ON pa.plaid_item_id = pi.id
         WHERE pa.linked_account_id = $1 AND pa.id != $2 AND pa.tenant_id = $3`,
        [linked_account_id, id, tenantId]
      );

      if (existingLink.rows.length > 0) {
        const existing = existingLink.rows[0];
        return res.status(400).json({
          error: 'GL account already linked',
          message: `This GL account is already linked to "${existing.name} (••••${existing.mask})" at ${existing.institution_name}. Each GL account should only be linked to one bank account for proper reconciliation.`
        });
      }
    }

    const result = await db.query(
      `UPDATE plaid_accounts SET linked_account_id = $1, updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3
       RETURNING *`,
      [linked_account_id, id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plaid account not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error linking account:', error);
    res.status(500).json({ error: 'Failed to link account' });
  }
});

// ============================================================================
// REMOVE BANK CONNECTION
// ============================================================================

/**
 * DELETE /api/v1/plaid/items/:item_id
 * Removes a Plaid item (bank connection)
 * Note: Does not delete transactions - just nullifies the plaid_account_id reference
 */
router.delete('/items/:item_id', authenticate, requireStaff, async (req, res) => {
  const tenantId = getTenantId(req);
  const { item_id } = req.params;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant context required' });
  }

  try {
    // Get the item - scoped to tenant
    const itemResult = await db.query(
      'SELECT * FROM plaid_items WHERE item_id = $1 AND tenant_id = $2',
      [item_id, tenantId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = itemResult.rows[0];

    // Remove from Plaid API
    try {
      await plaidClient.itemRemove({ access_token: getAccessToken(item) });
    } catch (e) {
      console.warn('Could not remove item from Plaid API:', e.message);
      // Continue anyway - we still want to clean up our database
    }

    // Get the plaid_accounts for this item within this tenant
    const accountsResult = await db.query(
      'SELECT id FROM plaid_accounts WHERE plaid_item_id = $1 AND tenant_id = $2',
      [item.id, tenantId]
    );
    const accountIds = accountsResult.rows.map(r => r.id);

    // Nullify plaid_account_id on transactions (preserve the transactions, just unlink them)
    if (accountIds.length > 0) {
      await db.query(
        `UPDATE transactions SET plaid_account_id = NULL 
         WHERE plaid_account_id = ANY($1) AND tenant_id = $2`,
        [accountIds, tenantId]
      );
    }

    // Delete plaid_accounts first (FK doesn't have CASCADE)
    await db.query('DELETE FROM plaid_accounts WHERE plaid_item_id = $1 AND tenant_id = $2', [item.id, tenantId]);
    
    // Now delete the plaid_item
    await db.query('DELETE FROM plaid_items WHERE item_id = $1 AND tenant_id = $2', [item_id, tenantId]);

    res.json({ 
      success: true, 
      message: 'Bank connection removed',
      transactions_unlinked: accountIds.length > 0
    });
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ 
      error: 'Failed to remove bank connection',
      details: error.message 
    });
  }
});

// ============================================================================
// ENCRYPT EXISTING TOKENS - One-time migration utility
// ============================================================================

/**
 * POST /api/v1/plaid/encrypt-tokens
 * Encrypts any plaintext access tokens in the database.
 * Idempotent - skips already-encrypted tokens (prefixed with "enc:").
 * Requires super_admin or tenant_admin role.
 */
router.post('/encrypt-tokens', authenticate, async (req, res) => {
  const tenantId = getTenantId(req);
  const role = req.user?.role;

  if (!['super_admin', 'tenant_admin'].includes(role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (!process.env.PLAID_TOKEN_ENCRYPTION_KEY) {
    return res.status(400).json({ error: 'PLAID_TOKEN_ENCRYPTION_KEY environment variable not set' });
  }

  try {
    // Get all items with plaintext tokens (not starting with "enc:")
    let query = `SELECT id, access_token FROM plaid_items WHERE access_token IS NOT NULL AND access_token NOT LIKE 'enc:%'`;
    const params = [];

    // Scope to tenant unless super_admin
    if (role !== 'super_admin' && tenantId) {
      query += ' AND tenant_id = $1';
      params.push(tenantId);
    }

    const result = await db.query(query, params);
    let encrypted = 0;

    for (const row of result.rows) {
      const encryptedToken = encryptAccessToken(row.access_token);
      await db.query(
        'UPDATE plaid_items SET access_token = $1, updated_at = NOW() WHERE id = $2',
        [encryptedToken, row.id]
      );
      encrypted++;
    }

    res.json({
      success: true,
      message: `Encrypted ${encrypted} access token(s)`,
      total_found: result.rows.length,
    });
  } catch (error) {
    console.error('Error encrypting tokens:', error);
    res.status(500).json({ error: 'Failed to encrypt tokens' });
  }
});

// ============================================================================
// WEBHOOKS - Receive updates from Plaid
// ============================================================================

/**
 * POST /api/v1/plaid/webhook
 * Receives webhook notifications from Plaid
 * NOTE: No auth middleware - webhooks come from Plaid, not from users.
 * Tenant context is resolved from the plaid_items row via item_id.
 */
router.post('/webhook', async (req, res) => {
  const { webhook_type, webhook_code, item_id } = req.body;

  console.log(`Plaid Webhook: ${webhook_type} - ${webhook_code} for item ${item_id}`);

  try {
    switch (webhook_type) {
      case 'TRANSACTIONS':
        if (['SYNC_UPDATES_AVAILABLE', 'INITIAL_UPDATE', 'HISTORICAL_UPDATE'].includes(webhook_code)) {
          // Look up item and resolve tenant from DB
          const itemResult = await db.query(
            'SELECT * FROM plaid_items WHERE item_id = $1 AND status = $2',
            [item_id, 'active']
          );
          
          if (itemResult.rows.length > 0) {
            const item = itemResult.rows[0];
            const tenantId = item.tenant_id;
            const results = { added: 0, modified: 0, removed: 0 };
            await syncItemTransactions(item, results, tenantId);
            console.log(`Webhook sync complete for ${item_id} (tenant ${tenantId}):`, results);
          }
        }
        break;

      case 'ITEM':
        if (webhook_code === 'ERROR') {
          const { error } = req.body;
          // ITEM_LOGIN_REQUIRED means the user needs to re-authenticate
          if (error?.error_code === 'ITEM_LOGIN_REQUIRED') {
            await db.query(
              `UPDATE plaid_items SET status = 'login_required', error_code = $1, error_message = $2, updated_at = NOW()
               WHERE item_id = $3`,
              [error.error_code, error.error_message || 'Bank login credentials have changed', item_id]
            );
            console.log(`Item ${item_id} requires re-authentication (ITEM_LOGIN_REQUIRED)`);
          } else {
            await db.query(
              `UPDATE plaid_items SET status = 'error', error_code = $1, error_message = $2, updated_at = NOW()
               WHERE item_id = $3`,
              [error?.error_code, error?.error_message, item_id]
            );
          }
        } else if (webhook_code === 'PENDING_EXPIRATION') {
          // Item's access consent is about to expire (usually 90 days for European banks)
          await db.query(
            `UPDATE plaid_items SET status = 'pending_reauth', error_message = 'Bank connection will expire soon - please re-authenticate', updated_at = NOW()
             WHERE item_id = $1`,
            [item_id]
          );
          console.log(`Item ${item_id} pending expiration - user should re-authenticate`);
        } else if (webhook_code === 'PENDING_DISCONNECT') {
          // Plaid will disconnect this item soon - user must re-authenticate
          await db.query(
            `UPDATE plaid_items SET status = 'pending_disconnect', error_message = 'Bank connection will be disconnected soon - please re-authenticate', updated_at = NOW()
             WHERE item_id = $1`,
            [item_id]
          );
          console.log(`Item ${item_id} pending disconnect - user must re-authenticate`);
        } else if (webhook_code === 'USER_PERMISSION_REVOKED') {
          // User revoked access at the bank - mark as disconnected
          await db.query(
            `UPDATE plaid_items SET status = 'revoked', error_message = 'Access was revoked at the bank', updated_at = NOW()
             WHERE item_id = $1`,
            [item_id]
          );
          console.log(`Item ${item_id} permission revoked by user at bank`);
        }
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
