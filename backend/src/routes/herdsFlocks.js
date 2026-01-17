/**
 * Herds & Flocks Routes
 * CRUD operations for livestock, herds/flocks, and pasture management
 */

const express = require('express');
const { body, param, validationResult } = require('express-validator');

const db = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(requireStaff);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }
  next();
};

const getTenantId = (req) => {
  return req.tenantId || '00000000-0000-0000-0000-000000000001';
};

// Normalize processing status from frontend format to PostgreSQL enum format
const normalizeProcessingStatus = (status) => {
  if (!status) return 'Pending';
  const statusMap = {
    'pending': 'Pending',
    'at_processor': 'At Processor',
    'complete': 'Complete',
    // Already correct format
    'Pending': 'Pending',
    'At Processor': 'At Processor',
    'Complete': 'Complete'
  };
  return statusMap[status] || 'Pending';
};

// ============================================================================
// LOOKUP TABLES - Animal Types
// ============================================================================

router.get('/animal-types', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const result = await db.query(
    `SELECT * FROM animal_types WHERE tenant_id = $1 ORDER BY species, name`,
    [tenantId]
  );
  res.json(result.rows);
}));

router.post('/animal-types', [
  body('name').trim().notEmpty(),
  body('species').isIn(['Cattle', 'Sheep', 'Goat', 'Poultry', 'Guard Dog', 'Other']),
], validate, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { name, species, description } = req.body;
  
  const result = await db.query(
    `INSERT INTO animal_types (tenant_id, name, species, description)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (tenant_id, name) DO UPDATE SET species = $3, description = $4
     RETURNING *`,
    [tenantId, name, species, description]
  );
  res.json(result.rows[0]);
}));

// ============================================================================
// LOOKUP TABLES - Breeds
// ============================================================================

router.get('/breeds', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { species } = req.query;
  
  let query = `SELECT * FROM breeds WHERE tenant_id = $1`;
  const params = [tenantId];
  
  if (species) {
    query += ` AND species = $2`;
    params.push(species);
  }
  
  query += ` ORDER BY name`;
  const result = await db.query(query, params);
  res.json(result.rows);
}));

router.post('/breeds', [
  body('name').trim().notEmpty(),
], validate, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { name, species = 'Cattle', description } = req.body;
  
  const result = await db.query(
    `INSERT INTO breeds (tenant_id, name, species, description)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (tenant_id, name) DO UPDATE SET species = $3, description = $4
     RETURNING *`,
    [tenantId, name, species, description]
  );
  res.json(result.rows[0]);
}));

// ============================================================================
// LOOKUP TABLES - Animal Categories
// ============================================================================

router.get('/animal-categories', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const result = await db.query(
    `SELECT * FROM animal_categories WHERE tenant_id = $1 ORDER BY name`,
    [tenantId]
  );
  res.json(result.rows);
}));

router.post('/animal-categories', [
  body('name').trim().notEmpty(),
], validate, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { name, description } = req.body;
  
  const result = await db.query(
    `INSERT INTO animal_categories (tenant_id, name, description)
     VALUES ($1, $2, $3)
     ON CONFLICT (tenant_id, name) DO UPDATE SET description = $3
     RETURNING *`,
    [tenantId, name, description]
  );
  res.json(result.rows[0]);
}));

// ============================================================================
// LOOKUP TABLES - Animal Owners
// ============================================================================

router.get('/owners', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { active_only } = req.query;
  
  let query = `SELECT * FROM animal_owners WHERE tenant_id = $1`;
  if (active_only === 'true') {
    query += ` AND is_active = true`;
  }
  query += ` ORDER BY name`;
  
  const result = await db.query(query, [tenantId]);
  res.json(result.rows);
}));

router.post('/owners', [
  body('name').trim().notEmpty(),
], validate, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { name, contact_info, is_active = true } = req.body;
  
  const result = await db.query(
    `INSERT INTO animal_owners (tenant_id, name, contact_info, is_active)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (tenant_id, name) DO UPDATE SET contact_info = $3, is_active = $4
     RETURNING *`,
    [tenantId, name, contact_info, is_active]
  );
  res.json(result.rows[0]);
}));

// ============================================================================
// HERDS & FLOCKS
// ============================================================================

router.get('/herds', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { species, active_only } = req.query;
  
  let query = `
    SELECT 
      hf.*,
      p.name AS pasture_name,
      CASE 
        WHEN hf.management_mode = 'aggregate' THEN hf.animal_count
        ELSE (SELECT COUNT(*) FROM animals a WHERE a.herd_id = hf.id AND a.status = 'Active')
      END AS current_count
    FROM herds_flocks hf
    LEFT JOIN pastures p ON hf.current_pasture_id = p.id
    WHERE hf.tenant_id = $1
  `;
  const params = [tenantId];
  let paramCount = 1;
  
  if (species) {
    params.push(species);
    query += ` AND hf.species = $${++paramCount}`;
  }
  
  if (active_only === 'true') {
    query += ` AND hf.is_active = true`;
  }
  
  query += ` ORDER BY hf.name`;
  
  const result = await db.query(query, params);
  res.json(result.rows);
}));

router.get('/herds/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  const result = await db.query(
    `SELECT 
      hf.*,
      p.name AS pasture_name,
      CASE 
        WHEN hf.management_mode = 'aggregate' THEN hf.animal_count
        ELSE (SELECT COUNT(*) FROM animals a WHERE a.herd_id = hf.id AND a.status = 'Active')
      END AS current_count
    FROM herds_flocks hf
    LEFT JOIN pastures p ON hf.current_pasture_id = p.id
    WHERE hf.id = $1 AND hf.tenant_id = $2`,
    [id, tenantId]
  );
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Herd/Flock not found');
  }
  
  res.json(result.rows[0]);
}));

