"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];

export function OrderSearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function apply(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/admin/orders?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <form onSubmit={(e) => { e.preventDefault(); apply({ q }); }} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order #, customer, phone"
          className="border hairline px-3 py-2 text-sm w-64"
        />
        <button type="submit" className="border border-ink px-3 py-2 text-sm">Search</button>
      </form>
      <select
        value={searchParams.get("status") ?? ""}
        onChange={(e) => apply({ status: e.target.value })}
        className="border hairline px-2 py-2 text-sm capitalize"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}
