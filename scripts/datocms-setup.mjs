/**
 * Одноразове налаштування моделей DatoCMS для форм і фінансових звітів.
 *
 * Створює (якщо їх ще немає):
 *   • financial_report        — financial report (публічний, з чернетками)
 *   • volunteer_application   — volunteer application (лише для адмінки)
 *   • organization            — organization (публічний профіль + приватні поля заявки, з чернетками)
 *
 * Запуск (на вашому комп’ютері, з інтернетом):
 *   1. DatoCMS → Project settings → API tokens → «Add a new API token»,
 *      роль Admin, увімкнути «Access the Content Management API».
 *   2. Додати в .env (або .env.local):  DATOCMS_ADMIN_TOKEN=...
 *   3. node scripts/datocms-setup.mjs
 *   4. Після успіху цей адмін-токен можна видалити з .env і з DatoCMS.
 *
 * Скрипт безпечно запускати повторно: наявні моделі й поля він пропускає.
 */
import { readFileSync, existsSync } from "node:fs";

// ── .env ───────────────────────────────────────────────────────
for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const TOKEN = process.env.DATOCMS_ADMIN_TOKEN;
if (!TOKEN) {
  console.error("✖ Немає DATOCMS_ADMIN_TOKEN у .env — див. інструкцію на початку файлу.");
  process.exit(1);
}