router.post('/herds', [
  body('name').trim().notEmpty(),
  body('species').isIn(['cattle', 'sheep', 'goat', 'poultry', 'swine', 'other']),
  body('management_mode').isIn(['individual', 'aggregate']),
], validate, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { name, species, management_mode, animal_count, current_pasture_id, description, notes, is_active = true } = req.body;
  
  // Normalize species to lowercase for herd_species enum
  const normalizedSpecies = species.toLowerCase();
  
  const result = await db.query(
    `INSERT INTO herds_flocks (tenant_id, name, species, management_mode, animal_count, current_pasture_id, description, notes, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [tenantId, name, normalizedSpecies, management_mode, management_mode === 'aggregate' ? (animal_count || 0) : 0, current_pasture_id, description, notes, is_active]
  );
  
  res.status(201).json(result.rows[0]);
}));

router.put('/herds/:id', [
  body('name').trim().notEmpty(),
], validate, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { name, species, management_mode, animal_count, current_pasture_id, description, notes, is_active } = req.body;
  
  // Normalize species to lowercase for herd_species enum
  const normalizedSpecies = species ? species.toLowerCase() : null;
  
  const result = await db.query(
    `UPDATE herds_flocks SET
      name = COALESCE($3, name),
      species = COALESCE($4, species),
      management_mode = COALESCE($5, management_mode),
      animal_count = COALESCE($6, animal_count),
      current_pasture_id = $7,
      description = $8,
      notes = $9,
      is_active = COALESCE($10, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND tenant_id = $2
    RETURNING *`,
    [id, tenantId, name, normalizedSpecies, management_mode, animal_count, current_pasture_id, description, notes, is_active]
  );
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Herd/Flock not found');
  }
  
  res.json(result.rows[0]);
}));

router.delete('/herds/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  // Check for animals assigned to this herd
  const animalCheck = await db.query(
    `SELECT COUNT(*) FROM animals WHERE herd_id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  
  if (parseInt(animalCheck.rows[0].count) > 0) {
    throw new ApiError(400, 'Cannot delete herd/flock with assigned animals. Remove animals first or set to inactive.');
  }
  
  await db.query(
    `DELETE FROM herds_flocks WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  
  res.json({ message: 'Herd/Flock deleted' });
}));

// ============================================================================
// PASTURES
// ============================================================================

router.get('/pastures', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { active_only } = req.query;
  
  let query = `
    SELECT 
      p.*,
      (SELECT COUNT(*) FROM animals a WHERE a.current_pasture_id = p.id AND a.status = 'Active') AS animal_count,
      (SELECT COUNT(*) FROM herds_flocks hf WHERE hf.current_pasture_id = p.id AND hf.is_active = true) AS herd_count
    FROM pastures p
    WHERE p.tenant_id = $1
  `;
  
  if (active_only === 'true') {
    query += ` AND p.is_active = true`;
  }
  
  query += ` ORDER BY p.name`;
  
  const result = await db.query(query, [tenantId]);
  res.json(result.rows);
}));

router.get('/pastures/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  const result = await db.query(
    `SELECT * FROM pastures WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Pasture not found');
  }
  
  res.json(result.rows[0]);
}));

router.post('/pastures', [
  body('name').trim().notEmpty(),
], validate, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { name, size_acres, location, latitude, longitude, map_url, productivity_rating, notes, is_active = true } = req.body;
  
  const result = await db.query(
    `INSERT INTO pastures (tenant_id, name, size_acres, location, latitude, longitude, map_url, productivity_rating, notes, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [tenantId, name, size_acres, location, latitude, longitude, map_url, productivity_rating, notes, is_active]
  );
  
  res.status(201).json(result.rows[0]);
}));

router.put('/pastures/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { name, size_acres, location, latitude, longitude, map_url, productivity_rating, notes, is_active } = req.body;
  
  const result = await db.query(
    `UPDATE pastures SET
      name = COALESCE($3, name),
      size_acres = $4,
      location = $5,
      latitude = $6,
      longitude = $7,
      map_url = $8,
      productivity_rating = $9,
      notes = $10,
      is_active = COALESCE($11, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND tenant_id = $2
    RETURNING *`,
    [id, tenantId, name, size_acres, location, latitude, longitude, map_url, productivity_rating, notes, is_active]
  );
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Pasture not found');
  }
  
  res.json(result.rows[0]);
}));

router.delete('/pastures/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  await db.query(
    `DELETE FROM pastures WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  
  res.json({ message: 'Pasture deleted' });
}));

// ============================================================================
// ANIMALS
// ============================================================================

router.get('/animals', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { status, herd_id, pasture_id, category_id, animal_type_id, search, page = 1, limit = 50 } = req.query;
  
  let query = `
    SELECT 
      a.*,
      at.name AS animal_type_name,
      at.species AS species,
      ac.name AS category_name,
      b.name AS breed_name,
      ao.name AS owner_name,
      p.name AS pasture_name,
      hf.name AS herd_name,
      dam.ear_tag AS dam_ear_tag,
      dam.name AS dam_name,
      sire.ear_tag AS sire_ear_tag,
      sire.name AS sire_name
    FROM animals a
    LEFT JOIN animal_types at ON a.animal_type_id = at.id
    LEFT JOIN animal_categories ac ON a.category_id = ac.id
    LEFT JOIN breeds b ON a.breed_id = b.id
    LEFT JOIN animal_owners ao ON a.owner_id = ao.id
    LEFT JOIN pastures p ON a.current_pasture_id = p.id
    LEFT JOIN herds_flocks hf ON a.herd_id = hf.id
    LEFT JOIN animals dam ON a.dam_id = dam.id
    LEFT JOIN animals sire ON a.sire_id = sire.id
    WHERE a.tenant_id = $1
  `;
  const params = [tenantId];
  let paramCount = 1;
  
  if (status) {
    params.push(status);
    query += ` AND a.status = $${++paramCount}`;
  }
  
  if (herd_id) {
    params.push(herd_id);
    query += ` AND a.herd_id = $${++paramCount}`;
  }
  
  if (pasture_id) {
    params.push(pasture_id);
    query += ` AND a.current_pasture_id = $${++paramCount}`;
  }
  
  if (category_id) {
    params.push(category_id);
    query += ` AND a.category_id = $${++paramCount}`;
  }
  
  if (animal_type_id) {
    params.push(animal_type_id);
    query += ` AND a.animal_type_id = $${++paramCount}`;
  }
  
  if (search) {
    params.push(`%${search}%`);
    paramCount++;
    query += ` AND (a.ear_tag ILIKE $${paramCount} OR a.name ILIKE $${paramCount} OR a.color_markings ILIKE $${paramCount})`;
  }
  
  query += ` ORDER BY a.ear_tag`;
  
  // Pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  params.push(limit, offset);
  query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
  
  const result = await db.query(query, params);
  
  // Get total count
  const countParams = params.slice(0, -2);
  const countQuery = query.replace(/SELECT[\s\S]*FROM/, 'SELECT COUNT(*) FROM').split('ORDER BY')[0];
  const countResult = await db.query(countQuery, countParams);
  
  res.json({
    data: result.rows,
    total: parseInt(countResult.rows[0].count),
    page: parseInt(page),
    limit: parseInt(limit)
  });
}));

