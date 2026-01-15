/**
 * Media Library Routes
 * Handles file uploads, management, and organization
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const db = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Default tenant ID
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

// Helper to get tenant ID from request
const getTenantId = (req) => {
  return req.user?.tenant_id || DEFAULT_TENANT_ID;
};

// ============================================================================
// STORAGE CONFIGURATION
// ============================================================================

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const ensureUploadsDir = async () => {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
};
ensureUploadsDir();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const tenantId = getTenantId(req);
    const folder = req.body.folder || 'uploads';
    const destPath = path.join(UPLOADS_DIR, tenantId, folder);
    
    try {
      await fs.mkdir(destPath, { recursive: true });
      cb(null, destPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .substring(0, 50);
    cb(null, `${safeName}-${uniqueId}${ext}`);
  }
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(`File type ${file.mimetype} not allowed`, 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 10 // Max 10 files per request
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get image dimensions (basic implementation)
 */
const getImageDimensions = async (filePath, mimeType) => {
  if (!mimeType.startsWith('image/')) return { width: null, height: null };
  
  // For now, return null - would need sharp or similar for actual dimensions
  // Can be enhanced later with sharp package
  return { width: null, height: null };
};

/**
 * Build public URL for a file
 * Always use MEDIA_BASE_URL if set, otherwise construct from request
 */
const buildPublicUrl = (req, tenantId, folder, filename) => {
  // Prefer MEDIA_BASE_URL from environment for consistency
  const baseUrl = process.env.MEDIA_BASE_URL || `http://${req.get('host')}`;
  const url = `${baseUrl}/uploads/${tenantId}/${folder}/${filename}`;
  logger.info(`Built media URL: ${url}`);
  return url;
};

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /media
 * List all media files with filtering and pagination
 */
router.get('/', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const {
    folder,
    mime_type,
    search,
    tags,
    sort_by = 'created_at',
    sort_order = 'DESC',
    page = 1,
    limit = 50
  } = req.query;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [tenantId];
  let paramIndex = 2;
  
  let whereClause = 'WHERE tenant_id = $1';
  
  if (folder) {
    whereClause += ` AND folder = $${paramIndex++}`;
    params.push(folder);
  }
  
  if (mime_type) {
    if (mime_type === 'image') {
      whereClause += ` AND mime_type LIKE 'image/%'`;
    } else if (mime_type === 'document') {
      whereClause += ` AND mime_type NOT LIKE 'image/%'`;
    } else {
      whereClause += ` AND mime_type = $${paramIndex++}`;
      params.push(mime_type);
    }
  }
  
  if (search) {
    whereClause += ` AND (
      original_filename ILIKE $${paramIndex} OR 
      title ILIKE $${paramIndex} OR 
      alt_text ILIKE $${paramIndex} OR
      caption ILIKE $${paramIndex}
    )`;
    params.push(`%${search}%`);
    paramIndex++;
  }
  
  if (tags) {
    const tagArray = tags.split(',').map(t => t.trim());
    whereClause += ` AND tags && $${paramIndex++}`;
    params.push(tagArray);
  }
  
  // Validate sort column
  const allowedSortColumns = ['created_at', 'original_filename', 'file_size', 'usage_count'];
  const sortColumn = allowedSortColumns.includes(sort_by) ? sort_by : 'created_at';
  const sortDir = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  // Get total count
  const countResult = await db.query(
    `SELECT COUNT(*) as total FROM media ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].total);
  
  // Get media items
  params.push(parseInt(limit), offset);
  const result = await db.query(`
    SELECT 
      id,
      filename,
      original_filename,
      mime_type,
      file_size,
      storage_url,
      width,
      height,
      thumbnails,
      folder,
      alt_text,
      caption,
      title,
      tags,
      usage_count,
      created_at,
      updated_at
    FROM media
    ${whereClause}
    ORDER BY ${sortColumn} ${sortDir}
    LIMIT $${paramIndex++} OFFSET $${paramIndex}
  `, params);
  
  res.json({
    data: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
}));

/**
 * GET /media/folders
 * List all folders
 */
router.get('/folders', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  
  const result = await db.query(`
    SELECT 
      mf.id,
      mf.name,
      mf.slug,
      mf.parent_id,
      mf.created_at,
      COUNT(m.id) as file_count
    FROM media_folders mf
    LEFT JOIN media m ON m.folder = mf.slug AND m.tenant_id = mf.tenant_id
    WHERE mf.tenant_id = $1
    GROUP BY mf.id
    ORDER BY mf.name
  `, [tenantId]);
  
  res.json(result.rows);
}));

/**
 * POST /media/folders
 * Create a new folder
 */
router.post('/folders', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { name, parent_id } = req.body;
  
  if (!name) {
    throw new ApiError('Folder name is required', 400);
  }
  
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const result = await db.query(`
    INSERT INTO media_folders (tenant_id, name, slug, parent_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [tenantId, name, slug, parent_id || null]);
  
  res.status(201).json(result.rows[0]);
}));

