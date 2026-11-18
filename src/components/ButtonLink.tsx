import Link from "next/link";

export function ButtonLink({ href, children, variant = "primary" }: {
    href: string,
    children: React.ReactNode,
    variant: "primary" | "secondary"
}) {
    const style = variant === "primary"
    ? "bg-black text-white dark:bg-white dark:text-black hover:bg-sky-700 dark:hover:bg-red-500"
    : "border border-current";
    return (
        <Link href={href}className={`inline-block rounded-md px-4 py-2 font-medium ${style}`}>
            {children}
        </Link>
    )
}
