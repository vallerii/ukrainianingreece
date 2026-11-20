import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { getTopicArticles, getTopics } from "@/lib/korysno";
import { getT, initPage, setLocale } from "@/lib/i18n/server";
import { alternates } from "@/lib/i18n/seo";
import { fill } from "@/lib/i18n/fill";
import { searchCms } from "@/lib/cms";
import { matchesAll, parseQuery, stripHtml } from "@/lib/search";
import PageHead from "@/components/cms/PageHead";
import ArticleRow from "@/components/cms/ArticleRow";
import EmptyState from "@/components/cms/EmptyState";
import SearchForm from "@/components/search/SearchForm";
import Reveal from "@/components/ui/Reveal";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  setLocale((await params).locale);
  const u = getT().usefulPage;
  return { title: u.metaTitle, description: u.metaDesc, alternates: alternates("/korysno") };
}

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> };

export default async function Page({ params, searchParams }: Props) {
  const { t: dict } = await initPage(params);
  const u = dict.usefulPage;
  const topics = getTopics();
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const terms = parseQuery(q);

  // пошук у межах довідника — лише статті
  const found = terms.length
    ? (await searchCms(terms)).articles.filter((a) => matchesAll(`${a.title} ${stripHtml(a.html)}`, terms))
    : null;

  const counts = found ? [] : await Promise.all(topics.map((t) => getTopicArticles(t).then((a) => a.length)));

  return (
    <>
      <PageHead
        eyebrow={u.eyebrow}
        title={
          <>
            {u.h1A}<span className="text-sky-700">{u.h1B}</span>
          </>
        }
        lead={u.lead}
      >
        <SearchForm
          action="/korysno"
          defaultValue={q}
          placeholder={u.placeholder}
          label={u.searchLabel}
        />
      </PageHead>

      {found ? (
        <section className="bg-paper pb-28 pt-12">
          <div className="shell">
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-ink pb-3">
              <h2 className="display text-[clamp(1.2rem,2.08vw,1.68rem)] text-ink">
                {found.length ? fill(u.found, { n: found.length }) : u.nothing}
              </h2>
              <Link href="/korysno" className="link-underline text-sm font-semibold text-ink">
                {u.allTopics}
              </Link>
            </div>
            {found.length ? (
              found.map((a) => <ArticleRow key={a.id} article={a} />)
            ) : (
              <EmptyState
                title={fill(u.emptyTitle, { q })}
                text={u.emptyText}
                link={{ href: `/poshuk?q=${encodeURIComponent(q)}`, label: u.searchAll }}
              />
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Теми */}
          <section className="bg-paper pb-24 pt-14 md:pt-16">
            <div className="shell">
              <p className="eyebrow text-sky-700">{u.topics}</p>
              <div className="mt-6 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">
                {topics.map((t, i) => (
                  <Reveal key={t.slug} delay={Math.min(i, 4) * 0.04} className="border-b border-r border-line">
                    <Link href={`/korysno/${t.slug}`} className="group flex h-full flex-col p-7 transition-colors hover:bg-sky-deep">
                      <span className="font-display text-sm text-mute group-hover:text-wheat-400">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h2 className="display mt-6 text-[1.45rem] leading-tight text-ink group-hover:text-paper">{t.title}</h2>
                      <p className="mt-3 flex-1 text-[0.92rem] leading-relaxed text-mute group-hover:text-sky-100">{t.lead}</p>
                      <span className="mt-6 flex items-center justify-between text-sm text-ink group-hover:text-wheat-400">
                        <span>{counts[i] ? u.materials(counts[i]) : u.preparing}</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* Не знайшли відповідь */}
          <section className="bg-paper-dim py-20">
            <div className="shell grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="eyebrow text-sky-700">{u.notFoundEyebrow}</p>
                <p className="display mt-4 max-w-2xl text-[clamp(1.28rem,2.4vw,1.92rem)] text-ink">
                  {u.notFoundTitle}
                </p>
              </div>
              <div className="flex flex-wrap gap-6">
                <Link href="/proyekty/info-tsentr" className="link-underline text-sm font-bold text-ink">
                  {u.infoCenter}
                </Link>
                <Link href="/kontakty" className="link-underline text-sm font-bold text-ink">
                  {u.contacts}
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
