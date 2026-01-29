/**
 * Site Builder Routes (Hybrid System)
 * Templates, zones, blocks, and assets management
 */

const express = require('express');
const db = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ============================================================================
// FILE UPLOAD CONFIGURATION
// ============================================================================

const uploadDir = path.join(__dirname, '../../uploads/site-assets');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tenantId = req.user?.tenant_id || '00000000-0000-0000-0000-000000000001';
    const tenantDir = path.join(uploadDir, tenantId);
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }
    cb(null, tenantDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|pdf|mp4|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: images, PDF, video'));
    }
  }
});

// ============================================================================
// TEMPLATES (Public - no auth needed for listing)
// ============================================================================

/**
 * GET /site-builder/templates
 * Get all available templates
 */
router.get('/templates', asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT 
      t.*,
      (SELECT COUNT(*) FROM template_zones tz WHERE tz.template_id = t.id) as zone_count
    FROM site_templates t
    WHERE t.is_active = true
    ORDER BY t.is_default DESC, t.name
  `);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

/**
 * GET /site-builder/templates/:id
 * Get a template with its zones
 */
router.get('/templates/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const templateResult = await db.query(
    'SELECT * FROM site_templates WHERE id = $1 AND is_active = true',
    [id]
  );

  if (templateResult.rows.length === 0) {
    throw new ApiError(404, 'Template not found');
  }

  const zonesResult = await db.query(`
    SELECT * FROM template_zones
    WHERE template_id = $1
    ORDER BY display_order
  `, [id]);

  res.json({
    status: 'success',
    data: {
      ...templateResult.rows[0],
      zones: zonesResult.rows
    }
  });
}));

// ============================================================================
// BLOCK TYPES (Public - no auth needed for listing)
// ============================================================================

/**
 * GET /site-builder/block-types
 * Get all available block types
 */
router.get('/block-types', asyncHandler(async (req, res) => {
  const { category } = req.query;

  let query = `
    SELECT * FROM block_types
    WHERE is_active = true
  `;
  const params = [];

  if (category) {
    query += ' AND category = $1';
    params.push(category);
  }

  query += ' ORDER BY category, sort_order, name';

  const result = await db.query(query, params);

  // Group by category
  const grouped = result.rows.reduce((acc, block) => {
    if (!acc[block.category]) {
      acc[block.category] = [];
    }
    acc[block.category].push(block);
    return acc;
  }, {});

  res.json({
    status: 'success',
    data: result.rows,
    grouped
  });
}));

/**
 * GET /site-builder/block-types/:id
 * Get a single block type with schema
 */
router.get('/block-types/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    'SELECT * FROM block_types WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Block type not found');
  }

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

// ============================================================================
// PROTECTED ROUTES - Require authentication
// ============================================================================
router.use(authenticate, requireStaff);

// ============================================================================
// PAGE BLOCKS
// ============================================================================

/**
 * GET /site-builder/pages/:pageId/blocks
 * Get all blocks for a page
 */
router.get('/pages/:pageId/blocks', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { pageId } = req.params;

  // Verify page belongs to tenant
  const pageCheck = await db.query(
    'SELECT id, template_id FROM site_pages WHERE id = $1 AND tenant_id = $2',
    [pageId, tenantId]
  );

  if (pageCheck.rows.length === 0) {
    throw new ApiError(404, 'Page not found');
  }

  const page = pageCheck.rows[0];

  // Get blocks
  const blocksResult = await db.query(`
    SELECT 
      pb.*,
      bt.name as block_type_name,
      bt.icon as block_type_icon,
      bt.content_schema
    FROM page_blocks pb
    JOIN block_types bt ON pb.block_type = bt.id
    WHERE pb.page_id = $1
    ORDER BY pb.zone_key, pb.display_order
  `, [pageId]);

  // Get template zones if template is assigned
  let zones = [];
  if (page.template_id) {
    const zonesResult = await db.query(`
      SELECT * FROM template_zones
      WHERE template_id = $1
      ORDER BY display_order
    `, [page.template_id]);
    zones = zonesResult.rows;
  }

  // Group blocks by zone
  const blocksByZone = blocksResult.rows.reduce((acc, block) => {
    if (!acc[block.zone_key]) {
      acc[block.zone_key] = [];
    }
    acc[block.zone_key].push(block);
    return acc;
  }, {});

  res.json({
    status: 'success',
    data: {
      blocks: blocksResult.rows,
      blocksByZone,
      zones
    }
  });
}));

/**
 * POST /site-builder/pages/:pageId/blocks
 * Create a new block on a page
 */
router.post('/pages/:pageId/blocks', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { pageId } = req.params;
  const { zone_key, block_type, content, settings, display_order, parent_block_id } = req.body;

  if (!zone_key || !block_type) {
    throw new ApiError(400, 'zone_key and block_type are required');
  }

  // Verify page belongs to tenant
  const pageCheck = await db.query(
    'SELECT id, template_id FROM site_pages WHERE id = $1 AND tenant_id = $2',
    [pageId, tenantId]
  );

  if (pageCheck.rows.length === 0) {
    throw new ApiError(404, 'Page not found');
  }

  // Verify block type exists
  const blockTypeCheck = await db.query(
    'SELECT id, default_content FROM block_types WHERE id = $1 AND is_active = true',
    [block_type]
  );

  if (blockTypeCheck.rows.length === 0) {
    throw new ApiError(400, 'Invalid block type');
  }

  // Check zone constraints if template is assigned
  const page = pageCheck.rows[0];
  if (page.template_id) {
    const zoneCheck = await db.query(`
      SELECT * FROM template_zones
      WHERE template_id = $1 AND zone_key = $2
    `, [page.template_id, zone_key]);

    if (zoneCheck.rows.length > 0) {
      const zone = zoneCheck.rows[0];
      
      // Check allowed blocks
      if (zone.allowed_blocks && zone.allowed_blocks.length > 0) {
        if (!zone.allowed_blocks.includes(block_type)) {
          throw new ApiError(400, `Block type '${block_type}' is not allowed in zone '${zone_key}'`);
        }
      }

      // Check max blocks
      if (zone.max_blocks) {
        const countResult = await db.query(
          'SELECT COUNT(*) FROM page_blocks WHERE page_id = $1 AND zone_key = $2',
          [pageId, zone_key]
        );
        if (parseInt(countResult.rows[0].count, 10) >= zone.max_blocks) {
          throw new ApiError(400, `Zone '${zone_key}' has reached maximum blocks (${zone.max_blocks})`);
        }
      }
    }
  }

  // Calculate display_order if not provided
  let order = display_order;
  if (order === undefined || order === null) {
    const maxOrderResult = await db.query(
      'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM page_blocks WHERE page_id = $1 AND zone_key = $2',
      [pageId, zone_key]
    );
    order = maxOrderResult.rows[0].next_order;
  }

  // Merge default content with provided content
  const defaultContent = blockTypeCheck.rows[0].default_content || {};
  const finalContent = { ...defaultContent, ...content };

  const result = await db.query(`
    INSERT INTO page_blocks (page_id, zone_key, block_type, content, settings, display_order, parent_block_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [pageId, zone_key, block_type, JSON.stringify(finalContent), JSON.stringify(settings || {}), order, parent_block_id]);

  // Get block with type info
  const blockResult = await db.query(`
    SELECT 
      pb.*,
      bt.name as block_type_name,
      bt.icon as block_type_icon,
      bt.content_schema
    FROM page_blocks pb
    JOIN block_types bt ON pb.block_type = bt.id
    WHERE pb.id = $1
  `, [result.rows[0].id]);

  logger.info('Block created', { pageId, blockId: result.rows[0].id, blockType: block_type });

  res.status(201).json({
    status: 'success',
    data: blockResult.rows[0]
  });
}));

