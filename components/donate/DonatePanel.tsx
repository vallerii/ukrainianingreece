"use client";

import { useT } from "@/components/i18n/I18nProvider";
import { useState } from "react";
import Link from "@/components/i18n/Link";
import { donate } from "@/lib/donate";

/** Вміст донату: «Разово / Щомісяця» → готові суми або своя сума (Stripe Payment Links), банківський переказ, звіти. */
export default function DonatePanel({
  onNavigate,
  reportsHref,
}: {
  onNavigate?: () => void;
  /** null — фінансових звітів ще немає, посилання не показуємо */
  reportsHref?: string | null;
}) {
  const t = useT();
  const [mode, setMode] = useState<"once" | "monthly">("once");
  const [copied, setCopied] = useState(false);
  const bank = donate.bank;

  return (
    <div>
      {/* перемикач */}
      <div role="tablist" aria-label={t.donate.type} className="inline-flex rounded-full bg-paper-dim p-1">
        {(
          [
            ["once", t.donate.once],
            ["monthly", t.donate.monthly],
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
            {t.donate.onceLead}
          </p>
          <PayButton href={donate.oneTime} onNavigate={onNavigate}>
            {t.donate.onceBtn}
          </PayButton>
          <p className="mt-3 text-xs text-mute">{t.donate.onceHint}</p>
        </div>
      ) : (
        <div className="mt-7">
          <p className="leading-relaxed text-ink-soft">
            {t.donate.monthlyLead}
            {donate.manageUrl ? t.donate.monthlyManage : t.donate.monthlyLetter}.
          </p>
          <AmountGrid
            items={donate.monthly}
            suffix={t.donate.perMonth}
            customUrl={donate.monthlyCustom}
            customHint={t.donate.customHint}
            onNavigate={onNavigate}
          />
          {!donate.monthlyCustom && donate.monthly.every((m) => !m.url) && <NotReady />}
          {donate.manageUrl && (
            <a
              href={donate.manageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline mt-5 inline-block text-sm text-sky-700"
            >
              {t.donate.manage}
            </a>
          )}
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-mute">
        <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        {t.donate.secure}
      </p>

      {/* банківський переказ */}
      {bank.iban && (
        <div className="mt-8 border-t border-line pt-6">
          <p className="eyebrow text-mute">{t.donate.bank}</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-sm">
            {bank.recipient && (
              <>
                <dt className="text-mute">{t.donate.recipient}</dt>
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
                {copied ? t.donate.copied : t.donate.copy}
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
                <dt className="text-mute">{t.donate.bankName}</dt>
                <dd className="text-ink">{bank.bank}</dd>
              </>
            )}
            <dt className="text-mute">{t.donate.purposeLabel}</dt>
            <dd className="text-ink">{bank.purpose || t.donate.purpose}</dd>
          </dl>
        </div>
      )}

      {reportsHref && (
        <div className="mt-8 border-t border-line pt-5">
          <Link href={reportsHref} onClick={onNavigate} className="link-underline text-sm font-semibold text-ink">
            {t.donate.reports}
          </Link>
        </div>
      )}
    </div>
  );
}

function AmountGrid({
  items,
  suffix,
  customUrl,
  customHint,
  onNavigate,
}: {
  items: { amount: number; url: string }[];
  suffix?: string;
  customUrl: string;
  customHint: string;
  onNavigate?: () => void;
}) {
  const t = useT();
  const tile = "flex flex-col items-center justify-center border py-5 transition-colors";
  const active = `${tile} group border-line hover:border-sky-700 hover:bg-sky-deep hover:text-paper`;
  const off = `${tile} cursor-not-allowed border-dashed border-line text-mute`;
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((m) => {
        const body = (
          <>
            <span className="display text-[1.9rem] leading-none">
              {m.amount}
              <span className="text-lg"> {donate.currency}</span>
            </span>
            {suffix && <span className="mt-1 text-xs text-mute group-hover:text-sky-100">{suffix}</span>}
          </>
        );
        return m.url ? (
          <a key={m.amount} href={m.url} onClick={onNavigate} className={active}>
            {body}
          </a>
        ) : (
          <span key={m.amount} aria-disabled="true" className={off}>
            {body}
          </span>
        );
      })}
      {customUrl ? (
        <a
          href={customUrl}
          onClick={onNavigate}
          className={`${tile} group col-span-2 border-wheat-400 bg-wheat-400 px-3 text-center text-ink hover:border-sky-deep hover:bg-sky-deep hover:text-paper sm:col-span-1`}
        >
          <span className="text-base font-semibold leading-tight">{t.donate.custom}</span>
          <span className="mt-1 text-[11px] leading-tight text-ink/60 group-hover:text-sky-100">{customHint}</span>
        </a>
      ) : (
        <span aria-disabled="true" className={`${off} col-span-2 sm:col-span-1`}>
          <span className="text-base font-semibold">{t.donate.custom}</span>
        </span>
      )}
    </div>
  );
}

function PayButton({ href, children, onNavigate }: { href: string; children: React.ReactNode; onNavigate?: () => void }) {
  if (!href)
    return (
      <>
        <span aria-disabled="true" className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-full bg-wheat-400/50 px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-ink/50">
          {children} →
        </span>
        <NotReady />
      </>
    );
  return (
    <a
      href={href}
      onClick={onNavigate}
      className="group mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-wheat-400 px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-sky-deep hover:text-paper"
    >
      {children}
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </a>
  );
}

function NotReady() {
  return <p className="mt-3 text-xs text-wheat-700">{useT().donate.notReady}</p>;
}
