# Hood Family Farms - Frontend

React-based admin dashboard for Hood Family Farms business management.

## Features

- **Dashboard**: Financial overview, inventory alerts, recent activity
- **Accounts**: Manage customers, staff, and farm memberships
- **Items**: Product management with inventory tracking
- **Bookkeeping**: Income/expense tracking with reports
- **Delivery Zones**: Zone and schedule management
- **Settings**: Categories, tags, and preferences

## Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Backend API running on port 3001

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm start
```

The app will open at http://localhost:3000

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | http://localhost:3001/api/v1 |

## Project Structure

```
src/
├── components/      # Reusable UI components
├── context/         # React contexts (Auth, etc.)
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── services/        # API service modules
├── App.jsx          # Main application component
└── index.js         # Entry point
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run development server |
| `npm build` | Build for production |
| `npm test` | Run tests |

## API Integration

The `services/api.js` module provides functions for all backend endpoints:

```javascript
import { accountsService, itemsService, transactionsService } from './services/api';

// Example usage
const accounts = await accountsService.getAll();
const item = await itemsService.getById('item-uuid');
await transactionsService.create({ date, type, amount, description });
```

## Authentication

The app uses JWT tokens stored in localStorage. The `AuthContext` provides:

- `user` - Current user object
- `isAuthenticated` - Boolean login status
- `isAdmin` / `isStaff` - Role checks
- `login(email, password)` - Login function
- `logout()` - Logout function

## Building for Production

```bash
npm run build
```

The `build/` folder contains static files ready for deployment to any web server.
