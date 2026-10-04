import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArchiveYear, getArchiveYears, type CmsEvent } from "@/lib/cms";
import { dateParts } from "@/lib/format";
import PageHead from "@/components/cms/PageHead";
import EmptyState from "@/components/cms/EmptyState";
import Reveal from "@/components/ui/Reveal";

export const revalidate = 60;

type Props = { searchParams: Promise<{ year?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { year } = await searchParams;
  return {
    title: year ? `Звіти за ${year} рік` : "Звіти",
    description: "Архів подій української спільноти Греції за роками: фото, підсумки та звіти.",
  };
}

function ReportRow({ e }: { e: CmsEvent }) {
  const d = dateParts(e.start);
  return (
    <Link
      href={`/podiyi/${e.slug}#zvit`}
      className="group grid items-baseline gap-3 border-b border-line py-7 md:grid-cols-[9rem_1fr_auto] md:gap-10"
    >
      <p className="text-sm tabular-nums text-mute">
        {Number(d.day)} {d.month}
      </p>
      <div>
        <h3 className="font-display text-[1.1rem] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-sky-700 md:text-[1.3rem]">
          {e.title}
        </h3>
        {e.tags.length > 0 && (
          <p className="eyebrow mt-2 text-sky-700">{e.tags.map((t) => t.title).join(" · ")}</p>
        )}
      </div>
      <p className="flex items-center gap-4 whitespace-nowrap text-sm">
        {e.report.gallery.length > 0 && (
          <span className="text-mute">{e.report.gallery.length} фото</span>
        )}
        {e.hasReport ? (
          <span className="font-medium text-ink">
            Звіт <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </span>
        ) : (
          <span className="text-mute">Звіт готується</span>
        )}
      </p>
    </Link>
  );
}

/**
 * Архів по роках: одна сторінка = один рік (?year=2025), за замовчуванням — найсвіжіший.
 * Так сторінка не росте безкінечно, а в межах року подій небагато.
 */
export default async function Page({ searchParams }: Props) {
  const { year: yearParam } = await searchParams;
  const years = await getArchiveYears(); // від нових до старих

  const year = yearParam ? Number(yearParam) : years[0]?.year;
  if (yearParam && !years.some((y) => y.year === year)) notFound();
  const items = year ? await getArchiveYear(year) : [];

  return (
    <>
      <PageHead
        eyebrow={
          <Link href="/podiyi" className="hover:text-ink">
            ← Події · Звіти
          </Link>
        }
        title={
          <>
            Що ми <span className="text-sky-700">зробили</span>
          </>
        }
        lead="Архів подій спільноти з підсумками, фото та звітами — для учасників, партнерів і донорів."
      />

      <section className="bg-paper pb-28 pt-14 md:pt-16">
        <div className="shell grid gap-12 lg:grid-cols-[10rem_1fr] lg:gap-16">
          {years.length > 0 && (
            <nav aria-label="Роки" className="lg:sticky lg:top-32 lg:self-start">
              <p className="eyebrow text-mute">Роки</p>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 lg:flex-col">
                {years.map((y) => {
                  const current = y.year === year;
                  return (
                    <li key={y.year}>
                      <Link
                        href={y.year === years[0].year ? "/podiyi/zvity" : `/podiyi/zvity?year=${y.year}`}
                        aria-current={current ? "page" : undefined}
                        className="group flex items-baseline gap-2"
                      >
                        <span
                          className={`display text-[1.8rem] transition-colors group-hover:text-sky-700 ${
                            current ? "text-sky-700" : "text-mute"
                          }`}
                        >
                          {y.year}
                        </span>
                        <span className="text-xs tabular-nums text-mute">{y.count}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          <div>
            {!year ? (
              <EmptyState
                title="Архів поки порожній"
                text="Звіти з’являться тут після перших подій."
                link={{ href: "/podiyi", label: "Прийдешні події" }}
              />
            ) : (
              <section>
                <Reveal>
                  <div className="flex items-baseline justify-between border-b border-ink pb-4">
                    <h2 className="display text-[clamp(2.4rem,5vw,3.8rem)] text-ink">{year}</h2>
                    <p className="text-sm text-mute">
                      {items.length} {plural(items.length, ["подія", "події", "подій"])}
                    </p>
                  </div>
                </Reveal>
                {items.map((e) => (
                  <ReportRow key={e.id} e={e} />
                ))}
              </section>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function plural(n: number, [one, few, many]: [string, string, string]) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
