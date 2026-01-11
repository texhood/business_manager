/**
 * routes/plaid.js
 * Plaid Integration Routes
 * Handles bank account linking and transaction sync
 * 
 * Add to server.js:
 *   const plaidRoutes = require('./routes/plaid');
 *   app.use('/api/v1/plaid', plaidRoutes);
 */

const express = require('express');
const router = express.Router();
const { Configuration, PlaidApi, PlaidEnvironments, Products } = require('plaid');
const db = require('../../config/database');

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

// ============================================================================
// LINK TOKEN - Start the Plaid Link flow
// ============================================================================

/**
 * POST /api/v1/plaid/create-link-token
 * Creates a link token to initialize Plaid Link on the frontend
 */
router.post('/create-link-token', async (req, res) => {
  try {
    const request = {
      user: {
        client_user_id: 'hood-family-farms-user', // In production, use actual user ID
      },
      client_name: 'Hood Family Farms',
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
// TOKEN EXCHANGE - Complete the Link flow
// ============================================================================

/**
 * POST /api/v1/plaid/exchange-token
 * Exchanges a public_token from Link for an access_token
 * Body: { public_token: string }
 */
router.post('/exchange-token', async (req, res) => {
  const { public_token } = req.body;

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

    // Store the Plaid Item
    const itemResult = await db.query(
      `INSERT INTO plaid_items (access_token, item_id, institution_id, institution_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (item_id) DO UPDATE SET
         access_token = EXCLUDED.access_token,
         institution_name = EXCLUDED.institution_name,
         status = 'active',
         error_code = NULL,
         error_message = NULL,
         updated_at = NOW()
       RETURNING id`,
      [access_token, item_id, institutionId, institutionName]
    );
    const plaidItemId = itemResult.rows[0].id;

    // Get and store accounts
    const accountsResponse = await plaidClient.accountsGet({ access_token });
    const accounts = accountsResponse.data.accounts;

    for (const account of accounts) {
      await db.query(
        `INSERT INTO plaid_accounts (
          plaid_item_id, account_id, name, official_name, type, subtype, mask,
          current_balance, available_balance, iso_currency_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
router.post('/sync-transactions', async (req, res) => {
  const { item_id } = req.body;

  try {
    // Get Plaid items to sync
    let itemsQuery = 'SELECT * FROM plaid_items WHERE status = $1';
    const queryParams = ['active'];
    
    if (item_id) {
      itemsQuery += ' AND item_id = $2';
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
        await syncItemTransactions(item, results);
        results.synced++;
      } catch (error) {
        console.error(`Error syncing item ${item.item_id}:`, error.message);
        results.errors.push({
          item_id: item.item_id,
          institution: item.institution_name,
          error: error.message,
        });

        // Update item status on error
        await db.query(
          `UPDATE plaid_items SET status = 'error', error_code = $1, error_message = $2, updated_at = NOW()
           WHERE id = $3`,
          [error.response?.data?.error_code || 'UNKNOWN', error.message, item.id]
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
 */
async function syncItemTransactions(item, results) {
  let cursor = item.cursor;
  let hasMore = true;

  // Get account mapping (plaid_account_id -> our plaid_accounts.id)
  const accountsResult = await db.query(
    'SELECT id, account_id FROM plaid_accounts WHERE plaid_item_id = $1',
    [item.id]
  );
  const accountMap = {};
  for (const acc of accountsResult.rows) {
    accountMap[acc.account_id] = acc.id;
  }

  while (hasMore) {
    const request = {
      access_token: item.access_token,
    };
    if (cursor) {
      request.cursor = cursor;
    }

    const response = await plaidClient.transactionsSync(request);
    const data = response.data;

    // Process added transactions
    for (const txn of data.added) {
      await upsertTransaction(txn, accountMap, item.id);
      results.added++;
    }

    // Process modified transactions
    for (const txn of data.modified) {
      await upsertTransaction(txn, accountMap, item.id);
      results.modified++;
    }

    // Process removed transactions
    for (const removed of data.removed) {
      await db.query(
        `UPDATE transactions SET acceptance_status = 'excluded', exclusion_reason = 'Removed by bank'
         WHERE plaid_transaction_id = $1`,
        [removed.transaction_id]
      );
      results.removed++;
    }

    cursor = data.next_cursor;
    hasMore = data.has_more;
  }

  // Update cursor for next sync
  await db.query(
    'UPDATE plaid_items SET cursor = $1, updated_at = NOW() WHERE id = $2',
    [cursor, item.id]
  );
}

/**
 * Insert or update a transaction from Plaid
 */
async function upsertTransaction(txn, accountMap, plaidItemId) {
  const plaidAccountId = accountMap[txn.account_id];
  
  // Determine transaction type based on amount
  // Plaid: positive = money out (expense), negative = money in (income)
  const isExpense = txn.amount > 0;
  const transactionType = isExpense ? 'expense' : 'income';
  const normalizedAmount = Math.abs(txn.amount);

  // Build description from available fields
  const description = txn.merchant_name || txn.name || 'Unknown';
  
  // Use Plaid's category if available
  const category = txn.personal_finance_category?.primary || 
                   txn.category?.[0] || 
                   'Uncategorized';

  await db.query(
    `INSERT INTO transactions (
      date, type, description, amount, acceptance_status, source,
      plaid_transaction_id, plaid_account_id, notes
    ) VALUES ($1, $2, $3, $4, 'pending', 'plaid', $5, $6, $7)
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
    ]
  );
}

// ============================================================================
// REFRESH ACCOUNTS - Fetch accounts for existing items
// ============================================================================

/**
 * POST /api/v1/plaid/refresh-accounts
 * Fetches accounts from Plaid for all items (or a specific item) and saves them
 * Use this if plaid_accounts is empty but plaid_items has data
 */
router.post('/refresh-accounts', async (req, res) => {
  const { item_id } = req.body;

  try {
    // Get Plaid items
    let query = 'SELECT * FROM plaid_items WHERE status = $1';
    const params = ['active'];
    
    if (item_id) {
      query += ' AND item_id = $2';
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
          access_token: item.access_token 
        });
        const accounts = accountsResponse.data.accounts;
        
        console.log(`Found ${accounts.length} accounts`);

        for (const account of accounts) {
          const upsertResult = await db.query(
            `INSERT INTO plaid_accounts (
              plaid_item_id, account_id, name, official_name, type, subtype, mask,
              current_balance, available_balance, iso_currency_code
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
            ]
          );
          
          if (upsertResult.rows[0].inserted) {
            results.accounts_added++;
          } else {
            results.accounts_updated++;
          }
          
          console.log(`  - ${account.name} (${account.mask}): ${account.type}/${account.subtype}`);
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
 * Returns all linked bank accounts
 */
router.get('/accounts', async (req, res) => {
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
        ac.name as linked_account_name
       FROM plaid_accounts pa
       JOIN plaid_items pi ON pa.plaid_item_id = pi.id
       LEFT JOIN accounts_chart ac ON pa.linked_account_id = ac.id
       ORDER BY pi.institution_name, pa.name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

/**
 * GET /api/v1/plaid/items
 * Returns all Plaid items (bank connections)
 */
router.get('/items', async (req, res) => {
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
       GROUP BY pi.id
       ORDER BY pi.created_at DESC`
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
router.put('/accounts/:id/link', async (req, res) => {
  const { id } = req.params;
  const { linked_account_id } = req.body;

  try {
    // If linking (not unlinking), check if GL account is already linked to another Plaid account
    if (linked_account_id) {
      const existingLink = await db.query(
        `SELECT pa.id, pa.name, pa.mask, pi.institution_name
         FROM plaid_accounts pa
         JOIN plaid_items pi ON pa.plaid_item_id = pi.id
         WHERE pa.linked_account_id = $1 AND pa.id != $2`,
        [linked_account_id, id]
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
       WHERE id = $2
       RETURNING *`,
      [linked_account_id, id]
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
router.delete('/items/:item_id', async (req, res) => {
  const { item_id } = req.params;

  try {
    // Get the item
    const itemResult = await db.query(
      'SELECT * FROM plaid_items WHERE item_id = $1',
      [item_id]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = itemResult.rows[0];

    // Remove from Plaid API
    try {
      await plaidClient.itemRemove({ access_token: item.access_token });
    } catch (e) {
      console.warn('Could not remove item from Plaid API:', e.message);
      // Continue anyway - we still want to clean up our database
    }

    // Get the plaid_accounts for this item
    const accountsResult = await db.query(
      'SELECT id FROM plaid_accounts WHERE plaid_item_id = $1',
      [item.id]
    );
    const accountIds = accountsResult.rows.map(r => r.id);

    // Nullify plaid_account_id on transactions (preserve the transactions, just unlink them)
    if (accountIds.length > 0) {
      await db.query(
        `UPDATE transactions SET plaid_account_id = NULL 
         WHERE plaid_account_id = ANY($1)`,
        [accountIds]
      );
    }

    // Delete plaid_accounts first (FK doesn't have CASCADE)
    await db.query('DELETE FROM plaid_accounts WHERE plaid_item_id = $1', [item.id]);
    
    // Now delete the plaid_item
    await db.query('DELETE FROM plaid_items WHERE item_id = $1', [item_id]);

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
// WEBHOOKS - Receive updates from Plaid
// ============================================================================

/**
 * POST /api/v1/plaid/webhook
 * Receives webhook notifications from Plaid
 */
router.post('/webhook', async (req, res) => {
  const { webhook_type, webhook_code, item_id } = req.body;

  console.log(`Plaid Webhook: ${webhook_type} - ${webhook_code} for item ${item_id}`);

  try {
    switch (webhook_type) {
      case 'TRANSACTIONS':
        if (['SYNC_UPDATES_AVAILABLE', 'INITIAL_UPDATE', 'HISTORICAL_UPDATE'].includes(webhook_code)) {
          // Trigger a sync for this item
          const itemResult = await db.query(
            'SELECT * FROM plaid_items WHERE item_id = $1 AND status = $2',
            [item_id, 'active']
          );
          
          if (itemResult.rows.length > 0) {
            const results = { added: 0, modified: 0, removed: 0 };
            await syncItemTransactions(itemResult.rows[0], results);
            console.log(`Webhook sync complete for ${item_id}:`, results);
          }
        }
        break;

      case 'ITEM':
        if (webhook_code === 'ERROR') {
          const { error } = req.body;
          await db.query(
            `UPDATE plaid_items SET status = 'error', error_code = $1, error_message = $2, updated_at = NOW()
             WHERE item_id = $3`,
            [error?.error_code, error?.error_message, item_id]
          );
        } else if (webhook_code === 'PENDING_EXPIRATION') {
          // Item needs re-authentication
          await db.query(
            `UPDATE plaid_items SET status = 'pending_reauth', updated_at = NOW()
             WHERE item_id = $1`,
            [item_id]
          );
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