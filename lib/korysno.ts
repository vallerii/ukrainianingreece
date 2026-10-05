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

export type Topic = {
  slug: string;
  title: string;
  lead: string;
  keywords: string[];
  links: { label: string; href: string; note?: string }[];
  /** Внутрішні посилання (проєкти, сторінки сайту) */
  internal?: { label: string; href: string }[];
};

export const topics: Topic[] = [
  {
    slug: "dokumenty",
    title: "Документи та легалізація",
    lead: "Тимчасовий захист, дозвіл на проживання, податковий номер, переклад і легалізація документів.",
    keywords: ["документ", "легаліз", "тимчасов", "дозвіл", "посвідк", "паспорт", "AFM", "ΑΦΜ", "податков номер", "міграц"],
    links: [
      { label: "Міністерство міграції Греції — інформація для українців", href: "https://migration.gov.gr/en/ukraina_ukr/" },
      { label: "Посольство України в Греції", href: "https://greece.mfa.gov.ua/" },
      { label: "Державний портал gov.gr", href: "https://www.gov.gr/", note: "грецькою та англійською" },
    ],
  },
  {
    slug: "osvita",
    title: "Освіта і школи",
    lead: "Як записати дитину до грецької школи чи садочка, підготовчі класи, українські суботні школи.",
    keywords: ["школ", "садоч", "дитсад", "навчан", "освіт", "учн", "клас"],
    links: [{ label: "Міністерство освіти Греції", href: "https://www.minedu.gov.gr/" }],
    internal: [
      { label: "Суботня школа «Трембіта», Афіни", href: "/proyekty/trembita" },
      { label: "Суботня школа «Лелеки», Іракліон", href: "/proyekty/leleki-shkola" },
    ],
  },
  {
    slug: "medytsyna",
    title: "Медицина",
    lead: "Номер AMKA, державне страхування, як потрапити до лікаря, щеплення дітей.",
    keywords: ["лікар", "медиц", "лікарн", "AMKA", "ΑΜΚΑ", "страхуван", "щеплен", "EOPYY", "аптек"],
    links: [
      { label: "AMKA — номер соціального страхування", href: "https://www.amka.gr/" },
      { label: "EOPYY — державне медичне страхування", href: "https://www.eopyy.gov.gr/" },
    ],
  },
  {
    slug: "robota",
    title: "Робота",
    lead: "Пошук роботи, реєстрація в службі зайнятості, права працівника.",
    keywords: ["робот", "працевлаштув", "вакансі", "резюме", "DYPA", "роботодав", "зарплат"],
    links: [{ label: "DYPA — державна служба зайнятості Греції", href: "https://www.dypa.gov.gr/" }],
  },
  {
    slug: "zhytlo",
    title: "Житло",
    lead: "Оренда, договір, комунальні послуги, на що звернути увагу.",
    keywords: ["житл", "оренд", "квартир", "комунальн", "орендодав"],
    links: [],
  },
  {
    slug: "finansy",
    title: "Банки й податки",
    lead: "Банківський рахунок, податковий номер AFM, податкова декларація.",
    keywords: ["банк", "рахун", "податк", "AFM", "ΑΦΜ", "декларац"],
    links: [{ label: "Податкова служба Греції (AADE)", href: "https://www.aade.gr/" }],
  },
  {
    slug: "mova",
    title: "Грецька мова",
    lead: "Курси грецької для дорослих і дітей, мовна підтримка в школі.",
    keywords: ["грецька мова", "грецької мови", "курси грецької", "уроки грецької", "вивчення грецької", "мовна підтримка"],
    links: [],
  },
  {
    slug: "dopomoha",
    title: "Соціальна допомога",
    lead: "Гуманітарна допомога, соціальні виплати, де шукати підтримку.",
    keywords: ["допомог", "виплат", "гуманітарн", "соціальн", "UNHCR"],
    links: [{ label: "UNHCR Greece — довідка для біженців", href: "https://help.unhcr.org/greece/" }],
    internal: [{ label: "Інформаційний центр спільноти", href: "/proyekty/info-tsentr" }],
  },
];

export const getTopic = (slug: string) => topics.find((t) => t.slug === slug);

/** Статті теми (CMS-фільтр + перевірка «з початку слова»). */
export async function getTopicArticles(topic: Topic): Promise<Article[]> {
  const items = await getArticlesByKeywords(topic.keywords);
  const kws = topic.keywords.map((k) => k.toLowerCase());
  return items.filter((a) => {
    const text = `${a.title} ${stripHtml(a.html)}`;
    return kws.some((k) => matchesAll(text, [k]));
  });
}
