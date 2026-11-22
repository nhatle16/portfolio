import { ArrowRight } from "lucide-react";
import { ScreenshotStrip, type Screenshot } from "./ScreenshotStrip";

export type Project = {
    name: string;
    description: string;
    tech: string[];
    images?: Screenshot[];
    live?: string;
    source?: string;
}

// Neobrutalist feature block: thick border, hard offset shadow, links in a bordered footer.
export function ProjectCard({ project }: { project: Project }) {
  const links = [
    { href: project.live, label: "Live demo" },
    { href: project.source, label: "Source" },
  ].filter((l) => l.href);

  return (
    <article className="flex min-w-0 flex-col rounded-xs border-2 border-border bg-background shadow-[4px_4px_0_0_var(--border)]">
      <div className="flex-1 space-y-3 p-5">
        {project.images && project.images.length > 0 && (
          <ScreenshotStrip name={project.name} images={project.images} />
        )}
        <h3 className="font-grotesk text-xl font-bold">{project.name}</h3>
        {/* hyphens-auto splits long words so justified lines don't get wide gaps */}
        <p className="text-justify hyphens-auto text-neutral-600 dark:text-neutral-400">{project.description}</p>
        <ul className="flex flex-wrap gap-2 font-grotesk text-sm font-medium">
          {project.tech.map((t) => (
            <li key={t} className="rounded-xs border-2 border-border px-2 py-0.5">{t}</li>
          ))}
        </ul>
      </div>
      {links.length > 0 && (
        <div className="flex divide-x-2 divide-border border-t-2 border-border">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="flex flex-1 items-center justify-between px-5 py-3 font-semibold hover:bg-card-tint"
            >
              {l.label}
              <ArrowRight aria-hidden="true" className="size-5" />
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
