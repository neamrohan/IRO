"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { saveHeroSlide, deleteHeroSlide } from "@/app/admin/hero-gallery/actions";
import { createClient } from "@/lib/supabase/client";
import type { HeroSlide } from "@/lib/data/hero-slides";

interface ManagedSlide extends HeroSlide {
  is_active: boolean;
}

const EMPTY_SLIDE: ManagedSlide = {
  id: "",
  title: "",
  image_url: "",
  alt_text: "",
  object_position: "center",
  sort_order: 0,
  is_active: true,
};

function storagePath(imageUrl: string) {
  try {
    const pathname = new URL(imageUrl).pathname;
    const marker = "/storage/v1/object/public/product-images/";
    const start = pathname.indexOf(marker);
    return start < 0 ? null : pathname.slice(start + marker.length).split("/").map(decodeURIComponent).join("/");
  } catch {
    return null;
  }
}

export function HeroGalleryManager({ initialSlides }: { initialSlides: (HeroSlide & { is_active?: boolean })[] }) {
  const router = useRouter();
  const [slides, setSlides] = useState<ManagedSlide[]>(initialSlides.map((slide) => ({ ...slide, is_active: slide.is_active ?? true })));
  const [newSlide, setNewSlide] = useState<ManagedSlide>({ ...EMPTY_SLIDE, sort_order: initialSlides.length });
  const [savingId, setSavingId] = useState("");
  const [uploadingId, setUploadingId] = useState("");

  function updateSlide(id: string, patch: Partial<ManagedSlide>) {
    setSlides((current) => current.map((slide) => slide.id === id ? { ...slide, ...patch } : slide));
  }

  async function uploadImage(file: File): Promise<string | null> {
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return null;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Images must be 10 MB or smaller.");
      return null;
    }

    const supabase = createClient();
    const path = `hero-slides/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast.error(`Image upload failed: ${error.message}`);
      return null;
    }
    return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  async function removeStoredImage(imageUrl: string) {
    const path = storagePath(imageUrl);
    if (!path) return;
    const { error } = await createClient().storage.from("product-images").remove([path]);
    if (error) toast.error(`Slide saved, but its old image could not be removed: ${error.message}`);
  }

  async function handleSave(slide: ManagedSlide, isNew = false) {
    setSavingId(isNew ? "new" : slide.id);
    const result = await saveHeroSlide({
      id: isNew ? undefined : slide.id,
      title: slide.title,
      imageUrl: slide.image_url,
      altText: slide.alt_text,
      objectPosition: slide.object_position,
      sortOrder: Number(slide.sort_order),
      isActive: slide.is_active,
    });
    setSavingId("");

    if (!result.success) {
      toast.error(result.error ?? "Could not save slide.");
      return;
    }

    if (isNew) {
      setSlides((current) => [...current, { ...slide, id: result.id! }].sort((a, b) => a.sort_order - b.sort_order));
      setNewSlide({ ...EMPTY_SLIDE, sort_order: slides.length + 1 });
    } else {
      setSlides((current) => current.map((item) => item.id === slide.id ? slide : item).sort((a, b) => a.sort_order - b.sort_order));
      const oldImage = initialSlides.find((item) => item.id === slide.id)?.image_url;
      if (oldImage && oldImage !== slide.image_url) await removeStoredImage(oldImage);
    }
    toast.success(isNew ? "Slide added." : "Slide updated.");
    router.refresh();
  }

  async function handleDelete(slide: ManagedSlide) {
    if (!confirm(`Delete "${slide.title}" from the homepage gallery?`)) return;
    const result = await deleteHeroSlide(slide.id);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete slide.");
      return;
    }
    setSlides((current) => current.filter((item) => item.id !== slide.id));
    await removeStoredImage(slide.image_url);
    toast.success("Slide deleted.");
    router.refresh();
  }

  async function handleReplacement(file: File | undefined, slideId: string) {
    if (!file) return;
    setUploadingId(slideId);
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      if (slideId === "new") setNewSlide((current) => ({ ...current, image_url: imageUrl }));
      else updateSlide(slideId, { image_url: imageUrl });
    }
    setUploadingId("");
  }

  function renderFields(slide: ManagedSlide, update: (patch: Partial<ManagedSlide>) => void, id: string) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-ink/60">Title
          <input required value={slide.title} onChange={(event) => update({ title: event.target.value })} className="mt-1 w-full border hairline px-3 py-2.5 text-sm text-ink" />
        </label>
        <label className="text-xs text-ink/60">Alt text
          <input value={slide.alt_text} onChange={(event) => update({ alt_text: event.target.value })} className="mt-1 w-full border hairline px-3 py-2.5 text-sm text-ink" />
        </label>
        <label className="text-xs text-ink/60">Image URL
          <input required type="url" value={slide.image_url} onChange={(event) => update({ image_url: event.target.value })} className="mt-1 w-full border hairline px-3 py-2.5 text-sm text-ink" />
        </label>
        <label className="flex items-end gap-2 text-sm">
          <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleReplacement(event.target.files?.[0], id)} />
          <span className="inline-flex cursor-pointer items-center gap-2 border hairline px-3 py-2.5 text-sm"><ImagePlus size={16} />{uploadingId === id ? "Uploading..." : "Upload / replace image"}</span>
        </label>
        <label className="text-xs text-ink/60">Image position
          <input value={slide.object_position} onChange={(event) => update({ object_position: event.target.value })} placeholder="center 70%" className="mt-1 w-full border hairline px-3 py-2.5 text-sm text-ink" />
        </label>
        <label className="text-xs text-ink/60">Display order
          <input required type="number" min="0" step="1" value={slide.sort_order} onChange={(event) => update({ sort_order: Number(event.target.value) })} className="mt-1 w-full border hairline px-3 py-2.5 text-sm text-ink" />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={slide.is_active} onChange={(event) => update({ is_active: event.target.checked })} className="accent-oxblood" /> Show on homepage
        </label>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-medium">Current slides</h2>
        {slides.map((slide) => (
          <article key={slide.id} className="grid gap-4 border hairline p-4 sm:grid-cols-[150px_minmax(0,1fr)]">
            <div className="relative aspect-[4/3] overflow-hidden bg-line/30">
              {slide.image_url ? <Image src={slide.image_url} alt={slide.alt_text} fill sizes="150px" className="object-cover" style={{ objectPosition: slide.object_position }} /> : null}
            </div>
            <div className="space-y-4">
              {renderFields(slide, (patch) => updateSlide(slide.id, patch), slide.id)}
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => handleDelete(slide)} aria-label={`Delete ${slide.title}`} title="Delete slide" className="p-2 text-ink/55 hover:text-oxblood"><Trash2 size={17} /></button>
                <button type="button" onClick={() => handleSave(slide)} disabled={savingId === slide.id || uploadingId === slide.id} className="bg-oxblood px-5 py-2.5 text-sm font-medium text-cream disabled:opacity-60">
                  {savingId === slide.id ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </article>
        ))}
        {slides.length === 0 && <p className="border hairline p-6 text-sm text-ink/55">No slides yet.</p>}
      </section>

      <section className="border-t hairline pt-6">
        <h2 className="font-medium mb-4">Add a slide</h2>
        <div className="grid gap-4 sm:grid-cols-[150px_minmax(0,1fr)]">
          <div className="relative aspect-[4/3] overflow-hidden bg-line/30">
            {newSlide.image_url ? <Image src={newSlide.image_url} alt={newSlide.alt_text} fill sizes="150px" className="object-cover" style={{ objectPosition: newSlide.object_position }} /> : null}
          </div>
          <div className="space-y-4">
            {renderFields(newSlide, (patch) => setNewSlide((current) => ({ ...current, ...patch })), "new")}
            <button type="button" onClick={() => handleSave(newSlide, true)} disabled={savingId === "new" || uploadingId === "new"} className="bg-oxblood px-5 py-2.5 text-sm font-medium text-cream disabled:opacity-60">
              {savingId === "new" ? "Adding..." : "Add slide"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}