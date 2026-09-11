import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-cream/90 mt-24">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-2">
            <div className="font-display text-2xl mb-3">IRO</div>
            <p className="text-sm text-cream/60 max-w-xs leading-relaxed">
              Premium women&apos;s three-piece collections, crafted in Bangladesh.
              Considered fabrics, quiet detail, made to be worn often.
            </p>
            <div className="flex gap-4 mt-5">
              <a href="#" aria-label="Instagram" className="text-cream/70 hover:text-cream">
                <Instagram size={18} />
              </a>
              <a href="#" aria-label="Facebook" className="text-cream/70 hover:text-cream">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-4">Shop</h3>
            <ul className="space-y-2.5 text-sm text-cream/60">
              <li><Link href="/shop" className="hover:text-cream">All Products</Link></li>
              <li><Link href="/three-piece" className="hover:text-cream">Three-Piece</Link></li>
              <li><Link href="/new-arrivals" className="hover:text-cream">New Arrivals</Link></li>
              <li><Link href="/best-sellers" className="hover:text-cream">Best Sellers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-4">Support</h3>
            <ul className="space-y-2.5 text-sm text-cream/60">
              <li><Link href="/contact" className="hover:text-cream">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-cream">FAQ</Link></li>
              <li><Link href="/return-policy" className="hover:text-cream">Return &amp; Refund</Link></li>
              <li><Link href="/account/orders" className="hover:text-cream">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-4">Company</h3>
            <ul className="space-y-2.5 text-sm text-cream/60">
              <li><Link href="/about" className="hover:text-cream">About IRO</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-cream">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-cream">Terms &amp; Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream/10">
          <NewsletterForm />
        </div>

        <div className="mt-8 pt-6 border-t border-cream/10 flex flex-col sm:flex-row justify-between gap-2 text-xs text-cream/40">
          <p>&copy; {new Date().getFullYear()} IRO. All rights reserved.</p>
          <p>Dhaka, Bangladesh · Cash on Delivery available nationwide</p>
        </div>
      </div>
    </footer>
  );
}
