/**
 * Diagnose Profit & Loss Discrepancy
 * Run with: node scripts/diagnose-pl.js
 */

require('dotenv').config();
const db = require('../config/database');

async function diagnose() {
  console.log('\n📊 P&L DIAGNOSTIC REPORT');
  console.log('========================\n');

  // Get date range (YTD 2024 - adjust as needed)
  const startDate = '2025-01-01';
  const endDate = '2025-12-31';
  
  console.log(`Date Range: ${startDate} to ${endDate}\n`);

  // 1. Summary by account type
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('1. TOTALS BY ACCOUNT TYPE');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const summaryResult = await db.query(`
    SELECT 
      ac.account_type,
      COUNT(DISTINCT ac.id) as account_count,
      SUM(jel.debit) as total_debits,
      SUM(jel.credit) as total_credits,
      CASE 
        WHEN ac.account_type = 'revenue' THEN SUM(jel.credit) - SUM(jel.debit)
        WHEN ac.account_type = 'expense' THEN SUM(jel.debit) - SUM(jel.credit)
        ELSE SUM(jel.debit) - SUM(jel.credit)
      END as net_balance
    FROM accounts_chart ac
    LEFT JOIN journal_entry_lines jel ON ac.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
      AND je.status = 'posted'
      AND je.entry_date >= $1
      AND je.entry_date <= $2
    WHERE ac.account_type IN ('revenue', 'expense')
    GROUP BY ac.account_type
    ORDER BY ac.account_type DESC
  `, [startDate, endDate]);

  let totalRevenue = 0;
  let totalExpenses = 0;

  summaryResult.rows.forEach(row => {
    console.log(`\n${row.account_type.toUpperCase()}`);
    console.log(`  Accounts: ${row.account_count}`);
    console.log(`  Total Debits:  $${parseFloat(row.total_debits || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}`);
    console.log(`  Total Credits: $${parseFloat(row.total_credits || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}`);
    console.log(`  Net Balance:   $${parseFloat(row.net_balance || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}`);
    
    if (row.account_type === 'revenue') totalRevenue = parseFloat(row.net_balance || 0);
    if (row.account_type === 'expense') totalExpenses = parseFloat(row.net_balance || 0);
  });

  console.log(`\n─────────────────────────────────────────`);
  console.log(`NET INCOME: $${(totalRevenue - totalExpenses).toLocaleString('en-US', {minimumFractionDigits: 2})}`);
  console.log(`─────────────────────────────────────────`);

  // 2. Check for unusual balances (revenue with debit balance, expense with credit balance)
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('2. ACCOUNTS WITH UNUSUAL BALANCES');
  console.log('   (Revenue with net debits or Expenses with net credits)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const unusualResult = await db.query(`
    SELECT 
      ac.account_code,
      ac.name,
      ac.account_type,
      SUM(jel.debit) as total_debits,
      SUM(jel.credit) as total_credits,
      SUM(jel.debit) - SUM(jel.credit) as net_debit
    FROM accounts_chart ac
    JOIN journal_entry_lines jel ON ac.id = jel.account_id
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    WHERE je.status = 'posted'
      AND je.entry_date >= $1
      AND je.entry_date <= $2
      AND ac.account_type IN ('revenue', 'expense')
    GROUP BY ac.id, ac.account_code, ac.name, ac.account_type
    HAVING (
      (ac.account_type = 'revenue' AND SUM(jel.debit) > SUM(jel.credit))
      OR
      (ac.account_type = 'expense' AND SUM(jel.credit) > SUM(jel.debit))
    )
    ORDER BY ABS(SUM(jel.debit) - SUM(jel.credit)) DESC
    LIMIT 20
  `, [startDate, endDate]);

  if (unusualResult.rows.length === 0) {
    console.log('  No unusual balances found.');
  } else {
    console.log('  Code       | Type    | Net Amount    | Account Name');
    console.log('  -----------|---------|---------------|----------------------------------');
    unusualResult.rows.forEach(row => {
      const net = parseFloat(row.net_debit || 0);
      console.log(`  ${row.account_code.padEnd(10)} | ${row.account_type.padEnd(7)} | ${net >= 0 ? ' ' : ''}$${net.toLocaleString('en-US', {minimumFractionDigits: 2}).padStart(12)} | ${row.name.substring(0, 35)}`);
    });
  }

  // 3. Top 20 revenue accounts
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('3. TOP 20 REVENUE ACCOUNTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const revenueResult = await db.query(`
    SELECT 
      ac.account_code,
      ac.name,
      SUM(jel.credit) - SUM(jel.debit) as balance
    FROM accounts_chart ac
    JOIN journal_entry_lines jel ON ac.id = jel.account_id
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    WHERE je.status = 'posted'
      AND je.entry_date >= $1
      AND je.entry_date <= $2
      AND ac.account_type = 'revenue'
    GROUP BY ac.id, ac.account_code, ac.name
    ORDER BY SUM(jel.credit) - SUM(jel.debit) DESC
    LIMIT 20
  `, [startDate, endDate]);

  console.log('  Code       | Balance        | Account Name');
  console.log('  -----------|----------------|----------------------------------');
  revenueResult.rows.forEach(row => {
    const bal = parseFloat(row.balance || 0);
    console.log(`  ${row.account_code.padEnd(10)} | $${bal.toLocaleString('en-US', {minimumFractionDigits: 2}).padStart(13)} | ${row.name.substring(0, 35)}`);
  });

  // 4. Top 20 expense accounts
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('4. TOP 20 EXPENSE ACCOUNTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const expenseResult = await db.query(`
    SELECT 
      ac.account_code,
      ac.name,
      SUM(jel.debit) - SUM(jel.credit) as balance
    FROM accounts_chart ac
    JOIN journal_entry_lines jel ON ac.id = jel.account_id
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    WHERE je.status = 'posted'
      AND je.entry_date >= $1
      AND je.entry_date <= $2
      AND ac.account_type = 'expense'
    GROUP BY ac.id, ac.account_code, ac.name
    ORDER BY SUM(jel.debit) - SUM(jel.credit) DESC
    LIMIT 20
  `, [startDate, endDate]);

  console.log('  Code       | Balance        | Account Name');
  console.log('  -----------|----------------|----------------------------------');
  expenseResult.rows.forEach(row => {
    const bal = parseFloat(row.balance || 0);
    console.log(`  ${row.account_code.padEnd(10)} | $${bal.toLocaleString('en-US', {minimumFractionDigits: 2}).padStart(13)} | ${row.name.substring(0, 35)}`);
  });

  // 5. Check for misclassified accounts (common revenue names in expense, etc.)
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('5. POTENTIALLY MISCLASSIFIED ACCOUNTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const misclassifiedResult = await db.query(`
    SELECT 
      ac.account_code,
      ac.name,
      ac.account_type,
      ac.account_subtype
    FROM accounts_chart ac
    WHERE 
      (ac.account_type = 'expense' AND (
        LOWER(ac.name) LIKE '%income%' OR 
        LOWER(ac.name) LIKE '%revenue%' OR 
        LOWER(ac.name) LIKE '%sales%'
      ))
      OR
      (ac.account_type = 'revenue' AND (
        LOWER(ac.name) LIKE '%expense%' OR 
        LOWER(ac.name) LIKE '%cost%'
      ))
      OR
      (ac.account_type NOT IN ('revenue', 'expense') AND (
        LOWER(ac.name) LIKE '%income%' OR 
        LOWER(ac.name) LIKE '%expense%'
      ))
    ORDER BY ac.account_type, ac.name
  `);

  if (misclassifiedResult.rows.length === 0) {
    console.log('  No obvious misclassifications found.');
  } else {
    console.log('  Code       | Type      | Account Name');
    console.log('  -----------|-----------|----------------------------------');
    misclassifiedResult.rows.forEach(row => {
      console.log(`  ${row.account_code.padEnd(10)} | ${row.account_type.padEnd(9)} | ${row.name.substring(0, 40)}`);
    });
  }

  // 6. Count entries by source
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('6. JOURNAL ENTRIES BY SOURCE TYPE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const sourceResult = await db.query(`
    SELECT 
      COALESCE(source_type, 'unknown') as source,
      COUNT(*) as entry_count,
      SUM(total_debit) as total_amount
    FROM journal_entries
    WHERE status = 'posted'
      AND entry_date >= $1
      AND entry_date <= $2
    GROUP BY source_type
    ORDER BY COUNT(*) DESC
  `, [startDate, endDate]);

  console.log('  Source          | Entries | Total Debits');
  console.log('  ----------------|---------|------------------');
  sourceResult.rows.forEach(row => {
    console.log(`  ${(row.source || 'unknown').padEnd(15)} | ${row.entry_count.toString().padStart(7)} | $${parseFloat(row.total_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}`);
  });

  // 7. Check for duplicate entries
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('7. POTENTIAL DUPLICATE ENTRIES (same date, amount, description)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const dupeResult = await db.query(`
    SELECT 
      entry_date,
      total_debit,
      LEFT(description, 50) as description,
      COUNT(*) as occurrences
    FROM journal_entries
    WHERE status = 'posted'
      AND entry_date >= $1
      AND entry_date <= $2
    GROUP BY entry_date, total_debit, LEFT(description, 50)
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC, total_debit DESC
    LIMIT 15
  `, [startDate, endDate]);

  if (dupeResult.rows.length === 0) {
    console.log('  No obvious duplicates found.');
  } else {
    console.log('  Date       | Amount         | Count | Description');
    console.log('  -----------|----------------|-------|----------------------------------');
    dupeResult.rows.forEach(row => {
      console.log(`  ${row.entry_date.toISOString().split('T')[0]} | $${parseFloat(row.total_debit || 0).toLocaleString('en-US', {minimumFractionDigits: 2}).padStart(12)} | ${row.occurrences.toString().padStart(5)} | ${(row.description || '').substring(0, 30)}`);
    });
  }

  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('DIAGNOSTIC COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  await db.close();
}

diagnose().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});