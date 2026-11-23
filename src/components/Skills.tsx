import { BrainCircuit, ChartLine, CloudCog, CodeXml, Database, Server } from "lucide-react";

// bg: each card's light-mode gradient start colour (it fades to white). Full class names so Tailwind finds them.
const skillGroups = [
  { title: "Languages", icon: CodeXml, bg: "from-sky-100", items: ["Python", "Java", "JavaScript", "TypeScript", "SQL", "Bash"] },
  { title: "AI & LLM", icon: BrainCircuit, bg: "from-violet-50", items: ["LangChain", "LangGraph", "LangSmith", "Gemini API", "Claude API", "Prompt Engineering", "LLM Traceability"] },
  { title: "ML & Data", icon: ChartLine, bg: "from-amber-50", items: ["Scikit-learn", "Pandas", "NumPy", "PyTorch", "Matplotlib"] },
  { title: "Web & Backend", icon: Server, bg: "from-emerald-50", items: ["React", "Node.js", "Next.js", "Express.js", "REST APIs"] },
  { title: "Databases", icon: Database, bg: "from-rose-100", items: ["PostgreSQL", "MySQL", "MongoDB", "Redis"] },
  { title: "Cloud, DevOps & Testing", icon: CloudCog, bg: "from-indigo-100", items: ["Docker", "Google Cloud Run", "Git", "Pytest"] },
];

export function Skills() {
  return (
    <section id="skills" className="py-16 space-y-6">
      <h2 className="font-grotesk text-5xl font-bold">Skills</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group) => (
          // Same neobrutalist card as ProjectCard: thick border, hard shadow. Light mode: a soft per-card pastel
          // fading to white. Dark mode: the top-left corner glows "Starlight Dusk" sage and slate blue.
          <div
            key={group.title}
            className={`space-y-3 rounded-xs border-2 border-border bg-linear-to-br ${group.bg} to-white dark:bg-[linear-gradient(to_bottom_right,#9fb0ab,#6b7a96_10%,var(--background)_35%)] p-4 shadow-[4px_4px_0_0_var(--shadow-color)]`}
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