router.get('/animals/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  const result = await db.query(
    `SELECT 
      a.*,
      at.name AS animal_type_name,
      at.species AS species,
      ac.name AS category_name,
      b.name AS breed_name,
      ao.name AS owner_name,
      p.name AS pasture_name,
      hf.name AS herd_name,
      dam.ear_tag AS dam_ear_tag,
      dam.name AS dam_name,
      sire.ear_tag AS sire_ear_tag,
      sire.name AS sire_name
    FROM animals a
    LEFT JOIN animal_types at ON a.animal_type_id = at.id
    LEFT JOIN animal_categories ac ON a.category_id = ac.id
    LEFT JOIN breeds b ON a.breed_id = b.id
    LEFT JOIN animal_owners ao ON a.owner_id = ao.id
    LEFT JOIN pastures p ON a.current_pasture_id = p.id
    LEFT JOIN herds_flocks hf ON a.herd_id = hf.id
    LEFT JOIN animals dam ON a.dam_id = dam.id
    LEFT JOIN animals sire ON a.sire_id = sire.id
    WHERE a.id = $1 AND a.tenant_id = $2`,
    [id, tenantId]
  );
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Animal not found');
  }
  
  res.json(result.rows[0]);
}));

router.post('/animals', [
  body('ear_tag').trim().notEmpty(),
], validate, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const {
    ear_tag, name, animal_type_id, category_id, breed_id, color_markings,
    dam_id, sire_id, owner_id, birth_date, death_date, purchase_date,
    purchase_price, current_pasture_id, herd_id, status = 'Active', notes
  } = req.body;
  
  const result = await db.query(
    `INSERT INTO animals (
      tenant_id, ear_tag, name, animal_type_id, category_id, breed_id, color_markings,
      dam_id, sire_id, owner_id, birth_date, death_date, purchase_date,
      purchase_price, current_pasture_id, herd_id, status, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *`,
    [tenantId, ear_tag, name, animal_type_id, category_id, breed_id, color_markings,
     dam_id, sire_id, owner_id, birth_date, death_date, purchase_date,
     purchase_price, current_pasture_id, herd_id, status, notes]
  );
  
  res.status(201).json(result.rows[0]);
}));

router.put('/animals/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const {
    ear_tag, name, animal_type_id, category_id, breed_id, color_markings,
    dam_id, sire_id, owner_id, birth_date, death_date, purchase_date,
    purchase_price, current_pasture_id, herd_id, status, notes
  } = req.body;
  
  const result = await db.query(
    `UPDATE animals SET
      ear_tag = COALESCE($3, ear_tag),
      name = $4,
      animal_type_id = $5,
      category_id = $6,
      breed_id = $7,
      color_markings = $8,
      dam_id = $9,
      sire_id = $10,
      owner_id = $11,
      birth_date = $12,
      death_date = $13,
      purchase_date = $14,
      purchase_price = $15,
      current_pasture_id = $16,
      herd_id = $17,
      status = COALESCE($18, status),
      notes = $19,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND tenant_id = $2
    RETURNING *`,
    [id, tenantId, ear_tag, name, animal_type_id, category_id, breed_id, color_markings,
     dam_id, sire_id, owner_id, birth_date, death_date, purchase_date,
     purchase_price, current_pasture_id, herd_id, status, notes]
  );
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Animal not found');
  }
  
  res.json(result.rows[0]);
}));

router.delete('/animals/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  await db.query(
    `DELETE FROM animals WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  
  res.json({ message: 'Animal deleted' });
}));

// ============================================================================
// ANIMAL HEALTH RECORDS
// ============================================================================

router.get('/animals/:animalId/health-records', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { animalId } = req.params;
  
  const result = await db.query(
    `SELECT * FROM animal_health_records
     WHERE animal_id = $1 AND tenant_id = $2
     ORDER BY record_date DESC`,
    [animalId, tenantId]
  );
  res.json(result.rows);
}));

router.post('/animals/:animalId/health-records', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { animalId } = req.params;
  const { record_date, record_type, description, administered_by, next_due_date, notes } = req.body;
  
  const result = await db.query(
    `INSERT INTO animal_health_records (tenant_id, animal_id, record_date, record_type, description, administered_by, next_due_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [tenantId, animalId, record_date, record_type, description, administered_by, next_due_date, notes]
  );
  res.status(201).json(result.rows[0]);
}));

router.put('/health-records/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { record_date, record_type, description, administered_by, next_due_date, notes } = req.body;
  
  const result = await db.query(
    `UPDATE animal_health_records SET
       record_date = COALESCE($3, record_date),
       record_type = COALESCE($4, record_type),
       description = COALESCE($5, description),
       administered_by = $6,
       next_due_date = $7,
       notes = $8
     WHERE id = $1 AND tenant_id = $2
     RETURNING *`,
    [id, tenantId, record_date, record_type, description, administered_by, next_due_date, notes]
  );
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Health record not found');
  }
  res.json(result.rows[0]);
}));

router.delete('/health-records/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  await db.query(
    `DELETE FROM animal_health_records WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  res.json({ message: 'Health record deleted' });
}));

// ============================================================================
// ANIMAL WEIGHTS
// ============================================================================

router.get('/animals/:animalId/weights', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { animalId } = req.params;
  
  const result = await db.query(
    `SELECT * FROM animal_weights
     WHERE animal_id = $1 AND tenant_id = $2
     ORDER BY weight_date DESC`,
    [animalId, tenantId]
  );
  res.json(result.rows);
}));

router.post('/animals/:animalId/weights', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { animalId } = req.params;
  const { weight_date, weight_lbs, notes } = req.body;
  
  const result = await db.query(
    `INSERT INTO animal_weights (tenant_id, animal_id, weight_date, weight_lbs, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [tenantId, animalId, weight_date, weight_lbs, notes]
  );
  res.status(201).json(result.rows[0]);
}));

