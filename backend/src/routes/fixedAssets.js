/**
 * Fixed Assets Routes
 * Asset register CRUD, depreciation schedule generation, depreciation posting,
 * and disposal workflow.
 * Tenant-aware: all operations scoped to req.user.tenant_id
 */

const express = require('express');
const db = require('../../config/database');
const { authenticate, requireStaff, requireAdmin } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ============================================================================
// HELPERS
// ============================================================================

const ASSET_CATEGORIES = [
  'Vehicles', 'Equipment', 'Buildings', 'Land',
  'Livestock Infrastructure', 'POS Hardware', 'Furniture',
  'Trailers', 'Tools', 'Technology', 'Other',
];

/**
 * Generate the next asset number for a tenant (FA-0001, FA-0002, …)
 */
async function nextAssetNumber(client, tenantId) {
  const result = await client.query(
    `SELECT asset_number FROM fixed_assets
     WHERE tenant_id = $1
     ORDER BY asset_number DESC LIMIT 1`,
    [tenantId],
  );
  if (result.rows.length === 0) return 'FA-0001';
  const last = result.rows[0].asset_number; // e.g. "FA-0042"
  const num = parseInt(last.replace(/^FA-/, ''), 10) || 0;
  return `FA-${String(num + 1).padStart(4, '0')}`;
}

/**
 * Calculate depreciation schedule rows for an asset.
 * Returns an array of { period_number, period_date, depreciation_amount,
 *   accumulated_total, book_value_after }.
 * Does NOT touch the database.
 */
function calculateSchedule(asset) {
  const {
    depreciation_method,
    purchase_cost,
    salvage_value,
    useful_life_months,
    in_service_date,
    declining_balance_rate,
  } = asset;

  const cost = parseFloat(purchase_cost);
  const salvage = parseFloat(salvage_value) || 0;
  const depreciable = cost - salvage;
  const months = parseInt(useful_life_months, 10);
  const startDate = new Date(in_service_date || asset.purchase_date);

  const rows = [];

  if (depreciation_method === 'none' || !months || months <= 0 || depreciable <= 0) {
    return rows;
  }

  if (depreciation_method === 'straight_line') {
    const monthly = Math.round((depreciable / months) * 100) / 100;
    let accumulated = 0;
    for (let i = 1; i <= months; i++) {
      // Last period absorbs rounding remainder
      let amt = i < months ? monthly : Math.round((depreciable - accumulated) * 100) / 100;
      amt = Math.max(0, amt);
      accumulated = Math.round((accumulated + amt) * 100) / 100;
      const periodDate = endOfMonth(startDate, i);
      rows.push({
        period_number: i,
        period_date: periodDate,
        depreciation_amount: amt,
        accumulated_total: accumulated,
        book_value_after: Math.round((cost - accumulated) * 100) / 100,
      });
    }
  } else if (depreciation_method === 'declining_balance' || depreciation_method === 'double_declining') {
    let annualRate;
    if (depreciation_method === 'double_declining') {
      annualRate = (2 / (months / 12)) * 100; // double the straight-line annual rate
    } else {
      annualRate = parseFloat(declining_balance_rate) || ((1 / (months / 12)) * 100);
    }
    const monthlyRate = annualRate / 12 / 100;
    let bookValue = cost;
    let accumulated = 0;
    for (let i = 1; i <= months; i++) {
      let amt = Math.round(bookValue * monthlyRate * 100) / 100;
      // Don't depreciate below salvage
      if (bookValue - amt < salvage) {
        amt = Math.round((bookValue - salvage) * 100) / 100;
      }
      amt = Math.max(0, amt);
      accumulated = Math.round((accumulated + amt) * 100) / 100;
      bookValue = Math.round((cost - accumulated) * 100) / 100;
      const periodDate = endOfMonth(startDate, i);
      rows.push({
        period_number: i,
        period_date: periodDate,
        depreciation_amount: amt,
        accumulated_total: accumulated,
        book_value_after: bookValue,
      });
      if (bookValue <= salvage) break;
    }
  } else if (depreciation_method === 'sum_of_years_digits') {
    const years = Math.ceil(months / 12);
    const sumOfYears = (years * (years + 1)) / 2;
    let accumulated = 0;
    let periodNum = 0;
    for (let yr = years; yr >= 1; yr--) {
      const yearlyAmt = depreciable * (yr / sumOfYears);
      const monthsThisYear = yr === years ? (months % 12 || 12) : 12;
      const monthlyAmt = yearlyAmt / 12;
      for (let m = 0; m < monthsThisYear; m++) {
        periodNum++;
        if (periodNum > months) break;
        let amt = Math.round(monthlyAmt * 100) / 100;
        if (accumulated + amt > depreciable) amt = Math.round((depreciable - accumulated) * 100) / 100;
        amt = Math.max(0, amt);
        accumulated = Math.round((accumulated + amt) * 100) / 100;
        const periodDate = endOfMonth(startDate, periodNum);
        rows.push({
          period_number: periodNum,
          period_date: periodDate,
          depreciation_amount: amt,
          accumulated_total: accumulated,
          book_value_after: Math.round((cost - accumulated) * 100) / 100,
        });
      }
    }
  }

  return rows;
}

