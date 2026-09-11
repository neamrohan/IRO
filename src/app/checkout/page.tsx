"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import { formatBDT, effectivePrice } from "@/lib/utils";
import { createOrder } from "./actions";
import type { Coupon } from "@/lib/types";

const BD_DISTRICTS = [
  "Dhaka","Chattogram","Khulna","Rajshahi","Sylhet","Barishal","Rangpur","Mymensingh",
  "Comilla","Narayanganj","Gazipur","Bogura","Cox's Bazar","Jessore","Dinajpur",
  "Faridpur","Tangail","Noakhali","Pabna","Kushtia",
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart, isLoading } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    addressLine: "",
    district: "Dhaka",
    area: "",
    deliveryMethod: "standard",
    orderNotes: "",
    paymentMethod: "cod" as "cod" | "bkash" | "nagad" | "online",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = sessionStorage.getItem("iro_coupon");
    if (stored) setCoupon(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.replace("/cart");
    }
  }, [isLoading, items.length, router]);

  const deliveryCharge = form.district === "Dhaka" ? 80 : 130;
  const discount = coupon
    ? coupon.discount_percent
      ? (subtotal * coupon.discount_percent) / 100
      : coupon.discount_fixed ?? 0
    : 0;
  const total = Math.max(0, subtotal - discount) + deliveryCharge;

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.customerName.trim()) next.customerName = "Name is required.";
    if (!/^01[3-9]\d{8}$/.test(form.phone.trim())) next.phone = "Enter a valid Bangladeshi phone number (e.g. 017XXXXXXXX).";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.addressLine.trim()) next.addressLine = "Address is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    setSubmitting(true);
    const result = await createOrder({
      customerName: form.customerName,
      phone: form.phone,
      email: form.email,
      addressLine: form.addressLine,
      district: form.district,
      area: form.area,
      deliveryMethod: form.deliveryMethod,
      orderNotes: form.orderNotes,
      paymentMethod: form.paymentMethod,
      couponCode: coupon?.code ?? null,
      discountAmount: discount,
      items,
    });
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to place order.");
      return;
    }

    sessionStorage.removeItem("iro_coupon");
    await clearCart();
    router.push(`/order-success/${result.orderNumber}`);
  }

  if (isLoading || items.length === 0) return null;

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-medium mb-4">Delivery Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <input
                  placeholder="Full name *"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full border hairline px-3 py-2.5 text-sm"
                />
                {errors.customerName && <p className="text-xs text-oxblood mt-1">{errors.customerName}</p>}
              </div>
              <div>
                <input
                  placeholder="Phone number * (e.g. 017XXXXXXXX)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border hairline px-3 py-2.5 text-sm"
                />
                {errors.phone && <p className="text-xs text-oxblood mt-1">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <input
                  placeholder="Email (optional, for order updates)"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border hairline px-3 py-2.5 text-sm"
                />
                {errors.email && <p className="text-xs text-oxblood mt-1">{errors.email}</p>}
              </div>
              <div className="sm:col-span-2">
                <input
                  placeholder="Full address (house, road, area) *"
                  value={form.addressLine}
                  onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                  className="w-full border hairline px-3 py-2.5 text-sm"
                />
                {errors.addressLine && <p className="text-xs text-oxblood mt-1">{errors.addressLine}</p>}
              </div>
              <select
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full border hairline px-3 py-2.5 text-sm"
              >
                {BD_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input
                placeholder="Area / Thana (optional)"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="w-full border hairline px-3 py-2.5 text-sm"
              />
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-4">Delivery Method</h2>
            <div className="space-y-2">
              {[
                { value: "standard", label: "Standard Delivery (2–5 days)" },
                { value: "express", label: "Express Delivery (1–2 days, Dhaka only)" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 border hairline px-4 py-3 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={form.deliveryMethod === opt.value}
                    onChange={() => setForm({ ...form, deliveryMethod: opt.value })}
                    className="accent-oxblood"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-4">Payment Method</h2>
            <div className="space-y-2">
              {[
                { value: "cod", label: "Cash on Delivery", enabled: true },
                { value: "bkash", label: "bKash", enabled: false },
                { value: "nagad", label: "Nagad", enabled: false },
                { value: "online", label: "Online Payment (Card)", enabled: false },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-between gap-3 border hairline px-4 py-3 text-sm ${opt.enabled ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      disabled={!opt.enabled}
                      checked={form.paymentMethod === opt.value}
                      onChange={() => setForm({ ...form, paymentMethod: opt.value as any })}
                      className="accent-oxblood"
                    />
                    {opt.label}
                  </span>
                  {!opt.enabled && <span className="text-xs text-ink/40">Coming soon</span>}
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-4">Order Notes</h2>
            <textarea
              placeholder="Any special instructions for delivery (optional)"
              value={form.orderNotes}
              onChange={(e) => setForm({ ...form, orderNotes: e.target.value })}
              rows={3}
              className="w-full border hairline px-3 py-2.5 text-sm"
            />
          </section>
        </div>

        <div>
          <div className="border hairline p-6 space-y-4 sticky top-24">
            <h2 className="font-medium">Order Summary</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => {
                const price = effectivePrice(item.price, item.discountPrice);
                return (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="flex justify-between text-sm gap-2">
                    <span className="text-ink/70">
                      {item.name} {item.size ? `(${item.size})` : ""} × {item.quantity}
                    </span>
                    <span className="shrink-0">{formatBDT(price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>
            <div className="space-y-2 text-sm pt-3 border-t hairline">
              <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span>{formatBDT(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-moss"><span>Discount ({coupon?.code})</span><span>-{formatBDT(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-ink/60">Delivery ({form.district === "Dhaka" ? "Inside Dhaka" : "Outside Dhaka"})</span><span>{formatBDT(deliveryCharge)}</span></div>
              <div className="flex justify-between font-medium text-base pt-2 border-t hairline">
                <span>Total</span><span>{formatBDT(total)}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-oxblood text-cream py-3.5 text-sm font-medium hover:bg-oxbloodDark transition-colors disabled:opacity-60"
            >
              {submitting ? "Placing order..." : "Place Order"}
            </button>
            <Link href="/cart" className="block text-center text-sm text-ink/60 hover:text-ink">
              Back to Cart
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
