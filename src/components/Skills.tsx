const skillGroups = [
  { title: "Languages", items: ["TypeScript", "JavaScript", "Python", "Java", "C", "SQL"] },
  { title: "Frameworks", items: ["React", "Next.js", "Node.js", "Tailwind CSS"] },
  { title: "Tools", items: ["Git", "Docker", "PostgreSQL", "Linux", "VS Code"] },
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