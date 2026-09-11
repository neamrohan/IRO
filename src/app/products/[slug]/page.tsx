import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Star, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { createClient } from "@/lib/supabase/server";
import { ProductGallery } from "@/components/product-gallery";
import { ProductActions } from "@/components/product-actions";
import { ProductCard } from "@/components/product-card";
import { ReviewForm } from "@/components/review-form";
import { formatBDT, discountPercent, effectivePrice } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.product_images?.[0]?.image_url ? [product.product_images[0].image_url] : [],
    },
  };
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, supabase] = await Promise.all([
    getRelatedProducts(product.category_id, product.id),
    createClient(),
  ]);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", product.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  const price = effectivePrice(product.price, product.discount_price);
  const pct = discountPercent(product.price, product.discount_price);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.product_images?.map((i) => i.image_url) ?? [],
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price,
      availability: product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating: product.rating_count > 0 ? {
      "@type": "AggregateRating",
      ratingValue: product.rating_avg,
      reviewCount: product.rating_count,
    } : undefined,
  };

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-xs text-ink/50 mb-6">
        <span>Shop</span> / <span>{product.categories?.name ?? "Three-Piece"}</span> / <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <ProductGallery images={product.product_images ?? []} productName={product.name} />

        <div>
          <h1 className="font-display text-3xl mb-2">{product.name}</h1>

          {product.rating_count > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-ink/60 mb-3">
              <Star size={14} className="fill-sand text-sand" />
              <span>{product.rating_avg.toFixed(1)}</span>
              <span>({product.rating_count} reviews)</span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-medium">{formatBDT(price)}</span>
            {pct && (
              <>
                <span className="text-base text-ink/40 line-through">{formatBDT(product.price)}</span>
                <span className="text-sm text-oxblood font-medium">-{pct}%</span>
              </>
            )}
          </div>

          <p className="text-sm text-ink/70 leading-relaxed mb-8">{product.description}</p>

          <ProductActions product={product} />

          <div className="grid sm:grid-cols-3 gap-4 mt-8 pt-8 border-t hairline">
            <div className="flex items-start gap-2.5">
              <Truck size={17} className="mt-0.5 text-ink/50 shrink-0" />
              <div>
                <p className="text-xs font-medium">Nationwide Delivery</p>
                <p className="text-xs text-ink/50">Inside Dhaka ৳80 · Outside ৳130</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <RotateCcw size={17} className="mt-0.5 text-ink/50 shrink-0" />
              <div>
                <p className="text-xs font-medium">7-Day Exchange</p>
                <p className="text-xs text-ink/50">Unworn items, tags attached</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={17} className="mt-0.5 text-ink/50 shrink-0" />
              <div>
                <p className="text-xs font-medium">Quality Checked</p>
                <p className="text-xs text-ink/50">Inspected before dispatch</p>
              </div>
            </div>
          </div>

          {/* Fabric / three-piece details */}
          <div className="mt-8 pt-8 border-t hairline space-y-3 text-sm">
            <h2 className="font-medium mb-1">Product Details</h2>
            <dl className="grid grid-cols-[110px_1fr] gap-y-2 text-ink/70">
              {product.fabric && (<><dt className="text-ink/50">Fabric</dt><dd>{product.fabric}</dd></>)}
              {product.kameez_details && (<><dt className="text-ink/50">Kameez</dt><dd>{product.kameez_details}</dd></>)}
              {product.salwar_details && (<><dt className="text-ink/50">Salwar</dt><dd>{product.salwar_details}</dd></>)}
              {product.orna_details && (<><dt className="text-ink/50">Orna</dt><dd>{product.orna_details}</dd></>)}
              {product.work_type && (<><dt className="text-ink/50">Work / Print</dt><dd>{product.work_type}</dd></>)}
              {product.length_info && (<><dt className="text-ink/50">Length</dt><dd>{product.length_info}</dd></>)}
              {product.care_instructions && (<><dt className="text-ink/50">Care</dt><dd>{product.care_instructions}</dd></>)}
            </dl>
          </div>

          {/* Size guide */}
          <details className="mt-6 border hairline px-4 py-3">
            <summary className="text-sm font-medium cursor-pointer">Size Guide</summary>
            <table className="w-full text-xs mt-3 text-ink/70">
              <thead>
                <tr className="border-b hairline text-left">
                  <th className="py-1.5">Size</th><th>Bust (in)</th><th>Waist (in)</th><th>Hip (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="py-1.5">S</td><td>34</td><td>28</td><td>36</td></tr>
                <tr><td className="py-1.5">M</td><td>36</td><td>30</td><td>38</td></tr>
                <tr><td className="py-1.5">L</td><td>38</td><td>32</td><td>40</td></tr>
                <tr><td className="py-1.5">XL</td><td>40</td><td>34</td><td>42</td></tr>
                <tr><td className="py-1.5">XXL</td><td>42</td><td>36</td><td>44</td></tr>
              </tbody>
            </table>
          </details>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-20 pt-10 border-t hairline">
        <h2 className="font-display text-2xl mb-8">Customer Reviews</h2>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {reviews && reviews.length > 0 ? (
              reviews.map((r) => (
                <div key={r.id} className="border-b hairline pb-6 last:border-none">
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < r.rating ? "fill-sand text-sand" : "text-line"} />
                    ))}
                  </div>
                  <p className="text-sm text-ink/75 leading-relaxed mb-2">{r.comment}</p>
                  <p className="text-xs text-ink/50">{r.reviewer_name}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink/50">No reviews yet — be the first to review this product.</p>
            )}
          </div>
          <div>
            <ReviewForm productId={product.id} />
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-20 pt-10 border-t hairline">
          <h2 className="font-display text-2xl mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