// ── CMA (REST, JSON:API) ───────────────────────────────────────
const API = "https://site-api.datocms.com";
async function cma(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/json",
      "Content-Type": "application/vnd.api+json",
      "X-Api-Version": "3",
    },
    body: body ? JSON.stringify({ data: body }) : undefined,
  });
  const json = res.status === 204 ? {} : await res.json();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}\n${JSON.stringify(json, null, 2)}`);
  // асинхронні операції повертають job — чекаємо результат
  if (res.status === 202 && json.data?.type === "job") return waitJob(json.data.id);
  return json.data;
}
async function waitJob(id) {
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const res = await fetch(`${API}/job-results/${id}`, {
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/json", "X-Api-Version": "3" },
    });
    if (res.status === 200) {
      const json = await res.json();
      return json.data?.attributes?.payload?.data ?? json.data;
    }
  }
  throw new Error("Job timeout");
}

// ── Опис моделей ───────────────────────────────────────────────
const req = { required: {} };
const email = { format: { predefined_pattern: "email" } };
const PRIVATE = "🔒 Private — submitted via the website form, never shown on the site";

const MODELS = [
  {
    api_key: "financial_report",
    name: "financial report",
    draft_mode_active: true,
    fields: [
      { api_key: "title", label: "Title", field_type: "string", validators: req },
      { api_key: "year", label: "Year", field_type: "integer", validators: req },
      { api_key: "summary", label: "Summary", field_type: "text", hint: "What was done and where the money went (Markdown)" },
      { api_key: "income", label: "Income, €", field_type: "float" },
      { api_key: "expenses", label: "Expenses, €", field_type: "float" },
      { api_key: "file", label: "Report file (PDF)", field_type: "file" },
    ],
  },
  {
    api_key: "volunteer_application",
    name: "volunteer application",
    draft_mode_active: false,
    fields: [
      { api_key: "name", label: "Name", field_type: "string", validators: req },
      { api_key: "email", label: "Email", field_type: "string", validators: { ...req, ...email } },
      { api_key: "phone", label: "Phone", field_type: "string" },
      { api_key: "city", label: "City", field_type: "string" },
      { api_key: "skills", label: "Skills (how they can help)", field_type: "text" },
      { api_key: "availability", label: "Availability", field_type: "string" },
      { api_key: "message", label: "Message", field_type: "text" },
      { api_key: "review_status", label: "Review status", field_type: "string", hint: "New / Contacted / Joined / Declined (filled in by the team)" },
      { api_key: "consent", label: "Data processing consent", field_type: "boolean" },
    ],
  },
  {
    api_key: "organization",
    name: "organization",
    draft_mode_active: true,
    sortable: true,
    fields: [
      // публічний профіль
      { api_key: "name", label: "Name", field_type: "string", validators: req },
      { api_key: "slug", label: "Slug", field_type: "slug", slugOf: "name" },
      { api_key: "short_name", label: "Short name (menu)", field_type: "string", hint: "Коротка назва для меню, напр. «Трембіта»" },
      { api_key: "menu_note", label: "Menu note", field_type: "string", hint: "Підпис у меню, напр. «Суботня школа, Афіни»" },
      { api_key: "subtitle", label: "Subtitle", field_type: "string", hint: "Офіційна / грецька назва, слоган" },
      { api_key: "city", label: "City", field_type: "string" },
      { api_key: "founded_year", label: "Founded year", field_type: "integer" },
      { api_key: "head", label: "Head", field_type: "string" },
      { api_key: "summary", label: "Summary (1–2 sentences)", field_type: "text" },
      { api_key: "content", label: "Content (Markdown)", field_type: "text" },
      { api_key: "facts", label: "Facts", field_type: "text", hint: "Кожен факт з нового рядка у форматі «Назва: значення», напр. «Засновано: 2011, Афіни»" },
      { api_key: "logo", label: "Logo", field_type: "file" },
      { api_key: "logo_dark", label: "Logo on dark background", field_type: "boolean", hint: "Увімкнути, якщо логотип світлий і його треба показувати на синьому тлі" },
      { api_key: "website", label: "Website", field_type: "string" },
      { api_key: "facebook", label: "Facebook", field_type: "string" },
      { api_key: "instagram", label: "Instagram", field_type: "string" },
      { api_key: "phone", label: "Public phone", field_type: "string" },
      { api_key: "email", label: "Public email", field_type: "string" },
      { api_key: "address", label: "Address", field_type: "string" },
      { api_key: "is_founder", label: "Founder of the union", field_type: "boolean" },
      // приватні поля заявки
      { api_key: "contact_name", label: "Contact name", field_type: "string", hint: PRIVATE },
      { api_key: "contact_email", label: "Contact email", field_type: "string", hint: PRIVATE },
      { api_key: "contact_phone", label: "Contact phone", field_type: "string", hint: PRIVATE },
      { api_key: "application_message", label: "Application message", field_type: "text", hint: PRIVATE },
      { api_key: "consent", label: "Data processing consent", field_type: "boolean", hint: PRIVATE },
    ],
  },
];

// ── Виконання ──────────────────────────────────────────────────
const existing = await cma("GET", "/item-types");
const ids = {};
for (const def of MODELS) {
  let model = existing.find((m) => m.attributes.api_key === def.api_key);
  if (model) {
    console.log(`• Модель «${def.name}» вже є`);
  } else {
    model = await cma("POST", "/item-types", {
      type: "item_type",
      attributes: {
        name: def.name,
        api_key: def.api_key,
        draft_mode_active: def.draft_mode_active,
        sortable: Boolean(def.sortable),
        all_locales_required: false,
      },
    });
    console.log(`✔ Створено модель «${def.name}»`);
  }

  ids[def.api_key] = model.id;
  const fields = await cma("GET", `/item-types/${model.id}/fields`);
  const byKey = Object.fromEntries(fields.map((f) => [f.attributes.api_key, f]));
  for (const f of def.fields) {
    if (byKey[f.api_key]) continue;
    const validators = { ...(f.validators ?? {}) };
    if (f.field_type === "slug") {
      validators.slug_title_field = { title_field_id: byKey[f.slugOf].id };
      validators.slug_format = { predefined_pattern: "webpage_slug" };
      validators.unique = {};
    }
    const created = await cma("POST", `/item-types/${model.id}/fields`, {
      type: "field",
      attributes: {
        label: f.label,
        api_key: f.api_key,
        field_type: f.field_type,
        localized: false,
        validators,
        ...(f.hint ? { hint: f.hint } : {}),
      },
    });
    byKey[f.api_key] = created;
    console.log(`   + поле ${f.api_key}`);
  }
}

console.log(`
Готово. Далі вручну в DatoCMS (2 хвилини):
  1. Settings → Roles → New role «Форми сайту»:
       Content → «volunteer application»: Create
       Content → «organization»:          Create
     (без Publish, без Edit schema)
  2. Settings → API tokens → New token «Форми сайту», роль «Форми сайту»,
     увімкнути «Access the Content Management API», вимкнути Content Delivery.
  3. Додати в .env:
       DATOCMS_FORMS_TOKEN=<цей токен>
       DATOCMS_MODEL_VOLUNTEER=${ids.volunteer_application}
       DATOCMS_MODEL_ORGANIZATION=${ids.organization}
  4. Видалити DATOCMS_ADMIN_TOKEN з .env і сам адмін-токен у DatoCMS.
`);
