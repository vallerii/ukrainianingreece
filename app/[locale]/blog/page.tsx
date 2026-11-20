import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parsePage } from "@/lib/cms";
import { getBlogPage, BLOG_HREF } from "@/lib/blog";
import PageHead from "@/components/cms/PageHead";
import ArticleRow from "@/components/cms/ArticleRow";
import EmptyState from "@/components/cms/EmptyState";
import Pagination from "@/components/cms/Pagination";
import Reveal from "@/components/ui/Reveal";
import { getT, initPage, setLocale } from "@/lib/i18n/server";
import { alternates } from "@/lib/i18n/seo";
import { fill } from "@/lib/i18n/fill";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  setLocale((await params).locale);
  const n = getT().blogPage;
  const page = parsePage((await searchParams).page);
  return {
    title: page > 1 ? fill(n.metaTitlePage, { page }) : n.metaTitle,
    alternates: alternates(page > 1 ? `/blog?page=${page}` : "/blog"),
    description:
      n.metaDesc,
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { t } = await initPage(params);
  const n = t.blogPage;
  const page = parsePage((await searchParams).page);
  const list = await getBlogPage(page);
  if (page > list.pages) notFound();

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

      <section className="bg-paper pb-28">
        <div className="shell">
          <div className="border-t border-line">
            {list.items.length > 0 ? (
              <>
                {list.items.map((a, idx) => (
                  <Reveal key={a.id} delay={Math.min(idx, 4) * 0.04}>
                    <ArticleRow article={a} />
                  </Reveal>
                ))}
                <Pagination page={list.page} pages={list.pages} basePath={BLOG_HREF} />
              </>
            ) : (
              <EmptyState
                title={n.emptyTitle}
                text={n.emptyText}
                link={{ href: "/kontakty", label: n.emptyLink }}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
