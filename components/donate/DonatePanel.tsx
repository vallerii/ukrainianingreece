"use client";

import { useState } from "react";
import Link from "next/link";
import { donate } from "@/lib/donate";

/** Вміст донату: «Разово / Щомісяця» → Stripe, банківський переказ, посилання на звіти. */
export default function DonatePanel({
  onNavigate,
  reportsHref,
}: {
  onNavigate?: () => void;
  /** null — фінансових звітів ще немає, посилання не показуємо */
  reportsHref?: string | null;
}) {
  const [mode, setMode] = useState<"once" | "monthly">("once");
  const [copied, setCopied] = useState(false);
  const bank = donate.bank;

  return (
    <div>
      {/* перемикач */}
      <div role="tablist" aria-label="Тип внеску" className="inline-flex rounded-full bg-paper-dim p-1">
        {(
          [
            ["once", "Разово"],
            ["monthly", "Щомісяця"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={mode === key}
            onClick={() => setMode(key)}
            className={`rounded-full px-5 py-2 text-sm transition-colors ${
              mode === key ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "once" ? (
        <div className="mt-7">
          <p className="leading-relaxed text-ink-soft">
            Будь-яка сума допомагає: суботнім школам, інформаційному центру, культурним подіям і людям,
            які щойно приїхали. Суму ви вводите на наступному кроці.
          </p>
          <PayButton href={donate.oneTime} onNavigate={onNavigate}>
            Підтримати разово
          </PayButton>
        </div>
      ) : (
        <div className="mt-7">
          <p className="leading-relaxed text-ink-soft">
            Регулярний внесок дає змогу планувати роботу наперед. Скасувати можна будь-коли за посиланням
            у листі від Stripe.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {donate.monthly.map((m) =>
              m.url ? (
                <a
                  key={m.amount}
                  href={m.url}
                  onClick={onNavigate}
                  className="group flex flex-col items-center justify-center border border-line py-5 transition-colors hover:border-sky-700 hover:bg-sky-deep hover:text-paper"
                >
                  <span className="display text-[1.9rem] leading-none">
                    {m.amount}
                    <span className="text-lg"> {donate.currency}</span>
                  </span>
                  <span className="mt-1 text-xs text-mute group-hover:text-sky-100">на місяць</span>
                </a>
              ) : (
                <span
                  key={m.amount}
                  className="flex cursor-not-allowed flex-col items-center justify-center border border-dashed border-line py-5 text-mute"
                >
                  <span className="display text-[1.9rem] leading-none">
                    {m.amount}
                    <span className="text-lg"> {donate.currency}</span>
                  </span>
                  <span className="mt-1 text-xs">на місяць</span>
                </span>
              ),
            )}
          </div>
          {donate.monthly.every((m) => !m.url) && <NotReady />}
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-mute">
        <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        Оплата на захищеній сторінці Stripe: картка, Apple Pay, Google Pay. Дані картки ми не бачимо.
      </p>

      {/* банківський переказ */}
      {bank.iban && (
        <div className="mt-8 border-t border-line pt-6">
          <p className="eyebrow text-mute">Банківський переказ</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-sm">
            {bank.recipient && (
              <>
                <dt className="text-mute">Отримувач</dt>
                <dd className="text-ink">{bank.recipient}</dd>
              </>
            )}
            <dt className="text-mute">IBAN</dt>
            <dd className="flex flex-wrap items-center gap-3 font-medium tabular-nums text-ink">
              {bank.iban}
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(bank.iban.replace(/\s/g, ""));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                className="text-xs font-normal text-sky-700 underline underline-offset-2"
              >
                {copied ? "Скопійовано" : "Копіювати"}
              </button>
            </dd>
            {bank.bic && (
              <>
                <dt className="text-mute">BIC</dt>
                <dd className="text-ink">{bank.bic}</dd>
              </>
            )}
            {bank.bank && (
              <>
                <dt className="text-mute">Банк</dt>
                <dd className="text-ink">{bank.bank}</dd>
              </>
            )}
            <dt className="text-mute">Призначення</dt>
            <dd className="text-ink">{bank.purpose}</dd>
          </dl>
        </div>
      )}

      {reportsHref && (
        <div className="mt-8 border-t border-line pt-5">
          <Link href={reportsHref} onClick={onNavigate} className="link-underline text-sm font-semibold text-ink">
            Звіти про використання коштів →
          </Link>
        </div>
      )}
    </div>
  );
}

function PayButton({ href, children, onNavigate }: { href: string; children: React.ReactNode; onNavigate?: () => void }) {
  if (!href)
    return (
      <>
        <span className="mt-6 inline-flex cursor-not-allowed items-center gap-3 rounded-full bg-wheat-400/50 px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-ink/50">
          {children} →
        </span>
        <NotReady />
      </>
    );
  return (
    <a
      href={href}
      onClick={onNavigate}
      className="group mt-6 inline-flex items-center gap-3 rounded-full bg-wheat-400 px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-sky-deep hover:text-paper"
    >
      {children}
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </a>
  );
}

function NotReady() {
  return <p className="mt-3 text-xs text-wheat-700">Оплату ще не підключено: потрібні посилання Stripe (lib/donate.ts).</p>;
}
