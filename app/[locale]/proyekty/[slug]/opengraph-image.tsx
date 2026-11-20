import { getOrganization } from "@/lib/organizations";
import { excerpt } from "@/lib/format";
import { OG_SIZE, ogDefaults, renderOg } from "@/lib/og";
import { setLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";

export const alt = "United Ukrainian Diaspora in Greece";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const p = await params;
  const locale = setLocale(p.locale);
  const org = await getOrganization(p.slug, locale);
  if (!org) return renderOg(locale, ogDefaults(locale));
  return renderOg(locale, {
    eyebrow: `${dictionaries[locale].searchIndex.project} · ${org.city}`,
    title: org.title,
    subtitle: excerpt(org.summary, 110),
  });
}
