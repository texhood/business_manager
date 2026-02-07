# Kitchen Display System (KDS) — User Guide

**Application:** Kitchen Display System
**URL Pattern:** `{slug}.kitchen.busmgr.com`
**Required Tier:** Professional and above
**Version:** 1.0
**Last Updated:** February 2026

---

## Overview

The Kitchen Display System (KDS) is a real-time order display for kitchen staff. It shows incoming orders from the Restaurant POS as cards, allowing cooks to track preparation, mark items as complete, and manage order flow without paper tickets.

**URL:** `{slug}.kitchen.busmgr.com` (e.g., `hood-family-farms.kitchen.busmgr.com`)

---

## Setup

### Hardware Requirements

- A tablet, monitor, or any device with a web browser
- Stable internet connection (same network as the Restaurant POS)
- Mount or stand for kitchen visibility

### Initial Setup

1. Open a browser on your kitchen display device
2. Navigate to `{slug}.kitchen.busmgr.com`
3. Log in with any staff account (or SSO auto-authenticates from Portal)
4. The KDS dashboard loads and begins showing live orders

### Recommended Setup

- Use a dedicated tablet or monitor mounted at eye level
- Enable full-screen/kiosk mode in the browser for distraction-free viewing
- Position where all kitchen staff can see it clearly
- Consider multiple displays for high-volume operations (one per station)

---

## Screen Layout

```
 ┌─────────────────────────────────────────────────────────────────┐
│                    KITCHEN DISPLAY SYSTEM                       │
├─────────────┬──────────────┬──────────────┬─────────────────────┤
│             │              │              │                     │
│  ORDER #42  │  ORDER #43   │  ORDER #44   │   DONE ORDERS       │
│  ⏱ 3:42   │  ⏱ 2:15     │  ⏱ 0:30    │   PANEL             │
│             │              │              │                     │
│  1x Burger  │  2x Tacos    │  1x Salad    │   #41 ✓ (1m ago)    │
│   +Bacon    │   +X Onion   │  1x Soup     │   #40 ✓ (3m ago)    │
│   +Cheese   │  1x Burrito  │              │   #39 ✓ (5m ago)    │
│  1x Fries   │   +Guac      │              │                     │
│             │              │              │                     │
│  [BUMP ✓]   │  [BUMP ✓]   │  [BUMP ✓]    │                     │
│             │              │              │                     │
└─────────────┴──────────────┴──────────────┴─────────────────────┘
```

---

## Using the KDS

### Order Cards

Each incoming order appears as a card displaying:

- **Order Number** — Matches the Restaurant POS order number
- **Timer** — Time elapsed since the order was placed
- **Items** — Each item with its modifications listed below
- **Bump Button** — Mark the order as complete

### Order Priority

- Orders are displayed left to right, **oldest first**
- As time passes, cards may change color to indicate urgency:
  - **Normal** — Recently placed
  - **Warning** — Approaching target prep time
  - **Overdue** — Exceeding expected preparation time

### Completing an Order (Bumping)

1. When all items in an order are prepared, tap the **Bump** (✓) button on the card
2. The order moves to the **Done Orders Panel** on the right
3. The Restaurant POS is notified that the order is ready
4. The card is removed from the active queue

### Done Orders Panel

The right side of the screen shows recently completed orders:

- Displays the last several bumped orders
- Shows order number and time since completion
- Useful for reference if there are questions about recent orders
- Older completed orders roll off automatically

---

## Workflow

### Typical Kitchen Flow

```
Order placed on          Order appears on       Kitchen prepares      Staff bumps
Restaurant POS    →      KDS as new card   →    all items        →   order complete
                                                                          │
                                                                          ▼
                                                                    Order moves to
                                                                    Done panel &
                                                                    RPOS notified
```

### High-Volume Tips

- Focus on the leftmost cards first (oldest orders)
- Watch the timers — escalating colors mean an order needs attention
- Communicate with front-of-house if there are delays
- The Done Orders panel helps verify if a questioned order was already completed

---

## Troubleshooting

| Issue                   | Solution                                                               |
| ----------------------- | ---------------------------------------------------------------------- |
| No orders appearing     | Verify Restaurant POS is running and sending orders. Check network.    |
| Orders appear late      | Check internet connectivity. KDS polls for updates in near-real-time.  |
| Bump button not working | Refresh the page. If persists, log out and back in.                    |
| Screen too small        | Use a larger display. Zoom out in the browser (Ctrl/Cmd + minus).      |
| Timer not accurate      | Ensure device clock is correct. Timer is based on order creation time. |
| Need multiple stations  | Open KDS on multiple devices. All show the same order queue.           |

---

*See also: `RESTAURANT_POS.md` for order-taking operations, and `USER_GUIDE_TENANT_ADMIN.md` for menu configuration.*
