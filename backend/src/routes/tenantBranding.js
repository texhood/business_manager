/**
 * Public Tenant Branding Route
 * Returns basic branding info (color, name, favicon) without requiring auth.
 * This allows all frontend apps to show tenant branding on login screens,
 * public pages, and browser tabs.
 *
 * GET /api/v1/tenant-branding/:slug
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ error: 'Tenant slug is required' });
    }

    // Fetch tenant info + settings in one query
    // Adjust column names below if your schema differs
    const result = await pool.query(
      `SELECT
         t.id,
         t.name,
         t.slug,
         ts.business_name,
         ts.primary_color,
         ts.secondary_color,
         ts.tagline
       FROM tenants t
       LEFT JOIN tenant_settings ts ON ts.tenant_id = t.id
       WHERE t.slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const tenant = result.rows[0];

    // Check for branding assets (logo, favicon)
    const assets = await pool.query(
      `SELECT asset_type, mime_type
       FROM tenant_assets
       WHERE tenant_id = $1 AND asset_type IN ('logo', 'favicon')`,
      [tenant.id]
    );

    const assetMap = {};
    assets.rows.forEach(a => {
      assetMap[a.asset_type] = `/tenant-assets/${slug}/${a.asset_type}`;
    });

    res.json({
      data: {
        name: tenant.name,
        slug: tenant.slug,
        business_name: tenant.business_name || tenant.name,
        primary_color: tenant.primary_color,
        secondary_color: tenant.secondary_color,
        tagline: tenant.tagline,
        logo_url: assetMap.logo || null,
        favicon_url: assetMap.favicon || null,
      }
    });
  } catch (err) {
    console.error('Error fetching tenant branding:', err);
    res.status(500).json({ error: 'Failed to fetch branding' });
  }
});

module.exports = router;