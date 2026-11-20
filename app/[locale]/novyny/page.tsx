import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticlesPage, getArticleTypes, parsePage } from "@/lib/cms";
import PageHead from "@/components/cms/PageHead";
import FilterBar from "@/components/cms/FilterBar";
import ArticleRow from "@/components/cms/ArticleRow";
import EmptyState from "@/components/cms/EmptyState";
import Pagination from "@/components/cms/Pagination";
import Reveal from "@/components/ui/Reveal";
import { getT, initPage, setLocale } from "@/lib/i18n/server";
import { alternates } from "@/lib/i18n/seo";
import { fill } from "@/lib/i18n/fill";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ type?: string; page?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  setLocale((await params).locale);
  const n = getT().newsPage;
  const page = parsePage((await searchParams).page);
  return {
    title: page > 1 ? fill(n.metaTitlePage, { page }) : n.metaTitle,
    alternates: alternates(page > 1 ? `/novyny?page=${page}` : "/novyny"),
    description:
      n.metaDesc,
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { t } = await initPage(params);
  const n = t.newsPage;
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const { types, total } = await getArticleTypes();
  const active = types.find((t) => t.slug === sp.type) ?? null;
  const list = await getArticlesPage(page, active?.id ?? null);

  if (page > list.pages) notFound();

  const options = [
    { label: t.common.all, href: "/novyny", active: !active, count: total },
    ...types.map((t) => ({
      label: t.title,
      href: `/novyny?type=${t.slug}`,
      active: active?.id === t.id,
      count: t.count,
    })),
  ];

  return (
    <>
      <PageHead
        eyebrow={n.eyebrow}
        title={
          <>
            {n.h1A}
            <br />
            {n.h1B}<span className="text-sky-700">{n.h1C}</span>
          </>
        }
        lead={n.lead}
      />

      {/* фільтр має сенс, лише коли в Новинах кілька типів (статті — окремо, у Блозі) */}
      {types.length > 1 ? <FilterBar label={n.filterLabel} options={options} /> : <div className="shell"><div className="border-t border-line" /></div>}

      <section className="bg-paper pb-28">
        <div className="shell">
          {list.items.length > 0 ? (
            <>
              {list.items.map((a, idx) => (
                <Reveal key={a.id} delay={Math.min(idx, 4) * 0.04}>
                  <ArticleRow article={a} />
                </Reveal>
              ))}
              <Pagination
                page={list.page}
                pages={list.pages}
                basePath="/novyny"
                params={{ type: active?.slug }}
              />
            </>
          ) : (
            <EmptyState
              title={n.emptyTitle}
              text={n.emptyText}
              link={{ href: "/novyny", label: n.emptyLink }}
            />
          )}
        </div>
      </section>
    </>
  );
}
