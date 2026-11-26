"use client";

import Link from "@/components/i18n/Link";
import { useId, useState } from "react";
import { site } from "@/lib/site";
import { useLocale, useT } from "@/components/i18n/I18nProvider";

type State = "idle" | "sending" | "done" | "error";


/** Підписка на розсилку в підвалі сайту → /api/subscribe → Brevo (double opt-in). */
export default function NewsletterForm() {
  const t = useT();
  const locale = useLocale();
  const n = t.newsletter;
  const ERRORS: Record<string, string> = {
    email: n.errEmail,
    consent: n.errConsent,
    rate_limited: n.errRate,
    not_configured: `${n.errConfig} ${site.email}`,
  };
  const id = useId();
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          consent: data.get("consent") === "on",
          website_hp: data.get("website_hp"),
          locale,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (json.ok) {
        setState("done");
        form.reset();
      } else {
        setState("error");
        setError(ERRORS[json.error ?? ""] ?? n.errGeneric);
      }
    } catch {
      setState("error");
      setError(n.errNetwork);
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="mt-5 text-[0.92rem] leading-relaxed text-paper">
        {n.done}
      </p>
    );
  }

  return (
    <form className="mt-5" onSubmit={onSubmit}>
      <div className="flex items-center gap-3 border-b border-white/25 pb-2 focus-within:border-wheat-400">
        <label htmlFor={`${id}-email`} className="sr-only">
          {n.email}
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="e-mail"
          className="w-full bg-transparent text-[0.92rem] text-paper outline-none placeholder:text-white/45"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          aria-label={n.submit}
          className="flex h-9 w-9 shrink-0 items-center justify-center text-lg text-wheat-400 transition-transform hover:translate-x-1 disabled:opacity-50"
        >
          {state === "sending" ? "…" : "→"}
        </button>
      </div>

      {/* пастка для ботів: людина цього поля не бачить */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label>
          {n.honeypot}
          <input name="website_hp" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[0.8rem] leading-snug text-sky-100/70">
        <input name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-wheat-400" />
        <span>
          {n.consent1}{" "}
          <Link href="/polityka" className="underline underline-offset-2 hover:text-paper">
            {n.consentLink}
          </Link>
          {n.consent2}
        </span>
      </label>

      <p aria-live="polite" className="mt-3 min-h-[1.2em] text-[0.8rem] text-wheat-400">
        {state === "error" ? error : ""}
      </p>
    </form>
  );
}
