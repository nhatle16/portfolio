import { cn } from "@/lib/utils"

type Props = {
  imageUrl: string
  caption: React.ReactNode
  alt: string
  className?: string
}

export default function ImageCard({ imageUrl, caption, alt, className }: Props) {
  return (
    <figure
      className={cn(
        "w-[250px] overflow-hidden rounded-base border-2 border-border bg-background font-base shadow-shadow",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- full-size screenshot shown on demand */}
      <img className="w-full aspect-video object-cover object-top" src={imageUrl} alt={alt} />
      <figcaption className="border-t-2 text-foreground border-border p-4">
        {caption}
      </figcaption>
    </figure>
  )
}
