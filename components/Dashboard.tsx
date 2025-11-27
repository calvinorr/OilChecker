"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import {
  TrendingDown,
  TrendingUp,
  Droplets,
  Flame,
  ChevronRight,
  Zap,
  Target,
  Activity,
  ExternalLink,
  BarChart3,
  Clock,
} from "lucide-react";
import { OilPrice, SupplierData } from "@/lib/schema";
import {
  calculateCorrelation,
  calculateExpectedPrice,
  getBuySignal,
} from "@/lib/crude-oil";
import { cn, getSupplierUrl, hasEnoughData } from "@/lib/utils";
import { PriceAlert } from "./PriceAlert";

interface DashboardProps {
  priceHistory: OilPrice[];
  currentPrice: number;
  thirtyDayLow: number;
  averagePrice: number;
}

type DateRange = "7d" | "14d" | "30d";

// Mini sparkline
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!hasEnoughData(data.length, 2)) {
    return (
      <div className="w-20 h-6 flex items-center">
        <span className="text-[10px] text-[var(--foreground-subtle)]">Collecting...</span>
      </div>
    );
  }
  const chartData = data.map((value, i) => ({ value, i }));
  return (
    <div className="w-20 h-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${color})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Correlation gauge
function CorrelationGauge({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-4">
        <div className="w-20 h-20 rounded-full border-4 border-[var(--border)] flex items-center justify-center">
          <Clock className="w-6 h-6 text-[var(--foreground-subtle)]" />
        </div>
        <p className="text-xs text-[var(--foreground-subtle)] mt-3 text-center">
          Need more data<br />for correlation
        </p>
      </div>
    );
  }

  const percentage = Math.abs(value) * 100;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="var(--border)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="url(#correlationGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="correlationGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-[var(--foreground)]">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
}

// Price gauge
function PriceGauge({
  current,
  low,
  high,
  average,
}: {
  current: number;
  low: number;
  high: number;
  average: number;
}) {
  const range = high - low || 1;
  const position = Math.max(0, Math.min(100, ((current - low) / range) * 100));
  const avgPosition = Math.max(0, Math.min(100, ((average - low) / range) * 100));

  return (
    <div className="w-full">
      <div className="relative h-2 bg-gradient-to-r from-emerald-500/30 via-amber-500/30 to-red-500/30 rounded-full">
        <div
          className="absolute top-0 bottom-0 w-px bg-slate-400/50"
          style={{ left: `${avgPosition}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-400 shadow-lg border-2 border-emerald-300 transition-all duration-500"
          style={{ left: `calc(${position}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-[var(--foreground-subtle)]">
        <span>£{low.toFixed(0)}</span>
        <span>£{high.toFixed(0)}</span>
      </div>
    </div>
  );
}

// Date range selector
function DateRangeSelector({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
}) {
  const options: { value: DateRange; label: string }[] = [
    { value: "7d", label: "7D" },
    { value: "14d", label: "14D" },
    { value: "30d", label: "30D" },
  ];

  return (
    <div className="flex gap-1 p-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-md transition-all",
            value === opt.value
              ? "bg-[var(--surface-3)] text-[var(--foreground)]"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
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

  // Silently fetch new data
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

  // Auto-refresh daily to pick up new data after 8am UTC cron
  useEffect(() => {
    const loadDate = new Date().toDateString();

    const checkForNewDay = () => {
      if (new Date().toDateString() !== loadDate) {
        fetchLatestData();
      }
    };

    // Check every hour
    const interval = setInterval(checkForNewDay, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLatestData]);

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
      {/* Mobile-First Hero */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br to-transparent border p-4 sm:p-6 lg:p-8",
          signal.bg,
          signal.border
        )}
      >
        {/* Signal Badge - Floating on mobile */}
        <div className="absolute top-4 right-4 sm:hidden">
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur border",
              signal.border
            )}
          >
            <SignalIcon className={cn("w-3.5 h-3.5", signal.text)} />
            <span className={cn("text-xs font-bold uppercase", signal.text)}>
              {buySignal.signal}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start lg:items-center">
          {/* Main Price */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider font-medium">
                Heating Oil · 500L
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-5xl sm:text-6xl lg:text-7xl font-black text-[var(--foreground)] tracking-tight">
                £{currentPrice.toFixed(0)}
              </span>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl text-[var(--foreground-muted)]">
                  .{(currentPrice % 1).toFixed(2).slice(2)}
                </span>
                {priceChange !== 0 && (
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs",
                      priceChange < 0 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {priceChange < 0 ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : (
                      <TrendingUp className="w-3 h-3" />
                    )}
                    £{Math.abs(priceChange).toFixed(0)}
                  </span>
                )}
              </div>
            </div>
            <p className="text-[var(--foreground-muted)] text-sm mb-2">
              {currentPpl.toFixed(1)}p/L · {latestRecord?.cheapestSupplier}
            </p>
            <p className="text-[10px] text-[var(--foreground-subtle)] mb-4">
              Updated {latestRecord?.recordedAt ? new Date(latestRecord.recordedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "N/A"}{" "}
              {latestRecord?.recordedAt ? new Date(latestRecord.recordedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : ""}
            </p>
            <PriceGauge
              current={currentPrice}
              low={thirtyDayLow}
              high={thirtyDayHigh}
              average={averagePrice}
            />

            {/* Price Alert - Mobile */}
            <div className="mt-4 sm:hidden">
              <PriceAlert currentPrice={currentPrice} />
            </div>
          </div>

          {/* Signal - Desktop */}
          <div className="hidden sm:flex lg:col-span-3 flex-col items-center justify-center">
            <div
              className={cn(
                "relative p-6 rounded-xl border shadow-xl",
                "bg-[var(--surface-1)]",
                signal.border,
                signal.glow
              )}
            >
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="text-[9px] text-[var(--foreground-muted)] uppercase tracking-widest">
                  Signal
                </span>
              </div>
              <div className="flex flex-col items-center">
                <SignalIcon className={cn("w-10 h-10 mb-2", signal.text)} />
                <span
                  className={cn(
                    "text-2xl font-black uppercase tracking-wide",
                    signal.text
                  )}
                >
                  {buySignal.signal}
                </span>
                <p className="text-[10px] text-[var(--foreground-muted)] text-center mt-1.5 max-w-[120px]">
                  {buySignal.message}
                </p>
              </div>
            </div>
          </div>

          {/* Crude Oil */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider font-medium">
                Brent Crude
              </span>
            </div>
            {currentCrudeUsd !== null ? (
              <>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
                    ${currentCrudeUsd.toFixed(2)}
                  </span>
                  {crudeChange !== null && !isNaN(crudeChange) && crudeChange !== 0 && (
                    <span
                      className={cn(
                        "flex items-center gap-0.5 text-xs",
                        crudeChange < 0 ? "text-emerald-400" : "text-red-400"
                      )}
                    >
                      {crudeChange < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : (
                        <TrendingUp className="w-3 h-3" />
                      )}
                      ${Math.abs(crudeChange).toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-[var(--foreground-muted)] text-xs mb-1">
                  £{currentCrudeGbp?.toFixed(2)}/barrel
                </p>
                <p className="text-[10px] text-[var(--foreground-subtle)] mb-3">
                  Updated {latestRecord?.recordedAt ? new Date(latestRecord.recordedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "N/A"}
                </p>
                <div className="flex items-center gap-3">
                  <Sparkline data={crudeSparkline} color="#f59e0b" />
                  <span className="text-[10px] text-[var(--foreground-subtle)]">14d trend</span>
                </div>
              </>
            ) : (
              <div className="text-[var(--foreground-subtle)] text-sm">No crude data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Correlation */}
        <div className="col-span-2 sm:col-span-1 lg:row-span-2 rounded-xl sm:rounded-2xl bg-purple-500/10 border border-purple-500/20 p-4 sm:p-5 flex flex-col items-center justify-center">
          <span className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-widest mb-3">
            Correlation
          </span>
          <CorrelationGauge value={correlation} />
          {correlation !== null && (
            <p className="text-[10px] text-[var(--foreground-muted)] text-center mt-3">
              {correlation > 0.7 ? "Strong" : correlation > 0.4 ? "Moderate" : "Weak"} link to crude
            </p>
          )}
        </div>

        {/* 30-Day Low */}
        <div className="rounded-xl sm:rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider">Low</span>
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-emerald-400">£{thirtyDayLow.toFixed(0)}</span>
          <div className="mt-2">
            <Sparkline data={priceSparkline} color="#22c55e" />
          </div>
        </div>

        {/* 30-Day High */}
        <div className="rounded-xl sm:rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider">High</span>
            <TrendingUp className="w-3.5 h-3.5 text-red-400" />
          </div>
          <span className="text-2xl font-bold text-red-400">£{thirtyDayHigh.toFixed(0)}</span>
          <p className="text-[10px] text-[var(--foreground-subtle)] mt-2">
            Range: £{(thirtyDayHigh - thirtyDayLow).toFixed(0)}
          </p>
        </div>

        {/* Average */}
        <div className="rounded-xl sm:rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider">Avg</span>
            <BarChart3 className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
          </div>
          <span className="text-2xl font-bold text-[var(--foreground)]">£{averagePrice.toFixed(0)}</span>
          <p
            className={cn(
              "text-[10px] mt-2",
              currentPrice < averagePrice ? "text-emerald-400" : "text-red-400"
            )}
          >
            {currentPrice < averagePrice
              ? `£${(averagePrice - currentPrice).toFixed(0)} below`
              : `£${(currentPrice - averagePrice).toFixed(0)} above`}
          </p>
        </div>

        {/* Spread */}
        {buySignal.spread !== null && (
          <div className="rounded-xl sm:rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider">Spread</span>
              <Target className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span
              className={cn(
                "text-2xl font-bold",
                buySignal.spread < 0
                  ? "text-emerald-400"
                  : buySignal.spread > 0
                    ? "text-red-400"
                    : "text-[var(--foreground)]"
              )}
            >
              {buySignal.spread > 0 ? "+" : ""}
              {buySignal.spread}%
            </span>
            <p className="text-[10px] text-[var(--foreground-subtle)] mt-2">vs expected</p>
          </div>
        )}
      </div>

      {/* Suppliers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-semibold text-[var(--foreground)]">Best Prices Today</h2>
          <span className="text-[10px] text-[var(--foreground-muted)]">{topSuppliers.length} suppliers</span>
        </div>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {topSuppliers.map((supplier, index) => (
            <a
              key={`${supplier.name}-${index}`}
              href={getSupplierUrl(supplier.name)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex-shrink-0 snap-start w-56 sm:w-64 rounded-lg sm:rounded-xl p-3 sm:p-4 border transition-all group",
                index === 0
                  ? "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50"
                  : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--foreground-subtle)]"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <span
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-wider",
                    index === 0 ? "text-emerald-400" : "text-[var(--foreground-muted)]"
                  )}
                >
                  #{index + 1}
                </span>
                <ExternalLink className="w-3 h-3 text-[var(--foreground-subtle)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-medium text-[var(--foreground)] text-sm mb-1 truncate">
                {supplier.name}
              </h3>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "text-xl font-bold",
                    index === 0 ? "text-emerald-400" : "text-[var(--foreground)]"
                  )}
                >
                  £{supplier.price500L.toFixed(0)}
                </span>
                <span className="text-xs text-[var(--foreground-muted)]">
                  {supplier.ppl500L.toFixed(1)}p/L
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl sm:rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-[var(--foreground)]">Price History</h2>
            <p className="text-xs text-[var(--foreground-muted)]">Heating oil vs Brent crude</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[var(--foreground-muted)]">Oil</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[var(--foreground-muted)]">Crude</span>
              </div>
            </div>
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
          </div>
        </div>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#475569"
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="#475569"
                tick={{ fill: "#22c55e", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `£${value}`}
                domain={["dataMin - 5", "dataMax + 5"]}
                width={45}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#475569"
                tick={{ fill: "#f59e0b", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `£${value}`}
                domain={["dataMin - 2", "dataMax + 2"]}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                formatter={(value: number, name: string) => {
                  if (name === "price") return [`£${value.toFixed(2)}`, "Heating Oil"];
                  if (name === "brentGbp") return [`£${value.toFixed(2)}/bbl`, "Brent Crude"];
                  return [value, name];
                }}
              />
              <ReferenceLine
                yAxisId="left"
                y={averagePrice}
                stroke="#475569"
                strokeDasharray="5 5"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="price"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#22c55e", stroke: "#0f172a", strokeWidth: 2 }}
                name="price"
              />
              {correlationData.length > 0 && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="brentGbp"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#f59e0b", stroke: "#0f172a", strokeWidth: 2 }}
                  name="brentGbp"
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History */}
      <div className="rounded-xl sm:rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-semibold text-[var(--foreground)]">Recent History</h2>
          <PriceAlert currentPrice={currentPrice} />
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {priceHistory.slice(0, 7).map((record, index) => {
            const prevRecord = priceHistory[index + 1];
            const diff = prevRecord
              ? parseFloat(record.cheapestPrice500L) - parseFloat(prevRecord.cheapestPrice500L)
              : 0;
            return (
              <div
                key={record.id}
                className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 hover:bg-[var(--surface-2)] transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <span className="text-xs sm:text-sm text-[var(--foreground-muted)] w-16 sm:w-20 flex-shrink-0">
                    {new Date(record.recordedAt!).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                  <span className="text-xs sm:text-sm text-[var(--foreground)] truncate">
                    {record.cheapestSupplier}
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                  {record.brentCrudeGbp && (
                    <span className="hidden sm:block text-xs text-amber-400/70">
                      £{parseFloat(record.brentCrudeGbp).toFixed(0)}/bbl
                    </span>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-semibold text-[var(--foreground)]">
                      £{parseFloat(record.cheapestPrice500L).toFixed(0)}
                    </span>
                    {diff !== 0 && (
                      <span
                        className={cn(
                          "text-xs",
                          diff < 0 ? "text-emerald-400" : "text-red-400"
                        )}
                      >
                        {diff < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <TrendingUp className="w-3 h-3" />
                        )}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--foreground-subtle)] hidden sm:block" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-[10px] text-[var(--foreground-subtle)]">
          Data from cheapestoil.co.uk · Updated daily at 8am
        </p>
      </div>
    </div>
  );
}
