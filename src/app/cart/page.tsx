"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import { createClient } from "@/lib/supabase/client";
import { formatBDT, effectivePrice } from "@/lib/utils";
import type { Coupon } from "@/lib/types";

export default function CartPage() {
  const { items, isLoading, updateQuantity, removeItem, subtotal } = useCart();
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [checking, setChecking] = useState(false);

  const discount = appliedCoupon
    ? appliedCoupon.discount_percent
      ? (subtotal * appliedCoupon.discount_percent) / 100
      : appliedCoupon.discount_fixed ?? 0
    : 0;

  async function handleApplyCoupon() {
    setCouponError("");
    if (!couponCode.trim()) return;
    setChecking(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.trim().toUpperCase())
      .eq("is_active", true)
      .maybeSingle();
    setChecking(false);

    if (error || !data) {
      setCouponError("Invalid or expired coupon code.");
      return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError("This coupon has expired.");
      return;
    }
    if (data.usage_limit && data.used_count >= data.usage_limit) {
      setCouponError("This coupon has reached its usage limit.");
      return;
    }
    if (subtotal < data.min_order_amount) {
      setCouponError(`Minimum order of ${formatBDT(data.min_order_amount)} required for this coupon.`);
      return;
    }

    setAppliedCoupon(data);
    toast.success(`Coupon "${data.code}" applied`);
  }

  function goToCheckout() {
    if (appliedCoupon) {
      sessionStorage.setItem("iro_coupon", JSON.stringify(appliedCoupon));
    } else {
      sessionStorage.removeItem("iro_coupon");
    }
    router.push("/checkout");
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-20 text-center text-ink/50">
        Loading your cart...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="font-display text-2xl mb-3">Your cart is empty</h1>
        <p className="text-sm text-ink/60 mb-8">Explore the collection and find something you love.</p>
        <Link href="/shop" className="inline-block bg-ink text-cream px-6 py-3 text-sm font-medium">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const deliveryEstimate = 80; // final charge is confirmed at checkout based on district
  const total = Math.max(0, subtotal - discount) + deliveryEstimate;

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 divide-y hairline border-y hairline">
          {items.map((item) => {
            const key = `${item.productId}-${item.size}-${item.color}`;
            const price = effectivePrice(item.price, item.discountPrice);
            return (
              <div key={key} className="flex gap-4 py-5">
                <Link href={`/products/${item.slug}`} className="relative h-28 w-20 shrink-0 bg-line/40">
                  <Image src={item.image || "/placeholder-product.svg"} alt={item.name} fill className="object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div>
                      <Link href={`/products/${item.slug}`} className="text-sm font-medium hover:text-oxblood">
                        {item.name}
                      </Link>
                      <p className="text-xs text-ink/50 mt-1">
                        {item.color ? `Color: ${item.color}` : ""} {item.size ? `· Size: ${item.size}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.size, item.color)}
                      aria-label="Remove item"
                      className="text-ink/40 hover:text-oxblood shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border hairline">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                        className="h-8 w-8 flex items-center justify-center hover:bg-line/30"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="h-8 w-8 flex items-center justify-center hover:bg-line/30 disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="text-sm font-medium">{formatBDT(price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <div className="border hairline p-6 space-y-4 sticky top-24">
            <h2 className="font-medium">Order Summary</h2>

            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Coupon code"
                className="flex-1 border hairline px-3 py-2 text-sm uppercase"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={checking}
                className="border border-ink px-4 py-2 text-sm hover:bg-ink hover:text-cream disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            {couponError && <p className="text-xs text-oxblood">{couponError}</p>}
            {appliedCoupon && <p className="text-xs text-moss">Coupon {appliedCoupon.code} applied</p>}

            <div className="space-y-2 text-sm pt-2 border-t hairline">
              <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span>{formatBDT(subtotal)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-moss"><span>Discount</span><span>-{formatBDT(discount)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-ink/60">Delivery (est.)</span><span>{formatBDT(deliveryEstimate)}</span></div>
              <div className="flex justify-between font-medium text-base pt-2 border-t hairline">
                <span>Total</span><span>{formatBDT(total)}</span>
              </div>
              <p className="text-xs text-ink/40">Final delivery charge confirmed at checkout based on your district.</p>
            </div>

            <button
              onClick={goToCheckout}
              className="w-full bg-oxblood text-cream py-3.5 text-sm font-medium hover:bg-oxbloodDark transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={15} />
            </button>
            <Link href="/shop" className="block text-center text-sm text-ink/60 hover:text-ink">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
