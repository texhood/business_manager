/**
 * Import QuickBooks Chart of Accounts from local file
 * Run with: node scripts/import-qb-coa.js
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const db = require('../config/database');

// QB Account Type Mapping
const QB_TYPE_MAPPING = {
  'Bank': { type: 'asset', subtype: 'bank' },
  'Accounts Receivable': { type: 'asset', subtype: 'accounts_receivable' },
  'Other Current Asset': { type: 'asset', subtype: 'other_asset' },
  'Other Current Assets': { type: 'asset', subtype: 'other_asset' },
  'Fixed Asset': { type: 'asset', subtype: 'fixed_asset' },
  'Fixed Assets': { type: 'asset', subtype: 'fixed_asset' },
  'Other Asset': { type: 'asset', subtype: 'other_asset' },
  'Cash': { type: 'asset', subtype: 'cash' },
  'Inventory': { type: 'asset', subtype: 'inventory' },
  'Accounts Payable': { type: 'liability', subtype: 'accounts_payable' },
  'Accounts payable (A/P)': { type: 'liability', subtype: 'accounts_payable' },
  'Credit Card': { type: 'liability', subtype: 'credit_card' },
  'Other Current Liability': { type: 'liability', subtype: 'current_liability' },
  'Other Current Liabilities': { type: 'liability', subtype: 'current_liability' },
  'Long Term Liability': { type: 'liability', subtype: 'long_term_liability' },
  'Long Term Liabilities': { type: 'liability', subtype: 'long_term_liability' },
  'Equity': { type: 'equity', subtype: 'owners_equity' },
  'Owner\'s Equity': { type: 'equity', subtype: 'owners_equity' },
  'Retained Earnings': { type: 'equity', subtype: 'retained_earnings' },
  'Income': { type: 'revenue', subtype: 'sales' },
  'Other Income': { type: 'revenue', subtype: 'other_income' },
  'Revenue': { type: 'revenue', subtype: 'sales' },
  'Sales': { type: 'revenue', subtype: 'sales' },
  'Cost of Goods Sold': { type: 'expense', subtype: 'cost_of_goods' },
  'Expense': { type: 'expense', subtype: 'operating_expense' },
  'Expenses': { type: 'expense', subtype: 'operating_expense' },
  'Other Expense': { type: 'expense', subtype: 'other_expense' },
};

const getNormalBalance = (accountType) => {
  return ['asset', 'expense'].includes(accountType) ? 'debit' : 'credit';
};

const generateAccountCode = (accountType, index) => {
  const prefixes = { asset: 1000, liability: 2000, equity: 3000, revenue: 4000, expense: 5000 };
  return String((prefixes[accountType] || 9000) + index);
};

async function importChartOfAccounts(filePath, options = {}) {
  const { clearExisting = false } = options;
  
  console.log(`\n📂 Reading ${filePath}...`);
  
  // Read and parse CSV
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const rows = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  console.log(`📊 Found ${rows.length} accounts in CSV\n`);

  // Clear existing if requested
  if (clearExisting) {
    console.log('🗑️  Clearing existing accounts...');
    await db.query('DELETE FROM accounts_chart WHERE is_system = false');
  }

  // Get existing account codes
  const existingCodes = new Set();
  const existingNames = new Set();
  const existing = await db.query('SELECT account_code, name FROM accounts_chart');
  existing.rows.forEach(row => {
    existingCodes.add(row.account_code);
    existingNames.add(row.name.toLowerCase());
  });

  // Track results
  const results = { imported: 0, skipped: 0, errors: [] };
  const typeCounters = { asset: 0, liability: 0, equity: 0, revenue: 0, expense: 0 };
  const importedNames = new Map();

  // Process each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    try {
      let name = row['Name']?.trim();
      if (!name) {
        results.skipped++;
        continue;
      }

      // Handle duplicate names
      const nameLower = name.toLowerCase();
      if (existingNames.has(nameLower) || importedNames.has(nameLower)) {
        const count = (importedNames.get(nameLower) || 0) + 1;
        importedNames.set(nameLower, count);
        const qbNumber = row['Number']?.trim();
        if (qbNumber) {
          name = `${name} (${qbNumber})`;
        } else {
          name = `${name} (${count})`;
        }
        if (existingNames.has(name.toLowerCase())) {
          results.skipped++;
          continue;
        }
      }

      // Map QB type
      const qbType = row['Account type']?.trim() || 'Expenses';
      const mapping = QB_TYPE_MAPPING[qbType] || { type: 'expense', subtype: 'operating_expense' };

      // Get or generate account code
      let accountCode = row['Number']?.trim();
      if (accountCode && accountCode.length > 15) {
        accountCode = accountCode.substring(0, 15);
      }
      if (!accountCode || existingCodes.has(accountCode)) {
        do {
          typeCounters[mapping.type]++;
          accountCode = generateAccountCode(mapping.type, typeCounters[mapping.type]);
        } while (existingCodes.has(accountCode));
      }

      // Parse balance
      let balance = 0;
      if (row['QuickBooks balance']) {
        const balStr = row['QuickBooks balance'].replace(/[$,]/g, '').trim();
        balance = parseFloat(balStr) || 0;
      }

      // Insert
      await db.query(`
        INSERT INTO accounts_chart (
          account_code, name, account_type, account_subtype,
          description, normal_balance, opening_balance, current_balance
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
        ON CONFLICT (account_code) DO UPDATE SET
          name = EXCLUDED.name, description = EXCLUDED.description
      `, [
        accountCode,
        name,
        mapping.type,
        mapping.subtype,
        row['Detail type']?.trim() || null,
        getNormalBalance(mapping.type),
        balance,
      ]);

      existingCodes.add(accountCode);
      existingNames.add(name.toLowerCase());
      importedNames.set(nameLower, (importedNames.get(nameLower) || 0) + 1);
      results.imported++;

      // Progress indicator
      if (results.imported % 20 === 0) {
        process.stdout.write(`  ✓ ${results.imported} accounts imported...\r`);
      }

    } catch (err) {
      results.errors.push({ row: i + 2, name: row['Name'], error: err.message });
      results.skipped++;
    }
  }

  console.log(`\n\n✅ Import Complete!`);
  console.log(`   Imported: ${results.imported}`);
  console.log(`   Skipped:  ${results.skipped}`);
  if (results.errors.length > 0) {
    console.log(`   Errors:   ${results.errors.length}`);
    results.errors.slice(0, 5).forEach(e => console.log(`     - Row ${e.row}: ${e.error}`));
  }

  return results;
}

// Run import
const csvPath = path.join(__dirname, '../documents/chart_of_accounts.csv');

if (!fs.existsSync(csvPath)) {
  console.error(`❌ File not found: ${csvPath}`);
  console.log('   Place your QuickBooks CSV export at: backend/documents/chart_of_accounts.csv');
  process.exit(1);
}

importChartOfAccounts(csvPath, { clearExisting: true })
  .then(async () => {
    console.log('\n🎉 Done!\n');
    await db.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌ Import failed:', err.message);
    await db.close();
    process.exit(1);
  });
