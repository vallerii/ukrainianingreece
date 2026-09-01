"use client";

import { motion } from "motion/react";
import { partners } from "@/lib/site";
import Reveal from "@/components/ui/Reveal";

export default function Partners() {
  const row = [...partners, ...partners];

  return (
    <section className="overflow-hidden border-y border-line bg-paper py-16">
      <div className="shell">
        <Reveal>
          <p className="eyebrow text-mute">Партнери та підтримка</p>
        </Reveal>
      </div>

      <div className="relative mt-9 flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_9%,#000_91%,transparent)]">
        <motion.div
          className="flex shrink-0 items-center gap-16 pr-16"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
        >
          {row.map((p, i) => (
            <span
              key={i}
              className="whitespace-nowrap font-display text-[1.3rem] font-semibold tracking-tight text-mute/70 transition-colors hover:text-ink md:text-[1.7rem]"
            >
              {p}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
