"use client";

import { useMemo } from "react";
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
  ArrowRight,
  ChevronRight,
  Zap,
  Target,
  Activity,
} from "lucide-react";
import { OilPrice, SupplierData } from "@/lib/schema";
import {
  calculateCorrelation,
  calculateExpectedPrice,
  getBuySignal,
} from "@/lib/crude-oil";

interface DashboardProps {
  priceHistory: OilPrice[];
  currentPrice: number;
  thirtyDayLow: number;
  averagePrice: number;
}

// Sparkline component for mini inline charts
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((value, i) => ({ value, i }));
  return (
    <div className="w-24 h-8">
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

// Radial gauge for correlation
function CorrelationGauge({ value }: { value: number }) {
  const percentage = Math.abs(value) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-700"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#correlationGradient)"
          strokeWidth="8"
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
        <span className="text-2xl font-bold text-white">{percentage.toFixed(0)}%</span>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Correlated</span>
      </div>
    </div>
  );
}

// Price position gauge
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
  const range = high - low;
  const position = range > 0 ? ((current - low) / range) * 100 : 50;
  const avgPosition = range > 0 ? ((average - low) / range) * 100 : 50;

  return (
    <div className="w-full">
      <div className="relative h-3 bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-red-500/20 rounded-full overflow-hidden">
        {/* Average marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-400/50"
          style={{ left: `${avgPosition}%` }}
        />
        {/* Current position */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg shadow-white/25 border-2 border-emerald-400 transition-all duration-500"
          style={{ left: `calc(${position}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-slate-500">
        <span>£{low.toFixed(0)}</span>
        <span className="text-slate-400">avg £{average.toFixed(0)}</span>
        <span>£{high.toFixed(0)}</span>
      </div>
    </div>
  );
}

export default function Dashboard({
  priceHistory,
  currentPrice,
  thirtyDayLow,
  averagePrice,
}: DashboardProps) {
  // Process data
  const chartData = useMemo(
    () =>
      [...priceHistory].reverse().map((record) => ({
        date: new Date(record.recordedAt!).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
        price: parseFloat(record.cheapestPrice500L),
        ppl: parseFloat(record.cheapestPpl),
        brentGbp: record.brentCrudeGbp ? parseFloat(record.brentCrudeGbp) : null,
      })),
    [priceHistory]
  );

  const latestRecord = priceHistory[0];
  const currentPpl = latestRecord ? parseFloat(latestRecord.cheapestPpl) : 0;
  const thirtyDayHigh = Math.max(...priceHistory.map((r) => parseFloat(r.cheapestPrice500L)));

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
  const correlation = calculateCorrelation(heatingPrices, crudePrices);

  const expectedPpl = calculateExpectedPrice(
    currentCrudeGbp || 0,
    crudePrices,
    heatingPrices
  );
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
      bg: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      glow: "shadow-emerald-500/20",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
    },
    hold: {
      bg: "from-amber-500/20 via-amber-500/5 to-transparent",
      glow: "shadow-amber-500/20",
      text: "text-amber-400",
      border: "border-amber-500/30",
    },
    wait: {
      bg: "from-red-500/20 via-red-500/5 to-transparent",
      glow: "shadow-red-500/20",
      text: "text-red-400",
      border: "border-red-500/30",
    },
  };
  const signal = signalStyles[buySignal.signal];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${signal.bg} border ${signal.border} p-8 mb-6`}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-white/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Price Display */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-slate-400 uppercase tracking-wider font-medium">
                Heating Oil · 500L
              </span>
            </div>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-7xl lg:text-8xl font-black text-white tracking-tight">
                £{currentPrice.toFixed(0)}
              </span>
              <div className="flex flex-col">
                <span className="text-2xl text-slate-400">.{(currentPrice % 1).toFixed(2).slice(2)}</span>
                {priceChange !== 0 && (
                  <span className={`flex items-center gap-1 text-sm ${priceChange < 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {priceChange < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    £{Math.abs(priceChange).toFixed(0)}
                  </span>
                )}
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              {currentPpl.toFixed(1)}p per litre · {latestRecord?.cheapestSupplier}
            </p>
            <PriceGauge
              current={currentPrice}
              low={thirtyDayLow}
              high={thirtyDayHigh}
              average={averagePrice}
            />
          </div>

          {/* Signal Display */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center">
            <div className={`relative p-8 rounded-2xl bg-slate-900/50 backdrop-blur border ${signal.border} shadow-2xl ${signal.glow}`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Signal</span>
              </div>
              <div className="flex flex-col items-center">
                {buySignal.signal === "buy" ? (
                  <Zap className={`w-12 h-12 ${signal.text} mb-2`} />
                ) : buySignal.signal === "wait" ? (
                  <Target className={`w-12 h-12 ${signal.text} mb-2`} />
                ) : (
                  <Activity className={`w-12 h-12 ${signal.text} mb-2`} />
                )}
                <span className={`text-3xl font-black ${signal.text} uppercase tracking-wide`}>
                  {buySignal.signal}
                </span>
                <p className="text-xs text-slate-400 text-center mt-2 max-w-[140px]">
                  {buySignal.message}
                </p>
              </div>
            </div>
          </div>

          {/* Crude Oil Comparison */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-slate-400 uppercase tracking-wider font-medium">
                Brent Crude
              </span>
            </div>
            {currentCrudeUsd !== null ? (
              <>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-white">${currentCrudeUsd.toFixed(2)}</span>
                  {crudeChange !== null && (
                    <span className={`flex items-center gap-1 text-sm ${crudeChange < 0 ? "text-emerald-400" : crudeChange > 0 ? "text-red-400" : "text-slate-400"}`}>
                      {crudeChange < 0 ? <TrendingDown className="w-4 h-4" /> : crudeChange > 0 ? <TrendingUp className="w-4 h-4" /> : null}
                      ${Math.abs(crudeChange).toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  £{currentCrudeGbp?.toFixed(2)} per barrel
                </p>
                <div className="flex items-center gap-4">
                  <Sparkline data={crudeSparkline} color="#f59e0b" />
                  <span className="text-xs text-slate-500">14-day trend</span>
                </div>
              </>
            ) : (
              <p className="text-slate-500">Fetching crude data...</p>
            )}
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Correlation Card - Tall */}
        {correlation !== null && (
          <div className="md:row-span-2 rounded-2xl bg-gradient-to-br from-purple-500/10 via-slate-800/50 to-slate-900/50 border border-purple-500/20 p-6 flex flex-col items-center justify-center">
            <span className="text-xs text-slate-400 uppercase tracking-widest mb-4">
              Price Correlation
            </span>
            <CorrelationGauge value={correlation} />
            <p className="text-sm text-slate-400 text-center mt-4 max-w-[200px]">
              {correlation > 0.7
                ? "Strong link — heating oil closely follows crude movements"
                : correlation > 0.4
                  ? "Moderate link — some influence from crude markets"
                  : "Weak link — local factors dominate pricing"}
            </p>
          </div>
        )}

        {/* 30-Day Stats */}
        <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 uppercase tracking-wider">30-Day Low</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-bold text-emerald-400">£{thirtyDayLow.toFixed(0)}</span>
          <div className="mt-2 flex items-center gap-2">
            <Sparkline data={priceSparkline} color="#22c55e" />
          </div>
        </div>

        <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 uppercase tracking-wider">30-Day High</span>
            <TrendingUp className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-3xl font-bold text-red-400">£{thirtyDayHigh.toFixed(0)}</span>
          <p className="text-xs text-slate-500 mt-2">
            Range: £{(thirtyDayHigh - thirtyDayLow).toFixed(0)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Average</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-3xl font-bold text-white">£{averagePrice.toFixed(0)}</span>
          <p className={`text-xs mt-2 ${currentPrice < averagePrice ? "text-emerald-400" : "text-red-400"}`}>
            {currentPrice < averagePrice
              ? `£${(averagePrice - currentPrice).toFixed(0)} below avg`
              : `£${(currentPrice - averagePrice).toFixed(0)} above avg`}
          </p>
        </div>

        {/* Spread Analysis */}
        {buySignal.spread !== null && (
          <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Price Spread</span>
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <span className={`text-3xl font-bold ${buySignal.spread < 0 ? "text-emerald-400" : buySignal.spread > 0 ? "text-red-400" : "text-white"}`}>
              {buySignal.spread > 0 ? "+" : ""}{buySignal.spread}%
            </span>
            <p className="text-xs text-slate-500 mt-2">vs expected from crude</p>
          </div>
        )}
      </div>

      {/* Suppliers - Horizontal Scroll */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Best Prices Today</h2>
          <span className="text-xs text-slate-400">{topSuppliers.length} suppliers</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {topSuppliers.map((supplier, index) => (
            <div
              key={`${supplier.name}-${index}`}
              className={`flex-shrink-0 snap-start w-64 rounded-xl p-4 border transition-all ${
                index === 0
                  ? "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-500/30"
                  : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-medium uppercase tracking-wider ${index === 0 ? "text-emerald-400" : "text-slate-400"}`}>
                  #{index + 1}
                </span>
                {index === 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-wider">
                    Best
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-white mb-1 truncate">{supplier.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${index === 0 ? "text-emerald-400" : "text-white"}`}>
                  £{supplier.price500L.toFixed(0)}
                </span>
                <span className="text-sm text-slate-400">
                  {supplier.ppl500L.toFixed(1)}p/L
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Price History</h2>
            <p className="text-sm text-slate-400">Heating oil vs Brent crude over time</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-400">Heating Oil</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-400">Brent Crude</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#475569"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="#475569"
                tick={{ fill: "#22c55e", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `£${value}`}
                domain={["dataMin - 5", "dataMax + 5"]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#475569"
                tick={{ fill: "#f59e0b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `£${value}`}
                domain={["dataMin - 2", "dataMax + 2"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  padding: "12px",
                }}
                labelStyle={{ color: "#94a3b8", marginBottom: "8px" }}
                formatter={(value: number, name: string) => {
                  if (name === "price") return [`£${value.toFixed(2)}`, "Heating Oil (500L)"];
                  if (name === "brentGbp") return [`£${value.toFixed(2)}/bbl`, "Brent Crude"];
                  return [value, name];
                }}
              />
              <ReferenceLine yAxisId="left" y={averagePrice} stroke="#475569" strokeDasharray="5 5" />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="price"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "#22c55e", stroke: "#0f172a", strokeWidth: 2 }}
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
                  activeDot={{ r: 6, fill: "#f59e0b", stroke: "#0f172a", strokeWidth: 2 }}
                  name="brentGbp"
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent History - Compact */}
      <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white">Recent History</h2>
        </div>
        <div className="divide-y divide-slate-700/30">
          {priceHistory.slice(0, 7).map((record, index) => {
            const prevRecord = priceHistory[index + 1];
            const diff = prevRecord
              ? parseFloat(record.cheapestPrice500L) - parseFloat(prevRecord.cheapestPrice500L)
              : 0;
            return (
              <div
                key={record.id}
                className="flex items-center justify-between px-6 py-3 hover:bg-slate-700/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400 w-24">
                    {new Date(record.recordedAt!).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                  <span className="text-sm text-slate-300">{record.cheapestSupplier}</span>
                </div>
                <div className="flex items-center gap-6">
                  {record.brentCrudeGbp && (
                    <span className="text-sm text-amber-400/70">
                      £{parseFloat(record.brentCrudeGbp).toFixed(0)}/bbl
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-white">
                      £{parseFloat(record.cheapestPrice500L).toFixed(0)}
                    </span>
                    {diff !== 0 && (
                      <span className={`flex items-center text-sm ${diff < 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {diff < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-500">
          Data sourced from cheapestoil.co.uk · Updated daily at 8am
        </p>
      </div>
    </div>
  );
}
