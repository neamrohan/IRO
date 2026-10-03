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

export async function saveHeroSlide(input: {
  id?: string;
  title: string;
  imageUrl: string;
  altText: string;
  objectPosition: string;
  sortOrder: number;
  isActive: boolean;
}) {
  const supabase = await requireAdmin();
  const title = input.title.trim();
  const imageUrl = input.imageUrl.trim();
  let imageUrlIsValid = false;
  try {
    const parsedUrl = new URL(imageUrl);
    imageUrlIsValid = parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
  } catch {
    imageUrlIsValid = false;
  }

  if (!title || !imageUrlIsValid) {
    return { success: false, error: "A title and valid image URL are required." };
  }
  if (!Number.isInteger(input.sortOrder) || input.sortOrder < 0) {
    return { success: false, error: "Display order must be a non-negative whole number." };
  }

  const payload = {
    title,
    image_url: imageUrl,
    alt_text: input.altText.trim(),
    object_position: input.objectPosition.trim() || "center",
    sort_order: input.sortOrder,
    is_active: input.isActive,
    updated_at: new Date().toISOString(),
  };
  const query = input.id
    ? supabase.from("hero_slides").update(payload).eq("id", input.id).select("id").single()
    : supabase.from("hero_slides").insert(payload).select("id").single();
  const { data, error } = await query;

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/hero-gallery");
  return { success: true, id: data.id };
}

export async function deleteHeroSlide(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("hero_slides").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/hero-gallery");
  return { success: true };
}