/**
 * Import QuickBooks Journal Report as Double-Entry Journal Entries
 * Run with: node scripts/import-qb-journal.js
 * 
 * This imports the full QB Journal export into:
 * - journal_entries (header records)
 * - journal_entry_lines (debit/credit detail lines)
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const db = require('../config/database');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Parse date string (MM/DD/YYYY format)
function parseDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [month, day, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Parse amount string (handles "$1,234.56" format)
function parseAmount(amountStr) {
  if (!amountStr) return 0;
  const cleaned = amountStr.toString().replace(/[$,\s]/g, '').trim();
  return parseFloat(cleaned) || 0;
}

// Extract account code from QB format (e.g., "4.1" or "6032")
function extractAccountCode(codeStr) {
  if (!codeStr) return null;
  return codeStr.trim();
}

// ============================================================================
// MAIN IMPORT FUNCTION
// ============================================================================

async function importJournalEntries(filePath, options = {}) {
  const { 
    clearExisting = false,
  } = options;

  console.log(`\n📂 Reading ${filePath}...`);
  
  // Read and parse CSV
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const rows = parse(fileContent, {
    columns: false, // Use array format since headers are complex
    skip_empty_lines: false,
    trim: true,
    bom: true,
    relax_column_count: true,
  });

  console.log(`📊 Found ${rows.length} rows in CSV\n`);

  // Clear existing if requested
  if (clearExisting) {
    console.log('🗑️  Clearing existing journal entries...');
    await db.query('DELETE FROM journal_entry_lines');
    await db.query('DELETE FROM journal_entries');
  }

  // Build account code to ID mapping from accounts_chart
  const accountsResult = await db.query('SELECT id, account_code, name FROM accounts_chart');
  const accountMap = new Map();
  accountsResult.rows.forEach(acc => {
    accountMap.set(acc.account_code, acc.id);
    // Also map by name for fallback
    accountMap.set(acc.name.toLowerCase(), acc.id);
  });
  console.log(`📋 Loaded ${accountMap.size / 2} accounts from chart of accounts\n`);

  // Track results
  const results = { 
    entries: 0, 
    lines: 0,
    skipped: 0,
    unmappedAccounts: new Set(),
    errors: [],
  };

  // Parse transactions
  // Format: First column has entry ID, detail rows have empty first column
  let currentEntryId = null;
  let currentEntry = null;
  let currentLines = [];
  let entryCounter = 0;

  // Skip header rows (first 5 lines)
  const dataRows = rows.slice(5);

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    
    // Skip empty rows and total rows
    if (!row || row.length === 0) continue;
    if (row[0] && row[0].toString().startsWith('Total for')) continue;
    if (row[0] && row[0].toString().startsWith('TOTAL')) continue;
    if (row[0] && row[0].toString().includes('Friday,')) continue; // Footer

    try {
      const firstCol = row[0]?.toString().trim();
      
      // New entry header (has ID in first column, rest empty)
      if (firstCol && !row[1] && !row[2]) {
        // Save previous entry if exists
        if (currentEntry && currentLines.length > 0) {
          await saveJournalEntry(currentEntry, currentLines, accountMap, results);
        }
        
        // Start new entry
        currentEntryId = firstCol;
        currentEntry = null;
        currentLines = [];
        continue;
      }
      
      // Detail line (empty first column, has data in other columns)
      if (!firstCol && row[1]) {
        const date = parseDate(row[1]);
        const txnType = row[2]?.toString().trim() || '';
        const num = row[3]?.toString().trim() || '';
        const name = row[4]?.toString().trim() || '';
        const memo = row[5]?.toString().trim() || '';
        const accountCode = extractAccountCode(row[6]);
        const accountName = row[7]?.toString().trim() || '';
        const debit = parseAmount(row[8]);
        const credit = parseAmount(row[9]);

        // Set entry header info from first detail line
        if (!currentEntry && date) {
          entryCounter++;
          currentEntry = {
            qbId: currentEntryId,
            entryNumber: `QB-${currentEntryId || entryCounter}`,
            date: date,
            txnType: txnType,
            reference: num || null,
            description: [name, memo].filter(Boolean).join(' - ') || txnType || 'Journal Entry',
          };
        }

        // Add line if has amount
        if (debit > 0 || credit > 0) {
          currentLines.push({
            accountCode,
            accountName,
            debit,
            credit,
            description: memo || name || '',
          });
        }
      }
    } catch (err) {
      results.errors.push({ row: i + 6, error: err.message });
    }
  }

  // Save last entry
  if (currentEntry && currentLines.length > 0) {
    await saveJournalEntry(currentEntry, currentLines, accountMap, results);
  }

  console.log(`\n\n✅ Import Complete!`);
  console.log(`   Journal Entries: ${results.entries}`);
  console.log(`   Entry Lines:     ${results.lines}`);
  console.log(`   Skipped:         ${results.skipped}`);
  
  if (results.unmappedAccounts.size > 0) {
    console.log(`\n⚠️  Unmapped Accounts (${results.unmappedAccounts.size}):`);
    [...results.unmappedAccounts].slice(0, 10).forEach(acc => console.log(`     - ${acc}`));
    if (results.unmappedAccounts.size > 10) {
      console.log(`     ... and ${results.unmappedAccounts.size - 10} more`);
    }
  }
  
  if (results.errors.length > 0) {
    console.log(`\n   Errors: ${results.errors.length}`);
    results.errors.slice(0, 5).forEach(e => console.log(`     - Row ${e.row}: ${e.error}`));
  }

  return results;
}

// Save a journal entry with its lines
async function saveJournalEntry(entry, lines, accountMap, results) {
  try {
    // Calculate totals
    const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);

    // Skip if unbalanced (shouldn't happen with QB data)
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      console.log(`  ⚠️  Skipping unbalanced entry ${entry.entryNumber}: D=${totalDebit} C=${totalCredit}`);
      results.skipped++;
      return;
    }

    // Insert journal entry header
    const entryResult = await db.query(`
      INSERT INTO journal_entries (
        entry_number, entry_date, reference, description,
        source_type, status, total_debit, total_credit, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
      entry.entryNumber,
      entry.date,
      entry.reference,
      entry.description.substring(0, 500),
      'qb_import',
      'posted', // Mark as posted since these are historical
      totalDebit,
      totalCredit,
      `QB Type: ${entry.txnType}`,
    ]);

    const entryId = entryResult.rows[0].id;
    results.entries++;

    // Insert lines
    let lineNumber = 1;
    for (const line of lines) {
      // Find account ID
      let accountId = accountMap.get(line.accountCode);
      
      // Try matching by name if code didn't work
      if (!accountId && line.accountName) {
        // Try exact match first
        accountId = accountMap.get(line.accountName.toLowerCase());
        
        // Try extracting last part of hierarchical name
        if (!accountId) {
          const nameParts = line.accountName.split(':');
          const lastPart = nameParts[nameParts.length - 1].trim().toLowerCase();
          accountId = accountMap.get(lastPart);
        }
      }

      if (!accountId) {
        results.unmappedAccounts.add(`${line.accountCode}: ${line.accountName}`);
        // Create a placeholder account
        accountId = await getOrCreateAccount(line.accountCode, line.accountName, accountMap);
      }

      if (accountId) {
        await db.query(`
          INSERT INTO journal_entry_lines (
            journal_entry_id, line_number, account_id,
            debit, credit, description
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          entryId,
          lineNumber++,
          accountId,
          line.debit,
          line.credit,
          line.description.substring(0, 255),
        ]);
        results.lines++;
      }
    }

    // Progress indicator
    if (results.entries % 500 === 0) {
      process.stdout.write(`  ✓ ${results.entries} entries imported...\r`);
    }

  } catch (err) {
    results.errors.push({ entry: entry.entryNumber, error: err.message });
    results.skipped++;
  }
}

// Get or create an account for unmapped QB accounts
async function getOrCreateAccount(code, name, accountMap) {
  // Determine account type from code/name
  let accountType = 'expense';
  let accountSubtype = 'operating_expense';
  
  const codeLower = (code || '').toLowerCase();
  const nameLower = (name || '').toLowerCase();
  
  if (codeLower.startsWith('1') || codeLower.startsWith('2') || codeLower.startsWith('3') || 
      nameLower.includes('asset') || nameLower.includes('checking') || nameLower.includes('savings') ||
      nameLower.includes('bank') || nameLower.includes('equipment')) {
    accountType = 'asset';
    accountSubtype = 'other_asset';
  } else if (codeLower.startsWith('4') || nameLower.includes('income') || nameLower.includes('sales') ||
             nameLower.includes('revenue')) {
    accountType = 'revenue';
    accountSubtype = 'sales';
  } else if (nameLower.includes('payable') || nameLower.includes('liability') || 
             nameLower.includes('credit card') || nameLower.includes('loan')) {
    accountType = 'liability';
    accountSubtype = 'current_liability';
  } else if (nameLower.includes('equity') || nameLower.includes('capital') || 
             nameLower.includes('distribution') || nameLower.includes('contribution')) {
    accountType = 'equity';
    accountSubtype = 'owners_equity';
  }

  const normalBalance = ['asset', 'expense'].includes(accountType) ? 'debit' : 'credit';

  // Clean up account code
  let cleanCode = code || '';
  if (cleanCode.length > 15) cleanCode = cleanCode.substring(0, 15);
  if (!cleanCode) cleanCode = `AUTO-${Date.now()}`;

  // Extract simple name from hierarchical name
  let simpleName = name || cleanCode;
  if (simpleName.includes(':')) {
    const parts = simpleName.split(':');
    simpleName = parts[parts.length - 1].trim();
  }
  if (simpleName.length > 100) simpleName = simpleName.substring(0, 100);

  try {
    const result = await db.query(`
      INSERT INTO accounts_chart (account_code, name, account_type, account_subtype, normal_balance, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (account_code) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [cleanCode, simpleName, accountType, accountSubtype, normalBalance, `Auto-created from QB import: ${name}`]);
    
    const newId = result.rows[0].id;
    accountMap.set(cleanCode, newId);
    accountMap.set(simpleName.toLowerCase(), newId);
    return newId;
  } catch (err) {
    // Try to fetch existing
    const existing = await db.query('SELECT id FROM accounts_chart WHERE account_code = $1', [cleanCode]);
    if (existing.rows.length > 0) {
      accountMap.set(cleanCode, existing.rows[0].id);
      return existing.rows[0].id;
    }
    return null;
  }
}

// ============================================================================
// RUN IMPORT
// ============================================================================

const csvPath = path.join(__dirname, '../documents/Hood_Youmans___Hood__LLC_Journal.csv');

if (!fs.existsSync(csvPath)) {
  console.error(`❌ File not found: ${csvPath}`);
  console.log('   Place your QuickBooks Journal export at: backend/documents/Hood_Youmans___Hood__LLC_Journal.csv');
  process.exit(1);
}

// Configuration options
const importOptions = {
  clearExisting: true, // Clear existing journal entries before import
};

console.log('\n📒 QuickBooks Journal Entry Import');
console.log('===================================');
console.log(`Options: ${JSON.stringify(importOptions)}`);

importJournalEntries(csvPath, importOptions)
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