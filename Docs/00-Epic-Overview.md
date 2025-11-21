# Epic: Local Heating Oil Price Tracker & Analyst

## 🎯 The Goal
To build a "set and forget" web application that automatically tracks heating oil prices from a specific local supplier (e.g., in Northern Ireland) every morning. The app will visualize price trends and use Google Gemini AI to provide a "Buy" or "Wait" recommendation based on market history.

## 🛠 The Tech Stack (Free Tier Optimized)
We have chosen this stack specifically to keep costs at £0 while using modern, professional tools.

*   **Framework:** Next.js 14+ (App Router) - *The industry standard React framework.*
*   **Database:** Neon (Serverless Postgres) - *Scales to zero when not used, generous free tier.*
*   **ORM:** Drizzle ORM - *Lightweight, type-safe way to talk to the database.*
*   **Scraper:** Cheerio - *Fast, lightweight HTML parser (cheaper than Puppeteer).*
*   **Automation:** Vercel Cron - *Triggers the scraper every morning for free.*
*   **Intelligence:** Google Gemini API - *Analyzes data trends.*
*   **Styling:** Tailwind CSS - *Rapid UI development.*

## 📋 The Roadmap (Stories)
This Epic is broken down into 6 implementation stories. Complete them in order:

1.  **[01-Story-Project-Setup.md](./01-Story-Project-Setup.md)**: Initializing the code.
2.  **[02-Story-Database-Neon.md](./02-Story-Database-Neon.md)**: Setting up the storage.
3.  **[03-Story-The-Scraper.md](./03-Story-The-Scraper.md)**: Building the data collector.
4.  **[04-Story-Frontend-Dashboard.md](./04-Story-Frontend-Dashboard.md)**: Building the UI.
5.  **[05-Story-AI-Integration.md](./05-Story-AI-Integration.md)**: Adding the Brains (Gemini).
6.  **[06-Story-Deployment-Vercel.md](./06-Story-Deployment-Vercel.md)**: Going Live.

## ✅ Definition of Done
The project is complete when:
- [ ] The app is deployed on a live Vercel URL.
- [ ] The database populates automatically every morning at 8 AM.
- [ ] You can visit the site and see a graph of price history.
- [ ] You can click a button to get AI advice on whether to buy 900L now.
