"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "iro_cart_v1";

interface CartContextValue {
  items: CartLine[];
  isLoading: boolean;
  addItem: (item: CartLine) => Promise<void>;
  removeItem: (productId: string, size: string | null, color: string | null) => Promise<void>;
  updateQuantity: (
    productId: string,
    size: string | null,
    color: string | null,
    quantity: number
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function readLocalCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function writeLocalCart(items: CartLine[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function lineKey(productId: string, size: string | null, color: string | null) {
  return `${productId}::${size ?? ""}::${color ?? ""}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return null;
    }
    return createClient();
  }, []);

  // Determine auth state, then load cart from the right source.
  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!supabase) {
        setItems(readLocalCart());
        setIsLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from("cart_items")
          .select("id, product_id, size, color, quantity, products(name, slug, price, discount_price, stock_quantity, product_images(image_url, is_primary))")
          .eq("user_id", user.id);

        const mapped: CartLine[] = (data ?? []).map((row: any) => {
          const product = row.products;
          const primaryImage =
            product?.product_images?.find((i: any) => i.is_primary)?.image_url ??
            product?.product_images?.[0]?.image_url ??
            "";
          return {
            productId: row.product_id,
            slug: product?.slug ?? "",
            name: product?.name ?? "",
            image: primaryImage,
            price: product?.price ?? 0,
            discountPrice: product?.discount_price ?? null,
            size: row.size,
            color: row.color,
            quantity: row.quantity,
            stock: product?.stock_quantity ?? 0,
          };
        });
        setItems(mapped);
      } else {
        setItems(readLocalCart());
      }
      setIsLoading(false);
    }

    init();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  const persistLocal = useCallback((next: CartLine[]) => {
    setItems(next);
    writeLocalCart(next);
  }, []);

  const addItem = useCallback(
    async (item: CartLine) => {
      if (userId && supabase) {
        const { data: existing } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("user_id", userId)
          .eq("product_id", item.productId)
          .eq("size", item.size ?? "")
          .eq("color", item.color ?? "")
          .maybeSingle();

        if (existing) {
          await supabase
            .from("cart_items")
            .update({ quantity: existing.quantity + item.quantity })
            .eq("id", existing.id);
        } else {
          await supabase.from("cart_items").insert({
            user_id: userId,
            product_id: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          });
        }

        setItems((prev) => {
          const key = lineKey(item.productId, item.size, item.color);
          const idx = prev.findIndex((p) => lineKey(p.productId, p.size, p.color) === key);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
            return next;
          }
          return [...prev, item];
        });
      } else {
        const key = lineKey(item.productId, item.size, item.color);
        const idx = items.findIndex((p) => lineKey(p.productId, p.size, p.color) === key);
        const next = [...items];
        if (idx >= 0) {
          next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
        } else {
          next.push(item);
        }
        persistLocal(next);
      }
    },
    [items, persistLocal, supabase, userId]
  );

  const removeItem = useCallback(
    async (productId: string, size: string | null, color: string | null) => {
      if (userId && supabase) {
        await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", productId)
          .eq("size", size ?? "")
          .eq("color", color ?? "");
      }
      const key = lineKey(productId, size, color);
      const next = items.filter((p) => lineKey(p.productId, p.size, p.color) !== key);
      persistLocal(next);
    },
    [items, persistLocal, supabase, userId]
  );

  const updateQuantity = useCallback(
    async (productId: string, size: string | null, color: string | null, quantity: number) => {
      if (quantity <= 0) {
        await removeItem(productId, size, color);
        return;
      }
      if (userId && supabase) {
        await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("user_id", userId)
          .eq("product_id", productId)
          .eq("size", size ?? "")
          .eq("color", color ?? "");
      }
      const key = lineKey(productId, size, color);
      const next = items.map((p) =>
        lineKey(p.productId, p.size, p.color) === key ? { ...p, quantity } : p
      );
      persistLocal(next);
    },
    [items, persistLocal, removeItem, supabase, userId]
  );

  const clearCart = useCallback(async () => {
    if (userId && supabase) {
      await supabase.from("cart_items").delete().eq("user_id", userId);
    }
    persistLocal([]);
  }, [persistLocal, supabase, userId]);

  const subtotal = items.reduce((sum, item) => {
    const price = item.discountPrice ?? item.price;
    return sum + price * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, isLoading, addItem, removeItem, updateQuantity, clearCart, subtotal, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
