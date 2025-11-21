# Story 2: Database Setup (Neon + Drizzle)

## 📝 Description
We need a place to store the daily oil prices. We will set up a free Postgres database on Neon and configure Drizzle ORM to manage our tables.

## 🏃‍♂️ Action Items

### 1. Setup Neon
1. Go to [Neon.tech](https://neon.tech) and sign up.
2. Create a new Project named `OilTracker`.
3. On the dashboard, look for the **Connection String**. It looks like: `postgres://user:pass@endpoint.neon.tech/neondb...`
4. **IMPORTANT:** Ensure you toggle "Pooled connection" if available, or just copy the direct link for now.

### 2. Environment Variables
In your VS Code project root, create a file named `.env.local`.
Add your connection string:

```env
DATABASE_URL="postgres://[YOUR_USER]:[YOUR_PASSWORD]@[YOUR_HOST]/neondb?sslmode=require"
```

### 3. Configure Drizzle
Create a file `drizzle.config.ts` in the root directory:

```typescript
import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### 4. Define the Schema
Create a folder `lib` and a file `lib/schema.ts`. This defines your "Oil Price" table.

```typescript
import { pgTable, serial, text, numeric, timestamp } from 'drizzle-orm/pg-core';

export const oilPrices = pgTable('oil_prices', {
  id: serial('id').primaryKey(),
  supplierName: text('supplier_name').notNull(),
  // We use numeric for money to avoid floating point math errors
  pricePence: numeric('price_pence', { precision: 10, scale: 2 }).notNull(),
  liters: numeric('liters').notNull(), // e.g., '900'
  scrapedAt: timestamp('scraped_at').defaultNow(),
});
```

### 5. Push to Database
Run the migration command to create the table in the real cloud database:

```bash
npx drizzle-kit push
```

## ✅ Success Criteria
- [ ] The command `npx drizzle-kit push` completes successfully without errors.
- [ ] If you look at the "Tables" section in your Neon Dashboard, you see a table named `oil_prices`.
