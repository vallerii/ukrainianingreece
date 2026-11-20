/**
 * Завантаження матеріалу: /api/download/<slug>/<uk|en|el>
 * Рахує завантаження у DatoCMS (модель «Download counter», запис «<slug> · <мова>»)
 * і перенаправляє на сам файл. Лічильник пишеться після відповіді — користувач не чекає.
 */
import { NextResponse, after } from "next/server";
import { getResourceFile } from "@/lib/resources";
import { isLocale } from "@/lib/i18n/config";

const API = "https://site-api.datocms.com";

/** {"2026-11": 34, …} → +1 у поточному місяці (JSON-поле DatoCMS зберігається рядком) */
function bump(raw: unknown, month: string) {
  let data: Record<string, number> = {};
  try {
    data = typeof raw === "string" ? JSON.parse(raw) : ((raw as Record<string, number>) ?? {});
  } catch {}
  data[month] = (data[month] ?? 0) + 1;
  return JSON.stringify(Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b))), null, 2);
}

async function count(key: string) {
  const token = process.env.DATOCMS_COUNTER_TOKEN || process.env.DATOCMS_FORMS_TOKEN;
  const model = process.env.DATOCMS_MODEL_DOWNLOAD_COUNTER;
  if (!token || !model) return;
  const H = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/vnd.api+json",
    "X-Api-Version": "3",
  };
  const now = new Date().toISOString();
  // місяць за часом Афін: "2026-11"
  const month = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Athens", year: "numeric", month: "2-digit" }).format(new Date()).slice(0, 7);
  try {
    const q = new URLSearchParams({ "filter[type]": model, "filter[fields][key][eq]": key, "page[limit]": "1" });
    const found = await fetch(`${API}/items?${q}`, { headers: H, cache: "no-store" });
    if (!found.ok) throw new Error(`read ${found.status}: ${await found.text()}`);
    const item = (await found.json()).data?.[0];
    const res = item
      ? await fetch(`${API}/items/${item.id}`, {
          method: "PUT",
          headers: H,
          body: JSON.stringify({
            data: {
              type: "item",
              id: item.id,
              attributes: { count: (item.attributes.count ?? 0) + 1, last_download: now, by_month: bump(item.attributes.by_month, month) },
            },
          }),
        })
      : await fetch(`${API}/items`, {
          method: "POST",
          headers: H,
          body: JSON.stringify({
            data: {
              type: "item",
              attributes: { key, count: 1, last_download: now, by_month: bump(null, month) },
              relationships: { item_type: { data: { type: "item_type", id: model } } },
            },
          }),
        });
    if (!res.ok) throw new Error(`write ${res.status}: ${await res.text()}`);
  } catch (e) {
    console.error("download counter:", e);
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug, lang } = await params;
  if (!isLocale(lang) || !/^[a-z0-9-]{1,80}$/.test(slug)) return new NextResponse("Not found", { status: 404 });

  const file = await getResourceFile(slug, lang);
  if (!file) return new NextResponse("Not found", { status: 404 });

  after(() => count(`${slug} · ${lang}`));
  return NextResponse.redirect(file.url, { status: 302, headers: { "Cache-Control": "no-store" } });
}
