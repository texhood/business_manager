# POS Terminal — User Guide

**Application:** Point of Sale Terminal
**URL Pattern:** `{slug}.pos.busmgr.com`
**Required Tier:** Starter and above
**Version:** 1.0
**Last Updated:** February 2026

---

## Overview

The POS Terminal is designed for quick in-person sales at farmers markets, farm stands, events, and retail locations. It provides a touch-friendly product grid with integrated Stripe Terminal card payments and cash handling.

**URL:** `{slug}.pos.busmgr.com` (e.g., `hood-family-farms.pos.busmgr.com`)

---

## Getting Started

### Login

1. Navigate to `{slug}.pos.busmgr.com` or launch from the Tenant Portal
2. Log in with your credentials (or SSO auto-authenticates from Portal)
3. The POS screen loads with the product grid and cart

### Prerequisites

- Products must be created in the Back Office (Inventory → Products) before they appear in the POS
- For card payments, Stripe Connect must be set up (Back Office → System → Stripe Connect)
- For Stripe Terminal hardware readers, pair the reader via the Reader Modal

---

## Screen Layout

```
┌─────────────────────────────────────────┬──────────────────┐
│                                         │                  │
│           PRODUCT GRID                  │      CART        │
│                                         │                  │
│    ┌──────┐ ┌──────┐ ┌──────┐           │  Item 1    $5.00 │
│    │ Eggs │ │ Honey│ │ Jam  │           │  Item 2   $12.00 │
│    │$5.00 │ │$8.00 │ │$6.50 │           │                  │
│    └──────┘ └──────┘ └──────┘           │  ──────────────  │
│                                         │  Subtotal $17.00 │
│    ┌──────┐ ┌──────┐ ┌──────┐           │  Tax       $1.40 │
│    │Bread │ │Butter│ │Cheese│           │  Total    $18.40 │
│    │$4.00 │ │$5.50 │ │$7.00 │           │                  │
│    └──────┘ └──────┘ └──────┘           │ [Pay Cash]       │
│                                         │ [Pay Card]       │
│                                         │                  │
└─────────────────────────────────────────┴──────────────────┘
```

---

## Selling Products

### Adding Items to Cart

1. **Tap a product** on the grid to add one unit to the cart
2. **Tap again** to increase quantity, or use the quantity controls in the cart
3. To **remove** an item, use the remove button next to it in the cart
4. The subtotal, tax, and total update automatically

### Processing a Cash Payment

1. With items in the cart, tap **Pay Cash**
2. The Cash Payment Modal opens
3. Enter the cash amount tendered by the customer
4. The system calculates the change due
5. Confirm the payment
6. The Order Complete screen shows the receipt

### Processing a Card Payment

1. With items in the cart, tap **Pay Card**
2. The Card Payment Modal opens
3. If a Stripe Terminal reader is connected:
   - The payment is sent to the reader
   - Customer taps/inserts/swipes their card
   - Payment processes through Stripe
4. If no reader is connected, manual card entry may be available
5. Upon success, the Order Complete screen shows the receipt

### Connecting a Stripe Terminal Reader

1. Click the **Reader** icon/button to open the Reader Modal
2. The system searches for available Stripe Terminal readers on your network
3. Select your reader from the list
4. Once connected, card payments are routed to the reader automatically

---

## Layout Editor

Customize how products appear on the POS grid:

1. Click the **Layout Editor** button (gear/settings icon)
2. Arrange product tiles in the grid by dragging them
3. Adjust tile sizes and positions for optimal workflow
4. Configure layout settings via the Layout Settings Modal:
   - Number of columns
   - Grid spacing
   - Category filtering
5. Save your layout — it persists between sessions

---

## Sales Review

At the end of a shift or day:

1. Navigate to **Sales Review** (accessible from the POS menu)
2. View a summary of all transactions:
   - Total sales
   - Number of transactions
   - Cash vs. card breakdown
   - Individual transaction list
3. Use this for cash drawer reconciliation
4. Filter by date range as needed

---

## End of Day Workflow

1. **Count Cash Drawer** — Count physical cash and compare against the Sales Review cash total
2. **Review Card Totals** — Verify card transaction totals match Stripe
3. **Note Discrepancies** — Record any differences
4. **Close Out** — Log out of the POS

---

## Troubleshooting

| Issue                 | Solution                                                                       |
| --------------------- | ------------------------------------------------------------------------------ |
| Products not showing  | Ensure products exist in Back Office → Inventory → Products                  |
| Card reader not found | Check that reader is powered on and on the same network. Re-open Reader Modal. |
| Payment declined      | Ask customer for alternative payment. Check Stripe dashboard for details.      |
| Cart won't clear      | Refresh the page. If persists, log out and back in.                            |
| Layout changes lost   | Ensure you saved the layout before navigating away.                            |

---

*See also: `USER_GUIDE_TENANT_ADMIN.md` for Back Office product setup, and `RESTAURANT_POS.md` for food service ordering.*
