import { getProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/product-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Arrivals" };

export default async function NewArrivalsPage() {
  const products = await getProducts({ newArrival: true, sort: "newest" });

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl mb-2">New Arrivals</h1>
      <p className="text-sm text-ink/60 mb-8">{products.length} freshly launched pieces</p>
      {products.length === 0 ? (
        <div className="border hairline py-20 text-center text-ink/60">No new arrivals yet — check back soon.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
