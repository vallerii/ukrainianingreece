"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { founders, stats } from "@/lib/site";
import Reveal from "@/components/ui/Reveal";

export default function About() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % founders.length), 5200);
    return () => clearInterval(t);
  }, []);

  const active = founders[i];

  return (
    <section id="pro-nas" className="relative bg-paper py-24 md:py-32">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          {/* text */}
          <div>
            <Reveal>
              <p className="eyebrow text-sky-700">Про нас</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="display mt-5 text-[clamp(2rem,4.6vw,3.6rem)] text-ink">
                Не фонд і не земляцтво.
                <br />
                <span className="text-sky-700">Мережа спільнот</span> під одним дахом.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">
                Об'єднана українська діаспора в Греції збирає в одну структуру вже існуючі
                українські організації, школи, клуби та ініціативи. Всередині — одна точка
                входу для тих, хто шукає підтримку чи спільноту. Ззовні — один голос для
                грецької влади, медіа та партнерів.
              </p>
            </Reveal>

            <div className="mt-12 space-y-8">
              {[
                {
                  k: "Місія",
                  v: "Єднати українців у Греції, підтримувати одне одного та представляти інтереси спільноти перед грецьким суспільством і владою.",
                },
                {
                  k: "Візія",
                  v: "Простір, де кожен українець у Греції знайде підтримку, спільноту та можливість долучитися до життя діаспори.",
                },
                {
                  k: "Цінності",
                  v: "Єдність · Взаємодопомога · Збереження культури · Відкритість · Гідність",
                },
              ].map((row, idx) => (
                <Reveal key={row.k} delay={0.06 * idx}>
                  <div className="grid gap-2 border-t border-line pt-5 sm:grid-cols-[8rem_1fr] sm:gap-8">
                    <p className="eyebrow pt-1 text-mute">{row.k}</p>
                    <p className="text-[1.02rem] leading-relaxed text-ink-soft">{row.v}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1}>
              <Link
                href="/pro-nas"
                className="link-underline mt-10 inline-flex items-center gap-2 text-sm font-bold text-ink"
              >
                Повна історія та команда <span>→</span>
              </Link>
            </Reveal>
          </div>

          {/* rotating founders */}
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
                  style={{
                    background: `linear-gradient(150deg, hsl(${active.hue} 62% 46%) 0%, hsl(${
                      active.hue + 18
                    } 72% 62%) 55%, hsl(${active.hue - 12} 46% 32%) 100%)`,
                  }}
                >
                  <div className="grain" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(10,20,32,0.72)_100%)]" />
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
                    <p className="eyebrow text-white/70">Засновник</p>
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
                      key={f.name}
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
            <p className="mt-4 text-sm text-mute">
              П'ять організацій-засновників у чотирьох містах Греції.
            </p>
          </Reveal>
        </div>

        {/* stats */}
        <div className="mt-24 grid grid-cols-2 gap-y-10 border-t border-line pt-10 md:grid-cols-4">
          {stats.map((s, idx) => (
            <Reveal key={s.label} delay={idx * 0.07}>
              <p className="display text-[clamp(2.4rem,5vw,4rem)] text-sky-700">{s.value}</p>
              <p className="mt-2 max-w-[12rem] text-sm leading-snug text-mute">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
