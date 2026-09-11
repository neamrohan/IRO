"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/three-piece", label: "Three-Piece" },
  { href: "/best-sellers", label: "Best Sellers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount } = useCart();

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
          "lg:hidden overflow-hidden transition-[max-height] duration-300 border-t hairline",
          mobileOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <nav className="flex flex-col px-4 py-3">
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
