import { cn } from "@/lib/utils"

type Props = {
  imageUrl: string
  caption: React.ReactNode
  alt: string
  className?: string
  imageClassName?: string
}

export default function ImageCard({ imageUrl, caption, alt, className, imageClassName }: Props) {
  return (
    <figure
      className={cn(
        "relative w-[250px] rounded-base border-2 border-border bg-background font-base",
        // Hollow outline offset by --shadow-x/--shadow-y, drawn behind the card (-z) so only the gap and its edges show.
        "after:pointer-events-none after:absolute after:-inset-0.5 after:-z-10 after:translate-x-(--shadow-x) after:translate-y-(--shadow-y) after:rounded-base after:border-2 after:border-shadow",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- full-size screenshot shown on demand */}
      <img className={cn("w-full aspect-video rounded-t-[3px] object-cover", imageClassName ?? "object-top")} src={imageUrl} alt={alt} />
      <figcaption className="border-t-2 text-foreground border-border p-4">
        {caption}
      </figcaption>
    </figure>
  )
}
