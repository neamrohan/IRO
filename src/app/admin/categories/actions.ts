"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Not authorized");
  return supabase;
}

export async function saveCategory(input: { id?: string; name: string; description: string; sortOrder: number; isActive: boolean }) {
  const supabase = await requireAdmin();
  const payload = {
    name: input.name,
    slug: slugify(input.name),
    description: input.description || null,
    sort_order: input.sortOrder,
    is_active: input.isActive,
  };

  const { error } = input.id
    ? await supabase.from("categories").update(payload).eq("id", input.id)
    : await supabase.from("categories").insert(payload);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/categories");
  return { success: true };
}
