import Link from "next/link";
import FormLink from "@/components/forms/FormLink";
import { buildStats } from "@/lib/site";
import { getOrganizations, toNetwork } from "@/lib/organizations";
import { foundersPhrase } from "@/lib/projects";
import { audiences, goals, geography, mission, team, timeline, values, vision } from "@/lib/about";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";
import AboutNav from "@/components/about/AboutNav";
import Founders from "@/components/about/Founders";

export const revalidate = 60;

export const metadata = {
  title: "Про нас",
  description:
    "Хто ми є, наші цілі, історія, географія, команда та організації-засновники Об’єднаної української діаспори в Греції.",
};

export default async function Page() {
  const network = toNetwork(await getOrganizations());
  const foundersCount = network.filter((o) => o.role === "Засновник").length;
  const stats = buildStats(foundersCount);
  return (
    <>
      {/* ── Шапка сторінки ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-paper-dim pb-12 pt-32 md:pt-36">
      <div className="absolute inset-0 bg-[radial-gradient(72%_90%_at_88%_0%,rgba(255,201,60,0.30),transparent_66%),radial-gradient(58%_80%_at_2%_8%,rgba(42,123,209,0.12),transparent_62%)]" />
      <div className="grain" />
        <div className="shell relative">
          <Reveal>
            <p className="eyebrow text-sky-700">Про нас</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="display mt-5 max-w-4xl text-[clamp(1.76rem,4.48vw,3.52rem)] text-ink">
              Сильний і згуртований <span className="text-sky-700">голос українців</span> у Греції
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Підтримка, єдність і спільна дія — з 2023 року ми об’єднуємо українські
              організації та спільноти в Афінах і на Криті.
            </p>
          </Reveal>
        </div>
      </section>

      <AboutNav />

      {/* ── Хто ми є ───────────────────────────────────── */}
      <section id="opys" className="scroll-mt-32 bg-paper py-12 md:py-16">
        <div className="shell">
          <SectionHead
            eyebrow="Хто ми є"
            title="Мережа українських організацій та спільнот в Греції, об’єднаних спільними цінностями та прагненнями."
          />

          <div className="grid gap-10 pt-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <div className="space-y-5 text-[1.05rem] leading-relaxed text-ink-soft">
              <Reveal>
                <p>
                  Об’єднана українська діаспора в Греції — сильний і згуртований голос українців у
                  Греції. Ми сприяємо збереженню культурної ідентичності та інтеграції, підтримуємо
                  й розширюємо можливості українців, які тут живуть.
                </p>
              </Reveal>
              <Reveal delay={0.05}>
                <p>
                  Об’єднання засноване у 2023 році. Сьогодні ми представляємо{" "}
                  <strong className="font-medium text-ink">п’ять українських організацій</strong> та
                  неформальні українські спільноти в Афінах і на острові Крит.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <p>
                  Ми сприяємо співпраці й взаємопідтримці, допомагаємо українцям знаходити необхідні
                  ресурси та представляємо інтереси громади у діалозі з грецькою владою, медіа й
                  партнерами. Особлива увага — найвразливішим: жінкам, дітям і людям похилого віку.
                </p>
              </Reveal>
              <Reveal delay={0.12}>
                <div className="border-t border-line pt-5">
                  <p className="eyebrow text-mute">Для кого ми працюємо</p>
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
                  <p className="eyebrow text-sky-700">Місія</p>
                  <p className="display mt-4 text-[clamp(1.04rem,1.92vw,1.44rem)] leading-snug text-ink">
                    {mission}
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.14}>
                <div className="border-t border-line pt-6">
                  <p className="eyebrow text-sky-700">Візія</p>
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
              <p className="eyebrow text-mute">Цінності</p>
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
          <SectionHead eyebrow="Цілі" title="Що ми робимо щодня" />

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
          <SectionHead eyebrow="Історія" title="Як усе почалося" tone="dark" />

          <div className="pt-6">
            {timeline.map((t, idx) => (
              <Reveal key={t.year} delay={idx * 0.06}>
                <div className="grid items-baseline gap-3 border-b border-white/12 py-6 md:grid-cols-[12rem_1fr] md:gap-12 md:py-7">
                  <p className="display text-[1.6rem] text-wheat-400 md:text-[2rem]">{t.year}</p>
                  <div>
                    <h3 className="display text-[clamp(1.04rem,1.92vw,1.52rem)] text-paper">
                      {t.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-[0.98rem] leading-relaxed text-sky-100/75">
                      {t.text}
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
          <SectionHead eyebrow="Географія" title="Де ми присутні" />

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
          <SectionHead eyebrow="Команда" title="Люди спільноти" />

          <div className="pt-6">
            {team.map((t, idx) => (
              <Reveal key={t.role} delay={idx * 0.04}>
                <div className="grid gap-2 border-b border-line py-6 md:grid-cols-[1fr_1.2fr] md:gap-10">
                  <p className="display text-[1.2rem] text-ink">{t.role}</p>
                  <p className="text-[0.98rem] leading-relaxed text-ink-soft">{t.area}</p>
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
            eyebrow="Засновники та партнери"
            title={`${foundersPhrase(foundersCount)}-засновників і партнери мережі`}
            link="/proyekty"
            linkLabel="Постійні проєкти"
          />
          <Reveal>
            <p className="max-w-2xl pt-6 text-[1.02rem] leading-relaxed text-ink-soft">
              Кожна організація працює у своєму місті й зі своєю аудиторією, а разом ми говоримо
              одним голосом від імені української громади Греції. Мережа відкрита: нові
              організації долучаються як партнери.
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
              <p className="eyebrow text-wheat-700">Далі</p>
              <h2 className="display mt-4 max-w-2xl text-[clamp(1.44rem,3.2vw,2.4rem)] text-ink">
                Ваша організація теж може стати частиною мережі.
              </h2>
            </div>
            <FormLink
              kind="organization"
              className="rounded-full bg-ink px-8 py-4 text-sm font-medium uppercase tracking-[0.12em] text-paper transition-colors hover:bg-sky-700"
            >
              Долучити організацію
            </FormLink>
          </div>
        </div>
      </section>
    </>
  );
}
