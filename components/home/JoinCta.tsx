"use client";

import Link from "@/components/i18n/Link";
import DonateLink from "@/components/donate/DonateLink";
import FormLink from "@/components/forms/FormLink";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Reveal from "@/components/ui/Reveal";
import { useT } from "@/components/i18n/I18nProvider";

export default function JoinCta() {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section id="doluchytysia" ref={ref} className="relative overflow-hidden bg-wheat-400">
      <motion.div
        style={{ y }}
        className="absolute inset-x-0 -top-1/4 h-[150%] bg-[radial-gradient(60%_50%_at_78%_30%,rgba(255,255,255,0.55),transparent_70%)]"
      />
      <div className="grain" />

      <div className="shell relative py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <Reveal>
              <p className="eyebrow text-wheat-700">{t.join.eyebrow}</p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="display mt-3 max-w-3xl text-[clamp(1.68rem,4.32vw,3.36rem)] text-ink">
                {t.join.title}
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/75">
                {t.join.lead}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.16}>
            <div className="flex flex-col gap-4">
              {[
                { label: t.join.donate, href: "/pidtrymaty", primary: true },
                { label: t.join.volunteer, href: "#volunteer" },
                { label: t.join.org, href: "#organization" },
              ].map((b) => (
                <ButtonOrDonate
                  key={b.label}
                  href={b.href}
                  className={`group flex items-center justify-between gap-6 border-b border-ink/25 py-3 text-[1.05rem] font-semibold tracking-tight transition-colors ${
                    b.primary ? "text-ink" : "text-ink/75 hover:text-ink"
                  }`}
                >
                  {b.label}
                  <span className="text-xl transition-transform duration-300 group-hover:translate-x-1.5">
                    →
                  </span>
                </ButtonOrDonate>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Усі три кнопки відкривають попапи: донат, форма волонтера, форма організації. */
function ButtonOrDonate({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  if (href === "/pidtrymaty") return <DonateLink className={className}>{children}</DonateLink>;
  if (href === "#volunteer" || href === "#organization")
    return (
      <FormLink kind={href.slice(1) as "volunteer" | "organization"} className={className}>
        {children}
      </FormLink>
    );
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
