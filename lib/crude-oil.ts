// Fetch Brent Crude oil prices from Yahoo Finance
// Brent Crude is the most relevant benchmark for UK heating oil

interface CrudeOilData {
  price: number; // USD per barrel
  priceGBP: number; // GBP per barrel (converted)
  change: number; // Daily change in USD
  changePercent: number; // Daily change percentage
  timestamp: Date;
}

interface YahooQuoteResponse {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice: number;
        previousClose: number;
        currency: string;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          close: number[];
        }>;
      };
    }>;
    error: null | { code: string; description: string };
  };
}

// Fetch current Brent Crude price
export async function fetchBrentCrudePrice(): Promise<CrudeOilData | null> {
  try {
    // BZ=F is Brent Crude Futures on Yahoo Finance
    const response = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?interval=1d&range=1d",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
          "Accept-Language": "en-US,en;q=0.9",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(`Yahoo Finance API error: ${response.status}`);
      // Try fallback API
      return await fetchBrentCrudeFallback();
    }

    const data: YahooQuoteResponse = await response.json();

    if (data.chart.error || !data.chart.result?.[0]) {
      console.error("Yahoo Finance returned error:", data.chart.error);
      return null;
    }

    const result = data.chart.result[0];
    const currentPrice = result.meta.regularMarketPrice;
    const previousClose = result.meta.previousClose;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    // Fetch GBP/USD exchange rate for conversion
    const gbpRate = await fetchGBPUSDRate();
    const priceGBP = gbpRate ? currentPrice / gbpRate : currentPrice * 0.79; // Fallback rate

    return {
      price: Math.round(currentPrice * 100) / 100,
      priceGBP: Math.round(priceGBP * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Failed to fetch Brent Crude price:", error);
    return null;
  }
}

// Fetch GBP/USD exchange rate
async function fetchGBPUSDRate(): Promise<number | null> {
  try {
    const response = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/GBPUSD=X?interval=1d&range=1d",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) return null;

    const data: YahooQuoteResponse = await response.json();
    if (data.chart.error || !data.chart.result?.[0]) return null;

    return data.chart.result[0].meta.regularMarketPrice;
  } catch {
    return null;
  }
}

// Fallback: fetch from alternative free API
async function fetchBrentCrudeFallback(): Promise<CrudeOilData | null> {
  try {
    // Try exchangerate.host commodities endpoint (free, no API key required)
    const response = await fetch(
      "https://api.exchangerate.host/latest?base=USD&symbols=GBP&source=ecb",
      { cache: "no-store" }
    );

    if (!response.ok) {
      console.error("Fallback API also failed");
      return null;
    }

    // We got exchange rate but can't get crude price from a free API
    // Return null to indicate we couldn't get real crude data
    console.log("Fallback API reached but no crude price available");
    return null;
  } catch (error) {
    console.error("Fallback crude fetch failed:", error);
    return null;
  }
}

// Fetch historical Brent Crude prices (for correlation analysis)
export async function fetchBrentCrudeHistory(
  days: number = 90
): Promise<Array<{ date: string; price: number; priceGBP: number }>> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?interval=1d&range=${days}d`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; OilPriceTracker/1.0)",
        },
      }
    );

    if (!response.ok) return [];

    const data: YahooQuoteResponse = await response.json();
    if (data.chart.error || !data.chart.result?.[0]) return [];

    const result = data.chart.result[0];
    const timestamps = result.timestamp || [];
    const closes = result.indicators.quote[0]?.close || [];

    // Get GBP rate for conversion (use current rate as approximation)
    const gbpRate = (await fetchGBPUSDRate()) || 1.27;

    return timestamps
      .map((ts, i) => ({
        date: new Date(ts * 1000).toISOString().split("T")[0],
        price: Math.round((closes[i] || 0) * 100) / 100,
        priceGBP: Math.round(((closes[i] || 0) / gbpRate) * 100) / 100,
      }))
      .filter((d) => d.price > 0);
  } catch (error) {
    console.error("Failed to fetch Brent Crude history:", error);
    return [];
  }
}

// Calculate Pearson correlation coefficient
export function calculateCorrelation(x: number[], y: number[]): number | null {
  if (x.length !== y.length || x.length < 3) return null;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  if (denominator === 0) return null;

  return Math.round((numerator / denominator) * 1000) / 1000;
}

// Calculate expected heating oil price based on crude (simple linear regression)
export function calculateExpectedPrice(
  crudePrice: number,
  historicalCrude: number[],
  historicalHeating: number[]
): number | null {
  if (historicalCrude.length !== historicalHeating.length || historicalCrude.length < 5) {
    return null;
  }

  const n = historicalCrude.length;
  const sumX = historicalCrude.reduce((a, b) => a + b, 0);
  const sumY = historicalHeating.reduce((a, b) => a + b, 0);
  const sumXY = historicalCrude.reduce((acc, xi, i) => acc + xi * historicalHeating[i], 0);
  const sumX2 = historicalCrude.reduce((acc, xi) => acc + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return Math.round((slope * crudePrice + intercept) * 100) / 100;
}

// Determine buy signal based on spread from expected price
export function getBuySignal(
  actualPpl: number,
  expectedPpl: number | null
): { signal: "buy" | "hold" | "wait"; spread: number | null; message: string } {
  if (expectedPpl === null) {
    return { signal: "hold", spread: null, message: "Insufficient data for analysis" };
  }

  const spread = actualPpl - expectedPpl;
  const spreadPercent = (spread / expectedPpl) * 100;

  if (spreadPercent < -5) {
    return {
      signal: "buy",
      spread: Math.round(spreadPercent * 10) / 10,
      message: `${Math.abs(spreadPercent).toFixed(1)}% below expected - Good time to buy!`,
    };
  } else if (spreadPercent > 5) {
    return {
      signal: "wait",
      spread: Math.round(spreadPercent * 10) / 10,
      message: `${spreadPercent.toFixed(1)}% above expected - Consider waiting`,
    };
  } else {
    return {
      signal: "hold",
      spread: Math.round(spreadPercent * 10) / 10,
      message: "Price is near expected value",
    };
  }
}
