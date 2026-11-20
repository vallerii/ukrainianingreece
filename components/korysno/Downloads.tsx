import type { ResourceGroup } from "@/lib/resources";
import { fileSize } from "@/lib/resources";
import type { Locale } from "@/lib/i18n/config";
import Reveal from "@/components/ui/Reveal";

const LANG: Record<Locale, string> = { uk: "UA", en: "EN", el: "GR" };

type Props = {
  groups: ResourceGroup[];
  locale: Locale;
  t: { eyebrow: string; title: string; lead: string; download: string; otherLangs: string };
};

/** Матеріали для завантаження, згруповані за розділами. Мова сторінки — головна кнопка, решта мов — поруч. */
export default function Downloads({ groups, locale, t }: Props) {
  if (!groups.length) return null;
  return (
    <section id="materialy" className="scroll-mt-32 bg-paper-dim py-20 md:py-24">
      <div className="shell">
        <p className="eyebrow text-sky-700">{t.eyebrow}</p>
        <h2 className="display mt-4 max-w-3xl text-[clamp(1.5rem,2.8vw,2.3rem)] text-ink">{t.title}</h2>
        <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-mute">{t.lead}</p>

        {groups.map((g) => (
          <div key={g.id} className="mt-14">
            {g.title && (
              <h3 className="border-b border-ink pb-3 font-display text-[1.05rem] text-ink">{g.title}</h3>
            )}
            {g.items.map((r, i) => {
              const main = r.files.find((f) => f.locale === locale) ?? r.files[0];
              const others = r.files.filter((f) => f !== main);
              return (
                <Reveal key={r.id} delay={Math.min(i, 4) * 0.04}>
                  <article className="grid gap-6 border-b border-line py-8 sm:grid-cols-[7.5rem_1fr] md:grid-cols-[7.5rem_1fr_auto] md:items-center md:gap-10">
                    {r.cover ? (
                      <a href={main ? `/api/download/${r.slug}/${main.locale}` : undefined} className="block w-24 sm:w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${r.cover.url}?w=300&auto=format`}
                          alt=""
                          width={r.cover.width}
                          height={r.cover.height}
                          loading="lazy"
                          className="h-auto w-full border border-line shadow-sm"
                        />
                      </a>
                    ) : (
                      <div className="hidden sm:block" />
                    )}
                    <div>
                      <h4 className="display text-[1.3rem] leading-snug text-ink">{r.title}</h4>
                      {r.description && <p className="mt-2 max-w-2xl text-[0.94rem] leading-relaxed text-mute">{r.description}</p>}
                    </div>
                    {main && (
                      <div className="flex flex-col gap-3 sm:col-start-2 md:col-start-auto md:items-end">
                        <a
                          href={`/api/download/${r.slug}/${main.locale}`}
                          className="inline-flex items-center gap-3 self-start bg-sky-deep px-5 py-3 text-sm font-semibold text-paper transition-colors hover:bg-sky-700 md:self-auto"
                        >
                          <span aria-hidden>↓</span>
                          {t.download} · {LANG[main.locale]}
                          <span className="font-normal text-sky-100/70">
                            {main.format.toUpperCase()} {fileSize(main.size)}
                          </span>
                        </a>
                        {others.length > 0 && (
                          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-mute">
                            <span>{t.otherLangs}</span>
                            {others.map((f) => (
                              <a key={f.locale} href={`/api/download/${r.slug}/${f.locale}`} className="link-underline font-semibold text-ink">
                                {LANG[f.locale]} <span className="font-normal text-mute">{fileSize(f.size)}</span>
                              </a>
                            ))}
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                </Reveal>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
