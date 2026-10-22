/**
 * Оновлення DatoCMS за правками клієнта від 22.10.2026.
 *
 * Що робить (і нічого більше):
 *   1. Файли й відео до текстів. Додає поля, якщо їх ще немає:
 *        article, organization:  attachments «Files», videos «Videos (YouTube)»
 *        event:                  те саме + report_attachments / report_videos — для звіту
 *      Files — будь-які файли (PDF, PowerPoint, Word…), Videos — посилання на YouTube, кожне з нового рядка.
 *   2. Блог: створює модель «Blog post» (blog_post) — назва, slug, обкладинка, текст, автор,
 *      файли, відео. Поля назви/тексту/обкладинки/автора копіюються з моделі article
 *      (ті самі мови й редактор), тож заповнюються так само, як новини.
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

// ── 2. модель «Blog post» ───────────────────────────────────
console.log("\n2. Блог");
const article = model("article");
let blog = model("blog_post");
if (!article) {
  console.warn("   ! немає моделі article — блог пропущено");
} else {
  if (blog) {
    console.log("   • модель «Blog post» вже є");
  } else {
    blog = await cma("POST", "/item-types", {
      type: "item_type",
      attributes: {
        name: "Blog post",
        api_key: "blog_post",
        draft_mode_active: article.attributes.draft_mode_active,
        all_locales_required: article.attributes.all_locales_required,
        sortable: false,
      },
    });
    console.log("   ✔ створено модель «Blog post»");
  }

  const src = await cma("GET", `/item-types/${article.id}/fields`);
  const srcBy = Object.fromEntries(src.map((f) => [f.attributes.api_key, f.attributes]));
  const have = await cma("GET", `/item-types/${blog.id}/fields`);
  const haveBy = Object.fromEntries(have.map((f) => [f.attributes.api_key, f]));

  /** Копія поля статті (ті самі мови, валідатори й редактор). */
  const copy = (key, extra = {}) => {
    const a = srcBy[key];
    if (!a) return null;
    return {
      label: a.label,
      api_key: key,
      field_type: a.field_type,
      localized: a.localized,
      validators: a.validators ?? {},
      appearance: a.appearance,
      hint: a.hint,
      ...extra,
    };
  };

  for (const key of ["title", "slug", "image", "content", "author"]) {
    if (haveBy[key]) {
      console.log(`   • ${key} вже є`);
      continue;
    }
    let def = copy(key);
    if (!def) {
      console.warn(`   ! у моделі article немає поля ${key} — пропущено`);
      continue;
    }
    if (key === "slug") {
      // slug будується з назви саме цієї моделі
      const v = { ...def.validators };
      if (haveBy.title) v.slug_title_field = { title_field_id: haveBy.title.id };
      else delete v.slug_title_field;
      def = { ...def, validators: v };
    }
    try {
      haveBy[key] = await cma("POST", `/item-types/${blog.id}/fields`, { type: "field", attributes: def });
    } catch (e) {
      // інколи редактор поля не переноситься — пробуємо зі стандартним
      const { appearance, ...plain } = def;
      haveBy[key] = await cma("POST", `/item-types/${blog.id}/fields`, { type: "field", attributes: plain });
    }
    console.log(`   + ${key}`);
  }
  await addFields(blog, [
    { api_key: "attachments", ...FILES() },
    { api_key: "videos", ...VIDEOS() },
  ]);

  // назва запису в списку = title
  if (haveBy.title && !blog.relationships?.title_field?.data) {
    await cma("PUT", `/item-types/${blog.id}`, {
      type: "item_type",
      id: blog.id,
      relationships: { title_field: { data: { type: "field", id: haveBy.title.id } } },
    }).catch(() => {});
  }

  // пункт меню «Блог» у розділі Content
  const menu = await cma("GET", "/menu-items");
  if (!menu.some((mi) => mi.relationships?.item_type?.data?.id === blog.id)) {
    await cma("POST", "/menu-items", {
      type: "menu_item",
      attributes: { label: "Блог", position: 99 },
      relationships: { item_type: { data: { type: "item_type", id: blog.id } } },
    })
      .then(() => console.log("   + пункт меню «Блог»"))
      .catch((e) => console.warn("   ! пункт меню не створено — модель доступна в Content → Blog post", e.message));
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
  • Блог: Content → «Блог» (Blog post) → New record.
  • Файли/відео: у статтях, подіях і організаціях з’явилися поля «Files» і «Videos (YouTube)»,
    у подіях — ще «Report files» і «Report videos» для звіту.
Не забудьте видалити DATOCMS_ADMIN_TOKEN з .env і сам токен у DatoCMS.`);