router.put('/weights/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { weight_date, weight_lbs, notes } = req.body;
  
  const result = await db.query(
    `UPDATE animal_weights SET
       weight_date = COALESCE($3, weight_date),
       weight_lbs = COALESCE($4, weight_lbs),
       notes = $5
     WHERE id = $1 AND tenant_id = $2
     RETURNING *`,
    [id, tenantId, weight_date, weight_lbs, notes]
  );
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Weight record not found');
  }
  res.json(result.rows[0]);
}));

router.delete('/weights/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  await db.query(
    `DELETE FROM animal_weights WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  res.json({ message: 'Weight record deleted' });
}));

// ============================================================================
// BUYERS
// ============================================================================

router.get('/buyers', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { active_only } = req.query;
  
  let query = `SELECT * FROM buyers WHERE tenant_id = $1`;
  if (active_only === 'true') {
    query += ` AND is_active = true`;
  }
  query += ` ORDER BY name`;
  
  const result = await db.query(query, [tenantId]);
  res.json(result.rows);
}));

router.post('/buyers', [
  body('name').trim().notEmpty(),
], validate, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { name, contact_name, phone, email, address, notes, is_active = true } = req.body;
  
  const result = await db.query(
    `INSERT INTO buyers (tenant_id, name, contact_name, phone, email, address, notes, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (tenant_id, name) DO UPDATE SET 
       contact_name = $3, phone = $4, email = $5, address = $6, notes = $7, is_active = $8
     RETURNING *`,
    [tenantId, name, contact_name, phone, email, address, notes, is_active]
  );
  
  res.json(result.rows[0]);
}));

router.put('/buyers/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { name, contact_name, phone, email, address, notes, is_active } = req.body;
  
  const result = await db.query(
    `UPDATE buyers SET
      name = COALESCE($3, name),
      contact_name = $4,
      phone = $5,
      email = $6,
      address = $7,
      notes = $8,
      is_active = COALESCE($9, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND tenant_id = $2
    RETURNING *`,
    [id, tenantId, name, contact_name, phone, email, address, notes, is_active]
  );
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Buyer not found');
  }
  
  res.json(result.rows[0]);
}));

// ============================================================================
// SALE FEE TYPES
// ============================================================================

router.get('/sale-fee-types', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  
  const result = await db.query(
    `SELECT * FROM sale_fee_types WHERE tenant_id = $1 AND is_active = true ORDER BY sort_order, name`,
    [tenantId]
  );
  res.json(result.rows);
}));

router.post('/sale-fee-types', [
  body('name').trim().notEmpty(),
], validate, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { name, description, default_amount, is_percentage, percentage_rate, sort_order, is_active = true } = req.body;
  
  const result = await db.query(
    `INSERT INTO sale_fee_types (tenant_id, name, description, default_amount, is_percentage, percentage_rate, sort_order, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (tenant_id, name) DO UPDATE SET 
       description = $3, default_amount = $4, is_percentage = $5, percentage_rate = $6, sort_order = $7, is_active = $8
     RETURNING *`,
    [tenantId, name, description, default_amount, is_percentage, percentage_rate, sort_order, is_active]
  );
  
  res.json(result.rows[0]);
}));

// ============================================================================
// SALE TICKETS
// ============================================================================

router.get('/sale-tickets', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { year, page = 1, limit = 50 } = req.query;
  
  let query = `
    SELECT 
      st.*,
      (SELECT COUNT(*) FROM sale_ticket_items sti WHERE sti.sale_ticket_id = st.id) AS item_count,
      (SELECT COALESCE(SUM(head_count), 0) FROM sale_ticket_items sti WHERE sti.sale_ticket_id = st.id) AS total_head
    FROM sale_tickets st
    WHERE st.tenant_id = $1
  `;
  const params = [tenantId];
  let paramCount = 1;
  
  if (year) {
    params.push(year);
    query += ` AND EXTRACT(YEAR FROM st.sale_date) = $${++paramCount}`;
  }
  
  query += ` ORDER BY st.sale_date DESC`;
  
  // Pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  params.push(limit, offset);
  query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
  
  const result = await db.query(query, params);
  
  res.json({
    data: result.rows,
    page: parseInt(page),
    limit: parseInt(limit)
  });
}));

router.get('/sale-tickets/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  // Get ticket
  const ticketResult = await db.query(
    `SELECT st.*
     FROM sale_tickets st
     WHERE st.id = $1 AND st.tenant_id = $2`,
    [id, tenantId]
  );
  
  if (ticketResult.rows.length === 0) {
    throw new ApiError(404, 'Sale ticket not found');
  }
  
  const ticket = ticketResult.rows[0];
  
  // Get items
  const itemsResult = await db.query(
    `SELECT sti.*, a.id AS animal_id_ref
     FROM sale_ticket_items sti
     LEFT JOIN animals a ON sti.animal_id = a.id
     WHERE sti.sale_ticket_id = $1
     ORDER BY sti.id`,
    [id]
  );
  
  // Get fees
  const feesResult = await db.query(
    `SELECT stf.*
     FROM sale_ticket_fees stf
     WHERE stf.sale_ticket_id = $1
     ORDER BY stf.id`,
    [id]
  );
  
  res.json({
    ...ticket,
    items: itemsResult.rows,
    fees: feesResult.rows
  });
}));

router.post('/sale-tickets', [
  body('sale_date').isISO8601(),
  body('sold_to').trim().notEmpty(),
], validate, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { ticket_number, sale_date, sold_to, buyer_contact, notes, items = [], fees = [] } = req.body;
  
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create ticket
    const ticketResult = await client.query(
      `INSERT INTO sale_tickets (tenant_id, ticket_number, sale_date, sold_to, buyer_contact, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [tenantId, ticket_number, sale_date, sold_to, buyer_contact, notes]
    );
    
    const ticketId = ticketResult.rows[0].id;
    let grossAmount = 0;
    let totalFees = 0;
    
    // Add items
    for (const item of items) {
      await client.query(
        `INSERT INTO sale_ticket_items (tenant_id, sale_ticket_id, animal_id, ear_tag, animal_name, animal_type, breed, head_count, weight_lbs, price_per_lb, price_per_head, line_total, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [tenantId, ticketId, item.animal_id, item.ear_tag, item.animal_name, item.animal_type, item.breed, item.head_count || 1, item.weight_lbs, item.price_per_lb, item.price_per_head, item.line_total, item.notes]
      );
      grossAmount += parseFloat(item.line_total) || 0;
      
      // Update animal status to Sold
      if (item.animal_id) {
        await client.query(
          `UPDATE animals SET status = 'Sold', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND tenant_id = $2`,
          [item.animal_id, tenantId]
        );
      }
    }
    
    // Add fees
    for (const fee of fees) {
      await client.query(
        `INSERT INTO sale_ticket_fees (tenant_id, sale_ticket_id, fee_type, description, amount)
         VALUES ($1, $2, $3, $4, $5)`,
        [tenantId, ticketId, fee.fee_type, fee.description, fee.amount]
      );
      totalFees += parseFloat(fee.amount) || 0;
    }
    
    // Update totals
    await client.query(
      `UPDATE sale_tickets SET gross_amount = $1, total_fees = $2, net_amount = $3 WHERE id = $4`,
      [grossAmount, totalFees, grossAmount - totalFees, ticketId]
    );
    
    await client.query('COMMIT');
    
    // Return the complete ticket
    const result = await db.query(
      `SELECT * FROM sale_tickets WHERE id = $1`,
      [ticketId]
    );
    
    res.status(201).json(result.rows[0]);
    
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

router.put('/sale-tickets/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { ticket_number, sale_date, sold_to, buyer_contact, payment_received, payment_date, payment_reference, notes } = req.body;
  
  const result = await db.query(
    `UPDATE sale_tickets SET
      ticket_number = $3,
      sale_date = COALESCE($4, sale_date),
      sold_to = COALESCE($5, sold_to),
      buyer_contact = $6,
      payment_received = COALESCE($7, payment_received),
      payment_date = $8,
      payment_reference = $9,
      notes = $10,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND tenant_id = $2
    RETURNING *`,
    [id, tenantId, ticket_number, sale_date, sold_to, buyer_contact, payment_received, payment_date, payment_reference, notes]
  );
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Sale ticket not found');
  }
  
  res.json(result.rows[0]);
}));

router.delete('/sale-tickets/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  // This will cascade delete items and fees due to foreign key constraints
  await db.query(
    `DELETE FROM sale_tickets WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  
  res.json({ message: 'Sale ticket deleted' });
}));

// Add item to existing ticket
router.post('/sale-tickets/:id/items', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { animal_id, ear_tag, animal_name, animal_type, breed, head_count, weight_lbs, price_per_lb, price_per_head, line_total, notes } = req.body;
  
  const result = await db.query(
    `INSERT INTO sale_ticket_items (tenant_id, sale_ticket_id, animal_id, ear_tag, animal_name, animal_type, breed, head_count, weight_lbs, price_per_lb, price_per_head, line_total, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [tenantId, id, animal_id, ear_tag, animal_name, animal_type, breed, head_count || 1, weight_lbs, price_per_lb, price_per_head, line_total, notes]
  );
  
  // Update animal status
  if (animal_id) {
    await db.query(
      `UPDATE animals SET status = 'Sold', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND tenant_id = $2`,
      [animal_id, tenantId]
    );
  }
  
  // Recalculate totals
  await recalculateSaleTicketTotals(id);
  
  res.status(201).json(result.rows[0]);
}));

router.delete('/sale-tickets/:id/items/:itemId', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id, itemId } = req.params;
  
  await db.query(
    `DELETE FROM sale_ticket_items WHERE id = $1 AND sale_ticket_id = $2 AND tenant_id = $3`,
    [itemId, id, tenantId]
  );
  
  // Recalculate totals
  await recalculateSaleTicketTotals(id);
  
  res.json({ message: 'Item removed from ticket' });
}));

// Add fee to existing ticket
router.post('/sale-tickets/:id/fees', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { fee_type, description, amount } = req.body;
  
  const result = await db.query(
    `INSERT INTO sale_ticket_fees (tenant_id, sale_ticket_id, fee_type, description, amount)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [tenantId, id, fee_type, description, amount]
  );
  
  // Recalculate totals
  await recalculateSaleTicketTotals(id);
  
  res.status(201).json(result.rows[0]);
}));

router.delete('/sale-tickets/:id/fees/:feeId', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id, feeId } = req.params;
  
  await db.query(
    `DELETE FROM sale_ticket_fees WHERE id = $1 AND sale_ticket_id = $2 AND tenant_id = $3`,
    [feeId, id, tenantId]
  );
  
  // Recalculate totals
  await recalculateSaleTicketTotals(id);
  
  res.json({ message: 'Fee removed from ticket' });
}));

