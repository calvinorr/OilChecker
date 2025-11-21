# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Local Heating Oil Price Tracker - Scrapes daily 500L prices from cheapestoil.co.uk, stores history in Neon Postgres, displays dashboard, and sends email alerts on price drops.

## Development Commands

```bash
npm install        # Install dependencies
npm run dev        # Start Next.js dev server at http://localhost:3000
npm run build      # Production build
npm run lint       # Run ESLint
```

## Architecture

```
app/
├── api/cron/route.ts    # Scraper API (triggered by Vercel cron)
├── page.tsx             # Dashboard (Server Component)
├── layout.tsx           # Root layout
└── globals.css          # Tailwind styles

components/
├── Dashboard.tsx        # Price chart + stats (Client Component)
└── StatsCard.tsx        # Reusable stat card

lib/
├── db.ts               # Neon database connection + queries
├── schema.ts           # Drizzle ORM schema
└── email.ts            # Nodemailer email alerts
```

## Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **Database**: Neon Serverless Postgres + Drizzle ORM
- **Scraping**: Cheerio
- **Charts**: Recharts
- **Email**: Nodemailer (Google SMTP)
- **Deployment**: Vercel (cron at 8am UTC daily)

## Environment Variables

```bash
DATABASE_URL=           # Neon connection string
CRON_SECRET=            # Bearer token for cron endpoint
SMTP_USER=              # Gmail address
SMTP_PASS=              # Google App Password
ALERT_EMAIL=            # Recipient for alerts
PRICE_THRESHOLD=300     # Alert if price below this
```

## Key Endpoints

- `GET /` - Dashboard with price history chart
- `GET /api/cron` - Scraper (requires `Authorization: Bearer CRON_SECRET`)

## Code Style

- TypeScript + React functional components
- 2-space indentation
- PascalCase for components, camelCase for functions
- Conventional Commits: `feat:`, `fix:`, `chore:`
