import { ArrowUpRight } from "lucide-react";
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
    <article className="flex min-w-0 flex-col rounded-xs border-2 border-border bg-background shadow-[4px_4px_0_0_var(--shadow-color)]">
      <div className="flex-1 space-y-3 p-5">
        {project.images && project.images.length > 0 && (
          <ScreenshotStrip name={project.name} images={project.images} />
        )}
        <h3 className="font-grotesk text-xl font-bold">{project.name}</h3>
        {/* hyphens-auto splits long words so justified lines don't get wide gaps */}
        <p className="text-justify hyphens-auto text-neutral-600 dark:text-neutral-400">{project.description}</p>
        <div className="space-y-1 font-grotesk text-sm">
          <span aria-hidden="true" className="block text-base font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Built with
          </span>
          <ul aria-label="Built with" className="flex flex-wrap gap-x-2 gap-y-1 font-medium">
            {project.tech.map((t, i) => (
              <li key={t} className="flex gap-2">
                {t}
                {/* Dot after each item (not before) so a wrapped line never starts with one. */}
                {i < project.tech.length - 1 && <span aria-hidden="true" className="text-neutral-400">·</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {links.length > 0 && (
        <div className="flex divide-x-2 divide-border border-t-2 border-border">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-between px-5 py-3 font-semibold hover:bg-card-tint"
            >
              <span>
                {l.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
              <ArrowUpRight aria-hidden="true" className="size-5" />
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
