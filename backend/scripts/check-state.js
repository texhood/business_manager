/**
 * Quick diagnostic - what's the current state?
 */
require('dotenv').config();
const db = require('../config/database');

async function check() {
  console.log('\n📊 CURRENT DATABASE STATE\n');

  // All revenue accounts with balances
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('ALL ACCOUNTS TYPED AS REVENUE:');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const rev = await db.query(`
    SELECT ac.account_code, ac.name,
      COALESCE(SUM(jel.credit), 0) as credits,
      COALESCE(SUM(jel.debit), 0) as debits,
      COALESCE(SUM(jel.credit) - SUM(jel.debit), 0) as balance
    FROM accounts_chart ac
    LEFT JOIN journal_entry_lines jel ON ac.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
      AND je.status = 'posted'
      AND je.entry_date >= '2025-01-01' AND je.entry_date <= '2025-12-31'
    WHERE ac.account_type = 'revenue'
    GROUP BY ac.id, ac.account_code, ac.name
    ORDER BY ac.account_code
  `);

  let revTotal = 0;
  console.log('Code       | Credits      | Debits       | Balance      | Name');
  console.log('-----------|--------------|--------------|--------------|------------------');
  rev.rows.forEach(r => {
    const bal = parseFloat(r.balance) || 0;
    revTotal += bal;
    console.log(`${(r.account_code||'').padEnd(10)} | $${parseFloat(r.credits).toFixed(2).padStart(10)} | $${parseFloat(r.debits).toFixed(2).padStart(10)} | $${bal.toFixed(2).padStart(10)} | ${(r.name||'').substring(0,25)}`);
  });
  console.log(`\nTOTAL REVENUE: $${revTotal.toFixed(2)}`);
  console.log(`QB P&L SHOWS:  $81,707.22`);
  console.log(`DIFFERENCE:    $${(revTotal - 81707.22).toFixed(2)}`);

  // All expense accounts with balances
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('EXPENSE ACCOUNTS WITH BALANCES (top 25):');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const exp = await db.query(`
    SELECT ac.account_code, ac.name,
      COALESCE(SUM(jel.debit) - SUM(jel.credit), 0) as balance
    FROM accounts_chart ac
    LEFT JOIN journal_entry_lines jel ON ac.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
      AND je.status = 'posted'
      AND je.entry_date >= '2025-01-01' AND je.entry_date <= '2025-12-31'
    WHERE ac.account_type = 'expense'
    GROUP BY ac.id, ac.account_code, ac.name
    HAVING COALESCE(SUM(jel.debit) - SUM(jel.credit), 0) != 0
    ORDER BY COALESCE(SUM(jel.debit) - SUM(jel.credit), 0) DESC
    LIMIT 25
  `);

  let expTotal = 0;
  exp.rows.forEach(r => {
    const bal = parseFloat(r.balance) || 0;
    expTotal += bal;
    console.log(`${(r.account_code||'').padEnd(10)} $${bal.toFixed(2).padStart(12)}  ${(r.name||'').substring(0,35)}`);
  });

  // Get full expense total
  const expFull = await db.query(`
    SELECT COALESCE(SUM(jel.debit) - SUM(jel.credit), 0) as total
    FROM journal_entry_lines jel
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE ac.account_type = 'expense'
      AND je.status = 'posted'
      AND je.entry_date >= '2025-01-01' AND je.entry_date <= '2025-12-31'
  `);
  const expFullTotal = parseFloat(expFull.rows[0]?.total || 0);

  console.log(`\nTOTAL EXPENSES: $${expFullTotal.toFixed(2)}`);
  console.log(`QB P&L SHOWS:   $99,631.40`);
  console.log(`DIFFERENCE:     $${(expFullTotal - 99631.40).toFixed(2)}`);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('NET INCOME COMPARISON:');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`OUR NET INCOME: $${(revTotal - expFullTotal).toFixed(2)}`);
  console.log(`QB NET INCOME:  $-17,922.84`);

  await db.close();
}

check().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});