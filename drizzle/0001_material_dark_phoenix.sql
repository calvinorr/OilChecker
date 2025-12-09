CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_date" timestamp with time zone NOT NULL,
	"litres" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"ppl" numeric(10, 2) NOT NULL,
	"supplier" text DEFAULT 'Finlay Fuels',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "idx_purchases_date" ON "purchases" USING btree ("purchase_date" DESC NULLS LAST);