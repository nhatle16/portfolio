// src/components/Navbar.tsx
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b-2 border-border bg-background">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Theme toggle on the far left; ml-auto keeps the links and avatar on the right */}
        <ThemeToggle />
        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          <ul className="flex flex-wrap justify-end gap-x-1 gap-y-1 font-grotesk text-sm font-bold sm:text-lg">
            {links.map((l) => (
              <li key={l.href}>
                {/* Invisible border until hover, so the box pops in without shifting the layout */}
                <a
                  href={l.href}
                  className="block rounded-xs border-2 border-transparent px-2 py-1 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-border hover:bg-sky-200 hover:shadow-[2px_2px_0_0_var(--border)] dark:hover:bg-sky-900"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Avatar size="lg">
            <AvatarImage src="/avatar.jpg" alt="Nolan Le" />
          </Avatar>
        </div>
      </nav>
    </header>
  );
}