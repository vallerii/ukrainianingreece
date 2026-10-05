/**
 * Переносить проєкти-сателіти (організації) у DatoCMS — модель «organization».
 * Дані — scripts/organizations-seed.json (згенеровано з lib/projects.ts), логотипи — public/logos/.
 *
 * Запуск (на вашому комп’ютері, з інтернетом):
 *   1. У .env має бути DATOCMS_ADMIN_TOKEN (токен з роллю Admin + Content Management API).
 *   2. Спершу: node scripts/datocms-setup.mjs   (додасть нові поля моделі organization)
 *   3. Потім:  node scripts/datocms-seed-organizations.mjs
 *   4. Видалити DATOCMS_ADMIN_TOKEN з .env і сам токен у DatoCMS.
 *
 * Повторний запуск безпечний: записи з тим самим slug оновлюються, а не дублюються;
 * логотипи вдруге не завантажуються (кеш у scripts/.datocms-uploads.json).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
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
      const payload = json.data?.attributes?.payload;
      if (payload?.errors || (json.data?.attributes?.status ?? 200) >= 400)
        throw new Error(`Job failed: ${JSON.stringify(json.data?.attributes, null, 2)}`);
      return payload?.data ?? json.data;
    }
  }
  throw new Error("Job timeout");
}

// ── логотипи ──────────────────────────────────────────────────
const CACHE = "scripts/.datocms-uploads.json";
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf8")) : {};
const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", svg: "image/svg+xml", webp: "image/webp" };

async function uploadLogo(file) {
  if (!file) return null;
  if (cache[file]) return cache[file];
  if (!existsSync(file)) {
    console.warn(`   ! немає файлу ${file} — логотип пропущено`);
    return null;
  }
  const filename = basename(file);
  const req = await cma("POST", "/upload-requests", { type: "upload_request", attributes: { filename } });
  const put = await fetch(req.attributes.url, {
    method: "PUT",
    headers: {
      "Content-Type": MIME[filename.split(".").pop().toLowerCase()] ?? "application/octet-stream",
      ...(req.attributes.request_headers ?? {}),
    },
    body: readFileSync(file),
  });
  if (!put.ok) throw new Error(`Не вдалося завантажити ${file}: ${put.status} ${await put.text()}`);
  const upload = await cma("POST", "/uploads", { type: "upload", attributes: { path: req.id } });
  cache[file] = upload.id;
  writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  console.log(`   ↑ логотип ${filename}`);
  return upload.id;
}

// ── організації ───────────────────────────────────────────────
const seed = JSON.parse(readFileSync("scripts/organizations-seed.json", "utf8"));
const models = await cma("GET", "/item-types");
const model = models.find((m) => m.attributes.api_key === "organization");
if (!model) {
  console.error("✖ Немає моделі organization — спершу запустіть node scripts/datocms-setup.mjs");
  process.exit(1);
}
const existing = await cma("GET", `/items?filter[type]=${model.id}&page[limit]=100`);
const bySlug = Object.fromEntries(existing.map((it) => [it.attributes.slug, it]));

for (const org of seed) {
  const { logo_file, ...fields } = org;
  const uploadId = await uploadLogo(logo_file);
  const attributes = { ...fields, logo: uploadId ? { upload_id: uploadId } : null };

  let item = bySlug[org.slug];
  if (item) {
    item = await cma("PUT", `/items/${item.id}`, { type: "item", id: item.id, attributes });
    console.log(`↻ ${org.name}`);
  } else {
    item = await cma("POST", "/items", {
      type: "item",
      attributes,
      relationships: { item_type: { data: { type: "item_type", id: model.id } } },
    });
    console.log(`✔ ${org.name}`);
  }
  await cma("PUT", `/items/${item.id}/publish`);
}

console.log(`
Готово: ${seed.length} організацій у DatoCMS, опубліковано.
Сайт підхопить їх протягом хвилини (або перезапустіть npm run dev).
Не забудьте видалити DATOCMS_ADMIN_TOKEN з .env і сам токен у DatoCMS.`);
