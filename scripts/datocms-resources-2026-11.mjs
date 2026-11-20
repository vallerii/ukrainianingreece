/**
 * «Корисна інформація» → матеріали для завантаження (PDF-посібники). 20.11.2026.
 *
 * Що робить:
 *   1. Моделі в DatoCMS:
 *        resource_category «Resource category» — розділ (назва 3 мовами, slug, ручне сортування)
 *        resource          «Resource (download)» — матеріал: назва, опис, ФАЙЛ — окремий для кожної мови (uk/en/el),
 *                          обкладинка, розділ, ручне сортування
 *        download_counter  «Download counter» — лічильник завантажень (без чернеток; пише сайт, редагувати не треба)
 *   2. Роль «Лічильник завантажень» (лише ця модель) + API-токен для сайту → у .env:
 *        DATOCMS_COUNTER_TOKEN, DATOCMS_MODEL_DOWNLOAD_COUNTER
 *   3. Завантажує 3 тулкити × 3 мови з scripts/toolkits/ і публікує їх.
 *
 * Запуск: node scripts/datocms-resources-2026-11.mjs  (потрібен DATOCMS_ADMIN_TOKEN у .env)
 * Повторний запуск безпечний: наявні моделі/поля/записи пропускаються.
 */
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";
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
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const res = await fetch(`${API}/job-results/${id}`, { headers: H });
    if (res.status === 200) {
      const json = await res.json();
      const p = json.data?.attributes?.payload;
      if (p?.errors) throw new Error(`Job failed: ${JSON.stringify(p, null, 2)}`);
      return p?.data ?? json.data;
    }
  }
  throw new Error("Job timeout");
}

const CACHE = "scripts/.datocms-uploads.json";
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf8")) : {};
async function uploadFile(file, meta = {}) {
  if (cache[file]) return cache[file];
  const filename = basename(file);
  const type = file.endsWith(".pdf") ? "application/pdf" : "image/jpeg";
  const req = await cma("POST", "/upload-requests", { type: "upload_request", attributes: { filename } });
  const put = await fetch(req.attributes.url, {
    method: "PUT",
    headers: { "Content-Type": type, ...(req.attributes.request_headers ?? {}) },
    body: readFileSync(file),
  });
  if (!put.ok) throw new Error(`Не вдалося завантажити ${file}: ${put.status}`);
  const upload = await cma("POST", "/uploads", { type: "upload", attributes: { path: req.id, ...meta } });
  cache[file] = upload.id;
  writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  console.log(`   ↑ ${filename}`);
  return upload.id;
}

let models = await cma("GET", "/item-types");
const model = (key) => models.find((m) => m.attributes.api_key === key);

async function ensureModel(api_key, attrs) {
  let m = model(api_key);
  if (m) {
    console.log(`   • модель ${api_key} вже є`);
    return m;
  }
  m = await cma("POST", "/item-types", { type: "item_type", attributes: { api_key, ...attrs } });
  models = await cma("GET", "/item-types");
  console.log(`   + модель ${api_key}`);
  return m;
}
async function ensureFields(m, defs) {
  const existing = await cma("GET", `/item-types/${m.id}/fields`);
  const out = {};
  for (const f of defs) {
    let x = existing.find((e) => e.attributes.api_key === f.api_key);
    if (!x) {
      x = await cma("POST", `/item-types/${m.id}/fields`, {
        type: "field",
        attributes: { localized: false, validators: {}, ...f },
      });
      console.log(`   + ${m.attributes.api_key}.${f.api_key}`);
    }
    out[f.api_key] = x;
  }
  return out;
}

