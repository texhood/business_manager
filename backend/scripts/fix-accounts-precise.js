/**
 * PRECISE FIX - Based on exact QB Profit & Loss export
 * 
 * This script sets account types based ONLY on what appears in the QB P&L.
 * Everything else gets set to asset/liability/equity based on code patterns.
 * 
 * Run with: node scripts/fix-accounts-precise.js
 */

require('dotenv').config();
const db = require('../config/database');

async function preciseFix() {
  console.log('\n🔧 PRECISE ACCOUNT FIX');
  console.log('======================\n');

  // EXACT accounts from QB Profit & Loss export (with their balances for verification)
  // These are the ONLY accounts that should appear on P&L
  
  const qbRevenueAccounts = [
    // From "Income" section of QB P&L
    { code: '4026', name: 'Beef Sales', qb_amount: 5417.00 },
    { code: '4028', name: 'Egg Sales', qb_amount: 6676.00 },
    { code: '4031', name: 'Food Truck Sales', qb_amount: 12.00 },
    { code: '4027', name: 'Lamb Sales', qb_amount: 2410.00 },
    { code: '4029', name: 'Meat Hen Sales', qb_amount: 17619.50 },
    { code: '4003', name: 'Other Sales', qb_amount: 1083.00 },
    { code: '4002', name: 'VAP Sales', qb_amount: 12243.00 },
    { code: '4010', name: 'Online Sales', qb_amount: 511.63 },
    { code: '4100', name: 'Sales of Product Income', qb_amount: 35735.09 },
    // From "Other Income" section
    { code: '9100', name: 'Interest Earned', qb_amount: 1.34 },
  ];

  const qbExpenseAccounts = [
    // COGS section
    { code: '6011', name: 'Feed Purchase', qb_amount: 15135.72 },
    { code: '6012', name: 'Animal inputs', qb_amount: 1453.78 },
    { code: '6021', name: 'Animal Processing', qb_amount: 6321.93 },
    { code: '6022', name: 'Seed & Plants', qb_amount: 163.48 },
    { code: '6023', name: 'Inputs (fertilizer, etc)', qb_amount: 399.52 },
    { code: '6024', name: 'Animal Purchases', qb_amount: 1304.00 },
    { code: '6040', name: 'Packaging', qb_amount: 3027.32 },
    { code: '6051', name: 'Items for Resale', qb_amount: 84.85 },
    { code: '5012', name: 'COGS Animal Inputs', qb_amount: 3861.00 },
    // Expenses section
    { code: '1.39.2', name: 'Sheep Processing', qb_amount: 1297.50 },
    { code: '1.39.3', name: 'Chicken Processing', qb_amount: 2038.33 },
    { code: '6030', name: 'Farm Repairs & Maintenance', qb_amount: 28.13 },
    { code: '6032', name: 'Machinery & Equipment', qb_amount: 4297.09 },
    { code: '6033', name: 'Building & Improvements', qb_amount: 930.13 },
    { code: '6050', name: 'Supplies and Materials', qb_amount: 11962.66 },
    { code: '6060', name: 'Rents or Leases', qb_amount: 2300.00 },
    { code: '6065', name: 'Gasoline, Fuel, & Oil', qb_amount: 5883.10 },
    { code: '6070', name: 'Vehicles, Machinery, & Equipment', qb_amount: 4309.78 },
    { code: '6200', name: 'Car and Truck Expense', qb_amount: 15.00 },
    { code: '6320', name: 'Vehicles', qb_amount: 162.00 },
    { code: '6340', name: 'Labor (Contract)', qb_amount: 9426.33 },
    { code: '6350', name: 'Veterinary, Breeding and Medicine', qb_amount: 241.79 },
    { code: '6510', name: 'Market expenses/fees', qb_amount: -248.86 },
    { code: '7000', name: 'General Expenses', qb_amount: 49.65 },
    { code: '7040', name: 'Legal, Accounting and Professional', qb_amount: 6556.19 },
    { code: '7050', name: 'Dues & Subscriptions', qb_amount: 298.79 },
    { code: '7060', name: 'Commissions & fees', qb_amount: 2049.20 },
    { code: '7070', name: 'Travel', qb_amount: 1601.03 },
    { code: '7071', name: 'Meals & Entertainment', qb_amount: 372.24 },
    { code: '7080', name: 'Postage & Print', qb_amount: 216.70 },
    { code: '7100', name: 'Merchant Fees', qb_amount: 1785.20 },
    { code: '7150', name: 'Advertising and Marketing', qb_amount: 433.35 },
    { code: '7300', name: 'Office Expenses', qb_amount: 318.96 },
    { code: '7310', name: 'IT, Software and Website', qb_amount: 1082.48 },
    { code: '7370', name: 'Interest Expense', qb_amount: 4845.28 },
    { code: '7010', name: 'Bank Fees & Service Charges', qb_amount: 33.24 },
    { code: '7160', name: 'Insurance', qb_amount: 2505.00 },
    { code: '9002', name: 'Uncategorized Expense', qb_amount: 2263.62 },
  ];

  const revenueCodes = qbRevenueAccounts.map(a => a.code);
  const expenseCodes = qbExpenseAccounts.map(a => a.code);

  // STEP 1: Set ALL accounts to asset first (clean slate)
  console.log('STEP 1: Reset all accounts to asset (clean slate)...');
  await db.query(`
    UPDATE accounts_chart 
    SET account_type = 'asset', 
        account_subtype = 'other_asset',
        normal_balance = 'debit'
  `);
  console.log('  ✅ All accounts reset to asset\n');

  // STEP 2: Set revenue accounts
  console.log('STEP 2: Set revenue accounts (from QB P&L)...');
  const revenueResult = await db.query(`
    UPDATE accounts_chart 
    SET account_type = 'revenue', 
        account_subtype = 'sales',
        normal_balance = 'credit'
    WHERE account_code = ANY($1)
    RETURNING account_code, name
  `, [revenueCodes]);
  console.log(`  ✅ Set ${revenueResult.rows.length} revenue accounts:`);
  revenueResult.rows.forEach(r => console.log(`     ${r.account_code}: ${r.name}`));

  // STEP 3: Set expense accounts
  console.log('\nSTEP 3: Set expense accounts (from QB P&L)...');
  const expenseResult = await db.query(`
    UPDATE accounts_chart 
    SET account_type = 'expense', 
        account_subtype = 'operating_expense',
        normal_balance = 'debit'
    WHERE account_code = ANY($1)
    RETURNING account_code, name
  `, [expenseCodes]);
  console.log(`  ✅ Set ${expenseResult.rows.length} expense accounts`);

  // STEP 4: Set liability accounts (codes starting with 2)
  console.log('\nSTEP 4: Set liability accounts (2xxx codes)...');
  const liabilityResult = await db.query(`
    UPDATE accounts_chart 
    SET account_type = 'liability', 
        account_subtype = 'current_liability',
        normal_balance = 'credit'
    WHERE account_code LIKE '2%'
      AND account_code NOT IN (SELECT unnest($1::text[]))
      AND account_code NOT IN (SELECT unnest($2::text[]))
    RETURNING account_code, name
  `, [revenueCodes, expenseCodes]);
  console.log(`  ✅ Set ${liabilityResult.rows.length} liability accounts`);

  // STEP 5: Set equity accounts (codes starting with 3)
  console.log('\nSTEP 5: Set equity accounts (3xxx codes)...');
  const equityResult = await db.query(`
    UPDATE accounts_chart 
    SET account_type = 'equity', 
        account_subtype = 'owners_equity',
        normal_balance = 'credit'
    WHERE account_code LIKE '3%'
      AND account_code NOT IN (SELECT unnest($1::text[]))
      AND account_code NOT IN (SELECT unnest($2::text[]))
    RETURNING account_code, name
  `, [revenueCodes, expenseCodes]);
  console.log(`  ✅ Set ${equityResult.rows.length} equity accounts`);

  // STEP 6: Verify results
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Count by type
  const countResult = await db.query(`
    SELECT account_type, COUNT(*) as count 
    FROM accounts_chart 
    GROUP BY account_type 
    ORDER BY account_type
  `);
  console.log('Account counts by type:');
  countResult.rows.forEach(r => console.log(`  ${r.account_type}: ${r.count}`));

  // Calculate P&L for 2025
  const revenueTotal = await db.query(`
    SELECT COALESCE(SUM(jel.credit) - SUM(jel.debit), 0) as total
    FROM journal_entry_lines jel
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE je.status = 'posted' 
      AND ac.account_type = 'revenue'
      AND je.entry_date >= '2025-01-01' 
      AND je.entry_date <= '2025-12-31'
  `);

  const expenseTotal = await db.query(`
    SELECT COALESCE(SUM(jel.debit) - SUM(jel.credit), 0) as total
    FROM journal_entry_lines jel
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE je.status = 'posted' 
      AND ac.account_type = 'expense'
      AND je.entry_date >= '2025-01-01' 
      AND je.entry_date <= '2025-12-31'
  `);

  const revenue = parseFloat(revenueTotal.rows[0]?.total || 0);
  const expenses = parseFloat(expenseTotal.rows[0]?.total || 0);
  const netIncome = revenue - expenses;

  console.log('\n┌────────────────────────────────────────────────────────────┐');
  console.log('│                      OUR REPORT                            │');
  console.log('├────────────────────────────────────────────────────────────┤');
  console.log(`│  Total Revenue:      $${revenue.toFixed(2).padStart(12)}                   │`);
  console.log(`│  Total Expenses:     $${expenses.toFixed(2).padStart(12)}                   │`);
  console.log(`│  Net Income:         $${netIncome.toFixed(2).padStart(12)}                   │`);
  console.log('└────────────────────────────────────────────────────────────┘');
  console.log('');
  console.log('┌────────────────────────────────────────────────────────────┐');
  console.log('│                    QUICKBOOKS P&L                          │');
  console.log('├────────────────────────────────────────────────────────────┤');
  console.log('│  Total Revenue:      $    81,707.22                   │');
  console.log('│  Total Expenses:     $    99,631.40                   │');
  console.log('│  Net Income:         $   -17,922.84                   │');
  console.log('└────────────────────────────────────────────────────────────┘');
  console.log('');
  console.log('┌────────────────────────────────────────────────────────────┐');
  console.log('│                      DIFFERENCE                            │');
  console.log('├────────────────────────────────────────────────────────────┤');
  console.log(`│  Revenue:            $${(revenue - 81707.22).toFixed(2).padStart(12)}                   │`);
  console.log(`│  Expenses:           $${(expenses - 99631.40).toFixed(2).padStart(12)}                   │`);
  console.log(`│  Net Income:         $${(netIncome - (-17922.84)).toFixed(2).padStart(12)}                   │`);
  console.log('└────────────────────────────────────────────────────────────┘');

  // Show revenue breakdown
  console.log('\n\nREVENUE ACCOUNTS WITH 2025 BALANCES:');
  console.log('─────────────────────────────────────────────────────────────');
  const revBreakdown = await db.query(`
    SELECT ac.account_code, ac.name,
      COALESCE(SUM(jel.credit) - SUM(jel.debit), 0) as balance
    FROM accounts_chart ac
    LEFT JOIN journal_entry_lines jel ON ac.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
      AND je.status = 'posted'
      AND je.entry_date >= '2025-01-01' AND je.entry_date <= '2025-12-31'
    WHERE ac.account_type = 'revenue'
    GROUP BY ac.id, ac.account_code, ac.name
    ORDER BY COALESCE(SUM(jel.credit) - SUM(jel.debit), 0) DESC
  `);
  
  let revSum = 0;
  revBreakdown.rows.forEach(r => {
    const bal = parseFloat(r.balance);
    revSum += bal;
    if (bal !== 0) {
      console.log(`  ${(r.account_code || '').padEnd(10)} $${bal.toFixed(2).padStart(12)}  ${r.name}`);
    }
  });
  console.log(`  ${''.padEnd(10)} ${'─'.repeat(12)}`);
  console.log(`  ${'TOTAL'.padEnd(10)} $${revSum.toFixed(2).padStart(12)}`);

  // Show expense breakdown (top 20)
  console.log('\n\nTOP EXPENSE ACCOUNTS WITH 2025 BALANCES:');
  console.log('─────────────────────────────────────────────────────────────');
  const expBreakdown = await db.query(`
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
    LIMIT 20
  `);
  
  expBreakdown.rows.forEach(r => {
    const bal = parseFloat(r.balance);
    console.log(`  ${(r.account_code || '').padEnd(10)} $${bal.toFixed(2).padStart(12)}  ${r.name}`);
  });

  console.log('\n\n✅ FIX COMPLETE - Restart your servers and refresh the report\n');

  await db.close();
}

preciseFix().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});