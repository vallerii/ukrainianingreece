/**
 * Фото й афіші (20.10.2026): додає в DatoCMS
 *   • афіші до 4 подій — файли scripts/event-posters/<slug>.jpg;
 *   • фото до «Розмовного клубу грецької мови» та «Розмовного клубу англійської мови»
 *     і оновлений опис клубу англійської (за афішею: група до 10 людей, 40 €/міс.).
 * Інші поля записів не змінює. Повторний запуск безпечний.
 *
 * Запуск: node scripts/datocms-photos-2026-10.mjs  (потрібен DATOCMS_ADMIN_TOKEN у .env)
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { basename } from "node:path";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const TOKEN = process.env.DATOCMS_ADMIN_TOKEN;
if (!TOKEN) {
  console.error("✖ Немає DATOCMS_ADMIN_TOKEN у .env");
  process.exit(1);
}
const API = "https://site-api.datocms.com";
const H = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/json",
  "Content-Type": "application/vnd.api+json",
  "X-Api-Version": "3",
};
async function cma(method, path, body) {
  const res = await fetch(API + path, { method, headers: H, body: body ? JSON.stringify({ data: body }) : undefined });
  const json = res.status === 204 ? {} : await res.json();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}\n${JSON.stringify(json, null, 2)}`);
  if (res.status === 202 && json.data?.type === "job") return waitJob(json.data.id);
  return json.data;
}
async function waitJob(id) {
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const res = await fetch(`${API}/job-results/${id}`, { headers: H });
    if (res.status === 200) {
      const json = await res.json();
      return json.data?.attributes?.payload?.data ?? json.data;
    }
  }
  throw new Error("Job timeout");
}

const CACHE = "scripts/.datocms-uploads.json";
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf8")) : {};
async function uploadFile(file, kind) {
  if (cache[file]) return cache[file];
  if (!existsSync(file)) {
    console.warn(`   ! немає файлу ${file}`);
    return null;
  }
  const filename = basename(file);
  const req = await cma("POST", "/upload-requests", { type: "upload_request", attributes: { filename } });
  const put = await fetch(req.attributes.url, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg", ...(req.attributes.request_headers ?? {}) },
    body: readFileSync(file),
  });
  if (!put.ok) throw new Error(`Не вдалося завантажити ${file}: ${put.status}`);
  const upload = await cma("POST", "/uploads", { type: "upload", attributes: { path: req.id } });
  cache[file] = upload.id;
  writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  console.log(`   ↑ ${kind} ${filename}`);
  return upload.id;
}

const models = await cma("GET", "/item-types");
const site = await cma("GET", "/site");
const locales = site.attributes.locales;

// ── афіші подій ───────────────────────────────────────────────
const eventModel = models.find((m) => m.attributes.api_key === "event");
if (eventModel) {
  const fields = await cma("GET", `/item-types/${eventModel.id}/fields`);
  const imageLocalized = fields.find((f) => f.attributes.api_key === "image")?.attributes.localized;
  const events = await cma("GET", `/items?filter[type]=${eventModel.id}&page[limit]=100`);
  const slugOf = (e) => (typeof e.attributes.slug === "object" ? Object.values(e.attributes.slug ?? {})[0] : e.attributes.slug);
  const posters = existsSync("scripts/event-posters") ? readdirSync("scripts/event-posters") : [];
  for (const file of posters) {
    const slug = file.replace(/\.(jpe?g|png|webp)$/i, "");
    const ev = events.find((e) => slugOf(e) === slug);
    if (!ev) {
      console.warn(`! Подію ${slug} не знайдено — афішу пропущено`);
      continue;
    }
    console.log(`\nПодія: ${slug}`);
    const id = await uploadFile(`scripts/event-posters/${file}`, "афіша");
    if (!id) continue;
    const value = { upload_id: id };
    const image = imageLocalized ? Object.fromEntries(locales.map((l) => [l, value])) : value;
    await cma("PUT", `/items/${ev.id}`, { type: "item", id: ev.id, attributes: { image } });
    await cma("PUT", `/items/${ev.id}/publish`);
    console.log("   ✔ афішу додано");
  }
}

// ── клуби ─────────────────────────────────────────────────────
const orgModel = models.find((m) => m.attributes.api_key === "organization");
const seed = Object.fromEntries(JSON.parse(readFileSync("scripts/organizations-seed.json", "utf8")).map((o) => [o.slug, o]));
const items = await cma("GET", `/items?filter[type]=${orgModel.id}&page[limit]=100`);
const PATCH = {
  "klub-hretskoi": ["gallery"],
  "klub-anhliiskoi": ["summary", "subtitle", "content", "facts", "phone", "address", "gallery"],
};
for (const [slug, keys] of Object.entries(PATCH)) {
  const item = items.find((it) => it.attributes.slug === slug);
  const org = seed[slug];
  if (!item || !org) {
    console.warn(`! Немає запису ${slug} — спершу запустіть datocms-update-2026-10.mjs`);
    continue;
  }
  console.log(`\n${org.name}`);
  const attributes = {};
  for (const k of keys) {
    if (k === "gallery") {
      const gallery = [];
      for (const g of org.gallery_files ?? []) {
        const id = await uploadFile(g.file, "фото");
        if (id) gallery.push({ upload_id: id, alt: g.alt ?? null, title: null, custom_data: {}, focal_point: null });
      }
      attributes.gallery = gallery;
    } else attributes[k] = org[k];
  }
  await cma("PUT", `/items/${item.id}`, { type: "item", id: item.id, attributes });
  await cma("PUT", `/items/${item.id}/publish`);
  console.log(`   ↻ оновлено: ${keys.join(", ")}`);
}
console.log("\nГотово. Оновіть сторінку сайту через хвилину.");
