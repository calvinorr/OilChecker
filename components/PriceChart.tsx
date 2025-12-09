"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { DateRangeSelector, DateRange } from "./DateRangeSelector";

interface ChartDataPoint {
  date: string;
  price: number;
  ppl: number;
  brentGbp: number | null;
}

interface PriceChartProps {
  chartData: ChartDataPoint[];
  averagePrice: number;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  hasCorrelationData: boolean;
}

export function PriceChart({
  chartData,
  averagePrice,
  dateRange,
  onDateRangeChange,
  hasCorrelationData,
}: PriceChartProps) {
  return (
    <div className="rounded-xl sm:rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-[var(--foreground)]">Price History</h2>
          <p className="text-xs text-[var(--foreground-muted)]">Heating oil vs Brent crude</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[var(--foreground-muted)]">Oil</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[var(--foreground-muted)]">Crude</span>
            </div>
          </div>
          <DateRangeSelector value={dateRange} onChange={onDateRangeChange} />
        </div>
      </div>
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#475569"
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#475569"
              tick={{ fill: "#22c55e", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `£${value}`}
              domain={["dataMin - 5", "dataMax + 5"]}
              width={45}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#475569"
              tick={{ fill: "#f59e0b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `£${value}`}
              domain={["dataMin - 2", "dataMax + 2"]}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
              formatter={(value: number, name: string) => {
                if (name === "price") return [`£${value.toFixed(2)}`, "Heating Oil"];
                if (name === "brentGbp") return [`£${value.toFixed(2)}/bbl`, "Brent Crude"];
                return [value, name];
              }}
            />
            <ReferenceLine
              yAxisId="left"
              y={averagePrice}
              stroke="#475569"
              strokeDasharray="5 5"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="price"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#22c55e", stroke: "#0f172a", strokeWidth: 2 }}
              name="price"
            />
            {hasCorrelationData && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="brentGbp"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#f59e0b", stroke: "#0f172a", strokeWidth: 2 }}
                name="brentGbp"
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
