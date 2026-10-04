import Link from "next/link";
import type { CmsEvent } from "@/lib/cms";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";
import EventRow from "@/components/cms/EventRow";

/**
 * Прийдешні події (з DatoCMS). Якщо найближчих подій немає —
 * секція не зникає: показуємо, що відбулося нещодавно, і ведемо до звітів.
 */
export default function Events({ upcoming, recent }: { upcoming: CmsEvent[]; recent: CmsEvent[] }) {
  const hasUpcoming = upcoming.length > 0;

  return (
    <section id="podiyi" className="bg-paper py-24 md:py-32">
      <div className="shell">
        <SectionHead
          eyebrow={hasUpcoming ? "Прийдешні події" : "Події"}
          title="Календар спільноти"
          link="/podiyi"
          linkLabel="Усі події та звіти"
        />

        {hasUpcoming ? (
          <div>
            {upcoming.map((e, idx) => (
              <Reveal key={e.id} delay={idx * 0.05}>
                <EventRow event={e} />
              </Reveal>
            ))}
          </div>
        ) : (
          <>
            <Reveal>
              <div className="grid gap-6 border-b border-line py-10 md:grid-cols-[8.5rem_1fr] md:gap-10">
                <p className="eyebrow pt-1 text-mute">Незабаром</p>
                <div>
                  <p className="display text-[clamp(1.3rem,2.4vw,1.8rem)] text-ink">
                    Нові події зараз плануються.
                  </p>
                  <p className="mt-3 max-w-xl leading-relaxed text-mute">
                    Стежте за анонсами в соцмережах або загляньте сюди трохи згодом.
                  </p>
                </div>
              </div>
            </Reveal>
            {recent.length > 0 && (
              <>
                <Reveal>
                  <p className="eyebrow mt-14 text-sky-700">Нещодавно відбулися</p>
                </Reveal>
                <div className="mt-2">
                  {recent.map((e, idx) => (
                    <Reveal key={e.id} delay={idx * 0.05}>
                      <EventRow event={e} compact />
                    </Reveal>
                  ))}
                </div>
                <Reveal>
                  <Link
                    href="/podiyi/zvity"
                    className="link-underline mt-8 inline-block text-sm font-bold text-ink"
                  >
                    Архів подій і звітів →
                  </Link>
                </Reveal>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
