"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { site } from "@/lib/site";

/**
 * Hero головної: фото акції на площі Синтагма + слоган.
 * Висота навмисно менша за екран (правка клієнта 18.10.2026: «заглавное поле очень широкое»),
 * щоб під ним одразу було видно початок наступної секції.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "12%"]);

  return (
    <section
      ref={ref}
      className="relative flex h-[72svh] min-h-[480px] max-h-[760px] w-full items-end overflow-hidden bg-sky-deep"
    >
      <motion.div style={{ y: photoY }} className="absolute inset-0 -bottom-[12%]">
        <Image
          src="/images/hero/syntagma.jpg"
          alt="Українці з прапорами на площі Синтагма перед парламентом Греції"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_40%]"
        />
      </motion.div>

      {/* затемнення: щоб білий текст читався на будь-якій ділянці фото */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,46,95,0.55)_0%,rgba(6,46,95,0.05)_30%,rgba(6,46,95,0.15)_55%,rgba(6,46,95,0.88)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(95deg,rgba(6,30,64,0.88)_0%,rgba(6,30,64,0.72)_35%,rgba(6,30,64,0.35)_60%,rgba(6,30,64,0.1)_80%)]" />

      <div className="shell relative z-10 w-full pb-12 md:pb-16">
        <div className="max-w-3xl">
          {/* слова анімуються окремо, але між ними — справжні пробіли:
              інакше пошуковики, копіювання й читачі екрана бачать «Разомми—українськагромадаГреції» */}
          <h1 className="display text-white text-[clamp(2.2rem,5.2vw,4.4rem)] [text-shadow:0_2px_24px_rgba(0,10,30,0.6)]">
            {site.slogan.split(" ").map((w, i, all) => (
              <span key={i}>
              <span className="inline-block overflow-hidden align-bottom">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block"
                >
                  {w === "—" ? <span className="text-wheat-400">—</span> : w}
                </motion.span>
              </span>
              {i < all.length - 1 && " "}
              </span>
            ))}
          </h1>

          {/* без fade: цей абзац — LCP-елемент на мобільних, він має бути видимим одразу */}
          <motion.p
            initial={{ y: 14 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 text-xl font-medium text-wheat-400 md:text-2xl [text-shadow:0_2px_16px_rgba(0,10,30,0.7)]"
          >
            {site.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            <Link
              href="/pro-nas"
              className="group inline-flex items-center gap-3 rounded-full bg-wheat-400 px-6 py-3 text-sm font-semibold tracking-wide text-ink transition-colors hover:bg-white"
            >
              Дізнатися про нас
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/proyekty"
              className="link-underline text-sm font-semibold tracking-wide text-white [text-shadow:0_2px_14px_rgba(6,46,95,0.9)]"
            >
              Наші проєкти
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
