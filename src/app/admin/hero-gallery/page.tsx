import { createClient } from "@/lib/supabase/server";
import { HeroGalleryManager } from "@/components/admin/hero-gallery-manager";
import type { HeroSlide } from "@/lib/data/hero-slides";

export default async function AdminHeroGalleryPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("hero_slides").select("*").order("sort_order");

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Hero Gallery</h1>
      <HeroGalleryManager initialSlides={(data ?? []) as HeroSlide[]} />
    </div>
  );
}