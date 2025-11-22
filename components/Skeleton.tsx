"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-slate-700/50",
        className
      )}
    />
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-2xl bg-slate-800/30 border border-slate-700/50 p-6", className)}>
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="rounded-3xl bg-slate-800/30 border border-slate-700/50 p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-20 w-48 mb-4" />
          <Skeleton className="h-4 w-40 mb-6" />
          <Skeleton className="h-3 w-full" />
        </div>
        <div className="flex items-center justify-center">
          <Skeleton className="h-32 w-32 rounded-2xl" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-12 w-36 mb-4" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-6">
      <div className="flex justify-between mb-6">
        <div>
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-48" />
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}

export function SkeletonSuppliers() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex-shrink-0 w-64 rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
          <Skeleton className="h-3 w-8 mb-3" />
          <Skeleton className="h-5 w-36 mb-2" />
          <Skeleton className="h-7 w-20" />
        </div>
      ))}
    </div>
  );
}
