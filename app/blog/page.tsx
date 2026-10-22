import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parsePage } from "@/lib/cms";
import { getBlogPage, BLOG_HREF } from "@/lib/blog";
import PageHead from "@/components/cms/PageHead";
import ArticleRow from "@/components/cms/ArticleRow";
import EmptyState from "@/components/cms/EmptyState";
import Pagination from "@/components/cms/Pagination";
import Reveal from "@/components/ui/Reveal";

export const revalidate = 60;

type Props = { searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  return {
    title: page > 1 ? `Блог — сторінка ${page}` : "Блог",
    description:
      "Блог української спільноти Греції: статті на загальні теми — життя в Греції, культура, історія, освіта, думки й розповіді людей.",
  };
}

export default async function Page({ searchParams }: Props) {
  const page = parsePage((await searchParams).page);
  const list = await getBlogPage(page);
  if (page > list.pages) notFound();

  return (
    <>
      <PageHead
        eyebrow="Блог"
        title={
          <>
            Думки, досвід
            <br />і <span className="text-sky-700">розповіді</span>
          </>
        }
        lead="Статті на загальні теми: життя в Греції, культура й історія, освіта, досвід і погляди людей нашої спільноти."
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
                title="Перші статті готуються"
                text="Скоро тут з’являться матеріали від авторів спільноти. Хочете написати для блогу? Напишіть нам."
                link={{ href: "/kontakty", label: "Запропонувати статтю" }}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
