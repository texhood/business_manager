# Hood Family Farms API

Backend API for CR Hood Solutions - a regenerative farm in Bullard, TX offering pasture-raised meats, eggs, and farm fresh goods.

## Features

- **Account Management**: Admin, Staff, and Customer roles with Farm Membership support
- **Product/Item Management**: Inventory tracking, categories, tags, pricing tiers
- **Bookkeeping**: Income and expense tracking with categorization and reporting
- **Delivery Zones**: Zone-based delivery scheduling
- **Farm Memberships**: Subscription management with member pricing (10% discount)
- **Orders**: Full eCommerce order management (Phase 2)
- **Reports**: Financial summaries, sales analytics, inventory reports

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

## Quick Start

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

### Installation

1. **Clone and install dependencies**

   ```bash
   cd backend
   npm install
   ```
2. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```
3. **Create database**

   ```bash
   createdb hoodfamilyfarms
   ```
4. **Run migrations**

   ```bash
   npm run migrate
   ```
5. **Seed sample data** (optional)

   ```bash
   npm run seed
   ```
6. **Start the server**

   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

The API will be available at `http://localhost:3001/api/v1`

## Environment Variables

| Variable           | Description                          | Default               |
| ------------------ | ------------------------------------ | --------------------- |
| `NODE_ENV`       | Environment (development/production) | development           |
| `PORT`           | Server port                          | 3001                  |
| `DATABASE_URL`   | PostgreSQL connection string         | -                     |
| `DB_HOST`        | Database host                        | localhost             |
| `DB_PORT`        | Database port                        | 5432                  |
| `DB_NAME`        | Database name                        | hoodfamilyfarms       |
| `DB_USER`        | Database user                        | postgres              |
| `DB_PASSWORD`    | Database password                    | -                     |
| `JWT_SECRET`     | Secret key for JWT tokens            | -                     |
| `JWT_EXPIRES_IN` | Token expiration time                | 7d                    |
| `CORS_ORIGIN`    | Allowed CORS origin                  | http://localhost:3000 |

## API Endpoints

### Authentication

| Method | Endpoint           | Description                   |
| ------ | ------------------ | ----------------------------- |
| POST   | `/auth/login`    | Login with email/password     |
| POST   | `/auth/register` | Register new customer account |
| POST   | `/auth/refresh`  | Refresh access token          |
| GET    | `/auth/me`       | Get current user              |
| PUT    | `/auth/me`       | Update current user           |
| PUT    | `/auth/password` | Change password               |

### Accounts (Staff+ required)

| Method | Endpoint                     | Description            |
| ------ | ---------------------------- | ---------------------- |
| GET    | `/accounts`                | List all accounts      |
| GET    | `/accounts/:id`            | Get single account     |
| POST   | `/accounts`                | Create account         |
| PUT    | `/accounts/:id`            | Update account         |
| PATCH  | `/accounts/:id/membership` | Toggle farm membership |
| DELETE | `/accounts/:id`            | Delete account (Admin) |

### Items/Products

| Method | Endpoint                         | Description            | Auth    |
| ------ | -------------------------------- | ---------------------- | ------- |
| GET    | `/items`                       | List items             | Public* |
| GET    | `/items/:id`                   | Get single item        | Public* |
| POST   | `/items`                       | Create item            | Staff+  |
| PUT    | `/items/:id`                   | Update item            | Staff+  |
| PATCH  | `/items/:id/inventory`         | Adjust inventory       | Staff+  |
| DELETE | `/items/:id`                   | Delete/deactivate item | Staff+  |
| GET    | `/items/:id/inventory-history` | View inventory changes | Staff+  |

*Farm members see member pricing when authenticated

### Categories

| Method | Endpoint            | Description     | Auth   |
| ------ | ------------------- | --------------- | ------ |
| GET    | `/categories`     | List categories | Public |
| POST   | `/categories`     | Create category | Staff+ |
| PUT    | `/categories/:id` | Update category | Staff+ |
| DELETE | `/categories/:id` | Delete category | Staff+ |

### Tags

| Method | Endpoint      | Description | Auth   |
| ------ | ------------- | ----------- | ------ |
| GET    | `/tags`     | List tags   | Public |
| POST   | `/tags`     | Create tag  | Staff+ |
| DELETE | `/tags/:id` | Delete tag  | Staff+ |

### Transactions (Bookkeeping)

| Method | Endpoint                        | Description                    |
| ------ | ------------------------------- | ------------------------------ |
| GET    | `/transactions`               | List transactions with filters |
| GET    | `/transactions/:id`           | Get single transaction         |
| GET    | `/transactions/summary`       | Financial summary              |
| GET    | `/transactions/categories`    | List transaction categories    |
| GET    | `/transactions/bank-accounts` | List bank accounts             |
| POST   | `/transactions`               | Create transaction             |
| POST   | `/transactions/bulk`          | Bulk create transactions       |
| PUT    | `/transactions/:id`           | Update transaction             |
| DELETE | `/transactions/:id`           | Delete transaction             |
| GET    | `/transactions/export/csv`    | Export to CSV                  |

