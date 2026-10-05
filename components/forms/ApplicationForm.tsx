"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/lib/site";
import { FORM_TEXT, VOLUNTEER_SKILLS, VOLUNTEER_TIME, type FormKind } from "@/lib/forms";
import { Area, Chips, ConsentAndHoneypot, Field, Select } from "./fields";

type State = "idle" | "sending" | "done" | "error";

const ERRORS: Record<string, string> = {
  validation: "Перевірте, будь ласка, обов’язкові поля та e-mail.",
  consent: "Потрібна згода на обробку даних.",
  rate_limited: "Забагато спроб. Спробуйте за кілька хвилин.",
  not_configured: "Форма ще не підключена до бази. Напишіть нам на пошту — відповімо.",
};

export default function ApplicationForm({ kind }: { kind: FormKind }) {
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
      setError(ERRORS[json.error] ?? `Не вдалося надіслати. Спробуйте ще раз або напишіть на ${site.email}.`);
      setState("error");
    } catch {
      setError(`Немає з’єднання. Спробуйте ще раз або напишіть на ${site.email}.`);
      setState("error");
    }
  }

  if (state === "done")
    return (
      <div role="status" className="border-l-2 border-wheat-400 bg-wheat-50 px-6 py-6">
        <p className="font-display text-lg text-ink">Заявку надіслано</p>
        <p className="mt-2 leading-relaxed text-ink-soft">{FORM_TEXT[kind].done}</p>
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="relative space-y-6" noValidate={false}>
      {kind === "volunteer" ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Ім’я" name="name" required autoComplete="name" />
            <Field label="Місто" name="city" required list="udg-cities" />
            <Field label="E-mail" name="email" type="email" required autoComplete="email" />
            <Field label="Телефон / Viber / Telegram" name="phone" type="tel" autoComplete="tel" />
          </div>
          <datalist id="udg-cities">
            {site.cities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <Chips label="Чим можете допомогти" name="skills" options={VOLUNTEER_SKILLS} />
          <Select label="Скільки часу готові приділяти" name="availability" options={VOLUNTEER_TIME} />
          <Area label="Кілька слів про себе (необов’язково)" name="message" />
        </>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Назва організації" name="name" required />
            <Field label="Місто" name="city" required />
            <Field label="Рік заснування" name="founded_year" inputMode="numeric" maxLength={4} />
            <Field label="Сайт або сторінка в соцмережах" name="website" type="url" placeholder="https://" />
          </div>
          <Area label="Коротко про організацію: чим займаєтесь, для кого" name="summary" required rows={4} />
          <p className="pt-2 text-sm font-medium text-ink">Контактна особа</p>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Ім’я та прізвище" name="contact_name" required autoComplete="name" />
            <Field label="E-mail" name="contact_email" type="email" required autoComplete="email" />
            <Field label="Телефон" name="contact_phone" type="tel" autoComplete="tel" />
          </div>
          <Area label="Чому хочете долучитися? (необов’язково)" name="message" />
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
        {state === "sending" ? "Надсилаємо…" : "Надіслати заявку"}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </button>
    </form>
  );
}
