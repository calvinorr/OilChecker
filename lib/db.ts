import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { desc } from "drizzle-orm";
import * as schema from "./schema";
import { oilPrices, OilPrice } from "./schema";

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
