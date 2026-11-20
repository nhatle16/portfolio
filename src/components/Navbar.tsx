// src/components/Navbar.tsx
import Link from "next/link";

const links = [
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b-2 border-black bg-white">
      <nav aria-label="Main" className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold">Minh Nhat Le</Link>
        <ul className="flex gap-4 text-sm font-medium">
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