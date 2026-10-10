"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type GalleryItem = { src: string; width: number; height: number; alt: string };

/**
 * Фотогалерея: плитка (колонки, фото у власних пропорціях) + перегляд на весь екран.
 * У перегляді: стрілки ← →, свайп на телефоні, Esc — закрити.
 */
export default function Gallery({
  images,
  title = "Фото",
  initial = 9,
}: {
  images: GalleryItem[];
  title?: string;
  /** Скільки фото показати до кнопки «Показати всі» */
  initial?: number;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [all, setAll] = useState(images.length <= initial + 2);
  const shown = all ? images : images.slice(0, initial);

  if (!images.length) return null;

  return (
    <>
      <ul className="columns-2 gap-3 md:columns-3 md:gap-4" aria-label={title}>
        {shown.map((img, i) => (
          <li key={img.src} className="mb-3 break-inside-avoid md:mb-4">
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group relative block w-full overflow-hidden bg-paper-dim"
              aria-label={`Відкрити фото ${i + 1} з ${images.length}${img.alt ? `: ${img.alt}` : ""}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(min-width: 768px) 30vw, 48vw"
                className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      {!all && (
        <button
          type="button"
          onClick={() => setAll(true)}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-bold text-ink transition-colors hover:border-ink"
        >
          Показати всі {images.length} фото
        </button>
      )}

      {open !== null && <Lightbox images={images} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}

function Lightbox({
  images,
  index,
  onIndex,
  onClose,
}: {
  images: GalleryItem[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const n = images.length;
  const go = useCallback((d: number) => onIndex((index + d + n) % n), [index, n, onIndex]);
  const img = images[index];

  // фокус у діалог, блок прокрутки сторінки, повернення фокусу після закриття
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      prev?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Фото ${index + 1} з ${n}`}
      className="fixed inset-0 z-[200] flex flex-col bg-[#05090f] text-paper"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-sm md:px-6">
        <span aria-live="polite" className="tabular-nums text-sky-100/80">
          {index + 1} / {n}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full text-2xl transition-colors hover:bg-white/10"
          aria-label="Закрити"
        >
          ×
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-20" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <Image
          key={img.src}
          src={img.src}
          alt={img.alt}
          width={img.width}
          height={img.height}
          sizes="100vw"
          priority
          className="max-h-full w-auto max-w-full object-contain"
        />

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl transition-colors hover:bg-white/20 md:flex"
              aria-label="Попереднє фото"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl transition-colors hover:bg-white/20 md:flex"
              aria-label="Наступне фото"
            >
              →
            </button>
          </>
        )}
      </div>

      <div className="flex min-h-[4rem] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <p className="text-sm leading-snug text-sky-100/80">{img.alt}</p>
        {n > 1 && (
          <div className="flex shrink-0 gap-2 md:hidden">
            <button type="button" onClick={() => go(-1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl" aria-label="Попереднє фото">
              ←
            </button>
            <button type="button" onClick={() => go(1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl" aria-label="Наступне фото">
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
