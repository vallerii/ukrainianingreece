import Link from "next/link";
import { site, stats } from "@/lib/site";
import { goals, geography, team, timeline, values } from "@/lib/about";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";
import AboutNav from "@/components/about/AboutNav";
import Founders from "@/components/about/Founders";

export const metadata = {
  title: "Про нас",
  description:
    "Хто ми є, наші цілі, історія, географія, команда та організації-засновники Об’єднаної української діаспори в Греції.",
};

export default function Page() {
  return (
    <>
      {/* ── Шапка сторінки ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-paper-dim pb-16 pt-40 md:pt-44">
      <div className="absolute inset-0 bg-[radial-gradient(72%_90%_at_88%_0%,rgba(255,201,60,0.30),transparent_66%),radial-gradient(58%_80%_at_2%_8%,rgba(42,123,209,0.12),transparent_62%)]" />
      <div className="grain" />
        <div className="shell relative">
          <Reveal>
            <p className="eyebrow text-sky-700">Про нас</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="display mt-5 max-w-4xl text-[clamp(2.2rem,5.6vw,4.4rem)] text-ink">
              Одна спільнота,
              <br />
              зібрана з <span className="text-sky-700">багатьох</span>.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Українські організації, школи, клуби та ініціативи Греції, які вирішили
              працювати разом — під одним іменем і з одним голосом.
            </p>
          </Reveal>
        </div>
      </section>

      <AboutNav />

      {/* ── Хто ми є ───────────────────────────────────── */}
      <section id="opys" className="scroll-mt-32 bg-paper py-24 md:py-32">
        <div className="shell">
          <SectionHead eyebrow="Хто ми є" title="Не фонд і не земляцтво. Мережа спільнот під одним дахом." />

          <div className="grid gap-14 pt-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
            <div className="space-y-6 text-[1.05rem] leading-relaxed text-ink-soft">
              <Reveal>
                <p>
                  Об’єднана українська діаспора в Греції — це не благодійний фонд і не класичне
                  земляцтво. Це структура, яка збирає докупи те, що вже існує: організації,
                  школи, клуби та ініціативи, створені самими українцями в різних містах країни.
                </p>
              </Reveal>
              <Reveal delay={0.05}>
                <p>
                  Всередині ми працюємо як <strong className="font-medium text-ink">одна точка входу</strong>.
                  Людині, яка щойно приїхала, не треба знати, хто саме опікується школами, а хто —
                  документами: достатньо звернутися до нас. Ззовні ми працюємо як{" "}
                  <strong className="font-medium text-ink">один голос</strong> — грецькій владі,
                  муніципалітетам, медіа та донорам набагато простіше мати одного співрозмовника,
                  ніж десять розрізнених.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <p>
                  Кожна організація-засновниця зберігає свою назву, свою команду й свої проєкти.
                  Об’єднання не поглинає — воно додає: спільний бренд, спільний календар,
                  спільні ресурси й представництво там, куди поодинці не дотягнутися.
                </p>
              </Reveal>
            </div>

            <div className="space-y-10">
              <Reveal delay={0.08}>
                <div className="border-t border-line pt-6">
                  <p className="eyebrow text-sky-700">Місія</p>
                  <p className="display mt-4 text-[clamp(1.3rem,2.4vw,1.8rem)] leading-snug text-ink">
                    Єднати українців у Греції, підтримувати одне одного та зберігати культурну
                    й мовну ідентичність далеко від дому.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.14}>
                <div className="border-t border-line pt-6">
                  <p className="eyebrow text-sky-700">Візія</p>
                  <p className="display mt-4 text-[clamp(1.3rem,2.4vw,1.8rem)] leading-snug text-ink">
                    Головна платформа єднання української спільноти в Греції — простір, де кожен
                    знайде підтримку, спільноту та можливість долучитися.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>

          {/* цінності */}
          <div className="mt-20">
            <Reveal>
              <p className="eyebrow text-mute">Цінності</p>
            </Reveal>
            <div className="mt-8">
              {values.map((v, idx) => (
                <Reveal key={v.k} delay={idx * 0.05}>
                  <div className="grid gap-2 border-t border-line py-6 sm:grid-cols-[14rem_1fr] sm:gap-10">
                    <p className="display text-[1.25rem] text-ink">{v.k}</p>
                    <p className="max-w-2xl text-[1rem] leading-relaxed text-ink-soft">{v.v}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* цифри */}
          <div className="mt-20 grid grid-cols-2 gap-y-10 border-t border-line pt-10 md:grid-cols-4">
            {stats.map((s, idx) => (
              <Reveal key={s.label} delay={idx * 0.07}>
                <p className="display text-[clamp(2.4rem,5vw,4rem)] text-sky-700">{s.value}</p>
                <p className="mt-2 max-w-[12rem] text-sm leading-snug text-mute">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Цілі ───────────────────────────────────────── */}
      <section id="tsili" className="scroll-mt-32 bg-paper-dim py-24 md:py-32">
        <div className="shell">
          <SectionHead eyebrow="Цілі" title="Що ми робимо щодня" />

          <div className="grid gap-x-16 gap-y-2 pt-6 md:grid-cols-2">
            {goals.map((g, idx) => (
              <Reveal key={g.n} delay={idx * 0.06}>
                <div className="grid grid-cols-[3rem_1fr] gap-4 border-b border-line py-8 md:gap-6 md:py-10">
                  <span className="font-display text-sm text-mute/70">{g.n}</span>
                  <div>
                    <h3 className="display text-[clamp(1.4rem,2.6vw,2rem)] text-ink">{g.title}</h3>
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
      <section id="istoriya" className="scroll-mt-32 bg-sky-deep py-24 md:py-32">
        <div className="shell">
          <SectionHead eyebrow="Історія" title="Як усе почалося" tone="dark" />

          <div className="pt-6">
            {timeline.map((t, idx) => (
              <Reveal key={t.year} delay={idx * 0.06}>
                <div className="grid items-baseline gap-3 border-b border-white/12 py-9 md:grid-cols-[12rem_1fr] md:gap-12 md:py-11">
                  <p className="display text-[1.6rem] text-wheat-400 md:text-[2rem]">{t.year}</p>
                  <div>
                    <h3 className="display text-[clamp(1.3rem,2.4vw,1.9rem)] text-paper">
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
      <section id="geografiya" className="scroll-mt-32 bg-paper py-24 md:py-32">
        <div className="shell">
          <SectionHead eyebrow="Географія" title="Де ми присутні" />

          <div className="grid gap-x-16 gap-y-2 pt-6 md:grid-cols-2">
            {geography.map((g, idx) => (
              <Reveal key={g.city} delay={idx * 0.06}>
                <div className="border-b border-line py-8 md:py-10">
                  <p className="eyebrow text-sky-700">{g.role}</p>
                  <h3 className="display mt-3 text-[clamp(1.6rem,3vw,2.4rem)] text-ink">
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
      <section id="komanda" className="scroll-mt-32 bg-paper-dim py-24 md:py-32">
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
      <section id="zasnovnyky" className="scroll-mt-32 bg-paper py-24 md:py-32">
        <div className="shell">
          <SectionHead
            eyebrow="Засновники"
            title="П’ять організацій, які започаткували об’єднання"
            link="/proyekty"
            linkLabel="Проєкти спільноти"
          />
          <Reveal>
            <p className="max-w-2xl pt-10 text-[1.02rem] leading-relaxed text-ink-soft">
              Кожна з них працює у своєму місті й зі своєю аудиторією. Разом вони покривають
              {" "}{site.cities.length} міста Греції — від Афін до Криту.
            </p>
          </Reveal>
          <Founders />
        </div>
      </section>

      {/* ── Заклик ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-wheat-400 py-20 md:py-24">
        <div className="grain" />
        <div className="shell relative">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="eyebrow text-wheat-700">Далі</p>
              <h2 className="display mt-4 max-w-2xl text-[clamp(1.8rem,4vw,3rem)] text-ink">
                Ваша організація теж може стати частиною мережі.
              </h2>
            </div>
            <Link
              href="/kontakty"
              className="rounded-full bg-ink px-8 py-4 text-sm font-medium uppercase tracking-[0.12em] text-paper transition-colors hover:bg-sky-700"
            >
              Контакти
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