/**
 * PUT /site-builder/pages/:pageId/blocks/:blockId
 * Update a block
 */
router.put('/pages/:pageId/blocks/:blockId', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { pageId, blockId } = req.params;
  const { content, settings, is_visible, display_order, zone_key } = req.body;

  // Verify page belongs to tenant
  const pageCheck = await db.query(
    'SELECT id FROM site_pages WHERE id = $1 AND tenant_id = $2',
    [pageId, tenantId]
  );

  if (pageCheck.rows.length === 0) {
    throw new ApiError(404, 'Page not found');
  }

  // Verify block exists and belongs to page
  const blockCheck = await db.query(
    'SELECT * FROM page_blocks WHERE id = $1 AND page_id = $2',
    [blockId, pageId]
  );

  if (blockCheck.rows.length === 0) {
    throw new ApiError(404, 'Block not found');
  }

  const result = await db.query(`
    UPDATE page_blocks SET
      content = COALESCE($3, content),
      settings = COALESCE($4, settings),
      is_visible = COALESCE($5, is_visible),
      display_order = COALESCE($6, display_order),
      zone_key = COALESCE($7, zone_key),
      updated_at = NOW()
    WHERE id = $1 AND page_id = $2
    RETURNING *
  `, [blockId, pageId, content ? JSON.stringify(content) : null, settings ? JSON.stringify(settings) : null, is_visible, display_order, zone_key]);

  // Get block with type info
  const blockResult = await db.query(`
    SELECT 
      pb.*,
      bt.name as block_type_name,
      bt.icon as block_type_icon,
      bt.content_schema
    FROM page_blocks pb
    JOIN block_types bt ON pb.block_type = bt.id
    WHERE pb.id = $1
  `, [blockId]);

  res.json({
    status: 'success',
    data: blockResult.rows[0]
  });
}));

