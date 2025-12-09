"use client";

interface PriceGaugeProps {
  current: number;
  low: number;
  high: number;
  average: number;
}

export function PriceGauge({ current, low, high, average }: PriceGaugeProps) {
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