// Helper function to recalculate sale ticket totals
async function recalculateSaleTicketTotals(ticketId) {
  const grossResult = await db.query(
    `SELECT COALESCE(SUM(line_total), 0) as gross FROM sale_ticket_items WHERE sale_ticket_id = $1`,
    [ticketId]
  );
  const feesResult = await db.query(
    `SELECT COALESCE(SUM(amount), 0) as fees FROM sale_ticket_fees WHERE sale_ticket_id = $1`,
    [ticketId]
  );
  
  const grossAmount = parseFloat(grossResult.rows[0].gross);
  const totalFees = parseFloat(feesResult.rows[0].fees);
  
  await db.query(
    `UPDATE sale_tickets SET gross_amount = $1, total_fees = $2, net_amount = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4`,
    [grossAmount, totalFees, grossAmount - totalFees, ticketId]
  );
}

// ============================================================================
// PASTURE GRAZING EVENTS
// ============================================================================

router.get('/pastures/:pastureId/grazing-events', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { pastureId } = req.params;
  
  const result = await db.query(
    `SELECT pge.*, 
       (SELECT COUNT(*) FROM grazing_event_animals gea WHERE gea.grazing_event_id = pge.id) AS animal_count
     FROM pasture_grazing_events pge
     WHERE pge.pasture_id = $1 AND pge.tenant_id = $2
     ORDER BY pge.start_date DESC`,
    [pastureId, tenantId]
  );
  res.json(result.rows);
}));