/**
 * DELETE /site-builder/pages/:pageId/blocks/:blockId
 * Delete a block
 */
router.delete('/pages/:pageId/blocks/:blockId', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { pageId, blockId } = req.params;

  // Verify page belongs to tenant
  const pageCheck = await db.query(
    'SELECT id, template_id FROM site_pages WHERE id = $1 AND tenant_id = $2',
    [pageId, tenantId]
  );

  if (pageCheck.rows.length === 0) {
    throw new ApiError(404, 'Page not found');
  }

  // Check min_blocks constraint
  const blockCheck = await db.query(
    'SELECT zone_key FROM page_blocks WHERE id = $1 AND page_id = $2',
    [blockId, pageId]
  );

  if (blockCheck.rows.length === 0) {
    throw new ApiError(404, 'Block not found');
  }

  const page = pageCheck.rows[0];
  const zoneKey = blockCheck.rows[0].zone_key;

  if (page.template_id) {
    const zoneCheck = await db.query(`
      SELECT min_blocks FROM template_zones
      WHERE template_id = $1 AND zone_key = $2
    `, [page.template_id, zoneKey]);

    if (zoneCheck.rows.length > 0 && zoneCheck.rows[0].min_blocks) {
      const countResult = await db.query(
        'SELECT COUNT(*) FROM page_blocks WHERE page_id = $1 AND zone_key = $2',
        [pageId, zoneKey]
      );
      if (parseInt(countResult.rows[0].count, 10) <= zoneCheck.rows[0].min_blocks) {
        throw new ApiError(400, `Zone '${zoneKey}' requires at least ${zoneCheck.rows[0].min_blocks} block(s)`);
      }
    }
  }

  await db.query('DELETE FROM page_blocks WHERE id = $1', [blockId]);

  logger.info('Block deleted', { pageId, blockId });

  res.json({
    status: 'success',
    message: 'Block deleted'
  });
}));

/**
 * PUT /site-builder/pages/:pageId/blocks/reorder
 * Reorder blocks within a zone or move between zones
 */
