import type { Metadata } from "next";
import Link from "next/link";
import { satellites, satelliteNumber } from "@/lib/projects";
import PageHead from "@/components/cms/PageHead";
import ProjectLogo from "@/components/projects/ProjectLogo";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Проєкти",
  description:
    "Проєкти-сателіти Об’єднаної української діаспори в Греції: товариства, суботні школи, клуби та ініціативи.",
};

export default function Page() {
  return (
    <>
      <PageHead
        eyebrow="Проєкти-сателіти"
        title={
          <>
            Школи, клуби та ініціативи — <span className="text-sky-700">одна спільнота</span>
          </>
        }
        lead="Українські організації та проєкти Греції, які працюють під спільним дахом Об’єднання."
      />

      <section className="bg-paper pb-28 pt-6">
        <div className="shell">
          {satellites.map((p, idx) => (
            <Reveal key={p.slug} delay={Math.min(idx, 4) * 0.04}>
              <Link
                href={`/proyekty/${p.slug}`}
                className="group grid items-center gap-6 border-b border-line py-10 md:grid-cols-[4rem_1fr_13rem] md:gap-10"
              >
                <span className="font-display text-sm text-mute/70">{satelliteNumber(p.slug)}</span>
                <div>
                  <p className="eyebrow text-sky-700">{p.city}</p>
                  <h2 className="display mt-3 max-w-3xl text-[clamp(1.5rem,3vw,2.4rem)] text-ink transition-colors group-hover:text-sky-700">
                    {p.title}
                  </h2>
                  <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">{p.summary}</p>
                  <span className="link-underline mt-4 inline-block text-sm font-bold text-ink">
                    Детальніше →
                  </span>
                </div>
                <div className="hidden md:block">
                  {p.logo ? (
                    <ProjectLogo logo={p.logo} title={p.title} className="h-36" />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-paper-dim">
                      <span className="display text-4xl text-mute/40">{satelliteNumber(p.slug)}</span>
                    </div>
                  )}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