### Delivery Zones

| Method | Endpoint                          | Description                  | Auth   |
| ------ | --------------------------------- | ---------------------------- | ------ |
| GET    | `/delivery-zones`               | List zones                   | Public |
| GET    | `/delivery-zones/:id`           | Get zone with customer count | Public |
| POST   | `/delivery-zones`               | Create zone                  | Admin  |
| PUT    | `/delivery-zones/:id`           | Update zone                  | Admin  |
| DELETE | `/delivery-zones/:id`           | Delete zone                  | Admin  |
| GET    | `/delivery-zones/:id/customers` | List customers in zone       | Staff+ |

### Memberships

| Method | Endpoint                          | Description            |
| ------ | --------------------------------- | ---------------------- |
| GET    | `/memberships`                  | List memberships       |
| GET    | `/memberships/:id`              | Get membership details |
| POST   | `/memberships`                  | Create membership      |
| PUT    | `/memberships/:id`              | Update membership      |
| POST   | `/memberships/:id/renew`        | Renew membership       |
| GET    | `/memberships/reports/expiring` | Expiring soon          |

### Orders (Phase 2)

| Method | Endpoint               | Description               |
| ------ | ---------------------- | ------------------------- |
| GET    | `/orders`            | List orders               |
| GET    | `/orders/:id`        | Get order with line items |
| POST   | `/orders`            | Create order              |
| PATCH  | `/orders/:id/status` | Update order status       |
| DELETE | `/orders/:id`        | Cancel order              |

### Reports

| Method | Endpoint                 | Description                |
| ------ | ------------------------ | -------------------------- |
| GET    | `/reports/dashboard`   | Dashboard summary          |
| GET    | `/reports/profit-loss` | P&L statement              |
| GET    | `/reports/sales`       | Sales by item/category/day |
| GET    | `/reports/inventory`   | Inventory status           |
| GET    | `/reports/customers`   | Customer analytics         |
| GET    | `/reports/delivery`    | Delivery workload          |

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Getting a Token

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "sara@hoodfamilyfarms.com", "password": "password123"}'
```

### Using the Token

Include the token in the Authorization header:

```bash
curl http://localhost:3001/api/v1/accounts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Role Permissions

| Role                  | Permissions                                   |
| --------------------- | --------------------------------------------- |
| **Admin**       | Full access to all endpoints                  |
| **Staff**       | Manage items, transactions, orders, customers |
| **Customer**    | View products, manage own orders/profile      |
| **Farm Member** | Customer + member pricing + early access      |

## Sample Data

After running `npm run seed`, you can login with:

- **Admin**: sara@hoodfamilyfarms.com / password123
- **Staff**: staff@hoodfamilyfarms.com / password123
- **Customer**: jane@example.com / password123

## Project Structure

```
backend/
├── config/
│   └── database.js       # PostgreSQL connection pool
├── migrations/
│   └── 001_initial_schema.sql
├── src/
│   ├── middleware/
│   │   ├── auth.js       # JWT authentication
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   ├── routes/
│   │   ├── accounts.js
│   │   ├── auth.js
│   │   ├── categories.js
│   │   ├── deliveryZones.js
│   │   ├── items.js
│   │   ├── memberships.js
│   │   ├── orders.js
│   │   ├── reports.js
│   │   ├── tags.js
│   │   └── transactions.js
│   ├── utils/
│   │   ├── logger.js     # Winston logging
│   │   ├── migrate.js    # Migration runner
│   │   └── seed.js       # Sample data seeder
│   └── server.js         # Express app entry
├── .env.example
├── package.json
└── README.md
```

## Database Schema

### Core Tables

- `accounts` - Users (admin, staff, customer)
- `items` - Products with inventory
- `categories` - Product categories
- `tags` - Product tags
- `item_tags` - Item-tag relationships
- `delivery_zones` - Delivery areas and schedules
- `memberships` - Farm membership subscriptions
- `transactions` - Income/expense records
- `transaction_categories` - Bookkeeping categories
- `bank_accounts` - Payment accounts
- `orders` - Customer orders
- `order_items` - Order line items
- `inventory_logs` - Inventory change history

### Enums

- `account_role`: admin, staff, customer
- `item_type`: inventory, non-inventory, digital
- `shipping_zone`: not-shippable, in-state, in-country, no-restrictions
- `transaction_type`: income, expense
- `membership_status`: active, expired, cancelled
- `order_status`: pending, confirmed, processing, ready, delivered, cancelled

## Error Handling

All errors follow a consistent format:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "details": [...]
}
```

## Rate Limiting

The API includes rate limiting (100 requests per 15 minutes per IP by default).

## Phases

- **Phase 1** (Current): Admin tool - accounts, items, bookkeeping, delivery zones
- **Phase 2**: Customer-facing eCommerce website
- **Phase 3**: Food trailer (restaurant) support

## License

Proprietary - Hood Family Farms

## Contact

Hood Family Farms
3950 County Road 3802
Bullard, TX 75757
sara@hoodfamilyfarms.com
https://hoodfamilyfarms.com
