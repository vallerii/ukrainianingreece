import Link from "@/components/i18n/Link";
import type { Article } from "@/lib/cms";
import { excerpt, formatDate } from "@/lib/format";
import Cover from "./Cover";

/** Рядок у стрічці новин чи блогу: дата/тип — заголовок і анонс — мініатюра. */
import { getLocale, getT } from "@/lib/i18n/server";

export default function ArticleRow({ article }: { article: Article }) {
  const t = getT();
  return (
    <Link
      href={article.href}
      className="group grid gap-6 border-b border-line py-10 md:grid-cols-[10rem_1fr_15rem] md:gap-10 md:py-12"
    >
      <div className="flex items-center gap-4 text-[0.72rem] uppercase tracking-[0.18em] text-mute md:block">
        {article.type && <p className="text-sky-700">{article.type.title}</p>}
        <p className="md:mt-2">{formatDate(article.date, getLocale())}</p>
      </div>
      <div className="order-last md:order-none">
        <h2 className="display max-w-2xl text-[clamp(1.12rem,1.92vw,1.6rem)] leading-[1.12] text-ink transition-colors group-hover:text-sky-700">
          {article.title}
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">{excerpt(article.html, 220)}</p>
        <span className="link-underline mt-5 inline-block text-sm font-bold text-ink">
          {t.common.readMore}
        </span>
      </div>
      <Cover image={article.image} hue={article.hue} sizes="(min-width: 768px) 15rem, 100vw" />
    </Link>
  );
}
