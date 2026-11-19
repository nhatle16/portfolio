import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4">
      <Hero />
      <About />
      <Projects />
      <Contact />
    </main>
  );
}
