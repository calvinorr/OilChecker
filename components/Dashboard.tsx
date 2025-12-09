"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { OilPrice, SupplierData } from "@/lib/schema";
import {
  calculateCorrelation,
  calculateExpectedPrice,
  getBuySignal,
} from "@/lib/crude-oil";
import { hasEnoughData } from "@/lib/utils";
import { HeroSection } from "./HeroSection";
import { StatsGrid } from "./StatsGrid";
import { SuppliersList } from "./SuppliersList";
import { PriceChart } from "./PriceChart";
import { PriceHistory } from "./PriceHistory";
import { PurchaseTracker } from "./PurchaseTracker";
import { DateRange } from "./DateRangeSelector";

interface DashboardProps {
  priceHistory: OilPrice[];
  currentPrice: number;
  thirtyDayLow: number;
  averagePrice: number;
}

export default function Dashboard({
  priceHistory: initialPriceHistory,
  currentPrice: initialCurrentPrice,
  thirtyDayLow: initialThirtyDayLow,
  averagePrice: initialAveragePrice,
}: DashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [priceHistory, setPriceHistory] = useState(initialPriceHistory);
  const [currentPrice, setCurrentPrice] = useState(initialCurrentPrice);
  const [thirtyDayLow, setThirtyDayLow] = useState(initialThirtyDayLow);
  const [averagePrice, setAveragePrice] = useState(initialAveragePrice);

  // Check if data is stale (older than today and past 9am UTC when cron should have run)
  const isDataStale = useCallback(() => {
    if (priceHistory.length === 0) return true;

    const latestDate = new Date(priceHistory[0].recordedAt!);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Data is stale if:
    // 1. Latest record is from before today AND
    // 2. It's past 9am UTC (1 hour after cron should run at 8am UTC)
    const isOldData = latestDate < todayStart;
    const isPastCronTime = now.getUTCHours() >= 9;

    return isOldData && isPastCronTime;
  }, [priceHistory]);

  // Trigger a fresh scrape via the refresh endpoint
  const triggerRefresh = useCallback(async () => {
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      if (!res.ok) return false;
      return true;
    } catch {
      return false;
    }
  }, []);

  // Silently fetch new data from database
  const fetchLatestData = useCallback(async () => {
    try {
      const res = await fetch("/api/prices");
      if (!res.ok) return;
      const data = await res.json();
      if (data.priceHistory?.length > 0) {
        setPriceHistory(data.priceHistory);
        setCurrentPrice(data.stats.currentPrice);
        setThirtyDayLow(data.stats.thirtyDayLow);
        setAveragePrice(data.stats.averagePrice);
      }
    } catch {
      // Silently fail - will retry next interval
    }
  }, []);

  // Auto-refresh on mount if data is stale, and daily thereafter
  useEffect(() => {
    const loadDate = new Date().toDateString();
    let hasTriggeredRefresh = false;

    // Check on mount if data is stale and trigger refresh
    const checkAndRefreshIfStale = async () => {
      if (isDataStale() && !hasTriggeredRefresh) {
        hasTriggeredRefresh = true;
        const refreshed = await triggerRefresh();
        if (refreshed) {
          // Wait a moment for the scrape to complete, then fetch updated data
          setTimeout(fetchLatestData, 2000);
        }
      }
    };

    // Run immediately on mount
    checkAndRefreshIfStale();

    const checkForNewDay = () => {
      if (new Date().toDateString() !== loadDate) {
        // New day - trigger refresh
        triggerRefresh().then((refreshed) => {
          if (refreshed) {
            setTimeout(fetchLatestData, 2000);
          }
        });
      }
    };

    // Check every hour
    const interval = setInterval(checkForNewDay, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLatestData, isDataStale, triggerRefresh]);

  // Filter data by date range
  const filteredHistory = useMemo(() => {
    const days = parseInt(dateRange);
    return priceHistory.slice(0, days);
  }, [priceHistory, dateRange]);

  // Process chart data
  const chartData = useMemo(
    () =>
      [...filteredHistory].reverse().map((record) => ({
        date: new Date(record.recordedAt!).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
        price: parseFloat(record.cheapestPrice500L),
        ppl: parseFloat(record.cheapestPpl),
        brentGbp: record.brentCrudeGbp ? parseFloat(record.brentCrudeGbp) : null,
      })),
    [filteredHistory]
  );

  const latestRecord = priceHistory[0];
  const currentPpl = latestRecord ? parseFloat(latestRecord.cheapestPpl) : 0;
  const thirtyDayHigh = Math.max(
    ...priceHistory.map((r) => parseFloat(r.cheapestPrice500L))
  );

  // Crude oil data
  const currentCrudeUsd = latestRecord?.brentCrudeUsd
    ? parseFloat(latestRecord.brentCrudeUsd)
    : null;
  const currentCrudeGbp = latestRecord?.brentCrudeGbp
    ? parseFloat(latestRecord.brentCrudeGbp)
    : null;
  const crudeChange = latestRecord?.brentCrudeChange
    ? parseFloat(latestRecord.brentCrudeChange)
    : null;

  // Correlation analysis
  const correlationData = chartData.filter((d) => d.brentGbp !== null);
  const heatingPrices = correlationData.map((d) => d.ppl);
  const crudePrices = correlationData.map((d) => d.brentGbp!);
  const correlation = hasEnoughData(correlationData.length, 5)
    ? calculateCorrelation(heatingPrices, crudePrices)
    : null;

  const expectedPpl = hasEnoughData(correlationData.length, 5)
    ? calculateExpectedPrice(currentCrudeGbp || 0, crudePrices, heatingPrices)
    : null;
  const buySignal = getBuySignal(currentPpl, expectedPpl);

  // Suppliers
  const suppliersRaw = (latestRecord?.suppliersRaw as SupplierData[]) || [];

  // Sparkline data
  const priceSparkline = chartData.slice(-14).map((d) => d.price);
  const crudeSparkline = correlationData.slice(-14).map((d) => d.brentGbp!);

  // Price change
  const previousPrice = priceHistory[1]
    ? parseFloat(priceHistory[1].cheapestPrice500L)
    : currentPrice;
  const priceChange = currentPrice - previousPrice;

  return (
    <div className="space-y-4 sm:space-y-6">
      <HeroSection
        currentPrice={currentPrice}
        currentPpl={currentPpl}
        cheapestSupplier={latestRecord?.cheapestSupplier || "N/A"}
        recordedAt={latestRecord?.recordedAt || null}
        thirtyDayLow={thirtyDayLow}
        thirtyDayHigh={thirtyDayHigh}
        averagePrice={averagePrice}
        priceChange={priceChange}
        currentCrudeUsd={currentCrudeUsd}
        currentCrudeGbp={currentCrudeGbp}
        crudeChange={crudeChange}
        crudeSparkline={crudeSparkline}
        buySignal={buySignal}
      />

      <StatsGrid
        correlation={correlation}
        thirtyDayLow={thirtyDayLow}
        thirtyDayHigh={thirtyDayHigh}
        averagePrice={averagePrice}
        currentPrice={currentPrice}
        priceSparkline={priceSparkline}
        spread={buySignal.spread}
      />

      <SuppliersList suppliers={suppliersRaw} />

      <PriceChart
        chartData={chartData}
        averagePrice={averagePrice}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        hasCorrelationData={correlationData.length > 0}
      />

      <PriceHistory priceHistory={priceHistory} currentPrice={currentPrice} />

      <PurchaseTracker />

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-[10px] text-[var(--foreground-subtle)]">
          Data from cheapestoil.co.uk · Updated daily at 8am
        </p>
      </div>
    </div>
  );
}
