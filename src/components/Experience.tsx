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
      "Led weekly tutorials for 20+ undergraduate students, breaking down loops, debugging and other fundamental programming concepts using analogies.",
      "Resolved 10+ help requests per week in lab and by email to help configuring IDE, explaining syntax and errors, aiding coding exercises and clarifying specific assignment concerns.",
      "Received positive student feedback on clarity of explanation."
    ],
  },
  {
    role: "AI Evaluation Generalist (Fellow)",
    org: "Handshake AI",
    dates: "Sep. 2026 - Oct. 2026",
    points: [
        "Evaluated and benchmarked multimodal model outputs (text, image, and video) across instruction fidelity, semantic consistency, and visual artifacts to inform model alignment.",
        "Designed adversarial prompts and edge-case scenarios to evaluate foundation models across multi-step reasoning, instruction following, and safety benchmarks.",
        "Systematically identified safety policy violations, semantic hallucinations, and rendering flaws to refine post-training data pipelines for partner AI research labs."
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