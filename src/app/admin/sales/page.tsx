import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/utils";
import { DeliveryChargesForm } from "@/components/admin/delivery-charges-form";

export default async function AdminSalesPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("total, status, created_at")
    .neq("status", "cancelled");

  const { data: settingsRow } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "delivery_charges")
    .maybeSingle();

  const charges = (settingsRow?.value as { inside_dhaka: number; outside_dhaka: number }) ?? { inside_dhaka: 80, outside_dhaka: 130 };

  const now = new Date();
  const monthly = new Map<string, number>();
  (orders ?? []).forEach((o) => {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthly.set(key, (monthly.get(key) ?? 0) + Number(o.total));
  });

  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { label: d.toLocaleString("en-US", { month: "short" }), value: monthly.get(key) ?? 0 };
  });

  const maxValue = Math.max(...last6Months.map((m) => m.value), 1);
  const totalRevenue = (orders ?? []).reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl mb-1">Sales Overview</h1>
        <p className="text-sm text-ink/50">Total revenue: {formatBDT(totalRevenue)}</p>
      </div>

      <div>
        <h2 className="font-medium mb-4">Last 6 Months</h2>
        <div className="border hairline p-6 flex items-end gap-4 h-56">
          {last6Months.map((m) => (
            <div key={m.label} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
              <span className="text-xs text-ink/50">{formatBDT(m.value)}</span>
              <div
                className="w-full bg-oxblood/80"
                style={{ height: `${Math.max(4, (m.value / maxValue) * 100)}%` }}
              />
              <span className="text-xs text-ink/60">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-medium mb-4">Delivery Charges</h2>
        <DeliveryChargesForm initialCharges={charges} />
      </div>
    </div>
  );
}
