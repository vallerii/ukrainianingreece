import { datoRequest } from "@/lib/datocms";
import { isBlogType, todayStart } from "@/lib/cms";
import { localeMeta, localizeHref, type Locale } from "@/lib/i18n/config";
import { formatRange, TIME_ZONE } from "@/lib/format";
import { absoluteUrl } from "@/lib/seo";
import { SENDER_NAME } from "./brevo";

/**
 * Щомісячний дайджест: новини й статті за останні 30 днів + події на найближчі 31 день.
 * Мова листа = мова списку підписників; тексти з DatoCMS цією мовою, без перекладу — українською.
 */

const DAYS_BACK = 30;
const DAYS_AHEAD = 31;
const MAX_ARTICLES = 6;
const MAX_EVENTS = 10;

const T: Record<Locale, {
  subject: (month: string) => string;
  preheader: string;
  intro: string;
  events: string;
  news: string;
  read: string;
  details: string;
  allEvents: string;
  allNews: string;
  support: string;
  why: string;
  unsubscribe: string;
  web: string;
}> = {
  uk: {
    subject: (m) => `Новини та події спільноти — ${m}`,
    preheader: "Що відбулося за місяць і куди піти найближчими тижнями.",
    intro: "Що відбулося в українській спільноті Греції за останній місяць і що чекає на нас найближчими тижнями.",
    events: "Найближчі події",
    news: "Новини місяця",
    read: "Читати",
    details: "Деталі",
    allEvents: "Увесь календар подій",
    allNews: "Усі новини",
    support: "Підтримати спільноту",
    why: "Ви отримали цей лист, бо підписалися на розсилку на сайті ukrainianingreece.gr.",
    unsubscribe: "Відписатися",
    web: "Відкрити в браузері",
  },
  en: {
    subject: (m) => `Community news and events — ${m}`,
    preheader: "What happened this month and what is coming up next.",
    intro: "What happened in the Ukrainian community in Greece over the past month, and what is coming up in the weeks ahead.",
    events: "Upcoming events",
    news: "News of the month",
    read: "Read",
    details: "Details",
    allEvents: "Full events calendar",
    allNews: "All news",
    support: "Support the community",
    why: "You are receiving this email because you subscribed on ukrainianingreece.gr.",
    unsubscribe: "Unsubscribe",
    web: "View in browser",
  },
  el: {
    subject: (m) => `Νέα και εκδηλώσεις της κοινότητας — ${m}`,
    preheader: "Τι έγινε αυτόν τον μήνα και τι ακολουθεί.",
    intro: "Τι συνέβη στην ουκρανική κοινότητα της Ελλάδας τον τελευταίο μήνα και τι μας περιμένει τις επόμενες εβδομάδες.",
    events: "Επερχόμενες εκδηλώσεις",
    news: "Νέα του μήνα",
    read: "Διαβάστε",
    details: "Λεπτομέρειες",
    allEvents: "Όλο το ημερολόγιο",
    allNews: "Όλα τα νέα",
    support: "Στηρίξτε την κοινότητα",
    why: "Λαμβάνετε αυτό το μήνυμα επειδή εγγραφήκατε στο ukrainianingreece.gr.",
    unsubscribe: "Διαγραφή",
    web: "Προβολή στο πρόγραμμα περιήγησης",
  },
};

type Img = { url: string; alt: string | null } | null;
type RawArticle = { slug: string; title: string; _firstPublishedAt: string; content: string | null; tags: { title: string } | null; image: Img };
type RawEvent = { slug: string; title: string; description: string | null; dateStart: string; dateFinish: string | null; image: Img };

export type Digest = {
  locale: Locale;
  subject: string;
  html: string;
  counts: { articles: number; events: number };
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Перші ~N символів тексту без розмітки, по межі слова. */
function excerpt(html: string | null, max = 180) {
  const text = (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "").replace(/[\s.,;:!?…—-]+$/, "") + "…";
}

const img = (url: string, w: number, h: number) =>
  `${url}${url.includes("?") ? "&" : "?"}w=${w}&h=${h}&fit=crop&auto=format`;

/** «Грудень 2026» / «December 2026» / «Δεκέμβριος 2026» */
function monthName(locale: Locale, now: Date) {
  const opts = { timeZone: TIME_ZONE } as const;
  // Intl для грецької дає родовий відмінок («Οκτωβρίου»), а в заголовку потрібен називний
  const EL = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];
  const monthIdx = Number(new Intl.DateTimeFormat("en", { ...opts, month: "numeric" }).format(now)) - 1;
  const m = locale === "el" ? EL[monthIdx] : new Intl.DateTimeFormat(localeMeta[locale].intl, { ...opts, month: "long" })
    .formatToParts(now)
    .find((p) => p.type === "month")?.value ?? "";
  const y = new Intl.DateTimeFormat("en", { ...opts, year: "numeric" }).format(now);
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${y}`;
}

async function fetchContent(locale: Locale, now: Date) {
  const loc = locale === "uk" ? "locale: uk" : `locale: ${locale}, fallbackLocales: [uk]`;
  const since = new Date(now.getTime() - DAYS_BACK * 864e5).toISOString();
  const today = todayStart(now);
  const until = new Date(now.getTime() + DAYS_AHEAD * 864e5).toISOString();
  const data = await datoRequest<{ articles: RawArticle[]; events: RawEvent[] }>(
    `query Digest($since: DateTime, $today: DateTime, $until: DateTime) {
      articles: allArticles(${loc}, first: ${MAX_ARTICLES}, orderBy: _firstPublishedAt_DESC, filter: { _firstPublishedAt: { gte: $since } }) {
        slug title _firstPublishedAt content(markdown: true) tags { title } image { url alt }
      }
      events: allEvents(${loc}, first: ${MAX_EVENTS}, orderBy: dateStart_ASC, filter: {
        dateStart: { lte: $until },
        OR: [{ dateStart: { gte: $today } }, { dateFinish: { gte: $today } }]
      }) {
        slug title description dateStart dateFinish image { url alt }
      }
    }`,
    { since, today, until },
  );
  return data;
}

const A = "color:#062E5F;text-decoration:underline;";

function button(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:#FFC93C;color:#0A1420;text-decoration:none;padding:12px 24px;font-size:15px;">${esc(label)}</a>`;
}

