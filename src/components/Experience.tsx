// src/components/Experience.tsx
type Job = {
  role: string;
  org: string;
  dates: string;
  points: string[];
};

const jobs: Job[] = [
  {
    role: "Software Developer Intern",
    org: "Company Name",
    dates: "May 2025 – Aug 2025",
    points: [
      "What you built or improved, with a number if you have one.",
      "Tech you used and the result.",
    ],
  },
  {
    role: "Teaching Assistant, CMPT 145",
    org: "University of Saskatchewan",
    dates: "Sep 2024 – Apr 2025",
    points: ["Led weekly labs for 40 students."],
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