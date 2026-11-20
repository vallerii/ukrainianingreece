/**
 * «Корисна інформація» — довідник для тих, хто щойно приїхав.
 *
 * Теми задаються тут. Статті з DatoCMS потрапляють у тему автоматично, якщо в заголовку
 * чи тексті є одне з ключових слів (`keywords`, збіг з початку слова, без урахування регістру).
 * Щоб стаття з’явилась у темі — достатньо вжити в ній відповідні слова; щоб тема
 * ловила більше — додайте ключове слово сюди.
 *
 * Корисні посилання — лише офіційні джерела.
 */
import { getArticlesByKeywords, type Article } from "./cms";
import { matchesAll, stripHtml } from "./search";
import { getT } from "./i18n/server";

export type Topic = {
  slug: string;
  title: string;
  lead: string;
  keywords: string[];
  links: { label: string; href: string; note?: string }[];
  /** Внутрішні посилання (проєкти, сторінки сайту) */
  internal?: { label: string; href: string }[];
};

/** Теми довідника — у словниках (t.topics): назви, описи, ключові слова й підписи посилань мовою сторінки. */
export const getTopics = (): Topic[] => getT().topics;


export const getTopic = (slug: string) => getTopics().find((t) => t.slug === slug);

/** Статті теми (CMS-фільтр + перевірка «з початку слова»). */
export async function getTopicArticles(topic: Topic): Promise<Article[]> {
  const items = await getArticlesByKeywords(topic.keywords);
  const kws = topic.keywords.map((k) => k.toLowerCase());
  return items.filter((a) => {
    const text = `${a.title} ${stripHtml(a.html)}`;
    return kws.some((k) => matchesAll(text, [k]));
  });
}
