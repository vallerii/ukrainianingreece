import type { Locale } from "@/lib/i18n/config";

/**
 * Налаштування Brevo для кожної мови сайту.
 *
 * Підписник потрапляє у список своєї мови (з якої сторінки підписався),
 * лист-підтвердження і щомісячний дайджест приходять цією ж мовою.
 *
 * ID списків і шаблонів не секретні, тож вони записані тут за замовчуванням
 * (створені 27.11.2026); змінні середовища потрібні лише щоб їх змінити:
 *   BREVO_LIST_ID / BREVO_LIST_ID_EN / BREVO_LIST_ID_EL
 *   BREVO_DOI_TEMPLATE_ID / BREVO_DOI_TEMPLATE_ID_EN / BREVO_DOI_TEMPLATE_ID_EL
 * Секретний лише BREVO_API_KEY.
 */
const DEFAULTS: Record<Locale, { listId: number; templateId: number }> = {
  uk: { listId: 3, templateId: 1 }, // «Підписники сайту», «Double opt-in — підтвердження підписки»
  en: { listId: 4, templateId: 2 }, // «Subscribers EN», «Double opt-in — EN»
  el: { listId: 5, templateId: 3 }, // «Subscribers GR», «Double opt-in — GR»
};

const SUFFIX: Record<Locale, string> = { uk: "", en: "_EN", el: "_EL" };

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

export function brevoConfig(locale: Locale) {
  const s = SUFFIX[locale];
  return {
    listId: num(process.env[`BREVO_LIST_ID${s}`], DEFAULTS[locale].listId),
    templateId: num(process.env[`BREVO_DOI_TEMPLATE_ID${s}`], DEFAULTS[locale].templateId),
  };
}

/** Відправник листів (адреса має бути підтверджена в Brevo → Senders). */
export const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "office@ukrainianingreece.gr";
export const SENDER_NAME: Record<Locale, string> = {
  uk: "Об'єднана українська діаспора в Греції",
  en: "United Ukrainian Diaspora in Greece",
  el: "Ενωμένη Ουκρανική Διασπορά στην Ελλάδα",
};

export async function brevo(path: string, apiKey: string, body: unknown) {
  return fetch(`https://api.brevo.com/v3${path}`, {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}
