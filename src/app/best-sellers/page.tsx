import { getProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/product-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Best Sellers" };

export default async function BestSellersPage() {
  const products = await getProducts({ bestSeller: true, sort: "popularity" });

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl mb-2">Best Sellers</h1>
      <p className="text-sm text-ink/60 mb-8">{products.length} customer favorites</p>
      {products.length === 0 ? (
        <div className="border hairline py-20 text-center text-ink/60">No best sellers marked yet.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
