"use client";

import Image from "next/image";
import { useRef } from "react";

export function ScreenshotStrip({ name, images }: { name: string; images: string[] }) {
  const strip = useRef<HTMLDivElement>(null);

  // A mouse wheel only scrolls vertically, so buttons are the way mouse users move the strip.
  // Jump to an exact image position: scrolling by the strip's width misses the gap and fights snapping.
  const go = (dir: 1 | -1) => {
    const el = strip.current;
    if (!el || el.children.length < 2) return;
    const step = (el.children[1] as HTMLElement).offsetLeft - (el.children[0] as HTMLElement).offsetLeft;
    const index = Math.round(el.scrollLeft / step) + dir;
    const clamped = Math.max(0, Math.min(images.length - 1, index));
    el.scrollTo({ left: clamped * step, behavior: "smooth" });
  };

  return (
    <div className="space-y-2">
      {/* tabIndex lets keyboard users focus the strip and scroll it with arrow keys */}
      <div
        ref={strip}
        role="region"
        aria-label={`${name} screenshots`}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-md"
      >
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`${name} screenshot ${i + 1} of ${images.length}`}
            width={1600}
            height={900}
            sizes="(min-width: 640px) 350px, 100vw"
            draggable={false}
            className="aspect-video w-full shrink-0 snap-center rounded-md border border-neutral-300 object-cover object-top"
          />
        ))}
      </div>
      {images.length > 1 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500">{images.length} screenshots</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous screenshot"
              className="rounded border border-current px-2 py-0.5 hover:bg-neutral-100"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next screenshot"
              className="rounded border border-current px-2 py-0.5 hover:bg-neutral-100"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
