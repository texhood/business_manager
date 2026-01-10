/**
 * Database Configuration
 * PostgreSQL connection pool setup
 */

const { Pool } = require('pg');
const logger = require('../src/utils/logger');

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'business_manager',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection not established
};

// Use DATABASE_URL if provided (for production/Heroku)
const pool = process.env.DATABASE_URL 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    })
  : new Pool(dbConfig);

// Log pool errors
pool.on('error', (err) => {
  logger.error('Unexpected database pool error:', err);
});

// Log successful connection
pool.on('connect', () => {
  logger.debug('New database connection established');
});

/**
 * Query helper with automatic client release
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text: text.substring(0, 100), duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Database query error:', { text: text.substring(0, 100), error: error.message });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 */
const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const originalRelease = client.release.bind(client);
  
  // Timeout to auto-release if forgotten
  const timeout = setTimeout(() => {
    logger.error('Client has been checked out for too long, releasing');
    client.release();
  }, 30000);
  
  client.query = (...args) => originalQuery(...args);
  client.release = () => {
    clearTimeout(timeout);
    return originalRelease();
  };
  
  return client;
};

/**
 * Transaction helper
 */
const transaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Health check
 */
const healthCheck = async () => {
  try {
    const result = await query('SELECT NOW()');
    return { status: 'healthy', timestamp: result.rows[0].now };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};

/**
 * Graceful shutdown
 */
const close = async () => {
  logger.info('Closing database connection pool');
  await pool.end();
};

module.exports = {
  pool,
  query,
  getClient,
  transaction,
  healthCheck,
  close,
};