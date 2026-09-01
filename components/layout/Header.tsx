"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { nav, site } from "@/lib/site";
import Image from "next/image";

function Logo({ solid }: { solid: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label={site.name}>
      <span className="relative block h-12 w-12 overflow-hidden rounded-full ring-1 ring-black/10">
        <Image src="/logo.jpg" alt={site.name} width={60} height={60} />
      </span>
      <span className="hidden leading-[1.05] sm:block">
        <span
          className={`block font-display text-[0.82rem] font-semibold tracking-tight transition-colors ${
            solid ? "text-ink" : "text-white"
          }`}
        >
          Об'єднана українська
        </span>
        <span
          className={`block font-display text-[0.82rem] font-semibold tracking-tight transition-colors ${
            solid ? "text-mute" : "text-sky-100"
          }`}
        >
          діаспора в Греції
        </span>
      </span>
    </Link>
  );
}

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setSolid(v > 80));

  const tone = solid || mobile;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          solid
            ? "bg-paper/92 shadow-[0_1px_0_rgba(0,0,0,0.07)] backdrop-blur-md"
            : "bg-transparent"
        }`}
        onMouseLeave={() => setOpen(null)}
      >
        {/* utility bar */}
        <div
          className={`hidden overflow-hidden border-b transition-all duration-500 lg:block ${
            solid ? "h-0 border-transparent opacity-0" : "h-11 border-white/15 opacity-100"
          }`}
        >
          <div className="shell flex h-11 items-center justify-end gap-7 text-[0.72rem] text-white/85">
            <div className="flex items-center gap-4">
              {site.socials.map((s) => (
                <a
                  key={s.short}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold tracking-[0.14em] transition-colors hover:text-wheat-400"
                >
                  {s.short}
                </a>
              ))}
            </div>
            <span className="h-3.5 w-px bg-white/25" />
            <div className="flex items-center gap-3">
              {site.languages.map((l, i) => (
                <button
                  key={l.code}
                  className={`flex items-center gap-1.5 tracking-wide transition-opacity ${
                    i === 0 ? "opacity-100" : "opacity-55 hover:opacity-100"
                  }`}
                >
                  <span className="text-sm leading-none">{l.flag}</span>
                  <span className="font-semibold uppercase">{l.code}</span>
                </button>
              ))}
            </div>
            <span className="h-3.5 w-px bg-white/25" />
            <Link
              href="/pidtrymaty"
              className="rounded-full bg-wheat-400 px-4 py-1.5 font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-white"
            >
              Донат
            </Link>
          </div>
        </div>

        {/* main bar */}
        <div className="shell flex h-[4.6rem] items-center justify-between gap-6">
          <Logo solid={tone} />

          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <div key={item.href} onMouseEnter={() => setOpen(item.label)}>
                <Link
                  href={item.href}
                  className={`relative block px-3.5 py-2 text-[0.82rem] font-semibold tracking-tight transition-colors ${
                    tone ? "text-ink-soft hover:text-ink" : "text-white/90 hover:text-white"
                  }`}
                >
                  {item.label}
                  {item.children && <span className="ml-1.5 text-[0.6rem] opacity-60">▾</span>}
                  {open === item.label && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-wheat-400"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </Link>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/pidtrymaty"
              className={`hidden rounded-full px-5 py-2.5 text-[0.78rem] font-bold uppercase tracking-[0.12em] transition-all lg:inline-block ${
                solid
                  ? "bg-ink text-paper hover:bg-sky-700"
                  : "border border-white/35 text-white hover:border-wheat-400 hover:text-wheat-400"
              }`}
            >
              Долучитися
            </Link>

            <button
              onClick={() => setMobile((v) => !v)}
              aria-label="Меню"
              className={`flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden ${
                tone ? "text-ink" : "text-white"
              }`}
            >
              <motion.span
                animate={mobile ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="block h-[2px] w-6 bg-current"
              />
              <motion.span
                animate={mobile ? { opacity: 0 } : { opacity: 1 }}
                className="block h-[2px] w-6 bg-current"
              />
              <motion.span
                animate={mobile ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className="block h-[2px] w-6 bg-current"
              />
            </button>
          </div>
        </div>

        {/* mega dropdown */}
        <AnimatePresence>
          {open &&
            nav.find((n) => n.label === open)?.children && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 top-full hidden border-t border-line bg-paper/97 backdrop-blur-md lg:block"
              >
                <div className="shell grid grid-cols-3 gap-x-10 gap-y-1 py-8">
                  {nav
                    .find((n) => n.label === open)!
                    .children!.map((c, i) => (
                      <motion.div
                        key={c.href}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.03 * i, duration: 0.35 }}
                      >
                        <Link
                          href={c.href}
                          onClick={() => setOpen(null)}
                          className="group flex items-baseline justify-between gap-6 border-b border-line py-3.5"
                        >
                          <span>
                            <span className="block text-[0.95rem] font-semibold text-ink transition-colors group-hover:text-sky-700">
                              {c.label}
                            </span>
                            {c.note && (
                              <span className="mt-0.5 block text-[0.78rem] text-mute">{c.note}</span>
                            )}
                          </span>
                          <span className="text-mute transition-transform duration-300 group-hover:translate-x-1 group-hover:text-sky-700">
                            →
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </header>

      {/* mobile menu */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-paper pt-[4.6rem] lg:hidden"
          >
            <div className="shell py-8">
              {nav.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
                  className="border-b border-line py-4"
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobile(false)}
                    className="display block text-[1.7rem] text-ink"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                      {item.children.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          onClick={() => setMobile(false)}
                          className="text-[0.85rem] text-mute"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              <div className="mt-8 flex items-center justify-between">
                <div className="flex gap-5 text-sm font-semibold text-ink-soft">
                  {site.socials.map((s) => (
                    <a key={s.short} href={s.href} target="_blank" rel="noreferrer">
                      {s.short}
                    </a>
                  ))}
                </div>
                <div className="flex gap-3 text-sm">
                  {site.languages.map((l) => (
                    <button key={l.code} className="uppercase">
                      {l.flag} {l.code}
                    </button>
                  ))}
                </div>
              </div>

              <Link
                href="/pidtrymaty"
                onClick={() => setMobile(false)}
                className="mt-6 block rounded-full bg-wheat-400 py-4 text-center text-sm font-bold uppercase tracking-[0.14em] text-ink"
              >
                Підтримати
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
