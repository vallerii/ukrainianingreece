"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { projects } from "@/lib/site";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";

export default function Projects() {
  const [hover, setHover] = useState<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 24, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 24, mass: 0.4 });

  function onMove(e: React.MouseEvent) {
    const b = wrap.current?.getBoundingClientRect();
    if (!b) return;
    x.set(e.clientX - b.left);
    y.set(e.clientY - b.top);
  }

  return (
    <section id="proyekty" className="relative overflow-hidden bg-ink py-24 md:py-32">
      <div className="shell">
        <SectionHead
          eyebrow="Проєкти-сателіти"
          title="Школи, клуби та ініціативи, що працюють як одна спільнота"
          link="/proyekty"
          tone="dark"
        />

        <div ref={wrap} onMouseMove={onMove} className="relative">
          {/* cursor preview */}
          <AnimatePresence>
            {hover !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ x: sx, y: sy }}
                className="pointer-events-none absolute left-0 top-0 z-20 hidden lg:block"
              >
                <div
                  className="relative -ml-[11rem] -mt-[7rem] h-[14rem] w-[22rem] overflow-hidden"
                  style={{
                    background: `linear-gradient(140deg, hsl(${
                      206 + hover * 22
                    } 64% 48%), hsl(${44 - hover * 4} 88% 56%))`,
                  }}
                >
                  <div className="grain" />
                  <span className="absolute bottom-4 left-5 font-display text-5xl font-semibold text-white/85">
                    {projects[hover].n}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {projects.map((p, idx) => (
            <Reveal key={p.href} delay={idx * 0.05}>
              <Link
                href={p.href}
                onMouseEnter={() => setHover(idx)}
                onMouseLeave={() => setHover(null)}
                className="group relative block border-b border-white/12 py-8 md:py-10"
              >
                <motion.span
                  className="absolute inset-x-0 bottom-0 h-px bg-wheat-400"
                  initial={false}
                  animate={{ scaleX: hover === idx ? 1 : 0 }}
                  style={{ originX: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
                <div className="grid items-baseline gap-3 md:grid-cols-[4rem_1fr_auto] md:gap-8">
                  <span className="font-display text-sm text-white/35">{p.n}</span>
                  <div className="max-w-3xl">
                    <motion.h3
                      animate={{ x: hover === idx ? 14 : 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="display text-[clamp(1.5rem,3.2vw,2.6rem)] text-paper"
                    >
                      {p.title}
                    </motion.h3>
                    <motion.p
                      animate={{
                        x: hover === idx ? 14 : 0,
                        opacity: hover === idx ? 1 : 0.62,
                      }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-sky-100"
                    >
                      {p.text}
                    </motion.p>
                  </div>
                  <span className="flex items-center gap-5 text-[0.78rem] uppercase tracking-[0.16em] text-white/45">
                    {p.city}
                    <span className="text-lg text-wheat-400 transition-transform duration-500 group-hover:translate-x-1.5">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
