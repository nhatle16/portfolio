import { BrainCircuit, ChartLine, CloudCog, CodeXml, Database, Server } from "lucide-react";

// bg: gradient start/end colours for each card, light mode first, then dark mode.
// Write full class names (no string building) so Tailwind can find them.
const skillGroups = [
  { title: "Languages", icon: CodeXml, bg: "from-sky-100 to-white dark:from-sky-950 dark:to-background", items: ["Python", "Java", "JavaScript", "TypeScript", "SQL", "Bash"] },
  { title: "AI & LLM", icon: BrainCircuit, bg: "from-violet-100 to-white dark:from-violet-950 dark:to-background", items: ["LangChain", "LangGraph", "LangSmith", "Gemini API", "Claude API", "Prompt Engineering", "LLM Traceability"] },
  { title: "ML & Data", icon: ChartLine, bg: "from-amber-100 to-white dark:from-amber-950 dark:to-background", items: ["Scikit-learn", "Pandas", "NumPy", "PyTorch", "Matplotlib"] },
  { title: "Web & Backend", icon: Server, bg: "from-emerald-100 to-white dark:from-emerald-950 dark:to-background", items: ["React", "Node.js", "Next.js", "Express.js", "REST APIs"] },
  { title: "Databases", icon: Database, bg: "from-rose-100 to-white dark:from-rose-950 dark:to-background", items: ["PostgreSQL", "MySQL", "MongoDB", "Redis"] },
  { title: "Cloud, DevOps & Testing", icon: CloudCog, bg: "from-indigo-100 to-white dark:from-indigo-950 dark:to-background", items: ["Docker", "Google Cloud Run", "Git", "Pytest"] },
];

export function Skills() {
  return (
    <section id="skills" className="py-16 space-y-6">
      <h2 className="text-3xl font-bold">Skills</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group) => (
          // Same neobrutalist card as ProjectCard: thick border, hard shadow.
          <div
            key={group.title}
            className={`space-y-3 rounded-xs border-2 border-border bg-linear-to-br ${group.bg} p-4 shadow-[4px_4px_0_0_var(--border)]`}
          >
            <h3 className="flex items-center gap-2 font-grotesk text-lg font-bold">
              <group.icon aria-hidden="true" className="size-5 shrink-0" />
              {group.title}
            </h3>
            <ul className="flex flex-wrap gap-2 font-grotesk text-sm font-medium">
              {group.items.map((item) => (
                <li key={item} className="rounded-xs border-2 border-border px-2 py-0.5">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}