// src/components/Experience.tsx
type Job = {
  role: string;
  org: string;
  dates: string;
  points: string[];
};

const jobs: Job[] = [
  {
    role: "Teaching Assistant - CMPT 141",
    org: "University of Saskatchewan",
    dates: "Sep. 2026 - Current",
    points: [
      "Run weekly tutorials for 20+ students, explaining loops and debugging with analogies.",
      "Handle 10+ help requests a week, from IDE setup to cryptic error messages."
    ],
  },
  {
    role: "AI Evaluation Generalist (Fellow)",
    org: "Handshake AI",
    dates: "Sep. 2026 - Oct. 2026",
    points: [
      "Designed adversarial prompts to stress-test foundation models on reasoning, instruction following and safety.",
      "Flagged hallucinations and policy violations to improve post-training data for AI labs."
    ],
  },
];

export function Experience() {
  return (
    <section id="experience" className="py-16 space-y-6">
      <h2 className="text-3xl font-bold">Experience</h2>
      <ol className="space-y-6">
        {jobs.map((job) => (
          <li key={`${job.org}-${job.role}`} className="border-l-2 border-black pl-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-lg font-semibold">
                {job.role} · <span className="font-normal">{job.org}</span>
              </h3>
              <span className="text-sm">{job.dates}</span>
            </div>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              {job.points.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}