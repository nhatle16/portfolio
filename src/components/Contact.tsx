// External profiles open in a new tab; the email link opens the visitor's mail app instead.
const external = [
  { href: "https://github.com/nhatle16", label: "My GitHub" },
  { href: "https://linkedin.com/in/minhnhatle1", label: "My LinkedIn" },
];

export function Contact() {
    return (
    <section id="contact" className="py-16 space-y-4">
      <h2 className="text-3xl font-bold">Contact</h2>
      <p>Built something cool or spotted an interesting edge case in one of my repos? Let’s connect. I’m always open to collaborating on open-source tooling or discussing exciting opportunities.</p>
      <ul className="flex flex-wrap gap-4 font-medium">
        <li><a className="underline" href="mailto:mnhat.dev@gmail.com">My Gmail</a></li>
        {external.map((l) => (
          <li key={l.href}>
            <a className="underline" href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
