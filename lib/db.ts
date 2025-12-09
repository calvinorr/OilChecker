import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { desc, eq, and, gte, lte } from "drizzle-orm";
import * as schema from "./schema";
import { oilPrices, OilPrice, purchases, Purchase, NewPurchase } from "./schema";

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });

export type Database = typeof db;

export async function getPriceHistory(limit: number = 30): Promise<OilPrice[]> {
  const results = await db
    .select()
    .from(oilPrices)
    .orderBy(desc(oilPrices.recordedAt))
    .limit(limit);

  return results;
}

// Purchase queries
export async function getPurchases(limit: number = 50): Promise<Purchase[]> {
  const results = await db
    .select()
    .from(purchases)
    .orderBy(desc(purchases.purchaseDate))
    .limit(limit);

  return results;
}

export async function addPurchase(purchase: Omit<NewPurchase, "id" | "createdAt" | "ppl">): Promise<Purchase> {
  const ppl = (parseFloat(purchase.totalPrice as string) / parseFloat(purchase.litres as string)) * 100;

  const [result] = await db
    .insert(purchases)
    .values({
      ...purchase,
      ppl: ppl.toFixed(2),
    })
    .returning();

  return result;
}

export async function updatePurchase(id: string, purchase: Partial<Omit<NewPurchase, "id" | "createdAt">>): Promise<Purchase | null> {
  // Recalculate PPL if litres or totalPrice changed
  let ppl: string | undefined;
  if (purchase.litres && purchase.totalPrice) {
    ppl = ((parseFloat(purchase.totalPrice as string) / parseFloat(purchase.litres as string)) * 100).toFixed(2);
  }

  const [result] = await db
    .update(purchases)
    .set({
      ...purchase,
      ...(ppl && { ppl }),
    })
    .where(eq(purchases.id, id))
    .returning();

  return result || null;
}

export async function deletePurchase(id: string): Promise<boolean> {
  const result = await db
    .delete(purchases)
    .where(eq(purchases.id, id))
    .returning();

  return result.length > 0;
}

// Get best price for a specific date (for comparison)
export async function getBestPriceForDate(date: Date): Promise<OilPrice | null> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const [result] = await db
    .select()
    .from(oilPrices)
    .where(
      and(
        gte(oilPrices.recordedAt, startOfDay),
        lte(oilPrices.recordedAt, endOfDay)
      )
    )
    .limit(1);

  return result || null;
}
