import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { notFound } from "next/navigation";
import { getTopic, getTopicArticles, getTopics } from "@/lib/korysno";
import { initPage, setLocale, getT } from "@/lib/i18n/server";
import { alternates } from "@/lib/i18n/seo";
import PageHead from "@/components/cms/PageHead";
import ArticleRow from "@/components/cms/ArticleRow";
import EmptyState from "@/components/cms/EmptyState";

export const revalidate = 60;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return getTopics().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  setLocale((await params).locale);
  const t = getTopic((await params).slug);
  return t ? { title: `${t.title} — ${getT().usefulPage.metaTitle}`, description: t.lead, alternates: alternates(`/korysno/${t.slug}`) } : {};
}

export default async function Page({ params }: Props) {
  const { t: dict } = await initPage(params);
  const k = dict.topicPage;
  const topics = getTopics();
  const topic = getTopic((await params).slug);
  if (!topic) notFound();
  const articles = await getTopicArticles(topic);

  return (
    <>
      <PageHead
        eyebrow={
          <Link href="/korysno" className="hover:text-ink">
            ← {dict.usefulPage.metaTitle}
          </Link>
        }
        title={topic.title}
        lead={topic.lead}
      />

      <section className="bg-paper pb-24 pt-10">
        <div className="shell grid gap-14 lg:grid-cols-[1fr_20rem] lg:gap-20">
          <div className="min-w-0">
            {articles.length ? (
              articles.map((a) => <ArticleRow key={a.id} article={a} />)
            ) : (
              <EmptyState
                title={k.emptyTitle}
                text={k.emptyText}
                link={{ href: "/proyekty/info-tsentr", label: k.infoCenter }}
              />
            )}
          </div>

          <aside className="space-y-10 pt-10 lg:sticky lg:top-32 lg:self-start">
            {topic.links.length > 0 && (
              <div>
                <p className="eyebrow text-mute">{k.official}</p>
                <div className="rule mt-3" />
                <ul className="mt-4 space-y-4">
                  {topic.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="group block">
                        <span className="link-underline text-[0.95rem] text-ink">{l.label} ↗</span>
                        {l.note && <span className="mt-1 block text-xs text-mute">{l.note}</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {topic.internal && (
              <div>
                <p className="eyebrow text-mute">{k.community}</p>
                <div className="rule mt-3" />
                <ul className="mt-4 space-y-3">
                  {topic.internal.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="link-underline text-[0.95rem] text-ink">
                        {l.label} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className="eyebrow text-mute">{k.otherTopics}</p>
              <div className="rule mt-3" />
              <ul className="mt-4 space-y-2">
                {topics
                  .filter((t) => t.slug !== topic.slug)
                  .map((t) => (
                    <li key={t.slug}>
                      <Link href={`/korysno/${t.slug}`} className="text-[0.92rem] text-ink-soft transition-colors hover:text-sky-700">
                        {t.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
