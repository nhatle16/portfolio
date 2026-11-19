import Link from "next/link";

export function ButtonLink({ href, children, variant = "primary" }: {
    href: string,
    children: React.ReactNode,
    variant?: "primary" | "secondary"
}) {
    const style = variant === "primary"
    ? "bg-black text-white dark:bg-white dark:text-black hover:bg-sky-700 dark:hover:bg-green-400"
    : "border border-current hover:bg-neutral-100 dark:hover:bg-neutral-700";
    return (
        <Link href={href}className={`inline-block rounded-md px-4 py-2 font-medium ${style}`}>
            {children}
        </Link>
    );
}
