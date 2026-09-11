import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import { getProducts, getCategories } from "@/lib/data/products";
import { ProductCard } from "@/components/product-card";
import { NewsletterForm } from "@/components/newsletter-form";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, newArrivals, bestSellers, categories] = await Promise.all([
    getProducts({ featured: true, limit: 4 }),
    getProducts({ newArrival: true, limit: 4 }),
    getProducts({ bestSeller: true, limit: 4 }),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-ink text-cream overflow-hidden">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-center min-h-[560px] py-16">
          <div className="order-2 lg:order-1">
            <p className="text-sand text-sm tracking-wide mb-4">The 2026 Collection</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-6">
              Three-piece,
              <br />
              made to be worn often.
            </h1>
            <p className="text-cream/70 max-w-md mb-8 leading-relaxed">
              Cotton, print, and hand embroidery — considered fabrics cut for
              real days, delivered across Bangladesh.
            </p>
            <Link
              href="/three-piece"
              className="inline-flex items-center gap-2 bg-cream text-ink px-6 py-3.5 text-sm font-medium hover:bg-cream/90 transition-colors"
            >
              Shop Collection <ArrowRight size={16} />
            </Link>
          </div>
          <div className="order-1 lg:order-2 relative aspect-[4/5] lg:aspect-auto lg:h-[560px]">
           <Image
  src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=90"
  alt="IRO premium three-piece collection"
  fill
  priority
  className="object-cover"
/>
          </div>
        </div>
      </section>

      {/* Featured categories */}
      <section className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-2xl sm:text-3xl">Shop by Category</h2>
          <Link href="/shop" className="text-sm text-oxblood hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="group">
              <div className="relative aspect-square bg-line/40 overflow-hidden mb-3">
                {cat.image_url ? (
                  <Image src={cat.image_url} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-ink/30 font-display text-xl">
                    {cat.name}
                  </div>
                )}
              </div>
              <p className="text-sm text-center">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-2xl sm:text-3xl">Featured</h2>
            <Link href="/shop" className="text-sm text-oxblood hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Promotional banner */}
      <section className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-sand/30 border hairline flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-10">
          <div>
            <h3 className="font-display text-2xl mb-2">The Royal Collection</h3>
            <p className="text-ink/70 max-w-md">Silk-blend, zari embroidery, made for the moments that matter.</p>
          </div>
          <Link href="/products/iro-royal-collection" className="shrink-0 bg-oxblood text-cream px-6 py-3 text-sm font-medium hover:bg-oxbloodDark transition-colors">
            Explore the Collection
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-2xl sm:text-3xl">New Arrivals</h2>
            <Link href="/new-arrivals" className="text-sm text-oxblood hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Best sellers */}
      {bestSellers.length > 0 && (
        <section className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-2xl sm:text-3xl">Best Sellers</h2>
            <Link href="/best-sellers" className="text-sm text-oxblood hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
            {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="bg-cream border-y hairline">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="font-display text-2xl sm:text-3xl mb-10 text-center">What customers say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Nusrat J.", text: "The fabric quality is far better than anything I've bought locally before. Fits true to size.", rating: 5 },
              { name: "Farhana R.", text: "Delivery was quick even outside Dhaka, and the embroidery detail on the Royal Collection is stunning.", rating: 5 },
              { name: "Tanjina A.", text: "My go-to for everyday cotton sets now. Comfortable and doesn't fade after wash.", rating: 4 },
            ].map((review) => (
              <div key={review.name} className="border hairline p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < review.rating ? "fill-sand text-sand" : "text-line"} />
                  ))}
                </div>
                <p className="text-sm text-ink/75 leading-relaxed mb-4">&ldquo;{review.text}&rdquo;</p>
                <p className="text-sm font-medium">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram-style gallery */}
      <section className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-display text-2xl sm:text-3xl mb-8 text-center">@iro.bd</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {[
            "photo-1583391733956-6c78276477e2",
            "photo-1594633312681-425c7b97ccd1",
            "photo-1618932260643-eee4a2f652a6",
            "photo-1610030181087-540f5b6c1c7c",
            "photo-1591369822096-ffd140ec948f",
            "photo-1583744946564-b52d01a7b321",
          ].map((id) => (
            <div key={id} className="relative aspect-square overflow-hidden">
              <Image src={`https://images.unsplash.com/${id}?w=400`} alt="IRO on Instagram" fill className="object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter (dark band) */}
      <section className="bg-ink text-cream">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-14 flex flex-col items-center text-center gap-5">
          <h2 className="font-display text-2xl sm:text-3xl">Stay in the loop</h2>
          <div className="w-full max-w-lg">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
