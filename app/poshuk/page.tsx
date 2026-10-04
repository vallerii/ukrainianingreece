import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { MIN_QUERY, searchSite, snippet, stripHtml } from "@/lib/search";
import { formatDate, formatRange } from "@/lib/format";
import { statusLabel } from "@/lib/cms";
import PageHead from "@/components/cms/PageHead";
import SearchForm from "@/components/search/SearchForm";
import Highlight from "@/components/search/Highlight";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Пошук: ${q}` : "Пошук",
    robots: { index: false }, // сторінки результатів не індексуємо
  };
}

const SUGGEST = ["школа", "документи", "Крит", "волонтер", "хор", "Трембіта"];

function Group({ id, title, count, children }: { id: string; title: string; count: number; children: ReactNode }) {
  if (!count) return null;
  return (
    <section id={id} className="scroll-mt-32 pt-14 first:pt-0">
      <div className="flex items-baseline justify-between border-b border-ink pb-3">
        <h2 className="display text-[clamp(1.5rem,2.6vw,2.1rem)] text-ink">{title}</h2>
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

export default async function Page({ searchParams }: Props) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const tooShort = q.length > 0 && q.length < MIN_QUERY;
  const res = q && !tooShort ? await searchSite(q) : null;
  const t = res?.terms ?? [];

  const groups = res
    ? [
        { id: "novyny", label: "Новини та статті", n: res.articles.length },
        { id: "podiyi", label: "Події", n: res.events.length },
        { id: "proyekty", label: "Проєкти", n: res.projects.length },
        { id: "storinky", label: "Сторінки сайту", n: res.pages.length },
      ].filter((g) => g.n)
    : [];

  return (
    <>
      <PageHead eyebrow="Пошук" title="Що ви шукаєте?">
        <SearchForm defaultValue={q} autoFocus={!q} />
        {res && (
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-mute">
            <span>
              {res.total ? (
                <>
                  Знайдено: <b className="font-semibold text-ink">{res.total}</b>
                </>
              ) : (
                "Нічого не знайдено"
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
              {tooShort && <p className="mb-6 text-mute">Введіть щонайменше {MIN_QUERY} символи.</p>}
              {res && res.total === 0 && (
                <p className="mb-6 leading-relaxed text-ink-soft">
                  За запитом «{q}» нічого не знайшлося. Спробуйте коротше слово або інше формулювання —
                  чи напишіть нам, і ми підкажемо.
                </p>
              )}
              <p className="eyebrow text-mute">Часто шукають</p>
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
                  Звʼязатися з нами →
                </Link>
              )}
            </div>
          )}

          {res && res.total > 0 && (
            <>
              <Group id="novyny" title="Новини та статті" count={res.articles.length}>
                {res.articles.map((a) => (
                  <Hit
                    key={a.id}
                    href={`/novyny/${a.slug}`}
                    meta={[a.type?.title, formatDate(a.date)].filter(Boolean).join(" · ")}
                    title={a.title}
                    text={stripHtml(a.html)}
                    terms={t}
                  />
                ))}
              </Group>

              <Group id="podiyi" title="Події" count={res.events.length}>
                {res.events.map((e) => (
                  <Hit
                    key={e.id}
                    href={`/podiyi/${e.slug}`}
                    meta={`${statusLabel[e.status]} · ${formatRange(e.start, e.finish)}`}
                    title={e.title}
                    text={[e.description, stripHtml(e.html), stripHtml(e.report.html)].filter(Boolean).join(" ")}
                    terms={t}
                  />
                ))}
              </Group>

              <Group id="proyekty" title="Проєкти" count={res.projects.length}>
                {res.projects.map((p) => (
                  <Hit key={p.href} href={p.href} meta={p.section} title={p.title} text={p.text} terms={t} />
                ))}
              </Group>

              <Group id="storinky" title="Сторінки сайту" count={res.pages.length}>
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
