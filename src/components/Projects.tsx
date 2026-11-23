// src/components/Projects.tsx
import { ProjectCard, type Project } from "./ProjectCard";

const projects: Project[] = [
  {
    name: "CrashCode - 🏆 1st Place Winner, Co.Hack 2026",
    description: "An AI-powered testing tool that helps identify accessibility issues in web applications by simulating different users and their interactions.\
    The tool generates detailed reports highlighting accessibility issues, their severity, and suggested fixes, enabling developers to create more inclusive web experiences.",
    tech: ["TypeScript", "Node.js", "Playwright", "WebSocket", "Claude API", "Gemini API", "React", "Docker", "Google Cloud Run"],
    images: [
      {
        src: "/projects/crashcode-landing.png",
        description: "Landing page: CrashCode sends a team of AI testers with different disabilities through your website.",
      },
      {
        src: "/projects/crashcode-example.png",
        description: "Live run: an AI persona working through a task on a real site while you watch.",
      },
      {
        src: "/projects/crashcode-runs.png",
        description: "Test runs: every persona runs in parallel, with its progress shown side by side.",
      },
      {
        src: "/projects/crashcode-report-status.png",
        description: "Report: which personas completed the task, before and after the fixes.",
      },
      {
        src: "/projects/crashcode-findings.png",
        description: "Findings: each WCAG issue with its severity, the broken code and the suggested fix.",
      },
    ],
    live: "https://crashcode.ca",
  },
  {
    name: "AFTA - Autonomous Function Testing Agent",
    description: "A LangChain agent built on Gemini that reads a Python function through an AST-based tool and drafts a pytest suite for it, with an automated evaluation harness\
    that runs each draft in a sandboxed environment and scores it. Eval-driven prompt changes raised the pass rate from 90% to 100%.",
    tech: ["Python", "LangChain", "LangSmith", "Gemini API", "Pytest", "Ruff"],
    source: "https://github.com/nhatle16/autonomous-testing-agent",
  },
];

export function Projects() {
  return (
    <section id="projects" className="py-16 space-y-6">
      <h2 className="font-grotesk text-5xl font-bold">Projects</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((p) => <ProjectCard key={p.name} project={p} />)}
      </div>
    </section>
  );
}