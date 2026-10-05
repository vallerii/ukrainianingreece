import type { Metadata } from "next";
import Link from "next/link";
import { getTopicArticles, topics } from "@/lib/korysno";
import { searchCms } from "@/lib/cms";
import { matchesAll, parseQuery, stripHtml } from "@/lib/search";
import PageHead from "@/components/cms/PageHead";
import ArticleRow from "@/components/cms/ArticleRow";
import EmptyState from "@/components/cms/EmptyState";
import SearchForm from "@/components/search/SearchForm";
import Reveal from "@/components/ui/Reveal";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Корисна інформація",
  description:
    "Довідник для українців у Греції: документи, школи, медицина, робота, житло, банки, грецька мова, соціальна допомога.",
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function Page({ searchParams }: Props) {
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
        eyebrow="Довідник"
        title={
          <>
            Корисна <span className="text-sky-700">інформація</span>
          </>
        }
        lead="Для тих, хто щойно приїхав до Греції і тих, хто живе тут давно: документи, школи, лікарі, робота й житло — простими словами українською."
      >
        <SearchForm
          action="/korysno"
          defaultValue={q}
          placeholder="Наприклад: AMKA, школа, оренда…"
          label="Пошук у довіднику"
        />
      </PageHead>

      {found ? (
        <section className="bg-paper pb-28 pt-12">
          <div className="shell">
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-ink pb-3">
              <h2 className="display text-[clamp(1.5rem,2.6vw,2.1rem)] text-ink">
                {found.length ? `Знайдено: ${found.length}` : "Нічого не знайдено"}
              </h2>
              <Link href="/korysno" className="link-underline text-sm font-semibold text-ink">
                ← Усі теми
              </Link>
            </div>
            {found.length ? (
              found.map((a) => <ArticleRow key={a.id} article={a} />)
            ) : (
              <EmptyState
                title={`За запитом «${q}» у довіднику нічого немає`}
                text="Спробуйте інше слово або пошукайте по всьому сайту. Якщо відповіді немає — напишіть нам, підкажемо."
                link={{ href: `/poshuk?q=${encodeURIComponent(q)}`, label: "Шукати по всьому сайту" }}
              />
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Теми */}
          <section className="bg-paper pb-24 pt-14 md:pt-16">
            <div className="shell">
              <p className="eyebrow text-sky-700">Теми</p>
              <div className="mt-6 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">
                {topics.map((t, i) => (
                  <Reveal key={t.slug} delay={Math.min(i, 4) * 0.04} className="border-b border-r border-line">
                    <Link href={`/korysno/${t.slug}`} className="group flex h-full flex-col p-7 transition-colors hover:bg-sky-deep">
                      <span className="font-display text-sm text-mute/70 group-hover:text-wheat-400">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h2 className="display mt-6 text-[1.45rem] leading-tight text-ink group-hover:text-paper">{t.title}</h2>
                      <p className="mt-3 flex-1 text-[0.92rem] leading-relaxed text-mute group-hover:text-sky-100">{t.lead}</p>
                      <span className="mt-6 flex items-center justify-between text-sm text-ink group-hover:text-wheat-400">
                        <span>{counts[i] ? `${counts[i]} матеріал${counts[i] === 1 ? "" : counts[i] < 5 ? "и" : "ів"}` : "Готуємо матеріали"}</span>
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
                <p className="eyebrow text-sky-700">Не знайшли відповідь?</p>
                <p className="display mt-4 max-w-2xl text-[clamp(1.6rem,3vw,2.4rem)] text-ink">
                  Напишіть нам — у спільноті є люди, які вже пройшли цей шлях.
                </p>
              </div>
              <div className="flex flex-wrap gap-6">
                <Link href="/proyekty/info-tsentr" className="link-underline text-sm font-bold text-ink">
                  Інформаційний центр →
                </Link>
                <Link href="/kontakty" className="link-underline text-sm font-bold text-ink">
                  Контакти →
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
