/**
 * Import Routes
 * CSV import for QuickBooks and other accounting data
 */

const express = require('express');
const multer = require('multer');
const csv = require('csv-parse');
const { Readable } = require('stream');

const db = require('../../config/database');
const { authenticate, requireStaff } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
});

// ============================================================================
// QUICKBOOKS ACCOUNT TYPE MAPPING
// ============================================================================

const QB_TYPE_MAPPING = {
  // Assets
  'Bank': { type: 'asset', subtype: 'bank' },
  'Accounts Receivable': { type: 'asset', subtype: 'accounts_receivable' },
  'Other Current Asset': { type: 'asset', subtype: 'other_asset' },
  'Other Current Assets': { type: 'asset', subtype: 'other_asset' },
  'Fixed Asset': { type: 'asset', subtype: 'fixed_asset' },
  'Fixed Assets': { type: 'asset', subtype: 'fixed_asset' },
  'Other Asset': { type: 'asset', subtype: 'other_asset' },
  'Cash': { type: 'asset', subtype: 'cash' },
  'Inventory': { type: 'asset', subtype: 'inventory' },
  
  // Liabilities
  'Accounts Payable': { type: 'liability', subtype: 'accounts_payable' },
  'Accounts payable (A/P)': { type: 'liability', subtype: 'accounts_payable' },
  'Credit Card': { type: 'liability', subtype: 'credit_card' },
  'Other Current Liability': { type: 'liability', subtype: 'current_liability' },
  'Other Current Liabilities': { type: 'liability', subtype: 'current_liability' },
  'Long Term Liability': { type: 'liability', subtype: 'long_term_liability' },
  'Long Term Liabilities': { type: 'liability', subtype: 'long_term_liability' },
  
  // Equity
  'Equity': { type: 'equity', subtype: 'owners_equity' },
  'Owner\'s Equity': { type: 'equity', subtype: 'owners_equity' },
  'Retained Earnings': { type: 'equity', subtype: 'retained_earnings' },
  
  // Revenue
  'Income': { type: 'revenue', subtype: 'sales' },
  'Other Income': { type: 'revenue', subtype: 'other_income' },
  'Revenue': { type: 'revenue', subtype: 'sales' },
  'Sales': { type: 'revenue', subtype: 'sales' },
  
  // Expenses
  'Cost of Goods Sold': { type: 'expense', subtype: 'cost_of_goods' },
  'Expense': { type: 'expense', subtype: 'operating_expense' },
  'Expenses': { type: 'expense', subtype: 'operating_expense' },
  'Other Expense': { type: 'expense', subtype: 'other_expense' },
};

// Determine normal balance based on account type
const getNormalBalance = (accountType) => {
  return ['asset', 'expense'].includes(accountType) ? 'debit' : 'credit';
};

// Generate account code if not provided
const generateAccountCode = (accountType, index) => {
  const prefixes = {
    asset: 1000,
    liability: 2000,
    equity: 3000,
    revenue: 4000,
    expense: 5000,
  };
  return String((prefixes[accountType] || 9000) + index);
};

// Parse CSV data
const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const parser = csv.parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true, // Handle BOM from Excel
    });

    parser.on('data', (row) => results.push(row));
    parser.on('error', (err) => reject(err));
    parser.on('end', () => resolve(results));

    Readable.from(buffer).pipe(parser);
  });
};

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /import/quickbooks/chart-of-accounts
 * Import Chart of Accounts from QuickBooks CSV export
 * 
 * Expected CSV columns (QuickBooks format):
 * - Account (or Name) - Account name
 * - Type - QB account type
 * - Detail Type - More specific type (optional)
 * - Description - Account description (optional)
 * - Balance - Current balance (optional)
 * - Account # (or Number) - Account number (optional)
 */
