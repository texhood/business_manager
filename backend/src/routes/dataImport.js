/**
 * Data Import Routes
 * Handles CSV imports for tenant data population
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');
const multer = require('multer');
const { authenticate, requireStaff } = require('../middleware/auth');
const csv = require('csv-parse/sync');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// ============================================================================
// IMPORT CONFIGURATIONS - Define schema for each importable table
// ============================================================================

const importConfigs = {
  // Reference Tables
  animal_types: {
    label: 'Animal Types',
    category: 'Livestock Reference',
    columns: ['name', 'species', 'description'],
    required: ['name', 'species'],
    validations: {
      species: ['Cattle', 'Sheep', 'Goat', 'Poultry', 'Guard Dog', 'Other']
    },
    insertQuery: `
      INSERT INTO animal_types (tenant_id, name, species, description)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (tenant_id, name) DO UPDATE SET
        species = EXCLUDED.species,
        description = EXCLUDED.description
      RETURNING id, name
    `
  },

  animal_categories: {
    label: 'Animal Categories',
    category: 'Livestock Reference',
    columns: ['name', 'description'],
    required: ['name'],
    insertQuery: `
      INSERT INTO animal_categories (tenant_id, name, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (tenant_id, name) DO UPDATE SET
        description = EXCLUDED.description
      RETURNING id, name
    `
  },

  breeds: {
    label: 'Breeds',
    category: 'Livestock Reference',
    columns: ['name', 'species', 'description'],
    required: ['name', 'species'],
    validations: {
      species: ['Cattle', 'Sheep', 'Goat', 'Poultry', 'Guard Dog', 'Other']
    },
    insertQuery: `
      INSERT INTO breeds (tenant_id, name, species, description)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (tenant_id, name) DO UPDATE SET
        species = EXCLUDED.species,
        description = EXCLUDED.description
      RETURNING id, name
    `
  },

  animal_owners: {
    label: 'Animal Owners',
    category: 'Livestock Reference',
    columns: ['name', 'contact_info', 'is_active'],
    required: ['name'],
    insertQuery: `
      INSERT INTO animal_owners (tenant_id, name, contact_info, is_active)
      VALUES ($1, $2, $3, COALESCE($4::boolean, true))
      ON CONFLICT (tenant_id, name) DO UPDATE SET
        contact_info = EXCLUDED.contact_info,
        is_active = EXCLUDED.is_active
      RETURNING id, name
    `
  },

  pastures: {
    label: 'Pastures',
    category: 'Livestock Reference',
    columns: ['name', 'size_acres', 'location', 'latitude', 'longitude', 'productivity_rating', 'notes', 'is_active'],
    required: ['name'],
    insertQuery: `
      INSERT INTO pastures (tenant_id, name, size_acres, location, latitude, longitude, productivity_rating, notes, is_active)
      VALUES ($1, $2, $3::numeric, $4, $5::numeric, $6::numeric, $7::numeric, $8, COALESCE($9::boolean, true))
      ON CONFLICT (tenant_id, name) DO UPDATE SET
        size_acres = EXCLUDED.size_acres,
        location = EXCLUDED.location,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        productivity_rating = EXCLUDED.productivity_rating,
        notes = EXCLUDED.notes,
        is_active = EXCLUDED.is_active
      RETURNING id, name
    `
  },

  buyers: {
    label: 'Buyers',
    category: 'Livestock Reference',
    columns: ['name', 'contact_name', 'phone', 'email', 'address', 'notes', 'is_active'],
    required: ['name'],
    insertQuery: `
      INSERT INTO buyers (tenant_id, name, contact_name, phone, email, address, notes, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::boolean, true))
      ON CONFLICT (tenant_id, name) DO UPDATE SET
        contact_name = EXCLUDED.contact_name,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        address = EXCLUDED.address,
        notes = EXCLUDED.notes,
        is_active = EXCLUDED.is_active
      RETURNING id, name
    `
  },

  sale_fee_types: {
    label: 'Sale Fee Types',
    category: 'Livestock Reference',
    columns: ['name', 'description', 'default_amount', 'is_percentage', 'percentage_rate', 'is_active', 'sort_order'],
    required: ['name'],
    insertQuery: `
      INSERT INTO sale_fee_types (tenant_id, name, description, default_amount, is_percentage, percentage_rate, is_active, sort_order)
      VALUES ($1, $2, $3, $4::numeric, COALESCE($5::boolean, false), $6::numeric, COALESCE($7::boolean, true), COALESCE($8::integer, 0))
      ON CONFLICT (tenant_id, name) DO UPDATE SET
        description = EXCLUDED.description,
        default_amount = EXCLUDED.default_amount,
        is_percentage = EXCLUDED.is_percentage,
        percentage_rate = EXCLUDED.percentage_rate,
        is_active = EXCLUDED.is_active,
        sort_order = EXCLUDED.sort_order
      RETURNING id, name
    `
  },

  // Herds/Flocks
  herds_flocks: {
    label: 'Herds & Flocks',
    category: 'Livestock',
    columns: ['name', 'species', 'management_mode', 'description', 'animal_count', 'is_active', 'notes'],
    required: ['name', 'species'],
    validations: {
      species: ['cattle', 'sheep', 'goat', 'poultry', 'swine', 'other'],
      management_mode: ['individual', 'aggregate']
    },
    insertQuery: `
      INSERT INTO herds_flocks (tenant_id, name, species, management_mode, description, animal_count, is_active, notes)
      VALUES ($1, $2, $3::herd_species, COALESCE($4::herd_management_mode, 'individual'), $5, COALESCE($6::integer, 0), COALESCE($7::boolean, true), $8)
      ON CONFLICT (tenant_id, name) DO UPDATE SET
        species = EXCLUDED.species,
        management_mode = EXCLUDED.management_mode,
        description = EXCLUDED.description,
        animal_count = EXCLUDED.animal_count,
        is_active = EXCLUDED.is_active,
        notes = EXCLUDED.notes
      RETURNING id, name
    `
  },

  // Animals (complex - requires lookups and two-pass for parentage)
  animals: {
    label: 'Animals',
    category: 'Livestock',
    columns: ['ear_tag', 'name', 'animal_type', 'category', 'breed', 'herd_name', 'color_markings', 'owner', 'birth_date', 'purchase_date', 'purchase_price', 'pasture', 'status', 'notes', 'dam_ear_tag', 'sire_ear_tag'],
    required: ['ear_tag'],
    validations: {
      status: ['Active', 'Sold', 'Dead', 'Reference', 'Processed']
    },
    preprocess: true, // Requires lookup preprocessing
    customImport: true, // Uses two-pass import for parentage resolution
    insertQuery: `
      INSERT INTO animals (tenant_id, ear_tag, name, animal_type_id, category_id, breed_id, herd_id, color_markings, owner_id, birth_date, purchase_date, purchase_price, current_pasture_id, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::date, $11::date, $12::numeric, $13, COALESCE($14::animal_status, 'Active'), $15)
      ON CONFLICT (tenant_id, ear_tag) DO UPDATE SET
        name = EXCLUDED.name,
        animal_type_id = EXCLUDED.animal_type_id,
        category_id = EXCLUDED.category_id,
        breed_id = EXCLUDED.breed_id,
        herd_id = EXCLUDED.herd_id,
        color_markings = EXCLUDED.color_markings,
        owner_id = EXCLUDED.owner_id,
        birth_date = EXCLUDED.birth_date,
        purchase_date = EXCLUDED.purchase_date,
        purchase_price = EXCLUDED.purchase_price,
        current_pasture_id = EXCLUDED.current_pasture_id,
        status = EXCLUDED.status,
        notes = EXCLUDED.notes
      RETURNING id, ear_tag
    `
  },

  // Product Categories
  categories: {
    label: 'Product Categories',
    category: 'Inventory',
    columns: ['name', 'slug', 'description', 'type', 'sort_order', 'is_active'],
    required: ['name', 'slug'],
    validations: {
      type: ['income', 'expense']
    },
    insertQuery: `
      INSERT INTO categories (tenant_id, name, slug, description, type, sort_order, is_active)
      VALUES ($1, $2, $3, $4, COALESCE($5, 'expense'), COALESCE($6::integer, 0), COALESCE($7::boolean, true))
      ON CONFLICT (name) DO UPDATE SET
        slug = EXCLUDED.slug,
        description = EXCLUDED.description,
        type = EXCLUDED.type,
        sort_order = EXCLUDED.sort_order,
        is_active = EXCLUDED.is_active
      RETURNING id, name
    `
  },

  tags: {
    label: 'Product Tags',
    category: 'Inventory',
    columns: ['name', 'slug'],
    required: ['name', 'slug'],
    insertQuery: `
      INSERT INTO tags (tenant_id, name, slug)
      VALUES ($1, $2, $3)
      ON CONFLICT (name) DO UPDATE SET
        slug = EXCLUDED.slug
      RETURNING id, name
    `
  },

  // Items/Products
  items: {
    label: 'Products',
    category: 'Inventory',
    columns: ['sku', 'name', 'description', 'item_type', 'category_name', 'price', 'member_price', 'cost', 'inventory_quantity', 'low_stock_threshold', 'is_taxable', 'tax_rate', 'shipping_zone', 'weight_oz', 'is_active', 'is_featured', 'sort_order', 'status'],
    required: ['sku', 'name', 'price'],
    validations: {
      item_type: ['inventory', 'non-inventory', 'digital'],
      shipping_zone: ['not-shippable', 'in-state', 'in-country', 'no-restrictions'],
      status: ['active', 'inactive', 'draft']
    },
    preprocess: true,
    insertQuery: `
      INSERT INTO items (tenant_id, sku, name, description, item_type, category_id, price, member_price, cost, inventory_quantity, low_stock_threshold, is_taxable, tax_rate, shipping_zone, weight_oz, is_active, is_featured, sort_order, status)
      VALUES ($1, $2, $3, $4, COALESCE($5::item_type, 'inventory'), $6, $7::numeric, $8::numeric, $9::numeric, COALESCE($10::integer, 0), COALESCE($11::integer, 5), COALESCE($12::boolean, true), COALESCE($13::numeric, 0.0825), COALESCE($14::shipping_zone, 'in-state'), $15::numeric, COALESCE($16::boolean, true), COALESCE($17::boolean, false), COALESCE($18::integer, 0), COALESCE($19::item_status, 'draft'))
      ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        item_type = EXCLUDED.item_type,
        category_id = EXCLUDED.category_id,
        price = EXCLUDED.price,
        member_price = EXCLUDED.member_price,
        cost = EXCLUDED.cost,
        inventory_quantity = EXCLUDED.inventory_quantity,
        low_stock_threshold = EXCLUDED.low_stock_threshold,
        is_taxable = EXCLUDED.is_taxable,
        tax_rate = EXCLUDED.tax_rate,
        shipping_zone = EXCLUDED.shipping_zone,
        weight_oz = EXCLUDED.weight_oz,
        is_active = EXCLUDED.is_active,
        is_featured = EXCLUDED.is_featured,
        sort_order = EXCLUDED.sort_order,
        status = EXCLUDED.status
      RETURNING id, sku, name
    `
  },

  // Delivery Zones
  delivery_zones: {
    label: 'Delivery Zones',
    category: 'Operations',
    columns: ['id', 'name', 'schedule', 'radius', 'base_city', 'is_active'],
    required: ['id', 'name', 'schedule', 'base_city'],
    insertQuery: `
      INSERT INTO delivery_zones (id, name, schedule, radius, base_city, is_active)
      VALUES ($1, $2, $3, COALESCE($4::integer, 20), $5, COALESCE($6::boolean, true))
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        schedule = EXCLUDED.schedule,
        radius = EXCLUDED.radius,
        base_city = EXCLUDED.base_city,
        is_active = EXCLUDED.is_active
      RETURNING id, name
    `
  },

  // ============================================================================
  // ACCOUNTING IMPORTS
  // ============================================================================

  // Chart of Accounts
  accounts_chart: {
    label: 'Chart of Accounts',
    category: 'Accounting',
    columns: ['account_code', 'name', 'account_type', 'account_subtype', 'description', 'is_active', 'normal_balance', 'opening_balance'],
    required: ['account_code', 'name', 'account_type'],
    validations: {
      account_type: ['asset', 'liability', 'equity', 'revenue', 'expense'],
      account_subtype: ['cash', 'bank', 'accounts_receivable', 'inventory', 'fixed_asset', 'other_asset', 'accounts_payable', 'credit_card', 'current_liability', 'long_term_liability', 'owners_equity', 'retained_earnings', 'sales', 'other_income', 'cost_of_goods', 'operating_expense', 'other_expense'],
      normal_balance: ['debit', 'credit']
    },
    insertQuery: `
      INSERT INTO accounts_chart (account_code, name, account_type, account_subtype, description, is_active, normal_balance, opening_balance)
      VALUES ($1, $2, $3::account_type, $4::account_subtype, $5, COALESCE($6::boolean, true), COALESCE($7, 'debit'), COALESCE($8::numeric, 0))
      ON CONFLICT (account_code) DO UPDATE SET
        name = EXCLUDED.name,
        account_type = EXCLUDED.account_type,
        account_subtype = EXCLUDED.account_subtype,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active,
        normal_balance = EXCLUDED.normal_balance,
        opening_balance = EXCLUDED.opening_balance
      RETURNING id, account_code, name
    `
  },

  // Classes (Business Segments)
  classes: {
    label: 'Business Classes',
    category: 'Accounting',
    columns: ['name', 'description', 'is_active'],
    required: ['name'],
    insertQuery: `
      INSERT INTO classes (name, description, is_active)
      VALUES ($1, $2, COALESCE($3::boolean, true))
      ON CONFLICT (id) DO NOTHING
      RETURNING id, name
    `
  },

  // Vendors
  vendors: {
    label: 'Vendors',
    category: 'Accounting',
    columns: ['name', 'display_name', 'contact_name', 'email', 'phone', 'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country', 'website', 'tax_id', 'payment_terms', 'notes', 'default_expense_account_code', 'default_class_name', 'is_active'],
    required: ['name'],
    preprocess: true,
    insertQuery: `
      INSERT INTO vendors (tenant_id, name, display_name, contact_name, email, phone, address_line1, address_line2, city, state, postal_code, country, website, tax_id, payment_terms, notes, default_expense_account_id, default_class_id, is_active)
      VALUES ($1, $2, COALESCE($3, $2), $4, $5, $6, $7, $8, $9, $10, $11, COALESCE($12, 'USA'), $13, $14, $15, $16, $17, $18, COALESCE($19::boolean, true))
      ON CONFLICT (tenant_id, name) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        contact_name = EXCLUDED.contact_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        address_line1 = EXCLUDED.address_line1,
        address_line2 = EXCLUDED.address_line2,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        postal_code = EXCLUDED.postal_code,
        country = EXCLUDED.country,
        website = EXCLUDED.website,
        tax_id = EXCLUDED.tax_id,
        payment_terms = EXCLUDED.payment_terms,
        notes = EXCLUDED.notes,
        default_expense_account_id = EXCLUDED.default_expense_account_id,
        default_class_id = EXCLUDED.default_class_id,
        is_active = EXCLUDED.is_active
      RETURNING id, name
    `
  },

  // Transactions (Bank/Cash transactions for bookkeeping)
  transactions: {
    label: 'Transactions',
    category: 'Accounting',
    columns: ['date', 'type', 'description', 'amount', 'bank_account_code', 'gl_account_code', 'class_name', 'vendor_name', 'reference', 'category', 'is_reconciled', 'notes'],
    required: ['date', 'type', 'description', 'amount'],
    validations: {
      type: ['income', 'expense']
    },
    preprocess: true,
    customImport: true // Uses custom import logic
  },

  // Journal Entries (Flattened format - one row per line)
  journal_entries: {
    label: 'Journal Entries',
    category: 'Accounting',
    columns: ['entry_number', 'entry_date', 'description', 'reference', 'source', 'notes', 'line_account_code', 'line_description', 'line_debit', 'line_credit', 'line_class_name', 'post_immediately'],
    required: ['entry_number', 'entry_date', 'description', 'line_account_code'],
    preprocess: true,
    customImport: true // Uses custom import logic for grouping lines
  },

  // ============================================================================
  // FOOD SERVICE
  // ============================================================================

  // Menu Items
  menu_items: {
    label: 'Menu Items',
    category: 'Food Service',
    columns: ['name', 'description', 'price', 'price_label', 'category', 'is_available', 'prep_time_minutes', 'sort_order', 'is_vegetarian', 'is_vegan', 'is_gluten_free', 'is_dairy_free', 'is_spicy', 'is_featured'],
    required: ['name', 'price'],
    insertQuery: `
      INSERT INTO menu_items (tenant_id, name, description, price, price_label, category, is_available, prep_time_minutes, sort_order, is_vegetarian, is_vegan, is_gluten_free, is_dairy_free, is_spicy, is_featured)
      VALUES ($1, $2, $3, $4::numeric, $5, $6, COALESCE($7::boolean, true), $8::integer, COALESCE($9::integer, 0), COALESCE($10::boolean, false), COALESCE($11::boolean, false), COALESCE($12::boolean, false), COALESCE($13::boolean, false), COALESCE($14::boolean, false), COALESCE($15::boolean, false))
      RETURNING id, name
    `
  },

  // Modifications
  modifications: {
    label: 'Menu Modifications',
    category: 'Food Service',
    columns: ['name', 'display_name', 'price_adjustment', 'category', 'sort_order', 'is_active'],
    required: ['name'],
    insertQuery: `
      INSERT INTO modifications (tenant_id, name, display_name, price_adjustment, category, sort_order, is_active)
      VALUES ($1, $2, COALESCE($3, $2), COALESCE($4::numeric, 0), COALESCE($5, 'general'), COALESCE($6::integer, 0), COALESCE($7::boolean, true))
      RETURNING id, name
    `
  }
};

// ============================================================================
// ROUTES
// ============================================================================

// All data import routes require authentication and staff role
router.use(authenticate);
router.use(requireStaff);

// Get list of available import types
router.get('/types', async (req, res) => {
  try {
    const types = Object.entries(importConfigs).map(([key, config]) => ({
      id: key,
      label: config.label,
      category: config.category,
      columns: config.columns,
      required: config.required,
      validations: config.validations || {},
      notes: config.notes || null
    }));

    // Group by category with specific order
    const categoryOrder = ['Livestock Reference', 'Livestock', 'Inventory', 'Accounting', 'Operations', 'Food Service'];
    const grouped = {};
    
    categoryOrder.forEach(cat => {
      const catTypes = types.filter(t => t.category === cat);
      if (catTypes.length > 0) {
        grouped[cat] = catTypes;
      }
    });

    res.json({ types, grouped });
  } catch (err) {
    console.error('Failed to get import types:', err);
    res.status(500).json({ error: 'Failed to get import types' });
  }
});

// Get CSV template for a specific import type
router.get('/template/:type', (req, res) => {
  const { type } = req.params;
  const config = importConfigs[type];

  if (!config) {
    return res.status(404).json({ error: 'Import type not found' });
  }

  // Generate CSV header row
  const header = config.columns.join(',');
  
  // Generate sample rows with hints
  let sampleRows = [];
  
  if (type === 'transactions') {
    // Sample transaction rows
    sampleRows = [
      '2024-01-15,income,Farm Store Sale,250.00,1000,4000,Farm Store,Cash Customer,INV-001,Sales,false,Customer payment',
      '2024-01-16,expense,Feed Purchase,125.50,1000,5100,Livestock,Tractor Supply,PO-123,Feed,,Monthly feed order'
    ];
  } else if (type === 'vendors') {
    // Sample vendor rows
    sampleRows = [
      'Tractor Supply,Tractor Supply Co,John Smith,orders@tractorsupply.com,555-123-4567,123 Main St,,Tyler,TX,75701,USA,www.tractorsupply.com,12-3456789,Net 30,Primary feed supplier,5100,Livestock,true',
      'Farm Equipment Inc,Farm Equipment,,info@farmequip.com,555-987-6543,456 Industrial Blvd,Suite 100,Dallas,TX,75201,USA,www.farmequip.com,,,Equipment vendor,,,true'
    ];
  } else if (type === 'journal_entries') {
    // Sample journal entry (balanced entry with 2 lines)
    sampleRows = [
      'JE-001,2024-01-15,Record farm sale,INV-001,import,Opening balances,1000,Cash deposit,500.00,0.00,Farm Store,true',
      'JE-001,2024-01-15,Record farm sale,INV-001,import,Opening balances,4000,Sales revenue,0.00,500.00,Farm Store,true',
      'JE-002,2024-01-16,Feed expense,PO-123,import,,5100,Feed costs,125.50,0.00,Livestock,true',
      'JE-002,2024-01-16,Feed expense,PO-123,import,,1000,Cash payment,0.00,125.50,Livestock,true'
    ];
  } else if (type === 'animals') {
    // Sample animal rows showing parentage columns
    sampleRows = [
      'REQUIRED,,,,,,,,,,,,Active|Sold|Dead|Reference|Processed,,Dam Ear Tag,Sire Ear Tag',
      '20-001,Bessie,Cow,Breeders,Angus,Main Herd,Black,Hood Family Farms,2020-03-15,,,North Pasture,Active,Foundation cow,,',
      '24-105,,Calf,For Sale,Angus x Hereford,Spring 2024,Black Baldy,Hood Family Farms,2024-04-10,,,South Pasture,Active,Spring calf,20-001,23-B01'
    ];
  } else {
    // Default hint row
    const hintRow = config.columns.map(col => {
      if (config.required?.includes(col)) return `REQUIRED`;
      if (config.validations?.[col]) return config.validations[col].join('|');
      return '';
    }).join(',');
    sampleRows = [hintRow];
  }

  const csvContent = `${header}\n${sampleRows.join('\n')}\n`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${type}_template.csv"`);
  res.send(csvContent);
});

// Validate import data (dry run)
router.post('/validate/:type', upload.single('file'), async (req, res) => {
  const { type } = req.params;
  const config = importConfigs[type];

  if (!config) {
    return res.status(404).json({ error: 'Import type not found' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Strip BOM (Byte Order Mark) if present - Excel adds this to CSV files
    let fileContent = req.file.buffer.toString('utf-8');
    if (fileContent.charCodeAt(0) === 0xFEFF) {
      fileContent = fileContent.slice(1);
    }
    
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true  // Also enable built-in BOM handling
    });

    const errors = [];
    const warnings = [];
    const validRecords = [];

    // Special validation for journal entries - check balance
    if (type === 'journal_entries') {
      const entriesByNumber = {};
      records.forEach((record, index) => {
        const num = record.entry_number;
        if (!entriesByNumber[num]) {
          entriesByNumber[num] = { debits: 0, credits: 0, rows: [] };
        }
        entriesByNumber[num].debits += parseFloat(record.line_debit) || 0;
        entriesByNumber[num].credits += parseFloat(record.line_credit) || 0;
        entriesByNumber[num].rows.push(index + 2);
      });

      Object.entries(entriesByNumber).forEach(([num, data]) => {
        if (Math.abs(data.debits - data.credits) > 0.001) {
          warnings.push({
            row: data.rows.join(', '),
            warnings: [`Entry ${num} is unbalanced: Debits=${data.debits.toFixed(2)}, Credits=${data.credits.toFixed(2)}`]
          });
        }
      });
    }

    records.forEach((record, index) => {
      const rowNum = index + 2; // +2 for header and 0-indexing
      const rowErrors = [];
      const rowWarnings = [];

      // Check required fields
      config.required?.forEach(field => {
        if (!record[field] || record[field].trim() === '' || record[field] === 'REQUIRED') {
          rowErrors.push(`Missing required field: ${field}`);
        }
      });

      // Check validations
      Object.entries(config.validations || {}).forEach(([field, allowedValues]) => {
        if (record[field] && !allowedValues.includes(record[field])) {
          rowErrors.push(`Invalid value for ${field}: "${record[field]}". Allowed: ${allowedValues.join(', ')}`);
        }
      });

      // Check for unknown columns
      Object.keys(record).forEach(key => {
        if (!config.columns.includes(key)) {
          rowWarnings.push(`Unknown column will be ignored: ${key}`);
        }
      });

      if (rowErrors.length > 0) {
        errors.push({ row: rowNum, errors: rowErrors });
      }
      if (rowWarnings.length > 0) {
        warnings.push({ row: rowNum, warnings: rowWarnings });
      }
      if (rowErrors.length === 0) {
        validRecords.push(record);
      }
    });

    res.json({
      totalRows: records.length,
      validRows: validRecords.length,
      invalidRows: errors.length,
      errors,
      warnings,
      preview: validRecords.slice(0, 5) // Preview first 5 valid records
    });
  } catch (err) {
    console.error('Validation error:', err);
    res.status(400).json({ error: 'Failed to parse CSV: ' + err.message });
  }
});

// Execute import
router.post('/execute/:type', upload.single('file'), async (req, res) => {
  const { type } = req.params;
  // Get tenant from authenticated user, fall back to body param for super_admin
  const tenantId = req.user.tenant_id || req.body.tenant_id;
  
  if (!tenantId) {
    return res.status(400).json({ error: 'No tenant context. User must belong to a tenant or provide tenant_id.' });
  }
  
  console.log(`[DataImport] Importing ${type} for tenant ${tenantId} by user ${req.user.email}`);
  const config = importConfigs[type];

  if (!config) {
    return res.status(404).json({ error: 'Import type not found' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const client = await pool.connect();

  try {
    // Strip BOM (Byte Order Mark) if present - Excel adds this to CSV files
    let fileContent = req.file.buffer.toString('utf-8');
    if (fileContent.charCodeAt(0) === 0xFEFF) {
      fileContent = fileContent.slice(1);
    }
    
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true  // Also enable built-in BOM handling
    });

    await client.query('BEGIN');

    const results = {
      success: [],
      errors: [],
      skipped: []
    };

    // Build lookup maps if preprocessing is required
    let lookups = {};
    if (config.preprocess) {
      lookups = await buildLookups(client, type, tenantId);
    }

    // Handle custom import types
    if (config.customImport) {
      if (type === 'transactions') {
        await importTransactions(client, records, tenantId, lookups, results);
      } else if (type === 'journal_entries') {
        await importJournalEntries(client, records, tenantId, lookups, results);
      } else if (type === 'animals') {
        await importAnimals(client, records, tenantId, lookups, results);
      }
    } else {
      // Standard import
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const rowNum = i + 2;

        try {
          // Skip template rows and human-readable header rows
          if (config.required?.some(field => record[field] === 'REQUIRED')) {
            results.skipped.push({ row: rowNum, reason: 'Template/sample row' });
            continue;
          }
          
          // Skip rows that look like human-readable column labels (e.g., "Ear Tag" for ear_tag)
          if (isLabelRow(record, config.columns)) {
            results.skipped.push({ row: rowNum, reason: 'Human-readable header row' });
            continue;
          }

          // Validate required fields
          const missingRequired = config.required?.filter(field => !record[field] || record[field].trim() === '');
          if (missingRequired?.length > 0) {
            results.errors.push({ row: rowNum, error: `Missing required fields: ${missingRequired.join(', ')}` });
            continue;
          }

          // Build parameters array based on table type
          const params = buildParams(type, record, tenantId, lookups, config);

          const result = await client.query(config.insertQuery, params);
          if (result.rows.length > 0) {
            results.success.push({ row: rowNum, record: result.rows[0] });
          }
        } catch (err) {
          results.errors.push({ row: rowNum, error: err.message });
        }
      }
    }

    await client.query('COMMIT');

    const response = {
      totalRows: records.length,
      imported: results.success.length,
      errors: results.errors.length,
      skipped: results.skipped.length,
      details: results
    };
    
    // Include parentage summary for animal imports
    if (results.parentageSummary) {
      response.parentageSummary = results.parentageSummary;
    }

    res.json(response);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Import error:', err);
    res.status(500).json({ error: 'Import failed: ' + err.message });
  } finally {
    client.release();
  }
});

// ============================================================================
// CUSTOM IMPORT FUNCTIONS
// ============================================================================

/**
 * Import transactions with account lookups
 */