router.put('/pages/:pageId/blocks/reorder', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { pageId } = req.params;
  const { blocks } = req.body; // Array of { id, zone_key, display_order }

  if (!Array.isArray(blocks)) {
    throw new ApiError(400, 'blocks array is required');
  }

  // Verify page belongs to tenant
  const pageCheck = await db.query(
    'SELECT id FROM site_pages WHERE id = $1 AND tenant_id = $2',
    [pageId, tenantId]
  );

  if (pageCheck.rows.length === 0) {
    throw new ApiError(404, 'Page not found');
  }

  // Update each block
  for (const block of blocks) {
    await db.query(`
      UPDATE page_blocks SET
        zone_key = $2,
        display_order = $3,
        updated_at = NOW()
      WHERE id = $1 AND page_id = $4
    `, [block.id, block.zone_key, block.display_order, pageId]);
  }

  // Return updated blocks
  const result = await db.query(`
    SELECT 
      pb.*,
      bt.name as block_type_name,
      bt.icon as block_type_icon
    FROM page_blocks pb
    JOIN block_types bt ON pb.block_type = bt.id
    WHERE pb.page_id = $1
    ORDER BY pb.zone_key, pb.display_order
  `, [pageId]);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

/**
 * POST /site-builder/pages/:pageId/blocks/:blockId/duplicate
 * Duplicate a block
 */
router.post('/pages/:pageId/blocks/:blockId/duplicate', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { pageId, blockId } = req.params;

  // Verify page belongs to tenant
  const pageCheck = await db.query(
    'SELECT id FROM site_pages WHERE id = $1 AND tenant_id = $2',
    [pageId, tenantId]
  );

  if (pageCheck.rows.length === 0) {
    throw new ApiError(404, 'Page not found');
  }

  // Get original block
  const blockResult = await db.query(
    'SELECT * FROM page_blocks WHERE id = $1 AND page_id = $2',
    [blockId, pageId]
  );

  if (blockResult.rows.length === 0) {
    throw new ApiError(404, 'Block not found');
  }

  const original = blockResult.rows[0];

  // Insert duplicate with incremented display_order
  const result = await db.query(`
    INSERT INTO page_blocks (page_id, zone_key, block_type, content, settings, display_order, is_visible)
    VALUES ($1, $2, $3, $4, $5, $6 + 1, $7)
    RETURNING *
  `, [pageId, original.zone_key, original.block_type, original.content, original.settings, original.display_order, original.is_visible]);

  // Get block with type info
  const newBlockResult = await db.query(`
    SELECT 
      pb.*,
      bt.name as block_type_name,
      bt.icon as block_type_icon,
      bt.content_schema
    FROM page_blocks pb
    JOIN block_types bt ON pb.block_type = bt.id
    WHERE pb.id = $1
  `, [result.rows[0].id]);

  logger.info('Block duplicated', { pageId, originalBlockId: blockId, newBlockId: result.rows[0].id });

  res.status(201).json({
    status: 'success',
    data: newBlockResult.rows[0]
  });
}));

// ============================================================================
// PAGE WITH TEMPLATE
// ============================================================================

/**
 * PUT /site-builder/pages/:pageId/template
 * Assign or change a page's template
 */
