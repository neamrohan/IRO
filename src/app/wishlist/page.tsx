import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/wishlist");

  const { data } = await supabase
    .from("wishlists")
    .select("products(*, product_images(*), categories(*))")
    .eq("user_id", user.id);

  const products = (data ?? []).map((row: any) => row.products).filter(Boolean) as Product[];

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl mb-2">Wishlist</h1>
      <p className="text-sm text-ink/60 mb-8">{products.length} saved item{products.length !== 1 ? "s" : ""}</p>

      {products.length === 0 ? (
        <div className="border hairline py-20 text-center text-ink/60">
          Nothing saved yet. Tap the heart icon on any product to add it here.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
