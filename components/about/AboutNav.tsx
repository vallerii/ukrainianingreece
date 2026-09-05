"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { aboutNav } from "@/lib/about";

export default function AboutNav() {
  const [active, setActive] = useState(aboutNav[0].id);

  useEffect(() => {
    const sections = aboutNav
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );

    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Розділи сторінки"
      className="sticky top-[4.6rem] z-30 border-y border-line bg-paper/92 backdrop-blur-md"
    >
      <div className="shell">
        <ul className="-mx-1 flex gap-1 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {aboutNav.map((s) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? "true" : undefined}
                className={`relative block px-3 py-3 text-[0.82rem] font-medium tracking-tight transition-colors ${
                  active === s.id ? "text-ink" : "text-mute hover:text-ink"
                }`}
              >
                {s.label}
                {active === s.id && (
                  <motion.span
                    layoutId="about-nav-underline"
                    className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-wheat-400"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