router.put('/pages/:pageId/template', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { pageId } = req.params;
  const { template_id, initialize_blocks } = req.body;

  // Verify page belongs to tenant
  const pageCheck = await db.query(
    'SELECT * FROM site_pages WHERE id = $1 AND tenant_id = $2',
    [pageId, tenantId]
  );

  if (pageCheck.rows.length === 0) {
    throw new ApiError(404, 'Page not found');
  }

  // Verify template exists if provided
  if (template_id) {
    const templateCheck = await db.query(
      'SELECT id FROM site_templates WHERE id = $1 AND is_active = true',
      [template_id]
    );

    if (templateCheck.rows.length === 0) {
      throw new ApiError(400, 'Invalid template');
    }
  }

  // Update page template
  await db.query(`
    UPDATE site_pages SET
      template_id = $2,
      updated_at = NOW()
    WHERE id = $1
  `, [pageId, template_id]);

  // Initialize default blocks if requested
  if (initialize_blocks && template_id) {
    // Get template zones with default blocks
    const zonesResult = await db.query(`
      SELECT * FROM template_zones
      WHERE template_id = $1 AND default_blocks != '[]'::jsonb
      ORDER BY display_order
    `, [template_id]);

    for (const zone of zonesResult.rows) {
      const defaultBlocks = zone.default_blocks || [];
      for (let i = 0; i < defaultBlocks.length; i++) {
        const block = defaultBlocks[i];
        await db.query(`
          INSERT INTO page_blocks (page_id, zone_key, block_type, content, display_order)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [pageId, zone.zone_key, block.type, JSON.stringify(block.content || {}), i]);
      }
    }
  }

  // Return updated page with blocks
  const result = await db.query(`
    SELECT 
      p.*,
      t.name as template_name,
      t.slug as template_slug
    FROM site_pages p
    LEFT JOIN site_templates t ON p.template_id = t.id
    WHERE p.id = $1
  `, [pageId]);

  const blocksResult = await db.query(`
    SELECT * FROM page_blocks WHERE page_id = $1 ORDER BY zone_key, display_order
  `, [pageId]);

  res.json({
    status: 'success',
    data: {
      ...result.rows[0],
      blocks: blocksResult.rows
    }
  });
}));

// ============================================================================
// GLOBAL BLOCKS
// ============================================================================

/**
 * GET /site-builder/global-blocks
 * Get all global blocks for tenant
 */
router.get('/global-blocks', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { block_type } = req.query;

  let query = `
    SELECT 
      gb.*,
      bt.name as block_type_name,
      bt.icon as block_type_icon,
      (SELECT COUNT(*) FROM global_block_instances gbi WHERE gbi.global_block_id = gb.id) as instance_count
    FROM global_blocks gb
    JOIN block_types bt ON gb.block_type = bt.id
    WHERE gb.tenant_id = $1 AND gb.is_active = true
  `;
  const params = [tenantId];

  if (block_type) {
    query += ' AND gb.block_type = $2';
    params.push(block_type);
  }

  query += ' ORDER BY gb.name';

  const result = await db.query(query, params);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

/**
 * POST /site-builder/global-blocks
 * Create a global block
 */
router.post('/global-blocks', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { name, description, block_type, content, settings } = req.body;

  if (!name || !block_type) {
    throw new ApiError(400, 'name and block_type are required');
  }

  // Verify block type exists
  const blockTypeCheck = await db.query(
    'SELECT id, default_content FROM block_types WHERE id = $1 AND is_active = true',
    [block_type]
  );

  if (blockTypeCheck.rows.length === 0) {
    throw new ApiError(400, 'Invalid block type');
  }

  // Check for duplicate name
  const existing = await db.query(
    'SELECT id FROM global_blocks WHERE tenant_id = $1 AND name = $2',
    [tenantId, name]
  );

  if (existing.rows.length > 0) {
    throw new ApiError(400, 'A global block with this name already exists');
  }

  const defaultContent = blockTypeCheck.rows[0].default_content || {};
  const finalContent = { ...defaultContent, ...content };

  const result = await db.query(`
    INSERT INTO global_blocks (tenant_id, name, description, block_type, content, settings)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [tenantId, name, description, block_type, JSON.stringify(finalContent), JSON.stringify(settings || {})]);

  logger.info('Global block created', { tenantId, blockId: result.rows[0].id, name });

  res.status(201).json({
    status: 'success',
    data: result.rows[0]
  });
}));

/**
 * PUT /site-builder/global-blocks/:id
 * Update a global block
 */
router.put('/global-blocks/:id', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { id } = req.params;
  const { name, description, content, settings, is_active } = req.body;

  const existing = await db.query(
    'SELECT * FROM global_blocks WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Global block not found');
  }

  // Check for duplicate name if changing
  if (name && name !== existing.rows[0].name) {
    const duplicate = await db.query(
      'SELECT id FROM global_blocks WHERE tenant_id = $1 AND name = $2 AND id != $3',
      [tenantId, name, id]
    );
    if (duplicate.rows.length > 0) {
      throw new ApiError(400, 'A global block with this name already exists');
    }
  }

  const result = await db.query(`
    UPDATE global_blocks SET
      name = COALESCE($3, name),
      description = COALESCE($4, description),
      content = COALESCE($5, content),
      settings = COALESCE($6, settings),
      is_active = COALESCE($7, is_active),
      updated_at = NOW()
    WHERE id = $1 AND tenant_id = $2
    RETURNING *
  `, [id, tenantId, name, description, content ? JSON.stringify(content) : null, settings ? JSON.stringify(settings) : null, is_active]);

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

/**
 * DELETE /site-builder/global-blocks/:id
 * Delete a global block
 */
router.delete('/global-blocks/:id', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { id } = req.params;

  const existing = await db.query(
    'SELECT * FROM global_blocks WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Global block not found');
  }

  // Check if in use
  const usageCheck = await db.query(
    'SELECT COUNT(*) FROM global_block_instances WHERE global_block_id = $1',
    [id]
  );

  if (parseInt(usageCheck.rows[0].count, 10) > 0) {
    throw new ApiError(400, 'Cannot delete global block that is in use. Remove all instances first.');
  }

  await db.query('DELETE FROM global_blocks WHERE id = $1', [id]);

  logger.info('Global block deleted', { tenantId, blockId: id });

  res.json({
    status: 'success',
    message: 'Global block deleted'
  });
}));

/**
 * POST /site-builder/pages/:pageId/global-blocks
 * Add a global block instance to a page
 */
