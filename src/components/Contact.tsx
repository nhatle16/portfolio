export function Contact() {
    return (
    <section id="contact" className="py-16 space-y-4">
      <h2 className="text-3xl font-bold">Contact</h2>
      <p>Open to internships and new-grad roles. The fastest way to reach me is email.</p>
      <ul className="flex flex-wrap gap-4 font-medium">
        <li><a className="underline" href="mailto:you@example.com">you@example.com</a></li>
        <li><a className="underline" href="https://github.com/your-username">GitHub</a></li>
        <li><a className="underline" href="https://linkedin.com/in/your-username">LinkedIn</a></li>
      </ul>
    </section>
  );
}