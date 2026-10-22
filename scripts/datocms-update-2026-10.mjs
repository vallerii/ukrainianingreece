/**
 * Точкове оновлення DatoCMS за правками клієнта від 18–20.10.2026.
 *
 * Що робить (і нічого більше):
 *   1. Модель «organization»: додає два поля, якщо їх ще немає —
 *        is_partner        «Partner of the union» (підпис «Партнер» у каруселі)
 *        project_position  «Permanent project, position» (місце в блоці «Постійні проєкти»)
 *   2. Створює 4 нові записи: «Борисфен» (засновник), «Суботня школа «Трембіта»»,
 *      «Розмовний клуб грецької мови», «Розмовний клуб англійської мови».
 *   3. В існуючих записах змінює ЛИШЕ перелічені нижче поля (PATCH_FIELDS) —
 *      решту ваших правок у DatoCMS не чіпає.
 *   4. Додає 4 події в календар (якщо події з таким slug ще немає).
 * Усі змінені/створені записи публікуються.
 *
 * Дані беруться з scripts/organizations-seed.json (уже оновлено).
 *
 * Запуск (на вашому комп’ютері, з інтернетом, у папці сайту):
 *   1. У .env має бути DATOCMS_ADMIN_TOKEN (роль Admin + Content Management API).
 *   2. node scripts/datocms-update-2026-10.mjs
 *   3. Видалити DATOCMS_ADMIN_TOKEN з .env і сам токен у DatoCMS.
 *
 * Афіші подій: покладіть файли у scripts/event-posters/<slug>.jpg (slug — див. EVENTS нижче)
 * ДО запуску — скрипт їх завантажить. Або додайте афіші пізніше вручну в DatoCMS (поле Image).
 *
 * Повторний запуск безпечний: наявні поля й події пропускаються, записи оновлюються, а не дублюються.
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

// ── файли ──────────────────────────────────────────────────────
const CACHE = "scripts/.datocms-uploads.json";
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf8")) : {};
const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

async function uploadFile(file, kind = "файл") {
  if (!file) return null;
  if (cache[file]) return cache[file];
  if (!existsSync(file)) {
    console.warn(`   ! немає файлу ${file} — ${kind} пропущено`);
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
  console.log(`   ↑ ${kind} ${filename}`);
  return upload.id;
}

// ── 1. нові поля моделі organization ──────────────────────────
const models = await cma("GET", "/item-types");
const orgModel = models.find((m) => m.attributes.api_key === "organization");
if (!orgModel) {
  console.error("✖ Немає моделі organization — спершу запустіть node scripts/datocms-setup.mjs");
  process.exit(1);
}
const NEW_FIELDS = [
  {
    api_key: "is_partner",
    label: "Partner of the union",
    field_type: "boolean",
    hint: "Партнер мережі: показується в каруселі на головній і в блоці «Засновники та партнери» з підписом «Партнер»",
  },
  {
    api_key: "project_position",
    label: "Permanent project, position",
    field_type: "integer",
    hint: "Місце в блоці «Постійні проєкти» (1, 2, 3…). Порожньо — запис не показується серед проєктів",
  },
];
const orgFields = await cma("GET", `/item-types/${orgModel.id}/fields`);
for (const f of NEW_FIELDS) {
  if (orgFields.some((x) => x.attributes.api_key === f.api_key)) {
    console.log(`• Поле ${f.api_key} вже є`);
    continue;
  }
  await cma("POST", `/item-types/${orgModel.id}/fields`, {
    type: "field",
    attributes: { ...f, localized: false, validators: {} },
  });
  console.log(`+ поле ${f.api_key}`);
}

// ── 2–3. організації ──────────────────────────────────────────
/** Поля, які змінилися в наявних записах (порівняно з попереднім seed). */
const PATCH_FIELDS = {
  trembita: ["name", "menu_note"],
  "zhuravlynyi-krai": ["summary", "phone", "email", "facebook", "website"],
  uuwg: ["name", "short_name", "menu_note", "city", "summary", "content", "facts", "founded_year", "facebook", "is_founder"],
  leleki: ["is_founder"],
  "info-tsentr": ["name", "menu_note", "subtitle", "city", "summary", "content", "facts", "phone", "email", "address", "facebook", "project_position", "gallery_files"],
  "leleki-shkola": ["name", "project_position", "is_founder"],
  "chytatskyi-klub": ["name", "is_partner", "project_position", "is_founder"],
  khor: ["name", "short_name", "menu_note", "city", "summary", "content", "phone", "email", "facebook", "project_position", "gallery_files"],
};

const seed = JSON.parse(readFileSync("scripts/organizations-seed.json", "utf8"));
const existing = await cma("GET", `/items?filter[type]=${orgModel.id}&page[limit]=100`);
const bySlug = Object.fromEntries(existing.map((it) => [it.attributes.slug, it]));

