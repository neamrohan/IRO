import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AccountNav } from "@/components/account-nav";
import { formatBDT } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-sand/40 text-ink",
  confirmed: "bg-moss/20 text-moss",
  processing: "bg-moss/20 text-moss",
  shipped: "bg-ink/10 text-ink",
  delivered: "bg-moss/30 text-moss",
  cancelled: "bg-oxblood/10 text-oxblood",
  returned: "bg-oxblood/10 text-oxblood",
};

export default async function MyOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account/orders");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl mb-8">My Orders</h1>
      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <AccountNav />

        <div className="space-y-4">
          {!orders || orders.length === 0 ? (
            <div className="border hairline py-16 text-center text-ink/60">
              <p className="mb-4">You haven&apos;t placed any orders yet.</p>
              <Link href="/shop" className="text-oxblood hover:underline text-sm">Start Shopping</Link>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="border hairline p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="font-medium text-sm">{order.order_number}</p>
                    <p className="text-xs text-ink/50">{new Date(order.created_at).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full capitalize", STATUS_STYLES[order.status])}>
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-ink/70 space-y-1 mb-3">
                  {order.order_items.map((item: any) => (
                    <p key={item.id}>{item.product_name} {item.size ? `(${item.size})` : ""} × {item.quantity}</p>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-medium pt-3 border-t hairline">
                  <span>Total</span>
                  <span>{formatBDT(order.total)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
