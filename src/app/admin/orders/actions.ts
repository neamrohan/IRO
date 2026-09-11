"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { success: false, error: "Not authorized" };

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
  return { success: true };
}
