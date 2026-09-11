import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

const PRODUCT_SELECT = `
  *,
  product_images(id, product_id, image_url, alt_text, sort_order, is_primary),
  categories(id, name, slug, description, image_url, sort_order, is_active)
`;

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export interface ProductFilters {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  fabrics?: string[];
  sort?: "newest" | "price_asc" | "price_desc" | "rating" | "popularity";
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  limit?: number;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  if (!hasSupabaseConfig()) return [];

  const supabase = await createClient();
  let query = supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true);

  if (filters.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .maybeSingle();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  if (filters.minPrice != null) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice != null) query = query.lte("price", filters.maxPrice);

  if (filters.colors?.length) query = query.overlaps("colors", filters.colors);
  if (filters.sizes?.length) query = query.overlaps("sizes", filters.sizes);
  if (filters.fabrics?.length) query = query.in("fabric", filters.fabrics);

  if (filters.featured) query = query.eq("is_featured", true);
  if (filters.newArrival) query = query.eq("is_new_arrival", true);
  if (filters.bestSeller) query = query.eq("is_best_seller", true);

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("rating_avg", { ascending: false });
      break;
    case "popularity":
      query = query.order("rating_count", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) {
    console.error("getProducts error:", error.message);
    return [];
  }
  return (data ?? []) as unknown as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasSupabaseConfig()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("getProductBySlug error:", error.message);
    return null;
  }
  return data as unknown as Product | null;
}

export async function getRelatedProducts(categoryId: string | null, excludeId: string): Promise<Product[]> {
  if (!categoryId || !hasSupabaseConfig()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .neq("id", excludeId)
    .limit(4);
  return (data ?? []) as unknown as Product[];
}

export async function getCategories() {
  if (!hasSupabaseConfig()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("getCategories error:", error.message);
    return [];
  }
  return data ?? [];
}
