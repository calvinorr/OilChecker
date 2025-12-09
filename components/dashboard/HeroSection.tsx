import { TrendingDown, TrendingUp, Droplets, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceGauge } from "./PriceGauge";
import { Sparkline } from "./Sparkline";
import { PriceAlert } from "../PriceAlert";
import type { LucideIcon } from "lucide-react";

interface SignalStyle {
  bg: string;
  glow: string;
  text: string;
  border: string;
  icon: LucideIcon;
}

interface BuySignalData {
  signal: "buy" | "hold" | "wait";
  message: string;
  spread: number | null;
}

interface HeroSectionProps {
  currentPrice: number;
  priceChange: number;
  currentPpl: number;
  cheapestSupplier: string;
  thirtyDayLow: number;
  thirtyDayHigh: number;
  averagePrice: number;
  signal: SignalStyle;
  buySignal: BuySignalData;
  currentCrudeUsd: number | null;
  currentCrudeGbp: number | null;
  crudeChange: number | null;
  crudeSparkline: number[];
}

export function HeroSection({
  currentPrice,
  priceChange,
  currentPpl,
  cheapestSupplier,
  thirtyDayLow,
  thirtyDayHigh,
  averagePrice,
  signal,
  buySignal,
  currentCrudeUsd,
  currentCrudeGbp,
  crudeChange,
  crudeSparkline,
}: HeroSectionProps) {
  const SignalIcon = signal.icon;

  return (
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
          <p className="text-[var(--foreground-muted)] text-sm mb-4">
            {currentPpl.toFixed(1)}p/L · {cheapestSupplier}
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
                {crudeChange !== null && crudeChange !== 0 && (
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
              <p className="text-[var(--foreground-muted)] text-xs mb-3">
                £{currentCrudeGbp?.toFixed(2)}/barrel
              </p>
              <div className="flex items-center gap-3">
                <Sparkline data={crudeSparkline} color="#f59e0b" />
                <span className="text-[10px] text-[var(--foreground-subtle)]">14d trend</span>
              </div>
            </>
          ) : (
            <div className="text-[var(--foreground-subtle)] text-sm">Loading crude data...</div>
          )}
        </div>
      </div>
    </div>
  );
}
