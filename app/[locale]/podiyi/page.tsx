import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { notFound } from "next/navigation";
import { getRecentPastEvents, getTags, getUpcomingEvents, parsePage } from "@/lib/cms";
import PageHead from "@/components/cms/PageHead";
import FilterBar from "@/components/cms/FilterBar";
import EventRow from "@/components/cms/EventRow";
import EmptyState from "@/components/cms/EmptyState";
import Pagination from "@/components/cms/Pagination";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";
import { getT, initPage, setLocale } from "@/lib/i18n/server";
import { alternates } from "@/lib/i18n/seo";
import { fill } from "@/lib/i18n/fill";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  setLocale((await params).locale);
  const e = getT().eventsPage;
  return { title: e.metaTitle, description: e.metaDesc, alternates: alternates("/podiyi") };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const { t } = await initPage(params);
  const e = t.eventsPage;
  const [sp, tags] = await Promise.all([searchParams, getTags()]);
  const page = parsePage(sp.page);
  const active = tags.find((t) => t.slug === sp.tag) ?? null;

  const [list, past] = await Promise.all([
    // найдальша дата — угорі (правка клієнта 22.10.2026)
    getUpcomingEvents(page, active?.id ?? null, undefined, "desc"),
    page === 1 ? getRecentPastEvents(6, active?.id ?? null) : Promise.resolve([]),
  ]);
  if (page > list.pages) notFound();
  const upcoming = list.items;

  const options = [
    { label: t.common.all, href: "/podiyi", active: !active },
    ...tags.map((t) => ({
      label: t.title,
      href: `/podiyi?tag=${t.slug}`,
      active: active?.id === t.id,
    })),
  ];

  return (
    <>
      <PageHead
        eyebrow={e.eyebrow}
        title={
          <>
            {e.h1A}<span className="text-sky-700">{e.h1B}</span>
          </>
        }
        lead={e.lead}
      />

      <FilterBar label={e.filterLabel} options={options} />

      <section className="bg-paper pb-24 pt-14 md:pt-16">
        <div className="shell">
          <Reveal>
            <p className="eyebrow text-sky-700">
              {e.upcoming}{active ? ` · ${active.title}` : ""}
            </p>
          </Reveal>
          <div className="mt-2 border-t border-line">
            {upcoming.length > 0 ? (
              upcoming.map((ev, idx) => (
                <Reveal key={ev.id} delay={Math.min(idx, 4) * 0.05}>
                  <EventRow event={ev} />
                </Reveal>
              ))
            ) : (
              <EmptyState
                title={e.emptyTitle}
                text={
                  active
                    ? fill(e.emptyTag, { tag: active.title })
                    : e.emptyText
                }
                link={{ href: "/podiyi/zvity", label: e.archiveLink }}
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
              eyebrow={e.recentEyebrow}
              title={e.recentTitle}
              link="/podiyi/zvity"
              linkLabel={e.allReports}
            />
            <div>
              {past.map((ev, idx) => (
                <Reveal key={ev.id} delay={Math.min(idx, 4) * 0.04}>
                  <EventRow event={ev} compact />
                </Reveal>
              ))}
            </div>
            <Link href="/podiyi/zvity" className="link-underline mt-8 inline-block text-sm font-bold text-ink">
              {e.archiveYears}
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
