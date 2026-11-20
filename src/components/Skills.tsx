const skillGroups = [
  { title: "Languages", items: ["Python", "Java", "JavaScript", "TypeScript", "SQL", "Bash"] },
  { title: "AI & LLM", items: ["LangChain", "LangGraph", "LangSmith", "Gemini API", "Claude API", "Prompt Engineering", "LLM Traceability"] },
  { title: "ML & Data", items: ["Scikit-learn", "Pandas", "NumPy", "PyTorch", "Matplotlib"] },
  { title: "Web & Backend", items: ["React", "Node.js", "Next.js", "Express.js", "REST APIs"] },
  { title: "Databases", items: ["PostgreSQL", "MySQL", "MongoDB", "Redis"] },
  { title: "Cloud, DevOps & Testing", items: ["Docker", "Google Cloud Run", "Git", "Pytest"] },
];

export function Skills() {
  return (
    <section id="skills" className="py-16 space-y-6">
      <h2 className="text-3xl font-bold">Skills</h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {skillGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            <h3 className="text-lg font-semibold">{group.title}</h3>
            <ul className="flex flex-wrap gap-2 text-sm">
              {group.items.map((item) => (
                <li key={item} className="rounded-md border-2 border-black px-2 py-0.5">
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