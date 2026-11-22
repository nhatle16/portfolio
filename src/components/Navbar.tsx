// src/components/Navbar.tsx
import Link from "next/link";
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
    <header className="sticky top-0 z-10 border-b-2 border-foreground bg-background">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* name hidden on phones so the five links fit on one line */}
        <Link href="/" className="hidden font-bold sm:block">Nolan Le</Link>
        {/* ml-auto keeps this group on the right even when the name is hidden */}
        <div className="ml-auto flex items-center gap-4">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:underline">{l.label}</a>
              </li>
            ))}
          </ul>
          <ThemeToggle />
          <Avatar size="lg">
            <AvatarImage src="/avatar.jpg" alt="Nolan Le" />
          </Avatar>
        </div>
      </nav>
    </header>
  );
}