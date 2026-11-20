import { OG_SIZE, ogDefaults, renderOg } from "@/lib/og";
import { isLocale } from "@/lib/i18n/config";

export const alt = "United Ukrainian Diaspora in Greece";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const p = (await params).locale;
  const locale = isLocale(p) ? p : "uk";
  return renderOg(locale, ogDefaults(locale));
}
