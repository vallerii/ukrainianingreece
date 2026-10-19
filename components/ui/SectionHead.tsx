"use client";

import Link from "next/link";
import Reveal from "./Reveal";

export default function SectionHead({
  eyebrow,
  title,
  link,
  linkLabel = "Дивитися все",
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  link?: string;
  linkLabel?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <Reveal>
      <div className="flex flex-wrap items-end justify-between gap-4 pb-5">
        <div>
          <p className={`eyebrow ${dark ? "text-wheat-400" : "text-sky-700"}`}>{eyebrow}</p>
          <h2
            className={`display mt-2.5 max-w-3xl text-[clamp(1.52rem,3.36vw,2.72rem)] ${
              dark ? "text-paper" : "text-ink"
            }`}
          >
            {title}
          </h2>
        </div>
        {link && (
          <Link
            href={link}
            className={`link-underline group inline-flex items-center gap-2 pb-2 text-sm font-semibold ${
              dark ? "text-paper" : "text-ink"
            }`}
          >
            {linkLabel}
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        )}
      </div>
      <div className={`rule ${dark ? "bg-white/15" : ""}`} />
    </Reveal>
  );
}
