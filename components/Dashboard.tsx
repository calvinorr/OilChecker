"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingDown,
  DollarSign,
  BarChart3,
  Calendar,
  Truck,
  Award,
  Trophy,
} from "lucide-react";
import StatsCard from "./StatsCard";
import { OilPrice, SupplierData } from "@/lib/schema";

interface DashboardProps {
  priceHistory: OilPrice[];
  currentPrice: number;
  thirtyDayLow: number;
  averagePrice: number;
}

export default function Dashboard({
  priceHistory,
  currentPrice,
  thirtyDayLow,
  averagePrice,
}: DashboardProps) {
  // Prepare chart data - reverse to show oldest first on chart
  const chartData = [...priceHistory].reverse().map((record) => ({
    date: new Date(record.recordedAt!).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }),
    price: parseFloat(record.cheapestPrice500L),
    avgPrice: parseFloat(record.avgPrice500L),
  }));

  // Get last 5 records for the table
  const recentQuotes = priceHistory.slice(0, 5);

  // Calculate trend
  const priceVsAverage = currentPrice - averagePrice;
  const trend = priceVsAverage < 0 ? "down" : priceVsAverage > 0 ? "up" : "neutral";

  // Get top suppliers from the most recent record
  const latestRecord = priceHistory[0];
  const suppliersRaw = (latestRecord?.suppliersRaw as SupplierData[]) || [];
  const topSuppliers = [...suppliersRaw]
    .sort((a, b) => a.price500L - b.price500L)
    .slice(0, 10);
  const lowestPrice = topSuppliers.length > 0 ? topSuppliers[0].price500L : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Current Price (500L)"
          value={`£${currentPrice.toFixed(2)}`}
          subtitle="Cheapest available"
          icon={DollarSign}
          trend={trend}
          trendValue={`£${Math.abs(priceVsAverage).toFixed(2)} ${priceVsAverage < 0 ? "below" : "above"} avg`}
        />
        <StatsCard
          title="30-Day Low"
          value={`£${thirtyDayLow.toFixed(2)}`}
          subtitle="Best price this month"
          icon={TrendingDown}
          trend="down"
        />
        <StatsCard
          title="Average Price"
          value={`£${averagePrice.toFixed(2)}`}
          subtitle="30-day average"
          icon={BarChart3}
        />
      </div>

      {/* Today's Best Prices */}
      {topSuppliers.length > 0 && (
        <div className="rounded-xl bg-slate-800/50 p-6 shadow-lg border border-slate-700/50">
          <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Today&apos;s Best Prices
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-400">
                    Rank
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-400">
                    Supplier
                  </th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-slate-400">
                    Price (500L)
                  </th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-slate-400">
                    PPL
                  </th>
                </tr>
              </thead>
              <tbody>
                {topSuppliers.map((supplier, index) => {
                  const isCheapest = supplier.price500L === lowestPrice;
                  return (
                    <tr
                      key={`${supplier.name}-${index}`}
                      className={`border-b border-slate-700/50 transition-colors ${
                        isCheapest
                          ? "bg-green-900/20 hover:bg-green-900/30"
                          : "hover:bg-slate-700/30"
                      }`}
                    >
                      <td className="py-3 px-4 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          {index === 0 ? (
                            <Award className="h-4 w-4 text-amber-400" />
                          ) : (
                            <span className="w-4 text-center text-slate-500">
                              {index + 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-slate-500" />
                          <span className={isCheapest ? "text-green-400 font-medium" : "text-slate-300"}>
                            {supplier.name}
                          </span>
                          {isCheapest && (
                            <span className="inline-flex items-center rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400 border border-green-500/30">
                              Best Price
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`py-3 px-4 text-sm text-right font-medium ${
                        isCheapest ? "text-green-400" : "text-slate-300"
                      }`}>
                        £{supplier.price500L.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-slate-400">
                        {supplier.ppl500L.toFixed(2)}p
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Price Chart */}
      <div className="rounded-xl bg-slate-800/50 p-6 shadow-lg border border-slate-700/50">
        <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-slate-400" />
          Price History (500L)
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={{ stroke: "#475569" }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={{ stroke: "#475569" }}
                tickFormatter={(value) => `£${value}`}
                domain={["dataMin - 5", "dataMax + 5"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
                formatter={(value: number, name: string) => [
                  `£${value.toFixed(2)}`,
                  name === "price" ? "Cheapest" : "Average",
                ]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#22c55e" }}
                name="price"
              />
              <Line
                type="monotone"
                dataKey="avgPrice"
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="avgPrice"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Cheapest Price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-slate-500" />
            <span>Average Price</span>
          </div>
        </div>
      </div>

      {/* Price History Table */}
      <div className="rounded-xl bg-slate-800/50 p-6 shadow-lg border border-slate-700/50">
        <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-slate-400" />
          Price History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-400">
                  Date
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-400">
                  Cheapest Supplier
                </th>
                <th className="py-3 px-4 text-right text-sm font-medium text-slate-400">
                  Price (500L)
                </th>
                <th className="py-3 px-4 text-right text-sm font-medium text-slate-400">
                  PPL
                </th>
              </tr>
            </thead>
            <tbody>
              {recentQuotes.map((quote, index) => {
                const prevQuote = recentQuotes[index + 1];
                const priceDiff = prevQuote
                  ? parseFloat(quote.cheapestPrice500L) -
                    parseFloat(prevQuote.cheapestPrice500L)
                  : 0;
                const priceChangeColor =
                  priceDiff < 0
                    ? "text-green-400"
                    : priceDiff > 0
                      ? "text-red-400"
                      : "text-slate-300";

                return (
                  <tr
                    key={quote.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-slate-300">
                      {new Date(quote.recordedAt!).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-slate-500" />
                        {quote.cheapestSupplier}
                      </div>
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-medium ${priceChangeColor}`}>
                      £{parseFloat(quote.cheapestPrice500L).toFixed(2)}
                      {priceDiff !== 0 && (
                        <span className="ml-2 text-xs">
                          {priceDiff < 0 ? "▼" : "▲"}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-slate-400">
                      {parseFloat(quote.cheapestPpl).toFixed(2)}p
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