router.post('/pages/:pageId/global-blocks', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { pageId } = req.params;
  const { global_block_id, zone_key, display_order, setting_overrides } = req.body;

  if (!global_block_id || !zone_key) {
    throw new ApiError(400, 'global_block_id and zone_key are required');
  }

  // Verify page belongs to tenant
  const pageCheck = await db.query(
    'SELECT id FROM site_pages WHERE id = $1 AND tenant_id = $2',
    [pageId, tenantId]
  );

  if (pageCheck.rows.length === 0) {
    throw new ApiError(404, 'Page not found');
  }

  // Verify global block belongs to tenant
  const blockCheck = await db.query(
    'SELECT * FROM global_blocks WHERE id = $1 AND tenant_id = $2 AND is_active = true',
    [global_block_id, tenantId]
  );

  if (blockCheck.rows.length === 0) {
    throw new ApiError(404, 'Global block not found');
  }

  // Calculate display_order if not provided
  let order = display_order;
  if (order === undefined || order === null) {
    const maxOrderResult = await db.query(
      'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM global_block_instances WHERE page_id = $1 AND zone_key = $2',
      [pageId, zone_key]
    );
    order = maxOrderResult.rows[0].next_order;
  }

  const result = await db.query(`
    INSERT INTO global_block_instances (global_block_id, page_id, zone_key, display_order, setting_overrides)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [global_block_id, pageId, zone_key, order, JSON.stringify(setting_overrides || {})]);

  // Update usage count
  await db.query(
    'UPDATE global_blocks SET usage_count = usage_count + 1 WHERE id = $1',
    [global_block_id]
  );

  logger.info('Global block instance added', { pageId, globalBlockId: global_block_id });

  res.status(201).json({
    status: 'success',
    data: result.rows[0]
  });
}));

// ============================================================================
// SITE ASSETS
// ============================================================================

/**
 * GET /site-builder/assets
 * Get all assets for tenant
 */
router.get('/assets', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { folder, category, search, limit = 50, offset = 0 } = req.query;

  let query = `
    SELECT * FROM site_assets
    WHERE tenant_id = $1
  `;
  const params = [tenantId];
  let paramIndex = 2;

  if (folder) {
    query += ` AND folder = $${paramIndex}`;
    params.push(folder);
    paramIndex++;
  }

  if (category) {
    query += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (search) {
    query += ` AND (filename ILIKE $${paramIndex} OR original_filename ILIKE $${paramIndex} OR title ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Get total count
  const countResult = await db.query(
    query.replace('SELECT *', 'SELECT COUNT(*)'),
    params
  );

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(parseInt(limit, 10), parseInt(offset, 10));

  const result = await db.query(query, params);

  res.json({
    status: 'success',
    data: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count, 10),
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    }
  });
}));

/**
 * POST /site-builder/assets/upload
 * Upload a new asset
 */
router.post('/assets/upload', upload.single('file'), asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';

  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const { alt_text, title, caption, folder, tags } = req.body;

  // Determine category based on mime type
  let category = 'document';
  if (req.file.mimetype.startsWith('image/')) {
    category = 'image';
  } else if (req.file.mimetype.startsWith('video/')) {
    category = 'video';
  }

  // Build file URL
  const fileUrl = `/uploads/site-assets/${tenantId}/${req.file.filename}`;

  const result = await db.query(`
    INSERT INTO site_assets (
      tenant_id, filename, original_filename, file_path, file_url, 
      file_size, mime_type, alt_text, title, caption, folder, 
      tags, category, uploaded_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *
  `, [
    tenantId,
    req.file.filename,
    req.file.originalname,
    req.file.path,
    fileUrl,
    req.file.size,
    req.file.mimetype,
    alt_text,
    title || req.file.originalname,
    caption,
    folder || 'uploads',
    tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
    category,
    req.user.id
  ]);

  logger.info('Asset uploaded', { tenantId, assetId: result.rows[0].id, filename: req.file.originalname });

  res.status(201).json({
    status: 'success',
    data: result.rows[0]
  });
}));

/**
 * PUT /site-builder/assets/:id
 * Update asset metadata
 */
router.put('/assets/:id', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { id } = req.params;
  const { alt_text, title, caption, folder, tags } = req.body;

  const existing = await db.query(
    'SELECT * FROM site_assets WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Asset not found');
  }

  const result = await db.query(`
    UPDATE site_assets SET
      alt_text = COALESCE($3, alt_text),
      title = COALESCE($4, title),
      caption = COALESCE($5, caption),
      folder = COALESCE($6, folder),
      tags = COALESCE($7, tags),
      updated_at = NOW()
    WHERE id = $1 AND tenant_id = $2
    RETURNING *
  `, [id, tenantId, alt_text, title, caption, folder, tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : null]);

  res.json({
    status: 'success',
    data: result.rows[0]
  });
}));

