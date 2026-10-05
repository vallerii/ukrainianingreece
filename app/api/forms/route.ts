import { NextResponse } from "next/server";
import { CmaNotConfigured, FORM_MODELS, createRecord } from "@/lib/datocms-cma";
import type { FormKind } from "@/lib/forms";
import { slugify } from "@/lib/format";

/**
 * POST /api/forms — заявки «Стати волонтером» і «Долучити організацію» → DatoCMS.
 * Захист: honeypot-поле, обмеження частоти з однієї IP, перевірка обов’язкових полів і згоди.
 */

const hits = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5; // не більше 5 заявок за 10 хвилин
}

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // бот заповнив приховане поле — робимо вигляд, що все добре
  if (str(body.website_hp)) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooMany(ip)) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });

  const kind = body.kind as FormKind;
  if (body.consent !== true) return NextResponse.json({ ok: false, error: "consent" }, { status: 400 });

  try {
    if (kind === "volunteer") {
      const name = str(body.name, 120);
      const email = str(body.email, 200);
      if (!name || !isEmail(email)) return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
      const skills = Array.isArray(body.skills) ? body.skills.map((s) => str(s, 80)).filter(Boolean) : [];
      await createRecord(FORM_MODELS.volunteer, {
        name,
        email,
        phone: str(body.phone, 40) || null,
        city: str(body.city, 80) || null,
        skills: skills.join(", ") || null,
        availability: str(body.availability, 80) || null,
        message: str(body.message, 3000) || null,
        consent: true,
      });
      return NextResponse.json({ ok: true });
    }

    if (kind === "organization") {
      const name = str(body.name, 160);
      const contactName = str(body.contact_name, 120);
      const contactEmail = str(body.contact_email, 200);
      const city = str(body.city, 80);
      const summary = str(body.summary, 1500);
      if (!name || !contactName || !isEmail(contactEmail) || !city || !summary)
        return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
      const year = Number(str(body.founded_year, 4));
      await createRecord(FORM_MODELS.organization, {
        name,
        // унікальний slug: назва + короткий хвіст, редактор може змінити перед публікацією
        slug: `${slugify(name) || "organization"}-${Date.now().toString(36).slice(-4)}`,
        city,
        founded_year: Number.isInteger(year) && year > 1900 && year <= new Date().getFullYear() ? year : null,
        summary,
        website: str(body.website, 300) || null,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: str(body.contact_phone, 40) || null,
        application_message: str(body.message, 3000) || null,
        is_founder: false,
        consent: true,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  } catch (e) {
    console.error("[forms]", e);
    const notConfigured = e instanceof CmaNotConfigured;
    return NextResponse.json(
      {
        ok: false,
        error: notConfigured ? "not_configured" : "server",
        // у режимі розробки показуємо причину, щоб легше налагоджувати
        ...(process.env.NODE_ENV !== "production" ? { detail: String(e) } : {}),
      },
      { status: notConfigured ? 503 : 502 },
    );
  }
}
