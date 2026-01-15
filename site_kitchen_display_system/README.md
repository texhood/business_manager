# Kitchen Display System (KDS)

Real-time order management for kitchen/prep staff.

## Features

- **Live Order Queue** - Orders appear automatically as they're created from the Restaurant POS
- **Status Workflow** - Entered → In Process → Done
- **Visual Indicators** - Color-coded cards by status, time warnings for orders taking too long
- **Sound Notifications** - Audio alert when new orders arrive
- **Auto-Refresh** - Orders update every 5 seconds

## Order Flow

1. **Entered** (Teal card) - New order from POS, tap "Pending" to start working
2. **In Process** (Blue card) - Order being prepared, tap "In Process" when ready
3. **Done** (Green card, faded) - Order complete, will disappear after 5 minutes
   - SMS sent to customer if phone number was provided

## Running the KDS

```bash
cd site_kitchen_display_system
npm install
npm start
```

The KDS runs on port **3005**: http://localhost:3005

## Requirements

- Backend API running on port 3001
- Valid staff account credentials

## Configuration

Make sure the backend `.env` includes port 3005 in CORS_ORIGIN:

```
CORS_ORIGIN=http://localhost:3000,http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005
```

## API Endpoints

The KDS uses these backend routes (`/api/v1/kds/`):

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/orders` | GET | Get active orders for display |
| `/orders/:id/start` | PATCH | Mark order as in_process |
| `/orders/:id/done` | PATCH | Mark order as done |
| `/orders/:id/recall` | PATCH | Bring back a done order |
| `/stats` | GET | Get order statistics |

## Display Recommendations

- **Landscape orientation** - Designed for horizontal scrolling
- **Full screen** - Press F11 for distraction-free operation
- **Touch screen** - Large tap targets for kitchen environment
- **Multiple displays** - Each KDS instance is independent

## Time Warnings

- **Normal** - White timer (< 10 minutes)
- **Warning** - Yellow timer (10-15 minutes)
- **Urgent** - Red timer with pulsing card (> 15 minutes)

## Keyboard Shortcuts

None currently - designed for touch operation.

## Tech Stack

- React 18
- Real-time polling (5-second intervals)
- Responsive CSS Grid layout
