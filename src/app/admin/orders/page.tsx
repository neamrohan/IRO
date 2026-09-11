import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { OrderSearchFilter } from "@/components/admin/order-search-filter";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { q, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (q) query = query.or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%,phone.ilike.%${q}%`);

  const { data: orders } = await query;

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Orders</h1>
      <p className="text-sm text-ink/50 mb-6">{orders?.length ?? 0} orders</p>

      <OrderSearchFilter />

      <div className="border hairline overflow-x-auto mt-4">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="border-b hairline text-left text-xs text-ink/50">
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y hairline">
            {(orders ?? []).map((o: any) => (
              <tr key={o.id}>
                <td className="p-3">
                  <p className="font-medium">{o.order_number}</p>
                  <p className="text-xs text-ink/50">{new Date(o.created_at).toLocaleDateString()}</p>
                </td>
                <td className="p-3">
                  <p>{o.customer_name}</p>
                  <p className="text-xs text-ink/50">{o.phone}</p>
                </td>
                <td className="p-3 text-xs text-ink/60">{o.order_items.length} item(s)</td>
                <td className="p-3">{formatBDT(o.total)}</td>
                <td className="p-3 uppercase text-xs">{o.payment_method}</td>
                <td className="p-3">
                  <OrderStatusSelect orderId={o.id} initialStatus={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!orders || orders.length === 0) && (
          <p className="p-8 text-center text-sm text-ink/50">No orders found.</p>
        )}
      </div>
    </div>
  );
}
