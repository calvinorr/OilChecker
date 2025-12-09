# Story: Database - Add Indexes & Migrations

**Epic:** [epic.md](../epic.md)
**Status:** complete
**Priority:** P1
**Created:** 2025-12-09
**Updated:** 2025-12-09 13:10

## Objective

Add proper database indexes for query performance and set up Drizzle migration tooling for schema management.

## Acceptance Criteria

- [x] Add index on `recordedAt` column (primary query filter)
- [x] Set up drizzle-kit migrations
- [x] Create initial migration from current schema
- [x] Document migration workflow in CLAUDE.md
- [x] Add npm scripts for migrations

## Implementation Notes

**Index added:**
```sql
CREATE INDEX "idx_oil_prices_recorded_at" ON "oil_prices"
USING btree ("recorded_at" DESC NULLS LAST);
```

**Drizzle migration setup:**
- Created `drizzle.config.ts` for Neon Postgres
- Migration output in `drizzle/` directory
- Uses `DATABASE_URL` environment variable

**New npm scripts:**
```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio"
}
```

## Test Plan

```bash
npm run db:generate         # Generate migration
npm run db:migrate          # Apply to Neon (when ready)
npm run build               # Must pass
```

## Completion Evidence

- Migration files created: 1 (`0000_flat_power_pack.sql`)
- Index type: B-tree descending on `recorded_at`
- Build: ✅ Passed
- Commit: `d3786bf`

**Note:** Run `npm run db:migrate` to apply the index to production database.
