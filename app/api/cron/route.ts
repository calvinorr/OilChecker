import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { oilPrices, SupplierData } from "@/lib/schema";
import { sendPriceAlert, shouldSendAlert } from "@/lib/email";
import { fetchBrentCrudePrice } from "@/lib/crude-oil";

export const dynamic = "force-dynamic";

const SCRAPE_URL = "https://cheapestoil.co.uk/Heating-Oil-NI";

function decodeHtmlEntities(text: string): string {
  // Decode numeric HTML entities like &#49;&#57;&#51; to "193"
  return text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

function parsePrice(priceText: string): number | null {
  // Decode HTML entities first
  const decoded = decodeHtmlEntities(priceText);
  // Extract price value (removes £ symbol and any whitespace)
  const match = decoded.match(/£?([\d.]+)/);
  if (match) {
    return parseFloat(match[1]);
  }
  return null;
}

function parsePpl(pplText: string): number | null {
  // Extract ppl value like "58.8 ppl *" -> 58.8
  const match = pplText.match(/([\d.]+)\s*ppl/);
  if (match) {
    return parseFloat(match[1]);
  }
  return null;
}

async function scrapeOilPrices(): Promise<{
  suppliers: SupplierData[];
  avgPrice500L: number;
  cheapestPrice500L: number;
  cheapestSupplier: string;
  avgPpl: number;
  cheapestPpl: number;
}> {
  const response = await fetch(SCRAPE_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; OilPriceScraper/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const suppliers: SupplierData[] = [];

  // Find all supplier rows - they have class "pricegrid" or "pricegridalt"
  $(".pricegrid, .pricegridalt").each((_, element) => {
    const $row = $(element);

    // Get supplier name from the anchor tag with class "pricegridsupplier"
    const supplierName = $row.find("a.pricegridsupplier").text().trim();

    if (!supplierName) return;

    // Get the price columns (desktop view - d-none d-md-inline class)
    // Structure: 300L, 500L, 900L in order
    const priceColumns = $row.find(".col_15p.d-none.d-md-inline");

    if (priceColumns.length >= 2) {
      // The 500L price is the second column (index 1)
      const $col500L = $(priceColumns[1]);

      // Get the price text (direct text content, not from child divs)
      const priceText = $col500L.clone().children().remove().end().text().trim();
      const price500L = parsePrice(priceText);

      // Get ppl from the div with class "pp" (for 500L) or just text containing "ppl"
      const pplText = $col500L.find(".pp").text().trim();
      const ppl500L = parsePpl(pplText);

      if (price500L !== null && ppl500L !== null) {
        suppliers.push({
          name: supplierName,
          price500L,
          ppl500L,
        });
      }
    }
  });

  if (suppliers.length === 0) {
    throw new Error("No suppliers found - page structure may have changed");
  }

  // Calculate statistics
  const prices = suppliers.map((s) => s.price500L);
  const ppls = suppliers.map((s) => s.ppl500L);

  const avgPrice500L = prices.reduce((a, b) => a + b, 0) / prices.length;
  const cheapestPrice500L = Math.min(...prices);
  const cheapestSupplier = suppliers.find((s) => s.price500L === cheapestPrice500L)!.name;
  const avgPpl = ppls.reduce((a, b) => a + b, 0) / ppls.length;
  const cheapestPpl = Math.min(...ppls);

  return {
    suppliers,
    avgPrice500L: Math.round(avgPrice500L * 100) / 100,
    cheapestPrice500L,
    cheapestSupplier,
    avgPpl: Math.round(avgPpl * 100) / 100,
    cheapestPpl,
  };
}

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { success: false, error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Fetch heating oil prices and crude oil prices in parallel
    const [heatingOilData, crudeOilData] = await Promise.all([
      scrapeOilPrices(),
      fetchBrentCrudePrice(),
    ]);

    const {
      suppliers,
      avgPrice500L,
      cheapestPrice500L,
      cheapestSupplier,
      avgPpl,
      cheapestPpl,
    } = heatingOilData;

    // Fetch previous record to compare prices
    const [previousRecord] = await db
      .select()
      .from(oilPrices)
      .where(eq(oilPrices.scrapeSuccess, true))
      .orderBy(desc(oilPrices.recordedAt))
      .limit(1);

    const previousPrice = previousRecord
      ? parseFloat(previousRecord.cheapestPrice500L)
      : null;
    const previousPpl = previousRecord
      ? parseFloat(previousRecord.cheapestPpl)
      : null;

    // Insert into database (including crude oil data if available)
    const [inserted] = await db
      .insert(oilPrices)
      .values({
        avgPrice500L: avgPrice500L.toString(),
        cheapestPrice500L: cheapestPrice500L.toString(),
        cheapestSupplier,
        supplierCount: suppliers.length,
        avgPpl: avgPpl.toString(),
        cheapestPpl: cheapestPpl.toString(),
        suppliersRaw: suppliers,
        scrapeSuccess: true,
        brentCrudeUsd: crudeOilData?.price?.toString() || null,
        brentCrudeGbp: crudeOilData?.priceGBP?.toString() || null,
        brentCrudeChange: crudeOilData?.change?.toString() || null,
      })
      .returning();

    // Check if we should send email alert (based on ppl change > 5p)
    const pplThreshold = parseFloat(process.env.PPL_CHANGE_THRESHOLD || "5");
    let emailStatus: { sent: boolean; messageId?: string; error?: string; reason?: string } = {
      sent: false,
    };

    const alertCheck = shouldSendAlert(cheapestPpl, previousPpl, pplThreshold);

    if (alertCheck.shouldSend) {
      console.log(
        `Price alert triggered: ${cheapestPpl}p/L (previous: ${previousPpl}p/L, change: ${alertCheck.change?.toFixed(1)}p, reason: ${alertCheck.reason})`
      );

      // Sort suppliers by price to get top 5
      const sortedSuppliers = [...suppliers].sort(
        (a, b) => a.price500L - b.price500L
      );

      const emailResult = await sendPriceAlert({
        currentPrice: cheapestPrice500L,
        previousPrice,
        cheapestSupplier,
        avgPrice: avgPrice500L,
        top5Suppliers: sortedSuppliers.slice(0, 5),
        recordedAt: inserted.recordedAt!,
      });

      emailStatus = {
        sent: emailResult.success,
        messageId: emailResult.messageId,
        error: emailResult.error,
        reason: alertCheck.reason,
      };

      if (emailResult.success) {
        console.log(`Email alert sent successfully: ${emailResult.messageId}`);
      } else {
        console.log(`Email alert failed: ${emailResult.error}`);
      }
    } else {
      emailStatus.reason = alertCheck.reason;
      console.log(
        `No alert needed: ${cheapestPpl}p/L (previous: ${previousPpl}p/L, threshold: ${pplThreshold}p change)`
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: inserted.id,
        recordedAt: inserted.recordedAt,
        supplierCount: suppliers.length,
        avgPrice500L,
        cheapestPrice500L,
        cheapestSupplier,
        avgPpl,
        cheapestPpl,
        topSuppliers: suppliers.slice(0, 5),
        previousPrice,
        previousPpl,
        pplChange: alertCheck.change,
        emailAlert: emailStatus,
        crudeOil: crudeOilData
          ? {
              priceUsd: crudeOilData.price,
              priceGbp: crudeOilData.priceGBP,
              change: crudeOilData.change,
              changePercent: crudeOilData.changePercent,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Scrape error:", error);

    // Try to log the failure
    try {
      await db.insert(oilPrices).values({
        avgPrice500L: "0",
        cheapestPrice500L: "0",
        cheapestSupplier: "SCRAPE_FAILED",
        supplierCount: 0,
        avgPpl: "0",
        cheapestPpl: "0",
        suppliersRaw: { error: error instanceof Error ? error.message : "Unknown error" },
        scrapeSuccess: false,
      });
    } catch (dbError) {
      console.error("Failed to log scrape failure:", dbError);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
