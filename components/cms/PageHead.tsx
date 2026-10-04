import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";

/** Шапка внутрішньої сторінки — той самий світлий градієнт, що й на «Про нас». */
export default function PageHead({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-paper-dim pb-14 pt-40 md:pb-16 md:pt-44">
      <div className="absolute inset-0 bg-[radial-gradient(72%_90%_at_88%_0%,rgba(255,201,60,0.30),transparent_66%),radial-gradient(58%_80%_at_2%_8%,rgba(42,123,209,0.12),transparent_62%)]" />
      <div className="grain" />
      <div className="shell relative">
        <Reveal>
          <div className="eyebrow text-sky-700">{eyebrow}</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="display mt-5 max-w-4xl text-[clamp(2.2rem,5.6vw,4.4rem)] text-ink">
            {title}
          </h1>
        </Reveal>
        {lead && (
          <Reveal delay={0.1}>
            <div className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-soft">{lead}</div>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
