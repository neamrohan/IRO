import { getProducts, getCategories } from "@/lib/data/products";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Three-Piece Collection",
  description: "IRO's complete women's three-piece collection — kameez, salwar, and orna sets.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ThreePiecePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categories = await getCategories();

  const products = await getProducts({
    categorySlug: params.category,
    minPrice: params.min ? Number(params.min) : undefined,
    maxPrice: params.max ? Number(params.max) : undefined,
    colors: params.colors?.split(",").filter(Boolean),
    sizes: params.sizes?.split(",").filter(Boolean),
    fabrics: params.fabrics?.split(",").filter(Boolean),
    sort: (params.sort as any) ?? "newest",
  });

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl mb-2">Three-Piece Collection</h1>
      <p className="text-sm text-ink/60 mb-8">Kameez, salwar &amp; orna sets — {products.length} products</p>

      <div className="flex gap-10">
        <ProductFilters categories={categories} />
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="border hairline py-20 text-center">
              <p className="text-ink/60">No products match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}