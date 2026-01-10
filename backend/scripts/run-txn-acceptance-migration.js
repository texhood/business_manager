/**
 * Run Transaction Acceptance Migration
 * 
 * Run with: node scripts/run-txn-acceptance-migration.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function runMigration() {
  console.log('\n🔧 RUNNING TRANSACTION ACCEPTANCE MIGRATION');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/add_transaction_acceptance.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolon and run each statement
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await db.query(statement);
          console.log('  ✅ Executed: ' + statement.trim().substring(0, 60) + '...');
        } catch (err) {
          // Ignore "already exists" errors
          if (err.message.includes('already exists') || err.message.includes('duplicate')) {
            console.log('  ⏭️  Skipped (already exists): ' + statement.trim().substring(0, 50) + '...');
          } else {
            console.error('  ❌ Error:', err.message);
          }
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ MIGRATION COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Show current transaction status counts
    const counts = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM transactions 
      GROUP BY status
    `);
    
    console.log('Transaction counts by status:');
    counts.rows.forEach(r => {
      console.log(`  ${(r.status || 'null').padEnd(12)}: ${r.count}`);
    });

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await db.close();
  }
}

runMigration();
