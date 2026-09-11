"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductActions({ product }: { product: Product }) {
  const [size, setSize] = useState<string | null>(product.sizes?.[0] ?? null);
  const [color, setColor] = useState<string | null>(product.colors?.[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [busy, setBusy] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const outOfStock = product.stock_quantity <= 0;
  const image =
    product.product_images?.find((i) => i.is_primary)?.image_url ??
    product.product_images?.[0]?.image_url ??
    "/placeholder-product.svg";

  async function handleAdd() {
    if (outOfStock) return;
    setBusy(true);
    await addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      price: product.price,
      discountPrice: product.discount_price,
      size,
      color,
      quantity,
      stock: product.stock_quantity,
    });
    setBusy(false);
    toast.success(`${product.name} added to cart`);
  }

  async function handleBuyNow() {
    await handleAdd();
    router.push("/checkout");
  }

  async function handleWishlist() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Log in to save items to your wishlist.");
      return;
    }
    if (wishlisted) {
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", product.id);
      setWishlisted(false);
      toast.message("Removed from wishlist");
    } else {
      await supabase.from("wishlists").insert({ user_id: user.id, product_id: product.id });
      setWishlisted(true);
      toast.success("Added to wishlist");
    }
  }

  return (
    <div className="space-y-6">
      {product.colors?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Color{color ? `: ${color}` : ""}</h3>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "text-xs border hairline px-3 py-1.5",
                  color === c && "bg-ink text-cream border-ink"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.sizes?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Size{size ? `: ${size}` : ""}</h3>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  "text-sm border hairline h-10 w-10 flex items-center justify-center",
                  size === s && "bg-ink text-cream border-ink"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium mb-2">Quantity</h3>
        <div className="flex items-center border hairline w-fit">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-10 w-10 flex items-center justify-center hover:bg-line/30"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 text-center text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock_quantity || 1, q + 1))}
            className="h-10 w-10 flex items-center justify-center hover:bg-line/30"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>
        <p className="text-xs text-ink/50 mt-2">
          {outOfStock ? "Out of stock" : `${product.stock_quantity} in stock`}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          disabled={outOfStock || busy}
          className="flex-1 border border-ink text-ink py-3.5 text-sm font-medium hover:bg-ink hover:text-cream transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          {busy ? "Adding..." : "Add to Cart"}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={outOfStock || busy}
          className="flex-1 bg-oxblood text-cream py-3.5 text-sm font-medium hover:bg-oxbloodDark transition-colors disabled:opacity-40"
        >
          Buy Now
        </button>
        <button
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          className="h-12 w-12 shrink-0 border hairline flex items-center justify-center hover:border-ink"
        >
          <Heart size={17} className={cn(wishlisted && "fill-oxblood text-oxblood")} />
        </button>
      </div>
    </div>
  );
}