async function toAttributes(org, only) {
  const { logo_file, gallery_files = [], ...fields } = org;
  const want = (k) => !only || only.includes(k);
  const attrs = {};
  for (const [k, v] of Object.entries(fields)) if (k !== "slug" || !only) if (want(k)) attrs[k] = v;
  if (want("logo_file")) {
    const id = await uploadFile(logo_file, "логотип");
    attrs.logo = id ? { upload_id: id } : null;
  }
  if (want("gallery_files") && gallery_files.length) {
    const gallery = [];
    for (const g of gallery_files) {
      const id = await uploadFile(g.file, "фото");
      if (id) gallery.push({ upload_id: id, alt: g.alt ?? null, title: null, custom_data: {}, focal_point: null });
    }
    attrs.gallery = gallery;
  }
  return attrs;
}

for (const org of seed) {
  const item = bySlug[org.slug];
  if (item) {
    const only = PATCH_FIELDS[org.slug];
    if (!only) continue; // запис не змінювався — не чіпаємо
    console.log(`\n${org.name}`);
    const attributes = await toAttributes(org, only);
    await cma("PUT", `/items/${item.id}`, { type: "item", id: item.id, attributes });
    await cma("PUT", `/items/${item.id}/publish`);
    console.log(`   ↻ оновлено: ${only.join(", ")}`);
  } else {
    console.log(`\n${org.name}`);
    const attributes = await toAttributes(org, null);
    const created = await cma("POST", "/items", {
      type: "item",
      attributes,
      relationships: { item_type: { data: { type: "item_type", id: orgModel.id } } },
    });
    await cma("PUT", `/items/${created.id}/publish`);
    console.log("   ✔ створено");
  }
}

// ── 4. події ──────────────────────────────────────────────────
const md = (...p) => p.join("\n\n");
const EVENTS = [
  {
    slug: "shkola-ikonopysu-2026",
    title: "Школа іконопису в Афінах — третя сесія",
    description: "Намалюйте справжню ікону за 10 днів. Усі матеріали надаються, наприкінці — освячення ікон і сертифікат.",
    date_start: "2026-10-19T10:00:00+03:00",
    date_finish: "2026-11-01T18:00:00+02:00",
    content: md(
      "Українська церковна спільнота святого Миколая за сприяння Товариства підтримки і розвитку культурної спадщини «Трембіта» запрошує всіх, хто цікавиться сакральним мистецтвом.",
      "**Намалюй ікону сам(а)!** Спробувати може кожен — ікону вдається написати практично кожному учаснику. Створіть святиню власними руками за 10 днів — справжню ікону, що залишиться з вами на все життя.",
      "Після спільної Літургії ікони будуть освячені священниками як плід 10-денної праці та молитви. Кожен учасник отримує сертифікат про закінчення курсу від «Трембіти» та спільноти.",
      "**Пожертва:** 170 € з особи — на закупівлю всіх матеріалів (дошки, фарби, пензлі, золото, олівці та все необхідне). Кількість місць обмежена.",
      "**Реєстрація та інформація:** о. Ігор — +30 690 787 4857, п. Оксана — +30 699 369 3397, п. Олена — +30 694 920 6258.",
    ),
  },
  {
    slug: "yes-i-speak-znayomstvo-2026-10-23",
    title: "«Yes, I speak!» — урок-знайомство англомовного клубу",
    description: "Перше заняття розмовного клубу англійської мови в Інформаційному центрі на Ферон 4. Чисельність групи обмежена.",
    date_start: "2026-10-23T18:00:00+03:00",
    date_finish: "2026-10-23T19:00:00+03:00",
    content: md(
      "Do you speak English? Якщо ще ні — приходьте на урок-знайомство до нашого англомовного клубу «Yes, I speak!».",
      "**Де:** Інформаційний центр, вул. Ферон 4, 104 34 Афіни.",
      "Чисельність групи обмежена! Реєстрація: [форма](https://forms.gle/gsA7dzt7HKfK51r48). Деталі: +30 694 920 6258.",
    ),
  },
  {
    slug: "women-building-europe-together-2026-10-23",
    title: "Women Building Europe Together Forum",
    description: "Фінальна публічна подія проєкту Bridges of Empowerment від Об’єднання Українок в Греції: воркшоп, самопрезентації та нетворкінг.",
    date_start: "2026-10-23T17:00:00+03:00",
    date_finish: null,
    content: md(
      "Як перетворити наш досвід, навички та зв’язки на економічні й громадські можливості? Вечір для жінок, які будують своє майбутнє в Греції та разом творять сильнішу спільноту.",
      "**Де:** Glyfada Old Town Hall, Saki Karagiorga 4, Glifada 166 75.",
      "**Програма**",
      "- Воркшоп: Леся Рімович (нерухомість та інвестиції) — «Visibility: як зробити вашу роботу помітною й відкрити нові можливості»; Яна Павлова (коуч і менторка для жінок) — «10 порад, щоб ваші продукти й послуги цінували».\n- Самопрезентації: п’ять хвилин, щоб розповісти про себе, свій бізнес чи проєкт (зазначте це у формі реєстрації).\n- Нетворкінг із кольоровими бейджами: кар’єра, бізнес, партнерство чи підтримка спільноти.\n- Дошка «Я пропоную», «Я шукаю», «Хочу створити разом».",
      "Організатор — Об’єднання Українок в Греції. Проєкт підтримано грантом RIZA та Європейським Союзом. Реєстрація — за посиланням у [дописі організаторів](https://www.facebook.com/ukrainianwomengr).",
    ),
  },
  {
    slug: "ukraina-vlasnoruch-yavorivskyi-rozpys-2026-11-06",
    title: "«Україна власноруч»: яворівський розпис",
    description: "Перша зустріч серії майстер-класів: історія традиції, пензлі, кольори та власна яворівська пташка. А ще — яворівський пиріг.",
    date_start: "2026-11-06T18:00:00+02:00",
    date_finish: "2026-11-06T20:30:00+02:00",
    content: md(
      "Деякі традиції можна не лише пам’ятати. Їх можна створити власноруч.",
      "Запрошуємо на першу зустріч серії «Україна власноруч»: знайомство з яворівським розписом. Історія традиції, пензлі, кольори та створення власної яворівської пташки. А ще смакування яворівського пирога, щоб знайомство з Яворівщиною було не лише творчим, а й смачним.",
      "**Де:** вул. Ферон 4, Афіни. **Тривалість:** 2,5 години. **Вартість:** 28 €, усі матеріали включені.",
      "Досвід малювання необов’язковий. Кількість місць обмежена форматом камерної майстерні. Напишіть нам у Direct слово «ПТАШКА», щоб отримати деталі та зареєструватися.",
    ),
  },
];

