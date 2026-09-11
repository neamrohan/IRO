import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabase = await createClient();

  const { data: products } = await supabase.from("products").select("slug, updated_at").eq("is_active", true);
  const { data: categories } = await supabase.from("categories").select("slug").eq("is_active", true);

  const staticRoutes = [
    "", "/shop", "/three-piece", "/new-arrivals", "/best-sellers", "/about", "/contact",
    "/faq", "/privacy-policy", "/terms", "/return-policy", "/login", "/register",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const productRoutes = (products ?? []).map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
  }));

  const categoryRoutes = (categories ?? []).map((c) => ({
    url: `${base}/shop?category=${c.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