router.post('/pastures/:pastureId/grazing-events', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { pastureId } = req.params;
  const { start_date, end_date, initial_grass_height, final_grass_height, notes } = req.body;
  
  const result = await db.query(
    `INSERT INTO pasture_grazing_events (tenant_id, pasture_id, start_date, end_date, initial_grass_height, final_grass_height, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [tenantId, pastureId, start_date, end_date, initial_grass_height, final_grass_height, notes]
  );
  res.status(201).json(result.rows[0]);
}));

router.put('/grazing-events/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { start_date, end_date, initial_grass_height, final_grass_height, notes } = req.body;
  
  const result = await db.query(
    `UPDATE pasture_grazing_events SET
       start_date = COALESCE($3, start_date),
       end_date = $4,
       initial_grass_height = $5,
       final_grass_height = $6,
       notes = $7,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND tenant_id = $2
     RETURNING *`,
    [id, tenantId, start_date, end_date, initial_grass_height, final_grass_height, notes]
  );
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Grazing event not found');
  }
  res.json(result.rows[0]);
}));

router.delete('/grazing-events/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  await db.query(
    `DELETE FROM pasture_grazing_events WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  res.json({ message: 'Grazing event deleted' });
}));

// ============================================================================
// PASTURE SOIL SAMPLES
// ============================================================================

router.get('/pastures/:pastureId/soil-samples', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { pastureId } = req.params;
  
  const result = await db.query(
    `SELECT pss.*,
       (SELECT json_agg(pn.*) FROM pasture_nutrients pn WHERE pn.soil_sample_id = pss.id) AS nutrients
     FROM pasture_soil_samples pss
     WHERE pss.pasture_id = $1 AND pss.tenant_id = $2
     ORDER BY pss.sample_date DESC`,
    [pastureId, tenantId]
  );
  res.json(result.rows);
}));

router.post('/pastures/:pastureId/soil-samples', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { pastureId } = req.params;
  const { sample_id, sample_date, notes, nutrients = [] } = req.body;
  
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const sampleResult = await client.query(
      `INSERT INTO pasture_soil_samples (tenant_id, pasture_id, sample_id, sample_date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [tenantId, pastureId, sample_id, sample_date, notes]
    );
    
    const sample = sampleResult.rows[0];
    
    // Add nutrients
    for (const nutrient of nutrients) {
      await client.query(
        `INSERT INTO pasture_nutrients (tenant_id, soil_sample_id, nutrient, target_level, actual_level, unit)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [tenantId, sample.id, nutrient.nutrient, nutrient.target_level, nutrient.actual_level, nutrient.unit]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(sample);
    
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

router.put('/soil-samples/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { sample_id, sample_date, notes } = req.body;
  
  const result = await db.query(
    `UPDATE pasture_soil_samples SET
       sample_id = COALESCE($3, sample_id),
       sample_date = COALESCE($4, sample_date),
       notes = $5,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND tenant_id = $2
     RETURNING *`,
    [id, tenantId, sample_id, sample_date, notes]
  );
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Soil sample not found');
  }
  res.json(result.rows[0]);
}));

router.delete('/soil-samples/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  await db.query(
    `DELETE FROM pasture_soil_samples WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  res.json({ message: 'Soil sample deleted' });
}));

// Nutrients for a soil sample
router.post('/soil-samples/:sampleId/nutrients', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { sampleId } = req.params;
  const { nutrient, target_level, actual_level, unit } = req.body;
  
  const result = await db.query(
    `INSERT INTO pasture_nutrients (tenant_id, soil_sample_id, nutrient, target_level, actual_level, unit)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [tenantId, sampleId, nutrient, target_level, actual_level, unit]
  );
  res.status(201).json(result.rows[0]);
}));

router.delete('/nutrients/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  await db.query(
    `DELETE FROM pasture_nutrients WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  res.json({ message: 'Nutrient deleted' });
}));

// ============================================================================
// PASTURE TASKS
// ============================================================================

router.get('/pastures/:pastureId/tasks', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { pastureId } = req.params;
  const { show_completed } = req.query;
  
  let query = `SELECT * FROM pasture_tasks WHERE pasture_id = $1 AND tenant_id = $2`;
  if (show_completed !== 'true') {
    query += ` AND is_completed = false`;
  }
  query += ` ORDER BY CASE WHEN is_completed THEN 1 ELSE 0 END, due_date ASC NULLS LAST`;
  
  const result = await db.query(query, [pastureId, tenantId]);
  res.json(result.rows);
}));

router.post('/pastures/:pastureId/tasks', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { pastureId } = req.params;
  const { task_description, due_date, notes } = req.body;
  
  const result = await db.query(
    `INSERT INTO pasture_tasks (tenant_id, pasture_id, task_description, due_date, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [tenantId, pastureId, task_description, due_date, notes]
  );
  res.status(201).json(result.rows[0]);
}));

router.put('/tasks/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { task_description, due_date, completed_date, is_completed, notes } = req.body;
  
  const result = await db.query(
    `UPDATE pasture_tasks SET
       task_description = COALESCE($3, task_description),
       due_date = $4,
       completed_date = $5,
       is_completed = COALESCE($6, is_completed),
       notes = $7,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND tenant_id = $2
     RETURNING *`,
    [id, tenantId, task_description, due_date, completed_date, is_completed, notes]
  );
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Task not found');
  }
  res.json(result.rows[0]);
}));

