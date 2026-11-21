// src/components/Projects.tsx
import { ProjectCard, type Project } from "./ProjectCard";

const projects: Project[] = [
  {
    name: "CrashCode - 🏆 1st Place Winner, Co.Hack 2026",
    description: "An AI-powered testing tool that helps identify accessibility issues in web applications by simulating different users and their interactions.",
    tech: ["TypeScript", "Node.js", "Playwright", "WebSocket", "Claude API", "Gemini API", "React", "Docker", "Google Cloud Run"],
    images: [
      "/projects/crashcode-landing.png",
      "/projects/crashcode-example.png",
      "/projects/crashcode-runs.png",
      "/projects/crashcode-report-status.png",
      "/projects/crashcode-findings.png",
    ],
    live: "https://crashcode.ca",
    source: "https://github.com/you/project-one",
  },
  {
    name: "AFTA",
    description: "A LangChain agent that turns a Python function into a pytest draft without ever running the code. 96% of generated drafts parse, checked by its own eval harness.",
    tech: ["Python", "LangChain", "LangSmith", "Gemini API", "Pytest", "Ruff"],
    live: "",
    source: "https://github.com/nhatle16/autonomous-testing-agent",
  },
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