/** Return YYYY-MM-DD for the last day of (startDate + offsetMonths). */
function endOfMonth(start, offsetMonths) {
  const d = new Date(start);
  d.setMonth(d.getMonth() + offsetMonths + 1, 0); // day 0 of next month = last day
  return d.toISOString().split('T')[0];
}

// ============================================================================
// GET /fixed-assets  — list with filters
// ============================================================================

router.get('/', requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { status, category, search, page = 1, limit = 50 } = req.query;

  let queryText = `
    SELECT fa.*,
           ac_asset.account_code  AS asset_account_code,
           ac_asset.name          AS asset_account_name,
           ac_accum.account_code  AS accum_depr_account_code,
           ac_accum.name          AS accum_depr_account_name,
           ac_exp.account_code    AS depr_expense_account_code,
           ac_exp.name            AS depr_expense_account_name,
           cl.name                AS class_name,
           v.name                 AS vendor_name
    FROM fixed_assets fa
    JOIN accounts_chart ac_asset ON fa.asset_account_id = ac_asset.id
    JOIN accounts_chart ac_accum ON fa.accumulated_depreciation_account_id = ac_accum.id
    JOIN accounts_chart ac_exp   ON fa.depreciation_expense_account_id = ac_exp.id
    LEFT JOIN classes cl ON fa.class_id = cl.id
    LEFT JOIN vendors v  ON fa.vendor_id = v.id
    WHERE fa.tenant_id = $1
  `;
  const params = [tenantId];
  let p = 1;

  if (status) {
    params.push(status);
    queryText += ` AND fa.status = $${++p}`;
  }
  if (category) {
    params.push(category);
    queryText += ` AND fa.category = $${++p}`;
  }
  if (search) {
    params.push(`%${search}%`);
    ++p;
    queryText += ` AND (fa.name ILIKE $${p} OR fa.asset_number ILIKE $${p} OR fa.serial_number ILIKE $${p})`;
  }

  // Count
  const countRes = await db.query(`SELECT COUNT(*) FROM (${queryText}) t`, params);
  const total = parseInt(countRes.rows[0].count, 10);

  queryText += ' ORDER BY fa.asset_number ASC';
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  params.push(parseInt(limit, 10), offset);
  queryText += ` LIMIT $${++p} OFFSET $${++p}`;

  const result = await db.query(queryText, params);

  res.json({
    status: 'success',
    data: result.rows,
    pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages: Math.ceil(total / parseInt(limit, 10)) },
  });
}));

// ============================================================================
// GET /fixed-assets/categories  — distinct category list for filters
// ============================================================================

router.get('/categories', requireStaff, asyncHandler(async (req, res) => {
  res.json({ status: 'success', data: ASSET_CATEGORIES });
}));

// ============================================================================
// GET /fixed-assets/summary  — totals by status / category
// ============================================================================

router.get('/summary', requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const result = await db.query(`
    SELECT
      COUNT(*)                                            AS total_assets,
      COUNT(*) FILTER (WHERE status = 'active')           AS active_count,
      COUNT(*) FILTER (WHERE status = 'fully_depreciated') AS fully_depreciated_count,
      COUNT(*) FILTER (WHERE status = 'disposed')         AS disposed_count,
      COALESCE(SUM(purchase_cost), 0)                     AS total_cost,
      COALESCE(SUM(accumulated_depreciation), 0)          AS total_accumulated,
      COALESCE(SUM(current_book_value), 0)                AS total_book_value
    FROM fixed_assets
    WHERE tenant_id = $1
  `, [tenantId]);

  res.json({ status: 'success', data: result.rows[0] });
}));