// ── 1. Моделі ───────────────────────────────────────────────
console.log("1. Моделі");
const cat = await ensureModel("resource_category", {
  name: "Resource category",
  sortable: true,
  draft_mode_active: true,
  hint: "Розділи матеріалів для завантаження на сторінці «Корисна інформація»",
});
const catF = await ensureFields(cat, [
  { api_key: "title", label: "Title", field_type: "string", localized: true, validators: { required: {} } },
  { api_key: "slug", label: "Slug", field_type: "string", validators: { required: {}, unique: {} }, hint: "Латиницею, напр. robota-i-biznes" },
]);
if (!cat.attributes.title_field)
  await cma("PUT", `/item-types/${cat.id}`, { type: "item_type", id: cat.id, relationships: { title_field: { data: { type: "field", id: catF.title.id } } } }).catch(() => {});

const res = await ensureModel("resource", {
  name: "Resource (download)",
  sortable: true,
  draft_mode_active: true,
  hint: "Посібник / документ для завантаження. Файл — окремо для кожної мови (вкладки UA / EN / GR)",
});
const resF = await ensureFields(res, [
  { api_key: "title", label: "Title", field_type: "string", localized: true, validators: { required: {} } },
  { api_key: "slug", label: "Slug", field_type: "string", validators: { required: {}, unique: {} }, hint: "Латиницею. Входить в адресу завантаження /files/<slug>/<мова>" },
  { api_key: "description", label: "Description", field_type: "text", localized: true, hint: "2–3 речення: про що матеріал і кому корисний" },
  { api_key: "file", label: "File", field_type: "file", localized: true, validators: { required: {} }, hint: "PDF цією мовою. Якщо перекладу немає — завантажте той самий файл" },
  { api_key: "cover", label: "Cover", field_type: "file", validators: { extension: { predefined_list: "image" } }, hint: "Обкладинка (перша сторінка), необовʼязково" },
  { api_key: "category", label: "Category", field_type: "link", validators: { required: {}, item_item_type: { item_types: [cat.id] } } },
]);
if (!res.attributes.title_field)
  await cma("PUT", `/item-types/${res.id}`, { type: "item_type", id: res.id, relationships: { title_field: { data: { type: "field", id: resF.title.id } } } }).catch(() => {});

const cnt = await ensureModel("download_counter", {
  name: "Download counter",
  sortable: false,
  draft_mode_active: false,
  hint: "Заповнюється сайтом автоматично: скільки разів завантажили кожен файл кожною мовою. Не редагуйте вручну",
});
const cntF = await ensureFields(cnt, [
  { api_key: "key", label: "File", field_type: "string", validators: { required: {}, unique: {} }, hint: "<slug матеріалу> · <мова>" },
  { api_key: "count", label: "Downloads", field_type: "integer" },
  { api_key: "last_download", label: "Last download", field_type: "date_time" },
]);
if (!cnt.attributes.title_field)
  await cma("PUT", `/item-types/${cnt.id}`, { type: "item_type", id: cnt.id, relationships: { title_field: { data: { type: "field", id: cntF.key.id } } } }).catch(() => {});

// ── 2. ID моделі лічильника → .env ─────────────────────────
// Права на запис лічильника видаються вручну в DatoCMS: Settings → Roles → Forms →
// додати для моделі «Download counter» дії Read, Create, Update. Сайт пише тим самим DATOCMS_FORMS_TOKEN.
{
  const envText = existsSync(".env") ? readFileSync(".env", "utf8") : "";
  if (!/DATOCMS_MODEL_DOWNLOAD_COUNTER=/.test(envText)) {
    appendFileSync(".env", `\nDATOCMS_MODEL_DOWNLOAD_COUNTER=${cnt.id}\n`);
    console.log("\n2. + DATOCMS_MODEL_DOWNLOAD_COUNTER у .env");
  }
}

// ── 3. Записи ───────────────────────────────────────────────
console.log("\n3. Матеріали");
async function allItems(modelId) {
  return cma("GET", `/items?filter[type]=${modelId}&page[limit]=100`);
}
async function upsert(m, slug, attributes) {
  const found = (await allItems(m.id)).find((i) => i.attributes.slug === slug);
  if (found) {
    console.log(`   • ${slug} вже є`);
    return found;
  }
  const item = await cma("POST", "/items", {
    type: "item",
    attributes: { slug, ...attributes },
    relationships: { item_type: { data: { type: "item_type", id: m.id } } },
  });
  await cma("PUT", `/items/${item.id}/publish`);
  console.log(`   + ${slug} (опубліковано)`);
  return item;
}

