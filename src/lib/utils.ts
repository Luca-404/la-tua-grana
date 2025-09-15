import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: string | number | undefined, maxDecimals: number = 0) {
  if (value === undefined) return;
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

export const formatPercentage = (val: number | undefined, maxDecimals = 2): string | undefined => {
  if (val === undefined) return;
  const formattedNumber = formatNumber(val * 100, maxDecimals);
  if (!formattedNumber) return;

  return `${formattedNumber} %`;
};


export const formatCurrency = (val: string | number | undefined, maxDecimals = 0): string | undefined => {
  if (val === undefined) return;
  const formattedNumber = formatNumber(val, maxDecimals);
  if (!formattedNumber) return;

  const numericValue = Number((formattedNumber as string).replace(/\./g, "").replace(",", "."));
  if (isNaN(numericValue)) return formattedNumber;

  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: maxDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(numericValue);
};

export function getRandomizedReturn(rangePercent: number, multiplier: number = 1) {
  const variation = (Math.random() * 2 - 1) * (rangePercent * multiplier);
  return variation;
}

export function formatThousands(value: string | number | undefined): string {
  if (!value) return "";
  const raw = typeof value === "number" ? value.toString() : value.replace(/\D/g, "");
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function handleOnChangeFormatThousands(
  field: { onChange: (value: number) => void },
  value: string
) {
  const rawValue = value;
  const cleanedValue = rawValue.replace(/\./g, "").replace(/\D/g, "");
  const numericValue = Number(cleanedValue);
  field.onChange(numericValue);
}
