import { ButtonLink } from "./ButtonLink";

export function Hero() {
    return (
        <section className="py-24 space-y-4">
            <h1 className="text-5xl font-bold">Minh Nhat (Nolan) Le</h1>
            <p className="text-xl">
                I build AI agents that break things on purpose (websites, code, models) so real users don&apos;t have to.
            </p>
            <p className="text-neutral-600">
                Computer Science Honours @ University of Saskatchewan · Graduating Apr 2027
            </p>
            <div className="flex gap-3">
                <ButtonLink href="#projects">View projects</ButtonLink>
                <ButtonLink href="#contact" variant="secondary">Contact me</ButtonLink>
            </div>
        </section>
    )
}
