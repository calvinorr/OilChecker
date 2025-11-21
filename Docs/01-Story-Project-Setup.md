
# Story 1: Project Initialization

## ⚠️ Important Note
I (the AI) cannot access your local terminal. You must perform these steps on your own computer. However, I have provided a script below to automate 90% of the work.

## 🛠️ Quick Mac Setup for This Repo (existing Vite app)
- From the repo root, run:
  ```bash
  chmod +x Docs/setup-mac.sh
  Docs/setup-mac.sh
  ```
- This installs npm dependencies. Next, create `.env.local` and add `GEMINI_API_KEY=<your key>`, then run `npm run dev`.

## 🚀 Option A: The "One-Click" Script (Recommended)

If you don't want to type commands manually, create a file on your computer and paste the code below.

### For Windows Users
1. Create a new file named `setup.bat` in your projects folder.
2. Paste this code:
```batch
@echo off
echo --- Setting up Oil Tracker Project ---

call npx create-next-app@latest oil-tracker --typescript --tailwind --eslint --no-src-dir --app --import-alias "@/*" --use-npm
cd oil-tracker

echo --- Installing Database Tools ---
call npm install drizzle-orm @neondatabase/serverless dotenv
call npm install -D drizzle-kit

echo --- Installing Scraper & AI ---
call npm install cheerio @google/genai

echo --- Installing UI Components ---
call npm install lucide-react recharts clsx tailwind-merge

echo.
echo --- DONE! Type 'cd oil-tracker' then 'code .' to start. ---
pause
```
3. Double-click `setup.bat`.

### For Mac / Linux Users
1. Create a new file named `setup.sh`.
2. Paste this code:
```bash
#!/bin/bash
echo "--- Setting up Oil Tracker Project ---"

npx create-next-app@latest oil-tracker --typescript --tailwind --eslint --no-src-dir --app --import-alias "@/*" --use-npm
cd oil-tracker

echo "--- Installing Database Tools ---"
npm install drizzle-orm @neondatabase/serverless dotenv
npm install -D drizzle-kit

echo "--- Installing Scraper & AI ---"
npm install cheerio @google/genai

echo "--- Installing UI Components ---"
npm install lucide-react recharts clsx tailwind-merge

echo "--- DONE! Type 'cd oil-tracker' then 'code .' to start. ---"
```
3. Open terminal, run `chmod +x setup.sh`, then run `./setup.sh`.

---

## 🐢 Option B: Manual Setup

### 1. Create the Next.js App
Open your terminal (Command Prompt or Terminal) and run:

```bash
npx create-next-app@latest oil-tracker
```

**Select the following options when prompted:**
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **No** (We keep it simple for now)
- App Router: **Yes**
- Import alias (`@/*`): **Yes**

### 2. Install Dependencies
Navigate into your new folder and install the tools.

```bash
cd oil-tracker
```

**Database & ORM:**
```bash
npm install drizzle-orm @neondatabase/serverless dotenv
npm install -D drizzle-kit
```

**Scraping & AI:**
```bash
npm install cheerio @google/genai
```

**UI Components (Icons & Charts):**
```bash
npm install lucide-react recharts clsx tailwind-merge
```

### 3. Clean Up
Open the project in VS Code (`code .`).
- Delete everything inside `app/page.tsx` (we will rewrite it later).
- Delete `app/globals.css` content but keep the `@tailwind` directives at the top.

## ✅ Success Criteria
- [ ] You can run `npm run dev` and see a blank (or clean) page at `http://localhost:3000`.
- [ ] `package.json` lists `drizzle-orm`, `@neondatabase/serverless`, and `cheerio`.
