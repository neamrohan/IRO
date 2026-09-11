import { getProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/product-card";
import { SearchBar } from "@/components/search-bar";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search Results" };

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const products = q ? await getProducts({ search: q, sort: "newest" }) : [];

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl mb-6">Search</h1>
      <div className="max-w-xl mb-10">
        <SearchBar initialValue={q} />
      </div>

      {q ? (
        <>
          <p className="text-sm text-ink/60 mb-8">
            {products.length} result{products.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
          </p>
          {products.length === 0 ? (
            <div className="border hairline py-20 text-center text-ink/60">
              No products found. Try a different search term.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-ink/50">Start typing to search IRO&apos;s collection.</p>
      )}
    </div>
  );
}
