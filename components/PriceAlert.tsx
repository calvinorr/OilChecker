"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceAlertProps {
  currentPrice: number;
}

export function PriceAlert({ currentPrice }: PriceAlertProps) {
  const [targetPrice, setTargetPrice] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTriggered, setIsTriggered] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("priceTarget");
    if (stored) {
      setTargetPrice(parseFloat(stored));
    }
  }, []);

  // Check if target is reached
  useEffect(() => {
    if (targetPrice !== null && currentPrice <= targetPrice) {
      setIsTriggered(true);
    } else {
      setIsTriggered(false);
    }
  }, [currentPrice, targetPrice]);

  const handleSave = () => {
    const value = parseFloat(inputValue);
    if (!isNaN(value) && value > 0) {
      setTargetPrice(value);
      localStorage.setItem("priceTarget", value.toString());
      setIsEditing(false);
    }
  };

  const handleClear = () => {
    setTargetPrice(null);
    localStorage.removeItem("priceTarget");
    setIsEditing(false);
    setInputValue("");
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-800 border border-slate-700">
        <span className="text-xs text-slate-400">Alert below £</span>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={currentPrice.toFixed(0)}
          className="w-16 bg-transparent text-white text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setIsEditing(false);
          }}
        />
        <button
          onClick={handleSave}
          className="p-1 rounded-full hover:bg-slate-700 text-emerald-400"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="p-1 rounded-full hover:bg-slate-700 text-slate-400"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  if (targetPrice !== null) {
    return (
      <button
        onClick={() => {
          setInputValue(targetPrice.toString());
          setIsEditing(true);
        }}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full transition-all",
          isTriggered
            ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
            : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600"
        )}
      >
        {isTriggered ? (
          <>
            <Bell className="w-3 h-3 animate-pulse" />
            <span className="text-xs font-medium">Target reached!</span>
          </>
        ) : (
          <>
            <Bell className="w-3 h-3" />
            <span className="text-xs">Alert: £{targetPrice.toFixed(0)}</span>
          </>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClear();
          }}
          className="p-0.5 rounded-full hover:bg-slate-700"
        >
          <X className="w-3 h-3" />
        </button>
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        setInputValue(Math.floor(currentPrice - 10).toString());
        setIsEditing(true);
      }}
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600 transition-all"
    >
      <BellOff className="w-3 h-3" />
      <span className="text-xs">Set price alert</span>
    </button>
  );
}
