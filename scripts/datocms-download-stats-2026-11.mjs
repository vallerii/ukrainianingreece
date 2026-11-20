/**
 * Статистика завантажень (20.11.2026, за погодженням з клієнтом):
 *  1. У модель download_counter додає поле by_month (JSON {"2026-11": 34, …}) — розбивка по місяцях для звітів донорам.
 *  2. Дає ролі «Forms» права Read/Create/Update на download_counter — сайт пише лічильник токеном DATOCMS_FORMS_TOKEN.
 * Запуск: node scripts/datocms-download-stats-2026-11.mjs (потрібен DATOCMS_ADMIN_TOKEN). Повторний запуск безпечний.
 */
import { readFileSync, existsSync } from "node:fs";
for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const H = { Authorization: `Bearer ${process.env.DATOCMS_ADMIN_TOKEN}`, Accept: "application/json", "Content-Type": "application/vnd.api+json", "X-Api-Version": "3" };
async function cma(method, path, body) {
  const res = await fetch("https://site-api.datocms.com" + path, { method, headers: H, body: body ? JSON.stringify({ data: body }) : undefined });
  const json = res.status === 204 ? {} : await res.json();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}\n${JSON.stringify(json, null, 2)}`);
  return json.data;
}
const cnt = (await cma("GET", "/item-types")).find((m) => m.attributes.api_key === "download_counter");
const fields = await cma("GET", `/item-types/${cnt.id}/fields`);
if (!fields.some((f) => f.attributes.api_key === "by_month")) {
  await cma("POST", `/item-types/${cnt.id}/fields`, { type: "field", attributes: {
    api_key: "by_month", label: "Downloads by month", field_type: "json", localized: false, validators: {},
    hint: "Завантаження по місяцях: \"2026-11\": 34. Заповнюється сайтом автоматично" } });
  console.log("+ by_month");
} else console.log("• by_month вже є");

const role = (await cma("GET", "/roles")).find((r) => r.attributes.name === "Forms");
const perms = role.attributes.positive_item_type_permissions;
let changed = false;
for (const action of ["read", "create", "update"]) {
  if (perms.some((p) => p.item_type === cnt.id && p.action === action)) continue;
  perms.push({ environment: perms[0]?.environment ?? "main", item_type: cnt.id, workflow: null, on_stage: null, to_stage: null, action, on_creator: action === "create" ? null : "anyone", localization_scope: action === "read" ? null : "all", locale: null });
  changed = true;
}
if (changed) {
  await cma("PUT", `/roles/${role.id}`, { type: "role", id: role.id, attributes: { positive_item_type_permissions: perms, negative_item_type_permissions: role.attributes.negative_item_type_permissions ?? [] } });
  console.log("+ права Forms на download_counter");
} else console.log("• права вже є");
