/**
 * Help Routes
 * Serves markdown documentation content for in-app help viewers.
 * Content is read from bundled .md files in backend/src/help/
 *
 * GET /help/:appSlug  → { data: { title, content, appSlug } }
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Directory containing help markdown files
const HELP_DIR = path.join(__dirname, '../help');

// Map appSlug → markdown filename and display title
const HELP_MAP = {
  'office':      { file: 'office.md',      title: 'Back Office' },
  'herds':       { file: 'herds.md',       title: 'Herds & Flocks' },
  'pos':         { file: 'pos.md',         title: 'POS Terminal' },
  'restaurant':  { file: 'restaurant.md',  title: 'Restaurant POS' },
  'kitchen':     { file: 'kitchen.md',     title: 'Kitchen Display' },
  'portal':      { file: 'portal.md',      title: 'Tenant Portal' },
  'ecommerce':   { file: 'ecommerce.md',   title: 'Online Store' },
  'site-builder': { file: 'site-builder.md', title: 'Site Builder' },
  'onboarding':  { file: 'onboarding.md',  title: 'System Administration' },
};

/**
 * GET /help/:appSlug
 * Returns the markdown content for the specified application.
 * No authentication required — help should be accessible to any logged-in user
 * and the frontend already sends its own auth header.
 */
router.get('/:appSlug', asyncHandler(async (req, res) => {
  const { appSlug } = req.params;

  const entry = HELP_MAP[appSlug];
  if (!entry) {
    return res.status(404).json({
      status: 'error',
      message: `No help content found for app: ${appSlug}`,
      available: Object.keys(HELP_MAP),
    });
  }

  const filePath = path.join(HELP_DIR, entry.file);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({
      status: 'success',
      data: {
        title: entry.title,
        content,
        appSlug,
      },
    });
  } catch (err) {
    logger.error(`Help file not found: ${filePath}`, err.message);
    return res.status(404).json({
      status: 'error',
      message: `Help content file missing for: ${appSlug}`,
    });
  }
}));

/**
 * GET /help
 * List all available help topics
 */
router.get('/', asyncHandler(async (req, res) => {
  const topics = Object.entries(HELP_MAP).map(([slug, entry]) => ({
    appSlug: slug,
    title: entry.title,
    url: `/api/v1/help/${slug}`,
  }));

  res.json({
    status: 'success',
    data: topics,
  });
}));

module.exports = router;
