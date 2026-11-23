export function About() {
  return (
    <section id="about" className="py-16 space-y-6">
      <h2 className="text-3xl font-bold">About</h2>
      {/* Neobrutalist card like Contact/Skills, with a warm amber-to-rose gradient.
          hyphens-auto splits long words so justified lines don't get wide gaps. */}
      <div className="space-y-4 rounded-xs border-2 border-border bg-linear-to-br from-amber-100 via-rose-50 to-white p-6 text-justify hyphens-auto shadow-[4px_4px_0_0_var(--border)] dark:from-amber-950 dark:via-rose-950 dark:to-background sm:p-8">
        <p>
          Hi, I’m Nhat, but most people know me as Nolan. I’m originally from Vietnam and currently pursuing my
          bachelor’s degree in Computer Science at the University of Saskatchewan in Saskatoon, Canada.
        </p>
        <p>
          When I’m not coding, you’ll probably find me reading, playing video games or listening to music. I also hit
          the gym and play badminton, which keep me focused and energized alongside my studies. Another fact about me is that
          I’m a coffee person: a cold brew or a latte with a good playlist is my favourite way to start the day.
        </p>
        <p>
          Lately, I’ve been exploring the world of AI agents and LLMs, and how they’re used in software development,
          research and everyday life. I find it fascinating how AI can automate tasks and boost productivity.
          There are still plenty of challenges to solve, and I’m excited to dig deeper!
        </p>
        <p>
          If you ever want to chat about science, technology or anything else, I’m always down. Feel free to reach
          out by email or connect with me on LinkedIn!
        </p>
      </div>
    </section>
  );
}
