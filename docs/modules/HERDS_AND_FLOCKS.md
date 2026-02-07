# Herds & Flocks — User Guide

**Application:** Herds, Flocks & Pastures (Livestock Management)  
**URL Pattern:** `{slug}.herds.busmgr.com`  
**Required Tier:** Professional and above  
**Version:** 1.0  
**Last Updated:** February 2026

---

## Overview

Herds & Flocks is a dedicated livestock and land management application. It tracks animals from birth through sale, manages pasture rotations, records health events, monitors weights, and handles sale ticket generation. The app has its own sidebar navigation, branding, and SSO authentication.

**URL:** `{slug}.herds.busmgr.com` (e.g., `hood-family-farms.herds.busmgr.com`)

---

## Getting Started

1. Launch from the Tenant Portal or navigate directly to `{slug}.herds.busmgr.com`
2. Log in (or SSO auto-authenticates)
3. The Dashboard loads with livestock counts and quick actions

### First-Time Setup

Before adding animals, configure your reference data:

1. **Settings → Breeds** — Add breeds for your species (Angus, Hereford, Rhode Island Red, etc.)
2. **Settings → Animal Categories** — Create categories to group animals (Herd groups, flocks, etc.)
3. **Settings → Owners** — Add owner records if tracking shared or leased animals
4. **Settings → Fee Types** — Define fee types used in sale tickets (hauling, commission, etc.)

---

## Navigation

```
🐄 Herds & Flocks
│
├── Dashboard
│
├── 🐮 Livestock
│   ├── Herds & Flocks (groups)
│   ├── Animals (individual records)
│   ├── Health Records
│   ├── Weight Tracking
│   └── Processing Records
│
├── 🌳 Land Management
│   ├── Pastures
│   ├── Grazing Events
│   ├── Soil Samples
│   ├── Tasks
│   └── Treatments
│
├── 🌧 Rainfall
│
├── 💲 Sales
│   ├── Sale Tickets
│   └── Buyers
│
└── ⚙ Settings
    ├── Breeds
    ├── Animal Categories
    ├── Owners
    └── Fee Types
```

---

## Dashboard

The dashboard shows:

- **Stat Cards** — Total counts for Cattle, Sheep/Goats, Poultry, and Pastures
- **Quick Actions** — Buttons for Add Animal, New Sale Ticket, Record Weight, and Health Record
- **Recent Activity** — Latest events across the system

---

## Livestock Management

### Herds & Flocks

Manage named groups of animals:

1. Go to **Livestock → Herds & Flocks**
2. Click **Add Herd/Flock**
3. Enter: Name, Species, Description, Status
4. Associate animals with herds/flocks for grouping

**Example groups:** "East Pasture Herd", "Layer Flock A", "Breeding Bulls", "2025 Calves"

### Animals

Individual animal records are the core of the system.

**Adding an Animal:**
1. Go to **Livestock → Animals**
2. Click **Add Animal**
3. Enter:

| Field | Description |
|-------|-------------|
| Tag/ID Number | Unique identifier (ear tag, leg band, etc.) |
| Name (optional) | Display name |
| Species | Cattle, Sheep, Goat, Pig, Chicken, Turkey, Duck, etc. |
| Breed | Selected from your configured breeds |
| Birth Date | Date of birth or estimated age |
| Gender | Male, Female, Castrated |
| Dam / Sire | Parent animals (for lineage tracking) |
| Herd/Flock | Group assignment |
| Status | Active, Sold, Processed, Deceased, Transferred |
| Category | From your configured animal categories |
| Owner | If tracking shared/leased animals |

**Filtering & Searching:**
- Filter by species, breed, status, herd/flock, or category
- Search by tag number or name
- Sort by various fields

### Health Records

Track veterinary and health events:

1. Go to **Livestock → Health Records**
2. Click **Add Health Record**
3. Enter:

| Field | Description |
|-------|-------------|
| Animal(s) | Select one or more animals |
| Event Type | Vaccination, Treatment, Checkup, Illness, Injury, Deworming, etc. |
| Date | When the event occurred |
| Administered By | Vet name or staff member |
| Product/Medication | What was used (optional) |
| Dosage | Amount administered (optional) |
| Cost | Cost of treatment (optional) |
| Notes | Additional details |
| Follow-up Date | When to re-check (optional) |

### Weight Tracking

Monitor animal growth and condition:

