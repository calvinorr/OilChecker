import {
  pgTable,
  uuid,
  timestamp,
  numeric,
  text,
  integer,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const oilPrices = pgTable("oil_prices", {
  id: uuid("id").primaryKey().defaultRandom(),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow(),
  avgPrice500L: numeric("avg_price_500l", { precision: 10, scale: 2 }).notNull(),
  cheapestPrice500L: numeric("cheapest_price_500l", { precision: 10, scale: 2 }).notNull(),
  cheapestSupplier: text("cheapest_supplier").notNull(),
  supplierCount: integer("supplier_count").notNull(),
  avgPpl: numeric("avg_ppl", { precision: 10, scale: 2 }).notNull(),
  cheapestPpl: numeric("cheapest_ppl", { precision: 10, scale: 2 }).notNull(),
  suppliersRaw: jsonb("suppliers_raw").notNull(),
  scrapeSuccess: boolean("scrape_success").default(true),
  // Crude oil data (Brent Crude)
  brentCrudeUsd: numeric("brent_crude_usd", { precision: 10, scale: 2 }),
  brentCrudeGbp: numeric("brent_crude_gbp", { precision: 10, scale: 2 }),
  brentCrudeChange: numeric("brent_crude_change", { precision: 10, scale: 2 }),
}, (table) => ({
  recordedAtIdx: index("idx_oil_prices_recorded_at").on(table.recordedAt.desc()),
}));

export type OilPrice = typeof oilPrices.$inferSelect;
export type NewOilPrice = typeof oilPrices.$inferInsert;

export interface SupplierData {
  name: string;
  price500L: number;
  ppl500L: number;
}

// User purchases table - track actual oil purchases
export const purchases = pgTable("purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  purchaseDate: timestamp("purchase_date", { withTimezone: true }).notNull(),
  litres: numeric("litres", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  ppl: numeric("ppl", { precision: 10, scale: 2 }).notNull(), // calculated: (totalPrice / litres) * 100
  supplier: text("supplier").default("Finlay Fuels"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  purchaseDateIdx: index("idx_purchases_date").on(table.purchaseDate.desc()),
}));

export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
