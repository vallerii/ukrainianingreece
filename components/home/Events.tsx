"use client";

import Link from "next/link";
import { events } from "@/lib/site";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";

export default function Events() {
  return (
    <section id="podiyi" className="bg-paper py-24 md:py-32">
      <div className="shell">
        <SectionHead
          eyebrow="Прийдешні події"
          title="Календар спільноти"
          link="/podiyi"
          linkLabel="Усі події та звіти"
        />

        <div>
          {events.map((e, idx) => (
            <Reveal key={e.title} delay={idx * 0.05}>
              <Link href={e.href} className="group relative block overflow-hidden border-b border-line">
                <span className="absolute inset-0 z-0 origin-bottom scale-y-0 bg-sky-deep transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100" />
                <div className="relative z-10 grid items-center gap-4 py-7 md:grid-cols-[8.5rem_1fr_auto] md:gap-10 md:py-9">
                  <div className="flex items-baseline gap-3 md:block">
                    <p className="display text-[2.6rem] leading-none text-ink transition-colors duration-500 group-hover:text-wheat-400 md:text-[3.4rem]">
                      {e.day}
                    </p>
                    <p className="mt-1 text-sm text-mute transition-colors duration-500 group-hover:text-white/70">
                      {e.month} {e.year}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow text-sky-700 transition-colors duration-500 group-hover:text-wheat-400">
                      {e.tag}
                    </p>
                    <h3 className="mt-2 max-w-2xl font-display text-[1.15rem] font-semibold leading-snug tracking-tight text-ink transition-colors duration-500 group-hover:text-paper md:text-[1.5rem]">
                      {e.title}
                    </h3>
                    <p className="mt-2 text-sm text-mute transition-colors duration-500 group-hover:text-sky-100">
                      {e.place} · {e.time}
                    </p>
                  </div>
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink transition-all duration-500 group-hover:translate-x-1.5 group-hover:text-wheat-400">
                    Деталі <span>→</span>
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
