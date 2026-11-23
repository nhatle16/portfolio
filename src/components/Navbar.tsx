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
                {/* Underline is an ::after bar that grows out from the middle on hover or keyboard focus */}
                <a
                  href={l.href}
                  className="relative block px-2 py-1 after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:after:transition-none"
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