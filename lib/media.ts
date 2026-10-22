/**
 * Файли та відео до текстів (правка клієнта 22.10.2026).
 *
 * У DatoCMS у моделях з текстом є два поля:
 *   • «Files» (attachments)  — будь-які файли: PDF, PowerPoint, Word, Excel, архіви…
 *   • «Videos» (videos)      — посилання на YouTube, кожне з нового рядка.
 * У події окремо є «Report files» / «Report videos» — для звіту.
 *
 * Поля додає скрипт scripts/datocms-update-2026-10b.mjs. Поки його не запущено, запит
 * просто повертає порожній результат — решта сторінки працює як раніше.
 *
 * Крім того, якщо в тексті (Markdown) вставити посилання на YouTube ОКРЕМИМ рядком,
 * воно автоматично перетворюється на вбудоване відео (див. embedVideos).
 */
import { cache } from "react";
import { datoRequest } from "./datocms";

export type Attachment = {
  url: string;
  filename: string;
  /** Назва для показу: Title з DatoCMS або ім’я файлу */
  name: string;
  size: number;
  /** PDF, PPTX, DOCX… */
  ext: string;
};

export type Video = { id: string; url: string; embed: string };

export type Media = { files: Attachment[]; videos: Video[] };

export const EMPTY_MEDIA: Media = { files: [], videos: [] };

export const hasMedia = (m: Media) => m.files.length > 0 || m.videos.length > 0;

/* ── YouTube ─────────────────────────────────────────────── */

/** ID відео з будь-якого посилання YouTube (watch, youtu.be, shorts, live, embed). */
export function youtubeId(url: string): string | null {
  const u = url.trim().replace(/&amp;/g, "&");
  const m =
    u.match(/youtu\.be\/([\w-]{11})/i) ??
    u.match(/youtube(?:-nocookie)?\.com\/(?:embed|shorts|live|v)\/([\w-]{11})/i) ??
    u.match(/youtube\.com\/.*[?&]v=([\w-]{11})/i);
  return m ? m[1] : null;
}

const embedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?rel=0`;

/** Рядки з посиланнями → відео (не-YouTube посилання ігноруються). */
export function parseVideos(text: string | null | undefined): Video[] {
  const seen = new Set<string>();
  return (text ?? "")
    .split(/[\s,]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((url) => {
      const id = youtubeId(url);
      if (!id || seen.has(id)) return [];
      seen.add(id);
      return [{ id, url, embed: embedUrl(id) }];
    });
}

const iframe = (id: string) =>
  `<div class="video-embed"><iframe src="${embedUrl(id)}" title="Відео YouTube" loading="lazy" ` +
  `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ` +
  `referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;

/** Абзац, що складається лише з посилання на YouTube, → вбудований плеєр. */
export function embedVideos(html: string) {
  return html.replace(
    /<p>\s*(?:<a [^>]*href="([^"]+)"[^>]*>[^<]*<\/a>|(https?:\/\/[^\s<]+))\s*<\/p>/gi,
    (all, href?: string, bare?: string) => {
      const id = youtubeId(href ?? bare ?? "");
      return id ? iframe(id) : all;
    },
  );
}

/* ── Запит до DatoCMS ───────────────────────────────────── */

const FILE = `url filename size title`;

type RawFile = { url: string; filename: string; size: number; title: string | null };

const toFile = (f: RawFile): Attachment => {
  const ext = (f.filename.split(".").pop() ?? "").toUpperCase();
  const base = f.filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  return { url: f.url, filename: f.filename, name: f.title?.trim() || base || f.filename, size: f.size, ext };
};

export type MediaModel = "article" | "event" | "organization" | "blogPost";

/**
 * Файли й відео одного запису (за slug).
 * prefix "report" → поля reportAttachments / reportVideos (звіт події).
 */
export const getMedia = cache(
  async (model: MediaModel, slug: string, prefix: "" | "report" = ""): Promise<Media> => {
    const files = prefix ? `${prefix}Attachments` : "attachments";
    const videos = prefix ? `${prefix}Videos` : "videos";
    try {
      const data = await datoRequest<{ r: { f: RawFile[] | null; v: string | null } | null }>(
        `query Media($slug: String) {
          r: ${model}(filter: { slug: { eq: $slug } }) { f: ${files} { ${FILE} } v: ${videos} }
        }`,
        { slug },
      );
      if (!data.r) return EMPTY_MEDIA;
      return { files: (data.r.f ?? []).map(toFile), videos: parseVideos(data.r.v) };
    } catch {
      // полів ще немає (скрипт не запущено) або CMS недоступна
      return EMPTY_MEDIA;
    }
  },
);

export const fileSize = (b: number) =>
  b >= 1e6 ? `${(b / 1e6).toFixed(1).replace(".", ",")} МБ` : `${Math.max(1, Math.round(b / 1e3))} КБ`;
