"use client";

import Link from "@/components/i18n/Link";
import DonateLink from "@/components/donate/DonateLink";
import { site, type NavItem } from "@/lib/site";
import Image from "next/image";
import SocialIcon from "@/components/ui/SocialIcon";
import NewsletterForm from "./NewsletterForm";
import { useT } from "@/components/i18n/I18nProvider";

export default function Footer({ nav, reportsHref = null }: { nav: NavItem[]; reportsHref?: string | null }) {
  const t = useT();
  const f = t.footer;
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="shell py-20">
        <div className="grid gap-14 lg:grid-cols-[1.25fr_2fr]">
          <div>
            <Link href="/" className="flex items-center gap-4">
              <span className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15">
                <Image
                  src="/logo-mark.png"
                  alt=""
                  width={200}
                  height={200}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="max-w-[13rem]">
                <span className="wordmark block text-[0.86rem] text-paper">
                  {t.site.nameLine1}
                </span>
                <span className="wordmark block text-[0.86rem] text-sky-100/70">
                  {t.site.nameLine2}
                </span>
              </span>
            </Link>

            <p className="mt-7 max-w-sm text-[0.95rem] leading-relaxed text-sky-100/70">
              {t.site.slogan}. {f.about}
            </p>

            <div className="mt-8 flex gap-3">
              {site.socials.map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="flex h-11 w-11 justify-center items-center rounded-full border border-white/18 text-sky-100/80 transition-colors hover:border-wheat-400 hover:text-wheat-400"
                >
                  <SocialIcon name={s.icon} className="h-[1.15rem] w-[1.15rem]" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Link href="/pro-nas" className="eyebrow text-wheat-400 transition-opacity hover:opacity-75">
                {f.aboutUs}
              </Link>
              <ul className="mt-4 space-y-2.5">
                {nav[0].children!.map((c) => (
                  <li key={c.label}>
                    <Link href={c.href} className="text-[0.92rem] text-sky-100/70 transition-colors hover:text-paper">
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Link href="/proyekty" className="eyebrow text-wheat-400 transition-opacity hover:opacity-75">
                {f.projects}
              </Link>
              <ul className="mt-4 space-y-2.5">
                {(nav.find((n) => n.href === "/proyekty")?.children ?? []).map((c) => (
                  <li key={c.label}>
                    <Link href={c.href} className="text-[0.92rem] text-sky-100/70 transition-colors hover:text-paper">
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow text-wheat-400">{f.sections}</p>
              <ul className="mt-4 space-y-2.5">
                {[
                  { label: f.news, href: "/novyny" },
                  { label: f.blog, href: "/blog" },
                  { label: f.events, href: "/podiyi" },
                  { label: f.reports, href: "/podiyi/zvity" },
                  ...(reportsHref ? [{ label: f.money, href: reportsHref }] : []),
                  { label: f.useful, href: "/korysno" },
                  { label: f.contacts, href: "/kontakty" },
                  { label: f.support, href: "/pidtrymaty" },
                ].map((c) => (
                  <li key={c.href}>
                    {c.href === "/pidtrymaty" ? (
                      <DonateLink className="text-[0.92rem] text-sky-100/70 transition-colors hover:text-paper">
                        {c.label}
                      </DonateLink>
                    ) : (
                      <Link href={c.href} className="text-[0.92rem] text-sky-100/70 transition-colors hover:text-paper">
                        {c.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="sm:col-span-2 lg:col-span-2">
              <p className="eyebrow text-wheat-400">{f.contacts}</p>
              <ul className="mt-4 space-y-2.5 text-[0.92rem] text-sky-100/70">
                <li>
                  <a href={`mailto:${site.email}`} className="link-underline hover:text-paper">
                    {site.email}
                  </a>
                </li>
                <li>
                  <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="link-underline hover:text-paper">
                    {site.phone}
                  </a>
                </li>
                <li>{t.site.address}</li>
                <li>{t.site.cities.join(" · ")}</li>
              </ul>
            </div>

            <div>
              <p className="eyebrow text-wheat-400">{f.newsletter}</p>
              <p className="mt-4 text-[0.92rem] leading-relaxed text-sky-100/70">
                {f.newsletterLead}
              </p>
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/12 pt-7 text-[0.8rem] text-sky-100/65 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {t.site.name}
          </p>
          <div className="flex flex-wrap gap-6">
            <Link href="/polityka" className="hover:text-paper">
              {f.privacy}
            </Link>
            <Link href="/kontakty#media" className="hover:text-paper">
              {f.media}
            </Link>
            <DonateLink className="text-wheat-400 hover:text-paper">{f.support}</DonateLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
