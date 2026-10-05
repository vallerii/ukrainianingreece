"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FORM_TEXT, type FormKind } from "@/lib/forms";
import ApplicationForm from "./ApplicationForm";

export const OPEN_FORM = "udg:open-form";
export const openForm = (kind: FormKind) => window.dispatchEvent(new CustomEvent(OPEN_FORM, { detail: kind }));

/** Попап із формою «Стати волонтером» / «Долучити організацію». Монтується один раз у layout. */
export default function FormDialog() {
  const [kind, setKind] = useState<FormKind | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = (e: Event) => setKind((e as CustomEvent<FormKind>).detail);
    window.addEventListener(OPEN_FORM, onOpen);
    // прямі посилання: /#volunteer, /#organization
    const h = window.location.hash.slice(1);
    if (h === "volunteer" || h === "organization") setKind(h);
    return () => window.removeEventListener(OPEN_FORM, onOpen);
  }, []);

  useEffect(() => {
    if (!kind) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setKind(null);
    window.addEventListener("keydown", onKey);
    setTimeout(() => box.current?.querySelector<HTMLElement>("input")?.focus(), 80);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [kind]);

  const t = kind ? FORM_TEXT[kind] : null;

  return (
    <AnimatePresence>
      {kind && t && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button aria-label="Закрити" onClick={() => setKind(null)} className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]" />
          <motion.div
            ref={box}
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-paper p-7 shadow-2xl sm:p-10"
          >
            <button
              onClick={() => setKind(null)}
              aria-label="Закрити"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-mute transition-colors hover:bg-paper-dim hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
            <p className="eyebrow text-sky-700">{t.eyebrow}</p>
            <h2 id="form-title" className="display mt-3 pr-10 text-[clamp(1.8rem,4vw,2.6rem)] text-ink">
              {t.title}
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">{t.lead}</p>
            <div className="mt-8">
              <ApplicationForm key={kind} kind={kind} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
