"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PurchaseFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    id: string;
    purchaseDate: string;
    litres: string;
    totalPrice: string;
    supplier: string;
    notes: string | null;
  };
}

export function PurchaseForm({ onClose, onSuccess, initialData }: PurchaseFormProps) {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    purchaseDate: initialData?.purchaseDate
      ? new Date(initialData.purchaseDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    litres: initialData?.litres || "500",
    totalPrice: initialData?.totalPrice || "",
    supplier: initialData?.supplier || "Finlay Fuels",
    notes: initialData?.notes || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatedPpl = formData.litres && formData.totalPrice
    ? ((parseFloat(formData.totalPrice) / parseFloat(formData.litres)) * 100).toFixed(2)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = isEditing ? `/api/purchases/${initialData.id}` : "/api/purchases";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseDate: formData.purchaseDate,
          litres: parseFloat(formData.litres),
          totalPrice: parseFloat(formData.totalPrice),
          supplier: formData.supplier,
          notes: formData.notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save purchase");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save purchase");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {isEditing ? "Edit Purchase" : "Add Purchase"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-xs text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5">
              Purchase Date
            </label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          {/* Litres and Price row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5">
                Litres
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={formData.litres}
                onChange={(e) => setFormData({ ...formData, litres: e.target.value })}
                required
                placeholder="500"
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5">
                Total Price (£)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.totalPrice}
                onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                required
                placeholder="320.00"
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>

          {/* Calculated PPL */}
          {calculatedPpl && (
            <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <span className="text-xs text-[var(--foreground-muted)]">Price per litre: </span>
              <span className="text-lg font-bold text-[var(--foreground)]">{calculatedPpl}p</span>
            </div>
          )}

          {/* Supplier */}
          <div>
            <label className="block text-xs text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5">
              Supplier
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="Finlay Fuels"
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any notes about this purchase..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all",
              "bg-gradient-to-r from-orange-500 to-amber-500 text-white",
              "hover:from-orange-600 hover:to-amber-600",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {isEditing ? "Update Purchase" : "Add Purchase"}
          </button>
        </form>
      </div>
    </div>
  );
}
