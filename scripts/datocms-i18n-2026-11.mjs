/**
 * Переклад контенту DatoCMS англійською та грецькою (20.11.2026).
 *
 * 1. Робить перекладними (localized) текстові поля моделі organization
 *    (name, short_name, menu_note, subtitle, city, summary, content, facts, head, address) і author.name.
 * 2. Записує переклади з scripts/i18n-content/{en,el}.json у event, article, organization,
 *    tag, article_type. Українські тексти не змінюються.
 * 3. Публікує записи, які були опубліковані (чернетки лишаються чернетками).
 *
 * Резервна копія контенту до змін: scripts/i18n-content/backup-before-2026-11-20.json
 * Запуск: node scripts/datocms-i18n-2026-11.mjs   (потрібен DATOCMS_ADMIN_TOKEN у .env)
 * Повторний запуск безпечний: перезаписує en/el тими самими текстами.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, ".env"), "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).trim()]; }),
);
if (!env.DATOCMS_ADMIN_TOKEN) throw new Error("DATOCMS_ADMIN_TOKEN не задано в .env");

const H = {
  Authorization: `Bearer ${env.DATOCMS_ADMIN_TOKEN}`,
  Accept: "application/json",
  "Content-Type": "application/vnd.api+json",
  "X-Api-Version": "3",
  ...(env.DATOCMS_ENVIRONMENT ? { "X-Environment": env.DATOCMS_ENVIRONMENT } : {}),
};
async function api(method, p, body) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch("https://site-api.datocms.com" + p, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 429 && attempt < 5) { await new Promise((r) => setTimeout(r, 2000 * (attempt + 1))); continue; }
    const json = res.status === 204 ? {} : await res.json();
    if (!res.ok) throw new Error(`${method} ${p}: ${res.status} ${JSON.stringify(json.data ?? json)}`);
    return json;
  }
}
// зміна схеми виконується асинхронно — чекаємо job
async function waitJob(r) {
  if (r.data?.type !== "job") return r;
  for (;;) {
    await new Promise((x) => setTimeout(x, 1000));
    const j = await fetch(`https://site-api.datocms.com/job-results/${r.data.id}`, { headers: H });
    if (j.status === 200) return j.json();
  }
}

const tr = {
  en: JSON.parse(fs.readFileSync(path.join(root, "scripts/i18n-content/en.json"), "utf8")),
  el: JSON.parse(fs.readFileSync(path.join(root, "scripts/i18n-content/el.json"), "utf8")),
};
const ORG_FIELDS = ["name", "short_name", "menu_note", "subtitle", "city", "summary", "content", "facts", "head", "address"];

const types = (await api("GET", "/item-types")).data;
const typeId = (key) => types.find((t) => t.attributes.api_key === key)?.id;

/* 1. organization (і ім’я автора): перекладні поля */
{
  const aType = typeId("author");
  if (aType) {
    const nameField = (await api("GET", `/item-types/${aType}/fields`)).data.find((f) => f.attributes.api_key === "name");
    if (nameField && !nameField.attributes.localized) {
      console.log("author.name → localized");
      await waitJob(await api("PUT", `/fields/${nameField.id}`, { data: { type: "field", id: nameField.id, attributes: { localized: true } } }));
    }
  }
}
const orgType = typeId("organization");
const orgItemsBefore = (await api("GET", `/items?filter[type]=${orgType}&page[limit]=100&version=current`)).data;
const orgFields = (await api("GET", `/item-types/${orgType}/fields`)).data;
for (const f of orgFields) {
  if (!ORG_FIELDS.includes(f.attributes.api_key) || f.attributes.localized) continue;
  console.log(`organization.${f.attributes.api_key} → localized`);
  await waitJob(await api("PUT", `/fields/${f.id}`, { data: { type: "field", id: f.id, attributes: { localized: true } } }));
}
// українські значення — з даних ДО перетворення (якщо поле вже було перекладним — беремо uk)
// після перетворення на перекладне старе значення опиняється в основній мові проєкту (en) —
// тож якщо uk порожнє, беремо перше непорожнє значення
const ukOf = (v) =>
  v && typeof v === "object" && !Array.isArray(v) ? v.uk || Object.values(v).find(Boolean) || null : v ?? null;
const orgUk = Object.fromEntries(orgItemsBefore.map((i) => [i.id, Object.fromEntries(ORG_FIELDS.map((k) => [k, ukOf(i.attributes[k])]))]));

/* 2. записи */
async function updateItem(model, item, fields, ukValues) {
  const attrs = {};
  for (const k of fields) {
    const uk = ukValues[k] ?? null;
    const en = tr.en[model]?.[item.id]?.[k];
    const el = tr.el[model]?.[item.id]?.[k];
    // немає перекладу (порожнє поле, власна назва) — у всіх мовах український текст
    attrs[k] = { uk, en: en ?? uk, el: el ?? uk };
  }
  await api("PUT", `/items/${item.id}`, { data: { type: "item", id: item.id, attributes: attrs } });
  if (item.meta.status === "published" || item.meta.status === "updated") {
    await api("PUT", `/items/${item.id}/publish`);
  }
  console.log(`  ✓ ${model} ${item.attributes.slug ?? item.id} (${item.meta.status})`);
}

for (const model of ["author", "tag", "article_type", "event", "article", "organization"]) {
  const tid = typeId(model);
  if (!tid) continue;
  const fields = (await api("GET", `/item-types/${tid}/fields`)).data
    .filter((f) => f.attributes.localized && ["string", "text"].includes(f.attributes.field_type))
    .map((f) => f.attributes.api_key);
  const items = (await api("GET", `/items?filter[type]=${tid}&page[limit]=100&version=current`)).data;
  console.log(`${model}: ${items.length} записів, поля: ${fields.join(", ")}`);
  for (const item of items) {
    const uk = model === "organization"
      ? { ...Object.fromEntries(fields.map((k) => [k, ukOf(item.attributes[k])])), ...(orgUk[item.id] ?? {}) }
      : Object.fromEntries(fields.map((k) => [k, ukOf(item.attributes[k])]));
    await updateItem(model, item, fields, uk);
  }
}
console.log("Готово.");