async function importTransactions(client, records, tenantId, lookups, results) {
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const rowNum = i + 2;

    try {
      // Skip template/sample rows
      if (record.date === 'REQUIRED' || record.type === 'income|expense') {
        results.skipped.push({ row: rowNum, reason: 'Template/sample row' });
        continue;
      }

      // Validate required fields
      if (!record.date || !record.type || !record.description || !record.amount) {
        results.errors.push({ row: rowNum, error: 'Missing required fields: date, type, description, or amount' });
        continue;
      }

      // Lookup bank account by code
      let bankAccountId = null;
      if (record.bank_account_code) {
        bankAccountId = lookups.bank_accounts?.[record.bank_account_code] || null;
        if (!bankAccountId && record.bank_account_code) {
          results.errors.push({ row: rowNum, error: `Bank account not found: ${record.bank_account_code}` });
          continue;
        }
      }

      // Lookup GL account by code
      let glAccountId = null;
      if (record.gl_account_code) {
        glAccountId = lookups.accounts_chart?.[record.gl_account_code] || null;
      }

      // Lookup class by name
      let classId = null;
      if (record.class_name) {
        classId = lookups.classes?.[record.class_name.toLowerCase()] || null;
      }

      // Lookup vendor by name
      let vendorId = null;
      if (record.vendor_name) {
        vendorId = lookups.vendors?.[record.vendor_name.toLowerCase()] || null;
        // If vendor doesn't exist, create it
        if (!vendorId && record.vendor_name.trim()) {
          const vendorResult = await client.query(
            `INSERT INTO vendors (tenant_id, name, display_name, is_active) 
             VALUES ($1, $2, $2, true) 
             ON CONFLICT (tenant_id, name) DO UPDATE SET name = EXCLUDED.name
             RETURNING id`,
            [tenantId, record.vendor_name.trim()]
          );
          if (vendorResult.rows.length > 0) {
            vendorId = vendorResult.rows[0].id;
            // Add to lookups for future rows
            lookups.vendors[record.vendor_name.toLowerCase()] = vendorId;
          }
        }
      }

      const insertQuery = `
        INSERT INTO transactions (
          date, type, description, amount, bank_account_id, 
          accepted_gl_account_id, class_id, vendor_id, reference, 
          category, is_reconciled, notes, source, acceptance_status
        )
        VALUES (
          $1::date, $2::transaction_type, $3, $4::numeric, $5,
          $6, $7, $8, $9,
          $10, COALESCE($11::boolean, false), $12, 'import', 
          CASE WHEN $6 IS NOT NULL THEN 'accepted' ELSE 'pending' END
        )
        RETURNING id, date, description, amount
      `;

      const params = [
        record.date,
        record.type,
        record.description,
        record.amount,
        bankAccountId,
        glAccountId,
        classId,
        vendorId,
        record.reference || null,
        record.category || null,
        record.is_reconciled || false,
        record.notes || null
      ];

      const result = await client.query(insertQuery, params);
      if (result.rows.length > 0) {
        results.success.push({ row: rowNum, record: result.rows[0] });
      }
    } catch (err) {
      results.errors.push({ row: rowNum, error: err.message });
    }
  }
}

