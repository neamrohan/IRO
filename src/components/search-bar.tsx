"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar({ initialValue }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue ?? "");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products, e.g. 'Floral Dream'"
        className="w-full border hairline pl-10 pr-4 py-3 text-sm focus:border-ink"
      />
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
    </form>
  );
}
