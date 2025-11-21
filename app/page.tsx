import { getPriceHistory } from "@/lib/db";
import Dashboard from "@/components/Dashboard";
import { Fuel } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const priceHistory = await getPriceHistory(30);

  // Handle empty data case
  if (priceHistory.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Fuel className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            No Data Available
          </h1>
          <p className="text-slate-400">
            Price history will appear here once data is collected.
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

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <Fuel className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Oil Price Tracker
              </h1>
              <p className="text-sm text-slate-400">
                Home heating oil prices in Northern Ireland
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Dashboard
          priceHistory={priceHistory}
          currentPrice={currentPrice}
          thirtyDayLow={thirtyDayLow}
          averagePrice={averagePrice}
        />

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-800 pt-6">
          <p className="text-center text-sm text-slate-500">
            Last updated:{" "}
            {new Date(priceHistory[0].recordedAt!).toLocaleString("en-GB", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
        </footer>
      </main>
    </div>
  );
}
