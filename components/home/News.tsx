"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { news } from "@/lib/site";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";

function Visual({ hue, tall = false }: { hue: number; tall?: boolean }) {
  return (
    <div
      className={`relative w-full overflow-hidden ${tall ? "aspect-[16/10]" : "aspect-[4/3]"}`}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(145deg, hsl(${hue} 58% 44%), hsl(${hue + 26} 76% 62%) 60%, hsl(${
            hue - 16
          } 40% 28%))`,
        }}
        whileHover={{ scale: 1.045 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="grain" />
    </div>
  );
}

export default function News() {
  const [lead, ...rest] = news;

  return (
    <section id="novyny" className="bg-paper-dim py-24 md:py-32">
      <div className="shell">
        <SectionHead eyebrow="Новини" title="Що відбувається у спільноті" link="/novyny" />

        <div className="grid gap-14 pt-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <Reveal>
            <Link href={lead.href} className="group block">
              <Visual hue={lead.hue} tall />
              <p className="mt-6 flex items-center gap-4 text-[0.72rem] uppercase tracking-[0.18em] text-mute">
                <span className="text-sky-700">{lead.tag}</span>
                <span className="h-px w-8 bg-line" />
                {lead.date}
              </p>
              <h3 className="display mt-4 max-w-xl text-[clamp(1.6rem,3vw,2.4rem)] text-ink transition-colors group-hover:text-sky-700">
                {lead.title}
              </h3>
              <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">{lead.text}</p>
              <span className="link-underline mt-5 inline-block text-sm font-bold text-ink">
                Читати далі →
              </span>
            </Link>
          </Reveal>

          <div className="flex flex-col justify-start gap-10">
            {rest.map((n, idx) => (
              <Reveal key={n.title} delay={0.08 * (idx + 1)}>
                <Link
                  href={n.href}
                  className="group grid gap-5 border-t border-line pt-8 sm:grid-cols-[9rem_1fr] sm:gap-7"
                >
                  <div className="max-w-[9rem]">
                    <Visual hue={n.hue} />
                  </div>
                  <div>
                    <p className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.18em] text-mute">
                      <span className="text-sky-700">{n.tag}</span>
                      {n.date}
                    </p>
                    <h3 className="mt-2.5 font-display text-[1.15rem] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-sky-700">
                      {n.title}
                    </h3>
                    <p className="mt-2.5 text-[0.92rem] leading-relaxed text-mute">{n.text}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