// ============================================================================
// GET /fixed-assets/:id  — single asset with schedule
// ============================================================================

router.get('/:id', requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;

  const assetRes = await db.query(`
    SELECT fa.*,
           ac_asset.account_code AS asset_account_code, ac_asset.name AS asset_account_name,
           ac_accum.account_code AS accum_depr_account_code, ac_accum.name AS accum_depr_account_name,
           ac_exp.account_code   AS depr_expense_account_code, ac_exp.name AS depr_expense_account_name,
           cl.name AS class_name, v.name AS vendor_name
    FROM fixed_assets fa
    JOIN accounts_chart ac_asset ON fa.asset_account_id = ac_asset.id
    JOIN accounts_chart ac_accum ON fa.accumulated_depreciation_account_id = ac_accum.id
    JOIN accounts_chart ac_exp   ON fa.depreciation_expense_account_id = ac_exp.id
    LEFT JOIN classes cl ON fa.class_id = cl.id
    LEFT JOIN vendors v  ON fa.vendor_id = v.id
    WHERE fa.id = $1 AND fa.tenant_id = $2
  `, [id, tenantId]);

  if (assetRes.rows.length === 0) throw new ApiError(404, 'Asset not found');

  const schedRes = await db.query(`
    SELECT ads.*,
           a.name AS posted_by_name,
           je.entry_number AS journal_entry_number
    FROM asset_depreciation_schedule ads
    LEFT JOIN accounts a ON ads.posted_by = a.id
    LEFT JOIN journal_entries je ON ads.journal_entry_id = je.id
    WHERE ads.fixed_asset_id = $1 AND ads.tenant_id = $2
    ORDER BY ads.period_number ASC
  `, [id, tenantId]);

  res.json({
    status: 'success',
    data: { ...assetRes.rows[0], schedule: schedRes.rows },
  });
}));

// ============================================================================
// POST /fixed-assets  — create new asset + generate schedule
// ============================================================================

router.post('/', requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const {
    name, description, category,
    serial_number, make, model, year, location, barcode,
    purchase_date, in_service_date, purchase_cost, vendor_id,
    depreciation_method = 'straight_line',
    useful_life_months, salvage_value = 0,
    declining_balance_rate,
    estimated_total_units, units_label,
    asset_account_id, accumulated_depreciation_account_id, depreciation_expense_account_id,
    class_id, notes,
  } = req.body;

  if (!name || !category || !purchase_date || purchase_cost == null
      || !asset_account_id || !accumulated_depreciation_account_id || !depreciation_expense_account_id) {
    throw new ApiError(400, 'name, category, purchase_date, purchase_cost, and GL account IDs are required');
  }

  if (depreciation_method !== 'none' && !useful_life_months) {
    throw new ApiError(400, 'useful_life_months is required for depreciable assets');
  }

  const asset = await db.transaction(async (client) => {
    const assetNumber = await nextAssetNumber(client, tenantId);

    const insertRes = await client.query(`
      INSERT INTO fixed_assets (
        tenant_id, asset_number, name, description, category,
        serial_number, make, model, year, location, barcode,
        purchase_date, in_service_date, purchase_cost, vendor_id,
        depreciation_method, useful_life_months, salvage_value,
        declining_balance_rate, estimated_total_units, units_label,
        asset_account_id, accumulated_depreciation_account_id, depreciation_expense_account_id,
        class_id, current_book_value, notes, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28
      ) RETURNING *
    `, [
      tenantId, assetNumber, name, description || null, category,
      serial_number || null, make || null, model || null, year || null, location || null, barcode || null,
      purchase_date, in_service_date || purchase_date, purchase_cost, vendor_id || null,
      depreciation_method, useful_life_months || null, salvage_value,
      declining_balance_rate || null, estimated_total_units || null, units_label || null,
      asset_account_id, accumulated_depreciation_account_id, depreciation_expense_account_id,
      class_id || null, purchase_cost, notes || null, req.user.id,
    ]);

    const newAsset = insertRes.rows[0];

    // Generate depreciation schedule rows
    const schedRows = calculateSchedule(newAsset);
    for (const row of schedRows) {
      await client.query(`
        INSERT INTO asset_depreciation_schedule (
          fixed_asset_id, tenant_id, period_number, period_date,
          depreciation_amount, accumulated_total, book_value_after
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)
      `, [
        newAsset.id, tenantId, row.period_number, row.period_date,
        row.depreciation_amount, row.accumulated_total, row.book_value_after,
      ]);
    }

    return newAsset;
  });

  logger.info('Fixed asset created', { assetId: asset.id, assetNumber: asset.asset_number, createdBy: req.user.id });

  res.status(201).json({ status: 'success', data: asset });
}));

