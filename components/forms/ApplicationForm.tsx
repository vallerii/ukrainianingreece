"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/lib/site";
import { type FormKind } from "@/lib/forms";
import { useT } from "@/components/i18n/I18nProvider";
import { fill } from "@/lib/i18n/fill";
import { Area, Chips, ConsentAndHoneypot, Field, Select } from "./fields";

type State = "idle" | "sending" | "done" | "error";


export default function ApplicationForm({ kind }: { kind: FormKind }) {
  const t = useT();
  const f = t.forms;
  const ERRORS: Record<string, string> = {
    validation: f.errValidation,
    consent: f.errConsent,
    rate_limited: f.errRate,
    not_configured: f.errConfig,
  };
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = { kind, consent: fd.get("consent") === "on" };
    for (const [k, v] of fd.entries()) if (k !== "consent" && k !== "skills") data[k] = v;
    data.skills = fd.getAll("skills");

    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) return setState("done");
      setError(ERRORS[json.error] ?? fill(f.errGeneric, { email: site.email }));
      setState("error");
    } catch {
      setError(fill(f.errNetwork, { email: site.email }));
      setState("error");
    }
  }

  if (state === "done")
    return (
      <div role="status" className="border-l-2 border-wheat-400 bg-wheat-50 px-6 py-6">
        <p className="font-display text-lg text-ink">{f.sent}</p>
        <p className="mt-2 leading-relaxed text-ink-soft">{f.kinds[kind].done}</p>
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="relative space-y-6" noValidate={false}>
      {kind === "volunteer" ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={f.name} name="name" required autoComplete="name" />
            <Field label={f.city} name="city" required list="udg-cities" />
            <Field label="E-mail" name="email" type="email" required autoComplete="email" />
            <Field label={f.phoneMessengers} name="phone" type="tel" autoComplete="tel" />
          </div>
          <datalist id="udg-cities">
            {t.site.cities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <Chips label={f.skills} name="skills" options={f.skillOptions} />
          <Select label={f.time} name="availability" options={f.timeOptions} />
          <Area label={f.aboutYou} name="message" />
        </>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={f.orgName} name="name" required />
            <Field label={f.city} name="city" required />
            <Field label={f.founded} name="founded_year" inputMode="numeric" maxLength={4} />
            <Field label={f.website} name="website" type="url" placeholder="https://" />
          </div>
          <Area label={f.orgSummary} name="summary" required rows={4} />
          <p className="pt-2 text-sm font-medium text-ink">{f.contact}</p>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={f.fullName} name="contact_name" required autoComplete="name" />
            <Field label="E-mail" name="contact_email" type="email" required autoComplete="email" />
            <Field label={f.phone} name="contact_phone" type="tel" autoComplete="tel" />
          </div>
          <Area label={f.why} name="message" />
        </>
      )}

      <ConsentAndHoneypot />

      {state === "error" && (
        <p role="alert" className="text-sm text-[#B42318]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="group inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:bg-sky-700 disabled:opacity-60"
      >
        {state === "sending" ? f.sending : f.submit}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </button>
    </form>
  );
}
