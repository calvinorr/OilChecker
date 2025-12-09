"use client";

import { ExternalLink } from "lucide-react";
import { cn, getSupplierUrl } from "@/lib/utils";
import { SupplierData } from "@/lib/schema";

interface SuppliersListProps {
  suppliers: SupplierData[];
}

export function SuppliersList({ suppliers }: SuppliersListProps) {
  const topSuppliers = [...suppliers]
    .sort((a, b) => a.price500L - b.price500L)
    .slice(0, 8);

  return (
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
  );
}
