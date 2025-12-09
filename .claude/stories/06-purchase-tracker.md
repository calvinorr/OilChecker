# Story: Feature - Purchase Tracker

**Epic:** [epic.md](../epic.md)
**Status:** complete
**Priority:** P1
**Created:** 2025-12-09
**Updated:** 2025-12-09 17:35

## Objective

Allow users to record their actual oil purchases (supplier, litres, price, date) and compare against the best available prices to see the "loyalty cost" of using a preferred supplier.

## User Story

As a user who buys from Finlay Fuels (a local supplier without published prices), I want to record my purchases and see how they compare to the cheapest available prices, so I can understand what my supplier loyalty costs me.

## Acceptance Criteria

- [x] Add a "My Purchases" section to the dashboard
- [x] Form to add a purchase: date, litres, total price, supplier name (optional)
- [x] Store purchases in database (new `purchases` table)
- [x] Display purchase history in a table
- [x] Calculate and show PPL for each purchase
- [x] Compare each purchase to the best price on that date
- [x] Show "loyalty cost" (difference between paid and best available)
- [ ] Graph purchases overlaid on the price history chart (future enhancement)
- [x] Running total of cumulative loyalty cost
- [x] Edit/delete purchases
- [x] Build passes with no errors

## Implementation Notes

**Database:**
- New `purchases` table with schema in `lib/schema.ts`
- Fields: id, purchaseDate, litres, totalPrice, ppl, supplier, notes, createdAt
- Index on purchaseDate for efficient queries

**API Routes:**
- `GET /api/purchases` - List purchases with enriched comparison data
- `POST /api/purchases` - Add new purchase
- `PUT /api/purchases/[id]` - Update purchase
- `DELETE /api/purchases/[id]` - Delete purchase

**UI Components:**
- `PurchaseTracker.tsx` - Main component with stats cards + purchase list
- `PurchaseForm.tsx` - Modal form for add/edit with PPL preview

**Calculations:**
- PPL = (totalPrice / litres) * 100
- Loyalty cost = (myPpl - bestPpl) * litres / 100
- Comparison uses best available price from same date

## Test Plan

```bash
npm run build               # ✅ Passed
npm run dev                 # ✅ Running
# Verify: Can add a purchase ✅
# Verify: Purchase appears in history ✅
# Verify: PPL calculated correctly ✅
# Verify: Comparison to best price shown ✅
# Verify: Loyalty cost totals correctly ✅
# Verify: Edit/delete works ✅
```

## Completion Evidence

- Database: `purchases` table created via `db:push`
- API: 4 endpoints (GET, POST, PUT, DELETE)
- UI: PurchaseTracker + PurchaseForm components
- Build: ✅ Passed
- TypeScript: ✅ No errors

## Future Enhancements

- Overlay purchase points on the price history chart
- Export purchases to CSV
- Monthly/yearly summaries
