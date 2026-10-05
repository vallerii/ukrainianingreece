/**
 * Публічна адреса сайту — для sitemap, robots, канонічних посилань і OG-картинок.
 * Задається в NEXT_PUBLIC_SITE_URL (наприклад https://ukrainianingreece.gr).
 * На Vercel без цієї змінної беремо продакшн-домен проєкту.
 */
function resolveSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
