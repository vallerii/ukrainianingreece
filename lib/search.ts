/**
 * Загальний пошук по сайту (варіант 1 — без зовнішніх сервісів).
 *
 *  • Статті й події — запит до DatoCMS (фільтр `matches`, див. searchCms у lib/cms.ts).
 *  • Проєкти (організації з DatoCMS), «Про нас» та інші сторінки з коду — шукаємо тут же.
 *
 * Обмеження: це пошук за входженням рядка. Щоб «школа» знаходила «школи», слова запиту
 * обрізаються до основи (див. stem). Опечатки не виправляються.
 * Після виходу сайту в інтернет «двигун» можна замінити на DatoCMS Site Search,
 * не змінюючи сторінку /poshuk.
 */
import { searchCms, type Article, type CmsEvent } from "./cms";
import { getOrganizations, type Org } from "./organizations";
import { goals, geography, team, timeline, values } from "./about";
import { site } from "./site";
import { topics } from "./korysno";

export const MIN_QUERY = 2;

const norm = (s: string) => s.toLowerCase().replace(/[’ʼ`']/g, "'").replace(/ё/g, "е");

/** Груба «основа» слова: прибираємо 1–2 останні літери (закінчення). */
function stem(word: string) {
  if (word.length >= 7) return word.slice(0, -2);
  if (word.length >= 5) return word.slice(0, -1);
  return word;
}

/** Розбиває запит на слова-основи (не більше 5). */
export function parseQuery(q: string) {
  return norm(q)
    .split(/[^\p{L}\p{N}']+/u)
    .filter((w) => w.length >= MIN_QUERY)
    .slice(0, 5)
    .map(stem);
}

const escRe = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Збіг лише з початку слова: «крит» знайде «Криту», але не «відкритість». */
const wordStart = (t: string) => new RegExp(`(?<![\\p{L}\\p{N}])${escRe(t)}`, "iu");

/** Чи містить текст усі слова запиту (кожне — з початку слова). */
export function matchesAll(text: string, terms: string[]) {
  const n = norm(text);
  return terms.every((t) => wordStart(t).test(n));
}

export function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;/g, "’")
    .replace(/\s+/g, " ")
    .trim();
}

/* ── Підсвітка й уривок ─────────────────────────────────────── */

export type Segment = { text: string; hit: boolean };

/** Розбиває текст на шматки, позначаючи збіги зі словами запиту. */
export function highlight(text: string, terms: string[]): Segment[] {
  if (!terms.length) return [{ text, hit: false }];
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(${terms.map(escRe).join("|")})`, "giu");
  return text
    .split(re)
    .filter(Boolean)
    .map((part) => ({ text: part, hit: terms.some((t) => norm(part) === t) }));
}

/** Уривок ~200 символів навколо першого збігу. */
export function snippet(text: string, terms: string[], size = 200) {
  const n = norm(text);
  const idx = Math.min(...terms.map((t) => n.search(wordStart(t))).filter((i) => i >= 0), Infinity);
  if (!isFinite(idx) || text.length <= size) {
    return text.length <= size ? text : text.slice(0, text.lastIndexOf(" ", size)) + "…";
  }
  let start = Math.max(0, idx - Math.round(size / 3));
  if (start > 0) start = text.indexOf(" ", start) + 1;
  let end = Math.min(text.length, start + size);
  if (end < text.length) end = text.lastIndexOf(" ", end);
  return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
}

/* ── Індекс сторінок, що живуть у коді ──────────────────────── */

type StaticDoc = { title: string; href: string; section: string; text: string };

const orgText = (o: Org) =>
  [o.subtitle, o.summary, o.city, ...o.facts.map((f) => `${f.label}: ${f.value}`), stripHtml(o.html)]
    .filter(Boolean)
    .join(" ");

