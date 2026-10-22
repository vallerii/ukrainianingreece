/**
 * Оновлення DatoCMS за правками клієнта від 22.10.2026.
 *
 * Що робить (і нічого більше):
 *   1. Файли й відео до текстів. Додає поля, якщо їх ще немає:
 *        article, organization:  attachments «Files», videos «Videos (YouTube)»
 *        event:                  те саме + report_attachments / report_videos — для звіту
 *      Files — будь-які файли (PDF, PowerPoint, Word…), Videos — посилання на YouTube, кожне з нового рядка.
 *   2. Блог: окремої моделі не потрібно — Блог на сайті показує записи «article» з типом матеріалу
 *      «Стаття». Якщо раніше скрипт створив порожню модель «Blog post», вона видаляється.
 *   3. Організації: оновлює назви «Трембіти» й «Об’єднання Українок в Греції» (раніше «Союз українок»), новий текст її сторінки
 *      і речення про неї на сторінці «Борисфену» (дані — scripts/organizations-seed.json).
 *   4. У подіях і статтях замінює «Союз(у) українок у/в Греції» → «Об’єднання Українок в Греції» (єдине написання назви).
 * Змінені записи, які вже були опубліковані, публікуються знову.
 *
 * Запуск (на вашому комп’ютері, з інтернетом, у папці сайту):
 *   1. У .env має бути DATOCMS_ADMIN_TOKEN (роль Admin + Content Management API).
 *   2. node scripts/datocms-update-2026-10b.mjs
 *   3. Видалити DATOCMS_ADMIN_TOKEN з .env і сам токен у DatoCMS.
 *
 * Повторний запуск безпечний: наявні поля й модель пропускаються, записи не дублюються.
 */
import { readFileSync, existsSync } from "node:fs";

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
      const payload = json.data?.attributes?.payload;
      if (payload?.errors || (json.data?.attributes?.status ?? 200) >= 400)
        throw new Error(`Job failed: ${JSON.stringify(json.data?.attributes, null, 2)}`);
      return payload?.data ?? json.data;
    }
  }
  throw new Error("Job timeout");
}
/** Усі записи моделі (порціями по 100). */
async function allItems(modelId) {
  const out = [];
  for (let offset = 0; ; offset += 100) {
    const page = await cma("GET", `/items?filter[type]=${modelId}&page[limit]=100&page[offset]=${offset}`);
    out.push(...page);
    if (page.length < 100) return out;
  }
}

const models = await cma("GET", "/item-types");
const model = (key) => models.find((m) => m.attributes.api_key === key);

// ── 1. поля «Files» і «Videos» ───────────────────────────────
const FILES = (label = "Files", what = "") => ({
  label,
  field_type: "gallery",
  hint: `Файли для завантаження${what}: PDF, PowerPoint, Word, Excel — будь-які. Заповніть Title кожного файлу — це назва на сайті (інакше — ім’я файлу)`,
});
const VIDEOS = (label = "Videos (YouTube)", what = "") => ({
  label,
  field_type: "text",
  hint: `Посилання на відео YouTube${what}, кожне з нового рядка. На сайті показуються вбудованим плеєром`,
});
const MEDIA_FIELDS = {
  article: [
    { api_key: "attachments", ...FILES() },
    { api_key: "videos", ...VIDEOS() },
  ],
  organization: [
    { api_key: "attachments", ...FILES() },
    { api_key: "videos", ...VIDEOS() },
  ],
  event: [
    { api_key: "attachments", ...FILES("Files", " (до анонсу: програма, афіша, презентація)") },
    { api_key: "videos", ...VIDEOS() },
    { api_key: "report_attachments", ...FILES("Report files", " у звіті (презентації, документи)") },
    { api_key: "report_videos", ...VIDEOS("Report videos (YouTube)", " у звіті") },
  ],
};

async function addFields(m, defs) {
  const fields = await cma("GET", `/item-types/${m.id}/fields`);
  for (const f of defs) {
    if (fields.some((x) => x.attributes.api_key === f.api_key)) {
      console.log(`   • ${f.api_key} вже є`);
      continue;
    }
    await cma("POST", `/item-types/${m.id}/fields`, {
      type: "field",
      attributes: { ...f, localized: false, validators: {} },
    });
    console.log(`   + ${f.api_key}`);
  }
}

