import type { Metadata } from "next";
import { getT, initPage, setLocale } from "@/lib/i18n/server";
import { alternates } from "@/lib/i18n/seo";
import Image from "next/image";
import Link from "@/components/i18n/Link";
import { getOrganizations, toProjects } from "@/lib/organizations";
import PageHead from "@/components/cms/PageHead";
import ProjectLogo from "@/components/projects/ProjectLogo";
import Reveal from "@/components/ui/Reveal";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  setLocale((await params).locale);
  const pp = getT().projectsPage;
  return { title: pp.metaTitle, description: pp.metaDesc, alternates: alternates("/proyekty") };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { t } = await initPage(params);
  const pp = t.projectsPage;
  const orgs = toProjects(await getOrganizations());

  return (
    <>
      <PageHead
        eyebrow={pp.eyebrow}
        title={
          <>
            {pp.h1A}<span className="text-sky-700">{pp.h1B}</span>
          </>
        }
        lead={pp.lead}
      />

      <section className="bg-paper pb-20 pt-4">
        <div className="shell">
          {orgs.map((p, idx) => (
            <Reveal key={p.slug} delay={Math.min(idx, 4) * 0.04}>
              <Link
                href={`/proyekty/${p.slug}`}
                className="group grid items-center gap-5 border-b border-line py-7 md:grid-cols-[4rem_1fr_11rem] md:gap-10"
              >
                <span className="font-display text-sm text-mute">{p.n}</span>
                <div>
                  <p className="eyebrow text-sky-700">{p.city}</p>
                  <h2 className="display mt-3 max-w-3xl text-[clamp(1.2rem,2.4vw,1.92rem)] text-ink transition-colors group-hover:text-sky-700">
                    {p.title}
                  </h2>
                  <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">{p.summary}</p>
                  <span className="link-underline mt-4 inline-block text-sm font-bold text-ink">
                    {pp.more}
                  </span>
                </div>
                <div className="hidden md:block">
                  {p.logo ? (
                    <ProjectLogo logo={p.logo} title={p.title} className="h-28" />
                  ) : p.gallery[0] ? (
                    <div className="relative h-28 overflow-hidden bg-paper-dim">
                      <Image src={p.gallery[0].src} alt="" fill sizes="11rem" className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-28 items-center justify-center bg-paper-dim">
                      <span className="display text-4xl text-mute/40">{p.n}</span>
                    </div>
                  )}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
