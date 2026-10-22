import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrganization, getOrganizations, toNetwork, toProjects } from "@/lib/organizations";
import PageHead from "@/components/cms/PageHead";
import ProjectLogo from "@/components/projects/ProjectLogo";
import SocialIcon from "@/components/ui/SocialIcon";
import RichText from "@/components/cms/RichText";
import Reveal from "@/components/ui/Reveal";
import Gallery from "@/components/ui/Gallery";
import Media from "@/components/cms/Media";
import { getMedia } from "@/lib/media";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getOrganizations()).map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getOrganization((await params).slug);
  if (!p) return {};
  return { title: p.title, description: p.summary };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const orgs = await getOrganizations();
  const p = orgs.find((o) => o.slug === slug);
  if (!p) notFound();
  const media = await getMedia("organization", p.slug);

  const full = p.html.trim().length > 0;
  // «Наступний» — у межах своєї групи: постійні проєкти або організації мережі
  const projects = toProjects(orgs);
  const isProject = p.projectPosition !== null;
  const group = isProject
    ? projects
    : toNetwork(orgs).map((f) => orgs.find((o) => `/proyekty/${o.slug}` === f.href)!);
  const idx = group.findIndex((o) => o.slug === p.slug);
  const next = group[(idx + 1) % group.length];
  const number = isProject ? projects[idx]?.n : String(idx + 1).padStart(2, "0");
  const role = p.founder ? "Засновник" : p.partner ? "Партнер" : null;
  const c = p.contacts;
  const hasContacts = !!(c && (c.phone || c.email || c.address || c.website || c.socials?.length));

  return (
    <>
      <PageHead
        eyebrow={
          <span className="flex flex-wrap items-center gap-4">
            {isProject ? (
              <Link href="/proyekty" className="hover:text-ink">
                ← Постійні проєкти
              </Link>
            ) : (
              <Link href="/pro-nas#zasnovnyky" className="hover:text-ink">
                ← Засновники та партнери
              </Link>
            )}
            <span className="h-px w-8 bg-line" />
            <span>
              {isProject ? `${number} · ${p.city}` : [role, p.city].filter(Boolean).join(" · ")}
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
              <Reveal>
                <RichText html={p.html} className="max-w-[44rem]" />
              </Reveal>
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
            <Media media={media} className="mt-14" />
          </div>

          {/* Бокова колонка: логотип, факти, контакти */}
          <aside className="space-y-10 lg:sticky lg:top-32 lg:self-start">
            {p.logo ? (
              <ProjectLogo logo={p.logo} title={p.title} />
            ) : p.gallery[0] ? (
              <a href="#foto" className="block overflow-hidden bg-paper-dim">
                <Image
                  src={p.gallery[0].src}
                  alt={p.gallery[0].alt}
                  width={p.gallery[0].width}
                  height={p.gallery[0].height}
                  sizes="20rem"
                  className="h-auto w-full"
                />
              </a>
            ) : null}

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
                  {c!.website && (
                    <li>
                      <a
                        href={c!.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline break-all text-ink"
                      >
                        {c!.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                      </a>
                    </li>
                  )}
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

      {/* Фото */}
      {p.gallery.length > 0 && (
        <section id="foto" className="bg-paper pb-24" aria-labelledby="foto">
          <div className="shell">
            <div className="rule mb-8" />
            <h2 id="foto" className="display mb-8 text-[clamp(1.2rem,2.08vw,1.68rem)] text-ink">
              Фото
            </h2>
            <Gallery images={p.gallery} title={`Фото: ${p.title}`} />
          </div>
        </section>
      )}

      {/* Наступний проєкт */}
      <Link href={`/proyekty/${next.slug}`} className="group block bg-paper-dim">
        <div className="shell flex flex-wrap items-end justify-between gap-6 py-16 md:py-20">
          <div>
            <p className="eyebrow text-sky-700">{isProject ? `Наступний проєкт · ${toProjects(orgs).find((o) => o.slug === next.slug)?.n ?? ""}` : "Наступна організація"}</p>
            <p className="display mt-4 max-w-3xl text-[clamp(1.28rem,2.72vw,2.24rem)] text-ink transition-colors group-hover:text-sky-700">
              {next.title}
            </p>
          </div>
          <span className="text-2xl text-sky-700 transition-transform duration-500 group-hover:translate-x-2">→</span>
        </div>
      </Link>
    </>
  );
}
