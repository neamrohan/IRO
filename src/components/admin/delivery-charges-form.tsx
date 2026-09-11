"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateDeliveryCharges } from "@/app/admin/sales/actions";

export function DeliveryChargesForm({ initialCharges }: { initialCharges: { inside_dhaka: number; outside_dhaka: number } }) {
  const [inside, setInside] = useState(initialCharges.inside_dhaka);
  const [outside, setOutside] = useState(initialCharges.outside_dhaka);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await updateDeliveryCharges(Number(inside), Number(outside));
    setSaving(false);
    if (!result.success) {
      toast.error(result.error ?? "Could not update delivery charges.");
      return;
    }
    toast.success("Delivery charges updated.");
  }

  return (
    <form onSubmit={handleSave} className="border hairline p-5 max-w-sm space-y-3">
      <div>
        <label className="text-xs text-ink/50 mb-1 block">Inside Dhaka (৳)</label>
        <input type="number" value={inside} onChange={(e) => setInside(Number(e.target.value))} className="w-full border hairline px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs text-ink/50 mb-1 block">Outside Dhaka (৳)</label>
        <input type="number" value={outside} onChange={(e) => setOutside(Number(e.target.value))} className="w-full border hairline px-3 py-2 text-sm" />
      </div>
      <button type="submit" disabled={saving} className="bg-ink text-cream px-5 py-2.5 text-sm font-medium disabled:opacity-60">
        {saving ? "Saving..." : "Save Charges"}
      </button>
    </form>
  );
}
