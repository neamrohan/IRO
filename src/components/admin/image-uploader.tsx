"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { X, Upload, Star } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export interface UploadedImage {
  url: string;
  isPrimary: boolean;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

// Uploads directly to the Supabase Storage bucket "product-images".
// Create this bucket (public) in Supabase Dashboard → Storage before using
// the admin panel — see README "Supabase setup instructions".
export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    const next = [...images];

    for (const file of Array.from(fileList)) {
      const path = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
        continue;
      }
      const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(path);
      next.push({ url: publicUrl.publicUrl, isPrimary: next.length === 0 });
    }

    onChange(next);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage(index: number) {
    const next = images.filter((_, i) => i !== index);
    if (next.length > 0 && !next.some((i) => i.isPrimary)) next[0].isPrimary = true;
    onChange(next);
  }

  function setPrimary(index: number) {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-3">
        {images.map((img, i) => (
          <div key={img.url} className="relative aspect-square bg-line/40 group">
            <Image src={img.url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 h-6 w-6 bg-ink/70 text-cream rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
            >
              <X size={12} />
            </button>
            <button
              type="button"
              onClick={() => setPrimary(i)}
              className={cn(
                "absolute bottom-1 left-1 h-6 w-6 rounded-full flex items-center justify-center",
                img.isPrimary ? "bg-oxblood text-cream" : "bg-cream/80 text-ink/50 opacity-0 group-hover:opacity-100"
              )}
              aria-label="Set as primary image"
            >
              <Star size={12} className={img.isPrimary ? "fill-current" : ""} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square border-2 border-dashed hairline flex flex-col items-center justify-center gap-1 text-ink/40 hover:text-ink/60"
        >
          <Upload size={18} />
          <span className="text-xs">{uploading ? "Uploading..." : "Add"}</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-xs text-ink/40">The starred image is shown first in listings. Click a photo&apos;s star to change it.</p>
    </div>
  );
}
