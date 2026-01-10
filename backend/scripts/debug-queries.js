/**
 * Debug: Check for duplicate accounts and query differences
 */
require('dotenv').config();
const db = require('../config/database');

async function debug() {
  console.log('\n🔍 DEBUGGING QUERY DISCREPANCY\n');

  // Check for duplicate account codes
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('1. CHECKING FOR DUPLICATE ACCOUNT CODES:');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const dupes = await db.query(`
    SELECT account_code, COUNT(*) as count
    FROM accounts_chart
    GROUP BY account_code
    HAVING COUNT(*) > 1
  `);

  if (dupes.rows.length === 0) {
    console.log('  No duplicate account codes found.');
  } else {
    console.log('  DUPLICATES FOUND:');
    dupes.rows.forEach(r => console.log(`  ${r.account_code}: ${r.count} copies`));
  }

  // Check what the Income Statement API would return
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('2. INCOME STATEMENT QUERY (exact query from API):');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const startDate = '2025-01-01';
  const endDate = '2025-12-31';

  const incomeStmt = await db.query(`
    SELECT 
      ac.id as account_id,
      ac.account_code,
      ac.name as account_name,
      ac.account_type,
      CASE 
        WHEN ac.account_type = 'revenue' THEN COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)
        WHEN ac.account_type = 'expense' THEN COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0)
        ELSE 0
      END AS balance
    FROM accounts_chart ac
    LEFT JOIN journal_entry_lines jel ON ac.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id 
      AND je.status = 'posted'
      AND je.entry_date >= $1 
      AND je.entry_date <= $2
    WHERE ac.account_type IN ('revenue', 'expense')
    GROUP BY ac.id, ac.account_code, ac.name, ac.account_type
    HAVING COALESCE(SUM(jel.debit), 0) != 0 OR COALESCE(SUM(jel.credit), 0) != 0
    ORDER BY ac.account_type DESC, ac.account_code
  `, [startDate, endDate]);

  console.log('REVENUE ACCOUNTS:');
  let revTotal = 0;
  incomeStmt.rows.filter(r => r.account_type === 'revenue').forEach(r => {
    const bal = parseFloat(r.balance);
    revTotal += bal;
    console.log(`  ${(r.account_code||'').padEnd(10)} $${bal.toFixed(2).padStart(12)}  ${r.account_name}`);
  });
  console.log(`  TOTAL: $${revTotal.toFixed(2)}`);

  // Now let's check: what accounts have transactions but are typed as 'asset'?
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('3. ASSET ACCOUNTS WITH CREDITS (potential misclassified revenue):');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const assetCredits = await db.query(`
    SELECT 
      ac.account_code,
      ac.name,
      COALESCE(SUM(jel.credit), 0) as total_credits,
      COALESCE(SUM(jel.debit), 0) as total_debits
    FROM accounts_chart ac
    LEFT JOIN journal_entry_lines jel ON ac.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id 
      AND je.status = 'posted'
      AND je.entry_date >= $1 
      AND je.entry_date <= $2
    WHERE ac.account_type = 'asset'
      AND ac.account_code LIKE '4%'
    GROUP BY ac.id, ac.account_code, ac.name
    HAVING COALESCE(SUM(jel.credit), 0) > 0
    ORDER BY COALESCE(SUM(jel.credit), 0) DESC
    LIMIT 20
  `, [startDate, endDate]);

  console.log('4xxx accounts typed as ASSET with credits:');
  assetCredits.rows.forEach(r => {
    console.log(`  ${(r.account_code||'').padEnd(10)} Credits: $${parseFloat(r.total_credits).toFixed(2).padStart(10)} | Debits: $${parseFloat(r.total_debits).toFixed(2).padStart(10)} | ${r.name}`);
  });

  // Check if there are orphaned journal entry lines
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('4. JOURNAL ENTRY LINES BY ACCOUNT TYPE:');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const jelByType = await db.query(`
    SELECT 
      ac.account_type,
      COUNT(*) as line_count,
      SUM(jel.debit) as total_debits,
      SUM(jel.credit) as total_credits
    FROM journal_entry_lines jel
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE je.status = 'posted'
      AND je.entry_date >= $1 
      AND je.entry_date <= $2
    GROUP BY ac.account_type
    ORDER BY ac.account_type
  `, [startDate, endDate]);

  console.log('Type       | Lines    | Total Debits     | Total Credits');
  console.log('-----------|----------|------------------|------------------');
  jelByType.rows.forEach(r => {
    console.log(`${(r.account_type||'').padEnd(10)} | ${r.line_count.toString().padStart(8)} | $${parseFloat(r.total_debits||0).toFixed(2).padStart(14)} | $${parseFloat(r.total_credits||0).toFixed(2).padStart(14)}`);
  });

  // Show exactly what's in 4010 by ID
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('5. ACCOUNT 4010 DETAILS:');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const acc4010 = await db.query(`
    SELECT id, account_code, name, account_type, account_subtype
    FROM accounts_chart
    WHERE account_code = '4010'
  `);

  acc4010.rows.forEach(r => {
    console.log(`ID: ${r.id} | Code: ${r.account_code} | Type: ${r.account_type} | Name: ${r.name}`);
  });

  if (acc4010.rows.length > 0) {
    const accId = acc4010.rows[0].id;
    const jelFor4010 = await db.query(`
      SELECT 
        SUM(jel.credit) as total_credits,
        SUM(jel.debit) as total_debits,
        COUNT(*) as line_count
      FROM journal_entry_lines jel
      JOIN journal_entries je ON jel.journal_entry_id = je.id
      WHERE jel.account_id = $1
        AND je.status = 'posted'
        AND je.entry_date >= $2 
        AND je.entry_date <= $3
    `, [accId, startDate, endDate]);

    console.log(`\nJournal entries for account ID ${accId}:`);
    console.log(`  Lines: ${jelFor4010.rows[0].line_count}`);
    console.log(`  Total Credits: $${parseFloat(jelFor4010.rows[0].total_credits||0).toFixed(2)}`);
    console.log(`  Total Debits: $${parseFloat(jelFor4010.rows[0].total_debits||0).toFixed(2)}`);
  }

  await db.close();
}

debug().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});