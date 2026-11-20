import type { Metadata } from "next";
import { getT, initPage, setLocale } from "@/lib/i18n/server";
import { alternates } from "@/lib/i18n/seo";
import PageHead from "@/components/cms/PageHead";
import DonatePanel from "@/components/donate/DonatePanel";
import { FINANCIAL_REPORTS_HREF, getFinancialReports } from "@/lib/cms";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  setLocale((await params).locale);
  const d = getT().supportPage;
  return { title: d.metaTitle, description: d.metaDesc, alternates: alternates("/pidtrymaty") };
}

/** Запасна сторінка: на неї ведуть кнопки «Донат», якщо їх відкрити в новій вкладці. Основний сценарій — попап. */
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { t } = await initPage(params);
  const hasReports = (await getFinancialReports()).length > 0;
  return (
    <>
      <PageHead eyebrow={t.donate.eyebrow} title={t.donate.title} />
      <section className="bg-paper pb-28 pt-12">
        <div className="shell max-w-2xl">
          <DonatePanel reportsHref={hasReports ? FINANCIAL_REPORTS_HREF : null} />
        </div>
      </section>
    </>
  );
}
