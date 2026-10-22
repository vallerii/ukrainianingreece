import { NextResponse } from "next/server";

/**
 * POST /api/donate { amount } — щомісячна підписка на довільну суму.
 * Створює Stripe Checkout Session з потрібною ціною й повертає { url } сторінки оплати.
 * Потрібен STRIPE_SECRET_KEY у .env (Stripe → Developers → API keys → Secret key).
 * Без ключа відповідає 501, і сайт відкриває запасне посилання donate.monthlyCustom.
 */

const MIN = 2;
const MAX = 1000;

const hits = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 20;
}

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 501 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooMany(ip)) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });

  let amount = 0;
  try {
    amount = Math.round(Number((await req.json()).amount));
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount < MIN || amount > MAX)
    return NextResponse.json({ ok: false, error: "amount", min: MIN, max: MAX }, { status: 400 });

  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(req.url).origin;

  const form = new URLSearchParams({
    mode: "subscription",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][unit_amount]": String(amount * 100),
    "line_items[0][price_data][recurring][interval]": "month",
    "line_items[0][price_data][product_data][name]": "Monthly support · Щомісячна підтримка",
    success_url: `${origin}/dyakuyemo`,
    cancel_url: `${origin}/pidtrymaty`,
    // щомісячна сума завжди в євро, без конвертації з націнкою в іншу валюту
    "adaptive_pricing[enabled]": "false",
  });

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  const data = await res.json();
  if (!res.ok || !data.url) {
    console.error("[donate] stripe error", data?.error?.message);
    return NextResponse.json({ ok: false, error: "stripe" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, url: data.url });
}
