"use client";

import { Clock } from "lucide-react";

interface CorrelationGaugeProps {
  value: number | null;
}

export function CorrelationGauge({ value }: CorrelationGaugeProps) {
  if (value === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-4">
        <div className="w-20 h-20 rounded-full border-4 border-[var(--border)] flex items-center justify-center">
          <Clock className="w-6 h-6 text-[var(--foreground-subtle)]" />
        </div>
        <p className="text-xs text-[var(--foreground-subtle)] mt-3 text-center">
          Need more data<br />for correlation
        </p>
      </div>
    );
  }

  const percentage = Math.abs(value) * 100;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="var(--border)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="url(#correlationGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="correlationGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-[var(--foreground)]">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
}
