import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/utils";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderSuccessPage({ params }: PageProps) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", orderId)
    .maybeSingle();

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center">
      <CheckCircle2 size={52} className="mx-auto text-moss mb-6" />
      <h1 className="font-display text-3xl mb-2">Order Placed Successfully</h1>
      <p className="text-ink/60 mb-8">
        Thank you, {order.customer_name}. Your order confirmation is below.
      </p>

      <div className="border hairline text-left p-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-ink/60">Order Number</span>
          <span className="font-medium">{order.order_number}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink/60">Payment Method</span>
          <span className="uppercase">{order.payment_method}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink/60">Delivery To</span>
          <span className="text-right">{order.address_line}, {order.district}</span>
        </div>

        <div className="border-t hairline pt-4 space-y-2">
          {order.order_items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-ink/70">{item.product_name} × {item.quantity}</span>
              <span>{formatBDT(item.line_total)}</span>
            </div>
          ))}
        </div>

        <div className="border-t hairline pt-4 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span>{formatBDT(order.subtotal)}</span></div>
          {order.discount_amount > 0 && <div className="flex justify-between text-moss"><span>Discount</span><span>-{formatBDT(order.discount_amount)}</span></div>}
          <div className="flex justify-between"><span className="text-ink/60">Delivery</span><span>{formatBDT(order.delivery_charge)}</span></div>
          <div className="flex justify-between font-medium text-base pt-2 border-t hairline"><span>Total</span><span>{formatBDT(order.total)}</span></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Link href="/account/orders" className="border border-ink px-6 py-3 text-sm font-medium hover:bg-ink hover:text-cream">
          Track My Orders
        </Link>
        <Link href="/shop" className="bg-ink text-cream px-6 py-3 text-sm font-medium hover:bg-ink/90">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
