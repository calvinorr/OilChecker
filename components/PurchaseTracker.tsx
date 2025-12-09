"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, TrendingDown, TrendingUp, Trash2, Edit2, Loader2, Receipt, PiggyBank, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import { PurchaseForm } from "./PurchaseForm";

interface EnrichedPurchase {
  id: string;
  purchaseDate: Date;
  litres: string;
  totalPrice: string;
  ppl: string;
  supplier: string | null;
  notes: string | null;
  createdAt: Date | null;
  bestPpl: number | null;
  pplDifference: number | null;
  loyaltyCost: number | null;
}

interface PurchaseStats {
  totalPurchases: number;
  totalSpent: number;
  totalLitres: number;
  totalLoyaltyCost: number;
  averagePpl: number;
}

export function PurchaseTracker() {
  const [purchases, setPurchases] = useState<EnrichedPurchase[]>([]);
  const [stats, setStats] = useState<PurchaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<EnrichedPurchase | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPurchases = useCallback(async () => {
    try {
      const res = await fetch("/api/purchases");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPurchases(data.purchases);
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch purchases:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this purchase?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/purchases/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPurchases();
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (purchase: EnrichedPurchase) => {
    setEditingPurchase(purchase);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-[var(--foreground)]">My Purchases</h2>
          <p className="text-xs text-[var(--foreground-muted)]">Track your oil purchases & loyalty cost</p>
        </div>
        <button
          onClick={() => {
            setEditingPurchase(null);
            setShowForm(true);
          }}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
            "bg-gradient-to-r from-orange-500 to-amber-500 text-white",
            "hover:from-orange-600 hover:to-amber-600"
          )}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Purchase</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && stats.totalPurchases > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
              <span className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider">Spent</span>
            </div>
            <span className="text-xl font-bold text-[var(--foreground)]">
              £{stats.totalSpent.toFixed(0)}
            </span>
          </div>

          <div className="rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider">Litres</span>
            </div>
            <span className="text-xl font-bold text-[var(--foreground)]">
              {stats.totalLitres.toFixed(0)}L
            </span>
          </div>

          <div className="rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider">Avg PPL</span>
            </div>
            <span className="text-xl font-bold text-[var(--foreground)]">
              {stats.averagePpl.toFixed(1)}p
            </span>
          </div>

          <div className={cn(
            "rounded-xl border p-3",
            stats.totalLoyaltyCost > 0
              ? "bg-red-500/10 border-red-500/20"
              : "bg-emerald-500/10 border-emerald-500/20"
          )}>
            <div className="flex items-center gap-2 mb-1">
              <PiggyBank className={cn(
                "w-3.5 h-3.5",
                stats.totalLoyaltyCost > 0 ? "text-red-400" : "text-emerald-400"
              )} />
              <span className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider">
                Loyalty Cost
              </span>
            </div>
            <span className={cn(
              "text-xl font-bold",
              stats.totalLoyaltyCost > 0 ? "text-red-400" : "text-emerald-400"
            )}>
              {stats.totalLoyaltyCost > 0 ? "+" : ""}£{Math.abs(stats.totalLoyaltyCost).toFixed(0)}
            </span>
          </div>
        </div>
      )}

      {/* Purchase List */}
      <div className="rounded-xl sm:rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--foreground-muted)]" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Receipt className="w-12 h-12 mx-auto text-[var(--foreground-subtle)] mb-3" />
            <p className="text-[var(--foreground-muted)] text-sm">No purchases recorded yet</p>
            <p className="text-[var(--foreground-subtle)] text-xs mt-1">
              Add your first purchase to start tracking
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-2)] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {parseFloat(purchase.litres).toFixed(0)}L
                      </span>
                      <span className="text-xs text-[var(--foreground-muted)]">
                        @ {parseFloat(purchase.ppl).toFixed(1)}p/L
                      </span>
                      {purchase.bestPpl !== null && (
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded",
                          purchase.pplDifference! > 0
                            ? "bg-red-500/10 text-red-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        )}>
                          {purchase.pplDifference! > 0 ? "+" : ""}
                          {purchase.pplDifference!.toFixed(1)}p
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                      <span>
                        {new Date(purchase.purchaseDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {purchase.supplier && (
                        <>
                          <span>·</span>
                          <span className="truncate">{purchase.supplier}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[var(--foreground)]">
                      £{parseFloat(purchase.totalPrice).toFixed(0)}
                    </div>
                    {purchase.loyaltyCost !== null && purchase.loyaltyCost !== 0 && (
                      <div className={cn(
                        "text-[10px] flex items-center gap-0.5 justify-end",
                        purchase.loyaltyCost > 0 ? "text-red-400" : "text-emerald-400"
                      )}>
                        {purchase.loyaltyCost > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        £{Math.abs(purchase.loyaltyCost).toFixed(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(purchase)}
                      className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(purchase.id)}
                      disabled={deletingId === purchase.id}
                      className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {deletingId === purchase.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <PurchaseForm
          onClose={() => {
            setShowForm(false);
            setEditingPurchase(null);
          }}
          onSuccess={fetchPurchases}
          initialData={editingPurchase ? {
            id: editingPurchase.id,
            purchaseDate: editingPurchase.purchaseDate.toString(),
            litres: editingPurchase.litres,
            totalPrice: editingPurchase.totalPrice,
            supplier: editingPurchase.supplier || "Finlay Fuels",
            notes: editingPurchase.notes,
          } : undefined}
        />
      )}
    </div>
  );
}
