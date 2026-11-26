import { NextResponse } from "next/server";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { brevo, brevoConfig, SENDER_EMAIL, SENDER_NAME } from "@/lib/newsletter/brevo";
import { buildDigest } from "@/lib/newsletter/digest";

/**
 * GET /api/newsletter/draft — щомісячний дайджест.
 *
 * Vercel Cron (vercel.json) викликає його 1-го числа: для кожної мови збирає лист
 * з DatoCMS і кладе в Brevo ЧЕРНЕТКУ кампанії на список підписників цієї мови.
 * Нічого не надсилається автоматично — редактор відкриває Brevo → Campaigns,
 * перевіряє лист і натискає «Надіслати».
 *
 * Доступ: заголовок «Authorization: Bearer <CRON_SECRET>» (Vercel Cron додає його сам)
 * або ?secret=<CRON_SECRET> для ручного запуску з браузера.
 *   ?preview=uk|en|el — показати HTML листа, нічого не створюючи в Brevo
 *                       (+ &date=2026-10-20 — зібрати лист так, ніби сьогодні ця дата).
 *   ?lang=en          — створити чернетку лише для однієї мови.
 *
 * Змінні: CRON_SECRET, BREVO_API_KEY (ключ з правом на Email campaigns).
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request, url: URL) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}` || url.searchParams.get("secret") === secret;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET не задано" }, { status: 503 });
  }
  if (!authorized(req, url)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const preview = url.searchParams.get("preview");
  if (preview) {
    const date = new Date(url.searchParams.get("date") ?? "");
    const digest = await buildDigest(isLocale(preview) ? preview : "uk", isNaN(date.getTime()) ? new Date() : date);
    return new NextResponse(digest.html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, error: "BREVO_API_KEY не задано" }, { status: 503 });

  const only = url.searchParams.get("lang");
  const langs: readonly Locale[] = isLocale(only) ? [only] : locales;
  const results = [];

  for (const locale of langs) {
    try {
      const digest = await buildDigest(locale);
      if (!digest.counts.articles && !digest.counts.events) {
        results.push({ locale, skipped: "немає новин і подій" });
        continue;
      }
      const res = await brevo("/emailCampaigns", apiKey, {
        name: `Дайджест ${locale.toUpperCase()} — ${digest.subject}`,
        subject: digest.subject,
        sender: { name: SENDER_NAME[locale], email: SENDER_EMAIL },
        replyTo: SENDER_EMAIL,
        htmlContent: digest.html,
        recipients: { listIds: [brevoConfig(locale).listId] },
        inlineImageActivation: false,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("[newsletter/draft]", locale, res.status, body);
        results.push({ locale, error: `Brevo ${res.status}`, detail: body });
      } else {
        results.push({ locale, campaignId: (body as { id?: number }).id, ...digest.counts });
      }
    } catch (e) {
      console.error("[newsletter/draft]", locale, e);
      results.push({ locale, error: String(e) });
    }
  }

  const ok = results.every((r) => !("error" in r));
  return NextResponse.json({ ok, results }, { status: ok ? 200 : 502 });
}
