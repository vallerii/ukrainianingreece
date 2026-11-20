import type { Metadata } from "next";
import { getT, initPage, setLocale } from "@/lib/i18n/server";
import { alternates } from "@/lib/i18n/seo";
import { localeMeta } from "@/lib/i18n/config";
import { fileSize } from "@/lib/media";
import { notFound } from "next/navigation";
import { getFinancialReports } from "@/lib/cms";
import PageHead from "@/components/cms/PageHead";
import RichText from "@/components/cms/RichText";
import DonateLink from "@/components/donate/DonateLink";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  setLocale((await params).locale);
  const d = getT().financePage;
  return { title: d.metaTitle, description: d.metaDesc, alternates: alternates("/finansovi-zvity") };
}


export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { t, locale } = await initPage(params);
  const d = t.financePage;
  const num = new Intl.NumberFormat(localeMeta[locale].intl, { maximumFractionDigits: 0 });
  const eur = { format: (n: number) => `${num.format(n)} €` };
  const reports = await getFinancialReports();
  // поки звітів немає — сторінки не існує, і посилання на неї ніде не показується
  if (reports.length === 0) notFound();

  return (
    <>
      <PageHead
        eyebrow={d.eyebrow}
        title={
          <>
            {d.h1A}<span className="text-sky-700">{d.h1B}</span>
          </>
        }
        lead={d.lead}
      />

      <section className="bg-paper pb-28 pt-12">
        <div className="shell">
          {reports.map((r) => {
            const max = Math.max(r.income ?? 0, r.expenses ?? 0) || 1;
            return (
              <article key={r.id} className="grid gap-8 border-b border-line py-12 lg:grid-cols-[12rem_1fr_18rem] lg:gap-14">
                <p className="display text-[clamp(2.08rem,4vw,3.04rem)] leading-none text-ink">{r.year}</p>

                <div className="min-w-0">
                  <h2 className="font-display text-[1.3rem] font-semibold tracking-tight text-ink">{r.title}</h2>
                  {r.html && <RichText html={r.html} className="mt-4 max-w-[40rem] text-[1rem]" />}
                </div>

                <div className="space-y-5">
                  {[
                    { label: d.income, v: r.income, tone: "bg-wheat-400" },
                    { label: d.expenses, v: r.expenses, tone: "bg-sky-700" },
                  ]
                    .filter((x) => x.v != null)
                    .map((x) => (
                      <div key={x.label}>
                        <div className="flex items-baseline justify-between">
                          <span className="eyebrow text-mute">{x.label}</span>
                          <span className="font-display text-lg tabular-nums text-ink">{eur.format(x.v!)}</span>
                        </div>
                        <div className="mt-2 h-1.5 bg-paper-dim">
                          <div className={`h-full ${x.tone}`} style={{ width: `${(x.v! / max) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  {r.file && (
                    <a
                      href={r.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 border border-ink/20 px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-sky-700 hover:text-sky-700"
                    >
                      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {d.full} · {fileSize(r.file.size, locale)}
                    </a>
                  )}
                </div>
              </article>
            );
          })}

          <div className="mt-14 flex flex-wrap items-center justify-between gap-6">
            <p className="max-w-xl leading-relaxed text-ink-soft">
              {d.every}
            </p>
            <DonateLink className="rounded-full bg-wheat-400 px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-sky-deep hover:text-paper">
              {t.footer.support} →
            </DonateLink>
          </div>
        </div>
      </section>
    </>
  );
}
