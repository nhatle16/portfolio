import { BrainCircuit, ChartLine, CloudCog, CodeXml, Database, Server } from "lucide-react";

const skillGroups = [
  { title: "Languages", icon: CodeXml, items: ["Python", "Java", "JavaScript", "TypeScript", "SQL", "Bash"] },
  { title: "AI & LLM", icon: BrainCircuit, items: ["LangChain", "LangGraph", "LangSmith", "Gemini API", "Claude API", "Prompt Engineering", "LLM Traceability"] },
  { title: "ML & Data", icon: ChartLine, items: ["Scikit-learn", "Pandas", "NumPy", "PyTorch", "Matplotlib"] },
  { title: "Web & Backend", icon: Server, items: ["React", "Node.js", "Next.js", "Express.js", "REST APIs"] },
  { title: "Databases", icon: Database, items: ["PostgreSQL", "MySQL", "MongoDB", "Redis"] },
  { title: "Cloud, DevOps & Testing", icon: CloudCog, items: ["Docker", "Google Cloud Run", "Git", "Pytest"] },
];

export function Skills() {
  return (
    <section id="skills" className="py-16 space-y-6">
      <h2 className="font-grotesk text-5xl font-bold">Skills</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group) => (
          // Same neobrutalist card as ProjectCard: thick border, hard shadow. Light mode: "Cloud Circuit" lime to
          // cyan, lime-100 and cyan-100 each lightened toward white (50%, then 30%, 15% and 20% more). Dark mode: the top-left corner glows "Starlight Dusk" sage and slate blue.
          <div
            key={group.title}
            className={`space-y-3 rounded-xs border-2 border-border bg-linear-to-br from-[#fbfef3] to-[#f4feff] dark:bg-[linear-gradient(to_bottom_right,#9fb0ab,#6b7a96_10%,var(--background)_35%)] p-4 shadow-[4px_4px_0_0_var(--shadow-color)]`}
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