router.post('/quickbooks/chart-of-accounts',
  authenticate,
  requireStaff,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, 'No CSV file uploaded');
    }

    const { replace_existing = 'false', skip_duplicates = 'true' } = req.body;

    // Parse CSV
    let rows;
    try {
      rows = await parseCSV(req.file.buffer);
    } catch (err) {
      throw new ApiError(400, `Failed to parse CSV: ${err.message}`);
    }

    if (rows.length === 0) {
      throw new ApiError(400, 'CSV file is empty');
    }

    // Detect column names (handle exact QB Online export format)
    const sampleRow = rows[0];
    const columns = Object.keys(sampleRow);
    
    // QB Online exports: Number, Name, Account type, Detail type, QuickBooks balance, Bank balance
    const nameCol = columns.find(c => /^name$/i.test(c.trim())) 
      || columns.find(c => /^account$/i.test(c.trim()))
      || columns.find(c => /account|name/i.test(c));
    
    const typeCol = columns.find(c => /^account.?type$/i.test(c.trim()))
      || columns.find(c => /^type$/i.test(c.trim()));
    
    const numberCol = columns.find(c => /^number$/i.test(c.trim()))
      || columns.find(c => /^(account.?#|account.?number|acct.?#)$/i.test(c.trim()));
    
    const detailTypeCol = columns.find(c => /^detail.?type$/i.test(c.trim()));
    
    const balanceCol = columns.find(c => /quickbooks.?balance/i.test(c))
      || columns.find(c => /^balance$/i.test(c.trim()))
      || columns.find(c => /balance|amount/i.test(c));

    if (!nameCol) {
      throw new ApiError(400, `Could not find account name column. Found columns: ${columns.join(', ')}`);
    }

    logger.info('CSV column mapping', { nameCol, typeCol, numberCol, detailTypeCol, balanceCol, allColumns: columns });

    // Track results
    const results = {
      total: rows.length,
      imported: 0,
      skipped: 0,
      errors: [],
    };

    // Optionally clear existing accounts
    if (replace_existing === 'true') {
      await db.query('DELETE FROM accounts_chart WHERE is_system = false');
      logger.info('Cleared existing non-system accounts');
    }

    // Get existing account codes to avoid duplicates
    const existingCodes = new Set();
    const existingNames = new Set();
    const existing = await db.query('SELECT account_code, name FROM accounts_chart');
    existing.rows.forEach(row => {
      existingCodes.add(row.account_code);
      existingNames.add(row.name.toLowerCase());
    });

    // Track generated codes per type for auto-numbering
    const typeCounters = { asset: 0, liability: 0, equity: 0, revenue: 0, expense: 0 };
    
    // Track names we've added this import to handle duplicates
    const importedNames = new Map(); // name -> count

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Account for header row

      try {
        let name = row[nameCol]?.trim();
        if (!name) {
          results.errors.push({ row: rowNum, error: 'Missing account name' });
          results.skipped++;
          continue;
        }

        // Handle duplicate names by appending a suffix
        const nameLower = name.toLowerCase();
        if (existingNames.has(nameLower) || importedNames.has(nameLower)) {
          if (skip_duplicates === 'true') {
            // Check if it's the exact same or needs to be made unique
            const count = (importedNames.get(nameLower) || 0) + 1;
            importedNames.set(nameLower, count);
            
            // Append QB account number if available to make unique
            const qbNumber = numberCol ? row[numberCol]?.trim() : null;
            if (qbNumber) {
              name = `${name} (${qbNumber})`;
            } else {
              name = `${name} (${count})`;
            }
            
            // If still duplicate, skip
            if (existingNames.has(name.toLowerCase())) {
              results.skipped++;
              continue;
            }
          } else {
            results.skipped++;
            continue;
          }
        }

        // Map QB type to our type
        const qbType = row[typeCol]?.trim() || 'Expenses';
        const mapping = QB_TYPE_MAPPING[qbType] || { type: 'expense', subtype: 'operating_expense' };

        // Get or generate account code
        let accountCode = numberCol ? row[numberCol]?.trim() : null;
        
        // Clean account code - QB uses formats like "1.18.1" which we can keep
        // but very long numbers (like bank account numbers) should be truncated
        if (accountCode && accountCode.length > 15) {
          accountCode = accountCode.substring(0, 15);
        }
        
        if (!accountCode || existingCodes.has(accountCode)) {
          // Generate unique code
          do {
            typeCounters[mapping.type]++;
            accountCode = generateAccountCode(mapping.type, typeCounters[mapping.type]);
          } while (existingCodes.has(accountCode));
        }

        // Parse balance (handle negative values)
        let balance = 0;
        if (balanceCol && row[balanceCol]) {
          const balStr = row[balanceCol].replace(/[$,]/g, '').trim();
          balance = parseFloat(balStr) || 0;
        }

        // Get description from Detail type column
        const description = detailTypeCol ? row[detailTypeCol]?.trim() || null : null;

        // Insert account
        await db.query(`
          INSERT INTO accounts_chart (
            account_code, name, account_type, account_subtype,
            description, normal_balance, opening_balance, current_balance
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
          ON CONFLICT (account_code) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description
        `, [
          accountCode,
          name,
          mapping.type,
          mapping.subtype,
          description,
          getNormalBalance(mapping.type),
          balance,
        ]);

        existingCodes.add(accountCode);
        existingNames.add(name.toLowerCase());
        importedNames.set(nameLower, (importedNames.get(nameLower) || 0) + 1);
        results.imported++;

      } catch (err) {
        results.errors.push({ row: rowNum, error: err.message });
        results.skipped++;
      }
    }

    logger.info('Chart of Accounts import completed', results);

    res.json({
      status: 'success',
      message: `Imported ${results.imported} accounts`,
      data: results,
    });
  })
);