// ============================================================================
// PUT /fixed-assets/:id  — update asset (non-disposed only)
// ============================================================================

router.put('/:id', requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;
  const {
    name, description, category,
    serial_number, make, model, year, location, barcode,
    in_service_date, vendor_id,
    asset_account_id, accumulated_depreciation_account_id, depreciation_expense_account_id,
    class_id, notes,
    warranty_expiration, insurance_policy, photo_url,
  } = req.body;

  const result = await db.query(`
    UPDATE fixed_assets SET
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      category = COALESCE($3, category),
      serial_number = COALESCE($4, serial_number),
      make = COALESCE($5, make),
      model = COALESCE($6, model),
      year = COALESCE($7, year),
      location = COALESCE($8, location),
      barcode = COALESCE($9, barcode),
      in_service_date = COALESCE($10, in_service_date),
      vendor_id = $11,
      asset_account_id = COALESCE($12, asset_account_id),
      accumulated_depreciation_account_id = COALESCE($13, accumulated_depreciation_account_id),
      depreciation_expense_account_id = COALESCE($14, depreciation_expense_account_id),
      class_id = $15,
      notes = COALESCE($16, notes),
      warranty_expiration = $17,
      insurance_policy = $18,
      photo_url = $19,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $20 AND tenant_id = $21 AND status NOT IN ('disposed')
    RETURNING *
  `, [
    name, description, category,
    serial_number, make, model, year, location, barcode,
    in_service_date, vendor_id !== undefined ? vendor_id : null,
    asset_account_id, accumulated_depreciation_account_id, depreciation_expense_account_id,
    class_id !== undefined ? class_id : null,
    notes,
    warranty_expiration !== undefined ? warranty_expiration : null,
    insurance_policy !== undefined ? insurance_policy : null,
    photo_url !== undefined ? photo_url : null,
    id, tenantId,
  ]);

  if (result.rows.length === 0) throw new ApiError(404, 'Asset not found or already disposed');

  logger.info('Fixed asset updated', { assetId: id, updatedBy: req.user.id });
  res.json({ status: 'success', data: result.rows[0] });
}));

// ============================================================================
// POST /fixed-assets/:id/regenerate-schedule
// Delete un-posted schedule rows and regenerate from current state.
// ============================================================================

router.post('/:id/regenerate-schedule', requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;

  const result = await db.transaction(async (client) => {
    const assetRes = await client.query(
      'SELECT * FROM fixed_assets WHERE id = $1 AND tenant_id = $2 FOR UPDATE',
      [id, tenantId],
    );
    if (assetRes.rows.length === 0) throw new ApiError(404, 'Asset not found');
    const asset = assetRes.rows[0];

    if (asset.status === 'disposed') throw new ApiError(400, 'Cannot regenerate schedule for disposed asset');

    // Remove only un-posted rows
    await client.query(
      'DELETE FROM asset_depreciation_schedule WHERE fixed_asset_id = $1 AND tenant_id = $2 AND is_posted = false',
      [id, tenantId],
    );

    // Determine the highest posted period number
    const lastPostedRes = await client.query(
      `SELECT MAX(period_number) AS last_period, COALESCE(MAX(accumulated_total),0) AS last_accumulated
       FROM asset_depreciation_schedule
       WHERE fixed_asset_id = $1 AND tenant_id = $2 AND is_posted = true`,
      [id, tenantId],
    );
    const lastPeriod = parseInt(lastPostedRes.rows[0].last_period, 10) || 0;

    // Generate full schedule then keep only the un-posted portion
    const fullSchedule = calculateSchedule(asset);
    const newRows = fullSchedule.filter(r => r.period_number > lastPeriod);

    for (const row of newRows) {
      await client.query(`
        INSERT INTO asset_depreciation_schedule (
          fixed_asset_id, tenant_id, period_number, period_date,
          depreciation_amount, accumulated_total, book_value_after
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)
      `, [id, tenantId, row.period_number, row.period_date,
          row.depreciation_amount, row.accumulated_total, row.book_value_after]);
    }

    return { regenerated: newRows.length, from_period: lastPeriod + 1 };
  });

  res.json({ status: 'success', data: result });
}));

