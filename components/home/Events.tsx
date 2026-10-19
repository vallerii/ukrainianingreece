import type { CmsEvent } from "@/lib/cms";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";
import EventCards from "./EventCards";

/** Скільки карток у календарі на головній: 2 ряди по 4 (правка клієнта 18.10.2026). */
const SLOTS = 8;

/**
 * Календар подій (з DatoCMS). Спершу прийдешні; якщо їх менше восьми —
 * добираємо нещодавні минулі (позначені «Відбулося»), щоб сітка не зяяла.
 */
export default function Events({ upcoming, recent }: { upcoming: CmsEvent[]; recent: CmsEvent[] }) {
  // подія, що триває кілька днів (напр. школа іконопису), є і серед прийдешніх, і серед «минулих
  // за датою початку» — показуємо її один раз; з минулих беремо лише ті, що справді завершилися
  const seen = new Set(upcoming.map((e) => e.id));
  const past = recent.filter((e) => e.status === "past" && !seen.has(e.id));
  const cards = [...upcoming, ...past].slice(0, SLOTS);

  return (
    <section id="podiyi" className="bg-paper py-12 md:py-16">
      <div className="shell">
        <SectionHead
          eyebrow={upcoming.length > 0 ? "Прийдешні події" : "Події"}
          title="Календар подій"
          link="/podiyi"
          linkLabel="Усі події та звіти"
        />

        {cards.length > 0 ? (
          <EventCards events={cards} />
        ) : (
          <Reveal>
            <div className="py-10">
              <p className="display text-[clamp(1.2rem,2vw,1.5rem)] text-ink">Нові події зараз плануються.</p>
              <p className="mt-2 max-w-xl leading-relaxed text-mute">
                Стежте за анонсами в соцмережах або загляньте сюди трохи згодом.
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
