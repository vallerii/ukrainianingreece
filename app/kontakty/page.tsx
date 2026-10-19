import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/cms/PageHead";
import Reveal from "@/components/ui/Reveal";
import SocialIcon from "@/components/ui/SocialIcon";
import FormLink from "@/components/forms/FormLink";
import DonateLink from "@/components/donate/DonateLink";
import OpenFormFromHash from "@/components/forms/OpenFormFromHash";
import { site } from "@/lib/site";
import { getOrganizations } from "@/lib/organizations";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Контакти",
  description: `Як звʼязатися з Обʼєднаною українською діаспорою в Греції: ${site.email}, ${site.phone}. Запити від медіа, волонтерство, партнерство.`,
};

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;

export default async function Page() {
  const orgs = (await getOrganizations()).filter((o) => o.contacts.phone || o.contacts.email || o.contacts.socials.length);

  return (
    <>
      <OpenFormFromHash />
      <PageHead
        eyebrow="Звʼязок"
        title="Контакти"
        lead="Пишіть і телефонуйте — з питаннями, ідеями та пропозиціями співпраці."
      />

      {/* ── Основні контакти ─────────────────────────────── */}
      <section className="bg-paper py-16 md:py-20" aria-labelledby="main-contacts">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1fr_0.9fr] lg:gap-16">
          <Reveal>
            <h2 id="main-contacts" className="eyebrow text-mute">
              Обʼєднання
            </h2>
            <div className="rule mt-3" />
            <ul className="mt-6 space-y-4 text-lg">
              <li>
                <span className="block text-sm text-mute">E-mail</span>
                <a href={`mailto:${site.email}`} className="link-underline break-all text-ink">
                  {site.email}
                </a>
              </li>
              <li>
                <span className="block text-sm text-mute">Телефон</span>
                <a href={tel(site.phone)} className="link-underline text-ink">
                  {site.phone}
                </a>
              </li>
              <li>
                <span className="block text-sm text-mute">Адреса</span>
                <span className="text-ink">{site.address}</span>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.05}>
            <h2 className="eyebrow text-mute">Де ми є</h2>
            <div className="rule mt-3" />
            <p className="mt-6 font-display text-2xl leading-snug text-ink">{site.cities.join(" · ")}</p>
            <p className="mt-4 leading-relaxed text-ink-soft">
              Організації мережі працюють у різних містах Греції. Контакти кожної — нижче на цій сторінці
              та на{" "}
              <Link href="/proyekty" className="link-underline text-ink">
                сторінках проєктів
              </Link>
              .
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="eyebrow text-mute">Соцмережі</h2>
            <div className="rule mt-3" />
            <ul className="mt-6 space-y-3">
              {site.socials.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 text-ink"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-line transition-colors group-hover:bg-sky-deep group-hover:text-paper">
                      <SocialIcon name={s.icon} className="h-4 w-4" />
                    </span>
                    <span className="link-underline">{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── Долучитися / підтримати ─────────────────────── */}
      <section className="bg-paper-dim py-16 md:py-20" aria-labelledby="join">
        <div className="shell">
          <Reveal>
            <p className="eyebrow text-sky-700">Долучитися</p>
            <h2 id="join" className="display mt-4 max-w-3xl text-[clamp(1.44rem,2.88vw,2.24rem)] text-ink">
              Хочете допомогти чи стати частиною мережі?
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-px overflow-hidden rounded-sm bg-line md:grid-cols-3">
            <div id="volunteer" className="scroll-mt-32 bg-paper p-8">
              <h3 className="font-display text-xl text-ink">Стати волонтером</h3>
              <p className="mt-3 leading-relaxed text-ink-soft">
                Події, переклади, допомога новоприбулим, школи. Коротка анкета — і координатор звʼяжеться з вами.
              </p>
              <FormLink kind="volunteer" className="mt-6 inline-flex text-sm font-bold text-sky-700 hover:text-ink">
                Заповнити анкету →
              </FormLink>
            </div>
            <div id="organization" className="scroll-mt-32 bg-paper p-8">
              <h3 className="font-display text-xl text-ink">Долучити організацію</h3>
              <p className="mt-3 leading-relaxed text-ink-soft">
                Школа, клуб, хор чи громада — розкажіть про себе, і ми додамо вас до мережі та на сайт.
              </p>
              <FormLink kind="organization" className="mt-6 inline-flex text-sm font-bold text-sky-700 hover:text-ink">
                Подати заявку →
              </FormLink>
            </div>
            <div id="donate" className="scroll-mt-32 bg-paper p-8">
              <h3 className="font-display text-xl text-ink">Підтримати фінансово</h3>
              <p className="mt-3 leading-relaxed text-ink-soft">
                Разовий внесок або щомісячна підтримка шкіл, культурних і гуманітарних проєктів.
              </p>
              <DonateLink className="mt-6 inline-flex text-sm font-bold text-sky-700 hover:text-ink">
                Зробити донат →
              </DonateLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── Для медіа ────────────────────────────────────── */}
      <section id="media" className="scroll-mt-24 bg-sky-deep py-16 text-paper md:py-20" aria-labelledby="media-title">
        <div className="shell grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow text-wheat-400">Для медіа</p>
            <h2 id="media-title" className="display mt-4 text-[clamp(1.44rem,2.88vw,2.24rem)]">
              Журналістам і партнерам
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-sky-100/80">
              Обʼєднана українська діаспора в Греції представляє українські організації, школи та ініціативи
              країни. Ми допоможемо з коментарем, контактами спікерів і матеріалами про життя української
              громади в Греції.
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <ul className="space-y-6">
              <li>
                <p className="eyebrow text-sky-100/60">Запити від медіа</p>
                <a
                  href={`mailto:${site.email}?subject=${encodeURIComponent("Запит від медіа / Media request")}`}
                  className="link-underline mt-2 inline-block break-all text-lg text-paper"
                >
                  {site.email}
                </a>
                <p className="mt-1 text-sm text-sky-100/60">
                  Вкажіть видання, тему й дедлайн — так ми швидше знайдемо потрібну людину.
                </p>
              </li>
              <li>
                <p className="eyebrow text-sky-100/60">Телефон</p>
                <a href={tel(site.phone)} className="link-underline mt-2 inline-block text-lg text-paper">
                  {site.phone}
                </a>
              </li>
              <li>
                <p className="eyebrow text-sky-100/60">Матеріали</p>
                <ul className="mt-2 space-y-2">
                  <li>
                    <a href="/logo.png" download className="link-underline text-paper">
                      Логотип обʼєднання (PNG, висока роздільність)
                    </a>
                  </li>
                  <li>
                    <Link href="/pro-nas" className="link-underline text-paper">
                      Про нас: місія, історія, засновники
                    </Link>
                  </li>
                  <li>
                    <Link href="/novyny" className="link-underline text-paper">
                      Новини та офіційні заяви
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── Контакти організацій ─────────────────────────── */}
      {orgs.length > 0 && (
        <section className="bg-paper py-16 md:py-20" aria-labelledby="orgs-title">
          <div className="shell">
            <Reveal>
              <p className="eyebrow text-sky-700">Організації мережі</p>
              <h2 id="orgs-title" className="display mt-4 text-[clamp(1.28rem,2.4vw,1.92rem)] text-ink">
                Звʼязатися напряму
              </h2>
            </Reveal>
            <ul className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {orgs.map((o) => (
                <li key={o.slug} className="border-t border-line pt-5">
                  <Link href={`/proyekty/${o.slug}`} className="font-display text-lg text-ink hover:text-sky-700">
                    {o.title}
                  </Link>
                  <p className="mt-1 text-sm text-mute">{o.city}</p>
                  <ul className="mt-3 space-y-1.5 text-[0.95rem]">
                    {o.contacts.phone && (
                      <li>
                        <a href={tel(o.contacts.phone)} className="link-underline text-ink">
                          {o.contacts.phone}
                        </a>
                      </li>
                    )}
                    {o.contacts.email && (
                      <li>
                        <a href={`mailto:${o.contacts.email}`} className="link-underline break-all text-ink">
                          {o.contacts.email}
                        </a>
                      </li>
                    )}
                    {o.contacts.socials.map((s) => (
                      <li key={s.href}>
                        <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-underline text-ink">
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
