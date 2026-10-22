import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle, getArticleSlugs } from "@/lib/cms";
import { getLatestBlogPosts, BLOG_HREF } from "@/lib/blog";
import { getMedia } from "@/lib/media";
import { excerpt, formatDate } from "@/lib/format";
import PageHead from "@/components/cms/PageHead";
import RichText from "@/components/cms/RichText";
import Cover from "@/components/cms/Cover";
import Media from "@/components/cms/Media";
import SectionHead from "@/components/ui/SectionHead";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getArticleSlugs()).filter((a) => a.href.startsWith(BLOG_HREF)).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getArticle((await params).slug);
  if (!post || !post.href.startsWith(BLOG_HREF)) return {};
  const description = excerpt(post.html, 160);
  return {
    title: post.title,
    description,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: post.date,
      images: post.image ? [{ url: post.image.url }] : undefined,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = await getArticle(slug);
  // у блозі — лише статті; новина за цією адресою не відкривається
  if (!post || !post.href.startsWith(BLOG_HREF)) notFound();

  const [more, media] = await Promise.all([getLatestBlogPosts(3, post.id), getMedia("article", slug)]);

  return (
    <>
      <PageHead
        eyebrow={
          <Link href={BLOG_HREF} className="hover:text-ink">
            ← Блог
          </Link>
        }
        title={post.title}
      >
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-mute">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.author && (
            <span className="flex items-center gap-3">
              {post.author.image && (
                <Image
                  src={post.author.image.url}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
              )}
              {post.author.name}
            </span>
          )}
        </div>
      </PageHead>

      <article className="bg-paper pb-24 pt-14 md:pt-16">
        {post.image && (
          <div className="shell mb-14 md:mb-16">
            <Cover image={post.image} hue={post.hue} ratio="aspect-[16/8]" priority zoom={false} sizes="100vw" />
          </div>
        )}
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[10rem_1fr]">
            <div className="hidden lg:block">
              <div className="rule w-16 bg-wheat-400" />
            </div>
            <div className="min-w-0">
              <RichText html={post.html} className="max-w-[44rem]" />
              <Media media={media} className="mt-14" />
            </div>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section className="bg-paper-dim py-20 md:py-24">
          <div className="shell">
            <SectionHead eyebrow="Читайте також" title="Інші статті блогу" link={BLOG_HREF} linkLabel="Увесь блог" />
            <div className="grid gap-10 pt-10 md:grid-cols-3">
              {more.map((a) => (
                <Link key={a.id} href={a.href} className="group block">
                  <Cover image={a.image} hue={a.hue} sizes="(min-width: 768px) 33vw, 100vw" />
                  <p className="mt-5 text-[0.7rem] uppercase tracking-[0.18em] text-mute">{formatDate(a.date)}</p>
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
