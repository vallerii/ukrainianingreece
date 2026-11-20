import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { Locale } from "./i18n/config";
import { dictionaries } from "./i18n/dictionaries";

/** Спільний макет OG-картинок (прев'ю посилань у Facebook, Telegram, Viber тощо). */
export const OG_SIZE = { width: 1200, height: 630 };

const asset = (name: string) => readFile(join(process.cwd(), "assets/og", name));

export async function renderOg(
  locale: Locale,
  { eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string },
) {
  const t = dictionaries[locale];
  // у грецьких великих літерах наголос не ставиться: «Πρόγραμμα» → «ΠΡΟΓΡΑΜΜΑ»
  const upper = (x: string) => x.normalize("NFD").replace(/[\u0301\u0308]/g, "").normalize("NFC").toUpperCase();
  // у e-Ukraine немає грецьких літер — для грецької версії беремо Fira Sans Condensed
  const extra = locale === "el"
    ? await Promise.all([asset("fira-sans-condensed-latin-500-normal.woff"), asset("fira-sans-condensed-latin-400-normal.woff")])
    : [];
  const [head, body, logo] = await Promise.all([
    asset(locale === "el" ? "fira-sans-condensed-greek-500-normal.woff" : "e-UkraineHead-Medium.ttf"),
    asset(locale === "el" ? "fira-sans-condensed-greek-400-normal.woff" : "e-Ukraine-Regular.ttf"),
    asset("logo-mark-256.png"),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const size = title.length > 70 ? 50 : title.length > 36 ? 60 : 76;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #062E5F 0%, #0B3F7E 62%, #12579F 100%)",
          color: "#FBF8F1",
          fontFamily: "Body",
          position: "relative",
        }}
      >
        {/* пшенична смуга внизу — прапор */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 18, background: "#FFC93C", display: "flex" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={96} height={96} style={{ borderRadius: 48 }} alt="" />
          <div style={{ display: "flex", flexDirection: "column", fontSize: 26, lineHeight: 1.25 }}>
            <span>{t.site.nameLine1}</span>
            <span style={{ color: "#D6E8FA" }}>{t.site.nameLine2}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, marginBottom: 24 }}>
          {eyebrow && (
            <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, textTransform: "uppercase", color: "#FFC93C" }}>
              {locale === "el" ? upper(eyebrow) : eyebrow}
            </div>
          )}
          <div style={{ display: "flex", fontFamily: "Head", fontSize: size, lineHeight: 1.08, maxWidth: 1000 }}>{title}</div>
          {subtitle && (
            <div style={{ display: "flex", fontSize: 28, lineHeight: 1.35, color: "#D6E8FA", maxWidth: 960 }}>{subtitle}</div>
          )}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Head", data: head, weight: 500, style: "normal" },
        { name: "Body", data: body, weight: 400, style: "normal" },
        // латиниця для грецької версії (назви на кшталт «Business Hub»)
        ...(extra.length
          ? [
              { name: "Head", data: extra[0], weight: 500 as const, style: "normal" as const },
              { name: "Body", data: extra[1], weight: 400 as const, style: "normal" as const },
            ]
          : []),
      ],
    },
  );
}

export const ogDefaults = (locale: Locale) => ({ title: dictionaries[locale].site.slogan, subtitle: dictionaries[locale].footer.about.replace(/\.$/, "") });
