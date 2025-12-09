"use client";

import { useState, useMemo } from "react";
import { Zap, Target, Activity } from "lucide-react";
import { OilPrice, SupplierData } from "@/lib/schema";
import {
  calculateCorrelation,
  calculateExpectedPrice,
  getBuySignal,
} from "@/lib/crude-oil";
import { hasEnoughData } from "@/lib/utils";
import { type DateRange } from "./dashboard/DateRangeSelector";
import { SupplierCard } from "./dashboard/SupplierCard";
import { HeroSection } from "./dashboard/HeroSection";
import { StatsGrid } from "./dashboard/StatsGrid";
import { PriceChart } from "./dashboard/PriceChart";
import { PriceHistoryTable } from "./dashboard/PriceHistoryTable";

interface DashboardProps {
  priceHistory: OilPrice[];
  currentPrice: number;
  thirtyDayLow: number;
  averagePrice: number;
}

export default function Dashboard({
  priceHistory,
  currentPrice,
  thirtyDayLow,
  averagePrice,
}: DashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange>("30d");

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
  const topSuppliers = [...suppliersRaw]
    .sort((a, b) => a.price500L - b.price500L)
    .slice(0, 8);

  // Sparkline data
  const priceSparkline = chartData.slice(-14).map((d) => d.price);
  const crudeSparkline = correlationData.slice(-14).map((d) => d.brentGbp!);

  // Price change
  const previousPrice = priceHistory[1]
    ? parseFloat(priceHistory[1].cheapestPrice500L)
    : currentPrice;
  const priceChange = currentPrice - previousPrice;

  // Signal styling
  const signalStyles = {
    buy: {
      bg: "from-emerald-500/20 via-emerald-500/5",
      glow: "shadow-emerald-500/20",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      icon: Zap,
    },
    hold: {
      bg: "from-amber-500/20 via-amber-500/5",
      glow: "shadow-amber-500/20",
      text: "text-amber-400",
      border: "border-amber-500/30",
      icon: Activity,
    },
    wait: {
      bg: "from-red-500/20 via-red-500/5",
      glow: "shadow-red-500/20",
      text: "text-red-400",
      border: "border-red-500/30",
      icon: Target,
    },
  };
  const signal = signalStyles[buySignal.signal];
  const SignalIcon = signal.icon;

  return (
    <div className="space-y-4 sm:space-y-6">
      <HeroSection
        currentPrice={currentPrice}
        priceChange={priceChange}
        currentPpl={currentPpl}
        cheapestSupplier={latestRecord?.cheapestSupplier || ""}
        thirtyDayLow={thirtyDayLow}
        thirtyDayHigh={thirtyDayHigh}
        averagePrice={averagePrice}
        signal={signal}
        buySignal={buySignal}
        currentCrudeUsd={currentCrudeUsd}
        currentCrudeGbp={currentCrudeGbp}
        crudeChange={crudeChange}
        crudeSparkline={crudeSparkline}
      />

      <StatsGrid
        correlation={correlation}
        thirtyDayLow={thirtyDayLow}
        thirtyDayHigh={thirtyDayHigh}
        averagePrice={averagePrice}
        currentPrice={currentPrice}
        priceSparkline={priceSparkline}
        buySignal={buySignal}
      />

      {/* Suppliers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-semibold text-[var(--foreground)]">Best Prices Today</h2>
          <span className="text-[10px] text-[var(--foreground-muted)]">{topSuppliers.length} suppliers</span>
        </div>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {topSuppliers.map((supplier, index) => (
            <SupplierCard
              key={`${supplier.name}-${index}`}
              supplier={supplier}
              index={index}
            />
          ))}
        </div>
      </div>

      <PriceChart
        chartData={chartData}
        correlationData={correlationData}
        averagePrice={averagePrice}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <PriceHistoryTable priceHistory={priceHistory} currentPrice={currentPrice} />

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-[10px] text-[var(--foreground-subtle)]">
          Data from cheapestoil.co.uk · Updated daily at 8am
        </p>
      </div>
    </div>
  );
}
