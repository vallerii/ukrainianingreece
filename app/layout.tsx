import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DonateDialog from "@/components/donate/DonateDialog";
import FormDialog from "@/components/forms/FormDialog";
import MotionProvider from "@/components/ui/MotionProvider";
import { buildNav, site } from "@/lib/site";
import { getOrganizations, toProjects } from "@/lib/organizations";
import { FINANCIAL_REPORTS_HREF, getFinancialReports } from "@/lib/cms";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: site.name,
  title: {
    default: `${site.name} — ${site.slogan}`,
    template: `%s — ${site.name}`,
  },
  description:
    "Мережа українських організацій, шкіл, клубів та ініціатив у Греції. Підтримка, єдність і спільна дія українців у Греції.",
  // og:title / og:description не задаємо: соцмережі беруть <title> і description кожної сторінки
  openGraph: {
    siteName: site.name,
    locale: "uk_UA",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#062E5F" };

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // посилання на фінансові звіти — лише якщо в CMS є хоча б один звіт
  const [reports, orgs] = await Promise.all([
    getFinancialReports(),
    getOrganizations(),
  ]);
  const reportsHref = reports.length > 0 ? FINANCIAL_REPORTS_HREF : null;
  // меню «Проєкти» — з DatoCMS
  const nav = buildNav(toProjects(orgs));

  return (
    <html lang="uk">
      <head>
        <link
          rel="preload"
          href="/fonts/fira/fira-sans-condensed-cyrillic-400-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/fira/fira-sans-condensed-cyrillic-300-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        <a
          href="#zmist"
          className="sr-only z-[100] rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Перейти до змісту
        </a>
        <MotionProvider>
          <Header nav={nav} />
          <main id="zmist" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer nav={nav} reportsHref={reportsHref} />
          <DonateDialog reportsHref={reportsHref} />
          <FormDialog />
        </MotionProvider>
      </body>
    </html>
  );
}
