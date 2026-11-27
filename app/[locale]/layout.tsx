import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { JsonLd, siteGraph } from "@/lib/jsonld";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DonateDialog from "@/components/donate/DonateDialog";
import FormDialog from "@/components/forms/FormDialog";
import MotionProvider from "@/components/ui/MotionProvider";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { buildNav } from "@/lib/site";
import { getOrganizations, toProjects } from "@/lib/organizations";
import { FINANCIAL_REPORTS_HREF, getFinancialReports } from "@/lib/cms";
import { SITE_URL } from "@/lib/seo";
import { isLocale, localeMeta, locales } from "@/lib/i18n/config";
import { initPage, setLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const locale = setLocale((await params).locale);
  const t = dictionaries[locale];
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: t.site.name,
    title: {
      default: `${t.site.name} — ${t.site.slogan}`,
      template: `%s — ${t.site.name}`,
    },
    description: t.site.description,
    // og:title / og:description не задаємо: соцмережі беруть <title> і description кожної сторінки
    openGraph: {
      siteName: t.site.name,
      locale: localeMeta[locale].og,
      alternateLocale: locales.filter((l) => l !== locale).map((l) => localeMeta[l].og),
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = { themeColor: "#062E5F" };

export default async function RootLayout({ children, params }: Props) {
  if (!isLocale((await params).locale)) notFound();
  const { locale, t } = await initPage(params);
  // посилання на фінансові звіти — лише якщо в CMS є хоча б один звіт
  const [reports, orgs] = await Promise.all([getFinancialReports(), getOrganizations()]);
  const reportsHref = reports.length > 0 ? FINANCIAL_REPORTS_HREF : null;
  // меню «Проєкти» — з DatoCMS
  const nav = buildNav(t, toProjects(orgs));
  const subset = { uk: "cyrillic", en: "latin", el: "greek" }[locale];

  return (
    <html lang={locale}>
      <head>
        <link
          rel="preload"
          href={`/fonts/fira/fira-sans-condensed-${subset}-400-normal.woff2`}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href={`/fonts/fira/fira-sans-condensed-${subset}-300-normal.woff2`}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        <JsonLd data={siteGraph(locale)} />
        <a
          href="#zmist"
          className="sr-only z-[100] rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          {t.common.skip}
        </a>
        <I18nProvider locale={locale}>
          <MotionProvider>
            <Header nav={nav} />
            <main id="zmist" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <Footer nav={nav} reportsHref={reportsHref} />
            <DonateDialog reportsHref={reportsHref} />
            <FormDialog />
          </MotionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
