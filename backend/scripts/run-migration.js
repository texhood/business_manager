/**
 * Run specific migration file
 * Usage: node scripts/run-migration.js <migration-filename>
 * Example: node scripts/run-migration.js 033_add_tenant_to_accounting.sql
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Get migration filename from command line
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node scripts/run-migration.js <migration-filename>');
  console.error('Example: node scripts/run-migration.js 033_add_tenant_to_accounting.sql');
  process.exit(1);
}

// Database configuration
const pool = process.env.DATABASE_URL 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME || 'business_manager',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
    });

async function runMigration() {
  const client = await pool.connect();
  
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`Migration file not found: ${migrationPath}`);
      process.exit(1);
    }
    
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`Running migration: ${migrationFile}`);
    console.log('='.repeat(60));
    
    await client.query('BEGIN');
    
    // Execute the migration
    await client.query(sql);
    
    await client.query('COMMIT');
    
    console.log('='.repeat(60));
    console.log(`✅ Migration completed successfully: ${migrationFile}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
