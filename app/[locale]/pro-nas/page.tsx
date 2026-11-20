import Link from "@/components/i18n/Link";
import FormLink from "@/components/forms/FormLink";
import { buildStats } from "@/lib/site";
import { getOrganizations, toNetwork } from "@/lib/organizations";
import { getT, initPage, setLocale } from "@/lib/i18n/server";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";
import AboutNav from "@/components/about/AboutNav";
import Founders from "@/components/about/Founders";
import { alternates } from "@/lib/i18n/seo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  setLocale((await params).locale);
  const t = getT();
  return { title: t.aboutPage.metaTitle, description: t.aboutPage.metaDesc, alternates: alternates("/pro-nas") };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { t } = await initPage(params);
  const a = t.aboutPage;
  const { audiences, goals, geography, mission, team, timeline, values, vision } = t.about;
  const network = toNetwork(await getOrganizations());
  const foundersCount = network.filter((o) => o.role === "founder").length;
  const stats = buildStats(t, foundersCount);
  return (
    <>
      {/* ── Шапка сторінки ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-paper-dim pb-12 pt-32 md:pt-36">
      <div className="absolute inset-0 bg-[radial-gradient(72%_90%_at_88%_0%,rgba(255,201,60,0.30),transparent_66%),radial-gradient(58%_80%_at_2%_8%,rgba(42,123,209,0.12),transparent_62%)]" />
      <div className="grain" />
        <div className="shell relative">
          <Reveal>
            <p className="eyebrow text-sky-700">{t.nav.about}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="display mt-5 max-w-4xl text-[clamp(1.76rem,4.48vw,3.52rem)] text-ink">
              {a.h1A}<span className="text-sky-700">{a.h1B}</span>{a.h1C}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {a.lead}
            </p>
          </Reveal>
        </div>
      </section>

      <AboutNav />

      {/* ── Хто ми є ───────────────────────────────────── */}
      <section id="opys" className="scroll-mt-32 bg-paper py-12 md:py-16">
        <div className="shell">
          <SectionHead
            eyebrow={t.nav.who}
            title={a.whoTitle}
          />

          <div className="grid gap-10 pt-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <div className="space-y-5 text-[1.05rem] leading-relaxed text-ink-soft">
              <Reveal>
                <p>
                  {a.p1}
                </p>
              </Reveal>
              <Reveal delay={0.05}>
                <p>
                  {a.p2A}
                  <strong className="font-medium text-ink">{a.p2B}</strong>
                  {a.p2C}
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <p>
                  {a.p3}
                </p>
              </Reveal>
              <Reveal delay={0.12}>
                <div className="border-t border-line pt-5">
                  <p className="eyebrow text-mute">{a.forWhom}</p>
                  <ul className="mt-3 space-y-1.5">
                    {audiences.map((a) => (
                      <li key={a} className="flex gap-3">
                        <span className="text-sky-700">—</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>

            <div className="space-y-8">
              <Reveal delay={0.08}>
                <div className="border-t border-line pt-6">
                  <p className="eyebrow text-sky-700">{t.home.mission}</p>
                  <p className="display mt-4 text-[clamp(1.04rem,1.92vw,1.44rem)] leading-snug text-ink">
                    {mission}
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.14}>
                <div className="border-t border-line pt-6">
                  <p className="eyebrow text-sky-700">{t.home.vision}</p>
                  <p className="display mt-4 text-[clamp(1.04rem,1.92vw,1.44rem)] leading-snug text-ink">
                    {vision}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>

          {/* цінності */}
          <div className="mt-12">
            <Reveal>
              <p className="eyebrow text-mute">{t.home.values}</p>
            </Reveal>
            <div className="mt-5">
              {values.map((v, idx) => (
                <Reveal key={v.k} delay={idx * 0.05}>
                  <div className="grid gap-1.5 border-t border-line py-4 sm:grid-cols-[16rem_1fr] sm:gap-10">
                    <p className="display text-[1.25rem] text-ink">{v.k}</p>
                    <p className="max-w-2xl text-[1rem] leading-relaxed text-ink-soft">{v.v}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* цифри */}
          <div className="mt-12 grid grid-cols-2 gap-y-8 border-t border-line pt-8 md:max-w-xl">
            {stats.map((s, idx) => (
              <Reveal key={s.label} delay={idx * 0.07}>
                <p className="display text-[clamp(1.92rem,4vw,3.2rem)] text-sky-700">{s.value}</p>
                <p className="mt-2 max-w-[12rem] text-sm leading-snug text-mute">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Цілі ───────────────────────────────────────── */}
      <section id="tsili" className="scroll-mt-32 bg-paper-dim py-12 md:py-16">
        <div className="shell">
          <SectionHead eyebrow={t.nav.goals} title={a.goalsTitle} />

          <div className="grid gap-x-16 gap-y-2 pt-6 md:grid-cols-2">
            {goals.map((g, idx) => (
              <Reveal key={g.n} delay={idx * 0.06}>
                <div className="grid grid-cols-[3rem_1fr] gap-4 border-b border-line py-6 md:gap-6 md:py-7">
                  <span className="font-display text-sm text-mute">{g.n}</span>
                  <div>
                    <h3 className="display text-[clamp(1.12rem,2.08vw,1.6rem)] text-ink">{g.title}</h3>
                    <p className="mt-3 max-w-md text-[0.98rem] leading-relaxed text-ink-soft">
                      {g.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Історія ────────────────────────────────────── */}
      <section id="istoriya" className="scroll-mt-32 bg-sky-deep py-12 md:py-16">
        <div className="shell">
          <SectionHead eyebrow={t.nav.history} title={a.historyTitle} tone="dark" />

          <div className="pt-6">
            {timeline.map((item, idx) => (
              <Reveal key={item.year} delay={idx * 0.06}>
                <div className="grid items-baseline gap-3 border-b border-white/12 py-6 md:grid-cols-[12rem_1fr] md:gap-12 md:py-7">
                  <p className="display text-[1.6rem] text-wheat-400 md:text-[2rem]">{item.year}</p>
                  <div>
                    <h3 className="display text-[clamp(1.04rem,1.92vw,1.52rem)] text-paper">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-[0.98rem] leading-relaxed text-sky-100/75">
                      {item.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Географія ──────────────────────────────────── */}
      <section id="geografiya" className="scroll-mt-32 bg-paper py-12 md:py-16">
        <div className="shell">
          <SectionHead eyebrow={t.nav.geo} title={a.geoTitle} />

          <div className="grid gap-x-16 gap-y-2 pt-6 md:grid-cols-2">
            {geography.map((g, idx) => (
              <Reveal key={g.city} delay={idx * 0.06}>
                <div className="border-b border-line py-6 md:py-7">
                  <p className="eyebrow text-sky-700">{g.role}</p>
                  <h3 className="display mt-3 text-[clamp(1.28rem,2.4vw,1.92rem)] text-ink">
                    {g.city}
                  </h3>
                  <p className="mt-3 max-w-md text-[0.98rem] leading-relaxed text-ink-soft">
                    {g.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Команда ────────────────────────────────────── */}
      <section id="komanda" className="scroll-mt-32 bg-paper-dim py-12 md:py-16">
        <div className="shell">
          <SectionHead eyebrow={t.nav.team} title={a.teamTitle} />

          <div className="pt-6">
            {team.map((m, idx) => (
              <Reveal key={m.role} delay={idx * 0.04}>
                <div className="grid gap-2 border-b border-line py-6 md:grid-cols-[1fr_1.2fr] md:gap-10">
                  <p className="display text-[1.2rem] text-ink">{m.role}</p>
                  <p className="text-[0.98rem] leading-relaxed text-ink-soft">{m.area}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Засновники ─────────────────────────────────── */}
      <section id="zasnovnyky" className="scroll-mt-32 bg-paper py-12 md:py-16">
        <div className="shell">
          <SectionHead
            eyebrow={t.nav.founders}
            title={a.foundersTitle(foundersCount)}
            link="/proyekty"
            linkLabel={t.home.projectsEyebrow}
          />
          <Reveal>
            <p className="max-w-2xl pt-6 text-[1.02rem] leading-relaxed text-ink-soft">
              {a.foundersLead}
            </p>
          </Reveal>
          <Founders founders={network} />
        </div>
      </section>

      {/* ── Заклик ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-wheat-400 py-20 md:py-24">
        <div className="grain" />
        <div className="shell relative">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="eyebrow text-wheat-700">{a.next}</p>
              <h2 className="display mt-4 max-w-2xl text-[clamp(1.44rem,3.2vw,2.4rem)] text-ink">
                {a.ctaTitle}
              </h2>
            </div>
            <FormLink
              kind="organization"
              className="rounded-full bg-ink px-8 py-4 text-sm font-medium uppercase tracking-[0.12em] text-paper transition-colors hover:bg-sky-700"
            >
              {t.join.org}
            </FormLink>
          </div>
        </div>
      </section>
    </>
  );
}
