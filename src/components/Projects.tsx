// src/components/Projects.tsx
import { ProjectCard, type Project } from "./ProjectCard";

const projects: Project[] = [
  {
    name: "Project One",
    description: "What problem it solves and what you built, in one or two lines.",
    tech: ["Next.js", "TypeScript", "Postgres"],
    live: "https://example.com",
    source: "https://github.com/you/project-one",
  },
  // add more here
];

export function Projects() {
  return (
    <section id="projects" className="py-16 space-y-6">
      <h2 className="text-3xl font-bold">Projects</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((p) => <ProjectCard key={p.name} project={p} />)}
      </div>
    </section>
  );
}