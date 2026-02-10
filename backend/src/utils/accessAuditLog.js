/**
 * Access Audit Logger
 * Centralized utility for logging all access-related changes to the
 * account_access_log table. Used by accounts, auth, and twoFactor routes
 * to create a compliance-ready audit trail.
 *
 * Supported actions:
 *   account_created, account_deactivated, account_reactivated,
 *   account_deleted, role_changed, password_changed,
 *   password_reset_by_admin, 2fa_enabled, 2fa_disabled,
 *   login_success, login_failed
 */

const db = require('../../config/database');
const logger = require('./logger');

/**
 * Log an access-related event to the audit trail.
 *
 * @param {Object} params
 * @param {string}      params.action           - Action type (see list above)
 * @param {Object}      [params.target]         - The affected account { id, email, name }
 * @param {Object}      [params.performedBy]    - The acting user { id, email, name }
 * @param {string|null} [params.tenantId]       - Tenant UUID
 * @param {Object}      [params.details]        - Additional context (e.g. { oldRole, newRole })
 * @param {Object}      [params.req]            - Express request (for IP / user-agent)
 */
async function logAccessEvent({
  action,
  target = {},
  performedBy = {},
  tenantId = null,
  details = {},
  req = null,
}) {
  try {
    const ipAddress = req
      ? req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip
      : null;
    const userAgent = req ? req.headers['user-agent'] : null;

    await db.query(
      `INSERT INTO account_access_log
        (tenant_id, action, target_account_id, target_email, target_name,
         performed_by_id, performed_by_email, performed_by_name,
         details, ip_address, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        tenantId,
        action,
        target.id || null,
        target.email || null,
        target.name || null,
        performedBy.id || null,
        performedBy.email || null,
        performedBy.name || null,
        JSON.stringify(details),
        ipAddress,
        userAgent,
      ]
    );
  } catch (err) {
    // Audit logging should never break the primary operation.
    // Log the failure but do not propagate it.
    logger.error('Failed to write access audit log', {
      action,
      targetId: target.id,
      error: err.message,
    });
  }
}

module.exports = { logAccessEvent };
