import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  const { data: orders } = await supabase.from("orders").select("user_id, total");

  const orderStats = new Map<string, { count: number; total: number }>();
  (orders ?? []).forEach((o) => {
    if (!o.user_id) return;
    const current = orderStats.get(o.user_id) ?? { count: 0, total: 0 };
    orderStats.set(o.user_id, { count: current.count + 1, total: current.total + Number(o.total) });
  });

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Customers</h1>
      <p className="text-sm text-ink/50 mb-6">{profiles?.length ?? 0} registered customers</p>

      <div className="border hairline overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b hairline text-left text-xs text-ink/50">
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Total Spent</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y hairline">
            {(profiles ?? []).map((p) => {
              const stats = orderStats.get(p.id) ?? { count: 0, total: 0 };
              return (
                <tr key={p.id}>
                  <td className="p-3">{p.full_name ?? "—"}</td>
                  <td className="p-3">{p.phone ?? "—"}</td>
                  <td className="p-3">{stats.count}</td>
                  <td className="p-3">{formatBDT(stats.total)}</td>
                  <td className="p-3 text-xs text-ink/50">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!profiles || profiles.length === 0) && (
          <p className="p-8 text-center text-sm text-ink/50">No customers yet.</p>
        )}
      </div>
    </div>
  );
}
