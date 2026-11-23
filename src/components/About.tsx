// Emoji are decoration, so screen readers skip them instead of reading "waving hand" mid-sentence.
function E({ children }: { children: string }) {
  return <span aria-hidden="true">{children}</span>;
}

export function About() {
  return (
    <section id="about" className="py-16 space-y-6">
      <h2 className="font-grotesk text-5xl font-bold">About</h2>
      {/* Neobrutalist card like Contact/Skills, with a baby-blue sky gradient.
          hyphens-auto splits long words so justified lines don't get wide gaps. */}
      <div className="space-y-4 rounded-xs border-2 border-border bg-background dark:bg-[linear-gradient(to_bottom_right,#86998f,#414e6b_8%,var(--background)_40%)] p-6 text-justify hyphens-auto shadow-[4px_4px_0_0_var(--shadow-color)] sm:p-8">
        <p className="font-garamond text-lg sm:text-xl">
          Hi <E>👋</E>, I’m Nhat, but most people know me as Nolan. I’m originally from Vietnam and currently pursuing my
          bachelor’s degree in Computer Science at the University of Saskatchewan in Saskatoon, Canada.
        </p>
        <p className="font-garamond text-lg sm:text-xl">
          When I’m not coding, you’ll probably find me reading <E>📚</E>, playing video games <E>🎮</E> or listening to
          music <E>🎧</E>. I also hit the gym <E>🏋️</E> and play badminton <E>🏸</E>, which keep me focused and energized
          alongside my studies. Another fact about me is that I’m a coffee person <E>☕</E>: a cold brew or a latte with a
          good playlist is my favourite way to start the day.
        </p>
        <p className="font-garamond text-lg sm:text-xl">
          Lately, I’ve been exploring the world of AI agents <E>🤖</E> and LLMs, and how they’re used in software
          development, research and everyday life. I find it fascinating how AI can automate tasks and boost productivity.
          There are still plenty of challenges to solve, and I’m excited to dig deeper!
        </p>
        <p className="font-garamond text-lg sm:text-xl">
          If you ever want to chat <E>💬</E> about science, technology or anything else, I’m always down. Feel free to
          reach out by email or connect with me on LinkedIn!
        </p>
      </div>
    </section>
  );
}
