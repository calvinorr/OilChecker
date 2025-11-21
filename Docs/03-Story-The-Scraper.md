# Story 3: The Scraper (The Worker)

## 📝 Description
This is the engine of the app. We will write an API route that Vercel will trigger automatically. It will fetch your local supplier's website, find the price, and save it to Neon.

## 🏃‍♂️ Action Items

### 1. Create the API Route
Create a file at `app/api/cron/route.ts`.

### 2. Write the Logic
This code needs to be specific to YOUR supplier. You will need to inspect their website.

```typescript
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { oilPrices } from '@/lib/schema';

export const dynamic = 'force-dynamic'; // Important! prevents caching

export async function GET(request: Request) {
  // 1. Security: Check for authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    // 2. Fetch the HTML
    // TODO: Replace with your actual local supplier URL
    const url = 'https://www.bangorfuels.com/'; // Example
    const response = await fetch(url);
    const html = await response.text();
    
    // 3. Parse HTML
    const $ = cheerio.load(html);
    
    // 4. Extract Price
    // You must inspect the website to find the correct selector.
    // Example: finding a price inside a table cell or div
    // This part requires trial and error based on the specific website.
    const priceText = $('.some-price-class').first().text(); 
    
    // Clean the text (remove 'p', '£', commas)
    const cleanPrice = priceText.replace(/[^\d.]/g, '');
    const price = parseFloat(cleanPrice);

    if (!price || isNaN(price)) {
      throw new Error('Could not parse price');
    }

    // 5. Save to DB
    await db.insert(oilPrices).values({
      supplierName: 'Bangor Fuels', 
      pricePence: price.toString(),
      liters: '900',
    });

    return NextResponse.json({ success: true, price });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to scrape' }, { status: 500 });
  }
}
```

### 3. Define CRON_SECRET
In `.env.local`, add a secret password for your cron job:
```env
CRON_SECRET="make-up-a-long-random-password-here"
```

## ✅ Success Criteria
- [ ] You can manually trigger the scraper by visiting `http://localhost:3000/api/cron` (You might need to temporarily disable the auth check to test locally).
- [ ] A new row appears in your Neon database `oil_prices` table.