// функція, а не константа: lib/korysno ↔ lib/search імпортують одне одного
const staticDocs = (orgs: Org[]): StaticDoc[] => [
  ...orgs.map((o) => ({
    title: o.title,
    href: `/proyekty/${o.slug}`,
    section: `Проєкт ${o.n} · ${o.city}`,
    text: orgText(o),
  })),
  {
    title: "Хто ми є",
    href: "/pro-nas#opys",
    section: "Про нас",
    text:
      "Об’єднана українська діаспора в Греції — мережа українських організацій, шкіл, клубів та ініціатив. Місія, візія, цінності. " +
      values.map((v) => `${v.k}. ${v.v}`).join(" "),
  },
  {
    title: "Цілі",
    href: "/pro-nas#tsili",
    section: "Про нас",
    text: goals.map((g) => `${g.title}. ${g.text}`).join(" "),
  },
  {
    title: "Історія",
    href: "/pro-nas#istoriya",
    section: "Про нас",
    text: timeline.map((t) => `${t.title}. ${t.text}`).join(" "),
  },
  {
    title: "Географія",
    href: "/pro-nas#geografiya",
    section: "Про нас",
    text: geography.map((g) => `${g.city} — ${g.role}. ${g.text}`).join(" "),
  },
  {
    title: "Команда",
    href: "/pro-nas#komanda",
    section: "Про нас",
    text: team.map((t) => `${t.role}: ${t.area}`).join(". "),
  },
  {
    title: "Корисна інформація",
    href: "/korysno",
    section: "Довідник",
    text: "Довідник: " + topics.map((t) => t.title).join(", "),
  },
  ...topics.map((t) => ({
    title: t.title,
    href: `/korysno/${t.slug}`,
    section: "Корисна інформація",
    text: `${t.lead} ${t.links.map((l) => l.label).join(". ")}`,
  })),
  {
    title: "Контакти",
    href: "/kontakty",
    section: "Сторінка",
    text: `Звʼязатися з нами. ${site.email}, ${site.phone}, ${site.address}. ${site.cities.join(", ")}.`,
  },
  {
    title: "Підтримати",
    href: "/pidtrymaty",
    section: "Сторінка",
    text: "Донат, волонтерство, партнерство. Підтримати спільноту.",
  },
];

function searchStatic(terms: string[], orgs: Org[]) {
  return staticDocs(orgs)
    .map((d) => {
      const t = norm(d.title);
      const body = norm(d.text);
      if (!matchesAll(`${t} ${body}`, terms)) return null;
      const score = terms.reduce((acc, w) => {
        const re = new RegExp(wordStart(w).source, "giu");
        return acc + (wordStart(w).test(t) ? 10 : 0) + (body.match(re)?.length ?? 0);
      }, 0);
      return { ...d, score };
    })
    .filter((d): d is StaticDoc & { score: number } => d !== null)
    .sort((a, b) => b.score - a.score);
}

/* ── Головна функція ───────────────────────────────────────── */

export type SearchResults = {
  terms: string[];
  articles: Article[];
  events: CmsEvent[];
  projects: StaticDoc[];
  pages: StaticDoc[];
  total: number;
};

export async function searchSite(q: string): Promise<SearchResults> {
  const terms = parseQuery(q);
  if (!terms.length) return { terms, articles: [], events: [], projects: [], pages: [], total: 0 };

  const [cms, orgs] = await Promise.all([searchCms(terms), getOrganizations()]);
  const docs = searchStatic(terms, orgs);
  // DatoCMS шукає входження будь-де в слові — лишаємо тільки збіги з початку слова
  const articles = cms.articles.filter((a) => matchesAll(`${a.title} ${stripHtml(a.html)}`, terms));
  const events = cms.events.filter((e) =>
    matchesAll(`${e.title} ${e.description} ${stripHtml(e.html)} ${stripHtml(e.report.html)}`, terms),
  );
  const projects = docs.filter((d) => d.href.startsWith("/proyekty"));
  const pages = docs.filter((d) => !d.href.startsWith("/proyekty"));
  return {
    terms,
    articles,
    events,
    projects,
    pages,
    total: articles.length + events.length + projects.length + pages.length,
  };
}