/**
 * GET /import/quickbooks/template
 * Download a sample CSV template matching QuickBooks Online format
 */
router.get('/quickbooks/template', authenticate, requireStaff, (req, res) => {
  const template = `Number,Name,Account type,Detail type,QuickBooks balance,Bank balance
1000,Checking Account,Bank,Checking,0,0
1100,Savings Account,Bank,Savings,0,0
1200,Accounts Receivable,Other Current Assets,Accounts Receivable,0,0
1500,Equipment,Fixed Assets,Machinery & Equipment,0,0
2000,Accounts Payable,Accounts payable (A/P),Accounts Payable (A/P),0,0
2100,Credit Card,Credit Card,Credit Card,0,0
3000,Owner's Equity,Equity,Owner's Equity,0,0
3100,Retained Earnings,Equity,Retained Earnings,0,0
4000,Sales,Income,Sales of Product Income,0,0
4100,Other Income,Other Income,Interest Earned,0,0
5000,Cost of Goods Sold,Cost of Goods Sold,Supplies & Materials - COGS,0,0
6000,Operating Expenses,Expenses,Other Business Expenses,0,0
6100,Utilities,Expenses,Utilities,0,0
`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="chart_of_accounts_template.csv"');
  res.send(template);
});

/**
 * POST /import/quickbooks/transactions
 * Import transactions from QuickBooks CSV export
 * 
 * Expected CSV columns:
 * - Date - Transaction date (MM/DD/YYYY)
 * - Transaction Type - Expense, Check, Deposit, etc.
 * - Num - Reference number
 * - Posting - Yes/No
 * - Name - Vendor/Customer name
 * - Memo/Description - Description
 * - Account - Bank/payment account
 * - Split - Category account
 * - Amount - Transaction amount
 */
