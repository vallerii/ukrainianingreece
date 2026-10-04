import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle, getArticleSlugs, getLatestArticles } from "@/lib/cms";
import { excerpt, formatDate } from "@/lib/format";
import PageHead from "@/components/cms/PageHead";
import RichText from "@/components/cms/RichText";
import Cover from "@/components/cms/Cover";
import SectionHead from "@/components/ui/SectionHead";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getArticleSlugs()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return {};
  const description = excerpt(article.html, 160);
  return {
    title: article.title,
    description,
    openGraph: {
      type: "article",
      title: article.title,
      description,
      publishedTime: article.date,
      images: article.image ? [{ url: article.image.url }] : undefined,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  // спочатку того ж типу, потім доповнюємо найсвіжішими
  const [sameType, latest] = await Promise.all([
    article.type ? getLatestArticles(3, { typeId: article.type.id, excludeId: article.id }) : [],
    getLatestArticles(4, { excludeId: article.id }),
  ]);
  const more = [...sameType, ...latest.filter((a) => !sameType.some((s) => s.id === a.id))].slice(0, 3);

  return (
    <>
      <PageHead
        eyebrow={
          <span className="flex flex-wrap items-center gap-4">
            <Link href="/novyny" className="hover:text-ink">
              ← Новини
            </Link>
            {article.type && (
              <>
                <span className="h-px w-8 bg-line" />
                <Link href={`/novyny?type=${article.type.slug}`} className="hover:text-ink">
                  {article.type.title}
                </Link>
              </>
            )}
          </span>
        }
        title={article.title}
      >
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-mute">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          {article.author && (
            <span className="flex items-center gap-3">
              {article.author.image && (
                <Image
                  src={article.author.image.url}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
              )}
              {article.author.name}
            </span>
          )}
        </div>
      </PageHead>

      <article className="bg-paper pb-24 pt-14 md:pt-16">
        {article.image && (
          <div className="shell mb-14 md:mb-16">
            <Cover image={article.image} hue={article.hue} ratio="aspect-[16/8]" priority zoom={false} sizes="100vw" />
          </div>
        )}
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[10rem_1fr]">
            <div className="hidden lg:block">
              <div className="rule w-16 bg-wheat-400" />
            </div>
            <RichText html={article.html} className="max-w-[44rem]" />
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section className="bg-paper-dim py-20 md:py-24">
          <div className="shell">
            <SectionHead eyebrow="Читайте також" title="Інші матеріали" link="/novyny" linkLabel="Усі новини" />
            <div className="grid gap-10 pt-10 md:grid-cols-3">
              {more.map((a) => (
                <Link key={a.id} href={`/novyny/${a.slug}`} className="group block">
                  <Cover image={a.image} hue={a.hue} sizes="(min-width: 768px) 33vw, 100vw" />
                  <p className="mt-5 flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.18em] text-mute">
                    {a.type && <span className="text-sky-700">{a.type.title}</span>}
                    {formatDate(a.date)}
                  </p>
                  <h3 className="mt-2.5 font-display text-[1.15rem] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-sky-700">
                    {a.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
