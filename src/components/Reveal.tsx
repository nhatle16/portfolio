"use client";

import { useEffect, useRef } from "react";

// Fades and slides its children in the first time they scroll into view.
// The hidden state is only set after mount, so the server HTML (and no-JS visitors) see everything.
// The transition only runs on the way in (data-[reveal=shown]), so hiding on mount is instant, not a fade-out.
export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.reveal = "hidden";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = "shown";
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className="data-[reveal=hidden]:translate-y-6 data-[reveal=hidden]:opacity-0 data-[reveal=shown]:transition data-[reveal=shown]:duration-700 data-[reveal=shown]:ease-out motion-reduce:data-[reveal=hidden]:translate-y-0 motion-reduce:data-[reveal=hidden]:opacity-100"
    >
      {children}
    </div>
  );
}
