import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBDT(amount: number): string {
  return "৳" + Math.round(amount).toLocaleString("en-BD");
}

export function effectivePrice(price: number, discountPrice: number | null): number {
  return discountPrice != null && discountPrice < price ? discountPrice : price;
}

export function discountPercent(price: number, discountPrice: number | null): number | null {
  if (discountPrice == null || discountPrice >= price) return null;
  return Math.round(((price - discountPrice) / price) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
