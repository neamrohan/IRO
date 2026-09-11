"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export interface ProductFormInput {
  id?: string;
  name: string;
  description: string;
  sku: string;
  categoryId: string | null;
  price: number;
  discountPrice: number | null;
  stockQuantity: number;
  fabric: string;
  colors: string[];
  sizes: string[];
  kameezDetails: string;
  salwarDetails: string;
  ornaDetails: string;
  workType: string;
  lengthInfo: string;
  careInstructions: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  images: { url: string; isPrimary: boolean }[];
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Not authorized");
  return supabase;
}

export async function saveProduct(input: ProductFormInput) {
  const supabase = await requireAdmin();

  const payload = {
    name: input.name,
    slug: slugify(input.name),
    description: input.description,
    sku: input.sku || null,
    category_id: input.categoryId,
    price: input.price,
    discount_price: input.discountPrice,
    stock_quantity: input.stockQuantity,
    fabric: input.fabric || null,
    colors: input.colors,
    sizes: input.sizes,
    kameez_details: input.kameezDetails || null,
    salwar_details: input.salwarDetails || null,
    orna_details: input.ornaDetails || null,
    work_type: input.workType || null,
    length_info: input.lengthInfo || null,
    care_instructions: input.careInstructions || null,
    is_active: input.isActive,
    is_featured: input.isFeatured,
    is_new_arrival: input.isNewArrival,
    is_best_seller: input.isBestSeller,
  };

  let productId = input.id;

  if (productId) {
    const { error } = await supabase.from("products").update(payload).eq("id", productId);
    if (error) return { success: false, error: error.message };
    await supabase.from("product_images").delete().eq("product_id", productId);
  } else {
    const { data, error } = await supabase.from("products").insert(payload).select("id").single();
    if (error) return { success: false, error: error.message };
    productId = data.id;
  }

  if (input.images.length > 0) {
    const imageRows = input.images.map((img, i) => ({
      product_id: productId,
      image_url: img.url,
      sort_order: i,
      is_primary: img.isPrimary,
    }));
    const { error: imgError } = await supabase.from("product_images").insert(imageRows);
    if (imgError) return { success: false, error: imgError.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true, productId };
}

export async function deleteProduct(productId: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/products");
  return { success: true };
}

export async function updateStock(productId: string, stockQuantity: number) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("products").update({ stock_quantity: stockQuantity }).eq("id", productId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/products");
  return { success: true };
}
