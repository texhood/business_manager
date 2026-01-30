/**
 * Tenant Assets Routes
 * Serves tenant branding assets (logos, favicons) from database storage
 * Used for production environments without persistent filesystem
 */

const express = require('express');
const db = require('../../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Allowed asset types
const ALLOWED_ASSET_TYPES = ['logo', 'favicon', 'og_image', 'email_header', 'receipt_logo'];

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon'
];

// Max file size (2MB for logos)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// ============================================================================
// PUBLIC: GET TENANT ASSET (by tenant slug or ID)
// ============================================================================

/**
 * GET /tenant-assets/:tenantIdentifier/:assetType
 * Public endpoint - serves asset with proper content-type headers
 * tenantIdentifier can be tenant slug or tenant ID
 */
router.get('/:tenantIdentifier/:assetType', asyncHandler(async (req, res) => {
  const { tenantIdentifier, assetType } = req.params;

  if (!ALLOWED_ASSET_TYPES.includes(assetType)) {
    throw new ApiError(400, `Invalid asset type: ${assetType}`);
  }

  // Find tenant by slug or ID
  const tenantResult = await db.query(`
    SELECT id FROM tenants 
    WHERE slug = $1 OR id::text = $1
    LIMIT 1
  `, [tenantIdentifier]);

  if (tenantResult.rows.length === 0) {
    throw new ApiError(404, 'Tenant not found');
  }

  const tenantId = tenantResult.rows[0].id;

  // Get the asset
  const result = await db.query(`
    SELECT data, mime_type, filename, updated_at
    FROM tenant_assets
    WHERE tenant_id = $1 AND asset_type = $2
  `, [tenantId, assetType]);

  if (result.rows.length === 0) {
    // Return 404 or redirect to default platform asset
    return res.redirect('/assets/logo.svg');
  }

  const asset = result.rows[0];

  // Set caching headers (cache for 1 hour, revalidate)
  res.set({
    'Content-Type': asset.mime_type,
    'Content-Disposition': `inline; filename="${asset.filename}"`,
    'Cache-Control': 'public, max-age=3600, must-revalidate',
    'ETag': `"${asset.updated_at.getTime()}"`,
    'Last-Modified': asset.updated_at.toUTCString()
  });

  // Handle conditional requests (304 Not Modified)
  const ifNoneMatch = req.headers['if-none-match'];
  const ifModifiedSince = req.headers['if-modified-since'];
  
  if (ifNoneMatch === `"${asset.updated_at.getTime()}"`) {
    return res.status(304).end();
  }
  
  if (ifModifiedSince && new Date(ifModifiedSince) >= asset.updated_at) {
    return res.status(304).end();
  }

  res.send(asset.data);
}));

// ============================================================================
// ADMIN: UPLOAD/UPDATE ASSET
// ============================================================================

/**
 * POST /tenant-assets/:assetType
 * Upload or replace a tenant asset
 * Requires authentication and admin role
 */
router.post('/:assetType', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { assetType } = req.params;
  const tenantId = req.user.tenant_id;

  if (!ALLOWED_ASSET_TYPES.includes(assetType)) {
    throw new ApiError(400, `Invalid asset type: ${assetType}`);
  }

  // Expect base64 encoded file in body
  const { data, filename, mime_type } = req.body;

  if (!data || !filename || !mime_type) {
    throw new ApiError(400, 'Missing required fields: data, filename, mime_type');
  }

  if (!ALLOWED_MIME_TYPES.includes(mime_type)) {
    throw new ApiError(400, `Invalid file type: ${mime_type}`);
  }

  // Decode base64
  const buffer = Buffer.from(data, 'base64');

  if (buffer.length > MAX_FILE_SIZE) {
    throw new ApiError(400, `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Upsert the asset
  const result = await db.query(`
    INSERT INTO tenant_assets (tenant_id, asset_type, filename, mime_type, data, file_size)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (tenant_id, asset_type) 
    DO UPDATE SET
      filename = EXCLUDED.filename,
      mime_type = EXCLUDED.mime_type,
      data = EXCLUDED.data,
      file_size = EXCLUDED.file_size,
      updated_at = CURRENT_TIMESTAMP
    RETURNING id, asset_type, filename, mime_type, file_size, created_at, updated_at
  `, [tenantId, assetType, filename, mime_type, buffer, buffer.length]);

  logger.info('Tenant asset uploaded', {
    tenantId,
    assetType,
    filename,
    size: buffer.length
  });

  res.status(201).json({
    status: 'success',
    data: {
      ...result.rows[0],
      url: `/tenant-assets/${tenantId}/${assetType}`
    }
  });
}));

// ============================================================================
// ADMIN: DELETE ASSET
// ============================================================================

/**
 * DELETE /tenant-assets/:assetType
 * Delete a tenant asset
 */
router.delete('/:assetType', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { assetType } = req.params;
  const tenantId = req.user.tenant_id;

  const result = await db.query(`
    DELETE FROM tenant_assets
    WHERE tenant_id = $1 AND asset_type = $2
    RETURNING id
  `, [tenantId, assetType]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Asset not found');
  }

  logger.info('Tenant asset deleted', { tenantId, assetType });

  res.json({
    status: 'success',
    message: 'Asset deleted'
  });
}));

// ============================================================================
// ADMIN: LIST ASSETS
// ============================================================================

/**
 * GET /tenant-assets
 * List all assets for the current tenant
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenant_id;

  const result = await db.query(`
    SELECT 
      id, tenant_id, asset_type, filename, mime_type, file_size,
      created_at, updated_at
    FROM tenant_assets
    WHERE tenant_id = $1
    ORDER BY asset_type
  `, [tenantId]);

  // Add URLs to each asset
  const assets = result.rows.map(asset => ({
    ...asset,
    url: `/tenant-assets/${tenantId}/${asset.asset_type}`
  }));

  res.json({
    status: 'success',
    data: assets
  });
}));

module.exports = router;
