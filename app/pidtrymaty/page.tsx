import type { Metadata } from "next";
import PageHead from "@/components/cms/PageHead";
import DonatePanel from "@/components/donate/DonatePanel";
import { FINANCIAL_REPORTS_HREF, getFinancialReports } from "@/lib/cms";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Підтримати",
  description: "Підтримайте українську спільноту Греції: разовий або щомісячний внесок.",
};

/** Запасна сторінка: на неї ведуть кнопки «Донат», якщо їх відкрити в новій вкладці. Основний сценарій — попап. */
export default async function Page() {
  const hasReports = (await getFinancialReports()).length > 0;
  return (
    <>
      <PageHead eyebrow="Підтримати" title="Разом ми можемо більше" />
      <section className="bg-paper pb-28 pt-12">
        <div className="shell max-w-2xl">
          <DonatePanel reportsHref={hasReports ? FINANCIAL_REPORTS_HREF : null} />
        </div>
      </section>
    </>
  );
}
