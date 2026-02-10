/**
 * Database Migration Utility
 * Run SQL migration files against the database
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const migrationsDir = path.join(__dirname, '../../migrations');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'hoodfamilyfarms',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function createMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getExecutedMigrations() {
  const result = await pool.query('SELECT name FROM _migrations ORDER BY id');
  return result.rows.map(row => row.name);
}

async function markMigrationExecuted(name) {
  await pool.query('INSERT INTO _migrations (name) VALUES ($1)', [name]);
}

async function runMigrations() {
  console.log('🌱 Business Manager - Database Migration\n');

  try {
    // Create migrations tracking table
    await createMigrationsTable();
    console.log('✓ Migrations table ready\n');

    // Get list of migration files
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No migration files found in', migrationsDir);
      return;
    }

    // Get already executed migrations
    const executed = await getExecutedMigrations();
    console.log(`Found ${files.length} migration file(s), ${executed.length} already executed\n`);

    // Run pending migrations
    let pendingCount = 0;
    for (const file of files) {
      if (executed.includes(file)) {
        console.log(`⏭  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`▶  Running ${file}...`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await pool.query(sql);
        await markMigrationExecuted(file);
        console.log(`✓  Completed ${file}\n`);
        pendingCount++;
      } catch (error) {
        console.error(`✗  Failed ${file}:`);
        console.error(error.message);
        throw error;
      }
    }

    if (pendingCount === 0) {
      console.log('\n✓ Database is up to date');
    } else {
      console.log(`\n✓ Successfully ran ${pendingCount} migration(s)`);
    }

  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
runMigrations();
