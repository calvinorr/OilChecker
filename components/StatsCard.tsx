import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
}: StatsCardProps) {
  const trendColor =
    trend === "down"
      ? "text-green-400"
      : trend === "up"
        ? "text-red-400"
        : "text-slate-400";

  return (
    <div className="rounded-xl bg-slate-800/50 p-6 shadow-lg border border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
          {trendValue && (
            <p className={`mt-2 text-sm font-medium ${trendColor}`}>
              {trend === "down" && "▼ "}
              {trend === "up" && "▲ "}
              {trendValue}
            </p>
          )}
        </div>
        <div className="ml-4">
          <div className="rounded-full bg-slate-700/50 p-3">
            <Icon className="h-6 w-6 text-slate-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
