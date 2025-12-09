# Story: Security - Update Dependencies

**Epic:** [epic.md](../epic.md)
**Status:** complete
**Priority:** P0
**Created:** 2025-12-09
**Updated:** 2025-12-09 12:55

## Objective

Resolve all critical and high severity security vulnerabilities in dependencies.

## Acceptance Criteria

- [x] Run `npm audit` and document current vulnerabilities
- [x] Update Next.js to latest stable (16.0.8 - fixes CRITICAL RCE)
- [x] Run `npm audit fix` for auto-fixable issues
- [x] Manually update remaining vulnerable packages if safe
- [x] Verify build passes after updates
- [x] Test app functionality (scraper, dashboard, theme toggle)
- [x] Commit with message: `chore: update dependencies to fix security vulnerabilities`

## Implementation Notes

**Known issues from audit:**
- Next.js: CRITICAL severity - update to 16.0.8+
- drizzle-kit: moderate (esbuild vulnerability) - dev dependency, lower risk

**Update strategy:**
1. Update Next.js first (most critical)
2. Run full npm update
3. Test thoroughly - Next.js updates can break things

**Potential breaking changes:**
- Check Next.js changelog for migration notes
- Test Server Components still work
- Verify API routes unchanged

## Test Plan

```bash
npm audit                    # Check current state
npm update next@latest       # Update Next.js
npm audit fix               # Fix remaining
npm run build               # Must pass
npm run dev                 # Manual verification
# Test: Dashboard loads
# Test: Theme toggle works
# Test: Price data displays
```

## Completion Evidence

- Vulnerabilities before: 6 (1 critical, 1 low, 4 moderate)
- Vulnerabilities after: 4 moderate (all in drizzle-kit dev dependency - acceptable)
- Next.js version: 16.0.3 → 16.0.8
- nodemailer: 7.0.10 → 7.0.11
- Build: ✅ Passed
- Commit: `b8f14c0`
