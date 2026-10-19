"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CmsEvent } from "@/lib/cms";
import { dateParts, formatRange, formatTimeSpan } from "@/lib/format";
import Reveal from "@/components/ui/Reveal";

/**
 * Календар подій на головній — вертикальні картки з афішею (4 в ряд, до 8 штук).
 * На картці чітко видно дату, час і назву; натискання відкриває повний анонс у вікні.
 */
export default function EventCards({ events }: { events: CmsEvent[] }) {
  const [open, setOpen] = useState<CmsEvent | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 pt-8 md:gap-x-6 lg:grid-cols-4">
        {events.map((e, idx) => (
          <Reveal key={e.id} delay={(idx % 4) * 0.05}>
            <EventCard event={e} onOpen={() => setOpen(e)} />
          </Reveal>
        ))}
      </div>
      <EventDialog event={open} onClose={() => setOpen(null)} />
    </>
  );
}

function EventCard({ event, onOpen }: { event: CmsEvent; onOpen: () => void }) {
  const d = dateParts(event.start);
  const past = event.status === "past";
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group block w-full text-left"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-paper-dim ring-1 ring-line">
        {event.image ? (
          <Image
            src={event.image.url}
            alt={event.image.alt ?? ""}
            fill
            sizes="(min-width: 1024px) 22vw, 45vw"
            className={`object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] ${
              past ? "grayscale-[60%]" : ""
            }`}
          />
        ) : (
          // афіші ще немає — спокійна фірмова заглушка з гербом
          <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(160deg,#EAF2FB,#D6E8FA)]">
            <Image src="/logo-mark.png" alt="" width={140} height={140} className="w-[30%] opacity-25 grayscale" />
          </div>
        )}

        {event.status === "ongoing" && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1.5 bg-wheat-400 px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ink">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            Триває
          </span>
        )}
        {past && (
          <span className="absolute right-2 top-2 bg-ink/75 px-2 py-1 text-[0.7rem] uppercase tracking-[0.08em] text-paper">
            Відбулося
          </span>
        )}
      </div>

      <p className="mt-3 flex flex-wrap items-baseline gap-x-2 text-[0.95rem] font-semibold text-sky-700">
        <span className="text-ink">
          {Number(d.day)} {d.month}
        </span>
        <span>·</span>
        <span>{formatTimeSpan(event.start, event.finish)}</span>
      </p>
      <h3 className="mt-1 font-display text-[1.08rem] font-medium leading-snug text-ink transition-colors group-hover:text-sky-700 md:text-[1.15rem]">
        {event.title}
      </h3>
      <span className="mt-2 inline-flex items-center gap-1.5 text-sm text-mute transition-colors group-hover:text-ink">
        Повний анонс
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </span>
    </button>
  );
}

function EventDialog({ event, onClose }: { event: CmsEvent | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!event) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus();
    };
  }, [event, onClose]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm md:items-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-dialog-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative grid max-h-[92svh] w-full max-w-4xl overflow-y-auto bg-paper md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Закрити"
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-paper/90 text-xl text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-paper"
            >
              ×
            </button>

            {event.image ? (
              <div className="relative bg-paper-dim md:min-h-full">
                <Image
                  src={event.image.url}
                  alt={event.image.alt ?? ""}
                  width={event.image.width}
                  height={event.image.height}
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="h-auto w-full md:sticky md:top-0"
                />
              </div>
            ) : (
              <div
                className="hidden md:block"
                style={{ background: "linear-gradient(160deg,#EAF2FB,#D6E8FA)" }}
              />
            )}

            <div className="p-6 md:p-8">
              <p className="eyebrow text-sky-700">{event.tags.map((t) => t.title).join(" · ") || "Подія"}</p>
              <h2 id="event-dialog-title" className="display mt-3 pr-10 text-[clamp(1.5rem,2.6vw,2rem)] text-ink">
                {event.title}
              </h2>
              <p className="mt-3 text-[1.05rem] font-medium text-ink">{formatRange(event.start, event.finish)}</p>
              {event.description && (
                <p className="mt-4 leading-relaxed text-ink-soft">{event.description}</p>
              )}
              {event.html && (
                <div
                  className="rich mt-5 !text-[1rem]"
                  dangerouslySetInnerHTML={{ __html: event.html }}
                />
              )}
              <Link
                href={`/podiyi/${event.slug}`}
                className="link-underline mt-6 inline-block text-sm font-semibold text-ink"
              >
                Сторінка події та додавання в календар →
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
