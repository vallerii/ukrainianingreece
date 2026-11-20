import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import type { ReactNode } from "react";
import { MIN_QUERY, searchSite, snippet, stripHtml } from "@/lib/search";
import { formatDate, formatRange } from "@/lib/format";
import { getT, initPage, setLocale } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/fill";
import PageHead from "@/components/cms/PageHead";
import SearchForm from "@/components/search/SearchForm";
import Highlight from "@/components/search/Highlight";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  setLocale((await params).locale);
  const sr = getT().searchPage;
  const { q } = await searchParams;
  return {
    title: q ? fill(sr.metaTitleQ, { q }) : sr.metaTitle,
    robots: { index: false }, // сторінки результатів не індексуємо
  };
}


function Group({ id, title, count, children }: { id: string; title: string; count: number; children: ReactNode }) {
  if (!count) return null;
  return (
    <section id={id} className="scroll-mt-32 pt-14 first:pt-0">
      <div className="flex items-baseline justify-between border-b border-ink pb-3">
        <h2 className="display text-[clamp(1.2rem,2.08vw,1.68rem)] text-ink">{title}</h2>
        <span className="text-sm tabular-nums text-mute">{count}</span>
      </div>
      <ul>{children}</ul>
    </section>
  );
}

function Hit({
  href,
  meta,
  title,
  text,
  terms,
}: {
  href: string;
  meta: string;
  title: string;
  text: string;
  terms: string[];
}) {
  return (
    <li>
      <Link href={href} className="group block border-b border-line py-7">
        <p className="eyebrow text-sky-700">{meta}</p>
        <h3 className="mt-2 font-display text-[1.15rem] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-sky-700 md:text-[1.3rem]">
          <Highlight text={title} terms={terms} />
        </h3>
        {text && (
          <p className="mt-2 max-w-3xl text-[0.95rem] leading-relaxed text-ink-soft">
            <Highlight text={snippet(text, terms)} terms={terms} />
          </p>
        )}
      </Link>
    </li>
  );
}

export default async function Page({ params, searchParams }: Props) {
  const { t: dict, locale } = await initPage(params);
  const sr = dict.searchPage;
  const SUGGEST = sr.suggest;
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const tooShort = q.length > 0 && q.length < MIN_QUERY;
  const res = q && !tooShort ? await searchSite(q) : null;
  const t = res?.terms ?? [];

  const groups = res
    ? [
        { id: "novyny", label: sr.tabNews, n: res.articles.length },
        { id: "podiyi", label: sr.events, n: res.events.length },
        { id: "proyekty", label: sr.projects, n: res.projects.length },
        { id: "storinky", label: sr.pages, n: res.pages.length },
      ].filter((g) => g.n)
    : [];

  return (
    <>
      <PageHead eyebrow={sr.metaTitle} title={sr.title}>
        <SearchForm defaultValue={q} autoFocus={!q} />
        {res && (
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-mute">
            <span>
              {res.total ? (
                <>
                  {sr.found} <b className="font-semibold text-ink">{res.total}</b>
                </>
              ) : (
                sr.nothing
              )}
            </span>
            {groups.map((g) => (
              <a key={g.id} href={`#${g.id}`} className="link-underline text-ink-soft hover:text-ink">
                {g.label} <span className="tabular-nums text-mute">{g.n}</span>
              </a>
            ))}
          </div>
        )}
      </PageHead>

      <section className="bg-paper pb-28 pt-14 md:pt-16">
        <div className="shell max-w-5xl">
          {/* Порожній запит або результатів немає — підказки */}
          {(!res || res.total === 0) && (
            <div className="max-w-2xl">
              {tooShort && <p className="mb-6 text-mute">{fill(sr.tooShort, { n: MIN_QUERY })}</p>}
              {res && res.total === 0 && (
                <p className="mb-6 leading-relaxed text-ink-soft">
                  {fill(sr.noResults, { q })}
                </p>
              )}
              <p className="eyebrow text-mute">{sr.popular}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {SUGGEST.map((s) => (
                  <li key={s}>
                    <Link
                      href={`/poshuk?q=${encodeURIComponent(s)}`}
                      className="inline-block rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-sky-700 hover:text-sky-700"
                    >
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
              {res && res.total === 0 && (
                <Link href="/kontakty" className="link-underline mt-8 inline-block text-sm font-bold text-ink">
                  {sr.contact}
                </Link>
              )}
            </div>
          )}

          {res && res.total > 0 && (
            <>
              <Group id="novyny" title={sr.groupNews} count={res.articles.length}>
                {res.articles.map((a) => (
                  <Hit
                    key={a.id}
                    href={a.href}
                    meta={[a.href.startsWith("/blog") ? dict.nav.blog : a.type?.title, formatDate(a.date, locale)].filter(Boolean).join(" · ")}
                    title={a.title}
                    text={stripHtml(a.html)}
                    terms={t}
                  />
                ))}
              </Group>

              <Group id="podiyi" title={sr.events} count={res.events.length}>
                {res.events.map((e) => (
                  <Hit
                    key={e.id}
                    href={`/podiyi/${e.slug}`}
                    meta={`${dict.eventPage.status[e.status]} · ${formatRange(e.start, e.finish, locale)}`}
                    title={e.title}
                    text={[e.description, stripHtml(e.html), stripHtml(e.report.html)].filter(Boolean).join(" ")}
                    terms={t}
                  />
                ))}
              </Group>

              <Group id="proyekty" title={sr.projects} count={res.projects.length}>
                {res.projects.map((p) => (
                  <Hit key={p.href} href={p.href} meta={p.section} title={p.title} text={p.text} terms={t} />
                ))}
              </Group>

              <Group id="storinky" title={sr.pages} count={res.pages.length}>
                {res.pages.map((p) => (
                  <Hit key={p.href} href={p.href} meta={p.section} title={p.title} text={p.text} terms={t} />
                ))}
              </Group>
            </>
          )}
        </div>
      </section>
    </>
  );
}