// ============================================================================
// POST /fixed-assets/:id/post-depreciation
// Post one or more un-posted schedule rows → creates journal entries + updates
// the asset's accumulated_depreciation and current_book_value.
// ============================================================================

router.post('/:id/post-depreciation', requireStaff, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;
  const { through_period } = req.body; // optional: post up to this period_number

  const posted = await db.transaction(async (client) => {
    const assetRes = await client.query(
      'SELECT * FROM fixed_assets WHERE id = $1 AND tenant_id = $2 FOR UPDATE',
      [id, tenantId],
    );
    if (assetRes.rows.length === 0) throw new ApiError(404, 'Asset not found');
    const asset = assetRes.rows[0];

    if (asset.status === 'disposed') throw new ApiError(400, 'Cannot post depreciation for disposed asset');

    // Find un-posted rows in order
    let schedQuery = `
      SELECT * FROM asset_depreciation_schedule
      WHERE fixed_asset_id = $1 AND tenant_id = $2 AND is_posted = false
    `;
    const schedParams = [id, tenantId];
    if (through_period) {
      schedParams.push(through_period);
      schedQuery += ` AND period_number <= $3`;
    }
    schedQuery += ' ORDER BY period_number ASC';

    const schedRes = await client.query(schedQuery, schedParams);
    if (schedRes.rows.length === 0) throw new ApiError(400, 'No un-posted periods to post');

    const postedEntries = [];

    for (const row of schedRes.rows) {
      // Get next JE entry number
      const numRes = await client.query(
        `SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM '[0-9]+$') AS INT)),0)+1 AS next_num
         FROM journal_entries WHERE tenant_id = $1`,
        [tenantId],
      );
      const entryNumber = `JE-${String(numRes.rows[0].next_num).padStart(5, '0')}`;

      // Create journal entry header
      const jeRes = await client.query(`
        INSERT INTO journal_entries (
          tenant_id, entry_number, entry_date, description, reference,
          source_type, total_debit, total_credit, status, created_by
        ) VALUES ($1,$2,$3,$4,$5,'depreciation',$6,$6,'posted',$7)
        RETURNING id
      `, [
        tenantId, entryNumber, row.period_date,
        `Depreciation: ${asset.name} (${asset.asset_number}) - Period ${row.period_number}`,
        asset.asset_number,
        row.depreciation_amount, req.user.id,
      ]);
      const jeId = jeRes.rows[0].id;

      // Debit depreciation expense
      await client.query(`
        INSERT INTO journal_entry_lines (
          journal_entry_id, tenant_id, account_id, description, debit, credit, class_id, line_order
        ) VALUES ($1,$2,$3,$4,$5,0,$6,1)
      `, [jeId, tenantId, asset.depreciation_expense_account_id,
          `Depreciation - ${asset.name}`, row.depreciation_amount, asset.class_id || null]);

      // Credit accumulated depreciation
      await client.query(`
        INSERT INTO journal_entry_lines (
          journal_entry_id, tenant_id, account_id, description, debit, credit, class_id, line_order
        ) VALUES ($1,$2,$3,$4,0,$5,$6,2)
      `, [jeId, tenantId, asset.accumulated_depreciation_account_id,
          `Accum Depr - ${asset.name}`, row.depreciation_amount, asset.class_id || null]);

      // Update account balances (expense debit, contra-asset credit)
      await client.query(
        'UPDATE accounts_chart SET balance = balance + $1 WHERE id = $2 AND tenant_id = $3',
        [row.depreciation_amount, asset.depreciation_expense_account_id, tenantId],
      );
      await client.query(
        'UPDATE accounts_chart SET balance = balance + $1 WHERE id = $2 AND tenant_id = $3',
        [row.depreciation_amount, asset.accumulated_depreciation_account_id, tenantId],
      );

      // Mark schedule row as posted
      await client.query(`
        UPDATE asset_depreciation_schedule SET
          journal_entry_id = $1, is_posted = true, posted_at = CURRENT_TIMESTAMP, posted_by = $2
        WHERE id = $3 AND tenant_id = $4
      `, [jeId, req.user.id, row.id, tenantId]);

      postedEntries.push({ period_number: row.period_number, journal_entry_id: jeId, entry_number: entryNumber });
    }

    // Update the asset running totals
    const lastRow = schedRes.rows[schedRes.rows.length - 1];
    const newStatus = parseFloat(lastRow.book_value_after) <= parseFloat(asset.salvage_value)
      ? 'fully_depreciated' : asset.status;

    await client.query(`
      UPDATE fixed_assets SET
        accumulated_depreciation = $1,
        current_book_value = $2,
        status = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND tenant_id = $5
    `, [lastRow.accumulated_total, lastRow.book_value_after, newStatus, id, tenantId]);

    return postedEntries;
  });

  logger.info('Depreciation posted', { assetId: id, periodsPosted: posted.length, postedBy: req.user.id });

  res.json({ status: 'success', data: { periods_posted: posted.length, entries: posted } });
}));

