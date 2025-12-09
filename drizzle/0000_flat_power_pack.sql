CREATE TABLE "oil_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now(),
	"avg_price_500l" numeric(10, 2) NOT NULL,
	"cheapest_price_500l" numeric(10, 2) NOT NULL,
	"cheapest_supplier" text NOT NULL,
	"supplier_count" integer NOT NULL,
	"avg_ppl" numeric(10, 2) NOT NULL,
	"cheapest_ppl" numeric(10, 2) NOT NULL,
	"suppliers_raw" jsonb NOT NULL,
	"scrape_success" boolean DEFAULT true,
	"brent_crude_usd" numeric(10, 2),
	"brent_crude_gbp" numeric(10, 2),
	"brent_crude_change" numeric(10, 2)
);
--> statement-breakpoint
CREATE INDEX "idx_oil_prices_recorded_at" ON "oil_prices" USING btree ("recorded_at" DESC NULLS LAST);