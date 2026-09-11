"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ["Maroon", "Ivory", "Sage", "White", "Black", "Beige", "Emerald", "Navy", "Rust", "Sky Blue", "Gold"];
const SIZES = ["S", "M", "L", "XL", "XXL"];
const FABRICS = ["Cotton Voile", "100% Cotton", "Georgette", "Cotton Lawn", "Silk Blend"];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popularity", label: "Most Popular" },
];

export function ProductFilters({ categories }: { categories: { name: string; slug: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleListParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(",").filter(Boolean) ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    if (next.length) params.set(key, next.join(","));
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeColors = searchParams.get("colors")?.split(",").filter(Boolean) ?? [];
  const activeSizes = searchParams.get("sizes")?.split(",").filter(Boolean) ?? [];
  const activeFabrics = searchParams.get("fabrics")?.split(",").filter(Boolean) ?? [];
  const activeCategory = searchParams.get("category") ?? "";
  const minPrice = searchParams.get("min") ?? "";
  const maxPrice = searchParams.get("max") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  const hasActiveFilters = activeColors.length || activeSizes.length || activeFabrics.length || activeCategory || minPrice || maxPrice;

  const content = (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.slug} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={activeCategory === cat.slug}
                onChange={() => updateParam("category", cat.slug)}
                className="accent-oxblood"
              />
              {cat.name}
            </label>
          ))}
          {activeCategory && (
            <button onClick={() => updateParam("category", null)} className="text-xs text-oxblood hover:underline">
              Clear category
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Price Range (৳)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={minPrice}
            onBlur={(e) => updateParam("min", e.target.value)}
            className="w-full border hairline px-2 py-1.5 text-sm"
          />
          <span className="text-ink/40">–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={maxPrice}
            onBlur={(e) => updateParam("max", e.target.value)}
            className="w-full border hairline px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => toggleListParam("colors", color)}
              className={cn(
                "text-xs border hairline px-2.5 py-1.5",
                activeColors.includes(color) && "bg-ink text-cream border-ink"
              )}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleListParam("sizes", size)}
              className={cn(
                "text-xs border hairline h-8 w-8 flex items-center justify-center",
                activeSizes.includes(size) && "bg-ink text-cream border-ink"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Fabric</h3>
        <div className="space-y-2">
          {FABRICS.map((fabric) => (
            <label key={fabric} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={activeFabrics.includes(fabric)}
                onChange={() => toggleListParam("fabrics", fabric)}
                className="accent-oxblood"
              />
              {fabric}
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters ? (
        <button
          onClick={() => router.push(pathname)}
          className="text-sm text-oxblood hover:underline"
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 text-sm border hairline px-3 py-2"
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="border hairline px-2 py-2 text-sm"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <aside className="hidden lg:block w-64 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg">Filters</h2>
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="border hairline px-2 py-1.5 text-xs"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-cream p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg">Filters</h2>
              <button onClick={() => setMobileOpen(false)} aria-label="Close filters">
                <X size={18} />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
