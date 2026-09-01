"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { site } from "@/lib/site";

/* deterministic pseudo-random so server and client render identically */
function rnd(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function Wheat({
  count,
  color,
  height,
  opacity,
  seed,
}: {
  count: number;
  color: string;
  height: number;
  opacity: number;
  seed: number;
}) {
  const stalks = Array.from({ length: count }, (_, i) => {
    const r = rnd(seed + i);
    const r2 = rnd(seed + i + 99);
    const x = (i / count) * 1440 + (r - 0.5) * 34;
    const h = height * (0.68 + r2 * 0.5);
    const lean = (r - 0.5) * 26;
    return { x, h, lean, key: i, delay: r2 * 4 };
  });

  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      className="absolute inset-x-0 bottom-0 h-full w-full"
      aria-hidden="true"
    >
      {stalks.map((s) => (
        <g key={s.key} opacity={opacity}>
          <path
            d={`M ${s.x} 320 C ${s.x} ${320 - s.h * 0.5}, ${s.x + s.lean * 0.4} ${
              320 - s.h * 0.7
            }, ${s.x + s.lean} ${320 - s.h}`}
            stroke={color}
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
          />
          <ellipse
            cx={s.x + s.lean}
            cy={320 - s.h - 6}
            rx={5.2}
            ry={13}
            fill={color}
            transform={`rotate(${s.lean * 0.6} ${s.x + s.lean} ${320 - s.h - 6})`}
          />
        </g>
      ))}
    </svg>
  );
}

