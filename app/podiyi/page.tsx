import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecentPastEvents, getTags, getUpcomingEvents, parsePage } from "@/lib/cms";
import PageHead from "@/components/cms/PageHead";
import FilterBar from "@/components/cms/FilterBar";
import EventRow from "@/components/cms/EventRow";
import EmptyState from "@/components/cms/EmptyState";
import Pagination from "@/components/cms/Pagination";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Події та звіти",
  description: "Календар української спільноти Греції: культурні, освітні та благодійні події.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const [sp, tags] = await Promise.all([searchParams, getTags()]);
  const page = parsePage(sp.page);
  const active = tags.find((t) => t.slug === sp.tag) ?? null;

  const [list, past] = await Promise.all([
    getUpcomingEvents(page, active?.id ?? null),
    page === 1 ? getRecentPastEvents(6, active?.id ?? null) : Promise.resolve([]),
  ]);
  if (page > list.pages) notFound();
  const upcoming = list.items;

  const options = [
    { label: "Усі", href: "/podiyi", active: !active },
    ...tags.map((t) => ({
      label: t.title,
      href: `/podiyi?tag=${t.slug}`,
      active: active?.id === t.id,
    })),
  ];

  return (
    <>
      <PageHead
        eyebrow="Календар"
        title={
          <>
            Події <span className="text-sky-700">спільноти</span>
          </>
        }
        lead="Культурні вечори, ярмарки, освітні зустрічі та консультації — усе, що організовують українські спільноти Греції."
      />

      <FilterBar label="Тема" options={options} />

      <section className="bg-paper pb-24 pt-14 md:pt-16">
        <div className="shell">
          <Reveal>
            <p className="eyebrow text-sky-700">
              Прийдешні{active ? ` · ${active.title}` : ""}
            </p>
          </Reveal>
          <div className="mt-2 border-t border-line">
            {upcoming.length > 0 ? (
              upcoming.map((e, idx) => (
                <Reveal key={e.id} delay={Math.min(idx, 4) * 0.05}>
                  <EventRow event={e} />
                </Reveal>
              ))
            ) : (
              <EmptyState
                title="Найближчих подій поки немає"
                text={
                  active
                    ? `У темі «${active.title}» нових подій ще не заплановано. Перегляньте інші теми або архів.`
                    : "Нові події зараз плануються. Тим часом можна переглянути, як минули попередні."
                }
                link={{ href: "/podiyi/zvity", label: "Архів подій і звітів" }}
              />
            )}
          </div>
          <Pagination page={list.page} pages={list.pages} basePath="/podiyi" params={{ tag: active?.slug }} />
        </div>
      </section>

      {past.length > 0 && (
        <section className="bg-paper-dim py-20 md:py-24">
          <div className="shell">
            <SectionHead
              eyebrow="Нещодавно"
              title="Як це було"
              link="/podiyi/zvity"
              linkLabel="Усі звіти"
            />
            <div>
              {past.map((e, idx) => (
                <Reveal key={e.id} delay={Math.min(idx, 4) * 0.04}>
                  <EventRow event={e} compact />
                </Reveal>
              ))}
            </div>
            <Link href="/podiyi/zvity" className="link-underline mt-8 inline-block text-sm font-bold text-ink">
              Архів за роками →
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
