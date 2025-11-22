import { getPriceHistory } from "@/lib/db";
import Dashboard from "@/components/Dashboard";
import { Flame } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const priceHistory = await getPriceHistory(30);

  // Handle empty data case
  if (priceHistory.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Flame className="h-10 w-10 text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Awaiting First Data
          </h1>
          <p className="text-slate-400 max-w-md mx-auto">
            Price history will appear here once the first scrape completes at 8am UTC.
          </p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const currentPrice = parseFloat(priceHistory[0].cheapestPrice500L);
  const thirtyDayLow = Math.min(
    ...priceHistory.map((p) => parseFloat(p.cheapestPrice500L))
  );
  const averagePrice =
    priceHistory.reduce((sum, p) => sum + parseFloat(p.cheapestPrice500L), 0) /
    priceHistory.length;

  const lastUpdated = new Date(priceHistory[0].recordedAt!);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Minimal Header */}
      <header className="border-b border-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white tracking-tight">
                  Oil Tracker
                </h1>
                <p className="text-xs text-slate-500">Northern Ireland</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Last Updated
              </p>
              <p className="text-sm text-slate-300">
                {lastUpdated.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                <span className="text-slate-500">
                  {lastUpdated.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Dashboard
          priceHistory={priceHistory}
          currentPrice={currentPrice}
          thirtyDayLow={thirtyDayLow}
          averagePrice={averagePrice}
        />
      </main>
    </div>
  );
}
