"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, productName }: { images: { image_url: string; alt_text: string | null }[]; productName: string }) {
  const list = images.length ? images : [{ image_url: "/placeholder-product.svg", alt_text: productName }];
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div>
      <div
        className="relative aspect-[3/4] bg-line/40 overflow-hidden cursor-zoom-in"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={list[active].image_url}
          alt={list[active].alt_text ?? productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-300"
          style={{ transformOrigin: origin, transform: zoomed ? "scale(1.8)" : "scale(1)" }}
        />
      </div>

      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {list.map((img, i) => (
            <button
              key={img.image_url + i}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square bg-line/40 overflow-hidden border-2",
                active === i ? "border-ink" : "border-transparent"
              )}
            >
              <Image src={img.image_url} alt={img.alt_text ?? productName} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
