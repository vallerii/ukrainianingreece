import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticlesPage, getArticleTypes, parsePage } from "@/lib/cms";
import PageHead from "@/components/cms/PageHead";
import FilterBar from "@/components/cms/FilterBar";
import ArticleRow from "@/components/cms/ArticleRow";
import EmptyState from "@/components/cms/EmptyState";
import Pagination from "@/components/cms/Pagination";
import Reveal from "@/components/ui/Reveal";

export const revalidate = 60;

type Props = { searchParams: Promise<{ type?: string; page?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  return {
    title: page > 1 ? `Новини — сторінка ${page}` : "Новини",
    description:
      "Новини та статті української спільноти Греції: анонси, репортажі, корисні посібники, історії людей.",
  };
}

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const { types, total } = await getArticleTypes();
  const active = types.find((t) => t.slug === sp.type) ?? null;
  const list = await getArticlesPage(page, active?.id ?? null);

  if (page > list.pages) notFound();

  const options = [
    { label: "Усі", href: "/novyny", active: !active, count: total },
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
        eyebrow="Новини"
        title={
          <>
            Що відбувається
            <br />у <span className="text-sky-700">спільноті</span>
          </>
        }
        lead="Новини, статті та посібники від української спільноти Греції — про події, освіту, допомогу та людей."
      />

      <FilterBar label="Тип матеріалу" options={options} />

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
              title="Тут поки нічого немає"
              text="У цій категорії ще немає матеріалів. Подивіться всі новини."
              link={{ href: "/novyny", label: "Усі новини" }}
            />
          )}
        </div>
      </section>
    </>
  );
}
