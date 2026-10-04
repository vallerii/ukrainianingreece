import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent, getEventSlugs, getUpcomingEvents, statusLabel, type CmsEvent } from "@/lib/cms";
import { formatRange } from "@/lib/format";
import PageHead from "@/components/cms/PageHead";
import RichText from "@/components/cms/RichText";
import Cover from "@/components/cms/Cover";
import EventRow from "@/components/cms/EventRow";
import SectionHead from "@/components/ui/SectionHead";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getEventSlugs()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEvent((await params).slug);
  if (!event) return {};
  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: event.image ? [{ url: event.image.url }] : undefined,
    },
  };
}

const utc = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, "");

function calendarLink(e: CmsEvent) {
  const end = e.finish ?? new Date(new Date(e.start).getTime() + 2 * 3600_000).toISOString();
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${utc(e.start)}/${utc(end)}`,
    details: e.description,
    ...(e.location ? { location: `${e.location.latitude},${e.location.longitude}` } : {}),
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

const badgeTone = {
  upcoming: "bg-sky-700 text-paper",
  ongoing: "bg-wheat-400 text-ink",
  past: "bg-ink/8 text-ink-soft",
} as const;

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const [event, upcoming] = await Promise.all([getEvent(slug), getUpcomingEvents(1, null, 4)]);
  if (!event) notFound();

  const past = event.status === "past";
  const loc = event.location;
  const next = upcoming.items.filter((e) => e.id !== event.id).slice(0, 3);

  return (
    <>
      <PageHead
        eyebrow={
          <span className="flex flex-wrap items-center gap-4">
            <Link href={past ? "/podiyi/zvity" : "/podiyi"} className="hover:text-ink">
              ← {past ? "Звіти" : "Події"}
            </Link>
            <span className={`rounded-full px-3 py-1 text-[0.65rem] tracking-[0.18em] ${badgeTone[event.status]}`}>
              {statusLabel[event.status]}
            </span>
          </span>
        }
        title={event.title}
        lead={event.description}
      >
        <p className="mt-8 font-display text-lg text-ink">{formatRange(event.start, event.finish)}</p>
      </PageHead>

      <section className="bg-paper pb-24 pt-14 md:pt-16">
        <div className="shell grid gap-14 lg:grid-cols-[1fr_20rem] lg:gap-20">
          <div className="min-w-0">
            {event.image && (
              <Cover
                image={event.image}
                hue={event.hue}
                ratio="aspect-[16/9]"
                priority
                zoom={false}
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="mb-12"
              />
            )}
            {event.html.trim() ? (
              <RichText html={event.html} className="max-w-[44rem]" />
            ) : (
              <p className="max-w-[44rem] text-lg leading-relaxed text-ink-soft">{event.description}</p>
            )}
          </div>

          {/* Бокова колонка: коли, де, теми */}
          <aside className="space-y-10 lg:sticky lg:top-32 lg:self-start">
            <div>
              <p className="eyebrow text-mute">Коли</p>
              <div className="rule mt-3" />
              <p className="mt-4 leading-relaxed text-ink">{formatRange(event.start, event.finish)}</p>
              {!past && (
                <a
                  href={calendarLink(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline mt-3 inline-block text-sm font-bold text-ink"
                >
                  Додати в календар →
                </a>
              )}
            </div>

            {loc && (
              <div>
                <p className="eyebrow text-mute">Де</p>
                <div className="rule mt-3" />
                <div className="mt-4 aspect-[4/3] w-full overflow-hidden bg-paper-dim">
                  <iframe
                    title="Мапа місця проведення"
                    loading="lazy"
                    className="h-full w-full border-0 grayscale-[35%]"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${loc.longitude - 0.012}%2C${
                      loc.latitude - 0.007
                    }%2C${loc.longitude + 0.012}%2C${loc.latitude + 0.007}&layer=mapnik&marker=${loc.latitude}%2C${loc.longitude}`}
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline mt-3 inline-block text-sm font-bold text-ink"
                >
                  Відкрити в Google Maps →
                </a>
              </div>
            )}

            {event.tags.length > 0 && (
              <div>
                <p className="eyebrow text-mute">Теми</p>
                <div className="rule mt-3" />
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {event.tags.map((t) => (
                    <li key={t.id}>
                      <Link href={`/podiyi?tag=${t.slug}`} className="link-underline text-sm text-sky-700">
                        {t.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* Звіт живе всередині події — показуємо, коли подія вже відбулася */}
      {past && (
        <section id="zvit" className="scroll-mt-28 bg-paper-dim py-20 md:py-24">
          <div className="shell">
            <SectionHead eyebrow="Звіт" title="Як це було" />
            {event.hasReport ? (
              <div className="pt-10">
                <RichText html={event.report.html} className="max-w-[44rem]" />
                {event.report.gallery.length > 0 && (
                  <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                    {event.report.gallery.map((img, i) => (
                      <a
                        key={img.url}
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group relative block overflow-hidden bg-paper ${
                          i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-square"
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt={img.alt ?? img.title ?? ""}
                          fill
                          sizes={i === 0 ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 50vw"}
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="pt-10 max-w-xl leading-relaxed text-mute">
                Звіт і фото з події готуються — зазирніть сюди трохи згодом.
              </p>
            )}
          </div>
        </section>
      )}

      {next.length > 0 && (
        <section className="bg-paper py-20 md:py-24">
          <div className="shell">
            <SectionHead eyebrow="Далі в календарі" title="Прийдешні події" link="/podiyi" linkLabel="Усі події" />
            {next.map((e) => (
              <EventRow key={e.id} event={e} compact />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
