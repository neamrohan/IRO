"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import { getCategoryHref } from "@/lib/categories";
import type { Category } from "@/lib/types";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/best-sellers", label: "Best Sellers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ categories }: { categories: Category[] }) {
  const shopMenuRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const { itemCount } = useCart();
  const mainCategories = categories.filter((category) => !category.parent_id);

  useEffect(() => {
    if (!shopOpen) return;

    function handleOutsidePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !shopMenuRef.current?.contains(event.target)) {
        setShopOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => document.removeEventListener("pointerdown", handleOutsidePointerDown);
  }, [shopOpen]);

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b hairline">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link href="/" className="font-display text-2xl tracking-wide text-ink shrink-0">
            IRO
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <div ref={shopMenuRef} className="relative">
              <button
                onClick={() => setShopOpen((open) => !open)}
                aria-expanded={shopOpen}
                className="flex items-center gap-1 text-sm text-ink/80 transition-colors hover:text-oxblood"
              >
                Shop <ChevronDown size={14} />
              </button>
              {shopOpen && (
                <div className="absolute left-1/2 top-full z-50 mt-4 w-[min(720px,90vw)] -translate-x-1/2 border hairline bg-cream p-6 shadow-lg">
                  <div className="mb-5 border-b hairline pb-4">
                    <Link href="/shop" onClick={() => setShopOpen(false)} className="text-sm font-medium hover:text-oxblood">Shop All</Link>
                  </div>
                  <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                    {mainCategories.map((category) => (
                      <section key={category.id}>
                        <Link href={getCategoryHref(category, categories)} onClick={() => setShopOpen(false)} className="text-sm font-medium hover:text-oxblood">
                          {category.name}
                        </Link>
                        <ul className="mt-2 space-y-2">
                          {categories.filter((child) => child.parent_id === category.id).map((child) => (
                            <li key={child.id}>
                              <Link href={getCategoryHref(child, categories)} onClick={() => setShopOpen(false)} className="text-xs text-ink/65 hover:text-oxblood">
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-ink/80 hover:text-oxblood transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link href="/search" aria-label="Search" className="p-2 hover:text-oxblood transition-colors">
              <Search size={19} />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="p-2 hover:text-oxblood transition-colors">
              <Heart size={19} />
            </Link>
            <Link href="/cart" aria-label="Cart" className="relative p-2 hover:text-oxblood transition-colors">
              <ShoppingBag size={19} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-oxblood px-1 text-[10px] font-medium text-cream">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link href="/account" aria-label="Account" className="p-2 hover:text-oxblood transition-colors">
              <User size={19} />
            </Link>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "lg:hidden overflow-y-auto transition-[max-height] duration-300 border-t hairline",
          mobileOpen ? "max-h-[75vh]" : "max-h-0"
        )}
      >
        <nav className="flex flex-col px-4 py-3">
          <div className="border-b hairline">
            <div className="flex items-center justify-between">
              <Link href="/shop" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm text-ink/85">Shop</Link>
              <button onClick={() => setMobileShopOpen((open) => !open)} aria-label="Toggle shop categories" aria-expanded={mobileShopOpen} className="p-2 text-ink/65">
                <ChevronDown size={16} className={cn("transition-transform", mobileShopOpen && "rotate-180")} />
              </button>
            </div>
            {mobileShopOpen && (
              <div className="pb-3 pl-3">
                {mainCategories.map((category) => (
                  <section key={category.id} className="py-2">
                    <Link href={getCategoryHref(category, categories)} onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm font-medium">
                      {category.name}
                    </Link>
                    {categories.filter((child) => child.parent_id === category.id).map((child) => (
                      <Link key={child.id} href={getCategoryHref(child, categories)} onClick={() => setMobileOpen(false)} className="block py-1.5 pl-3 text-sm text-ink/60">
                        {child.name}
                      </Link>
                    ))}
                  </section>
                ))}
              </div>
            )}
          </div>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-sm text-ink/85 border-b hairline last:border-none"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
