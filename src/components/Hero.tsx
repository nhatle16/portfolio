import Image from "next/image";

const links = [
    { href: "https://github.com/nhatle16", label: "GitHub" },
    { href: "https://linkedin.com/in/minhnhatle1", label: "LinkedIn" },
    { href: "mailto:mnhat.dev@gmail.com", label: "Email" },
];

const link = "font-medium text-sky-700 underline decoration-2 underline-offset-4 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300";

export function Hero() {
    return (
        <section className="grid items-center gap-10 py-20 sm:py-28 md:grid-cols-[auto_1fr] md:gap-16">
            {/* The photo is portrait, so the square shows only part of its height. object-bottom keeps
                the bottom square and drops the sky; object-[50%_80%] would keep a little more sky. */}
            <div className="size-60 overflow-hidden rounded-xs border-2 border-border shadow-[6px_6px_0_0_var(--border)] sm:size-72">
                <Image
                    src="/picture.jpg"
                    alt="Nolan Le"
                    width={900}
                    height={1200}
                    sizes="288px"
                    priority
                    className="size-full object-cover object-bottom"
                />
            </div>
            <div className="space-y-5 text-lg sm:text-xl">
                <h1 className="font-grotesk text-5xl font-bold sm:text-6xl">Minh Nhat (Nolan) Le</h1>
                <p className="font-garamond text-xl sm:text-2xl">I am a Computer Science Honours student at the University of Saskatchewan, graduating in April 2027.</p>
                <p className="font-garamond text-xl sm:text-2xl">I am currently a Teaching Assistant for CMPT 141.</p>
                <p className="font-garamond text-xl sm:text-2xl">
                    I build AI agents that break things on purpose (websites, code, models) so real users don&apos;t
                    have to. Take a look at my <a href="#projects" className={link}>projects</a>.
                </p>
                <p className="pt-2">
                    {links.map((l, i) => (
                        <span key={l.href}>
                            {i > 0 && " / "}
                            {l.href.startsWith("http") ? (
                                <a href={l.href} target="_blank" rel="noopener noreferrer" className={link}>
                                    {l.label}<span className="sr-only"> (opens in a new tab)</span>
                                </a>
                            ) : (
                                <a href={l.href} className={link}>{l.label}</a>
                            )}
                        </span>
                    ))}
                </p>
            </div>
        </section>
    )
}
