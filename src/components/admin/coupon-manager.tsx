"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { formatBDT } from "@/lib/utils";
import { createCoupon, toggleCoupon, deleteCoupon } from "@/app/admin/coupons/actions";
import type { Coupon } from "@/lib/types";

export function CouponManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "percent" as "percent" | "fixed",
    discountValue: 10,
    minOrderAmount: 0,
    expiresAt: "",
    usageLimit: "",
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error("Coupon code is required.");
      return;
    }
    setSaving(true);
    const result = await createCoupon({
      code: form.code,
      discountPercent: form.discountType === "percent" ? Number(form.discountValue) : null,
      discountFixed: form.discountType === "fixed" ? Number(form.discountValue) : null,
      minOrderAmount: Number(form.minOrderAmount),
      expiresAt: form.expiresAt || null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      isActive: true,
    });
    setSaving(false);
    if (!result.success) {
      toast.error(result.error ?? "Could not create coupon.");
      return;
    }
    toast.success("Coupon created.");
    window.location.reload();
  }

  async function handleToggle(id: string, current: boolean) {
    const result = await toggleCoupon(id, !current);
    if (!result.success) {
      toast.error(result.error ?? "Could not update coupon.");
      return;
    }
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    const result = await deleteCoupon(id);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete coupon.");
      return;
    }
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.success("Coupon deleted.");
  }

  return (
    <div className="space-y-8">
      <div className="border hairline divide-y hairline">
        {coupons.map((c) => (
          <div key={c.id} className="flex flex-wrap justify-between items-center gap-2 px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{c.code}</p>
              <p className="text-xs text-ink/50">
                {c.discount_percent ? `${c.discount_percent}% off` : `${formatBDT(c.discount_fixed ?? 0)} off`}
                {" · Min "}{formatBDT(c.min_order_amount)}
                {c.usage_limit ? ` · ${c.used_count}/${c.usage_limit} used` : ` · ${c.used_count} used`}
                {c.expires_at ? ` · Expires ${new Date(c.expires_at).toLocaleDateString()}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggle(c.id, c.is_active)}
                className={c.is_active ? "text-moss text-xs" : "text-ink/40 text-xs"}
              >
                {c.is_active ? "Active" : "Inactive"}
              </button>
              <button onClick={() => handleDelete(c.id)} className="text-ink/50 hover:text-oxblood">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && <p className="px-4 py-6 text-sm text-ink/50">No coupons yet.</p>}
      </div>

      <form onSubmit={handleCreate} className="border hairline p-5 space-y-3 max-w-lg">
        <h3 className="font-medium text-sm">Create Coupon</h3>
        <input placeholder="Coupon code, e.g. IRO10" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border hairline px-3 py-2 text-sm uppercase" />
        <div className="grid grid-cols-2 gap-3">
          <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as any })} className="border hairline px-3 py-2 text-sm">
            <option value="percent">Percentage off</option>
            <option value="fixed">Fixed amount off (৳)</option>
          </select>
          <input type="number" placeholder="Value" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} className="border hairline px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="Min order amount (৳)" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })} className="border hairline px-3 py-2 text-sm" />
          <input type="number" placeholder="Usage limit (optional)" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="border hairline px-3 py-2 text-sm" />
        </div>
        <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="w-full border hairline px-3 py-2 text-sm" />
        <button type="submit" disabled={saving} className="flex items-center gap-1.5 bg-ink text-cream px-4 py-2 text-sm disabled:opacity-60">
          <Plus size={14} /> {saving ? "Creating..." : "Create Coupon"}
        </button>
      </form>
    </div>
  );
}
