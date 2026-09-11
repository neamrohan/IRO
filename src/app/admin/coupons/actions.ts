"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Not authorized");
  return supabase;
}

export interface CouponInput {
  code: string;
  discountPercent: number | null;
  discountFixed: number | null;
  minOrderAmount: number;
  expiresAt: string | null;
  usageLimit: number | null;
  isActive: boolean;
}

export async function createCoupon(input: CouponInput) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("coupons").insert({
    code: input.code.toUpperCase(),
    discount_percent: input.discountPercent,
    discount_fixed: input.discountFixed,
    min_order_amount: input.minOrderAmount,
    expires_at: input.expiresAt,
    usage_limit: input.usageLimit,
    is_active: input.isActive,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function toggleCoupon(id: string, isActive: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("coupons").update({ is_active: isActive }).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function deleteCoupon(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/coupons");
  return { success: true };
}
