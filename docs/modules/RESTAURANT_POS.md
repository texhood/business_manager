# Restaurant POS — User Guide

**Application:** Restaurant Point of Sale
**URL Pattern:** `{slug}.rpos.busmgr.com`
**Required Tier:** Professional and above
**Version:** 1.0
**Last Updated:** February 2026

---

## Overview

The Restaurant POS is a full-service food ordering system for food trailers, farm restaurants, catering, and event food service. It supports multiple menus, item modifications, open orders/tabs, tips, and integrated kitchen display (KDS) communication.

**URL:** `{slug}.rpos.busmgr.com` (e.g., `hood-family-farms.rpos.busmgr.com`)

---

## Getting Started

### Prerequisites

- Menus and menu items must be configured in Back Office (Food Trailer → Menus / Menu Items)
- Modifications/modifiers created in Back Office (Food Trailer → Modifications)
- Stripe Connect enabled for card payments (Back Office → System → Stripe Connect)
- Kitchen Display System set up for order routing (optional but recommended)

### Login

1. Navigate to `{slug}.rpos.busmgr.com` or launch from the Tenant Portal
2. Log in with your credentials (or SSO auto-authenticates)
3. The Restaurant POS screen loads

---

## Screen Layout

```
┌──────────┬──────────────────────────────┬──────────────────┐
│          │                              │                  │
│  ORDERS  │       MENU ITEM GRID         │      CART        │
│  SIDEBAR │                              │  (Current Order) │
│          │ [Menu Selector: Breakfast ▼] │                  │
│  Order 1 │                              │  Burger    $12   │
│  Order 2 │  ┌──────┐ ┌──────┐ ┌─────┐   │   + Bacon  $3    │
│  Order 3 │  │Burger│ │Fries │ │Drink│   │  Fries      $5   │
│          │  │ $12  │ │  $5  │ │ $3  │   │                  │
│          │  └──────┘ └──────┘ └─────┘   │  ──────────────  │
│          │                              │  Subtotal  $20   │
│          │  ┌──────┐ ┌──────┐ ┌─────┐   │  Tax        $2   │
│          │  │Salad │ │Soup  │ │Pie  │   │  Total     $22   │
│          │  │  $9  │ │  $6  │ │ $5  │   │                  │
│          │  └──────┘ └──────┘ └─────┘   │ [Checkout]       │
│          │                              │                  │
└──────────┴──────────────────────────────┴──────────────────┘
```

---

## Taking Orders

### 1. Select a Menu

Use the **Menu Selector** at the top to switch between active menus (e.g., Breakfast, Lunch, Dinner, Catering). Only menus scheduled for the current time are available.

### 2. Add Items

1. Tap a menu item on the grid to add it to the current order
2. If the item has **required modifications** (e.g., "Egg Style"), the Item Modifications Modal opens automatically
3. Select modifications and confirm
4. The item appears in the cart with modifications listed

### 3. Apply Modifications

When the **Item Modifications Modal** opens:

- **Required Groups** — Must select one option before continuing (e.g., "Choose a size")
- **Optional Groups** — Select zero or more options (e.g., "Add extras")
- Modifications with prices show the additional cost (e.g., "+$3.00 Bacon")
- Click **Add to Order** when selections are complete

### 4. Manage the Cart

- **Adjust Quantity** — Use +/- buttons on cart items
- **Remove Item** — Tap the remove button
- **Edit Modifications** — Tap the item to reopen the modifications modal
- Cart shows itemized totals including modification prices

---

## Managing Orders

### Orders Sidebar

The left sidebar shows all open orders:

- Each order shows its number, status, and total
- Click an order to load it into the cart for editing or payment
- New orders appear at the top

### Order Statuses

| Status                    | Meaning                                   |
| ------------------------- | ----------------------------------------- |
| **Open**            | Order is being built or waiting for items |
| **Sent to Kitchen** | Order submitted, visible on KDS           |
| **Ready**           | Kitchen has completed the order           |
| **Paid**            | Payment received, order complete          |

### Order Detail

Click any order to view the **Order Detail Modal** showing:

- Full item list with modifications
- Timestamps (created, sent, completed)
- Payment details (if paid)

---

## Checkout & Payment

### Initiating Checkout

1. With a complete order in the cart, tap **Checkout**
2. The Checkout Modal opens showing:
   - Order summary
   - Subtotal, tax, total
   - Discount field (optional)
   - Tip entry (pre-set percentages or custom amount)
3. Select payment method

### Cash Payment

1. Choose **Cash** in the checkout modal
2. Enter the cash amount tendered
3. System calculates change due
4. Confirm payment

### Card Payment

1. Choose **Card** in the checkout modal
2. If a Stripe Terminal reader is connected:
   - Payment is sent to the reader
   - Customer taps/inserts/swipes
   - Card Payment Processing Modal shows status
3. If no reader, the on-screen card entry form appears
4. Upon success, order is marked as paid

### Connecting a Stripe Terminal Reader

1. Open the **Reader Modal** from the settings/reader icon
2. System discovers available readers on the local network
3. Select and connect your reader
4. Card payments will route to the reader automatically

### Tips

- Pre-set tip percentages are available during checkout (e.g., 15%, 18%, 20%)
- Customers can enter a custom tip amount
- Tips are included in the payment total and tracked separately in reporting

---

## Kitchen Integration

When an order is sent from the Restaurant POS:

1. Items appear on the **Kitchen Display System** (`{slug}.kitchen.busmgr.com`)
2. Kitchen staff prepare items and mark them complete
3. Order status updates to "Ready" in the Orders Sidebar
4. Server/counter staff can notify the customer

---

## Sales Review

1. Navigate to **Sales Review** from the POS menu
2. View shift and daily summaries:
   - Total sales and transaction count
   - Cash vs. card breakdown
   - Tip totals
   - Individual transaction details
3. Filter by date range
4. Use for end-of-shift cash reconciliation

---

## End of Day Workflow

1. **Review Open Orders** — Close or cancel any remaining open orders
2. **Count Cash** — Compare physical cash to Sales Review cash total
3. **Verify Cards** — Check card totals match Stripe
4. **Record Tips** — Verify tip totals for staff distribution
5. **Log Out** — Sign out of the POS

---

## Troubleshooting

| Issue                       | Solution                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| No menus available          | Check Back Office → Food Trailer → Menus. Ensure menus are active and scheduled.          |
| Menu items missing          | Verify items are assigned to the selected menu in Back Office.                              |
| Modifications not showing   | Create modifier groups in Back Office → Food Trailer → Modifications and assign to items. |
| Orders not appearing on KDS | Ensure KDS is running at `{slug}.kitchen.busmgr.com` and logged in.                       |
| Card reader disconnected    | Re-open Reader Modal and reconnect. Check reader power and network.                         |
| Tip not recorded            | Ensure tip was entered before confirming payment. Tips cannot be added after payment.       |

---

*See also: `KITCHEN_DISPLAY.md` for KDS operations, and `USER_GUIDE_TENANT_ADMIN.md` for menu and modifier setup in the Back Office.*
