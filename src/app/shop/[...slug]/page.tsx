import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryByPath, getProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";

interface PageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ params }: Pick<PageProps, "params">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryByPath(slug);
  return {
    title: category?.name ?? "Category Not Found",
    description: category?.description ?? `Shop ${category?.name ?? "IRO fashion"} at IRO.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const [{ slug }, filters] = await Promise.all([params, searchParams]);
  const category = await getCategoryByPath(slug);
  if (!category) notFound();

  const products = await getProducts({
    categoryId: category.id,
    minPrice: filters.min ? Number(filters.min) : undefined,
    maxPrice: filters.max ? Number(filters.max) : undefined,
    colors: filters.colors?.split(",").filter(Boolean),
    sizes: filters.sizes?.split(",").filter(Boolean),
    fabrics: filters.fabrics?.split(",").filter(Boolean),
    sort: filters.sort as "newest" | "price_asc" | "price_desc" | "rating" | "popularity" | undefined,
  });

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-display text-3xl">{category.name}</h1>
      {category.description ? <p className="mb-3 max-w-2xl text-sm text-ink/60">{category.description}</p> : null}
      <p className="mb-8 text-sm text-ink/60">{products.length} products</p>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <ProductFilters categories={[]} />
        <div className="min-w-0 flex-1">
          {products.length === 0 ? (
            <div className="border hairline py-20 text-center">
              <p className="text-ink/60">No products in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}