router.delete('/tasks/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  await db.query(
    `DELETE FROM pasture_tasks WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  res.json({ message: 'Task deleted' });
}));

// ============================================================================
// PASTURE TREATMENTS
// ============================================================================

router.get('/pastures/:pastureId/treatments', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { pastureId } = req.params;
  
  const result = await db.query(
    `SELECT * FROM pasture_treatments
     WHERE pasture_id = $1 AND tenant_id = $2
     ORDER BY treatment_date DESC`,
    [pastureId, tenantId]
  );
  res.json(result.rows);
}));

router.post('/pastures/:pastureId/treatments', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { pastureId } = req.params;
  const { treatment_date, treatment_type, treatment_description, chemical_used, application_rate, application_rate_unit, equipment_used, fuel_used, notes } = req.body;
  
  const result = await db.query(
    `INSERT INTO pasture_treatments (tenant_id, pasture_id, treatment_date, treatment_type, treatment_description, chemical_used, application_rate, application_rate_unit, equipment_used, fuel_used, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [tenantId, pastureId, treatment_date, treatment_type, treatment_description, chemical_used, application_rate, application_rate_unit, equipment_used, fuel_used, notes]
  );
  res.status(201).json(result.rows[0]);
}));

router.put('/treatments/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { treatment_date, treatment_type, treatment_description, chemical_used, application_rate, application_rate_unit, equipment_used, fuel_used, notes } = req.body;
  
  const result = await db.query(
    `UPDATE pasture_treatments SET
       treatment_date = COALESCE($3, treatment_date),
       treatment_type = COALESCE($4, treatment_type),
       treatment_description = $5,
       chemical_used = $6,
       application_rate = $7,
       application_rate_unit = $8,
       equipment_used = $9,
       fuel_used = $10,
       notes = $11,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND tenant_id = $2
     RETURNING *`,
    [id, tenantId, treatment_date, treatment_type, treatment_description, chemical_used, application_rate, application_rate_unit, equipment_used, fuel_used, notes]
  );
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Treatment not found');
  }
  res.json(result.rows[0]);
}));

router.delete('/treatments/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  await db.query(
    `DELETE FROM pasture_treatments WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  res.json({ message: 'Treatment deleted' });
}));

// ============================================================================
// DASHBOARD / STATISTICS
// ============================================================================

router.get('/stats', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  
  // Active animals by status
  const statusResult = await db.query(
    `SELECT status, COUNT(*) as count FROM animals WHERE tenant_id = $1 GROUP BY status`,
    [tenantId]
  );
  
  // Animals by species
  const speciesResult = await db.query(
    `SELECT at.species, COUNT(*) as count 
     FROM animals a
     JOIN animal_types at ON a.animal_type_id = at.id
     WHERE a.tenant_id = $1 AND a.status = 'Active'
     GROUP BY at.species`,
    [tenantId]
  );
  
  // Herds/Flocks count
  const herdsResult = await db.query(
    `SELECT COUNT(*) as count FROM herds_flocks WHERE tenant_id = $1 AND is_active = true`,
    [tenantId]
  );
  
  // Pastures count
  const pasturesResult = await db.query(
    `SELECT COUNT(*) as count FROM pastures WHERE tenant_id = $1 AND is_active = true`,
    [tenantId]
  );
  
  // Recent sales (this year)
  const salesResult = await db.query(
    `SELECT 
      COUNT(*) as ticket_count,
      COALESCE(SUM(gross_amount), 0) as gross_total,
      COALESCE(SUM(total_fees), 0) as fees_total,
      COALESCE(SUM(net_amount), 0) as net_total
     FROM sale_tickets 
     WHERE tenant_id = $1 AND EXTRACT(YEAR FROM sale_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
    [tenantId]
  );
  
  res.json({
    by_status: statusResult.rows.reduce((acc, row) => ({ ...acc, [row.status]: parseInt(row.count) }), {}),
    by_species: speciesResult.rows.reduce((acc, row) => ({ ...acc, [row.species]: parseInt(row.count) }), {}),
    herds_count: parseInt(herdsResult.rows[0].count),
    pastures_count: parseInt(pasturesResult.rows[0].count),
    sales_ytd: {
      ticket_count: parseInt(salesResult.rows[0].ticket_count),
      gross_total: parseFloat(salesResult.rows[0].gross_total),
      fees_total: parseFloat(salesResult.rows[0].fees_total),
      net_total: parseFloat(salesResult.rows[0].net_total)
    }
  });
}));

// ============================================================================
// PROCESSING RECORDS
// ============================================================================

router.get('/processing-records', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { status, herd_id, species, year, month } = req.query;
  
  let query = `
    SELECT 
      pr.*,
      a.ear_tag AS animal_ear_tag,
      a.name AS animal_name,
      at.species AS animal_species,
      hf.name AS herd_name,
      hf.species AS herd_species,
      hf.animal_count AS herd_animal_count,
      CASE 
        WHEN pr.animal_id IS NOT NULL THEN CONCAT(a.ear_tag, COALESCE(' - ' || a.name, ''))
        ELSE hf.name
      END AS display_name,
      CASE 
        WHEN pr.animal_id IS NOT NULL THEN at.species::text
        ELSE hf.species::text
      END AS species,
      CASE 
        WHEN pr.animal_id IS NOT NULL THEN 1
        ELSE COALESCE(hf.animal_count, 0)
      END AS head_count
    FROM processing_records pr
    LEFT JOIN animals a ON pr.animal_id = a.id
    LEFT JOIN animal_types at ON a.animal_type_id = at.id
    LEFT JOIN herds_flocks hf ON pr.herd_id = hf.id
    WHERE pr.tenant_id = $1
  `;
  const params = [tenantId];
  let paramCount = 1;
  
  if (status) {
    params.push(normalizeProcessingStatus(status));
    query += ` AND pr.status = $${++paramCount}`;
  }
  
  if (herd_id) {
    params.push(herd_id);
    query += ` AND pr.herd_id = $${++paramCount}`;
  }
  
  if (species) {
    params.push(species);
    paramCount++;
    query += ` AND (at.species::text = $${paramCount} OR hf.species::text = $${paramCount})`;
  }
  
  if (year) {
    params.push(year);
    query += ` AND EXTRACT(YEAR FROM pr.processing_date) = $${++paramCount}`;
  }
  
  if (month) {
    params.push(month);
    query += ` AND EXTRACT(MONTH FROM pr.processing_date) = $${++paramCount}`;
  }
  
  query += ` ORDER BY pr.processing_date DESC`;
  
  const result = await db.query(query, params);
  res.json(result.rows);
}));