/**
 * Import journal entries with grouped lines
 * CSV format is flattened - each row is a journal entry line
 * Lines with the same entry_number are grouped into one entry
 */
async function importJournalEntries(client, records, tenantId, lookups, results) {
  // Group records by entry_number
  const entriesMap = new Map();
  
  records.forEach((record, index) => {
    const rowNum = index + 2;
    const entryNum = record.entry_number;
    
    if (!entryNum || entryNum === 'REQUIRED') {
      results.skipped.push({ row: rowNum, reason: 'Template/sample row or missing entry_number' });
      return;
    }

    if (!entriesMap.has(entryNum)) {
      entriesMap.set(entryNum, {
        header: {
          entry_number: record.entry_number,
          entry_date: record.entry_date,
          description: record.description,
          reference: record.reference || null,
          source: record.source || 'import',
          notes: record.notes || null,
          post_immediately: record.post_immediately === 'true' || record.post_immediately === '1'
        },
        lines: [],
        rows: []
      });
    }
    
    entriesMap.get(entryNum).lines.push({
      account_code: record.line_account_code,
      description: record.line_description || null,
      debit: parseFloat(record.line_debit) || 0,
      credit: parseFloat(record.line_credit) || 0,
      class_name: record.line_class_name || null
    });
    entriesMap.get(entryNum).rows.push(rowNum);
  });

  // Process each grouped entry
  for (const [entryNum, entryData] of entriesMap) {
    try {
      const { header, lines, rows } = entryData;

      // Validate entry has lines
      if (lines.length === 0) {
        results.errors.push({ row: rows.join(', '), error: `Entry ${entryNum} has no lines` });
        continue;
      }

      // Validate required header fields
      if (!header.entry_date || !header.description) {
        results.errors.push({ row: rows.join(', '), error: `Entry ${entryNum} missing entry_date or description` });
        continue;
      }

      // Calculate totals
      const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
      const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);

      // Check balance (with small tolerance for floating point)
      if (Math.abs(totalDebit - totalCredit) > 0.001) {
        results.errors.push({ 
          row: rows.join(', '), 
          error: `Entry ${entryNum} is unbalanced: Debits=${totalDebit.toFixed(2)}, Credits=${totalCredit.toFixed(2)}` 
        });
        continue;
      }

      // Insert journal entry header
      const entryResult = await client.query(`
        INSERT INTO journal_entries (
          entry_number, entry_date, description, reference, source, notes,
          total_debit, total_credit, status
        )
        VALUES ($1, $2::date, $3, $4, $5, $6, $7::numeric, $8::numeric, 'draft')
        ON CONFLICT (entry_number) DO UPDATE SET
          entry_date = EXCLUDED.entry_date,
          description = EXCLUDED.description,
          reference = EXCLUDED.reference,
          source = EXCLUDED.source,
          notes = EXCLUDED.notes,
          total_debit = EXCLUDED.total_debit,
          total_credit = EXCLUDED.total_credit
        RETURNING id, entry_number
      `, [
        header.entry_number,
        header.entry_date,
        header.description,
        header.reference,
        header.source,
        header.notes,
        totalDebit,
        totalCredit
      ]);

      const journalEntryId = entryResult.rows[0].id;

      // Delete existing lines for this entry (for upsert behavior)
      await client.query('DELETE FROM journal_entry_lines WHERE journal_entry_id = $1', [journalEntryId]);

      // Insert lines
      let lineNumber = 1;
      for (const line of lines) {
        // Lookup account
        const accountId = lookups.accounts_chart?.[line.account_code];
        if (!accountId) {
          results.errors.push({ row: rows.join(', '), error: `Account not found for entry ${entryNum}: ${line.account_code}` });
          continue;
        }

        // Lookup class
        let classId = null;
        if (line.class_name) {
          classId = lookups.classes?.[line.class_name.toLowerCase()] || null;
        }

        await client.query(`
          INSERT INTO journal_entry_lines (
            journal_entry_id, line_number, account_id, description, debit, credit, class_id
          )
          VALUES ($1, $2, $3, $4, $5::numeric, $6::numeric, $7)
        `, [
          journalEntryId,
          lineNumber++,
          accountId,
          line.description,
          line.debit,
          line.credit,
          classId
        ]);
      }

      // Post immediately if requested
      if (header.post_immediately) {
        await client.query(`
          UPDATE journal_entries 
          SET status = 'posted', posted_at = NOW()
          WHERE id = $1
        `, [journalEntryId]);
      }

      results.success.push({ 
        row: rows.join(', '), 
        record: { entry_number: header.entry_number, lines: lines.length, posted: header.post_immediately }
      });

    } catch (err) {
      results.errors.push({ row: entryData.rows.join(', '), error: err.message });
    }
  }
}

