"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { nav, site } from "@/lib/site";
import Image from "next/image";
import SocialIcon from "@/components/ui/SocialIcon";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="shell py-20">
        <div className="grid gap-14 lg:grid-cols-[1.25fr_2fr]">
          <div>
            <Link href="/" className="flex items-center gap-4">
              <span className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15">
                <Image
                  src="/logo.jpg"
                  alt={site.name}
                  width={200}
                  height={200}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="max-w-[13rem]">
                <span className="wordmark block text-[0.86rem] text-paper">
                  Об&apos;єднана українська
                </span>
                <span className="wordmark block text-[0.86rem] text-sky-100/70">
                  діаспора в Греції
                </span>
              </span>
            </Link>

            <p className="mt-7 max-w-sm text-[0.95rem] leading-relaxed text-sky-100/70">
              {site.slogan}. Мережа українських організацій, шкіл та ініціатив у Греції.
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
                Про нас
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
                Проєкти
              </Link>
              <ul className="mt-4 space-y-2.5">
                {nav[3].children!.map((c) => (
                  <li key={c.label}>
                    <Link href={c.href} className="text-[0.92rem] text-sky-100/70 transition-colors hover:text-paper">
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow text-wheat-400">Розділи</p>
              <ul className="mt-4 space-y-2.5">
                {[
                  { label: "Новини", href: "/novyny" },
                  { label: "Прийдешні події", href: "/podiyi" },
                  { label: "Звіти", href: "/podiyi/zvity" },
                  { label: "Корисна інформація", href: "/korysno" },
                  { label: "Контакти", href: "/kontakty" },
                  { label: "Підтримати", href: "/pidtrymaty" },
                ].map((c) => (
                  <li key={c.href}>
                    <Link href={c.href} className="text-[0.92rem] text-sky-100/70 transition-colors hover:text-paper">
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sm:col-span-2 lg:col-span-2">
              <p className="eyebrow text-wheat-400">Контакти</p>
              <ul className="mt-4 space-y-2.5 text-[0.92rem] text-sky-100/70">
                <li>
                  <a href={`mailto:${site.email}`} className="link-underline hover:text-paper">
                    {site.email}
                  </a>
                </li>
                <li>{site.phone}</li>
                <li>{site.cities.join(" · ")}</li>
              </ul>
            </div>

            <div>
              <p className="eyebrow text-wheat-400">Розсилка</p>
              <p className="mt-4 text-[0.92rem] leading-relaxed text-sky-100/70">
                Новини спільноти раз на місяць.
              </p>
              <form
                className="mt-5 flex items-center gap-3 border-b border-white/25 pb-2"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  required
                  placeholder="e-mail"
                  className="w-full bg-transparent text-[0.92rem] text-paper outline-none placeholder:text-white/35"
                />
                <motion.button
                  whileHover={{ x: 4 }}
                  type="submit"
                  aria-label="Підписатися"
                  className="text-lg text-wheat-400"
                >
                  →
                </motion.button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/12 pt-7 text-[0.8rem] text-sky-100/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <div className="flex flex-wrap gap-6">
            <Link href="/polityka" className="hover:text-paper">
              Політика конфіденційності
            </Link>
            <Link href="/kontakty" className="hover:text-paper">
              Для медіа
            </Link>
            <Link href="/pidtrymaty" className="text-wheat-400 hover:text-paper">
              Підтримати
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
