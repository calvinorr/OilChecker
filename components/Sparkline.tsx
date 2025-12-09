"use client";

import { ResponsiveContainer, Area, AreaChart } from "recharts";
import { hasEnoughData } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  color: string;
}

export function Sparkline({ data, color }: SparklineProps) {
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
