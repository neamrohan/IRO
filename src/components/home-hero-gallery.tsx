"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/lib/data/hero-slides";

export function HomeHeroGallery({ photos }: { photos: HeroSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePhoto = photos[activeIndex];

  function showPhoto(index: number) {
    setActiveIndex((index + photos.length) % photos.length);
  }

  if (!activePhoto) return null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="group relative min-h-0 flex-1 overflow-hidden bg-[#29231f]">
        {photos.map((photo, index) => (
          <Image
            key={photo.id}
            src={photo.image_url}
            alt={photo.alt_text}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={`object-cover transition-opacity duration-500 ${
              index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            style={{ objectPosition: photo.object_position }}
            aria-hidden={index !== activeIndex}
          />
        ))}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
          <div className="min-w-0 text-white">
            <p className="truncate text-sm font-medium">{activePhoto.title}</p>
            <p className="mt-1 text-xs text-white/70">
              {String(activeIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => showPhoto(activeIndex - 1)}
              aria-label="Show previous photo"
              className="grid size-10 place-items-center border border-white/60 bg-black/20 text-white transition-colors hover:bg-white hover:text-ink focus-visible:outline-white"
            >
              <ChevronLeft size={19} />
            </button>
            <button
              type="button"
              onClick={() => showPhoto(activeIndex + 1)}
              aria-label="Show next photo"
              className="grid size-10 place-items-center border border-white/60 bg-black/20 text-white transition-colors hover:bg-white hover:text-ink focus-visible:outline-white"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2" aria-label="Choose a hero photo">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => showPhoto(index)}
            aria-label={`Show photo ${index + 1}: ${photo.title}`}
            aria-current={index === activeIndex ? "true" : undefined}
            className={`relative aspect-[4/3] overflow-hidden bg-[#29231f] transition-opacity hover:opacity-100 focus-visible:outline-white ${
              index === activeIndex ? "opacity-100 ring-2 ring-white ring-offset-2 ring-offset-ink" : "opacity-65"
            }`}
          >
            <Image
              src={photo.image_url}
              alt=""
              fill
              sizes="20vw"
              className="object-cover"
              style={{ objectPosition: photo.object_position }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}