const eventModel = models.find((m) => m.attributes.api_key === "event");
if (!eventModel) {
  console.warn("\n! Немає моделі event — події пропущено.");
} else {
  const fields = await cma("GET", `/item-types/${eventModel.id}/fields`);
  const fieldByKey = Object.fromEntries(fields.map((f) => [f.attributes.api_key, f.attributes]));
  // мова проєкту — перша з налаштувань сайту (у вас: uk)
  const siteInfo = await cma("GET", "/site");
  const locales = siteInfo.attributes.locales;
  const locale = locales.includes("uk") ? "uk" : locales[0];
  // локалізовані поля: український текст — у «uk»; інші мови (en, el) поки отримують
  // той самий текст, бо модель вимагає заповнити всі мови. Переклад — потім у DatoCMS.
  const wrap = (key, v) =>
    fieldByKey[key]?.localized ? Object.fromEntries(locales.map((l) => [l, v])) : v;
  const events = await cma("GET", `/items?filter[type]=${eventModel.id}&page[limit]=100`);
  const have = new Set(events.map((e) => (typeof e.attributes.slug === "object" ? e.attributes.slug?.[locale] : e.attributes.slug)));

  for (const ev of EVENTS) {
    if (have.has(ev.slug)) {
      console.log(`\n• Подія «${ev.title}» вже є — пропущено`);
      continue;
    }
    console.log(`\n${ev.title}`);
    const attributes = {};
    for (const [k, v] of Object.entries(ev)) if (fieldByKey[k]) attributes[k] = wrap(k, v);
    if (fieldByKey.image) {
      const poster = ["jpg", "jpeg", "png", "webp"].map((x) => `scripts/event-posters/${ev.slug}.${x}`).find(existsSync);
      const id = poster ? await uploadFile(poster, "афіша") : null;
      attributes.image = wrap("image", id ? { upload_id: id } : null);
    }
    const created = await cma("POST", "/items", {
      type: "item",
      attributes,
      relationships: { item_type: { data: { type: "item_type", id: eventModel.id } } },
    });
    try {
      await cma("PUT", `/items/${created.id}/publish`);
      console.log("   ✔ створено й опубліковано");
    } catch (e) {
      console.log("   ✔ створено як чернетку — допишіть обов’язкові поля в DatoCMS і опублікуйте");
    }
  }
}

console.log(`
Готово. Сайт підхопить зміни протягом хвилини.
Перевірте в DatoCMS порядок організацій (Organizations → перетягуванням):
  Трембіта · Журавлиний край · Об’єднання Українок · Борисфен · Лелеки — так вони йдуть у каруселі.
Не забудьте видалити DATOCMS_ADMIN_TOKEN з .env і сам токен у DatoCMS.`);
