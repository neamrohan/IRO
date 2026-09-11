"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateDeliveryCharges(insideDhaka: number, outsideDhaka: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { success: false, error: "Not authorized" };

  const { error } = await supabase
    .from("site_settings")
    .update({ value: { inside_dhaka: insideDhaka, outside_dhaka: outsideDhaka } })
    .eq("key", "delivery_charges");

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/sales");
  revalidatePath("/checkout");
  return { success: true };
}
