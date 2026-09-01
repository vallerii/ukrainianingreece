"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Reveal from "@/components/ui/Reveal";

export default function JoinCta() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-wheat-400">
      <motion.div
        style={{ y }}
        className="absolute inset-x-0 -top-1/4 h-[150%] bg-[radial-gradient(60%_50%_at_78%_30%,rgba(255,255,255,0.55),transparent_70%)]"
      />
      <div className="grain" />

      <div className="shell relative py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <Reveal>
              <p className="eyebrow text-wheat-700">Долучитися</p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="display mt-5 max-w-3xl text-[clamp(2.1rem,5.4vw,4.2rem)] text-ink">
                Спільнота — це люди, які прийшли й залишились.
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75">
                Приєднуйтесь як волонтер, організація-партнер або донор. Або просто напишіть
                нам — якщо потрібна допомога чи порада.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.16}>
            <div className="flex flex-col gap-4">
              {[
                { label: "Підтримати донатом", href: "/pidtrymaty", primary: true },
                { label: "Стати волонтером", href: "/kontakty" },
                { label: "Долучити організацію", href: "/kontakty" },
              ].map((b) => (
                <Link
                  key={b.label}
                  href={b.href}
                  className={`group flex items-center justify-between gap-6 border-b border-ink/25 py-4 text-[1.05rem] font-semibold tracking-tight transition-colors ${
                    b.primary ? "text-ink" : "text-ink/75 hover:text-ink"
                  }`}
                >
                  {b.label}
                  <span className="text-xl transition-transform duration-300 group-hover:translate-x-1.5">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
