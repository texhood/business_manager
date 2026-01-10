/**
 * Import QuickBooks Transactions from CSV
 * Run with: node scripts/import-qb-transactions.js
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const db = require('../config/database');

// ============================================================================
// TRANSACTION TYPE MAPPING
// ============================================================================

// Map QB transaction types to our income/expense
const INCOME_TYPES = ['Deposit', 'Sales Receipt', 'Payment', 'Invoice Payment'];
const EXPENSE_TYPES = ['Expense', 'Check', 'Bill Payment', 'Credit Card Payment'];
const TRANSFER_TYPES = ['Transfer', 'Journal Entry'];
const CREDIT_TYPES = ['Credit Card Credit', 'Refund', 'Credit'];

// Determine transaction type based on QB type and amount
function determineTransactionType(qbType, amount, splitAccount) {
  // Check if it's income based on split account
  const splitLower = (splitAccount || '').toLowerCase();
  const isIncomeAccount = splitLower.includes('income') || 
                          splitLower.includes('sales') ||
                          splitLower.includes('revenue') ||
                          splitLower.startsWith('4');
  
  // Check if it's expense based on split account  
  const isExpenseAccount = splitLower.includes('expense') ||
                           splitLower.includes('cost of goods') ||
                           splitLower.includes('cogs') ||
                           splitLower.startsWith('5') ||
                           splitLower.startsWith('6') ||
                           splitLower.startsWith('7');

  // Deposits and Sales are income
  if (INCOME_TYPES.includes(qbType)) {
    return 'income';
  }
  
  // Expenses and Checks are expenses
  if (EXPENSE_TYPES.includes(qbType)) {
    return 'expense';
  }
  
  // Credit card credits can be refunds (reduce expense) or payments
  if (CREDIT_TYPES.includes(qbType)) {
    return amount > 0 ? 'expense' : 'income';
  }
  
  // Transfers - skip or categorize based on context
  if (TRANSFER_TYPES.includes(qbType)) {
    return 'transfer';
  }
  
  // Fall back to account-based detection
  if (isIncomeAccount) return 'income';
  if (isExpenseAccount) return 'expense';
  
  // Last resort: positive amounts are income, negative are expense
  return amount >= 0 ? 'income' : 'expense';
}

// Extract category from QB split account (e.g., "6032 Ranch Expenses:Farm Repairs:..." -> "Farm Repairs")
function extractCategory(splitAccount) {
  if (!splitAccount || splitAccount === '-Split-') {
    return 'Uncategorized';
  }
  
  // Remove account number prefix
  let category = splitAccount.replace(/^[\d.]+\s*/, '');
  
  // Split by colon and get meaningful part
  const parts = category.split(':');
  
  // Skip generic parent categories
  const skipPrefixes = ['Ranch Expenses', 'General Expenses', 'Fixed assets', 'LLC Owner Equity'];
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!skipPrefixes.includes(part) && part.length > 0) {
      return part;
    }
  }
  
  // If all parts were skipped, use the last one
  return parts[parts.length - 1]?.trim() || 'Uncategorized';
}

// Extract bank account from QB account field
function extractBankAccount(account) {
  if (!account) return 'Other';
  
  // Common mappings
  if (account.toLowerCase().includes('checking')) return 'Checking';
  if (account.toLowerCase().includes('savings')) return 'Savings';
  if (account.toLowerCase().includes('capitalone') || account.includes('MC')) return 'Credit Card';
  if (account.toLowerCase().includes('chase')) return 'Credit Card';
  if (account.toLowerCase().includes('paypal')) return 'PayPal';
  if (account.toLowerCase().includes('square')) return 'Square';
  if (account.toLowerCase().includes('cash')) return 'Cash';
  
  // Extract from format like "LLC Checking 9663"
  const parts = account.split(' ');
  for (const part of parts) {
    if (['Checking', 'Savings', 'Cash'].includes(part)) {
      return part;
    }
  }
  
  return 'Other';
}

// Parse amount string (handles "1,234.56  " format)
function parseAmount(amountStr) {
  if (!amountStr) return 0;
  const cleaned = amountStr.toString().replace(/[$,\s]/g, '').trim();
  return parseFloat(cleaned) || 0;
}

