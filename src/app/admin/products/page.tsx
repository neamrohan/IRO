import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/utils";
import { ProductRowActions } from "@/components/admin/product-row-actions";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(image_url, is_primary), categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-3xl mb-1">Products</h1>
          <p className="text-sm text-ink/50">{products?.length ?? 0} products</p>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-1.5 bg-ink text-cream px-4 py-2.5 text-sm font-medium">
          <Plus size={15} /> Add Product
        </Link>
      </div>

      <div className="border hairline overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b hairline text-left text-xs text-ink/50">
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y hairline">
            {(products ?? []).map((p: any) => {
              const image = p.product_images?.find((i: any) => i.is_primary)?.image_url ?? p.product_images?.[0]?.image_url;
              return (
                <tr key={p.id}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-9 bg-line/40 shrink-0">
                        {image && <Image src={image} alt={p.name} fill className="object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-ink/50">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{p.categories?.name ?? "—"}</td>
                  <td className="p-3">{formatBDT(p.discount_price ?? p.price)}</td>
                  <td className="p-3">{p.stock_quantity}</td>
                  <td className="p-3">
                    <span className={p.is_active ? "text-moss" : "text-ink/40"}>{p.is_active ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="p-3">
                    <ProductRowActions productId={p.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!products || products.length === 0) && (
          <p className="p-8 text-center text-sm text-ink/50">No products yet. Add your first product.</p>
        )}
      </div>
    </div>
  );
}
