/** Дати показуємо за часом Афін — незалежно від того, де стоїть сервер. */
export const TIME_ZONE = "Europe/Athens";
const LOCALE = "uk-UA";

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, ...opts });

const dayMonth = fmt({ day: "numeric", month: "long" });
const fullDate = fmt({ day: "numeric", month: "long", year: "numeric" });
const timeOnly = fmt({ hour: "2-digit", minute: "2-digit", hour12: false });
const keyFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** «2026-05-17» — календарний день за Афінами, для порівнянь. */
export function dayKey(d: Date | string) {
  return keyFmt.format(new Date(d));
}

/** «3 жовтня 2026» */
export function formatDate(iso: string) {
  return fullDate.format(new Date(iso)).replace(/\s*р\.$/, "");
}

/** «16:00» */
export function formatTime(iso: string) {
  return timeOnly.format(new Date(iso));
}

/** Розбивка для великої дати в списках: { day: "17", month: "травня", year: "2026" } */
export function dateParts(iso: string) {
  const parts = dayMonth.formatToParts(new Date(iso));
  return {
    day: parts.find((p) => p.type === "day")?.value.padStart(2, "0") ?? "",
    month: parts.find((p) => p.type === "month")?.value ?? "",
    year: dayKey(iso).slice(0, 4),
  };
}

export function yearOf(iso: string) {
  return Number(dayKey(iso).slice(0, 4));
}

/**
 * Діапазон події:
 *  «17 травня 2026, 16:00 — 19:00»
 *  «8 — 10 березня 2026»
 *  «30 березня — 2 квітня 2026»
 */
export function formatRange(start: string, finish: string | null) {
  if (!finish || dayKey(start) === dayKey(finish)) {
    const time = finish
      ? `${formatTime(start)} — ${formatTime(finish)}`
      : formatTime(start);
    return `${formatDate(start)}, ${time}`;
  }
  const a = dateParts(start);
  const b = dateParts(finish);
  const left = a.year === b.year ? `${Number(a.day)} ${a.month}` : formatDate(start);
  return `${left} — ${formatDate(finish)}`;
}

/** Час для рядка події: «16:00 — 19:00» або «до 10 березня». */
export function formatTimeSpan(start: string, finish: string | null) {
  if (!finish) return formatTime(start);
  if (dayKey(start) === dayKey(finish)) return `${formatTime(start)} — ${formatTime(finish)}`;
  const b = dateParts(finish);
  return `до ${Number(b.day)} ${b.month}`;
}

/** Прибирає HTML-теги і повертає стислий анонс. */
export function excerpt(html: string, max = 180) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;/g, "’")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:—-]+$/, "") + "…";
}

/** Транслітерація для адрес фільтрів: «Культура» → «kultura». */
const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie", ж: "zh", з: "z",
  и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
  р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ь: "", ю: "iu", я: "ia", "’": "", "'": "",
};

export function slugify(input: string) {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Стабільний відтінок для градієнтних заглушок замість фото. */
export function hueFrom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const palette = [212, 42, 198, 225, 34, 205];
  return palette[h % palette.length];
}
