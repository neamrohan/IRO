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

export async function saveCategory(input: {
  id?: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}) {
  const supabase = await requireAdmin();
  const name = input.name.trim();
  const slug = slugify(input.slug || name);
  if (!name || !slug) return { success: false, error: "Category name and slug are required." };
  if (!Number.isInteger(input.sortOrder) || input.sortOrder < 0) {
    return { success: false, error: "Display order must be a non-negative whole number." };
  }

  if (input.parentId) {
    if (input.parentId === input.id) return { success: false, error: "A category cannot be its own parent." };
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, parent_id");
    if (categoriesError) return { success: false, error: categoriesError.message };
    const byId = new Map((categories ?? []).map((category) => [category.id, category.parent_id]));
    let ancestorId: string | null = input.parentId;
    const visited = new Set<string>();
    while (ancestorId && !visited.has(ancestorId)) {
      if (ancestorId === input.id) return { success: false, error: "A category cannot be nested under its own subcategory." };
      visited.add(ancestorId);
      ancestorId = byId.get(ancestorId) ?? null;
    }
  }

  const payload = {
    name,
    slug,
    parent_id: input.parentId || null,
    image_url: input.imageUrl.trim() || null,
    description: input.description || null,
    sort_order: input.sortOrder,
    is_active: input.isActive,
    updated_at: new Date().toISOString(),
  };

  const { error } = input.id
    ? await supabase.from("categories").update(payload).eq("id", input.id)
    : await supabase.from("categories").insert(payload);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/shop/[...slug]", "page");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/shop/[...slug]", "page");
  revalidatePath("/");
  return { success: true };
}
