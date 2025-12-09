import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format supplier name for URL slug
export function supplierToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Get supplier URL on cheapestoil.co.uk
export function getSupplierUrl(name: string): string {
  const slug = supplierToSlug(name);
  return `https://cheapestoil.co.uk/supplier/${slug}`;
}

// Check if we have enough data for meaningful analysis
export function hasEnoughData(dataPoints: number, minimum: number = 3): boolean {
  return dataPoints >= minimum;
}
