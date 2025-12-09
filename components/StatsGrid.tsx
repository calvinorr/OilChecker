"use client";

import { TrendingDown, TrendingUp, BarChart3, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { CorrelationGauge } from "./CorrelationGauge";
import { Sparkline } from "./Sparkline";

interface StatsGridProps {
  correlation: number | null;
  thirtyDayLow: number;
  thirtyDayHigh: number;
  averagePrice: number;
  currentPrice: number;
  priceSparkline: number[];
  spread: number | null;
}

export function StatsGrid({
  correlation,
  thirtyDayLow,
  thirtyDayHigh,
  averagePrice,
  currentPrice,
  priceSparkline,
  spread,
}: StatsGridProps) {
  return (
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
      {spread !== null && (
        <div className="rounded-xl sm:rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider">Spread</span>
            <Target className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span
            className={cn(
              "text-2xl font-bold",
              spread < 0
                ? "text-emerald-400"
                : spread > 0
                  ? "text-red-400"
                  : "text-[var(--foreground)]"
            )}
          >
            {spread > 0 ? "+" : ""}
            {spread}%
          </span>
          <p className="text-[10px] text-[var(--foreground-subtle)] mt-2">vs expected</p>
        </div>
      )}
    </div>
  );
}
