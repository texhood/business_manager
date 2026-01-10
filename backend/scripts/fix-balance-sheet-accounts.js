/**
 * Fix Balance Sheet Account Classifications
 * Based on comparison with QuickBooks Balance Sheet export
 * 
 * Run with: node scripts/fix-balance-sheet-accounts.js
 */

require('dotenv').config();
const db = require('../config/database');

async function fixBalanceSheet() {
  console.log('\n🔧 FIX BALANCE SHEET ACCOUNT CLASSIFICATIONS');
  console.log('=============================================\n');

  // =========================================================================
  // STEP 1: Reclassify Credit Cards as Liabilities
  // =========================================================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('STEP 1: CREDIT CARDS → LIABILITY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const creditCardCodes = [
    '4.1',    // CapitalOne MC - 3924
    '2011',   // Chase Freedom 5100 (already liability but verify)
    '2012',   // Chase Ink Credit Card (already liability but verify)
    '2016',   // J. YOUMANS (5318) - 18
  ];

  const ccResult = await db.query(`
    UPDATE accounts_chart 
    SET account_type = 'liability', 
        account_subtype = 'credit_card',
        normal_balance = 'credit'
    WHERE account_code = ANY($1)
    RETURNING account_code, name
  `, [creditCardCodes]);
  
  console.log(`  ✅ Updated ${ccResult.rows.length} credit card accounts:`);
  ccResult.rows.forEach(r => console.log(`     ${r.account_code}: ${r.name}`));

  // =========================================================================
  // STEP 2: Reclassify Food Trailer Note as Long-term Liability
  // =========================================================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('STEP 2: NOTES/LOANS → LIABILITY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const loanCodes = [
    '323003721',  // Food Trailer Note
    '92880822',   // Kubota UTV Note
    '2004',       // N/P Kubota Tractor
    '2009',       // Freezer and Cooler
    '2010',       // Loans
    '2021',       // 7030 Revolving Line of Credit
  ];

  const loanResult = await db.query(`
    UPDATE accounts_chart 
    SET account_type = 'liability', 
        account_subtype = 'long_term_liability',
        normal_balance = 'credit'
    WHERE account_code = ANY($1)
    RETURNING account_code, name
  `, [loanCodes]);
  
  console.log(`  ✅ Updated ${loanResult.rows.length} loan/note accounts`);

  // =========================================================================
  // STEP 3: Ensure expense accounts are typed as expenses
  // =========================================================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('STEP 3: FIX MISCLASSIFIED EXPENSE ACCOUNTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // These are clearly expenses but got classified as assets
  const expenseAccountCodes = [
    '6000',   // Ranch Expenses
    '6061',   // Land (Cash Lease)
    '7020',   // 7020 Insurance (deleted)
    '7041',   // 7041 Accounting (deleted)
    '7074',   // Conference fees
    '7700',   // Utilities
    '7800',   // Income Tax Expense
    '7990',   // Depreciation Expense
    '8010',   // Charitable Contribution
  ];

  const expResult = await db.query(`
    UPDATE accounts_chart 
    SET account_type = 'expense', 
        account_subtype = 'operating_expense',
        normal_balance = 'debit'
    WHERE account_code = ANY($1)
    RETURNING account_code, name
  `, [expenseAccountCodes]);
  
  console.log(`  ✅ Updated ${expResult.rows.length} expense accounts`);

  // =========================================================================
  // STEP 4: Fix Fixed Asset accounts (3.x series in QB are fixed assets)
  // =========================================================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('STEP 4: FIX FIXED ASSET ACCOUNTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // In QB, 3.1, 3.2, 3.3.x are Fixed Assets, not Equity
  const fixedAssetCodes = [
    '3.1',      // Livestock Inventory
    '3.2',      // Accumulated Depreciation
    '3.3.1',    // Freezer 54 cu ft
    '3.3.2',    // Cooler 48 cu ft
    '3.3.3',    // Machinery & Equipment
    '3.3.4',    // Tractor
  ];

  const faResult = await db.query(`
    UPDATE accounts_chart 
    SET account_type = 'asset', 
        account_subtype = 'fixed_asset',
        normal_balance = 'debit'
    WHERE account_code = ANY($1)
    RETURNING account_code, name
  `, [fixedAssetCodes]);
  
  console.log(`  ✅ Updated ${faResult.rows.length} fixed asset accounts`);

  // =========================================================================
  // STEP 5: Deactivate tracking/clearing accounts (they shouldn't be on B/S)
  // =========================================================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('STEP 5: DEACTIVATE TRACKING/CLEARING ACCOUNTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Market location accounts - these are tracking accounts that shouldn't appear on B/S
  const trackingAccountCodes = [
    '4001',   // Sale of Livestock (tracking)
    '4011', '4012', '4013', '4014', '4015', '4016', '4017', '4018', // Market locations
    '4019', '4020', '4021', '4022',  // More tracking
    '4095',   // Refunds/Credits
  ];

  const trackingResult = await db.query(`
    UPDATE accounts_chart 
    SET is_active = false
    WHERE account_code = ANY($1)
    RETURNING account_code, name
  `, [trackingAccountCodes]);
  
  console.log(`  ✅ Deactivated ${trackingResult.rows.length} tracking accounts`);
  console.log('     (These won\'t appear on reports but data is preserved)');

  // =========================================================================
  // STEP 6: Deactivate "deleted" accounts from QB
  // =========================================================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('STEP 6: DEACTIVATE DELETED QB ACCOUNTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const deletedResult = await db.query(`
    UPDATE accounts_chart 
    SET is_active = false
    WHERE (name LIKE '%(deleted)%' OR name LIKE '%(deleted-%' OR account_code LIKE 'AUTO-%')
      AND is_active = true
    RETURNING account_code, name
  `);
  
  console.log(`  ✅ Deactivated ${deletedResult.rows.length} deleted accounts`);

  // =========================================================================
  // STEP 7: Fix specific equity accounts
  // =========================================================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('STEP 7: VERIFY EQUITY ACCOUNTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const equityCodes = [
    '3001',   // Partner Contributions
    '3002',   // Personal Expenses
    '3004',   // Robin's Distributions
    '3016',   // Opening Balance Equity
    '3017',   // Owner Equity
    '3018',   // LLC Owner Equity
    '3019',   // Z.Robin's Equity
    '3020',   // Cheri's Equity
    '3025',   // Cheri Capital
    '3026',   // Jimmy Capital
    '3027',   // Katie Capital
    '3028',   // Miles Capital
    '3029',   // Robin Capital
    '3030',   // Sara Capital
    '3900',   // Retained Earnings
  ];

  const eqResult = await db.query(`
    UPDATE accounts_chart 
    SET account_type = 'equity', 
        account_subtype = 'owners_equity',
        normal_balance = 'credit'
    WHERE account_code = ANY($1)
    RETURNING account_code, name
  `, [equityCodes]);
  
  console.log(`  ✅ Verified ${eqResult.rows.length} equity accounts`);

  // =========================================================================
  // VERIFICATION
  // =========================================================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('VERIFICATION - BALANCE SHEET TOTALS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const asOfDate = '2025-12-27';

  // Get totals using the corrected query
  const totals = await db.query(`
    SELECT 
      ac.account_type,
      SUM(CASE 
        WHEN ac.account_type = 'asset' THEN COALESCE(totals.debits, 0) - COALESCE(totals.credits, 0)
        ELSE COALESCE(totals.credits, 0) - COALESCE(totals.debits, 0)
      END) AS total_balance
    FROM accounts_chart ac
    LEFT JOIN (
      SELECT 
        jel.account_id,
        SUM(jel.debit) as debits,
        SUM(jel.credit) as credits
      FROM journal_entry_lines jel
      INNER JOIN journal_entries je ON jel.journal_entry_id = je.id
      WHERE je.status = 'posted'
        AND je.entry_date <= $1
      GROUP BY jel.account_id
    ) totals ON ac.id = totals.account_id
    WHERE ac.account_type IN ('asset', 'liability', 'equity')
      AND ac.is_active = true
      AND (COALESCE(totals.debits, 0) != 0 OR COALESCE(totals.credits, 0) != 0)
    GROUP BY ac.account_type
    ORDER BY ac.account_type
  `, [asOfDate]);

  let assets = 0, liabilities = 0, equity = 0;
  totals.rows.forEach(r => {
    const bal = parseFloat(r.total_balance) || 0;
    if (r.account_type === 'asset') assets = bal;
    if (r.account_type === 'liability') liabilities = bal;
    if (r.account_type === 'equity') equity = bal;
  });

  console.log('  ┌────────────────────────────────────────────────────────────┐');
  console.log('  │                    OUR BALANCE SHEET                       │');
  console.log('  ├────────────────────────────────────────────────────────────┤');
  console.log(`  │  Total Assets:          $${assets.toFixed(2).padStart(14)}               │`);
  console.log(`  │  Total Liabilities:     $${liabilities.toFixed(2).padStart(14)}               │`);
  console.log(`  │  Total Equity:          $${equity.toFixed(2).padStart(14)}               │`);
  console.log(`  │  Liab + Equity:         $${(liabilities + equity).toFixed(2).padStart(14)}               │`);
  console.log('  └────────────────────────────────────────────────────────────┘');
  console.log('');
  console.log('  ┌────────────────────────────────────────────────────────────┐');
  console.log('  │                  QUICKBOOKS BALANCE SHEET                  │');
  console.log('  ├────────────────────────────────────────────────────────────┤');
  console.log('  │  Total Assets:          $      46,433.44               │');
  console.log('  │  Total Liabilities:     $      43,016.24               │');
  console.log('  │  Total Equity:          $       3,417.20               │');
  console.log('  │  Liab + Equity:         $      46,433.44               │');
  console.log('  └────────────────────────────────────────────────────────────┘');

  // Show active account counts
  const countResult = await db.query(`
    SELECT account_type, COUNT(*) as count, SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active
    FROM accounts_chart 
    GROUP BY account_type 
    ORDER BY account_type
  `);
  
  console.log('\n  Account counts (active/total):');
  countResult.rows.forEach(r => {
    console.log(`    ${r.account_type.padEnd(12)}: ${r.active}/${r.count}`);
  });

  console.log('\n\n✅ FIX COMPLETE - Restart your servers and regenerate the Balance Sheet\n');

  await db.close();
}

fixBalanceSheet().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