router.get('/processing-records/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  const result = await db.query(
    `SELECT 
      pr.*,
      a.ear_tag AS animal_ear_tag,
      a.name AS animal_name,
      at.species AS animal_species,
      hf.name AS herd_name,
      hf.species AS herd_species
    FROM processing_records pr
    LEFT JOIN animals a ON pr.animal_id = a.id
    LEFT JOIN animal_types at ON a.animal_type_id = at.id
    LEFT JOIN herds_flocks hf ON pr.herd_id = hf.id
    WHERE pr.id = $1 AND pr.tenant_id = $2`,
    [id, tenantId]
  );
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Processing record not found');
  }
  
  res.json(result.rows[0]);
}));

router.post('/processing-records', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { animal_id, herd_id, processing_date, status, processor_name, processor_contact, hanging_weight_lbs, packaged_weight_lbs, cost, notes } = req.body;
  
  // Normalize status to match PostgreSQL enum
  const normalizedStatus = normalizeProcessingStatus(status);
  
  // Validate that either animal_id or herd_id is provided, but not both
  if ((!animal_id && !herd_id) || (animal_id && herd_id)) {
    throw new ApiError(400, 'Either animal_id or herd_id must be provided, but not both');
  }
  
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const result = await client.query(
      `INSERT INTO processing_records (tenant_id, animal_id, herd_id, processing_date, status, processor_name, processor_contact, hanging_weight_lbs, packaged_weight_lbs, cost, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [tenantId, animal_id || null, herd_id || null, processing_date, normalizedStatus, processor_name, processor_contact, hanging_weight_lbs, packaged_weight_lbs, cost, notes]
    );
    
    // If status is Complete, update animal(s) to Processed
    if (normalizedStatus === 'Complete') {
      if (animal_id) {
        await client.query(
          `UPDATE animals SET status = 'Processed', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND tenant_id = $2`,
          [animal_id, tenantId]
        );
      } else if (herd_id) {
        await client.query(
          `UPDATE animals SET status = 'Processed', updated_at = CURRENT_TIMESTAMP WHERE herd_id = $1 AND tenant_id = $2 AND status = 'Active'`,
          [herd_id, tenantId]
        );
      }
    }
    
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
    
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

router.put('/processing-records/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { processing_date, status, processor_name, processor_contact, hanging_weight_lbs, packaged_weight_lbs, cost, notes } = req.body;
  
  // Normalize status to match PostgreSQL enum
  const normalizedStatus = status ? normalizeProcessingStatus(status) : null;
  
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get current record to check status change
    const currentRecord = await client.query(
      `SELECT * FROM processing_records WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );
    
    if (currentRecord.rows.length === 0) {
      throw new ApiError(404, 'Processing record not found');
    }
    
    const oldStatus = currentRecord.rows[0].status;
    const newStatus = normalizedStatus || oldStatus;
    
    const result = await client.query(
      `UPDATE processing_records SET
        processing_date = COALESCE($3, processing_date),
        status = COALESCE($4, status),
        processor_name = $5,
        processor_contact = $6,
        hanging_weight_lbs = $7,
        packaged_weight_lbs = $8,
        cost = $9,
        notes = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND tenant_id = $2
      RETURNING *`,
      [id, tenantId, processing_date, normalizedStatus, processor_name, processor_contact, hanging_weight_lbs, packaged_weight_lbs, cost, notes]
    );
    
    // If status changed to Complete, update animal(s) to Processed
    if (oldStatus !== 'Complete' && newStatus === 'Complete') {
      const record = currentRecord.rows[0];
      if (record.animal_id) {
        await client.query(
          `UPDATE animals SET status = 'Processed', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND tenant_id = $2`,
          [record.animal_id, tenantId]
        );
      } else if (record.herd_id) {
        await client.query(
          `UPDATE animals SET status = 'Processed', updated_at = CURRENT_TIMESTAMP WHERE herd_id = $1 AND tenant_id = $2 AND status = 'Active'`,
          [record.herd_id, tenantId]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json(result.rows[0]);
    
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

router.delete('/processing-records/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  await db.query(
    `DELETE FROM processing_records WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  
  res.json({ message: 'Processing record deleted' });
}));

// ============================================================================
// RAINFALL RECORDS
// ============================================================================

// Get all rainfall records with optional year filter
router.get('/rainfall', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { year } = req.query;
  
  let query = `
    SELECT * FROM rainfall_records 
    WHERE tenant_id = $1
  `;
  const params = [tenantId];
  
  if (year) {
    params.push(year);
    query += ` AND EXTRACT(YEAR FROM record_date) = $` + params.length;
  }
  
  query += ` ORDER BY record_date DESC`;
  
  const result = await db.query(query, params);
  res.json(result.rows);
}));

// Create rainfall record
router.post('/rainfall', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { record_date, amount_inches, notes } = req.body;
  
  if (!record_date) {
    throw new ApiError(400, 'Date is required');
  }
  if (amount_inches === undefined || amount_inches === null || amount_inches < 0) {
    throw new ApiError(400, 'Amount must be a non-negative number');
  }
  
  const result = await db.query(
    `INSERT INTO rainfall_records (tenant_id, record_date, amount_inches, notes)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [tenantId, record_date, amount_inches, notes || null]
  );
  
  res.status(201).json(result.rows[0]);
}));

// Update rainfall record
router.put('/rainfall/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { record_date, amount_inches, notes } = req.body;
  
  if (amount_inches !== undefined && amount_inches < 0) {
    throw new ApiError(400, 'Amount must be a non-negative number');
  }
  
  const result = await db.query(
    `UPDATE rainfall_records SET
      record_date = COALESCE($3, record_date),
      amount_inches = COALESCE($4, amount_inches),
      notes = $5,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND tenant_id = $2
    RETURNING *`,
    [id, tenantId, record_date, amount_inches, notes]
  );
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Rainfall record not found');
  }
  
  res.json(result.rows[0]);
}));

// Delete rainfall record
router.delete('/rainfall/:id', asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  const result = await db.query(
    `DELETE FROM rainfall_records WHERE id = $1 AND tenant_id = $2 RETURNING id`,
    [id, tenantId]
  );
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Rainfall record not found');
  }
  
  res.json({ message: 'Rainfall record deleted' });
}));

module.exports = router;