/**
 * DELETE /media/folders/:id
 * Delete a folder (must be empty)
 */
router.delete('/folders/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  // Check if folder has files
  const folder = await db.query(
    'SELECT slug FROM media_folders WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
  
  if (folder.rows.length === 0) {
    throw new ApiError('Folder not found', 404);
  }
  
  const fileCount = await db.query(
    'SELECT COUNT(*) as count FROM media WHERE folder = $1 AND tenant_id = $2',
    [folder.rows[0].slug, tenantId]
  );
  
  if (parseInt(fileCount.rows[0].count) > 0) {
    throw new ApiError('Cannot delete folder with files. Move or delete files first.', 400);
  }
  
  await db.query(
    'DELETE FROM media_folders WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
  
  res.json({ message: 'Folder deleted successfully' });
}));

/**
 * GET /media/:id
 * Get single media item details
 */
router.get('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  const result = await db.query(`
    SELECT * FROM media WHERE id = $1 AND tenant_id = $2
  `, [id, tenantId]);
  
  if (result.rows.length === 0) {
    throw new ApiError('Media not found', 404);
  }
  
  res.json(result.rows[0]);
}));

/**
 * POST /media/upload
 * Upload one or more files
 */
router.post('/upload', authenticate, requireStaff, upload.array('files', 10), asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const userId = req.user?.id;
  const folder = req.body.folder || 'uploads';
  
  if (!req.files || req.files.length === 0) {
    throw new ApiError('No files uploaded', 400);
  }
  
  const uploadedFiles = [];
  
  for (const file of req.files) {
    const dimensions = await getImageDimensions(file.path, file.mimetype);
    const storageKey = `${tenantId}/${folder}/${file.filename}`;
    const storageUrl = buildPublicUrl(req, tenantId, folder, file.filename);
    
    const result = await db.query(`
      INSERT INTO media (
        tenant_id,
        filename,
        original_filename,
        mime_type,
        file_size,
        storage_provider,
        storage_key,
        storage_url,
        width,
        height,
        folder,
        uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      tenantId,
      file.filename,
      file.originalname,
      file.mimetype,
      file.size,
      'local',
      storageKey,
      storageUrl,
      dimensions.width,
      dimensions.height,
      folder,
      userId
    ]);
    
    uploadedFiles.push(result.rows[0]);
  }
  
  logger.info(`Uploaded ${uploadedFiles.length} files for tenant ${tenantId}`);
  
  res.status(201).json({
    message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
    data: uploadedFiles
  });
}));

/**
 * PATCH /media/:id
 * Update media metadata
 */
router.patch('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { alt_text, caption, title, tags, folder } = req.body;
  
  // Check media exists
  const existing = await db.query(
    'SELECT * FROM media WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
  
  if (existing.rows.length === 0) {
    throw new ApiError('Media not found', 404);
  }
  
  const updates = [];
  const params = [id, tenantId];
  let paramIndex = 3;
  
  if (alt_text !== undefined) {
    updates.push(`alt_text = $${paramIndex++}`);
    params.push(alt_text);
  }
  
  if (caption !== undefined) {
    updates.push(`caption = $${paramIndex++}`);
    params.push(caption);
  }
  
  if (title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    params.push(title);
  }
  
  if (tags !== undefined) {
    updates.push(`tags = $${paramIndex++}`);
    params.push(Array.isArray(tags) ? tags : []);
  }
  
  if (folder !== undefined) {
    // Move file to new folder
    const oldPath = path.join(UPLOADS_DIR, existing.rows[0].storage_key);
    const newStorageKey = `${tenantId}/${folder}/${existing.rows[0].filename}`;
    const newPath = path.join(UPLOADS_DIR, newStorageKey);
    
    // Ensure new folder exists
    await fs.mkdir(path.dirname(newPath), { recursive: true });
    
    // Move file
    try {
      await fs.rename(oldPath, newPath);
      updates.push(`folder = $${paramIndex++}`);
      params.push(folder);
      updates.push(`storage_key = $${paramIndex++}`);
      params.push(newStorageKey);
    } catch (err) {
      logger.error('Failed to move file:', err);
      throw new ApiError('Failed to move file', 500);
    }
  }
  
  if (updates.length === 0) {
    return res.json(existing.rows[0]);
  }
  
  updates.push('updated_at = CURRENT_TIMESTAMP');
  
  const result = await db.query(`
    UPDATE media 
    SET ${updates.join(', ')}
    WHERE id = $1 AND tenant_id = $2
    RETURNING *
  `, params);
  
  res.json(result.rows[0]);
}));

