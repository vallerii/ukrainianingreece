import Link from "next/link";
import type { Article } from "@/lib/cms";
import { excerpt, formatDate } from "@/lib/format";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";
import Cover from "@/components/cms/Cover";

export default function News({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;
  const [lead, ...rest] = articles;

  return (
    <section id="novyny" className="bg-paper-dim py-24 md:py-32">
      <div className="shell">
        <SectionHead eyebrow="Новини" title="Що відбувається у спільноті" link="/novyny" />

        <div className="grid gap-14 pt-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <Reveal>
            <Link href={`/novyny/${lead.slug}`} className="group block">
              <Cover image={lead.image} hue={lead.hue} ratio="aspect-[16/10]" />
              <p className="mt-6 flex items-center gap-4 text-[0.72rem] uppercase tracking-[0.18em] text-mute">
                {lead.type && <span className="text-sky-700">{lead.type.title}</span>}
                <span className="h-px w-8 bg-line" />
                {formatDate(lead.date)}
              </p>
              <h3 className="display mt-4 max-w-xl text-[clamp(1.6rem,3vw,2.4rem)] text-ink transition-colors group-hover:text-sky-700">
                {lead.title}
              </h3>
              <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">{excerpt(lead.html)}</p>
              <span className="link-underline mt-5 inline-block text-sm font-bold text-ink">
                Читати далі →
              </span>
            </Link>
          </Reveal>

          <div className="flex flex-col justify-start gap-10">
            {rest.map((n, idx) => (
              <Reveal key={n.id} delay={0.08 * (idx + 1)}>
                <Link
                  href={`/novyny/${n.slug}`}
                  className="group grid gap-5 border-t border-line pt-8 sm:grid-cols-[9rem_1fr] sm:gap-7"
                >
                  <div className="max-w-[9rem]">
                    <Cover image={n.image} hue={n.hue} sizes="9rem" />
                  </div>
                  <div>
                    <p className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.18em] text-mute">
                      {n.type && <span className="text-sky-700">{n.type.title}</span>}
                      {formatDate(n.date)}
                    </p>
                    <h3 className="mt-2.5 font-display text-[1.15rem] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-sky-700">
                      {n.title}
                    </h3>
                    <p className="mt-2.5 text-[0.92rem] leading-relaxed text-mute">
                      {excerpt(n.html, 130)}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
            {rest.length === 0 && (
              <div className="border-t border-line pt-8">
                <p className="leading-relaxed text-mute">
                  Більше матеріалів — у розділі новин.
                </p>
                <Link href="/novyny" className="link-underline mt-4 inline-block text-sm font-bold text-ink">
                  Усі новини →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