1. Go to **Livestock → Weight Tracking**
2. Click **Record Weight**
3. Enter: Animal, Date, Weight (lbs or kg)
4. View weight history and track average daily gain over time

### Processing Records

When animals are processed (butchered/prepared for sale):

1. Go to **Livestock → Processing Records**
2. Click **Add Record**
3. Enter:

| Field | Description |
|-------|-------------|
| Animal(s) | Select animals being processed |
| Process Date | Date of processing |
| Processor | Name of processor/facility |
| Live Weight | Weight before processing |
| Hanging Weight | Carcass weight (optional) |
| Cuts/Products | List of cuts produced with weights |
| Cost | Processing cost |
| Notes | Additional details |

4. Products from processing can be linked to inventory items in the Back Office

---

## Land Management

### Pastures

Manage your pasture/paddock records:

1. Go to **Land Management → Pastures**
2. Click **Add Pasture**
3. Enter: Name, Acreage, Description, Status, Forage Type, Fencing Type
4. Track which animals are currently in each pasture

### Grazing Events

Record when animals move between pastures:

1. Go to **Land Management → Grazing Events**
2. Click **New Event**
3. Enter: Pasture, Animal(s) or Herd/Flock, Start Date, End Date, Notes
4. Track grazing rotation history for each pasture

### Soil Samples

Record soil test results:

1. Go to **Land Management → Soil Samples**
2. Click **Add Sample**
3. Enter: Pasture, Date, Lab Name, pH, N/P/K levels, Organic Matter, Recommendations

### Tasks

Manage pasture maintenance tasks:

1. Go to **Land Management → Tasks**
2. Click **Add Task**
3. Enter: Pasture, Task Type (fencing, clearing, reseeding, mowing), Due Date, Status, Notes

### Treatments

Record pasture treatments:

1. Go to **Land Management → Treatments**
2. Click **Add Treatment**
3. Enter: Pasture, Treatment Type (fertilizer, herbicide, liming, overseeding), Date, Product, Rate, Cost

---

## Rainfall

Track rainfall measurements for your property:

1. Go to **Rainfall** (standalone nav item)
2. Click **Add Record**
3. Enter: Date, Amount (inches), Location/Gauge, Notes
4. View rainfall history and trends

---

## Sales

### Sale Tickets

Create sale records when selling livestock:

1. Go to **Sales → Sale Tickets**
2. Click **New Sale Ticket**
3. Enter:

| Field | Description |
|-------|-------------|
| Buyer | Select from configured buyers |
| Date | Sale date |
| Animals | Select animals being sold |
| Price Per Head | Individual animal pricing |
| Total Weight | If selling by weight |
| Price Per Pound | If selling by weight |
| Fees | Hauling, commission, etc. (from configured fee types) |
| Notes | Sale conditions, agreements |

4. On completion, selected animals' status updates to "Sold"

### Buyers

Manage buyer contacts:

1. Go to **Sales → Buyers**
2. Click **Add Buyer**
3. Enter: Name, Business Name, Phone, Email, Address, Notes
4. View purchase history per buyer

---

## Settings

### Breeds

Configure available breeds per species:

- Go to **Settings → Breeds**
- Add breeds with: Name, Species, Description
- Examples: Angus (Cattle), Berkshire (Pig), Rhode Island Red (Chicken)

### Animal Categories

Create grouping categories:

- Go to **Settings → Animal Categories**
- Add categories with: Name, Description
- Examples: Breeding Stock, Market Animals, Show Animals, Retired

### Owners

If you track shared or leased animals:

- Go to **Settings → Owners**
- Add owners with: Name, Contact Info, Notes

### Fee Types

Define fees used on sale tickets:

- Go to **Settings → Fee Types**
- Add fee types with: Name, Default Amount, Description
- Examples: Hauling ($50), Commission (3%), Brand Inspection ($5/head)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't add animal — breed dropdown empty | Go to Settings → Breeds and add breeds first |
| Health record not saving | Ensure at least one animal and event type are selected |
| Grazing event won't create | Verify the pasture exists and animals are in Active status |
| Sale ticket not updating animal status | Check that animals were properly selected. Refresh after saving. |
| Dashboard counts wrong | Counts are based on "Active" status animals. Verify animal statuses. |
| Pasture data not loading | Check your internet connection. Try refreshing the page. |

---

*See also: `USER_GUIDE_TENANT_ADMIN.md` for platform overview, and Back Office for inventory integration with processing records.*
