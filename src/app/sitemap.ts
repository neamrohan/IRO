import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/data/products";
import { getCategoryHref } from "@/lib/categories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabase = await createClient();

  const { data: products } = await supabase.from("products").select("slug, updated_at").eq("is_active", true);
  const categories = await getCategories();

  const staticRoutes = [
    "", "/shop", "/new-arrivals", "/best-sellers", "/about", "/contact",
    "/faq", "/privacy-policy", "/terms", "/return-policy", "/login", "/register",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const productRoutes = (products ?? []).map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
  }));

  const categoryRoutes = categories.map((category) => ({
    url: `${base}${getCategoryHref(category, categories)}`,
    lastModified: category.updated_at ? new Date(category.updated_at) : new Date(),
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
