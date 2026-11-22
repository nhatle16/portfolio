"use client";

import { Moon, Sun } from "lucide-react";

// Shows the sun in light mode and the half-moon in dark mode; clicking swaps them with a spin.
// Which icon shows is pure CSS (dark: classes), so the button renders correctly before React loads.
export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode or blocked storage: the switch still works for this visit.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="relative grid size-10 shrink-0 place-items-center rounded-xs border-2 border-border bg-background shadow-[2px_2px_0_0_var(--border)] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
      <Sun
        aria-hidden="true"
        className="absolute size-5 rotate-0 scale-100 opacity-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 dark:opacity-0"
      />
      <Moon
        aria-hidden="true"
        className="absolute size-5 rotate-90 scale-0 opacity-0 transition-all duration-500 dark:rotate-0 dark:scale-100 dark:opacity-100"
      />
    </button>
  );
}
