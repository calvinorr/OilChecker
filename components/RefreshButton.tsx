"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  onRefreshComplete?: () => void;
}

export function RefreshButton({ onRefreshComplete }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        setMessage("Updated!");
        onRefreshComplete?.();
        // Reload page to show new data
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage(data.error || "Failed");
      }
    } catch {
      setMessage("Error");
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {message && (
        <span className="text-xs text-[var(--foreground-muted)]">{message}</span>
      )}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={cn(
          "p-2 rounded-lg border transition-all",
          "bg-[var(--surface-1)] border-[var(--border)]",
          "hover:bg-[var(--surface-2)] hover:border-[var(--foreground-subtle)]",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        title="Refresh prices"
      >
        <RefreshCw
          className={cn(
            "w-4 h-4 text-[var(--foreground-muted)]",
            isRefreshing && "animate-spin"
          )}
        />
      </button>
    </div>
  );
}