/**
 * DELETE /site-builder/assets/:id
 * Delete an asset
 */
router.delete('/assets/:id', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { id } = req.params;

  const existing = await db.query(
    'SELECT * FROM site_assets WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Asset not found');
  }

  const asset = existing.rows[0];

  // Delete physical file
  try {
    if (fs.existsSync(asset.file_path)) {
      fs.unlinkSync(asset.file_path);
    }
  } catch (err) {
    logger.warn('Failed to delete asset file', { assetId: id, path: asset.file_path, error: err.message });
  }

  await db.query('DELETE FROM site_assets WHERE id = $1', [id]);

  logger.info('Asset deleted', { tenantId, assetId: id });

  res.json({
    status: 'success',
    message: 'Asset deleted'
  });
}));

/**
 * GET /site-builder/assets/folders
 * Get list of folders
 */
router.get('/assets/folders', asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id || '00000000-0000-0000-0000-000000000001';

  const result = await db.query(`
    SELECT folder, COUNT(*) as count
    FROM site_assets
    WHERE tenant_id = $1
    GROUP BY folder
    ORDER BY folder
  `, [tenantId]);

  res.json({
    status: 'success',
    data: result.rows
  });
}));

// ============================================================================
// PUBLIC API (for rendering site)
// ============================================================================

/**
 * GET /site-builder/public/pages/:slug
 * Get a published page with all blocks (no auth required for site rendering)
 */
router.get('/public/pages/:slug', asyncHandler(async (req, res) => {
  const tenantId = req.query.tenant_id || '00000000-0000-0000-0000-000000000001';
  const { slug } = req.params;

  const pageResult = await db.query(`
    SELECT 
      p.*,
      t.name as template_name,
      t.slug as template_slug
    FROM site_pages p
    LEFT JOIN site_templates t ON p.template_id = t.id
    WHERE p.tenant_id = $1 AND p.slug = $2 AND p.is_published = true
  `, [tenantId, slug === 'home' ? '' : slug]);

  if (pageResult.rows.length === 0) {
    throw new ApiError(404, 'Page not found');
  }

  const page = pageResult.rows[0];

  // Get blocks
  const blocksResult = await db.query(`
    SELECT 
      pb.*,
      bt.name as block_type_name
    FROM page_blocks pb
    JOIN block_types bt ON pb.block_type = bt.id
    WHERE pb.page_id = $1 AND pb.is_visible = true
    ORDER BY pb.zone_key, pb.display_order
  `, [page.id]);

  // Get template zones
  let zones = [];
  if (page.template_id) {
    const zonesResult = await db.query(`
      SELECT zone_key, zone_name, display_order FROM template_zones
      WHERE template_id = $1
      ORDER BY display_order
    `, [page.template_id]);
    zones = zonesResult.rows;
  }

  // Get global block instances
  const globalInstancesResult = await db.query(`
    SELECT 
      gbi.*,
      gb.block_type,
      gb.content,
      gb.settings as global_settings,
      bt.name as block_type_name
    FROM global_block_instances gbi
    JOIN global_blocks gb ON gbi.global_block_id = gb.id
    JOIN block_types bt ON gb.block_type = bt.id
    WHERE gbi.page_id = $1 AND gb.is_active = true
    ORDER BY gbi.zone_key, gbi.display_order
  `, [page.id]);

  // Group blocks by zone
  const blocksByZone = blocksResult.rows.reduce((acc, block) => {
    if (!acc[block.zone_key]) {
      acc[block.zone_key] = [];
    }
    acc[block.zone_key].push({
      ...block,
      is_global: false
    });
    return acc;
  }, {});

  // Add global blocks to zones
  globalInstancesResult.rows.forEach(instance => {
    if (!blocksByZone[instance.zone_key]) {
      blocksByZone[instance.zone_key] = [];
    }
    blocksByZone[instance.zone_key].push({
      ...instance,
      is_global: true,
      settings: { ...instance.global_settings, ...instance.setting_overrides }
    });
  });

  // Sort each zone by display_order
  Object.keys(blocksByZone).forEach(zone => {
    blocksByZone[zone].sort((a, b) => a.display_order - b.display_order);
  });

  res.json({
    status: 'success',
    data: {
      ...page,
      zones,
      blocks: blocksResult.rows,
      globalBlocks: globalInstancesResult.rows,
      blocksByZone
    }
  });
}));

module.exports = router;