function heading(text: string) {
  return `<tr><td style="padding:32px 32px 8px;"><p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#B37A00;">${esc(text)}</p><div style="height:1px;background:#DFDACE;margin-top:10px;line-height:1px;font-size:1px;">&nbsp;</div></td></tr>`;
}

export async function buildDigest(locale: Locale, now = new Date()): Promise<Digest> {
  const t = T[locale];
  const { articles, events } = await fetchContent(locale, now);
  const url = (path: string) => absoluteUrl(localizeHref(path, locale));
  const month = monthName(locale, now);

  const eventRows = events
    .map((e) => {
      const href = url(`/podiyi/${e.slug}`);
      const desc = e.description ? excerpt(e.description, 160) : "";
      return `<tr><td style="padding:14px 32px;border-bottom:1px solid #EEE9DD;">
        <p style="margin:0 0 4px;font-size:13px;color:#B37A00;">${esc(formatRange(e.dateStart, e.dateFinish, locale))}</p>
        <p style="margin:0 0 4px;font-size:17px;line-height:1.35;"><a href="${href}" style="color:#0A1420;text-decoration:none;">${esc(e.title)}</a></p>
        ${desc ? `<p style="margin:0 0 6px;font-size:14px;line-height:1.5;color:#3d4753;">${esc(desc)}</p>` : ""}
        <a href="${href}" style="${A}font-size:14px;">${esc(t.details)} →</a>
      </td></tr>`;
    })
    .join("");

  const articleRows = articles
    .map((a, i) => {
      const section = isBlogType(a.tags?.title) ? "blog" : "novyny";
      const href = url(`/${section}/${a.slug}`);
      const pic = a.image
        ? `<a href="${href}"><img src="${img(a.image.url, i === 0 ? 1072 : 400, i === 0 ? 600 : 260)}" alt="${esc(a.image.alt ?? a.title)}" width="${i === 0 ? 536 : 200}" style="display:block;width:100%;max-width:${i === 0 ? 536 : 200}px;height:auto;border:0;margin:0 0 12px;"></a>`
        : "";
      return `<tr><td style="padding:16px 32px;border-bottom:1px solid #EEE9DD;">
        ${i === 0 ? pic : ""}
        <p style="margin:0 0 6px;font-size:${i === 0 ? 21 : 17}px;line-height:1.3;"><a href="${href}" style="color:#0A1420;text-decoration:none;">${esc(a.title)}</a></p>
        <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#3d4753;">${esc(excerpt(a.content))}</p>
        <a href="${href}" style="${A}font-size:14px;">${esc(t.read)} →</a>
      </td></tr>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="${localeMeta[locale].hreflang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(t.subject(month))}</title></head>
<body style="margin:0;padding:0;background:#F1EDE3;">
<div style="display:none;max-height:0;overflow:hidden;">${esc(t.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1EDE3;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FBF8F1;font-family:Arial,Helvetica,sans-serif;color:#0A1420;">
  <tr><td style="background:#062E5F;padding:28px 32px;">
    <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#D6E8FA;">${esc(SENDER_NAME[locale])}</p>
    <h1 style="margin:10px 0 0;font-size:26px;font-weight:normal;color:#FFFFFF;">${esc(month)}</h1>
  </td></tr>
  <tr><td style="padding:24px 32px 0;"><p style="margin:0;font-size:16px;line-height:1.55;">${esc(t.intro)}</p></td></tr>
  ${events.length ? heading(t.events) + eventRows + `<tr><td style="padding:16px 32px 0;"><a href="${url("/podiyi")}" style="${A}font-size:14px;">${esc(t.allEvents)} →</a></td></tr>` : ""}
  ${articles.length ? heading(t.news) + articleRows + `<tr><td style="padding:16px 32px 0;"><a href="${url("/novyny")}" style="${A}font-size:14px;">${esc(t.allNews)} →</a></td></tr>` : ""}
  <tr><td style="padding:32px;">${button(url("/pidtrymaty"), t.support)}</td></tr>
  <tr><td style="background:#0A1420;padding:24px 32px;font-size:12px;line-height:1.6;color:#B8C0CA;">
    <p style="margin:0 0 8px;">${esc(t.why)}</p>
    <p style="margin:0 0 8px;">Feron 4, 10434 Athens, Greece · <a href="${absoluteUrl(localizeHref("/", locale))}" style="color:#FFC93C;">ukrainianingreece.gr</a></p>
    <p style="margin:0;"><a href="{{ unsubscribe }}" style="color:#FFC93C;">${esc(t.unsubscribe)}</a> · <a href="{{ mirror }}" style="color:#B8C0CA;">${esc(t.web)}</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { locale, subject: t.subject(month), html, counts: { articles: articles.length, events: events.length } };
}