// Parse date string (MM/DD/YYYY format)
function parseDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [month, day, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// ============================================================================
// MAIN IMPORT FUNCTION
// ============================================================================

async function importTransactions(filePath, options = {}) {
  const { 
    clearExisting = false,
    startDate = null,  // Filter: only import after this date (YYYY-MM-DD)
    endDate = null,    // Filter: only import before this date (YYYY-MM-DD)
    skipTransfers = true,
  } = options;

  console.log(`\n📂 Reading ${filePath}...`);
  
  // Read and parse CSV
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const rows = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
    relax_column_count: true,
  });

  console.log(`📊 Found ${rows.length} transaction rows in CSV\n`);

  // Clear existing if requested
  if (clearExisting) {
    console.log('🗑️  Clearing existing transactions...');
    await db.query('DELETE FROM transactions');
  }

  // Get existing categories and build map
  const categoriesResult = await db.query('SELECT id, name, type FROM transaction_categories');
  const categoryMap = new Map();
  categoriesResult.rows.forEach(cat => {
    categoryMap.set(`${cat.name.toLowerCase()}-${cat.type}`, cat.id);
  });

  // Get existing bank accounts and build map
  const bankAccountsResult = await db.query('SELECT id, name FROM bank_accounts');
  const bankAccountMap = new Map();
  bankAccountsResult.rows.forEach(acc => {
    bankAccountMap.set(acc.name.toLowerCase(), acc.id);
  });

  // Function to get or create category
  async function getOrCreateCategory(categoryName, txnType) {
    const key = `${categoryName.toLowerCase()}-${txnType}`;
    if (categoryMap.has(key)) {
      return categoryMap.get(key);
    }
    
    // Create new category
    try {
      const result = await db.query(
        'INSERT INTO transaction_categories (name, type) VALUES ($1, $2) RETURNING id',
        [categoryName.substring(0, 100), txnType]
      );
      const newId = result.rows[0].id;
      categoryMap.set(key, newId);
      return newId;
    } catch (err) {
      // If duplicate, try to fetch it
      const existing = await db.query(
        'SELECT id FROM transaction_categories WHERE name = $1 AND type = $2',
        [categoryName.substring(0, 100), txnType]
      );
      if (existing.rows.length > 0) {
        categoryMap.set(key, existing.rows[0].id);
        return existing.rows[0].id;
      }
      return null;
    }
  }

  // Function to get or create bank account
  async function getOrCreateBankAccount(accountName) {
    const key = accountName.toLowerCase();
    if (bankAccountMap.has(key)) {
      return bankAccountMap.get(key);
    }
    
    // Determine account type
    let accountType = 'checking';
    if (key.includes('saving')) accountType = 'savings';
    else if (key.includes('cash')) accountType = 'cash';
    else if (key.includes('credit')) accountType = 'credit';
    else if (key.includes('paypal') || key.includes('square') || key.includes('stripe')) accountType = 'digital';
    
    // Create new bank account
    try {
      const result = await db.query(
        'INSERT INTO bank_accounts (name, account_type) VALUES ($1, $2) RETURNING id',
        [accountName.substring(0, 100), accountType]
      );
      const newId = result.rows[0].id;
      bankAccountMap.set(key, newId);
      return newId;
    } catch (err) {
      // If duplicate, try to fetch it
      const existing = await db.query(
        'SELECT id FROM bank_accounts WHERE name = $1',
        [accountName.substring(0, 100)]
      );
      if (existing.rows.length > 0) {
        bankAccountMap.set(key, existing.rows[0].id);
        return existing.rows[0].id;
      }
      return null;
    }
  }

  // Track results
  const results = { 
    imported: 0, 
    skipped: 0, 
    errors: [],
    byType: { income: 0, expense: 0, transfer: 0 },
    byYear: {},
  };

  // Process each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    try {
      // Parse date
      const date = parseDate(row['Date']);
      if (!date) {
        results.skipped++;
        continue;
      }

      // Apply date filters
      if (startDate && date < startDate) {
        results.skipped++;
        continue;
      }
      if (endDate && date > endDate) {
        results.skipped++;
        continue;
      }

      // Skip non-posting transactions
      if (row['Posting'] !== 'Yes') {
        results.skipped++;
        continue;
      }

      // Parse amount
      const amount = parseAmount(row['Amount']);
      if (amount === 0) {
        results.skipped++;
        continue;
      }

      // Determine transaction type
      const qbType = row['Transaction Type'] || '';
      const splitAccount = row['Split'] || '';
      const txnType = determineTransactionType(qbType, amount, splitAccount);

      // Skip transfers if configured
      if (skipTransfers && txnType === 'transfer') {
        results.skipped++;
        continue;
      }

      // Build description
      const name = row['Name'] || '';
      const memo = row['Memo/Description'] || '';
      const description = [name, memo].filter(Boolean).join(' - ') || qbType || 'Transaction';

      // Extract and get/create category
      const categoryName = extractCategory(splitAccount);
      const effectiveType = txnType === 'transfer' ? 'expense' : txnType;
      const categoryId = await getOrCreateCategory(categoryName, effectiveType);
      
      // Extract and get/create bank account
      const bankAccountName = extractBankAccount(row['Account']);
      const bankAccountId = await getOrCreateBankAccount(bankAccountName);

      // Get reference number
      const reference = row['Num'] || null;

      // Normalize amount (always positive, type indicates direction)
      const normalizedAmount = Math.abs(amount);

      // Insert transaction
      await db.query(`
        INSERT INTO transactions (
          date, type, description, amount, 
          category_id, bank_account_id, reference, vendor, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        date,
        effectiveType,
        description.substring(0, 500),
        normalizedAmount,
        categoryId,
        bankAccountId,
        reference ? reference.substring(0, 50) : null,
        name ? name.substring(0, 255) : null,
        `QB: ${qbType}`,
      ]);

      results.imported++;
      results.byType[txnType] = (results.byType[txnType] || 0) + 1;
      
      const year = date.substring(0, 4);
      results.byYear[year] = (results.byYear[year] || 0) + 1;

      // Progress indicator
      if (results.imported % 500 === 0) {
        process.stdout.write(`  ✓ ${results.imported} transactions imported...\r`);
      }

    } catch (err) {
      results.errors.push({ row: i + 2, error: err.message });
      results.skipped++;
    }
  }

  console.log(`\n\n✅ Import Complete!`);
  console.log(`   Imported: ${results.imported}`);
  console.log(`   Skipped:  ${results.skipped}`);
  console.log(`\n   By Type:`);
  console.log(`     Income:   ${results.byType.income || 0}`);
  console.log(`     Expense:  ${results.byType.expense || 0}`);
  console.log(`     Transfer: ${results.byType.transfer || 0} (skipped)`);
  console.log(`\n   By Year:`);
  Object.keys(results.byYear).sort().forEach(year => {
    console.log(`     ${year}: ${results.byYear[year]}`);
  });
  
  if (results.errors.length > 0) {
    console.log(`\n   Errors: ${results.errors.length}`);
    results.errors.slice(0, 5).forEach(e => console.log(`     - Row ${e.row}: ${e.error}`));
  }

  return results;
}

// ============================================================================
// RUN IMPORT
// ============================================================================

const csvPath = path.join(__dirname, '../documents/transactions_by_date.csv');

if (!fs.existsSync(csvPath)) {
  console.error(`❌ File not found: ${csvPath}`);
  console.log('   Place your QuickBooks CSV export at: backend/documents/transactions_by_date.csv');
  process.exit(1);
}

// Configuration options
const importOptions = {
  clearExisting: true,      // Clear existing transactions before import
  skipTransfers: true,      // Skip transfer transactions (internal moves)
  // startDate: '2024-01-01', // Uncomment to filter by date
  // endDate: '2024-12-31',
};

console.log('\n🏦 QuickBooks Transaction Import');
console.log('================================');
console.log(`Options: ${JSON.stringify(importOptions)}`);

importTransactions(csvPath, importOptions)
  .then(async () => {
    console.log('\n🎉 Done!\n');
    await db.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌ Import failed:', err.message);
    console.error(err.stack);
    await db.close();
    process.exit(1);
  });
