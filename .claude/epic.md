# Epic: Oil Price Tracker - Maintenance & Enhancement

**Project:** OilPrice
**Status:** Active
**Created:** 2025-12-09
**Updated:** 2025-12-09

## Vision

Maintain a clean, performant Oil Price Tracker that provides reliable daily price monitoring with email alerts. The app is feature-complete for core functionality; this epic focuses on code quality, stability, and targeted enhancements.

## Current State

- **Deployed:** Vercel (daily cron at 8am UTC)
- **Database:** Neon Postgres
- **Stack:** Next.js 15, Drizzle ORM, Cheerio, Recharts, Nodemailer
- **Features:** Price scraping, historical charts, email alerts, Brent crude correlation

## Goals

1. **Clean up technical debt** - Remove unused code, fix inconsistencies
2. **Improve maintainability** - Better component structure, type safety
3. **Enhance stability** - Error handling, monitoring, security updates
4. **Add targeted features** - Only those that enhance core value

## Stories

| ID | Story | Priority | Status |
|----|-------|----------|--------|
| 01 | [Cleanup: Remove Dead Code](stories/01-cleanup-dead-code.md) | P0 | ✅ complete |
| 02 | [Security: Update Dependencies](stories/02-security-updates.md) | P0 | ✅ complete |
| 03 | [Refactor: Split Dashboard Component](stories/03-split-dashboard.md) | P1 | ✅ complete |
| 04 | [Fix: Theme State Duplication](stories/04-fix-theme-state.md) | P1 | ✅ complete |
| 05 | [Database: Add Indexes & Migrations](stories/05-database-indexes.md) | P1 | ✅ complete |
| 06 | [Feature: Purchase Tracker](stories/06-purchase-tracker.md) | P1 | ✅ complete |

## Out of Scope

- Complete UI redesign
- Multi-region support
- User accounts/authentication
- Mobile app

## Success Metrics

- Zero unused files/dead code
- No critical security vulnerabilities
- Dashboard.tsx < 300 lines
- All components using consistent theme system
- Database queries < 100ms with indexes

## Notes

This epic manages an established, working application. Changes should be careful and incremental - the app is already in production and working well.
