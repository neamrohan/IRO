import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: completedOrders },
    { data: totalSalesRows },
    { count: totalCustomers },
    { count: totalProducts },
    { data: lowStock },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "delivered"),
    supabase.from("orders").select("total").neq("status", "cancelled"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id, name, stock_quantity").lte("stock_quantity", 5).order("stock_quantity", { ascending: true }).limit(5),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
  ]);

  const totalSales = (totalSalesRows ?? []).reduce((sum, o) => sum + Number(o.total), 0);

  const stats = [
    { label: "Total Sales", value: formatBDT(totalSales) },
    { label: "Total Orders", value: totalOrders ?? 0 },
    { label: "Pending Orders", value: pendingOrders ?? 0 },
    { label: "Completed Orders", value: completedOrders ?? 0 },
    { label: "Total Customers", value: totalCustomers ?? 0 },
    { label: "Total Products", value: totalProducts ?? 0 },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl mb-1">Admin Dashboard</h1>
        <p className="text-sm text-ink/50">Overview of IRO store performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border hairline p-5">
            <p className="text-xs text-ink/50 mb-1">{stat.label}</p>
            <p className="text-xl font-medium">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-medium">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-oxblood hover:underline">View all</Link>
          </div>
          <div className="border hairline divide-y hairline">
            {(recentOrders ?? []).map((o) => (
              <div key={o.id} className="flex justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{o.order_number}</p>
                  <p className="text-xs text-ink/50 capitalize">{o.status}</p>
                </div>
                <span>{formatBDT(o.total)}</span>
              </div>
            ))}
            {(!recentOrders || recentOrders.length === 0) && (
              <p className="px-4 py-6 text-sm text-ink/50">No orders yet.</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-medium">Low Stock Products</h2>
            <Link href="/admin/products" className="text-xs text-oxblood hover:underline">Manage products</Link>
          </div>
          <div className="border hairline divide-y hairline">
            {(lowStock ?? []).map((p) => (
              <div key={p.id} className="flex justify-between px-4 py-3 text-sm">
                <span>{p.name}</span>
                <span className={p.stock_quantity === 0 ? "text-oxblood font-medium" : "text-ink/60"}>
                  {p.stock_quantity} left
                </span>
              </div>
            ))}
            {(!lowStock || lowStock.length === 0) && (
              <p className="px-4 py-6 text-sm text-ink/50">Stock levels look healthy.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
