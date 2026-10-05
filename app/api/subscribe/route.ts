import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/seo";

/**
 * POST /api/subscribe — підписка на розсилку через Brevo з подвійним підтвердженням (double opt-in).
 *
 * Адреси зберігаються лише в Brevo (див. документ «Розсилка: технічна схема»).
 * Людина отримує лист «Підтвердіть підписку»; у список вона потрапляє лише після кліку,
 * після чого Brevo повертає її на /rozsylka/pidtverdzheno.
 *
 * Змінні середовища:
 *   BREVO_API_KEY          — API key (Brevo → SMTP & API → API keys)
 *   BREVO_LIST_ID          — ID списку «Розсилка сайту» (Contacts → Lists)
 *   BREVO_DOI_TEMPLATE_ID  — ID шаблону листа-підтвердження (тип «Double opt-in»)
 */

const hits = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5; // не більше 5 спроб за 10 хвилин з однієї IP
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 200;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // бот заповнив приховане поле — робимо вигляд, що все добре
  if (typeof body.website_hp === "string" && body.website_hp.trim()) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooMany(ip)) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isEmail(email)) return NextResponse.json({ ok: false, error: "email" }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ ok: false, error: "consent" }, { status: 400 });

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  const templateId = Number(process.env.BREVO_DOI_TEMPLATE_ID);
  if (!apiKey || !listId || !templateId) {
    console.error("[subscribe] Brevo не налаштовано: BREVO_API_KEY / BREVO_LIST_ID / BREVO_DOI_TEMPLATE_ID");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        email,
        includeListIds: [listId],
        templateId,
        redirectionUrl: absoluteUrl("/rozsylka/pidtverdzheno"),
      }),
      cache: "no-store",
    });
    if (res.ok) return NextResponse.json({ ok: true });

    const detail = await res.text();
    // контакт уже є в базі — для людини це теж «перевірте пошту»
    if (res.status === 400 && /duplicate/i.test(detail)) return NextResponse.json({ ok: true });
    console.error("[subscribe] Brevo", res.status, detail);
    return NextResponse.json({ ok: false, error: "esp" }, { status: 502 });
  } catch (e) {
    console.error("[subscribe]", e);
    return NextResponse.json({ ok: false, error: "esp" }, { status: 502 });
  }
}
