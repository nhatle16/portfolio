// src/components/Navbar.tsx
import Link from "next/link";

const links = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b-2 border-black bg-white">
      <nav aria-label="Main" className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        {/* name hidden on phones so the five links fit on one line */}
        <Link href="/" className="hidden font-bold sm:block">Nolan Le</Link>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="hover:underline">{l.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}