router.post('/quickbooks/transactions',
  authenticate,
  requireStaff,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, 'No CSV file uploaded');
    }

    const { 
      clear_existing = 'false', 
      skip_transfers = 'true',
      start_date = null,
      end_date = null,
    } = req.body;

    // Parse CSV
    let rows;
    try {
      rows = await parseCSV(req.file.buffer);
    } catch (err) {
      throw new ApiError(400, `Failed to parse CSV: ${err.message}`);
    }

    if (rows.length === 0) {
      throw new ApiError(400, 'CSV file is empty');
    }

    logger.info('Transaction import started', { rowCount: rows.length });

    // Clear existing if requested
    if (clear_existing === 'true') {
      await db.query('DELETE FROM transactions');
      logger.info('Cleared existing transactions');
    }

    // Get/create category and bank account maps
    const categoriesResult = await db.query('SELECT id, name, type FROM transaction_categories');
    const categoryMap = new Map();
    categoriesResult.rows.forEach(cat => {
      categoryMap.set(`${cat.name.toLowerCase()}-${cat.type}`, cat.id);
    });

    const bankAccountsResult = await db.query('SELECT id, name FROM bank_accounts');
    const bankAccountMap = new Map();
    bankAccountsResult.rows.forEach(acc => {
      bankAccountMap.set(acc.name.toLowerCase(), acc.id);
    });

    // Helper functions
    const getOrCreateCategory = async (categoryName, txnType) => {
      const key = `${categoryName.toLowerCase()}-${txnType}`;
      if (categoryMap.has(key)) return categoryMap.get(key);
      
      try {
        const result = await db.query(
          'INSERT INTO transaction_categories (name, type) VALUES ($1, $2) RETURNING id',
          [categoryName.substring(0, 100), txnType]
        );
        categoryMap.set(key, result.rows[0].id);
        return result.rows[0].id;
      } catch (err) {
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
    };

    const getOrCreateBankAccount = async (accountName) => {
      const key = accountName.toLowerCase();
      if (bankAccountMap.has(key)) return bankAccountMap.get(key);
      
      let accountType = 'checking';
      if (key.includes('saving')) accountType = 'savings';
      else if (key.includes('cash')) accountType = 'cash';
      else if (key.includes('credit')) accountType = 'credit';
      else if (key.includes('paypal') || key.includes('square')) accountType = 'digital';
      
      try {
        const result = await db.query(
          'INSERT INTO bank_accounts (name, account_type) VALUES ($1, $2) RETURNING id',
          [accountName.substring(0, 100), accountType]
        );
        bankAccountMap.set(key, result.rows[0].id);
        return result.rows[0].id;
      } catch (err) {
        const existing = await db.query('SELECT id FROM bank_accounts WHERE name = $1', [accountName.substring(0, 100)]);
        if (existing.rows.length > 0) {
          bankAccountMap.set(key, existing.rows[0].id);
          return existing.rows[0].id;
        }
        return null;
      }
    };

    // Transaction type detection
    const INCOME_TYPES = ['Deposit', 'Sales Receipt', 'Payment', 'Invoice Payment'];
    const EXPENSE_TYPES = ['Expense', 'Check', 'Bill Payment', 'Credit Card Payment'];
    const TRANSFER_TYPES = ['Transfer', 'Journal Entry'];

    const determineType = (qbType, amount, splitAccount) => {
      const splitLower = (splitAccount || '').toLowerCase();
      if (INCOME_TYPES.includes(qbType)) return 'income';
      if (EXPENSE_TYPES.includes(qbType)) return 'expense';
      if (TRANSFER_TYPES.includes(qbType)) return 'transfer';
      if (splitLower.includes('income') || splitLower.includes('sales')) return 'income';
      return amount >= 0 ? 'income' : 'expense';
    };

    const extractCategory = (splitAccount) => {
      if (!splitAccount || splitAccount === '-Split-') return 'Uncategorized';
      let category = splitAccount.replace(/^[\d.]+\s*/, '');
      const parts = category.split(':');
      const skipPrefixes = ['Ranch Expenses', 'General Expenses', 'Fixed assets'];
      for (const part of parts) {
        if (!skipPrefixes.includes(part.trim()) && part.trim().length > 0) {
          return part.trim();
        }
      }
      return parts[parts.length - 1]?.trim() || 'Uncategorized';
    };

    const extractBankAccount = (account) => {
      if (!account) return 'Other';
      if (account.toLowerCase().includes('checking')) return 'Checking';
      if (account.toLowerCase().includes('savings')) return 'Savings';
      if (account.toLowerCase().includes('capitalone') || account.toLowerCase().includes('chase')) return 'Credit Card';
      if (account.toLowerCase().includes('cash')) return 'Cash';
      return 'Other';
    };

    const parseAmount = (amountStr) => {
      if (!amountStr) return 0;
      return parseFloat(amountStr.toString().replace(/[$,\s]/g, '')) || 0;
    };

    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;
      return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    };

    // Process rows
    const results = { total: rows.length, imported: 0, skipped: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const date = parseDate(row['Date']);
        if (!date || row['Posting'] !== 'Yes') { results.skipped++; continue; }

        if (start_date && date < start_date) { results.skipped++; continue; }
        if (end_date && date > end_date) { results.skipped++; continue; }

        const amount = parseAmount(row['Amount']);
        if (amount === 0) { results.skipped++; continue; }

        const qbType = row['Transaction Type'] || '';
        const splitAccount = row['Split'] || '';
        const txnType = determineType(qbType, amount, splitAccount);

        if (skip_transfers === 'true' && txnType === 'transfer') { results.skipped++; continue; }

        const effectiveType = txnType === 'transfer' ? 'expense' : txnType;
        const categoryName = extractCategory(splitAccount);
        const categoryId = await getOrCreateCategory(categoryName, effectiveType);
        const bankAccountName = extractBankAccount(row['Account']);
        const bankAccountId = await getOrCreateBankAccount(bankAccountName);

        const name = row['Name'] || '';
        const memo = row['Memo/Description'] || '';
        const description = [name, memo].filter(Boolean).join(' - ') || qbType;

        await db.query(`
          INSERT INTO transactions (date, type, description, amount, category_id, bank_account_id, reference, vendor, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          date, effectiveType, description.substring(0, 500), Math.abs(amount),
          categoryId, bankAccountId, row['Num']?.substring(0, 50) || null,
          name.substring(0, 255) || null, `QB: ${qbType}`
        ]);

        results.imported++;
      } catch (err) {
        results.errors.push({ row: i + 2, error: err.message });
        results.skipped++;
      }
    }

    logger.info('Transaction import completed', results);
    res.json({ status: 'success', message: `Imported ${results.imported} transactions`, data: results });
  })
);

module.exports = router;
