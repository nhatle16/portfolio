"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import ImageCard from "@/components/ui/image-card";

const arrow = "flex shrink-0 items-center justify-center hover:opacity-60";

// Chevron drawn as SVG so it looks the same on every OS and font.
const chevron = (d: string, size: string) => (
  <svg viewBox="0 0 24 24" className={size} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

export type Screenshot = {
  src: string;
  /** What the screenshot shows. Shown under the enlarged image and read by screen readers. */
  description: string;
};

export function ScreenshotStrip({ name, images }: { name: string; images: Screenshot[] }) {
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  // Wrap around so Next on the last screenshot goes back to the first.
  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + images.length) % images.length);
  const many = images.length > 1;
  const label = (i: number) => `${name} screenshot ${i + 1} of ${images.length}: ${images[i].description}`;

  // [<] content [>] row, shared by the card and the enlarged view.
  // big: the enlarged view gets larger arrows with bigger click targets.
  const withNav = (content: React.ReactNode, big = false) => {
    const btn = `${arrow} ${big ? "size-10 sm:size-14" : "h-8 w-6"}`;
    const size = big ? "size-8 sm:size-12" : "size-6";
    return (
    <div className="flex items-center gap-2">
      {many && (
        <button type="button" onClick={() => go(-1)} aria-label="Previous screenshot" className={btn}>
          {chevron("M15 5l-7 7 7 7", size)}
        </button>
      )}
      {content}
      {many && (
        <button type="button" onClick={() => go(1)} aria-label="Next screenshot" className={btn}>
          {chevron("M9 5l7 7-7 7", size)}
        </button>
      )}
    </div>
    );
  };

  return (
    <div className="space-y-2">
      {withNav(
        // min-w-0 lets the frame shrink to make room for the arrows
        <button
          type="button"
          onClick={() => dialog.current?.showModal()}
          aria-label={`Enlarge ${label(index)}`}
          className="relative aspect-video min-w-0 flex-1 cursor-zoom-in overflow-hidden rounded-md border border-neutral-300"
        >
          {/* All images stay mounted (only the current one shown) so switching is instant. */}
          {images.map((img, i) => (
            <Image
              key={img.src}
              src={img.src}
              alt={img.description}
              fill
              sizes="(min-width: 640px) 300px, 100vw"
              loading="eager"
              className={`object-cover object-top ${i === index ? "" : "hidden"}`}
            />
          ))}
        </button>,
      )}
      {many && (
        <p aria-live="polite" className="text-center text-xs text-neutral-500">
          {index + 1} / {images.length}
        </p>
      )}

      {/* Native <dialog>: Esc closes it and focus stays inside while open. */}
      <dialog
        ref={dialog}
        aria-label={`${name} screenshots`}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
        // Backdrop contrasts with the border: light behind the black border, dark behind the white one.
        // pb-1 leaves room for the card's 4px shadow, which the dialog would otherwise clip.
        className="m-auto w-[min(64rem,calc(100%-2rem))] max-w-none bg-transparent p-0 pb-1 text-foreground backdrop:bg-white/85 backdrop:backdrop-blur-sm dark:backdrop:bg-black/85"
      >
        <div className="flex justify-end pb-2">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Close"
            className="px-2 text-2xl font-bold leading-none hover:opacity-60"
          >
            ✕
          </button>
        </div>
        {withNav(
          <ImageCard
            imageUrl={images[index].src}
            alt={images[index].description}
            caption={
              <span className="block space-y-1">
                <span className="flex justify-between gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                  <span>{name}</span>
                  <span aria-live="polite" className="whitespace-nowrap">{index + 1} / {images.length}</span>
                </span>
                <span className="block">{images[index].description}</span>
              </span>
            }
            className="w-auto min-w-0 flex-1 bg-card-tint"
          />,
          true,
        )}
      </dialog>
    </div>
  );
}