/**
 * Import animals with two-pass approach for parentage resolution
 * Pass 1: Insert/update all animals (without dam_id/sire_id)
 * Pass 2: Update dam_id and sire_id by looking up ear tags
 */
async function importAnimals(client, records, tenantId, lookups, results) {
  const getValue = (record, key) => record[key] === '' ? null : record[key];
  
  // Track parentage for second pass
  const parentageUpdates = [];
  
  // PASS 1: Insert/update all animals
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const rowNum = i + 2;

    try {
      // Skip template/sample rows
      if (record.ear_tag === 'REQUIRED') {
        results.skipped.push({ row: rowNum, reason: 'Template/sample row' });
        continue;
      }
      
      // Skip rows that look like human-readable column labels
      if (isLabelRow(record, importConfigs.animals.columns)) {
        results.skipped.push({ row: rowNum, reason: 'Human-readable header row' });
        continue;
      }

      // Validate required fields
      if (!record.ear_tag || record.ear_tag.trim() === '') {
        results.errors.push({ row: rowNum, error: 'Missing required field: ear_tag' });
        continue;
      }

      // Build parameters for insert
      const params = [
        tenantId,
        record.ear_tag,
        getValue(record, 'name'),
        lookups.animal_types?.[record.animal_type?.toLowerCase()?.trim()] || null,
        lookups.animal_categories?.[record.category?.toLowerCase()?.trim()] || null,
        lookups.breeds?.[record.breed?.toLowerCase()?.trim()] || null,
        lookups.herds_flocks?.[record.herd_name?.toLowerCase()?.trim()] || null,
        getValue(record, 'color_markings'),
        lookups.animal_owners?.[record.owner?.toLowerCase()?.trim()] || null,
        parseDate(record.birth_date),
        parseDate(record.purchase_date),
        parseCurrency(record.purchase_price),
        lookups.pastures?.[record.pasture?.toLowerCase()?.trim()] || null,
        getValue(record, 'status'),
        getValue(record, 'notes')
      ];

      const result = await client.query(importConfigs.animals.insertQuery, params);
      
      if (result.rows.length > 0) {
        results.success.push({ row: rowNum, record: result.rows[0] });
        
        // Track parentage for second pass if dam or sire ear tags provided
        const damEarTag = getValue(record, 'dam_ear_tag')?.trim();
        const sireEarTag = getValue(record, 'sire_ear_tag')?.trim();
        
        if (damEarTag || sireEarTag) {
          parentageUpdates.push({
            rowNum,
            animalId: result.rows[0].id,
            earTag: record.ear_tag,
            damEarTag,
            sireEarTag
          });
        }
      }
    } catch (err) {
      results.errors.push({ row: rowNum, error: err.message });
    }
  }
  
  // PASS 2: Update parentage relationships
  if (parentageUpdates.length > 0) {
    // Build lookup of all animals by ear_tag for this tenant
    const animalsResult = await client.query(
      'SELECT id, ear_tag FROM animals WHERE tenant_id = $1',
      [tenantId]
    );
    const animalsByEarTag = Object.fromEntries(
      animalsResult.rows.map(r => [r.ear_tag.toLowerCase().trim(), r.id])
    );
    
    let parentageSuccessCount = 0;
    let parentageErrorCount = 0;
    
    for (const update of parentageUpdates) {
      try {
        let damId = null;
        let sireId = null;
        const warnings = [];
        
        // Lookup dam by ear tag
        if (update.damEarTag) {
          damId = animalsByEarTag[update.damEarTag.toLowerCase().trim()] || null;
          if (!damId) {
            warnings.push(`Dam not found: ${update.damEarTag}`);
          }
        }
        
        // Lookup sire by ear tag
        if (update.sireEarTag) {
          sireId = animalsByEarTag[update.sireEarTag.toLowerCase().trim()] || null;
          if (!sireId) {
            warnings.push(`Sire not found: ${update.sireEarTag}`);
          }
        }
        
        // Update the animal with dam_id and/or sire_id
        if (damId || sireId) {
          await client.query(
            `UPDATE animals 
             SET dam_id = COALESCE($2, dam_id), 
                 sire_id = COALESCE($3, sire_id),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [update.animalId, damId, sireId]
          );
          parentageSuccessCount++;
        }
        
        // Log warnings if parents couldn't be found
        if (warnings.length > 0) {
          // Find the success entry for this row and add a note
          const successEntry = results.success.find(s => s.row === update.rowNum);
          if (successEntry) {
            successEntry.warnings = warnings;
          }
        }
      } catch (err) {
        parentageErrorCount++;
        // Find the success entry and note the parentage error
        const successEntry = results.success.find(s => s.row === update.rowNum);
        if (successEntry) {
          successEntry.parentageError = err.message;
        }
      }
    }
    
    // Add parentage summary to results
    results.parentageSummary = {
      attempted: parentageUpdates.length,
      updated: parentageSuccessCount,
      errors: parentageErrorCount
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Detect if a row looks like a human-readable header row
 * e.g., "Ear Tag" instead of actual ear tag data like "20-279"
 */
function isLabelRow(record, columns) {
  // Common patterns that indicate a label row
  const labelPatterns = [
    /^[A-Z][a-z]+ [A-Z][a-z]+$/, // "Ear Tag", "Birth Date"
    /^[A-Z][a-z]+$/,              // "Name", "Breed", "Status"
  ];
  
  // Check if multiple columns have label-like values
  let labelLikeCount = 0;
  for (const col of columns) {
    const value = record[col];
    if (value) {
      // Check for exact matches to common header labels
      const lowerValue = value.toLowerCase().trim();
      const headerLabels = ['ear tag', 'name', 'animal type', 'breed', 'color markings', 
                           'birth date', 'purchase date', 'purchase price', 'status',
                           'ownership', 'owner', 'category', 'notes', 'description'];
      if (headerLabels.includes(lowerValue)) {
        labelLikeCount++;
      }
    }
  }
  
  // If 3+ columns look like headers, skip this row
  return labelLikeCount >= 3;
}

/**
 * Parse date from various formats (MM-DD-YYYY, MM/DD/YYYY, YYYY-MM-DD)
 */
function parseDate(value) {
  if (!value || value.trim() === '') return null;
  
  const trimmed = value.trim();
  
  // Check for MM-DD-YYYY or MM/DD/YYYY format
  const mdyMatch = trimmed.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (mdyMatch) {
    const [, month, day, year] = mdyMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Check for YYYY-MM-DD format (already correct)
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymdMatch) {
    return trimmed;
  }
  
  // Return as-is and let PostgreSQL try to parse it
  return trimmed;
}

/**
 * Parse currency value (remove $, commas, etc.)
 */
function parseCurrency(value) {
  if (!value || value.trim() === '') return null;
  
  // Remove $, commas, and whitespace
  const cleaned = value.replace(/[$,\s]/g, '').trim();
  
  if (cleaned === '') return null;
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

async function buildLookups(client, type, tenantId) {
  const lookups = {};

  if (type === 'animals') {
    // Load lookup tables for animals
    const [types, categories, breeds, herds, owners, pastures] = await Promise.all([
      client.query('SELECT id, name FROM animal_types WHERE tenant_id = $1', [tenantId]),
      client.query('SELECT id, name FROM animal_categories WHERE tenant_id = $1', [tenantId]),
      client.query('SELECT id, name FROM breeds WHERE tenant_id = $1', [tenantId]),
      client.query('SELECT id, name FROM herds_flocks WHERE tenant_id = $1', [tenantId]),
      client.query('SELECT id, name FROM animal_owners WHERE tenant_id = $1', [tenantId]),
      client.query('SELECT id, name FROM pastures WHERE tenant_id = $1', [tenantId])
    ]);

    lookups.animal_types = Object.fromEntries(types.rows.map(r => [r.name.toLowerCase(), r.id]));
    lookups.animal_categories = Object.fromEntries(categories.rows.map(r => [r.name.toLowerCase(), r.id]));
    lookups.breeds = Object.fromEntries(breeds.rows.map(r => [r.name.toLowerCase(), r.id]));
    lookups.herds_flocks = Object.fromEntries(herds.rows.map(r => [r.name.toLowerCase(), r.id]));
    lookups.animal_owners = Object.fromEntries(owners.rows.map(r => [r.name.toLowerCase(), r.id]));
    lookups.pastures = Object.fromEntries(pastures.rows.map(r => [r.name.toLowerCase(), r.id]));
  }

  if (type === 'items') {
    const categories = await client.query('SELECT id, name FROM categories WHERE tenant_id = $1', [tenantId]);
    lookups.categories = Object.fromEntries(categories.rows.map(r => [r.name.toLowerCase(), r.id]));
  }

  if (type === 'transactions' || type === 'journal_entries') {
    // Load chart of accounts by account_code
    const accounts = await client.query('SELECT id, account_code FROM accounts_chart');
    lookups.accounts_chart = Object.fromEntries(accounts.rows.map(r => [r.account_code, r.id]));

    // Load classes by name
    const classes = await client.query('SELECT id, name FROM classes');
    lookups.classes = Object.fromEntries(classes.rows.map(r => [r.name.toLowerCase(), r.id]));

    // Load bank accounts (accounts with subtype = 'bank')
    const bankAccounts = await client.query("SELECT id, account_code FROM accounts_chart WHERE account_subtype = 'bank'");
    lookups.bank_accounts = Object.fromEntries(bankAccounts.rows.map(r => [r.account_code, r.id]));

    // Load vendors by name
    const vendors = await client.query('SELECT id, name FROM vendors WHERE tenant_id = $1', [tenantId]);
    lookups.vendors = Object.fromEntries(vendors.rows.map(r => [r.name.toLowerCase(), r.id]));
  }

  if (type === 'vendors') {
    // Load chart of accounts by account_code for default expense account
    const accounts = await client.query('SELECT id, account_code FROM accounts_chart');
    lookups.accounts_chart = Object.fromEntries(accounts.rows.map(r => [r.account_code, r.id]));

    // Load classes by name for default class
    const classes = await client.query('SELECT id, name FROM classes');
    lookups.classes = Object.fromEntries(classes.rows.map(r => [r.name.toLowerCase(), r.id]));
  }

  return lookups;
}

function buildParams(type, record, tenantId, lookups, config) {
  const getValue = (key) => record[key] === '' ? null : record[key];

  switch (type) {
    case 'animal_types':
      return [tenantId, record.name, record.species, getValue('description')];

    case 'animal_categories':
      return [tenantId, record.name, getValue('description')];

    case 'breeds':
      return [tenantId, record.name, record.species, getValue('description')];

    case 'animal_owners':
      return [tenantId, record.name, getValue('contact_info'), getValue('is_active')];

    case 'pastures':
      return [tenantId, record.name, getValue('size_acres'), getValue('location'), 
              getValue('latitude'), getValue('longitude'), getValue('productivity_rating'), 
              getValue('notes'), getValue('is_active')];

    case 'buyers':
      return [tenantId, record.name, getValue('contact_name'), getValue('phone'), 
              getValue('email'), getValue('address'), getValue('notes'), getValue('is_active')];

    case 'sale_fee_types':
      return [tenantId, record.name, getValue('description'), getValue('default_amount'),
              getValue('is_percentage'), getValue('percentage_rate'), getValue('is_active'), getValue('sort_order')];

    case 'herds_flocks':
      return [tenantId, record.name, record.species.toLowerCase(), getValue('management_mode'),
              getValue('description'), getValue('animal_count'), getValue('is_active'), getValue('notes')];

    case 'animals':
      return [
        tenantId,
        record.ear_tag,
        getValue('name'),
        lookups.animal_types?.[record.animal_type?.toLowerCase()?.trim()] || null,
        lookups.animal_categories?.[record.category?.toLowerCase()?.trim()] || null,
        lookups.breeds?.[record.breed?.toLowerCase()?.trim()] || null,
        lookups.herds_flocks?.[record.herd_name?.toLowerCase()?.trim()] || null,
        getValue('color_markings'),
        lookups.animal_owners?.[record.owner?.toLowerCase()?.trim()] || null,
        parseDate(record.birth_date),
        parseDate(record.purchase_date),
        parseCurrency(record.purchase_price),
        lookups.pastures?.[record.pasture?.toLowerCase()?.trim()] || null,
        getValue('status'),
        getValue('notes')
      ];

    case 'categories':
      return [tenantId, record.name, record.slug, getValue('description'), 
              getValue('type'), getValue('sort_order'), getValue('is_active')];

    case 'tags':
      return [tenantId, record.name, record.slug];

    case 'items':
      return [
        tenantId,
        record.sku,
        record.name,
        getValue('description'),
        getValue('item_type'),
        lookups.categories?.[record.category_name?.toLowerCase()] || null,
        record.price,
        getValue('member_price'),
        getValue('cost'),
        getValue('inventory_quantity'),
        getValue('low_stock_threshold'),
        getValue('is_taxable'),
        getValue('tax_rate'),
        getValue('shipping_zone'),
        getValue('weight_oz'),
        getValue('is_active'),
        getValue('is_featured'),
        getValue('sort_order'),
        getValue('status')
      ];

    case 'delivery_zones':
      return [record.id, record.name, record.schedule, getValue('radius'), 
              record.base_city, getValue('is_active')];

    case 'accounts_chart':
      return [record.account_code, record.name, record.account_type, getValue('account_subtype'),
              getValue('description'), getValue('is_active'), getValue('normal_balance'), getValue('opening_balance')];

    case 'classes':
      return [record.name, getValue('description'), getValue('is_active')];

    case 'vendors':
      return [
        tenantId,
        record.name,
        getValue('display_name'),
        getValue('contact_name'),
        getValue('email'),
        getValue('phone'),
        getValue('address_line1'),
        getValue('address_line2'),
        getValue('city'),
        getValue('state'),
        getValue('postal_code'),
        getValue('country'),
        getValue('website'),
        getValue('tax_id'),
        getValue('payment_terms'),
        getValue('notes'),
        lookups.accounts_chart?.[record.default_expense_account_code] || null,
        lookups.classes?.[record.default_class_name?.toLowerCase()] || null,
        getValue('is_active')
      ];

    case 'menu_items':
      return [tenantId, record.name, getValue('description'), record.price, getValue('price_label'),
              getValue('category'), getValue('is_available'), getValue('prep_time_minutes'),
              getValue('sort_order'), getValue('is_vegetarian'), getValue('is_vegan'),
              getValue('is_gluten_free'), getValue('is_dairy_free'), getValue('is_spicy'), getValue('is_featured')];

    case 'modifications':
      return [tenantId, record.name, getValue('display_name'), getValue('price_adjustment'),
              getValue('category'), getValue('sort_order'), getValue('is_active')];

    default:
      throw new Error(`Unknown import type: ${type}`);
  }
}

module.exports = router;
