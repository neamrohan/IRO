import type { Metadata } from "next";
import { Newsreader, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const displayFont = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "IRO — Premium Women's Three-Piece Collections",
    template: "%s | IRO",
  },
  description:
    "IRO is a Bangladeshi fashion house crafting premium women's three-piece collections in cotton, printed, embroidered, and silk-blend fabrics.",
  openGraph: {
    title: "IRO — Premium Women's Three-Piece Collections",
    description:
      "Discover IRO's curated three-piece collections — cotton, printed, embroidered and premium fabrics, delivered across Bangladesh.",
    type: "website",
    locale: "en_BD",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body className="font-sans antialiased flex min-h-screen flex-col">
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <Toaster position="top-center" richColors />
        </CartProvider>
      </body>
    </html>
  );
}