// ============================================================================
// POST /fixed-assets/:id/dispose  — record asset disposal
// Creates a disposal journal entry, updates asset status.
// ============================================================================

router.post('/:id/dispose', requireAdmin, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;
  const {
    disposal_date, disposal_method, disposal_amount = 0, disposal_notes,
    proceeds_account_id,
    loss_gain_account_id,
  } = req.body;

  if (!disposal_date || !disposal_method) {
    throw new ApiError(400, 'disposal_date and disposal_method are required');
  }
  if (!proceeds_account_id || !loss_gain_account_id) {
    throw new ApiError(400, 'proceeds_account_id and loss_gain_account_id are required for journal entry');
  }

  const result = await db.transaction(async (client) => {
    const assetRes = await client.query(
      'SELECT * FROM fixed_assets WHERE id = $1 AND tenant_id = $2 FOR UPDATE',
      [id, tenantId],
    );
    if (assetRes.rows.length === 0) throw new ApiError(404, 'Asset not found');
    const asset = assetRes.rows[0];
    if (asset.status === 'disposed') throw new ApiError(400, 'Asset already disposed');

    const bookValue = parseFloat(asset.current_book_value);
    const proceeds = parseFloat(disposal_amount) || 0;
    const gainLoss = proceeds - bookValue; // positive = gain, negative = loss
    const accumDepr = parseFloat(asset.accumulated_depreciation);
    const cost = parseFloat(asset.purchase_cost);

    // JE entry number
    const numRes = await client.query(
      `SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM '[0-9]+$') AS INT)),0)+1 AS next_num
       FROM journal_entries WHERE tenant_id = $1`,
      [tenantId],
    );
    const entryNumber = `JE-${String(numRes.rows[0].next_num).padStart(5, '0')}`;

    // Create disposal journal entry
    const totalDebit = accumDepr + proceeds + (gainLoss < 0 ? Math.abs(gainLoss) : 0);
    const totalCredit = cost + (gainLoss > 0 ? gainLoss : 0);

    const jeRes = await client.query(`
      INSERT INTO journal_entries (
        tenant_id, entry_number, entry_date, description, reference,
        source_type, total_debit, total_credit, status, created_by
      ) VALUES ($1,$2,$3,$4,$5,'disposal',$6,$7,'posted',$8)
      RETURNING id
    `, [
      tenantId, entryNumber, disposal_date,
      `Disposal of ${asset.name} (${asset.asset_number}) - ${disposal_method}`,
      asset.asset_number, totalDebit, totalCredit, req.user.id,
    ]);
    const jeId = jeRes.rows[0].id;

    let lineOrder = 0;

    // Debit: Accumulated Depreciation (remove contra-asset)
    if (accumDepr > 0) {
      await client.query(`
        INSERT INTO journal_entry_lines (journal_entry_id, tenant_id, account_id, description, debit, credit, line_order)
        VALUES ($1,$2,$3,$4,$5,0,$6)
      `, [jeId, tenantId, asset.accumulated_depreciation_account_id, 'Remove accumulated depreciation', accumDepr, ++lineOrder]);
    }

    // Debit: Cash/Receivable for proceeds
    if (proceeds > 0) {
      await client.query(`
        INSERT INTO journal_entry_lines (journal_entry_id, tenant_id, account_id, description, debit, credit, line_order)
        VALUES ($1,$2,$3,$4,$5,0,$6)
      `, [jeId, tenantId, proceeds_account_id, 'Disposal proceeds', proceeds, ++lineOrder]);
    }

    // Credit: Fixed Asset account (remove cost)
    await client.query(`
      INSERT INTO journal_entry_lines (journal_entry_id, tenant_id, account_id, description, debit, credit, line_order)
      VALUES ($1,$2,$3,$4,0,$5,$6)
    `, [jeId, tenantId, asset.asset_account_id, 'Remove asset cost', cost, ++lineOrder]);

    // Gain or Loss line
    if (Math.abs(gainLoss) >= 0.01) {
      if (gainLoss > 0) {
        // Credit gain
        await client.query(`
          INSERT INTO journal_entry_lines (journal_entry_id, tenant_id, account_id, description, debit, credit, line_order)
          VALUES ($1,$2,$3,$4,0,$5,$6)
        `, [jeId, tenantId, loss_gain_account_id, 'Gain on disposal', gainLoss, ++lineOrder]);
      } else {
        // Debit loss
        await client.query(`
          INSERT INTO journal_entry_lines (journal_entry_id, tenant_id, account_id, description, debit, credit, line_order)
          VALUES ($1,$2,$3,$4,$5,0,$6)
        `, [jeId, tenantId, loss_gain_account_id, 'Loss on disposal', Math.abs(gainLoss), ++lineOrder]);
      }
    }

    // Update GL balances
    // Remove accum depr (debit contra-asset → decreases balance)
    if (accumDepr > 0) {
      await client.query(
        'UPDATE accounts_chart SET balance = balance - $1 WHERE id = $2 AND tenant_id = $3',
        [accumDepr, asset.accumulated_depreciation_account_id, tenantId],
      );
    }
    // Remove asset cost (credit asset → decreases balance)
    await client.query(
      'UPDATE accounts_chart SET balance = balance - $1 WHERE id = $2 AND tenant_id = $3',
      [cost, asset.asset_account_id, tenantId],
    );
    // Proceeds
    if (proceeds > 0) {
      await client.query(
        'UPDATE accounts_chart SET balance = balance + $1 WHERE id = $2 AND tenant_id = $3',
        [proceeds, proceeds_account_id, tenantId],
      );
    }
    // Gain/Loss
    if (Math.abs(gainLoss) >= 0.01) {
      await client.query(
        'UPDATE accounts_chart SET balance = balance + $1 WHERE id = $2 AND tenant_id = $3',
        [Math.abs(gainLoss), loss_gain_account_id, tenantId],
      );
    }

    // Update asset record
    await client.query(`
      UPDATE fixed_assets SET
        status = 'disposed',
        disposal_date = $1,
        disposal_method = $2,
        disposal_amount = $3,
        disposal_notes = $4,
        disposal_journal_entry_id = $5,
        current_book_value = 0,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND tenant_id = $7
    `, [disposal_date, disposal_method, disposal_amount, disposal_notes || null, jeId, id, tenantId]);

    // Remove un-posted schedule rows
    await client.query(
      'DELETE FROM asset_depreciation_schedule WHERE fixed_asset_id = $1 AND tenant_id = $2 AND is_posted = false',
      [id, tenantId],
    );

    return {
      journal_entry_id: jeId,
      entry_number: entryNumber,
      book_value: bookValue,
      proceeds,
      gain_loss: gainLoss,
    };
  });

  logger.info('Asset disposed', { assetId: id, method: disposal_method, disposedBy: req.user.id });

  res.json({ status: 'success', data: result });
}));

// ============================================================================
// DELETE /fixed-assets/:id  — hard delete (draft/inactive only, admin)
// ============================================================================

router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;

  // Only allow deleting if no depreciation has been posted
  const postedCheck = await db.query(
    'SELECT COUNT(*) FROM asset_depreciation_schedule WHERE fixed_asset_id = $1 AND tenant_id = $2 AND is_posted = true',
    [id, tenantId],
  );
  if (parseInt(postedCheck.rows[0].count, 10) > 0) {
    throw new ApiError(400, 'Cannot delete asset with posted depreciation. Use disposal instead.');
  }

  const result = await db.query(
    'DELETE FROM fixed_assets WHERE id = $1 AND tenant_id = $2 RETURNING id, asset_number',
    [id, tenantId],
  );
  if (result.rows.length === 0) throw new ApiError(404, 'Asset not found');

  logger.info('Fixed asset deleted', { assetNumber: result.rows[0].asset_number, deletedBy: req.user.id });
  res.json({ status: 'success', message: `Asset ${result.rows[0].asset_number} deleted` });
}));

module.exports = router;
