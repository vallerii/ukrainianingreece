import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DonateDialog from "@/components/donate/DonateDialog";
import FormDialog from "@/components/forms/FormDialog";
import { buildNav, site } from "@/lib/site";
import { getOrganizations } from "@/lib/organizations";
import { FINANCIAL_REPORTS_HREF, getFinancialReports } from "@/lib/cms";

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.slogan}`,
    template: `%s — ${site.name}`,
  },
  description:
    "Мережа українських організацій, шкіл, клубів та ініціатив у Греції. Одна точка входу для українців і один голос перед грецьким суспільством.",
  openGraph: {
    title: site.name,
    description: site.slogan,
    locale: "uk_UA",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // посилання на фінансові звіти — лише якщо в CMS є хоча б один звіт
  const [reports, orgs] = await Promise.all([getFinancialReports(), getOrganizations()]);
  const reportsHref = reports.length > 0 ? FINANCIAL_REPORTS_HREF : null;
  // меню «Проєкти» — з DatoCMS
  const nav = buildNav(orgs);

  return (
    <html lang="uk">
      <head>
        <link
          rel="preload"
          href="/fonts/e-Ukraine-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/e-UkraineHead-Light.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        <Header nav={nav} />
        <main>{children}</main>
        <Footer nav={nav} reportsHref={reportsHref} />
        <DonateDialog reportsHref={reportsHref} />
        <FormDialog />
      </body>
    </html>
  );
}
