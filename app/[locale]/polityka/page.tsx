import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { site } from "@/lib/site";
import PageHead from "@/components/cms/PageHead";
import { getT, initPage, setLocale } from "@/lib/i18n/server";
import { alternates } from "@/lib/i18n/seo";
import { policy } from "./content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = setLocale((await params).locale);
  const p = policy[locale];
  return { title: p.title, description: p.description, alternates: alternates("/polityka") };
}

/*
 * ⚠ ПЕРЕД ЗАПУСКОМ:
 *  1. Заповнити реквізити організації в CONTROLLER (юридична назва, реєстраційний номер, АФМ).
 *  2. Звірити список сервісів у розділі «Кому передаємо дані» з тим, що реально підключено
 *     (хостинг, сервіс розсилки).
 *  3. Дати текст на перевірку юристу — це шаблон, а не юридична консультація.
 */
export type Controller = { name: string; legalName: string; regNumber: string; address: string; email: string };

const controller = (): Controller => ({
  name: getT().site.name,
  legalName: "", // напр. «Σωματείο …» — офіційна назва з реєстру
  regNumber: "", // номер реєстрації організації
  address: getT().site.address,
  email: site.email,
});

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await initPage(params);
  const p = policy[locale];
  const CONTROLLER = controller();
  const sections = p.sections(CONTROLLER);
  return (
    <>
      <PageHead
        eyebrow={p.eyebrow}
        title={p.title}
        lead={p.lead}
      >
        <p className="mt-6 text-sm text-mute">{p.updated}</p>
      </PageHead>

      <section className="bg-paper pb-28 pt-14 md:pt-16">
        <div className="shell grid gap-14 lg:grid-cols-[16rem_1fr] lg:gap-20">
          <nav aria-label={p.toc} className="hidden lg:sticky lg:top-32 lg:block lg:self-start">
            <p className="eyebrow text-mute">{p.toc}</p>
            <ol className="mt-4 space-y-2.5">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex gap-3 text-[0.92rem] text-ink-soft transition-colors hover:text-sky-700">
                    <span className="tabular-nums text-mute">{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="max-w-[44rem] space-y-14">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-32">
                <h2 className="display text-[clamp(1.12rem,1.92vw,1.52rem)] text-ink">
                  <span className="mr-3 font-display text-base text-mute">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h2>
                <div className="rich mt-5">{s.body}</div>
              </section>
            ))}
            <p className="border-t border-line pt-8 text-sm text-mute">
              {p.footA}<Link href="/kontakty" className="link-underline text-ink">{p.footLink}</Link>{p.footB}
              <a href={`mailto:${CONTROLLER.email}`} className="link-underline text-ink">{CONTROLLER.email}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
