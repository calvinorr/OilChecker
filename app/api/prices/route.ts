import { NextResponse } from "next/server";
import { getPriceHistory } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const priceHistory = await getPriceHistory(30);

    if (priceHistory.length === 0) {
      return NextResponse.json({ priceHistory: [], stats: null });
    }

    const currentPrice = parseFloat(priceHistory[0].cheapestPrice500L);
    const thirtyDayLow = Math.min(
      ...priceHistory.map((p) => parseFloat(p.cheapestPrice500L))
    );
    const averagePrice =
      priceHistory.reduce((sum, p) => sum + parseFloat(p.cheapestPrice500L), 0) /
      priceHistory.length;

    return NextResponse.json({
      priceHistory,
      stats: {
        currentPrice,
        thirtyDayLow,
        averagePrice,
      },
    });
  } catch (error) {
    console.error("Failed to fetch prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}
