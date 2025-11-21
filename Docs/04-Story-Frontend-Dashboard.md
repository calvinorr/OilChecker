# Story 4: The Dashboard (UI)

## 📝 Description
Now that we have data, we need to display it. We will create a Server Component that fetches data directly from the DB and passes it to a Client Component for the chart.

## 🏃‍♂️ Action Items

### 1. Create a Database Helper
Create `lib/db.ts`:

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { oilPrices } from './schema';
import { desc } from 'drizzle-orm';

export async function getPriceHistory() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  
  return await db.select()
    .from(oilPrices)
    .orderBy(desc(oilPrices.scrapedAt))
    .limit(30); // Get last 30 days
}
```

### 2. Create the Page
Edit `app/page.tsx`. This will be a Server Component (default in Next.js).

```typescript
import { getPriceHistory } from '@/lib/db';
import DashboardClient from '@/components/DashboardClient'; // We will make this next

export default async function Home() {
  const data = await getPriceHistory();
  
  // Format data for the chart (reverse it so it goes left to right)
  const chartData = data.reverse().map(item => ({
    date: item.scrapedAt?.toLocaleDateString('en-GB'),
    price: Number(item.pricePence),
  }));

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Local Oil Tracker</h1>
        <DashboardClient initialData={chartData} />
      </div>
    </main>
  );
}
```

### 3. Create Client Chart Component
Create `components/DashboardClient.tsx`.
(Copy the chart logic from the `index.tsx` prototype I provided earlier, but adapt it to accept `initialData` as a prop).

## ✅ Success Criteria
- [ ] `npm run dev` loads the homepage.
- [ ] The chart displays data fetched from your real Neon database.
