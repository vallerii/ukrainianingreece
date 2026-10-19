import { partners } from "@/lib/site";
import Reveal from "@/components/ui/Reveal";

export default function Partners() {
  const row = [...partners, ...partners];

  return (
    <section className="relative overflow-hidden border-t border-line bg-paper py-10">
      <div className="shell">
        <Reveal>
          <p className="eyebrow text-sky-700">Партнери та підтримка</p>
        </Reveal>
      </div>

      <div className="relative mt-5 flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_9%,#000_91%,transparent)]">
        {/* біжучий рядок: зупиняється під курсором/фокусом і вимикається при «Зменшити рух» (WCAG 2.2.2) */}
        <div className="marquee flex shrink-0 items-center gap-16 pr-16">
          {row.map((p, i) => (
            <span
              key={i}
              aria-hidden={i >= partners.length || undefined}
              className="whitespace-nowrap font-display text-[1.15rem] font-medium text-mute transition-colors hover:text-sky-700 md:text-[1.4rem]"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
