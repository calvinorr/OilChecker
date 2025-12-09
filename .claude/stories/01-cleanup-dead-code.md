# Story: Cleanup - Remove Dead Code

**Epic:** [epic.md](../epic.md)
**Status:** complete
**Priority:** P0
**Created:** 2025-12-09
**Updated:** 2025-12-09 12:45

## Objective

Remove all unused files, functions, and assets to reduce codebase noise and improve maintainability.

## Acceptance Criteria

- [x] Delete `components/StatsCard.tsx` (unused - 52 lines)
- [x] Delete `components/Skeleton.tsx` (unused - 80 lines)
- [x] Delete unused Next.js template SVGs from public/
  - `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`
- [x] Delete or update `AGENTS.md` (references old Vite setup)
- [x] Remove `fetchBrentCrudeHistory()` from `lib/crude-oil.ts` (39 lines, never called)
- [x] Remove `supplierToSlug()` from `lib/utils.ts` - **KEPT** (used internally by `getSupplierUrl()`)
- [x] Remove `formatDate()` from `lib/utils.ts` (16 lines, never called)
- [x] Verify build passes after cleanup
- [x] Commit with message: `chore: remove dead code and unused assets`

## Implementation Notes

**Safe to delete immediately:**
- StatsCard.tsx - no imports found
- Skeleton.tsx - no imports found
- 5 SVG files - not referenced in any component
- AGENTS.md - completely outdated

**Verify before removing:**
- `formatDate()` - check if used anywhere, may have been added for future use
- `supplierToSlug()` - paired with `getSupplierUrl()`, check usage

**Do NOT delete:**
- `hasEnoughData()` - used in Dashboard.tsx
- `getSupplierUrl()` - used in Dashboard.tsx
- `calculateCorrelation()`, `calculateExpectedPrice()`, `getBuySignal()` - used

## Test Plan

```bash
npm run build    # Must pass with no errors
npm run lint     # No new lint errors
npm run dev      # Manually verify app still works
```

## Completion Evidence

- Build: ✅ Passed
- Lines removed: 226
- Files deleted: 8 (2 components, 5 SVGs, 1 markdown)
- Commit: `bca23ff` - chore: remove dead code and unused assets
