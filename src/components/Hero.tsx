import { ButtonLink } from "./ButtonLink";

export function Hero() {
    return (
        <section className="py-24 space-y-4">
            <h1 className="text-5xl font-bold">Minh Nhat Le</h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
                Fourth-year Computer Science student at the University of Saskatchewan.
            </p>
            <div className="flex gap-3">
                <ButtonLink href="#projects"><text>View projects</text></ButtonLink>
                <ButtonLink href="#contact" variant="secondary">Contact me</ButtonLink>
            </div>
        </section>
    )
}