"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { mission, values, vision } from "@/lib/about";
import type { Founder } from "@/lib/organizations";
import Reveal from "@/components/ui/Reveal";

export default function About({
  founders,
  stats,
}: {
  founders: Founder[];
  stats: { value: string; label: string }[];
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % Math.max(1, founders.length)), 5200);
    return () => clearInterval(t);
  }, [founders.length]);

  const active = founders[i] ?? founders[0];

  return (
    <section id="pro-nas" className="relative bg-paper py-12 md:py-16">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.75fr] lg:gap-16">
          {/* text */}
          <div>
            <Reveal>
              <p className="eyebrow text-sky-700">Про нас</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="display mt-3 max-w-2xl text-[clamp(1.6rem,3.3vw,2.6rem)] text-ink">
                <span className="text-sky-700">Мережа українських організацій та спільнот</span> в Греції,
                об’єднаних спільними цінностями та прагненнями.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
                Ми сприяємо співпраці й взаємопідтримці, допомагаємо українцям знаходити необхідні
                ресурси та представляємо інтереси громади у діалозі з грецькою владою, медіа й
                партнерами.
              </p>
            </Reveal>

            <div className="mt-8 space-y-5">
              {[
                { k: "Місія", v: mission },
                { k: "Візія", v: vision },
                { k: "Цінності", v: values.map((x) => x.k).join(" · ") },
              ].map((row, idx) => (
                <Reveal key={row.k} delay={0.06 * idx}>
                  <div className="grid gap-1.5 border-t border-line pt-4 sm:grid-cols-[7rem_1fr] sm:gap-6">
                    <p className="eyebrow pt-1 text-mute">{row.k}</p>
                    <p className="text-[1.02rem] leading-relaxed text-ink">{row.v}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1}>
              <Link
                href="/pro-nas"
                className="link-underline mt-8 inline-flex items-center gap-2 text-sm font-bold text-ink"
              >
                Повна історія та команда <span>→</span>
              </Link>
            </Reveal>
            {/* цифри — під текстом, щоб не висіли окремим рядком */}
            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-6">
              {stats.map((s, idx) => (
                <Reveal key={s.label} delay={idx * 0.07}>
                  <p className="display text-[clamp(2.2rem,4.4vw,3.2rem)] leading-none text-sky-700">{s.value}</p>
                  <p className="mt-2 text-sm leading-snug text-mute">{s.label}</p>
                </Reveal>
              ))}
            </div>
          </div>

          {/* rotating founders */}
          {active && (
          <Reveal delay={0.12} className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper-dim">
              <AnimatePresence mode="sync">
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(165deg, #12579F 0%, #0B3F7E 55%, #062E5F 100%)" }}
                >
                  <div className="grain" />
                  {/* логотип засновника, якщо є */}
                  {active.logo && (
                    <div className="absolute inset-x-[16%] top-[9%] flex aspect-square items-center justify-center rounded-full bg-white p-[12%] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]">
                      <Image
                        src={active.logo.src}
                        alt=""
                        width={active.logo.width}
                        height={active.logo.height}
                        sizes="240px"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(180deg,transparent_0%,rgba(6,20,40,0.65)_100%)]" />
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-x-0 bottom-0 p-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.name}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="eyebrow text-white/70">{active.role}</p>
                    <Link
                      href={active.href}
                      className="link-underline mt-2 block font-display text-2xl font-semibold text-white"
                    >
                      {active.name}
                    </Link>
                    <p className="mt-1 text-sm text-white/75">{active.city}</p>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-6 flex gap-1.5">
                  {founders.map((f, idx) => (
                    <button
                      key={f.href}
                      onClick={() => setI(idx)}
                      aria-label={f.name}
                      className="h-0.5 flex-1 overflow-hidden bg-white/25"
                    >
                      <motion.span
                        className="block h-full bg-wheat-400"
                        initial={false}
                        animate={{ width: idx === i ? "100%" : "0%" }}
                        transition={{ duration: idx === i ? 5 : 0.3, ease: "linear" }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
          )}
        </div>

      </div>
    </section>
  );
}
