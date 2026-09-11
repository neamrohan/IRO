"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatBDT, discountPercent, effectivePrice, cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const image =
    product.product_images?.find((i) => i.is_primary)?.image_url ??
    product.product_images?.[0]?.image_url ??
    "/placeholder-product.svg";

  const price = effectivePrice(product.price, product.discount_price);
  const pct = discountPercent(product.price, product.discount_price);
  const outOfStock = product.stock_quantity <= 0;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    setAddingToCart(true);
    await addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      price: product.price,
      discountPrice: product.discount_price,
      size: product.sizes?.[0] ?? null,
      color: product.colors?.[0] ?? null,
      quantity: 1,
      stock: product.stock_quantity,
    });
    setAddingToCart(false);
    toast.success(`${product.name} added to cart`);
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-line/40 overflow-hidden">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {pct && (
          <span className="absolute top-3 left-3 bg-oxblood text-cream text-xs font-medium px-2 py-1">
            -{pct}%
          </span>
        )}

        {outOfStock && (
          <span className="absolute top-3 left-3 bg-ink/80 text-cream text-xs font-medium px-2 py-1">
            Out of stock
          </span>
        )}

        <button
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-cream/90 flex items-center justify-center hover:bg-cream"
        >
          <Heart size={15} className={cn(wishlisted && "fill-oxblood text-oxblood")} />
        </button>

        <button
          onClick={handleAddToCart}
          disabled={outOfStock || addingToCart}
          className="absolute inset-x-3 bottom-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-ink text-cream text-sm py-2.5 disabled:bg-ink/40"
        >
          {outOfStock ? "Out of stock" : addingToCart ? "Adding..." : "Add to Cart"}
        </button>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="text-sm text-ink group-hover:text-oxblood transition-colors">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink">{formatBDT(price)}</span>
          {pct && (
            <span className="text-xs text-ink/40 line-through">{formatBDT(product.price)}</span>
          )}
        </div>
        {product.rating_count > 0 && (
          <div className="flex items-center gap-1 text-xs text-ink/50">
            <Star size={12} className="fill-sand text-sand" />
            <span>{product.rating_avg.toFixed(1)}</span>
            <span>({product.rating_count})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
