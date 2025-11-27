import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { db } from "@/lib/db";
import { oilPrices, SupplierData } from "@/lib/schema";
import { fetchBrentCrudePrice } from "@/lib/crude-oil";

export const dynamic = "force-dynamic";

const SCRAPE_URL = "https://cheapestoil.co.uk/Heating-Oil-NI";

// Simple in-memory rate limiting (resets on cold start)
let lastRefresh: number = 0;
const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes between refreshes

function decodeHtmlEntities(text: string): string {
  return text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

function parsePrice(priceText: string): number | null {
  const decoded = decodeHtmlEntities(priceText);
  const match = decoded.match(/£?([\d.]+)/);
  if (match) {
    return parseFloat(match[1]);
  }
  return null;
}

function parsePpl(pplText: string): number | null {
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
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const suppliers: SupplierData[] = [];

  $(".pricegrid, .pricegridalt").each((_, element) => {
    const $row = $(element);
    const supplierName = $row.find("a.pricegridsupplier").text().trim();

    if (!supplierName) return;

    const priceColumns = $row.find(".col_15p.d-none.d-md-inline");

    if (priceColumns.length >= 2) {
      const $col500L = $(priceColumns[1]);
      const priceText = $col500L.clone().children().remove().end().text().trim();
      const price500L = parsePrice(priceText);
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

export async function POST() {
  // Rate limiting
  const now = Date.now();
  if (now - lastRefresh < RATE_LIMIT_MS) {
    const waitSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastRefresh)) / 1000);
    return NextResponse.json(
      { success: false, error: `Rate limited. Try again in ${waitSeconds} seconds.` },
      { status: 429 }
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

    // Insert into database
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

    lastRefresh = now;

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
        crudeOil: crudeOilData
          ? {
              priceUsd: crudeOilData.price,
              priceGbp: crudeOilData.priceGBP,
              change: crudeOilData.change,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
