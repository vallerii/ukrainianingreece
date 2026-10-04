import Link from "next/link";
import type { CmsEvent } from "@/lib/cms";
import { dateParts, formatTimeSpan } from "@/lib/format";

/**
 * Рядок події з великою датою. Заливка при наведенні виходить за межі контенту
 * (-inset-x-5 / md:-inset-x-8 / xl:-inset-x-10) — як на головній.
 */
export default function EventRow({
  event,
  showYear = true,
  compact = false,
}: {
  event: CmsEvent;
  showYear?: boolean;
  compact?: boolean;
}) {
  const d = dateParts(event.start);
  const past = event.status === "past";
  const tags = event.tags.map((t) => t.title).join(" · ");

  return (
    <Link href={`/podiyi/${event.slug}`} className="group relative block border-b border-line">
      <span className="absolute -inset-x-5 inset-y-0 z-0 origin-bottom scale-y-0 bg-sky-deep transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100 md:-inset-x-8 xl:-inset-x-10" />
      <div
        className={`relative z-10 grid items-center gap-4 md:grid-cols-[8.5rem_1fr_auto] md:gap-10 ${
          compact ? "py-6 md:py-7" : "py-8 md:py-10"
        }`}
      >
        <div className="flex items-baseline gap-3 md:block">
          <p
            className={`display leading-none transition-colors duration-500 group-hover:text-wheat-400 ${
              past ? "text-mute" : "text-ink"
            } ${compact ? "text-[2.2rem] md:text-[2.6rem]" : "text-[2.6rem] md:text-[3.4rem]"}`}
          >
            {d.day}
          </p>
          <p className="mt-1 text-sm text-mute transition-colors duration-500 group-hover:text-white/70">
            {d.month}
            {showYear && ` ${d.year}`}
          </p>
        </div>

        <div>
          <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-sky-700 transition-colors duration-500 group-hover:text-wheat-400">
            {event.status === "ongoing" && (
              <span className="inline-flex items-center gap-1.5 text-wheat-700 group-hover:text-wheat-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                Триває зараз
              </span>
            )}
            {tags && <span>{tags}</span>}
          </p>
          <h3
            className={`mt-2 max-w-2xl font-display font-semibold leading-snug tracking-tight text-ink transition-colors duration-500 group-hover:text-paper ${
              compact ? "text-[1.05rem] md:text-[1.25rem]" : "text-[1.15rem] md:text-[1.5rem]"
            }`}
          >
            {event.title}
          </h3>
          {!compact && event.description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mute transition-colors duration-500 group-hover:text-sky-100">
              {event.description}
            </p>
          )}
          <p className="mt-2 text-sm text-mute transition-colors duration-500 group-hover:text-sky-100">
            {formatTimeSpan(event.start, event.finish)}
          </p>
        </div>

        <span className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-ink transition-colors duration-500 group-hover:text-wheat-400">
          {past ? (event.hasReport ? "Звіт" : "Деталі") : "Деталі"}
          <span className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
