// ============================================================================
// HOOD FAMILY FARMS - REPORT BUILDER API
// Route: /api/report-builder
// Description: Dynamic query builder for custom reports
// ============================================================================

const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Apply authentication to all routes
router.use(authenticate);

// ============================================================================
// OPERATOR DEFINITIONS
// ============================================================================

const OPERATORS = {
  text: [
    { value: 'equals', label: 'Equals', sql: '= $1' },
    { value: 'not_equals', label: 'Not Equals', sql: '!= $1' },
    { value: 'contains', label: 'Contains', sql: 'ILIKE $1', transform: (v) => `%${v}%` },
    { value: 'starts_with', label: 'Starts With', sql: 'ILIKE $1', transform: (v) => `${v}%` },
    { value: 'ends_with', label: 'Ends With', sql: 'ILIKE $1', transform: (v) => `%${v}` },
    { value: 'is_empty', label: 'Is Empty', sql: "IS NULL OR $ = ''", noValue: true },
    { value: 'is_not_empty', label: 'Is Not Empty', sql: "IS NOT NULL AND $ != ''", noValue: true }
  ],
  number: [
    { value: 'equals', label: 'Equals', sql: '= $1' },
    { value: 'not_equals', label: 'Not Equals', sql: '!= $1' },
    { value: 'greater_than', label: 'Greater Than', sql: '> $1' },
    { value: 'greater_or_equal', label: 'Greater or Equal', sql: '>= $1' },
    { value: 'less_than', label: 'Less Than', sql: '< $1' },
    { value: 'less_or_equal', label: 'Less or Equal', sql: '<= $1' },
    { value: 'between', label: 'Between', sql: 'BETWEEN $1 AND $2', twoValues: true },
    { value: 'is_empty', label: 'Is Empty', sql: 'IS NULL', noValue: true },
    { value: 'is_not_empty', label: 'Is Not Empty', sql: 'IS NOT NULL', noValue: true }
  ],
  currency: [
    { value: 'equals', label: 'Equals', sql: '= $1' },
    { value: 'not_equals', label: 'Not Equals', sql: '!= $1' },
    { value: 'greater_than', label: 'Greater Than', sql: '> $1' },
    { value: 'greater_or_equal', label: 'Greater or Equal', sql: '>= $1' },
    { value: 'less_than', label: 'Less Than', sql: '< $1' },
    { value: 'less_or_equal', label: 'Less or Equal', sql: '<= $1' },
    { value: 'between', label: 'Between', sql: 'BETWEEN $1 AND $2', twoValues: true },
    { value: 'is_empty', label: 'Is Empty', sql: 'IS NULL', noValue: true },
    { value: 'is_not_empty', label: 'Is Not Empty', sql: 'IS NOT NULL', noValue: true }
  ],
  date: [
    { value: 'equals', label: 'Equals', sql: '= $1' },
    { value: 'not_equals', label: 'Not Equals', sql: '!= $1' },
    { value: 'before', label: 'Before', sql: '< $1' },
    { value: 'after', label: 'After', sql: '> $1' },
    { value: 'on_or_before', label: 'On or Before', sql: '<= $1' },
    { value: 'on_or_after', label: 'On or After', sql: '>= $1' },
    { value: 'between', label: 'Between', sql: 'BETWEEN $1 AND $2', twoValues: true },
    { value: 'within_last_days', label: 'Within Last N Days', sql: '>= CURRENT_DATE - INTERVAL \'$1 days\'', transform: (v) => parseInt(v) },
    { value: 'is_empty', label: 'Is Empty', sql: 'IS NULL', noValue: true },
    { value: 'is_not_empty', label: 'Is Not Empty', sql: 'IS NOT NULL', noValue: true }
  ],
  datetime: [
    { value: 'equals', label: 'Equals', sql: '::date = $1' },
    { value: 'before', label: 'Before', sql: '< $1' },
    { value: 'after', label: 'After', sql: '> $1' },
    { value: 'between', label: 'Between', sql: 'BETWEEN $1 AND $2', twoValues: true },
    { value: 'within_last_days', label: 'Within Last N Days', sql: '>= CURRENT_TIMESTAMP - INTERVAL \'$1 days\'', transform: (v) => parseInt(v) },
    { value: 'is_empty', label: 'Is Empty', sql: 'IS NULL', noValue: true },
    { value: 'is_not_empty', label: 'Is Not Empty', sql: 'IS NOT NULL', noValue: true }
  ],
  boolean: [
    { value: 'is_true', label: 'Is True', sql: '= true', noValue: true },
    { value: 'is_false', label: 'Is False', sql: '= false', noValue: true },
    { value: 'is_empty', label: 'Is Empty', sql: 'IS NULL', noValue: true }
  ],
  enum: [
    { value: 'equals', label: 'Equals', sql: '= $1' },
    { value: 'not_equals', label: 'Not Equals', sql: '!= $1' },
    { value: 'in_list', label: 'In List', sql: 'IN ($1)', isArray: true },
    { value: 'not_in_list', label: 'Not In List', sql: 'NOT IN ($1)', isArray: true },
    { value: 'is_empty', label: 'Is Empty', sql: 'IS NULL', noValue: true },
    { value: 'is_not_empty', label: 'Is Not Empty', sql: 'IS NOT NULL', noValue: true }
  ]
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates that a column name is safe (alphanumeric + underscore only)
 */
function isValidColumnName(name) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

/**
 * Builds the WHERE clause from constraints
 */
function buildWhereClause(constraints, fieldDefinitions, startParamIndex = 1) {
  const conditions = [];
  const params = [];
  let paramIndex = startParamIndex;
  
  const fieldMap = new Map(fieldDefinitions.map(f => [f.field_name, f]));
  
  for (const constraint of constraints) {
    const field = fieldMap.get(constraint.field);
    if (!field) {
      throw new Error(`Invalid field in constraint: ${constraint.field}`);
    }
    
    if (!isValidColumnName(constraint.field)) {
      throw new Error(`Invalid field name: ${constraint.field}`);
    }
    
    const operators = OPERATORS[field.data_type];
    if (!operators) {
      throw new Error(`Unknown data type: ${field.data_type}`);
    }
    
    const operator = operators.find(op => op.value === constraint.operator);
    if (!operator) {
      throw new Error(`Invalid operator "${constraint.operator}" for field type "${field.data_type}"`);
    }
    
    if (operator.noValue) {
      if (operator.sql.includes('$')) {
        conditions.push(`("${constraint.field}" ${operator.sql.replace(/\$/g, `"${constraint.field}"`)})`);
      } else {
        conditions.push(`"${constraint.field}" ${operator.sql}`);
      }
    } else if (operator.twoValues) {
      const values = Array.isArray(constraint.value) ? constraint.value : [constraint.value, constraint.value2];
      conditions.push(`"${constraint.field}" BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      params.push(values[0], values[1]);
      paramIndex += 2;
    } else if (operator.isArray) {
      const values = Array.isArray(constraint.value) ? constraint.value : [constraint.value];
      const placeholders = values.map((_, i) => `$${paramIndex + i}`).join(', ');
      const sqlOp = operator.sql.replace('$1', placeholders);
      conditions.push(`"${constraint.field}" ${sqlOp}`);
      params.push(...values);
      paramIndex += values.length;
    } else if (operator.transform) {
      const transformedValue = operator.transform(constraint.value);
      conditions.push(`"${constraint.field}" ${operator.sql.replace('$1', `$${paramIndex}`)}`);
      params.push(transformedValue);
      paramIndex++;
    } else {
      conditions.push(`"${constraint.field}" ${operator.sql.replace('$1', `$${paramIndex}`)}`);
      params.push(constraint.value);
      paramIndex++;
    }
  }
  
  return { conditions, params, nextParamIndex: paramIndex };
}

/**
 * Builds a complete report query
 */
function buildReportQuery(recordDef, columns, constraints, sortConfig, tenantId, fieldDefinitions, page = 1, pageSize = 50) {
  for (const col of columns) {
    if (!isValidColumnName(col)) {
      throw new Error(`Invalid column name: ${col}`);
    }
  }
  
  const selectColumns = columns.map(c => `"${c}"`).join(', ');
  const fromClause = `"${recordDef.source_name}"`;
  
  let whereConditions = [];
  let params = [];
  let paramIndex = 1;
  
  if (recordDef.is_tenant_filtered) {
    whereConditions.push(`"${recordDef.tenant_id_column}" = $${paramIndex}`);
    params.push(tenantId);
    paramIndex++;
  }
  
  if (constraints && constraints.length > 0) {
    const { conditions, params: constraintParams, nextParamIndex } = buildWhereClause(
      constraints, fieldDefinitions, paramIndex
    );
    whereConditions = whereConditions.concat(conditions);
    params = params.concat(constraintParams);
    paramIndex = nextParamIndex;
  }
  
  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}` 
    : '';
  
  let orderByClause = '';
  if (sortConfig && sortConfig.length > 0) {
    const sortParts = sortConfig.map(s => {
      if (!isValidColumnName(s.field)) {
        throw new Error(`Invalid sort field: ${s.field}`);
      }
      const direction = s.direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      return `"${s.field}" ${direction} NULLS LAST`;
    });
    orderByClause = `ORDER BY ${sortParts.join(', ')}`;
  }
  
  const offset = (page - 1) * pageSize;
  const limitClause = `LIMIT ${parseInt(pageSize)} OFFSET ${parseInt(offset)}`;
  
  const dataQuery = `SELECT ${selectColumns} FROM ${fromClause} ${whereClause} ${orderByClause} ${limitClause}`;
  const countQuery = `SELECT COUNT(*) as total FROM ${fromClause} ${whereClause}`;
  
  return { dataQuery, countQuery, params };
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/report-builder/operators
 */
router.get('/operators', asyncHandler(async (req, res) => {
  res.json(OPERATORS);
}));

/**
 * GET /api/report-builder/records
 */
router.get('/records', asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT record_name, display_name, description, source_type, category, sort_order
    FROM report_record_definitions
    WHERE is_active = true
    ORDER BY category, sort_order, display_name
  `);
  
  const grouped = result.rows.reduce((acc, record) => {
    if (!acc[record.category]) acc[record.category] = [];
    acc[record.category].push(record);
    return acc;
  }, {});
  
  res.json({ records: result.rows, grouped });
}));

/**
 * GET /api/report-builder/records/:recordName
 */
router.get('/records/:recordName', asyncHandler(async (req, res) => {
  const { recordName } = req.params;
  
  const result = await db.query(`
    SELECT id, record_name, display_name, description, source_type, source_name, 
           category, is_tenant_filtered, tenant_id_column
    FROM report_record_definitions
    WHERE record_name = $1 AND is_active = true
  `, [recordName]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Record type not found' });
  }
  
  res.json(result.rows[0]);
}));

/**
 * GET /api/report-builder/records/:recordName/fields
 */
router.get('/records/:recordName/fields', asyncHandler(async (req, res) => {
  const { recordName } = req.params;
  
  const result = await db.query(`
    SELECT f.id, f.field_name, f.display_name, f.data_type, f.enum_values,
           f.is_filterable, f.is_sortable, f.is_groupable, f.is_aggregatable,
           f.default_selected, f.format_hint, f.column_width, f.sort_order
    FROM report_field_definitions f
    JOIN report_record_definitions r ON r.id = f.record_id
    WHERE r.record_name = $1 AND f.is_active = true
    ORDER BY f.sort_order, f.display_name
  `, [recordName]);
  
  const fieldsWithOperators = result.rows.map(field => ({
    ...field,
    operators: OPERATORS[field.data_type] || []
  }));
  
  res.json(fieldsWithOperators);
}));

/**
 * POST /api/report-builder/preview
 */
router.post('/preview', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { recordName, columns, constraints = [], sortConfig = [], page = 1, pageSize = 50 } = req.body;
  
  if (!recordName) return res.status(400).json({ error: 'Record name is required' });
  if (!columns || columns.length === 0) return res.status(400).json({ error: 'At least one column must be selected' });
  
  const validPageSize = Math.min(Math.max(parseInt(pageSize) || 50, 1), 500);
  const validPage = Math.max(parseInt(page) || 1, 1);
  
  const recordResult = await db.query(`
    SELECT id, record_name, source_name, is_tenant_filtered, tenant_id_column
    FROM report_record_definitions
    WHERE record_name = $1 AND is_active = true
  `, [recordName]);
  
  if (recordResult.rows.length === 0) {
    return res.status(404).json({ error: 'Record type not found' });
  }
  
  const recordDef = recordResult.rows[0];
  
  const fieldResult = await db.query(`
    SELECT field_name, data_type, enum_values
    FROM report_field_definitions
    WHERE record_id = $1 AND is_active = true
  `, [recordDef.id]);
  
  const fieldDefinitions = fieldResult.rows;
  const validFieldNames = new Set(fieldDefinitions.map(f => f.field_name));
  
  const invalidColumns = columns.filter(c => !validFieldNames.has(c));
  if (invalidColumns.length > 0) {
    return res.status(400).json({ error: `Invalid columns: ${invalidColumns.join(', ')}` });
  }
  
  for (const constraint of constraints) {
    if (!validFieldNames.has(constraint.field)) {
      return res.status(400).json({ error: `Invalid constraint field: ${constraint.field}` });
    }
  }
  
  for (const sort of sortConfig) {
    if (!validFieldNames.has(sort.field)) {
      return res.status(400).json({ error: `Invalid sort field: ${sort.field}` });
    }
  }
  
  const startTime = Date.now();
  const { dataQuery, countQuery, params } = buildReportQuery(
    recordDef, columns, constraints, sortConfig, tenantId, fieldDefinitions, validPage, validPageSize
  );
  
  const [dataResult, countResult] = await Promise.all([
    db.query(dataQuery, params),
    db.query(countQuery, params)
  ]);
  
  const executionTime = Date.now() - startTime;
  const totalRows = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(totalRows / validPageSize);
  
  res.json({
    data: dataResult.rows,
    pagination: {
      page: validPage,
      pageSize: validPageSize,
      totalRows,
      totalPages,
      hasNextPage: validPage < totalPages,
      hasPrevPage: validPage > 1
    },
    meta: { executionTimeMs: executionTime, columns, recordName }
  });
}));

/**
 * GET /api/report-builder/reports
 */
router.get('/reports', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { favorite, recordType } = req.query;
  
  let query = `
    SELECT r.id, r.name, r.description, r.record_type,
           rd.display_name as record_display_name, rd.category as record_category,
           r.is_favorite, r.is_shared, r.run_count, r.last_run_at,
           r.created_by, a.name as created_by_name, r.created_at, r.updated_at
    FROM custom_reports r
    LEFT JOIN report_record_definitions rd ON rd.record_name = r.record_type
    LEFT JOIN accounts a ON a.id = r.created_by
    WHERE r.tenant_id = $1
  `;
  
  const params = [tenantId];
  let paramIndex = 2;
  
  if (favorite === 'true') query += ` AND r.is_favorite = true`;
  
  if (recordType) {
    query += ` AND r.record_type = $${paramIndex}`;
    params.push(recordType);
    paramIndex++;
  }
  
  query += ` ORDER BY r.is_favorite DESC, r.updated_at DESC`;
  
  const result = await db.query(query, params);
  res.json(result.rows);
}));

/**
 * GET /api/report-builder/reports/:id
 */
router.get('/reports/:id', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;
  
  const result = await db.query(`
    SELECT r.*, rd.display_name as record_display_name, rd.category as record_category,
           a.name as created_by_name
    FROM custom_reports r
    LEFT JOIN report_record_definitions rd ON rd.record_name = r.record_type
    LEFT JOIN accounts a ON a.id = r.created_by
    WHERE r.id = $1 AND r.tenant_id = $2
  `, [id, tenantId]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Report not found' });
  }
  
  res.json(result.rows[0]);
}));

/**
 * POST /api/report-builder/reports
 */
router.post('/reports', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const userId = req.user.id;
  const {
    name, description, recordType, selectedColumns, constraints, sortConfig,
    groupByFields, aggregations, pageSize, showRowNumbers, showTotals, isFavorite, isShared
  } = req.body;
  
  if (!name || !recordType || !selectedColumns || selectedColumns.length === 0) {
    return res.status(400).json({ error: 'Name, record type, and at least one column are required' });
  }
  
  const recordCheck = await db.query(
    'SELECT id FROM report_record_definitions WHERE record_name = $1 AND is_active = true',
    [recordType]
  );
  
  if (recordCheck.rows.length === 0) {
    return res.status(400).json({ error: 'Invalid record type' });
  }
  
  const nameCheck = await db.query(
    'SELECT id FROM custom_reports WHERE tenant_id = $1 AND name = $2',
    [tenantId, name]
  );
  
  if (nameCheck.rows.length > 0) {
    return res.status(400).json({ error: 'A report with this name already exists' });
  }
  
  const result = await db.query(`
    INSERT INTO custom_reports (
      tenant_id, name, description, record_type, selected_columns, constraints,
      sort_config, group_by_fields, aggregations, page_size, show_row_numbers,
      show_totals, is_favorite, is_shared, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *
  `, [
    tenantId, name, description || null, recordType,
    JSON.stringify(selectedColumns), JSON.stringify(constraints || []),
    JSON.stringify(sortConfig || []), JSON.stringify(groupByFields || []),
    JSON.stringify(aggregations || []), pageSize || 50,
    showRowNumbers || false, showTotals || false, isFavorite || false, isShared || false, userId
  ]);
  
  res.status(201).json(result.rows[0]);
}));

/**
 * PUT /api/report-builder/reports/:id
 */
router.put('/reports/:id', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;
  const {
    name, description, selectedColumns, constraints, sortConfig,
    groupByFields, aggregations, pageSize, showRowNumbers, showTotals, isFavorite, isShared
  } = req.body;
  
  const existingReport = await db.query(
    'SELECT id FROM custom_reports WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
  
  if (existingReport.rows.length === 0) {
    return res.status(404).json({ error: 'Report not found' });
  }
  
  if (name) {
    const nameCheck = await db.query(
      'SELECT id FROM custom_reports WHERE tenant_id = $1 AND name = $2 AND id != $3',
      [tenantId, name, id]
    );
    
    if (nameCheck.rows.length > 0) {
      return res.status(400).json({ error: 'A report with this name already exists' });
    }
  }
  
  const result = await db.query(`
    UPDATE custom_reports SET
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      selected_columns = COALESCE($3, selected_columns),
      constraints = COALESCE($4, constraints),
      sort_config = COALESCE($5, sort_config),
      group_by_fields = COALESCE($6, group_by_fields),
      aggregations = COALESCE($7, aggregations),
      page_size = COALESCE($8, page_size),
      show_row_numbers = COALESCE($9, show_row_numbers),
      show_totals = COALESCE($10, show_totals),
      is_favorite = COALESCE($11, is_favorite),
      is_shared = COALESCE($12, is_shared),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $13 AND tenant_id = $14
    RETURNING *
  `, [
    name, description,
    selectedColumns ? JSON.stringify(selectedColumns) : null,
    constraints ? JSON.stringify(constraints) : null,
    sortConfig ? JSON.stringify(sortConfig) : null,
    groupByFields ? JSON.stringify(groupByFields) : null,
    aggregations ? JSON.stringify(aggregations) : null,
    pageSize, showRowNumbers, showTotals, isFavorite, isShared, id, tenantId
  ]);
  
  res.json(result.rows[0]);
}));

/**
 * DELETE /api/report-builder/reports/:id
 */
router.delete('/reports/:id', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;
  
  const result = await db.query(
    'DELETE FROM custom_reports WHERE id = $1 AND tenant_id = $2 RETURNING id, name',
    [id, tenantId]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Report not found' });
  }
  
  res.json({ message: 'Report deleted', report: result.rows[0] });
}));

/**
 * POST /api/report-builder/reports/:id/run
 */
router.post('/reports/:id/run', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const userId = req.user.id;
  const { id } = req.params;
  const { page = 1, pageSize: requestedPageSize } = req.body;
  
  const reportResult = await db.query(
    'SELECT * FROM custom_reports WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
  
  if (reportResult.rows.length === 0) {
    return res.status(404).json({ error: 'Report not found' });
  }
  
  const report = reportResult.rows[0];
  const effectivePageSize = requestedPageSize || report.page_size || 50;
  
  const recordResult = await db.query(`
    SELECT id, record_name, source_name, is_tenant_filtered, tenant_id_column
    FROM report_record_definitions
    WHERE record_name = $1 AND is_active = true
  `, [report.record_type]);
  
  if (recordResult.rows.length === 0) {
    return res.status(404).json({ error: 'Record type no longer exists' });
  }
  
  const recordDef = recordResult.rows[0];
  
  const fieldResult = await db.query(`
    SELECT field_name, data_type, enum_values
    FROM report_field_definitions
    WHERE record_id = $1 AND is_active = true
  `, [recordDef.id]);
  
  const fieldDefinitions = fieldResult.rows;
  
  const startTime = Date.now();
  const { dataQuery, countQuery, params } = buildReportQuery(
    recordDef, report.selected_columns, report.constraints, report.sort_config,
    tenantId, fieldDefinitions, page, effectivePageSize
  );
  
  const [dataResult, countResult] = await Promise.all([
    db.query(dataQuery, params),
    db.query(countQuery, params)
  ]);
  
  const executionTime = Date.now() - startTime;
  const totalRows = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(totalRows / effectivePageSize);
  
  // Update run statistics
  await db.query(`
    UPDATE custom_reports SET run_count = run_count + 1, last_run_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `, [id]);
  
  // Log run history
  await db.query(`
    INSERT INTO report_run_history (
      tenant_id, report_id, report_name, record_type, run_by, row_count, execution_time_ms, exported_format
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'preview')
  `, [tenantId, id, report.name, report.record_type, userId, totalRows, executionTime]);
  
  res.json({
    data: dataResult.rows,
    pagination: {
      page: parseInt(page),
      pageSize: effectivePageSize,
      totalRows,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    report: { id: report.id, name: report.name, recordType: report.record_type, columns: report.selected_columns },
    meta: { executionTimeMs: executionTime }
  });
}));

/**
 * POST /api/report-builder/reports/:id/favorite
 */
router.post('/reports/:id/favorite', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;
  
  const result = await db.query(`
    UPDATE custom_reports SET is_favorite = NOT is_favorite, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND tenant_id = $2
    RETURNING id, name, is_favorite
  `, [id, tenantId]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Report not found' });
  }
  
  res.json(result.rows[0]);
}));

/**
 * GET /api/report-builder/reports/:id/export
 */
router.get('/reports/:id/export', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const userId = req.user.id;
  const { id } = req.params;
  const { format = 'csv' } = req.query;
  
  if (format !== 'csv') {
    return res.status(400).json({ error: 'Only CSV export is currently supported' });
  }
  
  const reportResult = await db.query(
    'SELECT * FROM custom_reports WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
  
  if (reportResult.rows.length === 0) {
    return res.status(404).json({ error: 'Report not found' });
  }
  
  const report = reportResult.rows[0];
  
  const recordResult = await db.query(`
    SELECT id, record_name, source_name, is_tenant_filtered, tenant_id_column
    FROM report_record_definitions
    WHERE record_name = $1 AND is_active = true
  `, [report.record_type]);
  
  if (recordResult.rows.length === 0) {
    return res.status(404).json({ error: 'Record type no longer exists' });
  }
  
  const recordDef = recordResult.rows[0];
  
  const fieldResult = await db.query(`
    SELECT field_name, display_name, data_type, format_hint
    FROM report_field_definitions
    WHERE record_id = $1 AND is_active = true
  `, [recordDef.id]);
  
  const fieldDefinitions = fieldResult.rows;
  const fieldMap = new Map(fieldDefinitions.map(f => [f.field_name, f]));
  
  const startTime = Date.now();
  const { dataQuery, params } = buildReportQuery(
    recordDef, report.selected_columns, report.constraints, report.sort_config,
    tenantId, fieldDefinitions, 1, 10000
  );
  
  const fullQuery = dataQuery.replace(/LIMIT \d+ OFFSET \d+/, 'LIMIT 10000');
  const dataResult = await db.query(fullQuery, params);
  const executionTime = Date.now() - startTime;
  
  // Log export
  await db.query(`
    INSERT INTO report_run_history (
      tenant_id, report_id, report_name, record_type, run_by, row_count, execution_time_ms, exported_format
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [tenantId, id, report.name, report.record_type, userId, dataResult.rows.length, executionTime, format]);
  
  // Build CSV
  const headers = report.selected_columns.map(col => {
    const field = fieldMap.get(col);
    return field ? field.display_name : col;
  });
  
  const csvRows = [headers.join(',')];
  
  for (const row of dataResult.rows) {
    const values = report.selected_columns.map(col => {
      let val = row[col];
      if (val === null || val === undefined) return '';
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      if (val instanceof Date) return val.toISOString();
      return String(val);
    });
    csvRows.push(values.join(','));
  }
  
  const csv = csvRows.join('\n');
  const filename = `${report.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}));

/**
 * POST /api/report-builder/preview/export
 */
router.post('/preview/export', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const userId = req.user.id;
  const { recordName, columns, constraints = [], sortConfig = [], format = 'csv' } = req.body;
  
  if (format !== 'csv') {
    return res.status(400).json({ error: 'Only CSV export is currently supported' });
  }
  
  if (!recordName || !columns || columns.length === 0) {
    return res.status(400).json({ error: 'Record name and columns are required' });
  }
  
  const recordResult = await db.query(`
    SELECT id, record_name, display_name, source_name, is_tenant_filtered, tenant_id_column
    FROM report_record_definitions
    WHERE record_name = $1 AND is_active = true
  `, [recordName]);
  
  if (recordResult.rows.length === 0) {
    return res.status(404).json({ error: 'Record type not found' });
  }
  
  const recordDef = recordResult.rows[0];
  
  const fieldResult = await db.query(`
    SELECT field_name, display_name, data_type, format_hint
    FROM report_field_definitions
    WHERE record_id = $1 AND is_active = true
  `, [recordDef.id]);
  
  const fieldDefinitions = fieldResult.rows;
  const fieldMap = new Map(fieldDefinitions.map(f => [f.field_name, f]));
  
  const validFieldNames = new Set(fieldDefinitions.map(f => f.field_name));
  const invalidColumns = columns.filter(c => !validFieldNames.has(c));
  if (invalidColumns.length > 0) {
    return res.status(400).json({ error: `Invalid columns: ${invalidColumns.join(', ')}` });
  }
  
  const startTime = Date.now();
  const { dataQuery, params } = buildReportQuery(
    recordDef, columns, constraints, sortConfig, tenantId, fieldDefinitions, 1, 10000
  );
  
  const fullQuery = dataQuery.replace(/LIMIT \d+ OFFSET \d+/, 'LIMIT 10000');
  const dataResult = await db.query(fullQuery, params);
  const executionTime = Date.now() - startTime;
  
  // Log export
  await db.query(`
    INSERT INTO report_run_history (
      tenant_id, report_name, record_type, run_by, row_count, execution_time_ms, exported_format
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [tenantId, `Ad-hoc ${recordDef.display_name}`, recordName, userId, dataResult.rows.length, executionTime, format]);
  
  // Build CSV
  const headers = columns.map(col => {
    const field = fieldMap.get(col);
    return field ? field.display_name : col;
  });
  
  const csvRows = [headers.join(',')];
  
  for (const row of dataResult.rows) {
    const values = columns.map(col => {
      let val = row[col];
      if (val === null || val === undefined) return '';
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      if (val instanceof Date) return val.toISOString();
      return String(val);
    });
    csvRows.push(values.join(','));
  }
  
  const csv = csvRows.join('\n');
  const filename = `${recordDef.display_name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}));

module.exports = router;
