"use server";

import { createClient } from "@/lib/supabase/server";
import type { CartLine } from "@/lib/types";

export interface CheckoutInput {
  customerName: string;
  phone: string;
  email: string;
  addressLine: string;
  district: string;
  area: string;
  deliveryMethod: string;
  orderNotes: string;
  paymentMethod: "cod" | "bkash" | "nagad" | "online";
  couponCode?: string | null;
  discountAmount?: number;
  items: CartLine[];
}

export interface CheckoutResult {
  success: boolean;
  orderNumber?: string;
  error?: string;
}

export async function createOrder(input: CheckoutInput): Promise<CheckoutResult> {
  if (!input.items.length) {
    return { success: false, error: "Your cart is empty." };
  }
  if (!input.customerName.trim() || !input.phone.trim() || !input.addressLine.trim() || !input.district) {
    return { success: false, error: "Please fill in all required fields." };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: settingsRow } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "delivery_charges")
    .maybeSingle();

  const charges = (settingsRow?.value as { inside_dhaka: number; outside_dhaka: number }) ?? {
    inside_dhaka: 80,
    outside_dhaka: 130,
  };

  const deliveryCharge = input.district.toLowerCase() === "dhaka" ? charges.inside_dhaka : charges.outside_dhaka;

  const subtotal = input.items.reduce((sum, item) => {
    const price = item.discountPrice ?? item.price;
    return sum + price * item.quantity;
  }, 0);

  const discountAmount = input.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discountAmount) + deliveryCharge;

  const { data: orderNumberData, error: orderNumberError } = await supabase.rpc("generate_order_number");
  if (orderNumberError || !orderNumberData) {
    return { success: false, error: "Could not generate an order number. Please try again." };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumberData,
      user_id: user?.id ?? null,
      customer_name: input.customerName.trim(),
      phone: input.phone.trim(),
      email: input.email.trim() || null,
      address_line: input.addressLine.trim(),
      district: input.district,
      area: input.area.trim() || null,
      delivery_method: input.deliveryMethod,
      order_notes: input.orderNotes.trim() || null,
      payment_method: input.paymentMethod,
      status: "pending",
      subtotal,
      delivery_charge: deliveryCharge,
      discount_amount: discountAmount,
      coupon_code: input.couponCode ?? null,
      total,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("createOrder error:", orderError?.message);
    return { success: false, error: "Something went wrong placing your order. Please try again." };
  }

  const orderItemsPayload = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.name,
    product_image: item.image,
    size: item.size,
    color: item.color,
    unit_price: item.discountPrice ?? item.price,
    quantity: item.quantity,
    line_total: (item.discountPrice ?? item.price) * item.quantity,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);
  if (itemsError) {
    console.error("createOrder items error:", itemsError.message);
    return { success: false, error: "Order created but items failed to save. Please contact support." };
  }

  // Best-effort stock decrement (non-fatal if it fails)
  for (const item of input.items) {
    try {
      await supabase.rpc("decrement_stock", { p_product_id: item.productId, p_qty: item.quantity });
    } catch {
      // Non-fatal: stock sync can be corrected manually from the admin panel.
    }
  }

  // Clear the logged-in user's DB cart (guest localStorage cart is cleared client-side)
  if (user) {
    await supabase.from("cart_items").delete().eq("user_id", user.id);
  }

  if (input.couponCode) {
    try {
      await supabase.rpc("increment_coupon_usage", { p_code: input.couponCode });
    } catch {
      // Non-fatal: usage count can be corrected manually from the admin panel.
    }
  }

  return { success: true, orderNumber: order.order_number };
}