const category = await upsert(cat, "robota-i-biznes", {
  title: { uk: "Робота та власна справа", en: "Work and business", el: "Εργασία και επιχείρηση" },
});

const TOOLKITS = [
  {
    slug: "poshuk-roboty",
    title: {
      uk: "Пошук роботи та професійний розвиток у Греції",
      en: "Job Search and Career Development in Greece",
      el: "Αναζήτηση εργασίας και επαγγελματική εξέλιξη στην Ελλάδα",
    },
    description: {
      uk: "Покроковий посібник: від професійного самоаналізу до запрошення на співбесіду. Career Roadmap, резюме, профіль LinkedIn, стратегія пошуку роботи та підготовка до співбесіди.",
      en: "A step-by-step guide from professional self-assessment to an interview invitation: career roadmap, CV, LinkedIn profile, job search strategy and interview preparation.",
      el: "Οδηγός βήμα προς βήμα, από την επαγγελματική αυτοαξιολόγηση έως την πρόσκληση σε συνέντευξη: χάρτης καριέρας, βιογραφικό, προφίλ LinkedIn, στρατηγική αναζήτησης εργασίας και προετοιμασία για συνέντευξη.",
    },
  },
  {
    slug: "biznes-u-hretsii",
    title: {
      uk: "Відкриття бізнесу та легалізація в Греції",
      en: "Starting a Business in Greece and Legalisation",
      el: "Ίδρυση επιχείρησης στην Ελλάδα και νομιμοποίηση",
    },
    description: {
      uk: "Як зберегти легальний статус, підготувати документи й відкрити власну справу в Греції. Практикум із реальними ситуаціями та рішеннями.",
      en: "How to maintain your lawful status, prepare your documents and open your own business in Greece. Includes a workshop with real situations and solutions.",
      el: "Πώς να διατηρήσετε το νόμιμο καθεστώς σας, να προετοιμάσετε τα έγγραφα και να ανοίξετε τη δική σας επιχείρηση στην Ελλάδα. Περιλαμβάνει πρακτικό εργαστήριο με πραγματικές περιπτώσεις και λύσεις.",
    },
  },
  {
    slug: "marketynh",
    title: {
      uk: "Основи маркетингу для початку власної справи",
      en: "Marketing Fundamentals for Starting a Business",
      el: "Βασικές αρχές μάρκετινγκ για την ίδρυση επιχείρησης",
    },
    description: {
      uk: "Практичний посібник: основи маркетингу, соцмережі як інструмент просування, digital-інструменти та AI для бізнесу, створення лендингу чи сайту без коду.",
      en: "A practical guide: marketing basics, social media as a promotion tool, digital and AI tools for business, building a landing page or website without code.",
      el: "Πρακτικός οδηγός: βασικές αρχές μάρκετινγκ, τα μέσα κοινωνικής δικτύωσης ως εργαλείο προώθησης, ψηφιακά εργαλεία και AI για επιχειρήσεις, δημιουργία landing page ή ιστοσελίδας χωρίς κώδικα.",
    },
  },
];

for (const t of TOOLKITS) {
  const file = {};
  for (const l of ["uk", "en", "el"]) {
    file[l] = { upload_id: await uploadFile(`scripts/toolkits/${t.slug}-${l}.pdf`), alt: null, title: t.title[l], custom_data: {}, focal_point: null };
  }
  const cover = await uploadFile(`scripts/toolkits/${t.slug}-cover.jpg`);
  await upsert(res, t.slug, {
    title: t.title,
    description: t.description,
    file,
    cover: { upload_id: cover, alt: t.title.uk, title: null, custom_data: {}, focal_point: null },
    category: category.id,
  });
}
console.log("\n✓ Готово");
