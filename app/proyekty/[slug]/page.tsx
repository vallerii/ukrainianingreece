import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSatellite, hasContent, satelliteNumber, satellites, type Block } from "@/lib/projects";
import PageHead from "@/components/cms/PageHead";
import ProjectLogo from "@/components/projects/ProjectLogo";
import SocialIcon from "@/components/ui/SocialIcon";
import Reveal from "@/components/ui/Reveal";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return satellites.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getSatellite((await params).slug);
  if (!p) return {};
  return { title: p.title, description: p.summary };
}

function renderBlock(b: Block, i: number) {
  if ("p" in b) return <p key={i}>{b.p}</p>;
  return (
    <ul key={i}>
      {b.list.map((li) => (
        <li key={li}>{li}</li>
      ))}
    </ul>
  );
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const p = getSatellite(slug);
  if (!p) notFound();

  const full = hasContent(p);
  const idx = satellites.findIndex((s) => s.slug === p.slug);
  const next = satellites[(idx + 1) % satellites.length];
  const c = p.contacts;
  const hasContacts = !!(c && (c.phone || c.email || c.address || c.socials?.length));

  return (
    <>
      <PageHead
        eyebrow={
          <span className="flex flex-wrap items-center gap-4">
            <Link href="/proyekty" className="hover:text-ink">
              ← Проєкти
            </Link>
            <span className="h-px w-8 bg-line" />
            <span>
              {satelliteNumber(p.slug)} · {p.city}
            </span>
          </span>
        }
        title={p.title}
        lead={p.subtitle}
      />

      <section className="bg-paper pb-24 pt-14 md:pt-16">
        <div className="shell grid gap-14 lg:grid-cols-[1fr_20rem] lg:gap-20">
          {/* Основний текст */}
          <div className="min-w-0">
            {full ? (
              <div className="max-w-[44rem] space-y-14">
                {p.sections!.map((s, i) => (
                  <Reveal key={i}>
                    <section>
                      {s.title && (
                        <h2 className="display mb-6 text-[clamp(1.5rem,2.6vw,2.1rem)] text-ink">{s.title}</h2>
                      )}
                      <div className="rich">{s.blocks.map(renderBlock)}</div>
                    </section>
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="max-w-[44rem]">
                <p className="text-lg leading-relaxed text-ink-soft">{p.summary}</p>
                <div className="mt-10 border-l-2 border-wheat-400 bg-wheat-50 px-6 py-6">
                  <p className="font-display text-lg text-ink">Сторінка наповнюється</p>
                  <p className="mt-2 leading-relaxed text-mute">
                    Ми збираємо матеріали про цей проєкт: історію, напрями роботи, контакти та фото.
                    Якщо ви з цієї спільноти — напишіть нам, і ми додамо інформацію.
                  </p>
                  <Link href="/kontakty" className="link-underline mt-4 inline-block text-sm font-bold text-ink">
                    Звʼязатися з нами →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Бокова колонка: логотип, факти, контакти */}
          <aside className="space-y-10 lg:sticky lg:top-32 lg:self-start">
            {p.logo && <ProjectLogo logo={p.logo} title={p.title} />}

            {p.facts && p.facts.length > 0 && (
              <dl className="space-y-5">
                {p.facts.map((f) => (
                  <div key={f.label}>
                    <dt className="eyebrow text-mute">{f.label}</dt>
                    <dd className="mt-2 border-t border-line pt-2 leading-relaxed text-ink">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div>
              <p className="eyebrow text-mute">Контакти</p>
              <div className="rule mt-3" />
              {hasContacts ? (
                <ul className="mt-4 space-y-3 text-[0.95rem]">
                  {c!.phone && (
                    <li>
                      <a href={`tel:${c!.phone.replace(/\s/g, "")}`} className="link-underline text-ink">
                        {c!.phone}
                      </a>
                    </li>
                  )}
                  {c!.email && (
                    <li>
                      <a href={`mailto:${c!.email}`} className="link-underline break-all text-ink">
                        {c!.email}
                      </a>
                    </li>
                  )}
                  {c!.address && <li className="leading-relaxed text-ink-soft">{c!.address}</li>}
                  {c!.socials?.map((s) => (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-3 text-ink"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-line transition-colors group-hover:bg-sky-deep group-hover:text-paper">
                          <SocialIcon name={s.icon} className="h-3.5 w-3.5" />
                        </span>
                        <span className="link-underline">{s.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-mute">Контакти зʼявляться найближчим часом.</p>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* Наступний проєкт */}
      <Link href={`/proyekty/${next.slug}`} className="group block bg-paper-dim">
        <div className="shell flex flex-wrap items-end justify-between gap-6 py-16 md:py-20">
          <div>
            <p className="eyebrow text-sky-700">Наступний проєкт · {satelliteNumber(next.slug)}</p>
            <p className="display mt-4 max-w-3xl text-[clamp(1.6rem,3.4vw,2.8rem)] text-ink transition-colors group-hover:text-sky-700">
              {next.title}
            </p>
          </div>
          <span className="text-2xl text-sky-700 transition-transform duration-500 group-hover:translate-x-2">→</span>
        </div>
      </Link>
    </>
  );
}
