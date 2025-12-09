import { cn } from "@/lib/utils";

export type DateRange = "7d" | "14d" | "30d";

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
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