console.log("1. Поля для файлів і відео");
for (const [key, defs] of Object.entries(MEDIA_FIELDS)) {
  const m = model(key);
  if (!m) {
    console.warn(`   ! немає моделі ${key} — пропущено`);
    continue;
  }
  console.log(` ${key}`);
  await addFields(m, defs);
}

// ── 2. Блог ─────────────────────────────────────────────────
// Правка 23.10: окремої моделі для блогу немає — Блог показує записи «article» з типом «Стаття».
// Якщо попередня версія скрипта вже створила порожню модель «Blog post», прибираємо її.
console.log("\n2. Блог");
const blog = model("blog_post");
if (!blog) {
  console.log("   • окремої моделі немає — добре (блог = статті з типом «Стаття»)");
} else {
  const posts = await cma("GET", `/items?filter[type]=${blog.id}&page[limit]=1`);
  if (posts.length) {
    console.warn("   ! у моделі «Blog post» є записи — не видаляю. Перенесіть їх у Article з типом «Стаття» і видаліть модель вручну.");
  } else {
    await cma("DELETE", `/item-types/${blog.id}`);
    console.log("   − видалено порожню модель «Blog post»");
  }
}

// ── 3. організації ──────────────────────────────────────────
console.log("\n3. Організації");
const PATCH = {
  trembita: ["name", "subtitle"],
  uuwg: ["name", "short_name", "subtitle", "summary", "content", "facts", "founded_year"],
  borysthenes: ["content"],
};
const orgModel = model("organization");
if (!orgModel) {
  console.warn("   ! немає моделі organization — пропущено");
} else {
  const seed = JSON.parse(readFileSync("scripts/organizations-seed.json", "utf8"));
  const items = await allItems(orgModel.id);
  for (const [slug, keys] of Object.entries(PATCH)) {
    const item = items.find((it) => it.attributes.slug === slug);
    const data = seed.find((o) => o.slug === slug);
    if (!item || !data) {
      console.warn(`   ! немає запису ${slug} — пропущено`);
      continue;
    }
    const attributes = Object.fromEntries(keys.map((k) => [k, data[k] ?? null]));
    await cma("PUT", `/items/${item.id}`, { type: "item", id: item.id, attributes });
    await cma("PUT", `/items/${item.id}/publish`);
    console.log(`   ↻ ${data.name}: ${keys.join(", ")}`);
  }
}

// ── 4. єдине написання «Об’єднання Українок в Греції» ─────────────
console.log("\n4. Назва «Об’єднання Українок в Греції» в подіях і статтях");
const fix = (v) => (typeof v === "string" ? v.replace(/Союзу? українок [ув] Греції/g, "Об’єднання Українок в Греції") : v);
for (const [key, fieldsToFix] of [
  ["event", ["title", "description", "content", "report_content"]],
  ["article", ["title", "content"]],
]) {
  const m = model(key);
  if (!m) continue;
  for (const it of await allItems(m.id)) {
    const attributes = {};
    for (const f of fieldsToFix) {
      const v = it.attributes[f];
      if (v == null) continue;
      const next = typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([l, x]) => [l, fix(x)])) : fix(v);
      if (JSON.stringify(next) !== JSON.stringify(v)) attributes[f] = next;
    }
    if (!Object.keys(attributes).length) continue;
    const wasPublished = it.meta?.status === "published";
    await cma("PUT", `/items/${it.id}`, { type: "item", id: it.id, attributes });
    if (wasPublished) await cma("PUT", `/items/${it.id}/publish`);
    const t = it.attributes.title;
    console.log(`   ↻ ${typeof t === "object" ? Object.values(t)[0] : t}`);
  }
}

console.log(`
Готово. Сайт підхопить зміни протягом хвилини.
  • Блог: пишіть у Article (як новини) і обирайте тип матеріалу «Стаття» — запис з’явиться в Блозі, а не в Новинах.
  • Файли/відео: у статтях, подіях і організаціях з’явилися поля «Files» і «Videos (YouTube)»,
    у подіях — ще «Report files» і «Report videos» для звіту.
Не забудьте видалити DATOCMS_ADMIN_TOKEN з .env і сам токен у DatoCMS.`);