function Layer({
  children,
  depth,
  scrollY,
  mx,
  my,
  className = "",
}: {
  children: React.ReactNode;
  depth: number;
  scrollY: MotionValue<number>;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  className?: string;
}) {
  const y = useTransform(scrollY, [0, 1], [0, depth * 260]);
  const px = useTransform(mx, [-0.5, 0.5], [depth * 34, depth * -34]);
  const py = useTransform(my, [-0.5, 0.5], [depth * 18, depth * -18]);

  return (
    <motion.div style={{ y }} className={`absolute inset-0 ${className}`}>
      <motion.div
        style={{ x: px, y: py }}
        className="absolute -left-[8%] -top-[8%] h-[108%] w-[116%]"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scrollY = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 20, mass: 0.6 });
  const my = useSpring(rawY, { stiffness: 60, damping: 20, mass: 0.6 });

  const textY = useTransform(scrollY, [0, 1], [0, -120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  function onMove(e: React.MouseEvent<HTMLElement>) {
    if (reduce) return;
    const b = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - b.left) / b.width - 0.5);
    rawY.set((e.clientY - b.top) / b.height - 0.5);
  }

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-sky-deep"
    >
      {/* 1 · sky */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#062E5F_0%,#0B3F7E_28%,#12579F_52%,#4C93D8_70%,#9CC8EE_82%)]" />

      <div className="absolute inset-x-0 bottom-0 h-[12vh] bg-[#B37A00]" />

      {/* 2 · sun */}
      <Layer depth={0.12} scrollY={scrollY} mx={mx} my={my}>
        <motion.div
          animate={reduce ? undefined : { y: [0, -14, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[18%] top-[17%] h-[22vw] max-h-[290px] min-h-[160px] w-[22vw] min-w-[160px] max-w-[290px] rounded-full bg-[radial-gradient(circle,#FFE9A8_0%,#FFC93C_38%,rgba(255,201,60,0.28)_62%,transparent_72%)] blur-[2px]"
        />
      </Layer>

      {/* 3 · clouds */}
      <Layer depth={0.28} scrollY={scrollY} mx={mx} my={my}>
        {[
          { top: "18%", left: "-18%", w: 58, o: 0.24, d: 88 },
          { top: "34%", left: "-40%", w: 42, o: 0.18, d: 132 },
          { top: "9%", left: "12%", w: 34, o: 0.14, d: 108 },
        ].map((c, i) => (
          <motion.div
            key={i}
            initial={{ x: "0%" }}
            animate={reduce ? undefined : { x: "150%" }}
            transition={{ duration: c.d, repeat: Infinity, ease: "linear" }}
            style={{ top: c.top, left: c.left, width: `${c.w}vw`, opacity: c.o }}
            className="absolute h-[9vw] rounded-full bg-white blur-[46px]"
          />
        ))}
      </Layer>

      {/* 4 · far islands */}
      <Layer depth={0.42} scrollY={scrollY} mx={mx} my={my}>
        <svg
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
          className="absolute bottom-[31%] h-[14vh] w-full"
          aria-hidden="true"
        >
          <path
            d="M0 260 L0 190 L120 150 L210 186 L330 118 L432 172 L560 132 L690 188 L810 146 L940 196 L1080 140 L1210 184 L1320 152 L1440 196 L1440 260 Z"
            fill="#0B3F7E"
            opacity="0.55"
          />
        </svg>
      </Layer>

      {/* 5 · sea horizon */}
      <Layer depth={0.55} scrollY={scrollY} mx={mx} my={my}>
        <div className="absolute inset-x-0 bottom-[25%] h-[11vh] bg-[linear-gradient(180deg,rgba(156,200,238,0)_0%,rgba(214,232,250,0.55)_60%,rgba(255,233,168,0.5)_100%)]" />
      </Layer>

      {/* 6 · field, far */}
      <Layer depth={0.72} scrollY={scrollY} mx={mx} my={my}>
        <svg
          viewBox="0 0 1440 420"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-[33vh] w-full"
          aria-hidden="true"
        >
          <path
            d="M0 120 C 300 46, 640 128, 900 86 C 1120 50, 1300 104, 1440 74 L1440 420 L0 420 Z"
            fill="#FFC93C"
          />
        </svg>
      </Layer>

      {/* 7 · field, middle + wheat */}
      <Layer depth={1} scrollY={scrollY} mx={mx} my={my}>
        <svg
          viewBox="0 0 1440 420"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-[25vh] w-full"
          aria-hidden="true"
        >
          <path
            d="M0 150 C 260 90, 560 178, 880 132 C 1120 98, 1290 156, 1440 122 L1440 420 L0 420 Z"
            fill="#F2B705"
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-[17vh]">
          <Wheat count={54} color="#D99A02" height={150} opacity={0.55} seed={3} />
        </div>
      </Layer>

      {/* 8 · foreground wheat */}
      <Layer depth={1.5} scrollY={scrollY} mx={mx} my={my}>
        <svg
          viewBox="0 0 1440 420"
          preserveAspectRatio="none"
          className="absolute inset-x-0 -bottom-4 h-[15vh] w-full"
          aria-hidden="true"
        >
          <path
            d="M0 210 C 320 150, 620 236, 940 190 C 1160 158, 1310 208, 1440 180 L1440 420 L0 420 Z"
            fill="#B37A00"
          />
        </svg>
        <div className="absolute inset-x-0 -bottom-2 h-[19vh]">
          <Wheat count={30} color="#8F6200" height={230} opacity={0.9} seed={17} />
        </div>
      </Layer>

      {/* 9 · floating pollen */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 22 }, (_, i) => {
            const r = rnd(i + 200);
            const r2 = rnd(i + 500);
            return (
              <motion.span
                key={i}
                className="absolute block rounded-full bg-wheat-200"
                style={{
                  left: `${r * 100}%`,
                  bottom: `${8 + r2 * 46}%`,
                  width: 3 + r2 * 4,
                  height: 3 + r2 * 4,
                  opacity: 0.25 + r * 0.45,
                }}
                animate={{
                  y: [0, -30 - r * 50, 0],
                  x: [0, (r2 - 0.5) * 60, 0],
                }}
                transition={{
                  duration: 14 + r * 16,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: r2 * 6,
                }}
              />
            );
          })}
        </div>
      )}

      <div className="grain" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(102deg,rgba(6,46,95,0.66)_0%,rgba(6,46,95,0.30)_40%,transparent_66%)]" />

      {/* text */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 flex h-full items-center"
      >
        <div className="shell w-full">
          <div className="max-w-4xl pt-14">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="eyebrow text-wheat-200"
            >
              Об'єднана українська діаспора в Греції
            </motion.p>

            <h1 className="display mt-6 text-white text-[clamp(2.3rem,6.2vw,5.6rem)]">
              {site.slogan.split(" ").map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pr-[0.22em] align-bottom">
                  <motion.span
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 0.95,
                      delay: 0.25 + i * 0.07,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="inline-block"
                  >
                    {w === "—" ? <span className="text-wheat-400">—</span> : w}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 max-w-lg text-lg leading-relaxed text-sky-100 md:text-[1.15rem]"
            >
              Одна точка входу для українців у Греції та один голос перед грецьким
              суспільством, владою і партнерами.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.72, ease: [0.22, 1, 0.36, 1] }}
              className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4"
            >
              <Link
                href="/pro-nas"
                className="group inline-flex items-center gap-3 rounded-full bg-wheat-400 px-7 py-3.5 text-sm font-bold tracking-wide text-ink transition-colors hover:bg-white"
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
      </motion.div>

      {/* scroll hint */}
      <motion.div
        style={{ opacity: textOpacity }}
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, 9, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-[0.68rem] uppercase tracking-[0.28em] text-[#5C3F00]"
        >
          <span>гортати</span>
          <span className="block h-8 w-px bg-[#5C3F00]/45" />
        </motion.div>
      </motion.div>
    </section>
  );
}
