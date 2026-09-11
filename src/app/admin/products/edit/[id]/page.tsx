import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: categories }, { data: product }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("*, product_images(*)").eq("id", id).maybeSingle(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Edit Product</h1>
      <ProductForm categories={categories ?? []} product={product as any} />
    </div>
  );
}
