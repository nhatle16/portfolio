import { ScreenshotStrip } from "./ScreenshotStrip";

export type Project = {
    name: string;
    description: string;
    tech: string[];
    images?: string[];
    live?: string;
    source?: string;
}

export function ProjectCard({ project }: { project: Project }) {
    return (
    <article className="min-w-0 rounded-lg border border-neutral-300 dark:border-neutral-700 p-5 space-y-3">
      {project.images && project.images.length > 0 && (
        <ScreenshotStrip name={project.name} images={project.images} />
      )}
      <h3 className="text-lg font-semibold">{project.name}</h3>
      <p className="text-neutral-600 dark:text-neutral-400">{project.description}</p>
      <ul className="flex flex-wrap gap-2 text-sm">
        {project.tech.map((t) => (
          <li key={t} className="rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">{t}</li>
        ))}
      </ul>
      <div className="flex gap-4 text-sm font-medium">
        {project.live && <a href={project.live} className="underline">Live demo</a>}
        {project.source && <a href={project.source} className="underline">Source</a>}
      </div>
    </article>
  );
}