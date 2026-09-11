"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];

export function OrderStatusSelect({ orderId, initialStatus }: { orderId: string; initialStatus: OrderStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  function handleChange(newStatus: OrderStatus) {
    setStatus(newStatus);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (!result.success) {
        toast.error(result.error ?? "Could not update status.");
        setStatus(initialStatus);
        return;
      }
      toast.success(`Order marked as ${newStatus}.`);
    });
  }

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value as OrderStatus)}
      className="border hairline px-2 py-1.5 text-xs capitalize disabled:opacity-50"
    >
      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}
