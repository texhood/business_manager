/**
 * Hood Family Farms API Server
 * Main entry point for the Express application
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const logger = require('./utils/logger');
const db = require('../config/database');

// Import routes
const accountsRouter = require('./routes/accounts');
const itemsRouter = require('./routes/items');
const categoriesRouter = require('./routes/categories');
const tagsRouter = require('./routes/tags');
const transactionsRouter = require('./routes/transactions');
const deliveryZonesRouter = require('./routes/deliveryZones');
const membershipsRouter = require('./routes/memberships');
const ordersRouter = require('./routes/orders');
const reportsRouter = require('./routes/reports');
const accountingRouter = require('./routes/accounting');
const importRouter = require('./routes/import');
const financialReportsRouter = require('./routes/financialReports');
const authRouter = require('./routes/auth');
const transactionAcceptanceRouter = require('./routes/transactionAcceptance');
const plaidRoutes = require('./routes/plaid');
const classesRouter = require('./routes/classes');
const journalEntriesRouter = require('./routes/journalEntries');
const paymentsRouter = require('./routes/payments');
const blogRouter = require('./routes/blog');
const menusRouter = require('./routes/menus');
const eventsRouter = require('./routes/events');
const terminalRouter = require('./routes/terminal');
const restaurantPosRouter = require('./routes/restaurantPos');
const kdsRouter = require('./routes/kds');
const modificationsRouter = require('./routes/modifications');
const mediaRouter = require('./routes/media');
const socialRouter = require('./routes/social');
const siteDesignerRouter = require('./routes/siteDesigner');
const herdsFlocksRouter = require('./routes/herdsFlocks');
const dataImportRouter = require('./routes/dataImport');
const vendorsRouter = require('./routes/vendors');
const adminRouter = require('./routes/admin');
const tenantsRouter = require('./routes/tenants');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');

const app = express();
const PORT = process.env.PORT || 3001;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Trust proxy for rate limiting behind reverse proxy/React dev server
app.set('trust proxy', 1);

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers - configured to allow cross-origin image loading
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// Serve uploaded files statically (before other middleware)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
logger.info(`Serving static uploads from: ${path.join(__dirname, '../uploads')}`);

// CORS configuration
// Development origins from environment or defaults
const devOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005,http://localhost:3006,http://localhost:3007,http://localhost:3008')
  .split(',')
  .map(origin => origin.trim());

// Production domain patterns for subdomain-based multi-tenancy
const productionPatterns = [
  /^https:\/\/[a-z0-9-]+\.office\.hoodfamilyfarms\.com$/,   // {tenant}.office.hoodfamilyfarms.com
  /^https:\/\/[a-z0-9-]+\.herds\.hoodfamilyfarms\.com$/,    // {tenant}.herds.hoodfamilyfarms.com
  /^https:\/\/[a-z0-9-]+\.rpos\.hoodfamilyfarms\.com$/,     // {tenant}.rpos.hoodfamilyfarms.com
  /^https:\/\/[a-z0-9-]+\.kitchen\.hoodfamilyfarms\.com$/,  // {tenant}.kitchen.hoodfamilyfarms.com
  /^https:\/\/[a-z0-9-]+\.pos\.hoodfamilyfarms\.com$/,      // {tenant}.pos.hoodfamilyfarms.com
  /^https:\/\/office\.hoodfamilyfarms\.com$/,               // Base app domains
  /^https:\/\/herds\.hoodfamilyfarms\.com$/,
  /^https:\/\/rpos\.hoodfamilyfarms\.com$/,
  /^https:\/\/kitchen\.hoodfamilyfarms\.com$/,
  /^https:\/\/pos\.hoodfamilyfarms\.com$/,
  /^https:\/\/signup\.hoodfamilyfarms\.com$/,
  /^https:\/\/api\.hoodfamilyfarms\.com$/,
  /^https:\/\/hoodfamilyfarms\.com$/,                        // Root domain
  /^https:\/\/www\.hoodfamilyfarms\.com$/,                   // WWW
];

logger.info('CORS allowed dev origins:', devOrigins);
logger.info('CORS production patterns enabled for *.hoodfamilyfarms.com');

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc)
    if (!origin) return callback(null, true);
    
    // Check development origins first
    if (devOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check production patterns (subdomain wildcards)
    const isProductionAllowed = productionPatterns.some(pattern => pattern.test(origin));
    if (isProductionAllowed) {
      return callback(null, true);
    }
    
    // In development, allow all origins for easier testing
    if (process.env.NODE_ENV !== 'production') {
      logger.warn(`CORS allowing unknown origin in dev: ${origin}`);
      return callback(null, true);
    }
    
    // Production: reject unknown origins
    logger.warn(`CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 429,
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', async (req, res) => {
  const dbHealth = await db.healthCheck();
  const healthy = dbHealth.status === 'healthy';
  
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    database: dbHealth,
    uptime: process.uptime(),
  });
});

// ============================================================================
// API ROUTES
// ============================================================================

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/accounts`, accountsRouter);
app.use(`${API_PREFIX}/items`, itemsRouter);
app.use(`${API_PREFIX}/categories`, categoriesRouter);
app.use(`${API_PREFIX}/tags`, tagsRouter);
app.use(`${API_PREFIX}/transactions`, transactionsRouter);
app.use(`${API_PREFIX}/delivery-zones`, deliveryZonesRouter);
app.use(`${API_PREFIX}/memberships`, membershipsRouter);
app.use(`${API_PREFIX}/orders`, ordersRouter);
app.use(`${API_PREFIX}/reports`, reportsRouter);
app.use(`${API_PREFIX}/accounting`, accountingRouter);
app.use(`${API_PREFIX}/import`, importRouter);
app.use(`${API_PREFIX}/financial-reports`, financialReportsRouter);
app.use(`${API_PREFIX}/transaction-acceptance`, transactionAcceptanceRouter);
app.use('/api/v1/plaid', plaidRoutes);
app.use(`${API_PREFIX}/classes`, classesRouter);
app.use(`${API_PREFIX}/journal-entries`, journalEntriesRouter);
app.use(`${API_PREFIX}/payments`, paymentsRouter);
app.use(`${API_PREFIX}/blog`, blogRouter);
app.use(`${API_PREFIX}/menus`, menusRouter);
app.use(`${API_PREFIX}/events`, eventsRouter);
app.use(`${API_PREFIX}/terminal`, terminalRouter);
app.use(`${API_PREFIX}/restaurant-pos`, restaurantPosRouter);
app.use(`${API_PREFIX}/kds`, kdsRouter);
app.use(`${API_PREFIX}/modifications`, modificationsRouter);
app.use(`${API_PREFIX}/media`, mediaRouter);
app.use(`${API_PREFIX}/social`, socialRouter);
app.use(`${API_PREFIX}/site-designer`, siteDesignerRouter);
app.use(`${API_PREFIX}/herds-flocks`, herdsFlocksRouter);
app.use(`${API_PREFIX}/data-import`, dataImportRouter);
app.use(`${API_PREFIX}/vendors`, vendorsRouter);
app.use(`${API_PREFIX}/admin`, adminRouter);
app.use(`${API_PREFIX}/tenants`, tenantsRouter);

// API documentation endpoint
app.get(`${API_PREFIX}`, (req, res) => {
  res.json({
    name: 'Hood Family Farms API',
    version: '1.0.0',
    description: 'API for farm management, eCommerce, and food trailer operations',
    endpoints: {
      auth: `${API_PREFIX}/auth`,
      accounts: `${API_PREFIX}/accounts`,
      items: `${API_PREFIX}/items`,
      categories: `${API_PREFIX}/categories`,
      tags: `${API_PREFIX}/tags`,
      transactions: `${API_PREFIX}/transactions`,
      deliveryZones: `${API_PREFIX}/delivery-zones`,
      memberships: `${API_PREFIX}/memberships`,
      orders: `${API_PREFIX}/orders`,
      reports: `${API_PREFIX}/reports`,
      accounting: `${API_PREFIX}/accounting`,
    },
    documentation: 'https://docs.hoodfamilyfarms.com/api',
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use(notFound);
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const server = app.listen(PORT, () => {
  logger.info(`🌱 Hood Family Farms API running on port ${PORT}`);
  logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API available at http://localhost:${PORT}${API_PREFIX}`);
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      await db.close();
      logger.info('Database connections closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
