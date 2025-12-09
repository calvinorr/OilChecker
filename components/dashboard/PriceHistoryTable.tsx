import { TrendingDown, TrendingUp, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { OilPrice } from "@/lib/schema";
import { PriceAlert } from "../PriceAlert";

interface PriceHistoryTableProps {
  priceHistory: OilPrice[];
  currentPrice: number;
}

export function PriceHistoryTable({ priceHistory, currentPrice }: PriceHistoryTableProps) {
  return (
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
  );
}
