/**
 * Investigate revenue discrepancy - what's in 4010 and 4031?
 */
require('dotenv').config();
const db = require('../config/database');

async function investigate() {
  console.log('\n🔍 INVESTIGATING REVENUE DISCREPANCY\n');

  // Check 4010 Online Sales
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('ACCOUNT 4010 - Online Sales');
  console.log('Our balance: $31,747.27 | QB shows: $511.63');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const acc4010 = await db.query(`
    SELECT 
      je.entry_date,
      je.entry_number,
      LEFT(je.description, 40) as description,
      jel.debit,
      jel.credit
    FROM journal_entry_lines jel
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE ac.account_code = '4010'
      AND je.status = 'posted'
      AND je.entry_date >= '2025-01-01'
      AND je.entry_date <= '2025-12-31'
    ORDER BY jel.credit DESC
    LIMIT 30
  `);

  console.log('Top 30 transactions by credit amount:');
  console.log('Date       | Entry #     | Debit      | Credit     | Description');
  console.log('-----------|-------------|------------|------------|---------------------------');
  acc4010.rows.forEach(r => {
    console.log(`${r.entry_date.toISOString().split('T')[0]} | ${(r.entry_number||'').padEnd(11)} | $${parseFloat(r.debit||0).toFixed(2).padStart(8)} | $${parseFloat(r.credit||0).toFixed(2).padStart(8)} | ${r.description}`);
  });

  // Check 4031 Food Truck Sales
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('ACCOUNT 4031 - Food Truck Sales');
  console.log('Our balance: $837.00 | QB shows: $12.00');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const acc4031 = await db.query(`
    SELECT 
      je.entry_date,
      je.entry_number,
      LEFT(je.description, 40) as description,
      jel.debit,
      jel.credit
    FROM journal_entry_lines jel
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE ac.account_code = '4031'
      AND je.status = 'posted'
      AND je.entry_date >= '2025-01-01'
      AND je.entry_date <= '2025-12-31'
    ORDER BY je.entry_date
  `);

  console.log('All transactions:');
  console.log('Date       | Entry #     | Debit      | Credit     | Description');
  console.log('-----------|-------------|------------|------------|---------------------------');
  acc4031.rows.forEach(r => {
    console.log(`${r.entry_date.toISOString().split('T')[0]} | ${(r.entry_number||'').padEnd(11)} | $${parseFloat(r.debit||0).toFixed(2).padStart(8)} | $${parseFloat(r.credit||0).toFixed(2).padStart(8)} | ${r.description}`);
  });

  // Check if there are market location accounts still being counted somewhere
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('CHECKING: Are market accounts (4011-4022) still typed as revenue?');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const marketAccounts = await db.query(`
    SELECT account_code, name, account_type
    FROM accounts_chart
    WHERE account_code IN ('4011', '4012', '4013', '4014', '4015', '4016', '4017', '4018', '4019', '4020', '4021', '4022')
    ORDER BY account_code
  `);

  marketAccounts.rows.forEach(r => {
    console.log(`${r.account_code}: ${r.account_type.padEnd(10)} - ${r.name}`);
  });

  // Summary by month for 4010
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('4010 MONTHLY BREAKDOWN:');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const monthly = await db.query(`
    SELECT 
      TO_CHAR(je.entry_date, 'YYYY-MM') as month,
      SUM(jel.credit) as credits,
      SUM(jel.debit) as debits,
      SUM(jel.credit) - SUM(jel.debit) as net
    FROM journal_entry_lines jel
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE ac.account_code = '4010'
      AND je.status = 'posted'
      AND je.entry_date >= '2025-01-01'
      AND je.entry_date <= '2025-12-31'
    GROUP BY TO_CHAR(je.entry_date, 'YYYY-MM')
    ORDER BY month
  `);

  console.log('Month   | Credits      | Debits       | Net');
  console.log('--------|--------------|--------------|-------------');
  monthly.rows.forEach(r => {
    console.log(`${r.month}  | $${parseFloat(r.credits||0).toFixed(2).padStart(10)} | $${parseFloat(r.debits||0).toFixed(2).padStart(10)} | $${parseFloat(r.net||0).toFixed(2).padStart(10)}`);
  });

  await db.close();
}

investigate().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});