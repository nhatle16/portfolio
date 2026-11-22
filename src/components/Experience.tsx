// src/components/Experience.tsx
import { BrainCircuit, GraduationCap, type LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";

type Job = {
  role: string;
  org: string;
  dates: string;
  points: string[];
  icon: LucideIcon;
  /** Gradient for the icon tile: light-mode colours, then dark-mode ones. Full class names so Tailwind finds them. */
  bg: string;
  /** Shows the pulsing "Now" badge. */
  current?: boolean;
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
    icon: GraduationCap,
    bg: "from-sky-100 to-white dark:from-sky-950 dark:to-background",
    current: true,
  },
  {
    role: "AI Evaluation Generalist (Fellow)",
    org: "Handshake AI",
    dates: "Sep. 2026 - Oct. 2026",
    points: [
      "Designed adversarial prompts to stress-test foundation models on reasoning, instruction following and safety.",
      "Flagged hallucinations and policy violations to improve post-training data for AI labs."
    ],
    icon: BrainCircuit,
    bg: "from-violet-100 to-white dark:from-violet-950 dark:to-background",
  },
];

function NowBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xs border-2 border-border bg-background px-2 py-0.5 font-grotesk text-xs font-bold uppercase tracking-wider">
      {/* Solid dot with a pinging copy behind it; the ping stops for reduced-motion users. */}
      <span aria-hidden="true" className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      Now
      <span className="sr-only"> (current role)</span>
    </span>
  );
}

export function Experience() {
  return (
    <section id="experience" className="py-16 space-y-6">
      <h2 className="text-3xl font-bold">Experience</h2>
      <ol className="relative space-y-8">
        {/* Timeline spine, centred under the 2.5rem icon column */}
        <span aria-hidden="true" className="absolute top-2 bottom-2 left-5 w-0.5 -translate-x-1/2 bg-border" />
        {jobs.map((job, i) => (
          <li key={`${job.org}-${job.role}`} className="relative grid grid-cols-[2.5rem_1fr] gap-4 sm:gap-6">
            <div
              className={`relative grid size-10 place-items-center rounded-xs border-2 border-border bg-linear-to-br ${job.bg} shadow-[2px_2px_0_0_var(--border)]`}
            >
              <job.icon aria-hidden="true" className="size-5" />
            </div>
            <Reveal delay={i * 120}>
              {/* Same card as Skills/Contact; lifts on hover like the Contact buttons. */}
              <article className="space-y-3 rounded-xs border-2 border-border bg-background p-5 shadow-[4px_4px_0_0_var(--border)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--border)]">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <div>
                    <h3 className="font-grotesk text-lg font-bold">{job.role}</h3>
                    <p className="font-grotesk text-sm text-neutral-600 dark:text-neutral-400">
                      {job.org} · {job.dates}
                    </p>
                  </div>
                  {job.current && <NowBadge />}
                </div>
                <ul className="list-disc space-y-1 pl-5">
                  {job.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
