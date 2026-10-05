"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import DonatePanel from "./DonatePanel";

/** Подія, якою будь-яка кнопка «Донат» відкриває попап. */
export const OPEN_DONATE = "udg:open-donate";
export const openDonate = () => window.dispatchEvent(new Event(OPEN_DONATE));

/** Попап донату. Монтується один раз у layout. */
export default function DonateDialog({ reportsHref = null }: { reportsHref?: string | null }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_DONATE, onOpen);
    // відкрити одразу за посиланням виду /#donate
    if (window.location.hash === "#donate") setOpen(true);
    return () => window.removeEventListener(OPEN_DONATE, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    setTimeout(() => box.current?.querySelector<HTMLElement>("button, a")?.focus(), 50);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            aria-label="Закрити"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]"
          />
          <motion.div
            ref={box}
            role="dialog"
            aria-modal="true"
            aria-labelledby="donate-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto bg-paper p-7 shadow-2xl sm:p-10"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Закрити"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-mute transition-colors hover:bg-paper-dim hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
            <p className="eyebrow text-sky-700">Підтримати</p>
            <h2 id="donate-title" className="display mt-3 pr-10 text-[clamp(1.8rem,4vw,2.6rem)] text-ink">
              Разом ми можемо більше
            </h2>
            <div className="mt-7">
              <DonatePanel onNavigate={() => setOpen(false)} reportsHref={reportsHref} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
