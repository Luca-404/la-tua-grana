import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: string | number | undefined, maxDecimals: number = 0) {
  if (value === undefined)  return;
  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    } else {
      return value
        .toFixed(maxDecimals)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
  } else {
    // string input: remove non-digits, format as integer
    const num = value.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}

export function getRandomizedReturn(rangePercent: number, multiplier: number = 1) {
  const variation = (Math.random() * 2 - 1) * (rangePercent * multiplier);
  return variation
}

export function formatThousands(value: any): string {
  if (!value) return "";
  const raw = typeof value === "number" ? value.toString() : value.replace(/\D/g, "");
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}