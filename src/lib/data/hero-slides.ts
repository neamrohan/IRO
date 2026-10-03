import { createClient } from "@/lib/supabase/server";

export interface HeroSlide {
  id: string;
  title: string;
  image_url: string;
  alt_text: string;
  object_position: string;
  sort_order: number;
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "signature-drape",
    title: "The signature drape",
    image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&crop=bottom&w=1200&q=90",
    alt_text: "Purple saree with ornate gold embroidery",
    object_position: "center 72%",
    sort_order: 0,
  },
  {
    id: "prints-with-a-story",
    title: "Prints with a story",
    image_url: "https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?auto=format&fit=crop&crop=bottom&w=1200&q=90",
    alt_text: "Traditional saree styled in a colorful print",
    object_position: "center 78%",
    sort_order: 1,
  },
  {
    id: "together-in-tradition",
    title: "Together in tradition",
    image_url: "https://images.unsplash.com/photo-1745482039058-92017fb981cf?auto=format&fit=crop&crop=bottom&w=1200&q=90",
    alt_text: "Two women wearing traditional sarees",
    object_position: "center 72%",
    sort_order: 2,
  },
  {
    id: "everyday-edit",
    title: "The everyday edit",
    image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&crop=bottom&w=1200&q=90",
    alt_text: "Pink trousers styled in a relaxed fashion look",
    object_position: "center 78%",
    sort_order: 3,
  },
  {
    id: "closer-look",
    title: "A closer look",
    image_url: "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?auto=format&fit=crop&crop=bottom&w=1200&q=90",
    alt_text: "Dark green shorts styled in a fashion look",
    object_position: "center 76%",
    sort_order: 4,
  },
];

export async function getHeroSlides(): Promise<HeroSlide[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return DEFAULT_HERO_SLIDES;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hero_slides")
    .select("id, title, image_url, alt_text, object_position, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) return DEFAULT_HERO_SLIDES;
  return data as HeroSlide[];
}