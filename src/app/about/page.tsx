import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About IRO" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h1 className="font-display text-4xl mb-6">About IRO</h1>
          <p className="text-ink/70 leading-relaxed mb-4">
            IRO began with a simple frustration: three-piece sets that looked good in a photo
            but didn&apos;t hold up to a real week — fabric that pilled, prints that faded,
            fits that never matched the size chart.
          </p>
          <p className="text-ink/70 leading-relaxed mb-4">
            We work directly with mills and artisans across Bangladesh to source cotton voile,
            georgette, and silk-blend fabrics, then finish every piece with the kind of
            attention we&apos;d want in our own wardrobe — clean seams, considered prints,
            and embroidery that&apos;s hand-checked before it ships.
          </p>
          <p className="text-ink/70 leading-relaxed">
            Every IRO set is designed, sampled, and quality-checked in Dhaka, and delivered
            nationwide with cash on delivery available in every district.
          </p>
        </div>
        <div className="relative aspect-[4/5]">
          <Image src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800" alt="IRO studio" fill className="object-cover" />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-8 border-t hairline pt-12">
        <div>
          <h3 className="font-display text-xl mb-2">Considered Fabric</h3>
          <p className="text-sm text-ink/60 leading-relaxed">Cotton, voile, georgette, and silk-blend, chosen for how they wear — not just how they photograph.</p>
        </div>
        <div>
          <h3 className="font-display text-xl mb-2">Made in Bangladesh</h3>
          <p className="text-sm text-ink/60 leading-relaxed">Every piece is cut, stitched, and finished by artisans we work with directly.</p>
        </div>
        <div>
          <h3 className="font-display text-xl mb-2">Delivered Nationwide</h3>
          <p className="text-sm text-ink/60 leading-relaxed">Cash on delivery to all 64 districts, with express delivery available inside Dhaka.</p>
        </div>
      </div>
    </div>
  );
}
