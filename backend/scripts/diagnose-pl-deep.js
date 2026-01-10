/**
 * Deep Revenue/Expense Analysis
 * Run with: node scripts/diagnose-pl-deep.js
 */

require('dotenv').config();
const db = require('../config/database');

async function diagnose() {
  console.log('\n📊 DEEP P&L ANALYSIS');
  console.log('====================\n');

  const startDate = '2025-01-01';
  const endDate = '2025-12-31';
  
  console.log(`Date Range: ${startDate} to ${endDate}\n`);

  // 1. ALL Revenue accounts with balances
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('1. ALL REVENUE ACCOUNTS (with any activity)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const allRevenueResult = await db.query(`
    SELECT 
      ac.account_code,
      ac.name,
      ac.account_subtype,
      COALESCE(SUM(jel.debit), 0) as total_debits,
      COALESCE(SUM(jel.credit), 0) as total_credits,
      COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0) as balance
    FROM accounts_chart ac
    LEFT JOIN journal_entry_lines jel ON ac.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
      AND je.status = 'posted'
      AND je.entry_date >= $1
      AND je.entry_date <= $2
    WHERE ac.account_type = 'revenue'
    GROUP BY ac.id, ac.account_code, ac.name, ac.account_subtype
    HAVING COALESCE(SUM(jel.debit), 0) > 0 OR COALESCE(SUM(jel.credit), 0) > 0
    ORDER BY COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0) DESC
  `, [startDate, endDate]);

  let revenueTotal = 0;
  console.log('  Code       | Debits       | Credits      | Net Balance   | Account Name');
  console.log('  -----------|--------------|--------------|---------------|----------------------------------');
  allRevenueResult.rows.forEach(row => {
    const bal = parseFloat(row.balance || 0);
    revenueTotal += bal;
    console.log(`  ${(row.account_code || '').padEnd(10)} | $${parseFloat(row.total_debits).toFixed(2).padStart(10)} | $${parseFloat(row.total_credits).toFixed(2).padStart(10)} | $${bal.toFixed(2).padStart(11)} | ${(row.name || '').substring(0, 35)}`);
  });
  console.log('  -----------|--------------|--------------|---------------|----------------------------------');
  console.log(`  TOTAL REVENUE: $${revenueTotal.toFixed(2)}`);
  console.log(`  Account count: ${allRevenueResult.rows.length}`);

  // 2. Check for accounts that look like bank/asset accounts but are typed as revenue
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('2. REVENUE ACCOUNTS THAT LOOK SUSPICIOUS');
  console.log('   (Names suggesting bank, checking, asset, transfer, etc.)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const suspiciousRevenueResult = await db.query(`
    SELECT 
      ac.account_code,
      ac.name,
      ac.account_subtype,
      COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0) as balance
    FROM accounts_chart ac
    LEFT JOIN journal_entry_lines jel ON ac.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
      AND je.status = 'posted'
      AND je.entry_date >= $1
      AND je.entry_date <= $2
    WHERE ac.account_type = 'revenue'
      AND (
        LOWER(ac.name) LIKE '%bank%' OR
        LOWER(ac.name) LIKE '%checking%' OR
        LOWER(ac.name) LIKE '%savings%' OR
        LOWER(ac.name) LIKE '%transfer%' OR
        LOWER(ac.name) LIKE '%clearing%' OR
        LOWER(ac.name) LIKE '%asset%' OR
        LOWER(ac.name) LIKE '%card%' OR
        LOWER(ac.name) LIKE '%loan%' OR
        LOWER(ac.name) LIKE '%payable%' OR
        LOWER(ac.name) LIKE '%receivable%' OR
        LOWER(ac.name) LIKE '%contribution%' OR
        LOWER(ac.name) LIKE '%distribution%' OR
        LOWER(ac.name) LIKE '%equity%' OR
        LOWER(ac.name) LIKE '%capital%' OR
        LOWER(ac.name) LIKE '%deposit%' OR
        LOWER(ac.name) LIKE '%4010%' OR
        LOWER(ac.account_code) LIKE '1.%' OR
        LOWER(ac.account_code) LIKE '2.%' OR
        LOWER(ac.account_code) LIKE '3.%' OR
        LOWER(ac.account_code) LIKE '5.%'
      )
    GROUP BY ac.id, ac.account_code, ac.name, ac.account_subtype
    HAVING COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0) != 0
    ORDER BY ABS(COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)) DESC
  `, [startDate, endDate]);

  if (suspiciousRevenueResult.rows.length === 0) {
    console.log('  No suspicious revenue accounts found.');
  } else {
    console.log('  Code       | Balance        | Account Name');
    console.log('  -----------|----------------|----------------------------------');
    suspiciousRevenueResult.rows.forEach(row => {
      console.log(`  ${(row.account_code || '').padEnd(10)} | $${parseFloat(row.balance).toFixed(2).padStart(12)} | ${row.name}`);
    });
  }

  // 3. Revenue accounts with subtype that doesn't look like revenue
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('3. REVENUE ACCOUNTS BY SUBTYPE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const subtypeResult = await db.query(`
    SELECT 
      ac.account_subtype,
      COUNT(DISTINCT ac.id) as account_count,
      SUM(COALESCE(totals.balance, 0)) as total_balance
    FROM accounts_chart ac
    LEFT JOIN (
      SELECT 
        jel.account_id,
        SUM(jel.credit) - SUM(jel.debit) as balance
      FROM journal_entry_lines jel
      JOIN journal_entries je ON jel.journal_entry_id = je.id
      WHERE je.status = 'posted'
        AND je.entry_date >= $1
        AND je.entry_date <= $2
      GROUP BY jel.account_id
    ) totals ON ac.id = totals.account_id
    WHERE ac.account_type = 'revenue'
    GROUP BY ac.account_subtype
    ORDER BY SUM(COALESCE(totals.balance, 0)) DESC
  `, [startDate, endDate]);

  console.log('  Subtype                    | Accounts | Total Balance');
  console.log('  ---------------------------|----------|------------------');
  subtypeResult.rows.forEach(row => {
    console.log(`  ${(row.account_subtype || 'null').padEnd(26)} | ${row.account_count.toString().padStart(8)} | $${parseFloat(row.total_balance || 0).toFixed(2)}`);
  });

  // 4. Large individual journal entries affecting revenue
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('4. LARGEST REVENUE CREDITS (individual transactions)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const largeCreditsResult = await db.query(`
    SELECT 
      je.entry_date,
      je.entry_number,
      ac.account_code,
      ac.name as account_name,
      jel.credit,
      LEFT(je.description, 40) as description
    FROM journal_entry_lines jel
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE je.status = 'posted'
      AND je.entry_date >= $1
      AND je.entry_date <= $2
      AND ac.account_type = 'revenue'
      AND jel.credit > 0
    ORDER BY jel.credit DESC
    LIMIT 25
  `, [startDate, endDate]);

  console.log('  Date       | Entry #     | Amount       | Account                | Description');
  console.log('  -----------|-------------|--------------|------------------------|------------------');
  largeCreditsResult.rows.forEach(row => {
    console.log(`  ${row.entry_date.toISOString().split('T')[0]} | ${(row.entry_number || '').substring(0, 11).padEnd(11)} | $${parseFloat(row.credit).toFixed(2).padStart(10)} | ${(row.account_name || '').substring(0, 22).padEnd(22)} | ${(row.description || '').substring(0, 20)}`);
  });

  // 5. What's in account_type breakdown
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('5. ALL ACCOUNT TYPES - COUNT AND TOTALS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const allTypesResult = await db.query(`
    SELECT 
      ac.account_type,
      COUNT(DISTINCT ac.id) as account_count,
      COALESCE(SUM(jel.debit), 0) as total_debits,
      COALESCE(SUM(jel.credit), 0) as total_credits
    FROM accounts_chart ac
    LEFT JOIN journal_entry_lines jel ON ac.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
      AND je.status = 'posted'
      AND je.entry_date >= $1
      AND je.entry_date <= $2
    GROUP BY ac.account_type
    ORDER BY ac.account_type
  `, [startDate, endDate]);

  console.log('  Type       | Accounts | Total Debits     | Total Credits');
  console.log('  -----------|----------|------------------|------------------');
  allTypesResult.rows.forEach(row => {
    console.log(`  ${(row.account_type || 'null').padEnd(10)} | ${row.account_count.toString().padStart(8)} | $${parseFloat(row.total_debits || 0).toFixed(2).padStart(14)} | $${parseFloat(row.total_credits || 0).toFixed(2).padStart(14)}`);
  });

  // 6. Accounts with code patterns that suggest they're in wrong category
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('6. ACCOUNTS WITH QB CODES POSSIBLY IN WRONG CATEGORY');
  console.log('   (Codes starting with 1-3 usually assets, 4 revenue, 5-6-7 expense)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const wrongCodeResult = await db.query(`
    SELECT 
      ac.account_code,
      ac.name,
      ac.account_type,
      COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0) as net_debit
    FROM accounts_chart ac
    LEFT JOIN journal_entry_lines jel ON ac.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
      AND je.status = 'posted'
      AND je.entry_date >= $1
      AND je.entry_date <= $2
    WHERE 
      (ac.account_type = 'revenue' AND ac.account_code NOT LIKE '4%' AND ac.account_code NOT LIKE '9%')
      OR
      (ac.account_type = 'expense' AND ac.account_code LIKE '4%')
      OR
      (ac.account_type IN ('asset', 'liability', 'equity') AND ac.account_code LIKE '4%')
    GROUP BY ac.id, ac.account_code, ac.name, ac.account_type
    HAVING COALESCE(SUM(jel.debit), 0) != 0 OR COALESCE(SUM(jel.credit), 0) != 0
    ORDER BY ABS(COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0)) DESC
  `, [startDate, endDate]);

  if (wrongCodeResult.rows.length === 0) {
    console.log('  No mismatched code/type accounts found.');
  } else {
    console.log('  Code       | Type      | Net Debit      | Account Name');
    console.log('  -----------|-----------|----------------|----------------------------------');
    wrongCodeResult.rows.forEach(row => {
      console.log(`  ${(row.account_code || '').padEnd(10)} | ${row.account_type.padEnd(9)} | $${parseFloat(row.net_debit || 0).toFixed(2).padStart(12)} | ${(row.name || '').substring(0, 35)}`);
    });
  }

  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('DEEP ANALYSIS COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  await db.close();
}

diagnose().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});