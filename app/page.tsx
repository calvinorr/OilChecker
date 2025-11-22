import { getPriceHistory } from "@/lib/db";
import Dashboard from "@/components/Dashboard";
import { Flame } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const priceHistory = await getPriceHistory(30);

  // Handle empty data case
  if (priceHistory.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Flame className="h-10 w-10 text-orange-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Awaiting First Data
          </h1>
          <p className="text-slate-400 max-w-md mx-auto text-sm sm:text-base">
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
      {/* Header */}
      <header className="border-b border-slate-800/50 sticky top-0 z-20 bg-slate-950/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                  Oil Tracker
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">
                  Northern Ireland
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Updated
                </p>
                <p className="text-xs sm:text-sm text-slate-300">
                  {lastUpdated.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  <span className="text-slate-500">
                    {lastUpdated.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
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
