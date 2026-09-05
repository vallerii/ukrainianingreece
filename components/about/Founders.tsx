"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { founders } from "@/lib/site";
import Reveal from "@/components/ui/Reveal";

export default function Founders() {
  return (
    <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
      {founders.map((f, idx) => (
        <Reveal key={f.name} delay={idx * 0.06}>
          <Link href={f.href} className="group block">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-paper-dim">
              <motion.div
                className="absolute inset-0"
                initial={false}
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: `linear-gradient(150deg, hsl(${f.hue} 62% 46%) 0%, hsl(${
                    f.hue + 18
                  } 72% 62%) 55%, hsl(${f.hue - 12} 46% 32%) 100%)`,
                }}
              >
                <div className="grain" />
              </motion.div>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(10,20,32,0.55)_100%)]" />
              <span className="absolute bottom-3 left-4 font-display text-sm text-white/70">
                0{idx + 1}
              </span>
            </div>
            <p className="mt-4 font-display text-[1.02rem] leading-snug text-ink transition-colors group-hover:text-sky-700">
              {f.name}
            </p>
            <p className="mt-1 text-sm text-mute">{f.city}</p>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
