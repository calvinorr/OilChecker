import { NextRequest, NextResponse } from "next/server";
import { getPurchases, addPurchase, getPriceHistory } from "@/lib/db";

export async function GET() {
  try {
    const [purchases, priceHistory] = await Promise.all([
      getPurchases(50),
      getPriceHistory(365), // Get a year of price history for comparisons
    ]);

    // Build a map of dates to best prices for quick lookup
    const priceByDate = new Map<string, number>();
    for (const price of priceHistory) {
      if (price.recordedAt) {
        const dateKey = new Date(price.recordedAt).toISOString().split("T")[0];
        if (!priceByDate.has(dateKey)) {
          priceByDate.set(dateKey, parseFloat(price.cheapestPpl));
        }
      }
    }

    // Enrich purchases with comparison data
    const enrichedPurchases = purchases.map((purchase) => {
      const dateKey = new Date(purchase.purchaseDate).toISOString().split("T")[0];
      const bestPpl = priceByDate.get(dateKey);
      const myPpl = parseFloat(purchase.ppl);

      let loyaltyCost: number | null = null;
      let pplDifference: number | null = null;

      if (bestPpl !== undefined) {
        pplDifference = myPpl - bestPpl;
        // Loyalty cost = (difference in ppl) * litres / 100
        loyaltyCost = (pplDifference * parseFloat(purchase.litres)) / 100;
      }

      return {
        ...purchase,
        bestPpl: bestPpl ?? null,
        pplDifference,
        loyaltyCost,
      };
    });

    // Calculate totals
    const totalLoyaltyCost = enrichedPurchases.reduce(
      (sum, p) => sum + (p.loyaltyCost ?? 0),
      0
    );
    const totalSpent = purchases.reduce(
      (sum, p) => sum + parseFloat(p.totalPrice),
      0
    );
    const totalLitres = purchases.reduce(
      (sum, p) => sum + parseFloat(p.litres),
      0
    );

    return NextResponse.json({
      purchases: enrichedPurchases,
      stats: {
        totalPurchases: purchases.length,
        totalSpent,
        totalLitres,
        totalLoyaltyCost,
        averagePpl: totalLitres > 0 ? (totalSpent / totalLitres) * 100 : 0,
      },
    });
  } catch (error) {
    console.error("Failed to fetch purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { purchaseDate, litres, totalPrice, supplier, notes } = body;

    if (!purchaseDate || !litres || !totalPrice) {
      return NextResponse.json(
        { error: "Missing required fields: purchaseDate, litres, totalPrice" },
        { status: 400 }
      );
    }

    const purchase = await addPurchase({
      purchaseDate: new Date(purchaseDate),
      litres: litres.toString(),
      totalPrice: totalPrice.toString(),
      supplier: supplier || "Finlay Fuels",
      notes: notes || null,
    });

    return NextResponse.json({ purchase }, { status: 201 });
  } catch (error) {
    console.error("Failed to add purchase:", error);
    return NextResponse.json(
      { error: "Failed to add purchase" },
      { status: 500 }
    );
  }
}
