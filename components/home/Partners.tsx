import { partners } from "@/lib/site";
import Reveal from "@/components/ui/Reveal";

export default function Partners() {
  const row = [...partners, ...partners];

  return (
    <section className="relative overflow-hidden bg-sky-deep py-20">
      <div className="shell">
        <Reveal>
          <p className="eyebrow text-wheat-400">Партнери та підтримка</p>
        </Reveal>
      </div>

      <div className="relative mt-9 flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_9%,#000_91%,transparent)]">
        {/* біжучий рядок: зупиняється під курсором/фокусом і вимикається при «Зменшити рух» (WCAG 2.2.2) */}
        <div className="marquee flex shrink-0 items-center gap-16 pr-16">
          {row.map((p, i) => (
            <span
              key={i}
              aria-hidden={i >= partners.length || undefined}
              className="whitespace-nowrap font-display text-[1.3rem] font-medium tracking-tight text-sky-100/70 transition-colors hover:text-wheat-400 md:text-[1.7rem]"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