/**
 * DELETE /media/:id
 * Delete a media file
 */
router.delete('/:id', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  // Get file info
  const existing = await db.query(
    'SELECT * FROM media WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
  
  if (existing.rows.length === 0) {
    throw new ApiError('Media not found', 404);
  }
  
  const media = existing.rows[0];
  
  // Delete file from storage
  const filePath = path.join(UPLOADS_DIR, media.storage_key);
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      logger.error('Failed to delete file:', err);
    }
  }
  
  // Delete from database
  await db.query(
    'DELETE FROM media WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
  
  logger.info(`Deleted media ${id} for tenant ${tenantId}`);
  
  res.json({ message: 'Media deleted successfully' });
}));

/**
 * POST /media/:id/duplicate
 * Create a copy of a media file
 */
router.post('/:id/duplicate', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  
  const existing = await db.query(
    'SELECT * FROM media WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
  
  if (existing.rows.length === 0) {
    throw new ApiError('Media not found', 404);
  }
  
  const media = existing.rows[0];
  const newId = uuidv4();
  const ext = path.extname(media.filename);
  const baseName = media.filename.replace(ext, '');
  const newFilename = `${baseName}-copy-${newId.substring(0, 8)}${ext}`;
  
  // Copy file
  const oldPath = path.join(UPLOADS_DIR, media.storage_key);
  const newStorageKey = `${tenantId}/${media.folder}/${newFilename}`;
  const newPath = path.join(UPLOADS_DIR, newStorageKey);
  
  await fs.copyFile(oldPath, newPath);
  
  // Create database record
  const result = await db.query(`
    INSERT INTO media (
      tenant_id, filename, original_filename, mime_type, file_size,
      storage_provider, storage_key, storage_url, width, height,
      folder, alt_text, caption, title, tags, uploaded_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *
  `, [
    tenantId,
    newFilename,
    `Copy of ${media.original_filename}`,
    media.mime_type,
    media.file_size,
    'local',
    newStorageKey,
    media.storage_url.replace(media.filename, newFilename),
    media.width,
    media.height,
    media.folder,
    media.alt_text,
    media.caption,
    media.title ? `Copy of ${media.title}` : null,
    media.tags,
    req.user?.id
  ]);
  
  res.status(201).json(result.rows[0]);
}));

/**
 * GET /media/stats/summary
 * Get media library statistics
 */
router.get('/stats/summary', authenticate, requireStaff, asyncHandler(async (req, res) => {
  const tenantId = getTenantId(req);
  
  const result = await db.query(`
    SELECT
      COUNT(*) as total_files,
      SUM(file_size) as total_size,
      COUNT(*) FILTER (WHERE mime_type LIKE 'image/%') as image_count,
      COUNT(*) FILTER (WHERE mime_type NOT LIKE 'image/%') as document_count,
      COUNT(DISTINCT folder) as folder_count
    FROM media
    WHERE tenant_id = $1
  `, [tenantId]);
  
  const stats = result.rows[0];
  
  res.json({
    total_files: parseInt(stats.total_files) || 0,
    total_size: parseInt(stats.total_size) || 0,
    total_size_formatted: formatBytes(parseInt(stats.total_size) || 0),
    image_count: parseInt(stats.image_count) || 0,
    document_count: parseInt(stats.document_count) || 0,
    folder_count: parseInt(stats.folder_count) || 0
  });
}));

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = router;
